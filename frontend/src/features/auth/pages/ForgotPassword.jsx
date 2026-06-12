import { useState } from "react";
import { Link } from "react-router-dom";
import FormInput from "@/components/FormInput";
import { authService } from "@/services/auth.service";

export default function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [errorMsg, setErrorMsg] = useState("");
    const [isSuccess, setIsSuccess] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!email) {
            setErrorMsg("Vui lòng điền địa chỉ email!");
            return;
        }

        setIsLoading(true);
        setErrorMsg("");

        try {
            await authService.forgotPassword(email);
            setIsSuccess(true);
        } catch (err) {
            setErrorMsg(err.response?.data?.message || "Email không tồn tại trong hệ thống!");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-[100dvh] bg-background">
            <main className="app-shell flex min-h-[100dvh] items-center justify-center py-10">
                <div className="surface-panel w-full max-w-[460px] p-6 md:p-8">
                    <Link to="/login" className="mb-6 inline-flex items-center gap-2 text-sm font-bold text-primary hover:underline">
                        <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                        Quay lại đăng nhập
                    </Link>

                    <div className="mb-7">
                        <h1 className="text-3xl font-black tracking-tight text-on-surface">Khôi phục mật khẩu</h1>
                        <p className="muted-copy mt-2">Nhập email tài khoản, hệ thống sẽ gửi liên kết đặt lại mật khẩu.</p>
                    </div>

                    {errorMsg && (
                        <div className="mb-4 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-error">
                            <span className="material-symbols-outlined text-[18px]">error</span>
                            {errorMsg}
                        </div>
                    )}

                    {!isSuccess ? (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <FormInput label="Email" type="email" icon="mail" placeholder="name@example.com" value={email} onChange={(event) => setEmail(event.target.value)} />
                            <button type="submit" disabled={isLoading} className="btn-primary w-full">
                                {isLoading ? "Đang gửi..." : "Gửi liên kết"}
                            </button>
                        </form>
                    ) : (
                        <div className="py-4 text-center">
                            <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-primary-container text-primary">
                                <span className="material-symbols-outlined text-[32px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                                    mark_email_read
                                </span>
                            </div>
                            <h3 className="mt-5 text-2xl font-black text-on-surface">Kiểm tra hộp thư</h3>
                            <p className="muted-copy mx-auto mt-2 max-w-sm">
                                Chúng tôi đã gửi hướng dẫn đặt lại mật khẩu đến <strong className="text-on-surface">{email}</strong>.
                            </p>
                            <button onClick={() => setIsSuccess(false)} className="mt-5 text-sm font-bold text-primary hover:underline">
                                Dùng email khác
                            </button>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
