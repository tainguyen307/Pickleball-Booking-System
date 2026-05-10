const express = require('express');
const router = express.Router();
const {
    loginController,
    registerController,
    verifyOTPController,
    forgotPasswordController,
    resetPasswordController,
    editProfileController
} = require('../controllers/authController');
const {
    loginLimiter,
    registerLimiter,
    forgotPasswordLimiter,
    resetPasswordLimiter,
    editProfileLimiter
} = require('../middlewares/rateLimiter');
const {
    validateLogin,
    validateRegister,
    validateForgotPassword,
    validateResetPassword,
    validateEditProfile
} = require('../middlewares/validate');
const { authorize } = require('../middlewares/authMiddleware');

// Public route: Register
router.post('/register', registerLimiter, validateRegister, registerController);


// Public route: Verify OTP
router.post('/verify-otp', verifyOTPController);

// Public route: Login
router.post('/login', loginLimiter, validateLogin, loginController);

// Public route: Forgot Password
router.post('/forgot-password', forgotPasswordLimiter, validateForgotPassword, forgotPasswordController);

// Public route: Reset Password
router.post('/reset-password', resetPasswordLimiter, validateResetPassword, resetPasswordController);

// Protected routes: Profile
router.get('/user/profile', authorize('user'), (req, res) => {
    res.json({ message: "Welcome to User Profile", user: req.user });
});

router.get('/admin/profile', authorize('admin'), (req, res) => {
    res.json({ message: "Welcome to Admin Dashboard", admin: req.user });
});

router.put('/user/profile', editProfileLimiter, authorize('user'), validateEditProfile, editProfileController);

module.exports = router;
