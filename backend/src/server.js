import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js"; //
import authRoutes from "./routes/auth.routes.js";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

// 1. Kết nối DB (Bắt buộc dùng await để đảm bảo DB sẵn sàng trước khi mở cổng)
await connectDB(); //

// 2. Cấu hình các tuyến đường API
app.use("/api/auth", authRoutes);

// 3. ĐÂY LÀ DÒNG QUAN TRỌNG: Giúp server treo liên tục để lắng nghe request từ Postman
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server đang chạy liên tục tại cổng: http://localhost:${PORT}`);
});