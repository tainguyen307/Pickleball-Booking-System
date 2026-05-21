// src/features/auth/pages/Login.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom"; // 🎯 Thêm Link và useNavigate để chuyển trang
import { GoogleLogin } from "@react-oauth/google";
import FormInput from "@/components/FormInput";
import { authService } from "@/services/auth.service";
import { useAuthStore } from "@/store/authStore";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    const navigate = useNavigate(); // 🎯 Hook điều hướng trang của React Router
    const setAuth = useAuthStore((state) => state.setAuth);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg("");
        try {
            const data = await authService.login(email, password);
            setAuth(data.user, data.accessToken);
            localStorage.setItem("refreshToken", data.refreshToken);
            window.location.href = data.redirectUrl;
        } catch (err) {
            setErrorMsg(err.response?.data?.message || "Invalid credentials");
        }
    };

    return (
        <div className="bg-background font-lexend text-on-background min-h-screen flex flex-col relative overflow-hidden">
            {/* Mesh Gradient Background */}
            <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[100px]" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-green-300/10 rounded-full blur-[100px]" />

            <main className="flex-grow flex items-center justify-center p-6 relative z-10">
                <div className="w-full max-w-[460px] bg-white rounded-2xl shadow-xl shadow-green-900/5 border border-outline-variant p-8 md:p-10">

                    {/* Brand Header */}
                    <div className="text-center mb-8">
                        <h1 className="text-primary text-2xl font-black tracking-tighter mb-1">PickleballPro</h1>
                        <p className="text-on-surface-variant text-sm">Manage your game with precision.</p>
                    </div>

                    {/* Tab Switcher */}
                    <div className="flex p-1 bg-surface-container-low rounded-xl mb-8">
                        {/* Đang ở trang Login nên nút này luôn sáng */}
                        <button
                            type="button"
                            className="flex-1 py-2 text-sm font-bold rounded-lg transition-all bg-white text-primary shadow-sm"
                        >
                            Login
                        </button>
                        {/* 🎯 Bấm vào đây sẽ nhảy sang trang Đăng ký thực tế */}
                        <button
                            type="button"
                            onClick={() => navigate("/register")}
                            className="flex-1 py-2 text-sm font-bold rounded-lg transition-all text-on-surface-variant hover:text-primary"
                        >
                            Register
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <FormInput label="Email Address" icon="mail" type="email" placeholder="name@club.com" value={email} onChange={(e) => setEmail(e.target.value)} />

                        <div className="space-y-1 relative">
                            <FormInput label="Password" icon="lock" type={showPassword ? "text" : "password"} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)}>
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface transition-colors">
                                    <span className="material-symbols-outlined text-[20px]">{showPassword ? "visibility_off" : "visibility"}</span>
                                </button>
                            </FormInput>

                            {/* 🎯 Nút Quên mật khẩu nằm tinh tế ngay góc dưới ô nhập Password */}
                            <div className="flex justify-end px-1 mt-1">
                                <Link
                                    to="/forgot-password"
                                    className="text-xs font-semibold text-primary hover:underline transition-all"
                                >
                                    Forgot password?
                                </Link>
                            </div>
                        </div>

                        {errorMsg && (
                            <div className="flex items-center gap-2 text-error text-xs font-bold px-1">
                                <span className="material-symbols-outlined text-[16px]">error</span>{errorMsg}
                            </div>
                        )}

                        <button type="submit" className="w-full py-3.5 bg-primary text-white font-bold rounded-xl hover:bg-primary-container hover:text-on-primary-container transition-all active:scale-[0.98]">
                            Sign In to Dashboard
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="relative py-6 flex items-center">
                        <div className="flex-grow border-t border-outline-variant"></div>
                        <span className="mx-4 text-outline text-[10px] uppercase font-bold tracking-widest">Or Continue With</span>
                        <div className="flex-grow border-t border-outline-variant"></div>
                    </div>

                    {/* Google Auth Cluster */}
                    <div className="flex justify-center w-full col-span-2">
                        <GoogleLogin
                            onSuccess={async (credentialResponse) => {
                                setErrorMsg("");
                                try {
                                    const data = await authService.googleLogin(credentialResponse.credential);
                                    setAuth(data.user, data.accessToken);
                                    localStorage.setItem("refreshToken", data.refreshToken);
                                    window.location.href = data.redirectUrl;
                                } catch (err) {
                                    setErrorMsg(err.response?.data?.message || "Google authentication failed.");
                                }
                            }}
                            onError={() => setErrorMsg("Google Sign-In Was Unsuccessful.")}
                            text="signin_with"
                            theme="outline"
                            size="large"
                            width="100%"
                        />
                    </div>

                    <p className="mt-8 text-[10px] text-center text-outline font-medium leading-relaxed">
                        Secure 256-bit SSL encrypted connection. <br />
                        By signing in, you agree to our <a href="#" className="text-primary font-bold hover:underline">Terms of Service</a>.
                    </p>
                </div>
            </main>

            {/* Decorative Lines */}
            <div className="fixed top-0 left-0 w-1 h-full bg-primary/20 pointer-events-none" />
            <div className="fixed top-0 right-0 w-1 h-full bg-primary/20 pointer-events-none" />
        </div>
    );
}