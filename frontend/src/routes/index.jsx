import { createBrowserRouter, Navigate } from "react-router-dom";
import Login from "../features/auth/pages/Login";
import Register from "../features/auth/pages/Register";
import ForgotPassword from "../features/auth/pages/ForgotPassword";
import ResetPassword from "../features/auth/pages/ResetPassword";

import MainLayout from "../layouts/MainLayout.jsx";
import Home from "../features/home/pages/Home";
import CourtList from "../features/court/pages/CourtList";
import CourtDetail from "../features/court/pages/CourtDetail";

// 🛡️ Admin imports
import ProtectedRoute from "./ProtectedRoute.jsx";
import AdminLayout from "../layouts/AdminLayout.jsx";
import Dashboard from "../features/admin/pages/Dashboard.jsx";
import CourtManagement from "../features/admin/pages/CourtManagement.jsx";
import BookingManagement from "../features/admin/pages/BookingManagement.jsx";
import EquipmentManagement from "../features/admin/pages/EquipmentManagement.jsx";
import MaintenanceManagement from "../features/admin/pages/MaintenanceManagement.jsx";
import UserManagement from "../features/admin/pages/UserManagement.jsx";

export const router = createBrowserRouter([
    {
        path: "/login",
        element: <Login />,
    },
    {
        path: "/register",
        element: <Register />,
    },
    {
        path: "/forgot-password",
        element: <ForgotPassword />,
    },
    {
        path: "/reset-password",
        element: <ResetPassword />,
    },
    {
        // 🎯 KHUNG TRỤ CỘT BAO BỌC CHO TOÀN BỘ CÁC TRANG XEM SÂN CÔNG KHAI
        path: "/",
        element: <MainLayout />,
        children: [
            {
                path: "/",
                element: <Home />,
            },
            {
                path: "/courts",
                element: <CourtList />,
            },
            {
                path: "/courts/:id",
                element: <CourtDetail />,
            }
        ]
    },
    {
        path: "/user/profile",
        element: (
            <div className="p-8 text-center text-primary font-bold">
                <h1>Trang Hồ Sơ User (Đang phát triển...)</h1>
            </div>
        ),
    },
    {
        // 🛡️ Group các route Admin được bảo vệ bởi ProtectedRoute
        path: "/admin",
        element: <ProtectedRoute requiredRole="ADMIN" />,
        children: [
            {
                element: <AdminLayout />,
                children: [
                    {
                        index: true,
                        element: <Dashboard />,
                    },
                    {
                        path: "courts",
                        element: <CourtManagement />,
                    },
                    {
                        path: "bookings",
                        element: <BookingManagement />,
                    },
                    {
                        path: "equipments",
                        element: <EquipmentManagement />,
                    },
                    {
                        path: "maintenance",
                        element: <MaintenanceManagement />,
                    },
                    {
                        path: "users",
                        element: <UserManagement />,
                    },
                ],
            },
        ],
    },
    // Tự động đá về trang /login nếu người dùng gõ bậy URL không tồn tại
    {
        path: "*",
        element: <Navigate to="/login" replace />,
    },
]);