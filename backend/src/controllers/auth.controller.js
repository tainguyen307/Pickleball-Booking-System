import authService from "../services/auth.service.js";

class AuthController {
    /**
     * Xử lý HTTP Request Đăng nhập thường
     */
    async login(req, res) {
        try {
            const { email, password } = req.body;
            const result = await authService.loginWithPassword({ email, password });

            return res.status(200).json({
                success: true,
                message: "Đăng nhập thành công!",
                accessToken: result.accessToken,
                refreshToken: result.refreshToken,
                redirectUrl: result.redirectUrl,
                user: {
                    id: result.user._id,
                    fullName: result.user.fullName,
                    email: result.user.email,
                    role: result.user.role,
                    avatar: result.user.avatar
                }
            });
        } catch (error) {
            return res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    /**
     * Xử lý HTTP Request Đăng nhập bằng Google
     */
    async googleLogin(req, res) {
        try {
            const { idToken } = req.body;

            // Gọi sang tầng Service xử lý nghiệp vụ OAuth2
            const result = await authService.loginWithGoogle(idToken);

            // Phản hồi JSON sạch sẽ về cho Frontend React
            return res.status(200).json({
                success: true,
                message: "Đăng nhập bằng Google thành công!",
                accessToken: result.accessToken,
                refreshToken: result.refreshToken,
                redirectUrl: result.redirectUrl, // URL điều hướng thông minh (/user/profile hoặc /admin/profile)
                user: {
                    id: result.user._id,
                    fullName: result.user.fullName,
                    email: result.user.email,
                    role: result.user.role,
                    avatar: result.user.avatar
                }
            });
        } catch (error) {
            return res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    /**
     * Xử lý HTTP Request Đăng xuất hệ thống
     */
    async logout(req, res) {
        try {
            const authHeader = req.headers["authorization"];
            const accessToken = authHeader && authHeader.split(" ")[1];
            const userId = req.user?.id;

            await authService.logout({ userId, accessToken });

            return res.status(200).json({
                success: true,
                message: "Đăng xuất tài khoản thành công!"
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: "Lỗi hệ thống khi đăng xuất!"
            });
        }
    }
}

export default new AuthController();