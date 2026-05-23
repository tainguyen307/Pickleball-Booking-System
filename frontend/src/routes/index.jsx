import { createBrowserRouter, Navigate } from "react-router-dom";
import Login from "../features/auth/pages/Login";
import Register from "../features/auth/pages/Register";
import ForgotPassword from "../features/auth/pages/ForgotPassword";
import ResetPassword from "../features/auth/pages/ResetPassword";

import MainLayout from "../layouts/MainLayout.jsx";
import Home from "../features/home/pages/Home";
import CourtList from "../features/court/pages/CourtList";
import CourtDetail from "../features/court/pages/CourtDetail";

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
        path: "/admin/profile",
        element: (
            <div className="p-8 text-center text-secondary font-bold">
                <h1>Trang Dashboard Admin (Đang phát triển...)</h1>
            </div>
        ),
    },
    // Tự động đá về trang /login nếu người dùng gõ bậy URL không tồn tại
    {
        path: "*",
        element: <Navigate to="/login" replace />,
    },
]);