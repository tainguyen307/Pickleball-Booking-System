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

    const getNavLinkClass = ({ isActive }) => {
        return `inline-flex h-10 items-center gap-1.5 rounded-xl px-3.5 text-sm font-bold transition-all duration-200 ${
            isActive
                ? "bg-white text-primary shadow-sm"
                : "text-on-surface-variant hover:bg-white/70 hover:text-on-surface"
        }`;
    };

    return (
        <div className="flex min-h-screen flex-col bg-background text-on-background">
            <header className="fixed top-0 z-50 w-full border-b border-outline-variant/70 bg-white/92 shadow-[0_10px_30px_rgba(15,122,75,0.05)] backdrop-blur-xl">
                <div className="app-shell">
                    <div className="flex h-16 items-center justify-between gap-4">
                        <Link to="/" className="group flex items-center gap-2.5">
                            <div className="grid h-10 w-10 place-items-center rounded-xl bg-ink text-white shadow-[0_12px_24px_rgba(11,20,16,0.16)] transition-transform group-hover:-rotate-2">
                                <span className="material-symbols-outlined text-[22px]">sports_tennis</span>
                            </div>
                            <div className="hidden leading-none sm:block">
                                <span className="block text-lg font-black tracking-tight text-on-surface">PickleballPro</span>
                                <span className="mt-1 block text-[11px] font-bold text-on-surface-variant">Booking court system</span>
                            </div>
                        </Link>

                        <nav className="hidden items-center gap-1 rounded-2xl border border-outline-variant/60 bg-surface-container-low p-1 md:flex">
                            <NavLink to="/" className={getNavLinkClass} end>
                                <span className="material-symbols-outlined text-[17px]">home</span>
                                Trang chủ
                            </NavLink>
                            <NavLink to="/courts" className={getNavLinkClass}>
                                <span className="material-symbols-outlined text-[17px]">sports_tennis</span>
                                Sân bóng
                            </NavLink>
                            {isAuthenticated && (
                                <NavLink to="/user/favorites" className={getNavLinkClass}>
                                    <span className="material-symbols-outlined text-[17px]">favorite</span>
                                    Yêu thích
                                </NavLink>
                            )}
                            {isAuthenticated && (
                                <NavLink to="/user/rewards" className={getNavLinkClass}>
                                    <span className="material-symbols-outlined text-[17px]">workspace_premium</span>
                                    Ưu đãi
                                </NavLink>
                            )}
                        </nav>

                        <div className="flex items-center gap-2">
                            {isAuthenticated && user ? (
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => navigate("/courts")}
                                        className="hidden items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-white shadow-[0_10px_22px_rgba(15,122,75,0.18)] transition-all hover:-translate-y-0.5 hover:bg-on-primary-container lg:inline-flex"
                                    >
                                        <span className="material-symbols-outlined text-[18px]">add_circle</span>
                                        Đặt sân
                                    </button>
                                    <NotificationBell />
                                    <Link
                                        to={user.role === "ADMIN" ? "/admin" : "/user/profile"}
                                        className="group flex items-center gap-2 rounded-2xl border border-outline-variant/70 bg-white p-1 pr-2.5 transition-all duration-200 hover:border-primary/30 hover:bg-primary-container/60"
                                    >
                                        <div className="relative">
                                            <img
                                                src={user.avatar || "https://api.dicebear.com/7.x/adventurer/svg?seed=pickle"}
                                                alt={user.fullName || "User avatar"}
                                                className="h-9 w-9 rounded-xl border border-outline-variant/70 object-cover transition-all duration-300 group-hover:border-primary/50"
                                            />
                                            <div className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500" />
                                        </div>
                                        <span className="hidden leading-tight sm:block">
                                            <span className="block max-w-28 truncate text-sm font-black text-on-surface group-hover:text-primary">
                                                {user.fullName || "Người dùng"}
                                            </span>
                                            <span className="block text-[10px] font-bold text-on-surface-variant">
                                                {user.role === "ADMIN" ? "Admin" : "Người chơi"}
                                            </span>
                                        </span>
                                    </Link>
                                    <button
                                        onClick={handleLogout}
                                        className="grid h-10 w-10 place-items-center rounded-xl text-outline transition-all duration-200 hover:bg-red-50 hover:text-red-500"
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
                                    <button onClick={() => navigate("/register")} className="btn-primary px-5 py-2">
                                        Đặt sân
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                    <nav className="flex gap-2 overflow-x-auto border-t border-outline-variant/50 py-2 md:hidden">
                        <NavLink to="/" className={getNavLinkClass} end>
                            <span className="material-symbols-outlined text-[17px]">home</span>
                            Trang chủ
                        </NavLink>
                        <NavLink to="/courts" className={getNavLinkClass}>
                            <span className="material-symbols-outlined text-[17px]">sports_tennis</span>
                            Sân bóng
                        </NavLink>
                        {isAuthenticated && (
                            <NavLink to="/user/favorites" className={getNavLinkClass}>
                                <span className="material-symbols-outlined text-[17px]">favorite</span>
                                Yêu thích
                            </NavLink>
                        )}
                        {isAuthenticated && (
                            <NavLink to="/user/rewards" className={getNavLinkClass}>
                                <span className="material-symbols-outlined text-[17px]">workspace_premium</span>
                                Ưu đãi
                            </NavLink>
                        )}
                    </nav>
                </div>
            </header>

            {/* 🌟 MAIN CONTENT */}
            <main className="flex-grow pt-28 md:pt-16">
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
