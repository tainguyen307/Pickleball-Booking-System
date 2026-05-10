const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    otp: { type: String, default: null },
    otpExpire: { type: Date, default: null },
    forgotPasswordOtp: { type: String, default: null },
    forgotPasswordOtpExpire: { type: Date, default: null },
    isVerified: { type: Boolean, default: false }
});

// Trước khi lưu, hash mật khẩu
userSchema.pre('save', async function () {

    if (!this.isModified('password')) {
        return;
    }

    this.password = await bcrypt.hash(this.password, 10);
});

module.exports = mongoose.model('User', userSchema);
