const User = require('../models/user');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const { generateToken } = require('../utils/jwtUtils');
const userRepository = require('../repositories/userRepository');

const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

const createError = (message, statusCode) => {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
};

const sendOTP = async (email, otp, subject, title) => {

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject,
        html: `
            <h2>${title}</h2>
            <h1>${otp}</h1>
            <p>OTP sẽ hết hạn sau 5 phút</p>
        `
    });
};

const register = async ({
    fullName,
    email,
    password
}) => {

    const existingUser =
        await userRepository.findByEmail(email);

    if (existingUser) {
        throw new Error('Email already exists');
    }

    const otp = generateOTP();

    const otpExpire =
        Date.now() + 5 * 60 * 1000;

    await userRepository.createUser({
        fullName,
        email,
        password,
        otp,
        otpExpire
    });

    await sendOTP(email, otp, 'OTP Xác thực tài khoản', 'OTP Code');

    return {
        message:
            'Register successful. Please verify OTP.'
    };
};


const verifyOTP = async (
    email,
    otp
) => {

    const user =
        await userRepository.findByEmail(email);

    if (!user) {
        throw createError('User not found', 404);
    }

    if (user.otp !== otp) {
        throw createError('Invalid OTP', 400);
    }

    if (user.otpExpire < Date.now()) {
        throw createError('OTP expired', 400);
    }

    await userRepository.updateUser(email, {
        isVerified: true,
        otp: null,
        otpExpire: null
    });

    return {
        message: 'Verify successful'
    };
};

const forgotPassword = async (email) => {
    const user = await userRepository.findByEmail(email);

    if (!user) {
        throw createError('Không tìm thấy user', 404);
    }

    const otp = generateOTP();
    const otpExpire = new Date(Date.now() + 5 * 60 * 1000);

    await userRepository.updateUser(email, {
        forgotPasswordOtp: otp,
        forgotPasswordOtpExpire: otpExpire
    });

    await sendOTP(email, otp, 'OTP đặt lại mật khẩu', 'Mã OTP đặt lại mật khẩu');

    return {
        message: 'OTP đã được gửi về email'
    };
};

const resetPassword = async (email, otp, newPassword) => {
    const user = await userRepository.findByEmail(email);

    if (!user) {
        throw createError('Không tìm thấy user', 404);
    }

    if (!user.forgotPasswordOtp || user.forgotPasswordOtp !== otp) {
        throw createError('OTP không hợp lệ', 400);
    }

    if (!user.forgotPasswordOtpExpire || user.forgotPasswordOtpExpire < Date.now()) {
        throw createError('OTP đã hết hạn', 400);
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await userRepository.updateUser(email, {
        password: hashedPassword,
        forgotPasswordOtp: null,
        forgotPasswordOtpExpire: null
    });

    return {
        message: 'Đổi mật khẩu thành công'
    };
};

const login = async (email, password) => {
    const user = await User.findOne({ email }).lean();
    if (!user) throw createError('Email hoặc mật khẩu không chính xác', 401);

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw createError('Email hoặc mật khẩu không chính xác', 401);

    // Sử dụng hàm từ utils cực kỳ gọn
    const token = generateToken({ 
        id: user._id, 
        role: user.role 
    });

    const redirectUrl = user.role === 'admin' ? '/admin/profile' : '/user/profile';

    return {
        token,
        role: user.role,
        redirectUrl
    };
};

const editProfile = async (userId, data) => {

    const user = await User.findById(userId);

    if (!user) {
        throw createError('User not found', 404);
    }

    const updatedUser = await User.findByIdAndUpdate(
        userId,
        {
            fullName: data.fullName
        },
        { new: true }
    ).select('-password');

    return {
        message: 'Cập nhật profile thành công',
        user: updatedUser
    };
};

module.exports = { login, register, verifyOTP, forgotPassword, resetPassword, editProfile };
