// src/services/booking.service.js (MÔI TRƯỜNG BACKEND)
import bookingRepository from "../repositories/booking.repository.js";
import courtRepository from "../repositories/court.repository.js";
import equipmentRepository from "../repositories/equipment.repository.js"; // 🎯 Import kho vật tư
import BookingEquipment from "../models/bookingEquipment.model.js"; // Bảng trung gian lưu vết thuê
import CourtSlot from "../models/courtSlot.model.js";
import Equipment from "../models/equipment.model.js";
import mongoose from "mongoose";
import couponService from "./coupon.service.js";
import pointsService from "./points.service.js";
import revenueService from "./revenue.service.js";
import notificationService from "./notification.service.js";

class BookingService {
    /**
     * API hỗ trợ Frontend lấy danh sách vật tư hiển thị lên khu vực tích chọn
     */
    async getAllAvailableEquipments() {
        return await equipmentRepository.findAvailableEquipments();
    }

    /**
     * Động cơ đặt sân gốc + Thuê vật tư đi kèm (Atomic Lock + Tồn kho an toàn)
     */
    async createNewBooking(userId, payload) {
        const { slotId, equipments = [], paymentMethod = "CASH", note = "", couponCode = "", pointsToUse = 0 } = payload;

        if (!slotId) throw new Error("Vui lòng chọn chính xác một ô giờ trống trên sơ đồ!");

        // 🎯 ATOMIC LOCK: Khóa sân chống trùng lịch
        const objectIdSlot = new mongoose.Types.ObjectId(slotId);
        const slot = await CourtSlot.findOneAndUpdate(
            { _id: objectIdSlot, isBooked: false },
            { $set: { isBooked: true } },
            { new: true }
        );

        if (!slot) {
            throw new Error("Khung giờ này vừa mới có người nhanh tay đặt lịch mất rồi! Vui lòng chọn ô giờ khác.");
        }

        const bookingCode = `BK-${Date.now().toString().slice(-8).toUpperCase()}`;
        const rollbackEquipmentList = []; // Mảng lưu vết để hoàn tác tồn kho nếu sập nguồn giữa chừng

        try {
            // 1. Tính toán chi phí tiền sân cơ sở
            const court = await courtRepository.findById(slot.courtId);
            if (!court) throw new Error("Cụm sân thể thao lớn không tồn tại trên hệ thống!");

            const courtPrice = court.pricePerHour;
            const durationHours = court.slotDuration / 60 || 1;
            const baseCourtTotalPrice = courtPrice * durationHours;

            // 2. ⚡ LUỒNG XỬ LÝ THUÊ VẬT TƯ ĐI KÈM
            let equipmentTotalPrice = 0;
            const equipmentRecordsToInsert = [];

            for (const item of equipments) {
                const eq = await equipmentRepository.findById(item.equipmentId);
                if (!eq || eq.status !== "AVAILABLE") {
                    throw new Error(`Thiết bị vật tư hiện không sẵn sàng cho thuê!`);
                }

                // Kiểm tra xem trong kho còn đủ số lượng khách yêu cầu không
                if (eq.availableQuantity < item.quantity) {
                    throw new Error(`Số lượng "${eq.name}" trong kho không đủ! (Hiện còn: ${eq.availableQuantity})`);
                }

                // Thuật toán tính tiền: Theo giờ (HOUR) thì nhân durationHours, theo lượt (TURN) thì giữ nguyên
                const itemSubtotal = eq.rentalType === "HOUR"
                    ? eq.rentalPrice * item.quantity * durationHours
                    : eq.rentalPrice * item.quantity;

                equipmentTotalPrice += itemSubtotal;

                // Lưu cấu trúc chuẩn bị ném vào bảng BookingEquipment
                equipmentRecordsToInsert.push({
                    equipmentId: eq._id,
                    quantity: item.quantity,
                    rentalPrice: eq.rentalPrice,
                    subtotal: itemSubtotal,
                    returnStatus: "RENTING"
                });

                // Trừ số lượng khả dụng trong kho và lưu vết để phòng hờ rollback
                eq.availableQuantity -= item.quantity;
                await eq.save();
                rollbackEquipmentList.push({ instance: eq, qty: item.quantity });
            }

            // 3. Cộng dồn tài chính toàn diện hóa đơn (Tiền sân + Tiền thiết bị + 5% Phí dịch vụ)
            const systemFee = Math.round((baseCourtTotalPrice + equipmentTotalPrice) * 0.05);
            const subtotalBeforeDiscount = baseCourtTotalPrice + equipmentTotalPrice + systemFee;

            let coupon = null;
            let couponDiscount = 0;
            if (couponCode) {
                const validatedCoupon = await couponService.validateCoupon(userId, {
                    code: couponCode,
                    orderValue: subtotalBeforeDiscount,
                    courtId: slot.courtId
                });
                coupon = validatedCoupon.coupon;
                couponDiscount = validatedCoupon.discountAmount;
            }

            const maxPointDiscount = Math.max(0, subtotalBeforeDiscount - couponDiscount);
            const requestedPoints = parseInt(pointsToUse, 10) || 0;
            const maxPointsByOrder = Math.floor(maxPointDiscount / (parseInt(process.env.POINT_TO_VND || "1000", 10)));
            const finalPointsToUse = Math.min(requestedPoints, maxPointsByOrder);
            let pointDiscount = 0;
            if (finalPointsToUse > 0) {
                const { wallet, pointToVnd } = await pointsService.getWallet(userId);
                if (wallet.balance < finalPointsToUse) {
                    throw new Error(`Ví điểm chỉ còn ${wallet.balance} điểm, không đủ để sử dụng!`);
                }
                pointDiscount = finalPointsToUse * pointToVnd;
            }

            const discount = couponDiscount + pointDiscount;
            const totalPrice = Math.max(0, subtotalBeforeDiscount - discount);

            // 4. Gọi tầng Repository tạo đơn Booking chính thức
            const booking = await bookingRepository.create({
                bookingCode,
                userId,
                courtId: slot.courtId,
                bookingDate: slot.date,
                startTime: slot.startTime,
                endTime: slot.endTime,
                durationHours,
                courtPrice: baseCourtTotalPrice,
                equipmentPrice: equipmentTotalPrice,
                systemFee,
                couponId: coupon?._id || null,
                couponCode: coupon?.code || null,
                pointDiscount,
                pointsUsed: finalPointsToUse,
                discount,
                totalPrice,
                paymentStatus: "UNPAID",
                paymentMethod,
                status: "PENDING",
                note
            });

            if (coupon) {
                await couponService.applyUsage({
                    coupon,
                    userId,
                    bookingId: booking._id,
                    discountAmount: couponDiscount
                });
            }

            if (finalPointsToUse > 0) {
                await pointsService.spend(userId, finalPointsToUse, {
                    referenceId: booking._id,
                    referenceType: "Booking",
                    description: `Sử dụng điểm cho đơn ${booking.bookingCode}`
                });
            }

            // 5. Đổ mảng vật tư vào bảng trung gian BookingEquipment (Nếu khách có chọn thuê)
            if (equipmentRecordsToInsert.length > 0) {
                const finalEquipmentRecords = equipmentRecordsToInsert.map(record => ({
                    ...record,
                    bookingId: booking._id
                }));
                await BookingEquipment.insertMany(finalEquipmentRecords);
            }

            // Găm ngược ID Booking vào ô giờ
            slot.bookingId = booking._id;
            await slot.save();

            await notificationService.createForAdmins({
                title: "Có đơn đặt sân mới",
                message: `Đơn ${bookingCode} vừa được tạo với tổng tiền ${totalPrice.toLocaleString("vi-VN")}đ.`,
                type: "BOOKING",
                referenceId: booking._id,
                referenceType: "Booking",
                sendMail: true
            });

            return {
                message: "Khởi tạo đơn đặt sân và thuê vật tư thành công rực rỡ!",
                bookingCode,
                bookingId: booking._id,
                totalPrice,
                courtPrice: baseCourtTotalPrice,
                equipmentPrice: equipmentTotalPrice,
                discount,
                couponDiscount,
                pointDiscount,
                pointsUsed: finalPointsToUse
            };

        } catch (error) {
            // 🛡️ LUỒNG HOÀN TÁC TOÀN DIỆN (ROLLBACK MECHANISM)
            // 1. Nhả lại slot giờ sang trống tránh treo sân
            await CourtSlot.findByIdAndUpdate(slotId, { $set: { isBooked: false, bookingId: null } });

            // 2. Hoàn trả lại số lượng thiết bị vào kho nếu đã lỡ trừ trước khi sập DB
            for (const rollback of rollbackEquipmentList) {
                rollback.instance.availableQuantity += rollback.qty;
                await rollback.instance.save();
            }
            throw error;
        }
    }
    async getUserBookingHistory(userId) {
        if (!userId) throw new Error("Mã định danh người dùng không hợp lệ!");

        const bookings = await bookingRepository.findByUserId(userId);
        return bookings;
    }
    async cancelBookingByUser(userId, bookingId, cancelReason) {
        if (!bookingId) throw new Error("Thiếu mã đơn hàng đặt sân!");

        // 1. Tìm đơn hàng
        const booking = await bookingRepository.findById(bookingId);
        if (!booking) throw new Error("Đơn đặt sân không tồn tại trên hệ thống!");

        // Bảo mật chéo: Tránh hacker bốc bừa ID đơn của người khác để hủy phá hoại
        if (booking.userId.toString() !== userId.toString()) {
            throw new Error("Bạn không có quyền sở hữu đơn hàng này!");
        }

        // Kiểm tra xem đơn đã bị hủy từ trước hoặc đã hoàn thành chưa
        if (["CANCELLED", "COMPLETED"].includes(booking.status)) {
            throw new Error(`Đơn đặt sân này hiện đã ở trạng thái "${booking.status}", không thể hủy nữa!`);
        }

        // 2. 🕒 THUẬT TOÁN KIỂM TRA CHẶN 36 TIẾNG CHUẨN THỜI GIAN THỰC
        // Kết hợp bookingDate (YYYY-MM-DD) và startTime (HH:mm) để ra mốc thời gian đá thực tế
        const matchDateTimeString = `${booking.bookingDate}T${booking.startTime}:00`;
        const matchTime = new Date(matchDateTimeString); // Mốc ra sân
        const now = new Date(); // Thời điểm hiện tại bấm nút hủy

        // Tính khoảng cách thời gian theo đơn vị Mili-giây
        const timeDiffInMs = matchTime.getTime() - now.getTime();
        // Quy đổi ra số Tiếng
        const hoursDiff = timeDiffInMs / (1000 * 60 * 60);

        console.log(`🔍 [DEBUG CANCEL] Khoảng cách thời gian từ bây giờ tới giờ chơi: ${hoursDiff.toFixed(1)} tiếng.`);

        // 💥 CHỐT CHẶN PHÒNG THỦ: Nếu nhỏ hơn 36 tiếng, đá văng ra báo lỗi lập tức!
        if (hoursDiff < 36) {
            throw new Error("Vi phạm chính sách: Bạn chỉ được quyền hủy đặt lịch trước giờ thi đấu tối thiểu 36 tiếng!");
        }

        // 3. 🛡️ TIẾN HÀNH HOÀN TÁC HỆ THỐNG (BẮT ĐẦU ROLLBACK DATA)
        // Bước A: Tìm và nhả xích ô giờ chơi quay về Trống (isBooked = false)
        await CourtSlot.findOneAndUpdate(
            { courtId: booking.courtId, date: booking.bookingDate, startTime: booking.startTime },
            { $set: { isBooked: false, bookingId: null } }
        );

        // Bước B: Hoàn trả lại số lượng tồn kho vật tư (Nếu đơn này có thuê đồ kèm)
        if (booking.equipmentPrice > 0) {
            const rentedItems = await BookingEquipment.find({ bookingId: booking._id });

            for (const item of rentedItems) {
                await Equipment.findByIdAndUpdate(item.equipmentId, {
                    $inc: { availableQuantity: item.quantity } // Trả lại đúng số lượng vào kho khả dụng
                });

                // Cập nhật trạng thái đồ thuê sang RETURNED hoặc hủy
                item.returnStatus = "RETURNED";
                await item.save();
            }
        }

        // Bước C: Cập nhật trạng thái đơn Booking sang HỦY
        booking.status = "CANCELLED";
        booking.cancelReason = cancelReason || "Khách hàng chủ động yêu cầu hủy lịch trên hệ thống.";
        await booking.save();

        if (booking.pointsUsed > 0) {
            await pointsService.refund(booking.userId, booking.pointsUsed, {
                referenceId: booking._id,
                referenceType: "Booking",
                description: "Hoàn điểm do khách hủy booking"
            });
        }

        await revenueService.refundBookingRevenue(booking);

        return {
            message: "Hủy đơn đặt lịch giữ chỗ và hoàn trả thiết bị thành công mỹ mãn!",
            bookingCode: booking.bookingCode,
            status: booking.status
        };
    }
    /**
     * 🎯 THÊM MỚI: Khởi tạo thông tin thanh toán (Sinh mã QR hiển thị ở Frontend)
     */
    async createPaymentIntent(userId, bookingId) {
        const booking = await bookingRepository.findById(bookingId);
        if (!booking) throw new Error("Đơn đặt sân không tồn tại!");

        if (booking.userId.toString() !== userId.toString()) {
            throw new Error("Bạn không có quyền thanh toán cho đơn hàng này!");
        }

        if (booking.paymentStatus === "PAID") {
            throw new Error("Đơn hàng này đã được thanh toán từ trước rồi!");
        }

        if (booking.status === "CANCELLED") {
            throw new Error("Đơn hàng này đã bị hủy, không thể tiến hành thanh toán!");
        }

        // Cấu hình nội dung chuyển khoản tự động
        const paymentDescription = `CHUYEN TIEN SAN ${booking.bookingCode}`;

        // 💡 GIẢ LẬP LINK HOẶC MÃ QR: Tụi mình dùng API VietQR công khai cực đỉnh để sinh QR ngân hàng thật luôn!
        // Định dạng: https://img.vietqr.io/image/<BANK_ID>-<ACCOUNT_NO>-<TEMPLATE>.png?amount=<AMOUNT>&addInfo=<DESCRIPTION>
        const mockQrCodeUrl = `https://img.vietqr.io/image/MB-0900000002-qr_only.png?amount=${booking.totalPrice}&addInfo=${encodeURIComponent(paymentDescription)}`;

        return {
            bookingCode: booking.bookingCode,
            totalPrice: booking.totalPrice,
            paymentDescription,
            qrCodeUrl: mockQrCodeUrl
        };
    }

