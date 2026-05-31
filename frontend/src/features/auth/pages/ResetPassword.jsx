// src/features/auth/pages/ResetPassword.jsx
import { useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import FormInput from "@/components/FormInput";
import { authService } from "@/services/auth.service";

export default function ResetPassword() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    // 🎯 Bóc tách chính xác tham số "token" và "id" từ link trong Gmail
    const token = searchParams.get("token");
    const userId = searchParams.get("id");

    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const [isSuccess, setIsSuccess] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault(); // Chặn hành vi reload mặc định của form

        // 🎯 CHỐT CHẶN VÀNG: Nếu đang gửi request thì khóa luồng, chống click đúp gây Race Condition
        if (isLoading) return;
        setErrorMsg("");

        // Validation cơ bản ở Frontend
        if (!newPassword || !confirmPassword) {
            setErrorMsg("Vui lòng điền đầy đủ thông tin!");
            return;
        }

        if (newPassword.length < 6) {
            setErrorMsg("Mật khẩu mới phải từ 6 ký tự trở lên!");
            return;
        }

        if (newPassword !== confirmPassword) {
            setErrorMsg("Mật khẩu xác nhận không trùng khớp!");
            return;
        }

        if (!token || !userId) {
            setErrorMsg("Đường dẫn khôi phục không hợp lệ hoặc thiếu tham số xác thực!");
            return;
        }

        setIsLoading(true); // Bật trạng thái loading để vô hiệu hóa nút bấm

        try {
            // Gọi sang tầng service đã bóc tách
            const data = await authService.resetPassword({
                userId,
                token,
                newPassword,
            });

            if (data.success) {
                setIsSuccess(true);
                // Đếm ngược 3 giây đưa người dùng về trang đăng nhập
                setTimeout(() => {
                    navigate("/login");
                }, 3000);
            }
        } catch (err) {
            // 🎯 THẢ ĐÚNG 4 DÒNG DEBUG THẦN THÁNH NÀY VÀO BLOCK CATCH CỦA BẠN:
            console.log("💥 [FRONTEND CATCH] Biến cố nổ ra khi gọi API reset-password!");
            console.log("📝 Mã lỗi HTTP Status từ Backend:", err.response?.status);
            console.log("📦 Cục dữ liệu lỗi Backend trả về:", err.response?.data);
            console.error("📂 Bản thiết kế chi tiết Object Error:", err);

            // Dòng thông báo lỗi cũ của bạn (Giữ nguyên hoặc sửa theo biến err)
            setErrorMsg(err.response?.data?.message || "Đã có lỗi xảy ra, vui lòng thử lại!");
            setIsLoading(false);
        }
    };


    return (
        <div className="bg-background font-lexend text-on-background min-h-screen flex flex-col relative overflow-hidden">
            {/* Mesh Gradient Background */}
            <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[100px]" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-green-300/10 rounded-full blur-[100px]" />

            <main className="flex-grow flex items-center justify-center p-6 relative z-10">
                <div className="w-full max-w-[460px] bg-white rounded-2xl shadow-xl shadow-green-900/5 border border-outline-variant p-8 md:p-10">

                    {/* Header */}
                    <div className="text-center mb-8">
                        <h1 className="text-primary text-2xl font-black tracking-tighter mb-1">PickleballPro</h1>
                        <p className="text-on-surface-variant text-sm">Thiết lập lại mật khẩu bảo mật của bạn.</p>
                    </div>

                    {errorMsg && (
                        <div className="mb-4 p-3 bg-error/10 text-error rounded-xl text-xs font-bold flex items-center gap-2">
                            <span className="material-symbols-outlined text-[18px]">error</span>
                            <span>{errorMsg}</span>
                        </div>
                    )}

                    {!isSuccess ? (
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="bg-surface-container-low p-4 rounded-xl text-xs text-on-surface-variant leading-relaxed">
                                🔑 Đang tiến hành khôi phục tài khoản. Vui lòng nhập mật khẩu mới có độ dài từ 6 ký tự trở lên.
                            </div>

                            {/* Ô nhập mật khẩu mới */}
                            <FormInput
                                label="Mật khẩu mới"
                                icon="lock"
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                            >
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface transition-colors"
                                >
                                    <span className="material-symbols-outlined text-[20px]">
                                        {showPassword ? "visibility_off" : "visibility"}
                                    </span>
                                </button>
                            </FormInput>

                            {/* Ô nhập lại mật khẩu mới */}
                            <FormInput
                                label="Xác nhận mật khẩu mới"
                                icon="lock_reset"
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                            />

                            {/* Nút submit khóa cứng khi isLoading = true */}
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full py-3.5 bg-primary text-white font-bold rounded-xl hover:bg-primary-container hover:text-on-primary-container transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-60"
                            >
                                {isLoading ? (
                                    <>
                                        <span className="animate-spin material-symbols-outlined">progress_activity</span>
                                        <span>Đang cập nhật...</span>
                                    </>
                                ) : (
                                    <span>Cập nhật mật khẩu</span>
                                )}
                            </button>
                        </form>
                    ) : (
                        /* UI Trạng thái đổi thành công */
                        <div className="text-center py-6 space-y-4">
                            <div className="w-16 h-16 bg-primary-container/20 text-primary rounded-full flex items-center justify-center mx-auto">
                                <span className="material-symbols-outlined text-[36px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                                    check_circle
                                </span>
                            </div>
                            <h3 className="text-xl font-bold text-on-surface">Đổi mật khẩu thành công!</h3>
                            <p className="text-on-surface-variant text-sm px-4">
                                Mật khẩu mới của bạn đã được ghi nhận. Hệ thống đang tự động đưa bạn quay lại trang đăng nhập...
                            </p>
                            <Link to="/login" className="text-primary font-bold text-sm block hover:underline pt-2">
                                Bấm vào đây nếu hệ thống không tự chuyển hướng
                            </Link>
                        </div>
                    )}
                </div>
            </main>

            {/* Decorative Lines */}
            <div className="fixed top-0 left-0 w-1 h-full bg-primary/20 pointer-events-none" />
            <div className="fixed top-0 right-0 w-1 h-full bg-primary/20 pointer-events-none" />
        </div>
    );
}