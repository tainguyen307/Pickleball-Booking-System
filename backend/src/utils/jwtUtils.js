const jwt = require('jsonwebtoken');

/**
 * Hàm tạo Access Token
 * @param {Object} payload - Dữ liệu muốn lưu vào token (id, role...)
 * @returns {string} - Chuỗi JWT
 */
const generateToken = (payload) => {
    // Kiểm tra xem đã có Secret Key chưa
    if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET is not defined in environment variables');
    }

    return jwt.sign(
        payload, 
        process.env.JWT_SECRET, 
        { expiresIn: '1h' }
    );
};

// Bạn có thể thêm hàm verifyToken tại đây nếu muốn dùng ở các chỗ khác
const verifyToken = (token) => {
    return jwt.verify(token, process.env.JWT_SECRET);
};

module.exports = {
    generateToken,
    verifyToken
};