    /**
     * 🎯 THÊM MỚI: Giả lập Webhook/Callback xử lý khi tiền về túi thành công
     */
    async verifyAndExecutePayment(userId, bookingId, paymentMethod = "MOMO") {
        const booking = await bookingRepository.findById(bookingId);
        if (!booking) throw new Error("Đơn đặt sân không tồn tại!");

        if (booking.userId.toString() !== userId.toString()) {
            throw new Error("Bạn không có quyền xác nhận thanh toán cho đơn này!");
        }

        if (booking.paymentStatus === "PAID") {
            return {message: "Đơn hàng đã được ghi nhận thanh toán từ trước!", booking};
        }

        // Thực thi cập nhật trạng thái trong Database qua Repository
        const updatedBooking = await bookingRepository.updateStatusAfterPayment(bookingId, paymentMethod);
        await courtRepository.incrementStats(booking.courtId, { bookingCount: 1 });

        await revenueService.holdBookingRevenue(updatedBooking);

        await notificationService.createForUser({
            userId: booking.userId,
            title: "Thanh toán thành công",
            message: `Hệ thống đã nhận đủ ${booking.totalPrice.toLocaleString()}đ cho mã đơn ${booking.bookingCode}. Sân chơi của bạn đã được khóa giữ chỗ an toàn!`,
            type: "PAYMENT",
            referenceId: booking._id,
            referenceType: "Booking",
            sendMail: true
        });

        await notificationService.createForAdmins({
            title: "Booking đã thanh toán",
            message: `Đơn ${booking.bookingCode} đã thanh toán ${booking.totalPrice.toLocaleString()}đ.`,
            type: "PAYMENT",
            referenceId: booking._id,
            referenceType: "Booking"
        });

        return {
            message: "Xác nhận thanh toán thành công! Đơn hàng đã được kích hoạt hoạt động.",
            booking: updatedBooking
        };
    }
}

export default new BookingService();
