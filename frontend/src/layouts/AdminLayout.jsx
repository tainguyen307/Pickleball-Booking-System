// src/layouts/AdminLayout.jsx
import { useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

const menuItems = [
    {
        path: "/admin",
        label: "Dashboard",
        icon: "dashboard",
    },
    {
        path: "/admin/courts",
        label: "Quản lý Sân",
        icon: "sports_tennis",
    },
    {
        path: "/admin/bookings",
        label: "Quản lý Booking",
        icon: "event_available",
    },
    {
        path: "/admin/equipments",
        label: "Quản lý Thiết bị",
        icon: "inventory_2",
    },
    {
        path: "/admin/maintenance",
        label: "Bảo trì",
        icon: "build",
    },
    {
        path: "/admin/users",
        label: "Quản lý Users",
        icon: "group",
    },
    {
        path: "/admin/coupons",
        label: "Mã giảm giá",
        icon: "sell",
    },
];

export default function AdminLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { user, clearAuth } = useAuthStore();
    const navigate = useNavigate();

    const handleLogout = () => {
        clearAuth();
        navigate("/login");
    };

    return (
        <div className="flex h-screen bg-[#f6f7f4]">
            {/* Overlay mobile */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-30 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed lg:static inset-y-0 left-0 z-40 w-64 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
                    sidebarOpen ? "translate-x-0" : "-translate-x-full"
                } flex flex-col border-r border-gray-200 bg-white text-gray-900`}
            >
                {/* Logo */}
                <div className="flex items-center gap-3 border-b border-gray-200 px-6 py-5">
                    <div className="grid h-10 w-10 place-items-center rounded-2xl bg-primary text-white shadow-[0_12px_24px_rgba(15,122,75,0.2)]">
                        <span className="material-symbols-outlined text-[22px]">sports_tennis</span>
                    </div>
                    <div>
                        <h1 className="font-bold text-lg leading-tight">PickleballPro</h1>
                        <p className="text-xs font-semibold text-gray-500">Admin Panel</p>
                    </div>
                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="lg:hidden ml-auto p-1 rounded hover:bg-white/10"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                    {menuItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            end={item.path === "/admin"}
                            onClick={() => setSidebarOpen(false)}
                            className={({ isActive }) =>
                                `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition-all duration-200 ${
                                    isActive
                                        ? "border border-primary/15 bg-primary-container text-on-primary-container"
                                        : "text-gray-600 hover:bg-gray-50 hover:text-primary"
                                }`
                            }
                        >
                            <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                            <span>{item.label}</span>
                        </NavLink>
                    ))}
                </nav>

                {/* User Info */}
                <div className="border-t border-gray-200 px-4 py-4">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-container text-sm font-bold text-primary">
                            {user?.fullName?.charAt(0)?.toUpperCase() || "A"}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{user?.fullName || "Admin"}</p>
                            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-50 px-4 py-2.5 text-sm font-bold text-red-600 transition-colors hover:bg-red-100"
                    >
                        <span className="material-symbols-outlined text-[18px]">logout</span>
                        Đăng xuất
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Top Header */}
                <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4 shadow-sm lg:px-8">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
                    >
                        <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500 hidden sm:block">Chào mừng trở lại,</span>
                        <span className="text-sm font-semibold text-primary">{user?.fullName || "Admin"}</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                            {user?.avatar ? (
                                <img src={user.avatar} alt="Avatar" className="w-9 h-9 rounded-full object-cover" />
                            ) : (
                                <span className="text-sm font-bold text-primary">
                                    {user?.fullName?.charAt(0)?.toUpperCase() || "A"}
                                </span>
                            )}
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto bg-[#f6f7f4] p-4 lg:p-8">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
