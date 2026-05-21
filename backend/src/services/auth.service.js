// src/services/auth.service.js
import userRepository from "../repositories/user.repository.js";
import bcrypt from "bcryptjs";
import redisClient from "../config/redis.js";
// Import file tiện ích vừa tách
import jwtUtil from "../utils/jwt.util.js";
import googleAuthUtil from "../utils/googleAuth.util.js";

class AuthService {
    /**
     * Logic Đăng nhập hệ thống bằng Email & Mật khẩu
     */
    async loginWithPassword({ email, password }) {
        const user = await userRepository.findByEmail(email);
        if (!user) throw new Error("Email hoặc mật khẩu không chính xác!");

        if (user.status === "BLOCKED") throw new Error("Tài khoản của bạn hiện đang bị khóa!");

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) throw new Error("Email hoặc mật khẩu không chính xác!");

        // Sử dụng JwtUtils để sinh bộ đôi token sạch sẽ
        const accessToken = jwtUtil.generateAccessToken({ id: user._id, role: user.role });
        const refreshToken = jwtUtil.generateRefreshToken({ id: user._id });

        // Lưu whitelist trên Redis
        await redisClient.set(`refresh:${user._id}`, refreshToken, "EX", 7 * 24 * 60 * 60);

        await userRepository.updateLastLogin(user);
        const redirectUrl = user.role === "ADMIN" ? "/admin/profile" : "/user/profile";

        return { accessToken, refreshToken, redirectUrl, user };
    }

    /**
     * Logic Đăng nhập bằng tài khoản Google (OAuth2)
     */
    async loginWithGoogle(idToken) {
        if (!idToken) throw new Error("Thiếu Google ID Token!");

        // 1. Xác thực và lấy thông tin User thông qua lớp tiện ích vừa tách
        const payload = await googleAuthUtil.verifyGoogleToken(idToken);
        const { email, name, picture } = payload;

        // 2. Truy tìm tài khoản trong Database
        let user = await userRepository.findByEmail(email);

        // 3. Nếu chưa tồn tại tài khoản -> Tự động tạo mới (Đăng ký tự động)
        if (!user) {
            const dummyPassword = await bcrypt.hash(Math.random().toString(36).slice(-10), 10);
            user = await userRepository.create({
                fullName: name,
                email,
                password: dummyPassword, // Thỏa mãn điều kiện Schema
                avatar: picture || null,
                role: "USER", //
                status: "ACTIVE" //
            });
        }

        // 4. Kiểm tra xem trạng thái tài khoản có bị khóa không
        if (user.status === "BLOCKED") { //
            throw new Error("Tài khoản Google này đã bị khóa khỏi hệ thống!");
        }

        // 5. Khởi tạo mã bộ đôi Token hệ thống qua JwtUtils
        const accessToken = jwtUtil.generateAccessToken({ id: user._id, role: user.role });
        const refreshToken = jwtUtil.generateRefreshToken({ id: user._id });

        // 6. Lưu phiên vào Redis Whitelist
        await redisClient.set(`refresh:${user._id}`, refreshToken, "EX", 7 * 24 * 60 * 60);

        // 7. Lưu lịch sử login và trả về kết quả
        await userRepository.updateLastLogin(user); //
        const redirectUrl = user.role === "ADMIN" ? "/admin/profile" : "/user/profile"; //

        return { accessToken, refreshToken, redirectUrl, user };
    }

    /**
     * Logic cấp lại Access Token mới từ Refresh Token
     */
    async refreshAccessToken(tokenFromClient) {
        if (!tokenFromClient) throw new Error("Thiếu Refresh Token!");

        // Sử dụng JwtUtils để giải mã token thay vì viết jwt.verify thủ công
        const decoded = jwtUtil.verifyRefreshToken(tokenFromClient);
        const savedToken = await redisClient.get(`refresh:${decoded.id}`);

        if (!savedToken || savedToken !== tokenFromClient) {
            throw new Error("Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại!");
        }

        const user = await userRepository.findById(decoded.id);
        if (!user || user.status === "BLOCKED") throw new Error("Tài khoản không hợp lệ!");

        // Ký cấp Access Token mới thông qua tiện ích
        const newAccessToken = jwtUtil.generateAccessToken({ id: user._id, role: user.role });
        return newAccessToken;
    }

    /**
     * Logic Đăng xuất - Xóa whitelist Refresh Token và đưa Access Token cũ vào Blacklist của Redis
     */
    async logout({ userId, accessToken }) {
        if (userId) {
            await redisClient.del(`refresh:${userId}`);
        }
        if (accessToken) {
            // Đưa Access Token cũ vào danh sách đen trong vòng 15 phút (bằng thời gian sống của nó)
            await redisClient.set(`blacklist:${accessToken}`, "true", "EX", 15 * 60);
        }
        return true;
    }
}

export default new AuthService();