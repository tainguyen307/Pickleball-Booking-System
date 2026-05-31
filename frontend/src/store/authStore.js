import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useAuthStore = create(
    persist(
        (set) => ({
            user: null,
            accessToken: null,
            isAuthenticated: false,

            // Hàm xử lý kích hoạt trạng thái khi đăng nhập thành công
            setAuth: (user, accessToken) =>
                set({
                    user,
                    accessToken,
                    isAuthenticated: true
                }),

            // Hàm dọn sạch kho đồ khi người dùng bấm Đăng xuất (Logout)
            clearAuth: () =>
                set({
                    user: null,
                    accessToken: null,
                    isAuthenticated: false
                }),
        }),
        {
            name: "pickleball-auth-storage", // Tên của cái Key sẽ nằm dưới mục LocalStorage của trình duyệt
        }
    )
);