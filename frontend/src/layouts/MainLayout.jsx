// src/components/MainLayout.jsx
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore.js";

export default function MainLayout() {
    const navigate = useNavigate();
    const { user, isAuthenticated, clearAuth } = useAuthStore();

    const handleLogout = () => {
        clearAuth();
        localStorage.removeItem("refreshToken");
        navigate("/login");
    };

    // Hàm xác định class cho NavLink dựa trên trạng thái active
    const getNavLinkClass = ({ isActive }) => {
        return `px-4 py-1.5 rounded-full transition-all duration-200 font-medium ${
            isActive
                ? "text-primary bg-primary/10 font-semibold"
                : "text-on-surface-variant hover:text-primary hover:bg-primary/5"
        }`;
    };

    return (
        <div className="bg-background text-on-background font-body-md min-h-screen flex flex-col">
            {/* 🎯 TOP NAVIGATION - Modern Glassmorphism */}
            <header className="fixed top-0 w-full z-50 bg-surface-container-lowest/80 backdrop-blur-xl border-b border-outline-variant/50 shadow-sm">
                <div className="px-4 md:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-14 max-w-container-max mx-auto">
                        <Link to="/" className="group flex items-center gap-2.5">
                            <div className="relative">
                                <div className="absolute inset-0 bg-primary/20 rounded-xl blur-md group-hover:blur-lg transition-all opacity-0 group-hover:opacity-100" />
                                <div className="relative bg-gradient-to-br from-primary/10 to-primary/5 p-2 rounded-xl group-hover:scale-105 transition-all duration-300">
                                    <span className="material-symbols-outlined text-[22px] text-primary">sports_tennis</span>
                                </div>
                            </div>
                            <span className="text-xl font-black bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent tracking-tight">
                                PickleballPro
                            </span>
                        </Link>

                        <nav className="hidden md:flex items-center gap-0.5 font-body-md text-body-md">
                            <NavLink to="/" className={getNavLinkClass} end>
                                Trang chủ
                            </NavLink>
                            <NavLink to="/courts" className={getNavLinkClass}>
                                Sân bóng
                            </NavLink>
                        </nav>

                        <div className="flex items-center gap-2">
                            {isAuthenticated && user ? (
                                <div className="flex items-center gap-2">
                                    <Link to={user.role === "ADMIN" ? "/admin" : "/user/profile"} className="flex items-center gap-2 group hover:bg-surface-container p-1 rounded-full transition-all duration-200">
                                        <div className="relative">
                                            <img
                                                src={user.avatar || "https://api.dicebear.com/7.x/adventurer/svg?seed=pickle"}
                                                alt="avatar"
                                                className="w-8 h-8 rounded-full border-2 border-primary/30 object-cover group-hover:border-primary/70 transition-all duration-300"
                                            />
                                            <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white"></div>
                                        </div>
                                        <span className="text-sm font-medium text-on-surface group-hover:text-primary transition-colors hidden sm:inline">
                                            {user.fullName?.split(" ")[0] || user.fullName}
                                        </span>
                                    </Link>
                                    <button
                                        onClick={handleLogout}
                                        className="p-2 rounded-full text-outline hover:text-rose-500 hover:bg-rose-50 transition-all duration-200"
                                        title="Đăng xuất"
                                    >
                                        <span className="material-symbols-outlined text-[18px]">logout</span>
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <button
                                        onClick={() => navigate("/login")}
                                        className="hidden md:block px-4 py-1.5 rounded-full text-on-surface-variant hover:text-primary hover:bg-primary/5 transition-all duration-200 font-label-md text-label-md font-medium"
                                    >
                                        Sign In
                                    </button>
                                    <button
                                        onClick={() => navigate("/register")}
                                        className="bg-primary text-on-primary px-5 py-1.5 rounded-full font-label-md text-label-md hover:shadow-md hover:shadow-primary/25 hover:scale-105 active:scale-95 transition-all duration-200 font-semibold"
                                    >
                                        Book Now
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            {/* 🌟 MAIN CONTENT */}
            <main className="pt-14 flex-grow">
                <Outlet />
            </main>

            {/* 📜 MODERN MINIMAL FOOTER */}
            <footer className="w-full py-12 mt-auto bg-surface-container border-t border-outline-variant/40">
                <div className="px-4 md:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-container-max mx-auto">
                        <div className="col-span-1 md:col-span-1">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="bg-primary/10 p-1.5 rounded-lg">
                                    <span className="material-symbols-outlined text-primary text-[20px]">sports_tennis</span>
                                </div>
                                <span className="text-lg font-black bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                                    PickleballPro
                                </span>
                            </div>
                            <p className="text-sm text-on-surface-variant/70 leading-relaxed">
                                Elevating the sport of pickleball through technology and community excellence.
                            </p>
                        </div>
                        <div>
                            <h5 className="text-xs font-bold uppercase tracking-wider mb-4 text-on-surface/60">Company</h5>
                            <ul className="space-y-2 text-sm">
                                <li><a className="text-on-surface-variant/70 hover:text-primary transition-colors duration-200" href="#">About Us</a></li>
                                <li><a className="text-on-surface-variant/70 hover:text-primary transition-colors duration-200" href="#">Careers</a></li>
                                <li><a className="text-on-surface-variant/70 hover:text-primary transition-colors duration-200" href="#">Facility Rules</a></li>
                            </ul>
                        </div>
                        <div>
                            <h5 className="text-xs font-bold uppercase tracking-wider mb-4 text-on-surface/60">Support</h5>
                            <ul className="space-y-2 text-sm">
                                <li><a className="text-on-surface-variant/70 hover:text-primary transition-colors duration-200" href="#">Contact Support</a></li>
                                <li><a className="text-on-surface-variant/70 hover:text-primary transition-colors duration-200" href="#">Terms of Service</a></li>
                                <li><a className="text-on-surface-variant/70 hover:text-primary transition-colors duration-200" href="#">Privacy Policy</a></li>
                            </ul>
                        </div>
                        <div>
                            <h5 className="text-xs font-bold uppercase tracking-wider mb-4 text-on-surface/60">Follow Us</h5>
                            <div className="flex gap-2">
                                <a className="w-9 h-9 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface-variant hover:bg-primary hover:text-white hover:-translate-y-0.5 transition-all duration-200" href="#">
                                    <span className="material-symbols-outlined text-[18px]">language</span>
                                </a>
                                <a className="w-9 h-9 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface-variant hover:bg-primary hover:text-white hover:-translate-y-0.5 transition-all duration-200" href="#">
                                    <span className="material-symbols-outlined text-[18px]">smart_display</span>
                                </a>
                            </div>
                        </div>
                    </div>
                    <div className="max-w-container-max mx-auto mt-8 pt-6 border-t border-outline-variant/30 flex flex-col md:flex-row justify-between items-center gap-3">
                        <p className="text-xs text-on-surface-variant/60">© {new Date().getFullYear()} PickleballPro Management. All rights reserved.</p>
                        <div className="flex gap-6 text-xs text-on-surface-variant/60">
                            <span className="hover:text-primary hover:cursor-pointer transition-colors">Global Rankings</span>
                            <span className="hover:text-primary hover:cursor-pointer transition-colors">Find a Coach</span>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}