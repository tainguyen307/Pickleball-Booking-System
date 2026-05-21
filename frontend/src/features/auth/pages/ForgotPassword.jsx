// src/features/auth/pages/ForgotPassword.jsx
import { useState } from "react";
import { Link } from "react-router-dom";
import FormInput from "@/components/FormInput";
import { authService } from "@/services/auth.service";

export default function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [errorMsg, setErrorMsg] = useState("");
    const [isSuccess, setIsSuccess] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email) {
            setErrorMsg("Vui lòng điền địa chỉ Email!");
            return;
        }

        setIsLoading(true);
        setErrorMsg("");

        try {
            // Gọi API yêu cầu cấp lại mật khẩu
            await authService.forgotPassword(email);
            setIsSuccess(true);
        } catch (err) {
            setErrorMsg(err.response?.data?.message || "Email không tồn tại trong hệ thống!");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background px-gutter relative overflow-hidden font-lexend">
            <div className="w-full max-w-[440px] bg-white rounded-3xl p-8 shadow-sm border border-outline-variant/30 z-10">

                {/* Quay lại Login */}
                <Link to="/login" className="inline-flex items-center gap-2 text-primary font-bold text-label-large mb-6 hover:opacity-80 transition-opacity">
                    <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                    <span>Quay lại đăng nhập</span>
                </Link>

                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-headline-md font-bold text-on-surface mb-2">Quên mật khẩu?</h1>
                    <p className="text-on-surface-variant text-body-medium">
                        Đừng lo lắng! Nhập email của bạn dưới đây và chúng tôi sẽ gửi liên kết khôi phục tài khoản.
                    </p>
                </div>

                {/* Alert thông báo lỗi */}
                {errorMsg && (
                    <div className="mb-4 p-3 bg-error/10 text-error rounded-xl text-body-medium flex items-center gap-2">
                        <span className="material-symbols-outlined text-[20px]">error</span>
                        <span>{errorMsg}</span>
                    </div>
                )}

                {/* Nội dung Form hoặc Trạng thái thành công */}
                {!isSuccess ? (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <FormInput
                            label="Địa chỉ Email"
                            type="email"
                            icon="mail"
                            placeholder="name@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-bold rounded-full transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
                        >
                            {isLoading ? (
                                <>
                                    <span className="animate-spin material-symbols-outlined">progress_activity</span>
                                    <span>Đang gửi mail...</span>
                                </>
                            ) : (
                                <>
                                    <span className="material-symbols-outlined">lock_reset</span>
                                    <span>Gửi liên kết khôi phục</span>
                                </>
                            )}
                        </button>
                    </form>
                ) : (
                    /* UI Trạng thái gửi mail thành công theo Stitch file */
                    <div className="text-center py-4 space-y-4">
                        <div className="w-16 h-16 bg-primary-container text-on-primary-container rounded-full flex items-center justify-center mx-auto">
              <span className="material-symbols-outlined text-[32px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                check_circle
              </span>
                        </div>
                        <h3 className="text-title-large font-bold text-on-surface">Kiểm tra Hộp thư</h3>
                        <p className="text-on-surface-variant text-body-medium">
                            Chúng tôi đã gửi một email hướng dẫn đặt lại mật khẩu đến <strong className="text-on-surface">{email}</strong>.
                        </p>
                        <button
                            onClick={() => setIsSuccess(false)}
                            className="text-primary font-bold text-label-large hover:underline mt-2 block mx-auto"
                        >
                            Gửi lại email khác
                        </button>
                    </div>
                )}
            </div>

            {/* Sporty Decorative Background Elements */}
            <div className="fixed -bottom-20 -right-20 w-80 h-80 bg-primary/5 rounded-full blur-[100px] pointer-events-none -z-10"></div>
            <div className="fixed -top-20 -left-20 w-80 h-80 bg-primary/5 rounded-full blur-[100px] pointer-events-none -z-10"></div>
        </div>
    );
}