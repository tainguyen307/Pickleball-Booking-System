// src/middlewares/auth.middleware.js
import redisClient from "../config/redis.js";
// Import file tiện ích
import jwtUtil from "../utils/jwt.util.js";

export const verifyToken = async (req, res, next) => {
    try {
        const authHeader = req.headers["authorization"];
        const token = authHeader && authHeader.split(" ")[1];

        if (!token) {
            return res.status(401).json({ success: false, message: "Không tìm thấy token xác thực!" });
        }

        const isBlacklisted = await redisClient.get(`blacklist:${token}`);
        if (isBlacklisted) {
            return res.status(401).json({ success: false, message: "Phiên đăng nhập này đã kết thúc!" });
        }

        // Sử dụng khối kiểm tra của jwtUtil gọn gàng
        try {
            const decoded = jwtUtil.verifyAccessToken(token);
            req.user = decoded;
            next();
        } catch (err) {
            return res.status(403).json({ success: false, message: "Token đã hết hạn hoặc không hợp lệ!" });
        }

    } catch (error) {
        return res.status(500).json({ success: false, message: "Lỗi hệ thống khi kiểm tra quyền truy cập!" });
    }
};