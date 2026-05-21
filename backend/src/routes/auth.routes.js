// src/routes/auth.routes.js
import express from "express";
import authController from "../controllers/auth.controller.js";

// Nhập các tấm khiên bảo vệ từ tầng Middlewares đã viết
import { verifyToken } from "../middlewares/auth.middleware.js";
import { authLimiter } from "../middlewares/rateLimiter.middleware.js";
import { loginValidator, handleValidationErrors } from "../middlewares/validation.middleware.js";

const router = express.Router();

/**
 * Endpoint: POST /api/auth/login
 * Full luồng: Chặn Spam IP -> Kiểm tra định dạng đầu vào -> Xử lý kiểm tra DB & Cấp phát JWT Tokens
 */
router.post(
    "/login",
    authLimiter,
    loginValidator,
    handleValidationErrors,
    (req, res) => authController.login(req, res)
);

/**
 * Endpoint: POST /api/auth/google-login
 */
router.post(
    "/google-login",
    authLimiter,
    (req, res) => authController.googleLogin(req, res)
);

/**
 * Endpoint: POST /api/auth/logout
 * Yêu cầu: Bắt buộc phải có Access Token hợp lệ đi qua verifyToken mới cho đăng xuất phiên
 */
router.post(
    "/logout",
    verifyToken,
    (req, res) => authController.logout(req, res)
);

export default router;