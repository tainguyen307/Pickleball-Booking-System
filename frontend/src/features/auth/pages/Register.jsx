// src/features/auth/pages/Register.jsx
import { useState } from "react";
import { Link } from "react-router-dom";
import FormInput from "@/components/FormInput";
import { authService } from "@/services/auth.service";
import { useAuthStore } from "@/store/authStore";

export default function Register() {
    const [step, setStep] = useState(1); // 🎯 1: Nhập Form, 2: Nhập OTP

    // Giữ nguyên toàn bộ 3 State gốc của bạn
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    // Thêm duy nhất State hứng mã OTP
    const [otpCode, setOtpCode] = useState("");

    const [errorMsg, setErrorMsg] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false); // Quản lý trạng thái hiện màn hình chúc mừng

    const setAuth = useAuthStore((state) => state.setAuth);

    /**
     * GIAI ĐOẠN 1: Bấm nút Đăng Ký -> Gọi API gốc truyền 3 tham số rời rạc
     */
    const handleRegisterSubmit = async (e) => {
        e.preventDefault();

        if (isLoading) return;

        if (!name || !email || !password || !confirmPassword) {
            setErrorMsg("Vui lòng nhập đầy đủ thông tin!");
            return;
        }

        if (password !== confirmPassword) {
            setErrorMsg("Mật khẩu xác nhận không khớp!");
            return;
        }

        setIsLoading(true);
        setErrorMsg("");

        try {
            // 🎯 GIỮ NGUYÊN LUỒNG TRUYỀN 3 THAM SỐ RỜI RẠC NHƯ CŨ CỦA BẠN:
            const data = await authService.register(name, email, password);

            // Nếu Backend phản hồi yêu cầu xác thực OTP thành công
            if (data) {
                setStep(2); // Đá sang màn hình nhập 6 số OTP
            }
        } catch (err) {
            setErrorMsg(err.response?.data?.message || "Đăng ký thất bại. Vui lòng thử lại!");
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * GIAI ĐOẠN 2: Bấm nút Xác Nhận OTP -> Lưu DB thật và kích hoạt Token
     */
    const handleOTPSubmit = async (e) => {
        e.preventDefault();

        if (isLoading) return;

        if (!otpCode || otpCode.length !== 6) {
            setErrorMsg("Vui lòng nhập chính xác mã OTP gồm 6 chữ số!");
            return;
        }

        setIsLoading(true);
        setErrorMsg("");

        try {
            // Gọi API xác thực OTP
            const data = await authService.verifyOTP({ email, otpCode });

            if (data) {
                // 🏆 KÍCH HOẠT PHIÊN ĐĂNG NHẬP (Luồng xử lý Zustand gốc của bạn)
                setAuth(data.user, data.accessToken);
                localStorage.setItem("refreshToken", data.refreshToken);

                // 🎯 BẬT MÀN HÌNH CHÚC MỪNG THÀNH CÔNG
                setIsSuccess(true);

                // Hoãn 3 giây rồi mới chính thức chuyển trang cho người dùng kịp nhìn thông báo thành công
                setTimeout(() => {
                    window.location.href = data.redirectUrl || "/";
                }, 3000);
            }
        } catch (err) {
            setErrorMsg(err.response?.data?.message || "Mã OTP không chính xác hoặc đã hết hạn!");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background px-gutter py-12 relative overflow-hidden font-lexend">
            <div className="w-full max-w-[440px] bg-white rounded-3xl p-8 shadow-sm border border-outline-variant/30 z-10">

                {/* 🎯 NẾU CHƯA THÀNH CÔNG -> HIỆN UI NHẬP FORM / NHẬP OTP NHƯ CŨ */}
                {!isSuccess ? (
                    <>
                        {/* Header linh hoạt */}
                        <div className="text-center mb-8">
                            <h1 className="text-headline-md font-bold text-primary mb-2">
                                {step === 1 ? "Tạo Tài Khoản" : "Xác Thực Email"}
                            </h1>
                            <p className="text-on-surface-variant text-body-medium">
                                {step === 1
                                    ? "Tham gia PickleballPro ngay hôm nay"
                                    : `Mã xác minh đã được gửi đến hộp thư ${email}`
                                }
                            </p>
                        </div>

                        {/* Thông báo lỗi */}
                        {errorMsg && (
                            <div className="mb-4 p-3 bg-error/10 text-error rounded-xl text-body-medium flex items-center gap-2">
                                <span className="material-symbols-outlined text-[20px]">error</span>
                                <span>{errorMsg}</span>
                            </div>
                        )}

                        {step === 1 ? (
                            /* 📜 FORM ĐĂNG KÝ GỐC Y HỆT 100% GIAO DIỆN CỦA BẠN */
                            <form onSubmit={handleRegisterSubmit} className="space-y-5">
                                <FormInput
                                    label="Họ và Tên"
                                    type="text"
                                    icon="person"
                                    placeholder="Nguyễn Văn A"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                />

                                <FormInput
                                    label="Địa chỉ Email"
                                    type="email"
                                    icon="mail"
                                    placeholder="name@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />

                                <FormInput
                                    label="Mật khẩu"
                                    type="password"
                                    icon="lock"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />

                                <FormInput
                                    label="Xác nhận mật khẩu"
                                    type="password"
                                    icon="lock"
                                    placeholder="••••••••"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                />

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-bold rounded-full transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
                                >
                                    {isLoading ? (
                                        <>
                                            <span className="animate-spin material-symbols-outlined">progress_activity</span>
                                            <span>Đang xử lý...</span>
                                        </>
                                    ) : (
                                        <span>Đăng Ký</span>
                                    )}
                                </button>
                            </form>
                        ) : (
                            /* 🔒 MÀN HÌNH NHẬP OTP XÁC THỰC */
                            <form onSubmit={handleOTPSubmit} className="space-y-6">
                                <div className="bg-surface-container-low p-4 rounded-xl text-xs text-on-surface-variant leading-relaxed text-center">
                                    📬 Vui lòng kiểm tra Email, sao chép mã số **OTP gồm 6 chữ số** điền xuống dưới để kích hoạt phiên đăng ký.
                                </div>

                                <div className="space-y-2">
                                    <label className="text-body-medium font-bold text-on-surface block text-center">
                                        Mã OTP Xác Thực
                                    </label>
                                    <input
                                        type="text"
                                        maxLength="6"
                                        placeholder="000000"
                                        value={otpCode}
                                        onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                                        className="w-full h-14 tracking-[12px] text-center font-black text-2xl border border-outline rounded-2xl focus:outline-none focus:border-primary bg-surface-container-lowest transition-all"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-bold rounded-full transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
                                >
                                    {isLoading ? (
                                        <>
                                            <span className="animate-spin material-symbols-outlined">progress_activity</span>
                                            <span>Đang xác minh...</span>
                                        </>
                                    ) : (
                                        <span>Xác Nhận Kích Hoạt</span>
                                    )}
                                </button>

                                <div className="text-center">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setStep(1);
                                            setErrorMsg("");
                                        }}
                                        className="text-sm text-outline hover:text-primary hover:underline font-medium transition-colors"
                                    >
                                        ← Quay lại sửa thông tin email
                                    </button>
                                </div>
                            </form>
                        )}

                        {/* Footer chuyển màn */}
                        <div className="text-center mt-8 text-body-medium text-on-surface-variant">
                            Đã có tài khoản?{" "}
                            <Link to="/login" className="text-primary font-bold hover:underline">
                                Đăng nhập
                            </Link>
                        </div>
                    </>
                ) : (
                    /* 🎯 NẾU ĐÃ ĐĂNG KÝ + XÁC THỰC OTP THÀNH CÔNG -> BẬT UI CHÚC MỪNG LÊN */
                    <div className="text-center py-6 space-y-4">
                        <div className="w-16 h-16 bg-green-50 text-primary rounded-full flex items-center justify-center mx-auto">
                            <span className="material-symbols-outlined text-[36px]" style={{ fontVariationSettings: "'FILL' 1, 'wght' 700" }}>
                                check_circle
                            </span>
                        </div>
                        <h3 className="text-xl font-bold text-on-surface">Đăng ký tài khoản thành công!</h3>
                        <p className="text-on-surface-variant text-sm px-4">
                            Chào mừng bạn đến với <b>PickleballPro</b>. Hệ thống đang tự động kích hoạt phiên đăng nhập và đưa bạn vào trang quản trị sau vài giây...
                        </p>
                        <div className="w-full max-w-[100px] mx-auto pt-2">
                            {/* Hiệu ứng thanh chạy loading nhỏ */}
                            <div className="h-1 w-full bg-green-100 rounded-full overflow-hidden">
                                <div className="h-full w-full bg-primary animate-[pulse_1.5s_infinite]" />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}