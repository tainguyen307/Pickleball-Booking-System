// src/services/admin.service.js
import adminRepository from "../repositories/admin.repository.js";
import Court from "../models/court.model.js";
import SubCourt from "../models/subCourt.model.js";
import CourtSlot from "../models/courtSlot.model.js";
import Booking from "../models/booking.model.js";
import Equipment from "../models/equipment.model.js";
import BookingEquipment from "../models/bookingEquipment.model.js";

class AdminService {
    // ======================== COURTS ========================
    /**
     * Lấy danh sách tất cả sân (Admin thấy cả HIDDEN/MAINTENANCE)
     */
    async getAllCourts(queryParams) {
        const { type, location, status, search, limit = 10, page = 1 } = queryParams;

        const parsedLimit = parseInt(limit);
        const parsedPage = parseInt(page);
        const skip = (parsedPage - 1) * parsedLimit;

        const filter = {};

        if (type && ["INDOOR", "OUTDOOR"].includes(type.toUpperCase())) {
            filter.type = type.toUpperCase();
        }
        if (location) {
            filter.location = { $regex: location, $options: "i" };
        }
        if (status && ["AVAILABLE", "MAINTENANCE", "HIDDEN"].includes(status.toUpperCase())) {
            filter.status = status.toUpperCase();
        }
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: "i" } },
                { location: { $regex: search, $options: "i" } }
            ];
        }

        const { courts, total } = await adminRepository.findAllCourts(filter, skip, parsedLimit);

        return {
            courts,
            pagination: {
                totalItems: total,
                currentPage: parsedPage,
                totalPages: Math.ceil(total / parsedLimit),
                limit: parsedLimit
            }
        };
    }

    /**
     * Xem chi tiết sân
     */
    async getCourtDetail(courtId) {
        if (!courtId) throw new Error("Thiếu mã ID cụm sân!");
        const court = await adminRepository.findCourtById(courtId);
        if (!court) throw new Error("Cụm sân không tồn tại trên hệ thống!");

        // Lấy luôn danh sách sân nhỏ thuộc cụm
        const subCourts = await SubCourt.find({ courtId });
        return { court, subCourts };
    }

    /**
     * Tạo sân mới (Kèm upload hình ảnh Cloudinary)
     */
    async createCourt(courtData, files) {
        const { name, location, address, type, description, pricePerHour, openTime, closeTime, slotDuration, amenities } = courtData;

        if (!name || !location || !type || !pricePerHour) {
            throw new Error("Vui lòng điền đầy đủ thông tin bắt buộc: Tên sân, Khu vực, Loại sân, Giá!");
        }

        // Xử lý mảng hình ảnh từ Multer Cloudinary
        const images = files && files.length > 0
            ? files.map(file => ({ imageUrl: file.path, publicId: file.filename }))
            : [];

        // Xử lý amenities (tiện ích) - frontend gửi dạng chuỗi ngăn cách bởi dấu phẩy
        const parsedAmenities = amenities
            ? (typeof amenities === "string" ? amenities.split(",").map(a => a.trim()) : amenities)
            : [];

        const newCourt = await adminRepository.createCourt({
            name: name.trim(),
            location: location.trim(),
            address: address?.trim() || "",
            type: type.toUpperCase(),
            description: description?.trim() || "",
            pricePerHour: parseInt(pricePerHour),
            openTime: openTime || "06:00",
            closeTime: closeTime || "22:00",
            slotDuration: parseInt(slotDuration) || 60,
            amenities: parsedAmenities,
            images,
            status: "AVAILABLE"
        });

        return {
            message: "Tạo cụm sân mới thành công!",
            court: newCourt
        };
    }

    /**
     * Cập nhật thông tin sân
     */
    async updateCourt(courtId, courtData, files) {
        const court = await adminRepository.findCourtById(courtId);
        if (!court) throw new Error("Cụm sân không tồn tại!");

        const updateData = {};

        if (courtData.name) updateData.name = courtData.name.trim();
        if (courtData.location) updateData.location = courtData.location.trim();
        if (courtData.address !== undefined) updateData.address = courtData.address.trim();
        if (courtData.type) updateData.type = courtData.type.toUpperCase();
        if (courtData.description !== undefined) updateData.description = courtData.description.trim();
        if (courtData.pricePerHour) updateData.pricePerHour = parseInt(courtData.pricePerHour);
        if (courtData.openTime) updateData.openTime = courtData.openTime;
        if (courtData.closeTime) updateData.closeTime = courtData.closeTime;
        if (courtData.slotDuration) updateData.slotDuration = parseInt(courtData.slotDuration);
        if (courtData.status) updateData.status = courtData.status.toUpperCase();

        if (courtData.amenities) {
            updateData.amenities = typeof courtData.amenities === "string"
                ? courtData.amenities.split(",").map(a => a.trim())
                : courtData.amenities;
        }

        // Nếu có upload ảnh mới, nối thêm vào mảng images hiện tại
        if (files && files.length > 0) {
            const newImages = files.map(file => ({ imageUrl: file.path, publicId: file.filename }));
            updateData.images = [...court.images, ...newImages];
        }

        const updatedCourt = await adminRepository.updateCourt(courtId, updateData);

        return {
            message: "Cập nhật thông tin cụm sân thành công!",
            court: updatedCourt
        };
    }

    /**
     * Soft delete sân (Chuyển status sang HIDDEN)
     */
    async deleteCourt(courtId) {
        const court = await adminRepository.findCourtById(courtId);
        if (!court) throw new Error("Cụm sân không tồn tại!");

        const deletedCourt = await adminRepository.softDeleteCourt(courtId);
        return {
            message: "Đã ẩn cụm sân khỏi hệ thống thành công!",
            court: deletedCourt
        };
    }

    /**
     * Block sân bảo trì (Chuyển status sang MAINTENANCE)
     */
    async blockCourt(courtId) {
        const court = await adminRepository.findCourtById(courtId);
        if (!court) throw new Error("Cụm sân không tồn tại!");

        const newStatus = court.status === "MAINTENANCE" ? "AVAILABLE" : "MAINTENANCE";
        const updatedCourt = await adminRepository.updateCourt(courtId, { status: newStatus });

        return {
            message: newStatus === "MAINTENANCE"
                ? "Đã chuyển sân sang trạng thái bảo trì!"
                : "Đã mở lại sân hoạt động bình thường!",
            court: updatedCourt
        };
    }

    // ======================== BOOKINGS ========================
    /**
     * Lấy danh sách tất cả booking (Admin view)
     */
    async getAllBookings(queryParams) {
        const { status, courtId, startDate, endDate, search, limit = 10, page = 1 } = queryParams;

        const parsedLimit = parseInt(limit);
        const parsedPage = parseInt(page);
        const skip = (parsedPage - 1) * parsedLimit;

        const filter = {};

        if (status && ["PENDING", "CONFIRMED", "CANCELLED", "COMPLETED"].includes(status.toUpperCase())) {
            filter.status = status.toUpperCase();
        }
        if (courtId) {
            filter.courtId = courtId;
        }
        if (startDate || endDate) {
            filter.bookingDate = {};
            if (startDate) filter.bookingDate.$gte = startDate;
            if (endDate) filter.bookingDate.$lte = endDate;
        }

        const { bookings, total } = await adminRepository.findAllBookings(filter, skip, parsedLimit);

        return {
            bookings,
            pagination: {
                totalItems: total,
                currentPage: parsedPage,
                totalPages: Math.ceil(total / parsedLimit),
                limit: parsedLimit
            }
        };
    }

    /**
     * Admin xác nhận booking (PENDING → CONFIRMED)
     */
    async confirmBooking(bookingId) {
        const booking = await adminRepository.findBookingById(bookingId);
        if (!booking) throw new Error("Đơn đặt sân không tồn tại!");

        if (booking.status !== "PENDING") {
            throw new Error(`Chỉ có thể xác nhận đơn ở trạng thái PENDING! Hiện tại: ${booking.status}`);
        }

        booking.status = "CONFIRMED";
        await booking.save();

        return {
            message: "Xác nhận đơn đặt sân thành công!",
            booking
        };
    }

    /**
     * Admin hủy booking + Rollback slot + Rollback thiết bị
     */
    async cancelBooking(bookingId, cancelReason) {
        const booking = await adminRepository.findBookingById(bookingId);
        if (!booking) throw new Error("Đơn đặt sân không tồn tại!");

        if (["CANCELLED", "COMPLETED"].includes(booking.status)) {
            throw new Error(`Đơn này đã ở trạng thái "${booking.status}", không thể hủy!`);
        }

        // 1. Nhả slot giờ
        await CourtSlot.findOneAndUpdate(
            { courtId: booking.courtId, date: booking.bookingDate, startTime: booking.startTime },
            { $set: { isBooked: false, bookingId: null } }
        );

        // 2. Hoàn trả thiết bị nếu có
        if (booking.equipmentPrice > 0) {
            const rentedItems = await BookingEquipment.find({ bookingId: booking._id });
            for (const item of rentedItems) {
                await Equipment.findByIdAndUpdate(item.equipmentId, {
                    $inc: { availableQuantity: item.quantity }
                });
                item.returnStatus = "RETURNED";
                await item.save();
            }
        }

        // 3. Cập nhật trạng thái booking
        booking.status = "CANCELLED";
        booking.cancelReason = cancelReason || "Admin hủy đơn đặt sân.";
        await booking.save();

        return {
            message: "Admin đã hủy đơn đặt sân thành công!",
            booking
        };
    }

    // ======================== EQUIPMENT ========================
    /**
     * Lấy danh sách tất cả thiết bị (Admin thấy cả DAMAGED, LOST)
     */
    async getAllEquipments(queryParams) {
        const { type, status, search, limit = 10, page = 1 } = queryParams;

        const parsedLimit = parseInt(limit);
        const parsedPage = parseInt(page);
        const skip = (parsedPage - 1) * parsedLimit;

        const filter = {};

        if (type && ["PADDLE", "BALL", "ACCESSORY"].includes(type.toUpperCase())) {
            filter.type = type.toUpperCase();
        }
        if (status && ["AVAILABLE", "IN_USE", "DAMAGED", "LOST"].includes(status.toUpperCase())) {
            filter.status = status.toUpperCase();
        }
        if (search) {
            filter.name = { $regex: search, $options: "i" };
        }

        const { equipments, total } = await adminRepository.findAllEquipments(filter, skip, parsedLimit);

        return {
            equipments,
            pagination: {
                totalItems: total,
                currentPage: parsedPage,
                totalPages: Math.ceil(total / parsedLimit),
                limit: parsedLimit
            }
        };
    }

    /**
     * Tạo thiết bị mới (Nhập kho)
     */
    async createEquipment(data) {
        const { name, type, description, quantity, rentalType, rentalPrice, image } = data;

        if (!name || !type || !quantity || !rentalType || !rentalPrice) {
            throw new Error("Vui lòng điền đầy đủ thông tin thiết bị!");
        }

        const newEquipment = await adminRepository.createEquipment({
            name: name.trim(),
            type: type.toUpperCase(),
            description: description?.trim() || "",
            quantity: parseInt(quantity),
            availableQuantity: parseInt(quantity),
            rentalType: rentalType.toUpperCase(),
            rentalPrice: parseInt(rentalPrice),
            image: image || "",
            status: "AVAILABLE"
        });

        return {
            message: "Nhập kho thiết bị mới thành công!",
            equipment: newEquipment
        };
    }

    /**
     * Cập nhật thông tin thiết bị
     */
    async updateEquipment(equipmentId, data) {
        const equipment = await adminRepository.findEquipmentById(equipmentId);
        if (!equipment) throw new Error("Thiết bị không tồn tại!");

        const updateData = {};
        if (data.name) updateData.name = data.name.trim();
        if (data.type) updateData.type = data.type.toUpperCase();
        if (data.description !== undefined) updateData.description = data.description.trim();
        if (data.rentalType) updateData.rentalType = data.rentalType.toUpperCase();
        if (data.rentalPrice) updateData.rentalPrice = parseInt(data.rentalPrice);
        if (data.image !== undefined) updateData.image = data.image;
        if (data.status) updateData.status = data.status.toUpperCase();

        const updatedEquipment = await adminRepository.updateEquipment(equipmentId, updateData);

        return {
            message: "Cập nhật thông tin thiết bị thành công!",
            equipment: updatedEquipment
        };
    }

    /**
     * Xóa thiết bị
     */
    async deleteEquipment(equipmentId) {
        const equipment = await adminRepository.findEquipmentById(equipmentId);
        if (!equipment) throw new Error("Thiết bị không tồn tại!");

        // Kiểm tra xem thiết bị có đang được thuê không
        const activeRentals = await BookingEquipment.countDocuments({
            equipmentId,
            returnStatus: "RENTING"
        });
        if (activeRentals > 0) {
            throw new Error("Không thể xóa thiết bị đang có người thuê!");
        }

        await adminRepository.deleteEquipment(equipmentId);

        return {
            message: "Xóa thiết bị khỏi kho thành công!"
        };
    }

    /**
     * Nhập thêm số lượng vào kho (Stock In)
     */
    async stockIn(equipmentId, additionalQuantity) {
        const equipment = await adminRepository.findEquipmentById(equipmentId);
        if (!equipment) throw new Error("Thiết bị không tồn tại!");

        const qty = parseInt(additionalQuantity);
        if (!qty || qty <= 0) throw new Error("Số lượng nhập kho phải lớn hơn 0!");

        equipment.quantity += qty;
        equipment.availableQuantity += qty;
        if (equipment.status !== "AVAILABLE") equipment.status = "AVAILABLE";
        await equipment.save();

        return {
            message: `Nhập thêm ${qty} đơn vị vào kho thành công!`,
            equipment
        };
    }

    // ======================== MAINTENANCE ========================
    /**
     * Lấy danh sách yêu cầu bảo trì
     */
    async getAllMaintenance(queryParams) {
        const { targetType, status, limit = 10, page = 1 } = queryParams;

        const parsedLimit = parseInt(limit);
        const parsedPage = parseInt(page);
        const skip = (parsedPage - 1) * parsedLimit;

        const filter = {};
        if (targetType && ["COURT", "EQUIPMENT"].includes(targetType.toUpperCase())) {
            filter.targetType = targetType.toUpperCase();
        }
        if (status && ["REPORTED", "IN_PROGRESS", "COMPLETED"].includes(status.toUpperCase())) {
            filter.status = status.toUpperCase();
        }

        const { records, total } = await adminRepository.findAllMaintenance(filter, skip, parsedLimit);

        return {
            records,
            pagination: {
                totalItems: total,
                currentPage: parsedPage,
                totalPages: Math.ceil(total / parsedLimit),
                limit: parsedLimit
            }
        };
    }

    /**
     * Tạo yêu cầu bảo trì mới
     */
    async createMaintenance(adminId, data) {
        const { targetType, targetId, title, description, severity } = data;

        if (!targetType || !targetId || !title) {
            throw new Error("Vui lòng điền đầy đủ thông tin yêu cầu bảo trì!");
        }

        // Nếu bảo trì sân → tự động block sân
        if (targetType.toUpperCase() === "COURT") {
            const court = await adminRepository.findCourtById(targetId);
            if (!court) throw new Error("Cụm sân mục tiêu không tồn tại!");
            await adminRepository.updateCourt(targetId, { status: "MAINTENANCE" });
        }

        const record = await adminRepository.createMaintenance({
            targetType: targetType.toUpperCase(),
            targetId,
            title: title.trim(),
            description: description?.trim() || "",
            severity: severity?.toUpperCase() || "LOW",
            status: "REPORTED",
            maintenanceDate: new Date(),
            createdBy: adminId
        });

        return {
            message: "Tạo yêu cầu bảo trì thành công!",
            record
        };
    }

    /**
     * Cập nhật trạng thái bảo trì
     */
    async updateMaintenanceStatus(maintenanceId, newStatus) {
        const record = await adminRepository.findMaintenanceById(maintenanceId);
        if (!record) throw new Error("Yêu cầu bảo trì không tồn tại!");

        const validStatuses = ["REPORTED", "IN_PROGRESS", "COMPLETED"];
        if (!validStatuses.includes(newStatus.toUpperCase())) {
            throw new Error("Trạng thái không hợp lệ!");
        }

        const updateData = { status: newStatus.toUpperCase() };

        // Nếu hoàn thành bảo trì → tự động mở lại sân
        if (newStatus.toUpperCase() === "COMPLETED") {
            updateData.completedDate = new Date();

            if (record.targetType === "COURT") {
                await adminRepository.updateCourt(record.targetId, { status: "AVAILABLE" });
            }
        }

        const updatedRecord = await adminRepository.updateMaintenance(maintenanceId, updateData);

        return {
            message: `Cập nhật trạng thái bảo trì sang "${newStatus.toUpperCase()}" thành công!`,
            record: updatedRecord
        };
    }

    // ======================== ANALYTICS ========================
    /**
     * Tổng quan Dashboard
     */
    async getDashboardStats() {
        const [counts, revenue, occupancy, statusStats] = await Promise.all([
            adminRepository.getDashboardCounts(),
            adminRepository.getTotalRevenue(),
            adminRepository.getCourtOccupancyRate(),
            adminRepository.getBookingStatusStats()
        ]);

        return {
            ...counts,
            ...revenue,
            ...occupancy,
            bookingStatusBreakdown: statusStats
        };
    }

    /**
     * Doanh thu theo khoảng thời gian
     */
    async getRevenueStats(queryParams) {
        const { startDate, endDate } = queryParams;

        // Mặc định: 30 ngày gần nhất
        const end = endDate || new Date().toLocaleDateString("sv-SE");
        const start = startDate || (() => {
            const d = new Date();
            d.setDate(d.getDate() - 30);
            return d.toLocaleDateString("sv-SE");
        })();

        const revenueData = await adminRepository.getRevenueByDateRange(start, end);

        return {
            period: { startDate: start, endDate: end },
            data: revenueData
        };
    }

    /**
     * Thống kê thiết bị
     */
    async getEquipmentStats() {
        const stats = await adminRepository.getEquipmentRentalStats();
        return { equipmentStats: stats };
    }

    /**
     * Giờ cao điểm
     */
    async getPeakHours() {
        const stats = await adminRepository.getPeakHoursStats();
        return { peakHours: stats };
    }

    // ======================== USERS ========================
    /**
     * Danh sách user
     */
    async getAllUsers(queryParams) {
        const { role, status, search, limit = 10, page = 1 } = queryParams;

        const parsedLimit = parseInt(limit);
        const parsedPage = parseInt(page);
        const skip = (parsedPage - 1) * parsedLimit;

        const filter = {};
        if (role && ["USER", "ADMIN"].includes(role.toUpperCase())) {
            filter.role = role.toUpperCase();
        }
        if (status && ["ACTIVE", "BLOCKED"].includes(status.toUpperCase())) {
            filter.status = status.toUpperCase();
        }
        if (search) {
            filter.$or = [
                { fullName: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } }
            ];
        }

        const { users, total } = await adminRepository.findAllUsers(filter, skip, parsedLimit);

        return {
            users,
            pagination: {
                totalItems: total,
                currentPage: parsedPage,
                totalPages: Math.ceil(total / parsedLimit),
                limit: parsedLimit
            }
        };
    }

    /**
     * Xem chi tiết user kèm lịch sử booking
     */
    async getUserDetail(userId) {
        const user = await adminRepository.findUserById(userId);
        if (!user) throw new Error("Người dùng không tồn tại!");

        // Lấy lịch sử booking
        const bookings = await Booking.find({ userId })
            .populate("courtId", "name location")
            .sort({ createdAt: -1 })
            .limit(20);

        // Lấy lịch sử thuê thiết bị
        const bookingIds = bookings.map(b => b._id);
        const equipmentRentals = await BookingEquipment.find({ bookingId: { $in: bookingIds } })
            .populate("equipmentId", "name type");

        return {
            user,
            bookingHistory: bookings,
            equipmentRentals
        };
    }

    /**
     * Khóa / Mở tài khoản
     */
    async toggleUserStatus(userId) {
        const user = await adminRepository.findUserById(userId);
        if (!user) throw new Error("Người dùng không tồn tại!");

        if (user.role === "ADMIN") {
            throw new Error("Không thể khóa tài khoản Admin!");
        }

        const newStatus = user.status === "ACTIVE" ? "BLOCKED" : "ACTIVE";
        const updatedUser = await adminRepository.toggleUserStatus(userId, newStatus);

        return {
            message: newStatus === "BLOCKED"
                ? "Đã khóa tài khoản người dùng!"
                : "Đã mở khóa tài khoản người dùng!",
            user: updatedUser
        };
    }
}

export default new AdminService();
