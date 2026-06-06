// src/features/admin/pages/BookingManagement.jsx
import { useState, useEffect } from "react";
import adminService from "../../../services/adminService";

const statusColors = {
    PENDING: "bg-yellow-100 text-yellow-700",
    CONFIRMED: "bg-blue-100 text-blue-700",
    COMPLETED: "bg-green-100 text-green-700",
    CANCELLED: "bg-red-100 text-red-700",
};

const paymentColors = {
    UNPAID: "bg-orange-100 text-orange-700",
    PAID: "bg-green-100 text-green-700",
    REFUNDED: "bg-purple-100 text-purple-700",
};

export default function BookingManagement() {
    const [bookings, setBookings] = useState([]);
    const [pagination, setPagination] = useState({});
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({ page: 1, status: "", startDate: "", endDate: "" });

    useEffect(() => {
        fetchBookings();
    }, [filters.page, filters.status]);

    const fetchBookings = async () => {
        try {
            setLoading(true);
            const params = { page: filters.page, limit: 10 };
            if (filters.status) params.status = filters.status;
            if (filters.startDate) params.startDate = filters.startDate;
            if (filters.endDate) params.endDate = filters.endDate;
            const res = await adminService.getBookings(params);
            setBookings(res.bookings);
            setPagination(res.pagination);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleConfirm = async (id) => {
        if (!window.confirm("Xác nhận duyệt đơn đặt sân này?")) return;
        try {
            await adminService.confirmBooking(id);
            fetchBookings();
        } catch (err) {
            alert(err?.response?.data?.message || err.message);
        }
    };

    const handleCancel = async (id) => {
        const reason = window.prompt("Lý do hủy đơn:");
        if (reason === null) return;
        try {
            await adminService.cancelBooking(id, reason);
            fetchBookings();
        } catch (err) {
            alert(err?.response?.data?.message || err.message);
        }
    };

    const handleFilterSubmit = (e) => {
        e.preventDefault();
        setFilters({ ...filters, page: 1 });
        fetchBookings();
    };

    const formatMoney = (num) => num?.toLocaleString("vi-VN") + "đ";

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-800">Quản lý Booking</h1>
                <p className="text-gray-500 mt-1">Xem, xác nhận và hủy đơn đặt sân</p>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                <form onSubmit={handleFilterSubmit} className="flex flex-wrap gap-3">
                    <select
                        value={filters.status}
                        onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}
                        className="px-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                    >
                        <option value="">Tất cả trạng thái</option>
                        <option value="PENDING">Chờ duyệt</option>
                        <option value="CONFIRMED">Đã xác nhận</option>
                        <option value="COMPLETED">Hoàn thành</option>
                        <option value="CANCELLED">Đã hủy</option>
                    </select>
                    <input
                        type="date" value={filters.startDate}
                        onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                        className="px-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                    />
                    <input
                        type="date" value={filters.endDate}
                        onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                        className="px-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                    />
                    <button type="submit" className="px-5 py-2 bg-primary/10 text-primary rounded-xl hover:bg-primary/20 font-medium text-sm">
                        Lọc
                    </button>
                </form>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center h-48">
                        <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent"></div>
                    </div>
                ) : bookings.length === 0 ? (
                    <div className="text-center py-12 text-gray-400">
                        <p className="text-lg">Chưa có đơn đặt sân nào</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="text-left py-3 px-4 font-medium text-gray-500">Mã đơn</th>
                                    <th className="text-left py-3 px-4 font-medium text-gray-500">Khách hàng</th>
                                    <th className="text-left py-3 px-4 font-medium text-gray-500">Sân</th>
                                    <th className="text-left py-3 px-4 font-medium text-gray-500">Ngày & Giờ</th>
                                    <th className="text-right py-3 px-4 font-medium text-gray-500">Tổng tiền</th>
                                    <th className="text-center py-3 px-4 font-medium text-gray-500">Thanh toán</th>
                                    <th className="text-center py-3 px-4 font-medium text-gray-500">Trạng thái</th>
                                    <th className="text-center py-3 px-4 font-medium text-gray-500">Hành động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {bookings.map((b) => (
                                    <tr key={b._id} className="border-b border-gray-50 hover:bg-gray-50/50">
                                        <td className="py-3 px-4 font-mono text-xs font-medium text-gray-700">{b.bookingCode}</td>
                                        <td className="py-3 px-4">
                                            <div>
                                                <p className="font-medium text-gray-800">{b.userId?.fullName || "N/A"}</p>
                                                <p className="text-xs text-gray-400">{b.userId?.email}</p>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4 text-gray-600">{b.courtId?.name || "N/A"}</td>
                                        <td className="py-3 px-4">
                                            <p className="font-medium text-gray-700">{b.bookingDate}</p>
                                            <p className="text-xs text-gray-400">{b.startTime} - {b.endTime}</p>
                                        </td>
                                        <td className="py-3 px-4 text-right font-bold text-gray-700">{formatMoney(b.totalPrice)}</td>
                                        <td className="py-3 px-4 text-center">
                                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${paymentColors[b.paymentStatus]}`}>
                                                {b.paymentStatus}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-center">
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[b.status]}`}>
                                                {b.status}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="flex items-center justify-center gap-1">
                                                {b.status === "PENDING" && (
                                                    <button onClick={() => handleConfirm(b._id)} className="p-2 hover:bg-green-50 rounded-lg text-green-600" title="Xác nhận">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                        </svg>
                                                    </button>
                                                )}
                                                {!["CANCELLED", "COMPLETED"].includes(b.status) && (
                                                    <button onClick={() => handleCancel(b._id)} className="p-2 hover:bg-red-50 rounded-lg text-red-500" title="Hủy">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                        </svg>
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {pagination.totalPages > 1 && (
                    <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
                        <span className="text-sm text-gray-500">
                            Trang {pagination.currentPage} / {pagination.totalPages} ({pagination.totalItems} đơn)
                        </span>
                        <div className="flex gap-2">
                            <button
                                disabled={pagination.currentPage <= 1}
                                onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
                                className="px-3 py-1.5 border rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50"
                            >
                                Trước
                            </button>
                            <button
                                disabled={pagination.currentPage >= pagination.totalPages}
                                onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
                                className="px-3 py-1.5 border rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50"
                            >
                                Sau
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
