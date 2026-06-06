// src/services/adminService.js
import axiosClient from "../api/axios";

const adminService = {
    // ======================== COURTS ========================
    getCourts: (params) => axiosClient.get("/admin/courts", { params }),
    getCourtById: (id) => axiosClient.get(`/admin/courts/${id}`),
    createCourt: (formData) =>
        axiosClient.post("/admin/courts", formData, {
            headers: { "Content-Type": "multipart/form-data" },
        }),
    updateCourt: (id, formData) =>
        axiosClient.put(`/admin/courts/${id}`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
        }),
    deleteCourt: (id) => axiosClient.delete(`/admin/courts/${id}`),
    blockCourt: (id) => axiosClient.put(`/admin/courts/${id}/block`),

    // ======================== BOOKINGS ========================
    getBookings: (params) => axiosClient.get("/admin/bookings", { params }),
    confirmBooking: (id) => axiosClient.put(`/admin/bookings/${id}/confirm`),
    cancelBooking: (id, cancelReason) =>
        axiosClient.put(`/admin/bookings/${id}/cancel`, { cancelReason }),

    // ======================== EQUIPMENT ========================
    getEquipments: (params) => axiosClient.get("/admin/equipments", { params }),
    createEquipment: (data) => axiosClient.post("/admin/equipments", data),
    updateEquipment: (id, data) => axiosClient.put(`/admin/equipments/${id}`, data),
    deleteEquipment: (id) => axiosClient.delete(`/admin/equipments/${id}`),
    stockIn: (id, quantity) => axiosClient.put(`/admin/equipments/${id}/stock-in`, { quantity }),

    // ======================== MAINTENANCE ========================
    getMaintenance: (params) => axiosClient.get("/admin/maintenance", { params }),
    createMaintenance: (data) => axiosClient.post("/admin/maintenance", data),
    updateMaintenanceStatus: (id, status) =>
        axiosClient.put(`/admin/maintenance/${id}/status`, { status }),

    // ======================== ANALYTICS ========================
    getDashboardStats: () => axiosClient.get("/admin/analytics/dashboard"),
    getRevenueStats: (params) => axiosClient.get("/admin/analytics/revenue", { params }),
    getEquipmentStats: () => axiosClient.get("/admin/analytics/equipment-stats"),
    getPeakHours: () => axiosClient.get("/admin/analytics/peak-hours"),

    // ======================== USERS ========================
    getUsers: (params) => axiosClient.get("/admin/users", { params }),
    getUserDetail: (id) => axiosClient.get(`/admin/users/${id}`),
    toggleUserStatus: (id) => axiosClient.put(`/admin/users/${id}/toggle-status`),
};

export default adminService;
