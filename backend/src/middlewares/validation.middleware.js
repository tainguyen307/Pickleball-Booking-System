import { body, validationResult } from "express-validator";

/**
 * 1. Mảng định nghĩa quy tắc kiểm tra (Validation Rules) dành riêng cho cổng Đăng nhập
 */
export const loginValidator = [
    body("email")
        .notEmpty().withMessage("Email không được để trống!")
        .isEmail().withMessage("Email không đúng định dạng tài khoản hợp lệ!")
        .normalizeEmail(), // Tự động làm sạch định dạng email (chuẩn hóa chữ thường, xóa khoảng trắng)

    body("password")
        .notEmpty().withMessage("Mật khẩu nhập vào không được để trống!")
        .isLength({ min: 6 }).withMessage("Mật khẩu bắt buộc phải có độ dài từ 6 ký tự trở lên!")
];

/**
 * 2. Middleware trung gian tiến hành quét và trích xuất kết quả kiểm tra lỗi dữ liệu
 */
export const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);

    // Nếu mảng chứa danh sách lỗi kiểm tra không rỗng
    if (!errors.isEmpty()) {
        // Trích xuất thông báo lỗi đầu tiên xuất hiện để trả về giao diện hiển thị cho người dùng
        const firstErrorMessage = errors.array()[0].msg;

        return res.status(400).json({
            success: false,
            message: firstErrorMessage,
            errors: errors.array() // Trả thêm mảng full chi tiết lỗi nếu Frontend cần map vào từng ô Input
        });
    }

    // Nếu dữ liệu đầu vào sạch và hoàn toàn hợp lệ, cho phép đi tiếp vào controller
    next();
};