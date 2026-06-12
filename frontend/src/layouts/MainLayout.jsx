// src/components/MainLayout.jsx
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore.js";
import NotificationBell from "@/components/NotificationBell.jsx";

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
        <div className="flex min-h-screen flex-col bg-background text-on-background">
            <header className="fixed top-0 z-50 w-full border-b border-outline-variant/70 bg-white/88 shadow-[0_10px_30px_rgba(15,122,75,0.05)] backdrop-blur-xl">
                <div className="app-shell">
                    <div className="flex h-16 items-center justify-between">
                        <Link to="/" className="group flex items-center gap-2.5">
                            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-primary text-white shadow-[0_12px_25px_rgba(15,122,75,0.22)] transition-transform group-hover:-rotate-3">
                                <span className="material-symbols-outlined text-[22px]">sports_tennis</span>
                            </div>
                            <span className="text-xl font-black tracking-tight text-on-surface">
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
                            {isAuthenticated && (
                                <NavLink to="/user/favorites" className={getNavLinkClass}>
                                    Yêu thích
                                </NavLink>
                            )}
                            {isAuthenticated && (
                                <NavLink to="/user/rewards" className={getNavLinkClass}>
                                    <span className="flex items-center gap-1">
                                        <span className="material-symbols-outlined text-[15px]">workspace_premium</span>
                                        Điểm & Ưu đãi
                                    </span>
                                </NavLink>
                            )}
                        </nav>

                        <div className="flex items-center gap-2">
                            {isAuthenticated && user ? (
                                <div className="flex items-center gap-2">
                                    <NotificationBell />
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
                                        className="rounded-full p-2 text-outline transition-all duration-200 hover:bg-red-50 hover:text-red-500"
                                        title="Đăng xuất"
                                    >
                                        <span className="material-symbols-outlined text-[18px]">logout</span>
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <button
                                        onClick={() => navigate("/login")}
                                        className="hidden rounded-xl px-4 py-2 text-sm font-bold text-on-surface-variant transition-all duration-200 hover:bg-primary-container hover:text-primary md:block"
                                    >
                                        Đăng nhập
                                    </button>
                                    <button
                                        onClick={() => navigate("/register")}
                                        className="btn-primary px-5 py-2"
                                    >
                                        Đặt sân
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            {/* 🌟 MAIN CONTENT */}
            <main className="flex-grow pt-16">
                <Outlet />
            </main>

            <footer className="mt-auto w-full border-t border-outline-variant/70 bg-white py-12">
                <div className="app-shell">
                    <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
                        <div className="col-span-1 md:col-span-1">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-white">
                                    <span className="material-symbols-outlined text-[19px]">sports_tennis</span>
                                </div>
                                <span className="text-lg font-black text-on-surface">
                                    PickleballPro
                                </span>
                            </div>
                            <p className="muted-copy">
                                Đặt sân, thanh toán, thuê dụng cụ và theo dõi lịch chơi trong một trải nghiệm gọn gàng.
                            </p>
                        </div>
                        <div>
                            <h5 className="mb-4 text-sm font-black text-on-surface">Hệ thống</h5>
                            <ul className="space-y-2 text-sm">
                                <li><Link className="text-on-surface-variant transition-colors duration-200 hover:text-primary" to="/courts">Danh sách sân</Link></li>
                                <li><Link className="text-on-surface-variant transition-colors duration-200 hover:text-primary" to="/user/favorites">Yêu thích</Link></li>
                                <li><Link className="text-on-surface-variant transition-colors duration-200 hover:text-primary" to="/user/profile">Hồ sơ</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h5 className="mb-4 text-sm font-black text-on-surface">Hỗ trợ</h5>
                            <ul className="space-y-2 text-sm">
                                <li><a className="text-on-surface-variant transition-colors duration-200 hover:text-primary" href="#">Liên hệ</a></li>
                                <li><a className="text-on-surface-variant transition-colors duration-200 hover:text-primary" href="#">Điều khoản</a></li>
                                <li><a className="text-on-surface-variant transition-colors duration-200 hover:text-primary" href="#">Bảo mật</a></li>
                            </ul>
                        </div>
                        <div>
                            <h5 className="mb-4 text-sm font-black text-on-surface">Giờ vận hành</h5>
                            <p className="muted-copy">Hệ thống đặt sân hoạt động 24/7. Từng cụm sân có giờ mở cửa riêng trong trang chi tiết.</p>
                        </div>
                    </div>
                    <div className="mt-8 flex flex-col items-center justify-between gap-3 border-t border-outline-variant/60 pt-6 md:flex-row">
                        <p className="text-xs text-on-surface-variant">© {new Date().getFullYear()} PickleballPro Management.</p>
                        <div className="flex gap-6 text-xs text-on-surface-variant">
                            <span>Realtime booking</span>
                            <span>Verified reviews</span>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
