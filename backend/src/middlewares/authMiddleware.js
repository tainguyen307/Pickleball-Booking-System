const { verifyToken } = require('../utils/jwtUtils');

const authorize = (role) => {
    return (req, res, next) => {
        try {
            // 1. Lấy token từ header Authorization: Bearer <token>
            const authHeader = req.headers.authorization;
            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                return res.status(401).json({ message: 'Bạn cần đăng nhập để thực hiện thao tác này' });
            }

            const token = authHeader.split(' ')[1];

            // 2. Sử dụng hàm verify từ utils
            const decoded = verifyToken(token);

            // 3. Kiểm tra quyền (Authorization)
            // Nếu có yêu cầu role cụ thể và user không khớp role đó
            if (role && decoded.role !== role) {
                return res.status(403).json({ message: 'Bạn không có quyền truy cập khu vực này' });
            }

            // 4. Lưu thông tin đã giải mã vào request để các hàm sau sử dụng
            req.user = decoded;
            
            next(); // Cho phép đi tiếp vào Controller
        } catch (error) {
            // Nếu token hết hạn hoặc không hợp lệ, hàm verifyToken sẽ quăng lỗi
            return res.status(401).json({ message: 'Phiên làm việc hết hạn, vui lòng đăng nhập lại' });
        }
    };
};

module.exports = { authorize };