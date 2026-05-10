const authService = require('../services/authService');

const handleError = (res, error, fallbackCode = 400) => {
    return res.status(error.statusCode || fallbackCode).json({
        status: 'error',
        message: error.message
    });
};

const registerController = async (req, res) => {

    try {

        const result =
            await authService.register(req.body);

        return res.status(201).json({
            status: 'success',
            data: result
        });

    } catch (error) {
        return handleError(res, error, 400);
    }
};


const verifyOTPController = async (
    req,
    res
) => {

    try {

        const {
            email,
            otp
        } = req.body;

        const result =
            await authService.verifyOTP(
                email,
                otp
            );

        return res.status(200).json({
            status: 'success',
            data: result
        });

    } catch (error) {
        return handleError(res, error, 400);
    }
};

const loginController = async (req, res) => {
    try {
        const { email, password } = req.body;
        const result = await authService.login(email, password);
        
        return res.status(200).json({
            status: 'success',
            data: result
        });
    } catch (error) {
        return handleError(res, error, 401);
    }
};

const forgotPasswordController = async (req, res) => {
    try {
        const { email } = req.body;
        const result = await authService.forgotPassword(email);

        return res.status(200).json({
            status: 'success',
            data: result
        });
    } catch (error) {
        return handleError(res, error, 400);
    }
};

const resetPasswordController = async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;
        const result = await authService.resetPassword(email, otp, newPassword);

        return res.status(200).json({
            status: 'success',
            data: result
        });
    } catch (error) {
        return handleError(res, error, 400);
    }
};

const editProfileController = async (req, res) => {
    try {
        const userId = req.user.id;

        const result = await authService.editProfile(userId, req.body);

        return res.status(200).json({
            status: 'success',
            data: result
        });

    } catch (error) {
        return handleError(res, error, 400);
    }
};

module.exports = {
    loginController,
    registerController,
    verifyOTPController,
    forgotPasswordController,
    resetPasswordController,
    editProfileController
};
