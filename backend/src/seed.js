// src/seed.js (MÔI TRƯỜNG BACKEND)
import "dotenv/config";
import bcrypt from "bcryptjs";
import { connectDB } from "./config/db.js";

import User from "./models/user.model.js";
import Court from "./models/court.model.js";
import SubCourt from "./models/subCourt.model.js";
import CourtSlot from "./models/courtSlot.model.js";
import Equipment from "./models/equipment.model.js";

export const seedDatabase = async () => {
    try {
        await connectDB();
        console.log("⏳ 1. Đang dọn sạch dữ liệu cũ để làm mới toàn bộ hệ thống...");
        await User.deleteMany();
        await Court.deleteMany();
        await SubCourt.deleteMany();
        await CourtSlot.deleteMany();
        await Equipment.deleteMany();

        const hashedPassword = await bcrypt.hash("123456", 10);

        // ============================================
        // 👤 TẠO TÀI KHOẢN MẪU (USERS)
        // ============================================
        console.log("👤 2. Đang tạo tài khoản mẫu...");
        await User.create([
            { fullName: "Admin PickleballPro", email: "admin@gmail.com", password: hashedPassword, phone: "0900000001", role: "ADMIN" },
            { fullName: "Dương Minh Tâm", email: "tam@gmail.com", password: hashedPassword, phone: "0900000002", role: "USER" }
        ]);

        // ============================================
        // 🏟️ TẠO DANH SÁCH 3 CỤM SÂN LỚN (COURTS)
        // ============================================
        console.log("🏟️ 3. Đang tạo 3 cụm tổ hợp sân lớn với ảnh Cloudinary...");
        const courts = await Court.insertMany([
            {
                name: "Cụm Sân PickleballPro Thủ Đức (Trung Tâm)",
                location: "Thủ Đức",
                address: "Số 1 Võ Văn Ngân, Linh Chiểu, Thủ Đức, TP.HCM",
                type: "INDOOR",
                pricePerHour: 200000,
                openTime: "06:00",
                closeTime: "22:00",
                slotDuration: 60,
                amenities: ["Wifi miễn phí", "Bãi xe ô tô", "Phòng tắm nước nóng", "Căng tin quầy nước"],
                // 🎯 CHỈNH SỬA TẠI ĐÂY: Lưu cấu trúc Object chứa link Cloudinary thực tế của bạn
                images: [
                    {
                        imageUrl: "https://res.cloudinary.com/chubby-pickle/image/upload/v1716416000/PickleballPro_Media/court_thuduc_1.jpg",
                        publicId: "PickleballPro_Media/court_thuduc_1"
                    },
                    {
                        imageUrl: "https://res.cloudinary.com/chubby-pickle/image/upload/v1716416000/PickleballPro_Media/court_thuduc_2.jpg",
                        publicId: "PickleballPro_Media/court_thuduc_2"
                    }
                ],
                status: "AVAILABLE"
            },
            {
                name: "Sân Pickleball Ngoài Trời Đêm Sài Gòn Quận 1",
                location: "Quận 1",
                address: "Khu Hoa Lư, 2 Đinh Tiên Hoàng, Đa Kao, Quận 1, TP.HCM",
                type: "OUTDOOR",
                pricePerHour: 260000,
                openTime: "05:00",
                closeTime: "23:00",
                slotDuration: 60,
                amenities: ["Bãi xe máy", "Đèn chiếu sáng đêm", "Ghế ngồi khán giả", "Cho thuê vợt xịn"],
                images: [
                    {
                        imageUrl: "https://res.cloudinary.com/chubby-pickle/image/upload/v1716416000/PickleballPro_Media/court_q1_1.jpg",
                        publicId: "PickleballPro_Media/court_q1_1"
                    }
                ],
                status: "AVAILABLE"
            },
            {
                name: "Cụm Tổ Hợp Thể Thao Nam Sài Gòn Quận 7",
                location: "Quận 7",
                address: "Đường Hoàng Quốc Việt, Phú Mỹ, Quận 7, TP.HCM",
                type: "INDOOR",
                pricePerHour: 180000,
                openTime: "07:00",
                closeTime: "21:00",
                slotDuration: 60,
                amenities: ["Wifi miễn phí", "Bãi xe ô tô", "Tủ đồ cá nhân Locker", "Máy bán nước tự động"],
                images: [
                    {
                        imageUrl: "https://res.cloudinary.com/djasmz67j/image/upload/v1779470409/ab0aba80-1300-45b9-8351-c8ecbed6fba3.png",
                        publicId: "PickleballPro_Media/court_q1_1/ab0aba80-1300-45b9-8351-c8ecbed6fba3"
                    },
                    {
                        imageUrl: "https://res.cloudinary.com/djasmz67j/image/upload/v1779472233/e79924dd-2037-4be4-a29e-891cb8132e70.png",
                        publicId: "PickleballPro_Media/court_q1_1/e79924dd-2037-4be4-a29e-891cb8132e70"
                    },
                ],
                status: "AVAILABLE"
            }
        ]);

        const courtThuDuc = courts[0];
        const courtQ1 = courts[1];
        const courtQ7 = courts[2];

        // ============================================
        // 🧱 TẠO DANH SÁCH CÁC SÂN NHỎ (SUB-COURTS)
        // ============================================
        console.log("🧱 4. Đang phân rã đẻ ra các sân thi đấu nhỏ lồng bên trong...");

        // Sân nhỏ cụm Thủ Đức
        const subThuDuc = await SubCourt.insertMany([
            { courtId: courtThuDuc._id, name: "Sân số 01 (VIP Indoor)", status: "AVAILABLE" },
            { courtId: courtThuDuc._id, name: "Sân số 02 (Standard)", status: "AVAILABLE" },
            { courtId: courtThuDuc._id, name: "Sân số 03 (Standard)", status: "AVAILABLE" }
        ]);

        // Sân nhỏ cụm Quận 1
        const subQ1 = await SubCourt.insertMany([
            { courtId: courtQ1._id, name: "Sân ngoài trời A1", status: "AVAILABLE" },
            { courtId: courtQ1._id, name: "Sân ngoài trời A2", status: "AVAILABLE" }
        ]);

        // Sân nhỏ cụm Quận 7
        const subQ7 = await SubCourt.insertMany([
            { courtId: courtQ7._id, name: "Sân gỗ trong nhà S1", status: "AVAILABLE" },
            { courtId: courtQ7._id, name: "Sân gỗ trong nhà S2", status: "AVAILABLE" }
        ]);

        // ============================================
        // ⏰ THUẬT TOÁN TỰ ĐỘNG GENERATE MA TRẬN KHUNG GIỜ (COURT SLOTS)
        // ============================================
        console.log("⏰ 5. Đang kích hoạt thuật toán tự động sinh ô giờ trống mẫu cho 3 ngày liên tiếp...");

        // Tạo mảng danh sách chuỗi ngày: Hôm qua, Hôm nay, Ngày mai
        const datesToSeed = [];
        for (let i = 0; i < 7; i++) {
            const d = new Date();
            d.setDate(d.getDate() + i);

            // Sử dụng 'sv-SE' để ép định dạng chuẩn YYYY-MM-DD theo múi giờ local của máy tính bạn
            const localDateStr = d.toLocaleDateString("sv-SE");
            datesToSeed.push(localDateStr);
        }
        const slotsToInsert = [];

        // Hàm helper sinh slot tự động theo cấu hình đóng/mở của cụm sân
        const generateSlotsForSubCourts = (subCourtsArray, courtConfig) => {
            const startH = parseInt(courtConfig.openTime.split(":")[0]);
            const endH = parseInt(courtConfig.closeTime.split(":")[0]);

            for (const dateStr of datesToSeed) {
                for (const sub of subCourtsArray) {
                    for (let hour = startH; hour < endH; hour++) {
                        const startStr = hour < 10 ? `0${hour}:00` : `${hour}:00`;
                        const endStr = (hour + 1) < 10 ? `0${hour + 1}:00` : `${hour + 1}:00`;

                        // 🎯 GIẢ LẬP ĐẶT TRƯỚC (BOOKED MOCK):
                        // Khóa cứng ngẫu nhiên một vài ô giờ vàng (8h-9h sáng hoặc 18h-19h tối) để xem màu sắc giao diện thay đổi
                        const isMockBooked = false;

                        slotsToInsert.push({
                            subCourtId: sub._id,
                            courtId: courtConfig._id,
                            date: dateStr,
                            startTime: startStr,
                            endTime: endStr,
                            isBooked: isMockBooked
                        });
                    }
                }
            }
        };

        // Kích hoạt thuật toán tạo slot cho cả 3 cụm sân
        generateSlotsForSubCourts(subThuDuc, courtThuDuc);
        generateSlotsForSubCourts(subQ1, courtQ1);
        generateSlotsForSubCourts(subQ7, courtQ7);

        await CourtSlot.insertMany(slotsToInsert);
        console.log(`⚡ Tổng số ô giờ thật đã nạp tự động vào MongoDB: ${slotsToInsert.length} Slots.`);

        // ============================================
        // 🏓 TẠO KHO VẬT TƯ CHO THUÊ KÈM (EQUIPMENTS)
        // ============================================
        console.log("🏓 6. Đang nạp danh mục vật tư thiết bị cho thuê...");
        await Equipment.insertMany([
            {
                name: "Vợt Joola Perseus CFS 16mm (Premium)",
                type: "PADDLE",
                quantity: 15,
                availableQuantity: 15,
                rentalType: "HOUR", // Thuê tính tiền theo giờ
                rentalPrice: 50000,
                description: "Dòng vợt cao cấp Ben Johns, bề mặt carbon nhám tối ưu hóa những cú xoáy bóng xoáy chìm.",
                status: "AVAILABLE"
            },
            {
                name: "Vợt Selkirk Vanguard 2.0 (Standard)",
                type: "PADDLE",
                quantity: 20,
                availableQuantity: 20,
                rentalType: "HOUR",
                rentalPrice: 30000,
                description: "Vợt trợ lực cân bằng tốt, lõi tổ ong êm ái, cực kỳ thích hợp cho người mới gia nhập bộ môn.",
                status: "AVAILABLE"
            },
            {
                name: "Bóng Franklin X-40 Pro (Hộp 3 quả)",
                type: "BALL",
                quantity: 100,
                availableQuantity: 100,
                rentalType: "TURN", // Thuê tính tiền theo lượt/set chơi
                rentalPrice: 20000,
                description: "Bóng thi đấu ngoài trời chịu lực gió siêu tốt, quỹ đạo bay đầm đạt chứng nhận USAPA.",
                status: "AVAILABLE"
            }
        ]);

        console.log("✨ ĐỒNG BỘ TOÀN DIỆN KHO DỮ LIỆU SEED VIP THÀNH CÔNG RỰC RỠ! ✨");
        process.exit(0);
    } catch (error) {
        console.error("❌ Lỗi nghiêm trọng khi thực thi lệnh Seed Data:", error);
        process.exit(1);
    }
};

// Tự động trigger luồng khi chạy file độc lập bằng Node
seedDatabase();