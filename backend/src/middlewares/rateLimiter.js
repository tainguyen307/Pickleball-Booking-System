const rateLimit = require('express-rate-limit');

const registerLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: "Thử đăng ký quá nhiều lần, vui lòng đợi 15 phút"
});

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 phút
    max: 5, // Tối đa 5 lần thử login
    message: "Thử quá nhiều lần, vui lòng đợi 15 phút"
});

const forgotPasswordLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 3,
    message: "Bạn đã yêu cầu OTP quá nhiều lần, vui lòng đợi 15 phút"
});

const resetPasswordLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: "Bạn đã thử đặt lại mật khẩu quá nhiều lần, vui lòng đợi 15 phút"
});

const editProfileLimiter = rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 5,
    message: {
        message: "Bạn chỉnh profile quá nhiều lần, thử lại sau 5 phút"
    }
});

module.exports = {
    loginLimiter,
    registerLimiter,
    forgotPasswordLimiter,
    resetPasswordLimiter,
    editProfileLimiter
};
