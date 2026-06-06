// src/features/admin/pages/Dashboard.jsx
import { useState, useEffect } from "react";
import adminService from "../../../services/adminService";

const StatCard = ({ title, value, icon, color, subtext }) => (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between">
            <div>
                <p className="text-sm text-gray-500 font-medium">{title}</p>
                <p className="text-3xl font-bold mt-2 text-gray-800">{value}</p>
                {subtext && <p className="text-xs text-gray-400 mt-1">{subtext}</p>}
            </div>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl ${color}`}>
                {icon}
            </div>
        </div>
    </div>
);

const StatusBadge = ({ status, count }) => {
    const colors = {
        PENDING: "bg-yellow-100 text-yellow-700",
        CONFIRMED: "bg-blue-100 text-blue-700",
        COMPLETED: "bg-green-100 text-green-700",
        CANCELLED: "bg-red-100 text-red-700",
    };
    return (
        <div className="flex items-center justify-between py-2">
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${colors[status] || "bg-gray-100 text-gray-600"}`}>
                {status}
            </span>
            <span className="text-sm font-bold text-gray-700">{count}</span>
        </div>
    );
};

export default function Dashboard() {
    const [stats, setStats] = useState(null);
    const [revenueData, setRevenueData] = useState(null);
    const [peakHours, setPeakHours] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const [dashRes, revRes, peakRes] = await Promise.all([
                adminService.getDashboardStats(),
                adminService.getRevenueStats(),
                adminService.getPeakHours(),
            ]);
            setStats(dashRes);
            setRevenueData(revRes);
            setPeakHours(peakRes);
        } catch (err) {
            console.error("Dashboard error:", err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent"></div>
            </div>
        );
    }

    const formatMoney = (num) =>
        num ? num.toLocaleString("vi-VN") + "đ" : "0đ";

    return (
        <div className="space-y-8">
            {/* Page Title */}
            <div>
                <h1 className="text-2xl font-bold text-gray-800">Dashboard Tổng Quan</h1>
                <p className="text-gray-500 mt-1">Thống kê hoạt động hệ thống Pickleball</p>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Tổng số Sân"
                    value={stats?.totalCourts || 0}
                    icon="🏟️"
                    color="bg-emerald-50"
                />
                <StatCard
                    title="Tổng Booking"
                    value={stats?.totalBookings || 0}
                    icon="📋"
                    color="bg-blue-50"
                />
                <StatCard
                    title="Tổng Doanh Thu"
                    value={formatMoney(stats?.totalRevenue)}
                    icon="💰"
                    color="bg-amber-50"
                    subtext={`Sân: ${formatMoney(stats?.courtRevenue)} | Thiết bị: ${formatMoney(stats?.equipmentRevenue)}`}
                />
                <StatCard
                    title="Người dùng"
                    value={stats?.totalUsers || 0}
                    icon="👥"
                    color="bg-purple-50"
                />
            </div>

            {/* Second Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Tỷ lệ lấp đầy */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Tỷ lệ lấp đầy sân</h3>
                    <div className="flex items-center gap-4">
                        <div className="relative w-24 h-24">
                            <svg className="w-24 h-24 -rotate-90" viewBox="0 0 36 36">
                                <path
                                    className="text-gray-100"
                                    d="M18 2.0845a 15.9155 15.9155 0 0 1 0 31.831 15.9155 15.9155 0 0 1 0 -31.831"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="3"
                                />
                                <path
                                    className="text-emerald-500"
                                    d="M18 2.0845a 15.9155 15.9155 0 0 1 0 31.831 15.9155 15.9155 0 0 1 0 -31.831"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="3"
                                    strokeDasharray={`${stats?.occupancyRate || 0}, 100`}
                                />
                            </svg>
                            <span className="absolute inset-0 flex items-center justify-center text-xl font-bold text-gray-800">
                                {stats?.occupancyRate || 0}%
                            </span>
                        </div>
                        <div className="text-sm text-gray-500">
                            <p><span className="font-semibold text-gray-700">{stats?.bookedSlots || 0}</span> slot đã đặt</p>
                            <p>/ <span className="font-semibold text-gray-700">{stats?.totalSlots || 0}</span> tổng slot</p>
                        </div>
                    </div>
                </div>

                {/* Booking Status Breakdown */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Trạng thái Booking</h3>
                    <div className="space-y-1">
                        {stats?.bookingStatusBreakdown?.map((item) => (
                            <StatusBadge key={item._id} status={item._id} count={item.count} />
                        ))}
                        {(!stats?.bookingStatusBreakdown || stats.bookingStatusBreakdown.length === 0) && (
                            <p className="text-sm text-gray-400 text-center py-4">Chưa có dữ liệu</p>
                        )}
                    </div>
                </div>

                {/* Peak Hours */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Giờ cao điểm</h3>
                    <div className="space-y-2">
                        {peakHours?.peakHours?.slice(0, 5).map((item, idx) => (
                            <div key={item._id} className="flex items-center gap-3">
                                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${idx === 0 ? "bg-amber-100 text-amber-700" : "bg-gray-100 text-gray-500"}`}>
                                    {idx + 1}
                                </span>
                                <span className="text-sm font-medium text-gray-700 flex-1">{item._id}</span>
                                <span className="text-sm font-bold text-primary">{item.count} lượt</span>
                            </div>
                        ))}
                        {(!peakHours?.peakHours || peakHours.peakHours.length === 0) && (
                            <p className="text-sm text-gray-400 text-center py-4">Chưa có dữ liệu</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Revenue Chart Area */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Doanh thu 30 ngày gần nhất</h3>
                {revenueData?.data?.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-gray-100">
                                    <th className="text-left py-3 px-2 text-gray-500 font-medium">Ngày</th>
                                    <th className="text-right py-3 px-2 text-gray-500 font-medium">Số booking</th>
                                    <th className="text-right py-3 px-2 text-gray-500 font-medium">Doanh thu sân</th>
                                    <th className="text-right py-3 px-2 text-gray-500 font-medium">Doanh thu thiết bị</th>
                                    <th className="text-right py-3 px-2 text-gray-500 font-medium">Tổng</th>
                                </tr>
                            </thead>
                            <tbody>
                                {revenueData.data.map((row) => (
                                    <tr key={row._id} className="border-b border-gray-50 hover:bg-gray-50/50">
                                        <td className="py-3 px-2 font-medium text-gray-700">{row._id}</td>
                                        <td className="py-3 px-2 text-right text-gray-600">{row.bookingCount}</td>
                                        <td className="py-3 px-2 text-right text-gray-600">{formatMoney(row.courtRevenue)}</td>
                                        <td className="py-3 px-2 text-right text-gray-600">{formatMoney(row.equipmentRevenue)}</td>
                                        <td className="py-3 px-2 text-right font-bold text-primary">{formatMoney(row.totalRevenue)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p className="text-sm text-gray-400 text-center py-8">Chưa có dữ liệu doanh thu trong 30 ngày qua</p>
                )}
            </div>
        </div>
    );
}
