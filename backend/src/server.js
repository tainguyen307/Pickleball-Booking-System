import "dotenv/config";

import express from "express";
import cors from "cors";

import { connectDB } from "./config/db.js"; //
import authRoutes from "./routes/auth.routes.js";
import courtRoutes from "./routes/court.routes.js";
import bookingRoutes from "./routes/booking.routes.js";
import userRoutes from "./routes/user.routes.js";

const app = express();

app.use(cors());
app.use(express.json());

// 1. Kết nối DB (Bắt buộc dùng await để đảm bảo DB sẵn sàng trước khi mở cổng)
await connectDB(); //

// 2. Cấu hình các tuyến đường API
app.use("/api/auth", authRoutes);
app.use("/api/courts", courtRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/users", userRoutes);

// 3. ĐÂY LÀ DÒNG QUAN TRỌNG: Giúp server treo liên tục để lắng nghe request từ Postman
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server đang chạy liên tục tại cổng: http://localhost:${PORT}`);
});