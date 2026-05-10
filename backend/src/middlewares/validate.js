const { body, validationResult } = require('express-validator');

const validate = (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({
            errors: errors.array()
        });
    }

    next();
};

const validateRegister = [
    body('fullName')
        .notEmpty()
        .withMessage('Họ tên không được để trống')
        .isLength({ min: 3 })
        .withMessage('Họ tên tối thiểu 3 ký tự'),
    body('email')
        .isEmail()
        .withMessage('Email không hợp lệ'),

    body('password')
        .isLength({ min: 6 })
        .withMessage('Mật khẩu tối thiểu 6 ký tự'),
    validate
];

const validateLogin = [
    body('email').isEmail().withMessage('Email không hợp lệ'),
    body('password').notEmpty().withMessage('Mật khẩu không được để trống'),
    validate
];

const validateForgotPassword = [
    body('email').isEmail().withMessage('Email không hợp lệ'),
    validate
];

const validateResetPassword = [
    body('email').isEmail().withMessage('Email không hợp lệ'),
    body('otp')
        .isLength({ min: 6, max: 6 })
        .withMessage('OTP phải gồm 6 ký tự số')
        .isNumeric()
        .withMessage('OTP phải là số'),
    body('newPassword')
        .isLength({ min: 8 })
        .withMessage('Mật khẩu mới tối thiểu 8 ký tự')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).+$/)
        .withMessage('Mật khẩu mới phải gồm chữ thường, chữ hoa, số và ký tự đặc biệt'),
    validate
];

const validateEditProfile = [
    body('fullName')
        .notEmpty()
        .withMessage('Họ tên không được để trống')
        .isLength({ min: 3 })
        .withMessage('Họ tên tối thiểu 3 ký tự'),
    validate
];

module.exports = {
    validateLogin,
    validateRegister,
    validateForgotPassword,
    validateResetPassword,
    validateEditProfile
};
