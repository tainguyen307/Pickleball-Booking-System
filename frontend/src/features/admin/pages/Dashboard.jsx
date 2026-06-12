import { useEffect, useState } from "react";
import adminService from "../../../services/adminService";

const StatCard = ({ title, value, icon, color, subtext }) => (
    <div className="admin-card p-6">
        <div className="flex items-start justify-between gap-4">
            <div>
                <p className="text-sm font-semibold text-gray-500">{title}</p>
                <p className="mt-2 text-3xl font-black tracking-tight text-gray-900">{value}</p>
                {subtext && <p className="mt-2 text-xs leading-5 text-gray-500">{subtext}</p>}
            </div>
            <div className={`grid h-12 w-12 place-items-center rounded-2xl ${color}`}>
                <span className="material-symbols-outlined text-[24px]">{icon}</span>
            </div>
        </div>
    </div>
);

const StatusBadge = ({ status, count }) => {
    const colors = {
        PENDING: "bg-amber-50 text-amber-700 border-amber-200",
        CONFIRMED: "bg-blue-50 text-blue-700 border-blue-200",
        COMPLETED: "bg-emerald-50 text-emerald-700 border-emerald-200",
        CANCELLED: "bg-red-50 text-red-700 border-red-200",
    };
    return (
        <div className="flex items-center justify-between gap-3 py-2">
            <span className={`rounded-full border px-3 py-1 text-xs font-bold ${colors[status] || "border-gray-200 bg-gray-50 text-gray-600"}`}>
                {status}
            </span>
            <span className="text-sm font-black text-gray-800">{count}</span>
        </div>
    );
};

export default function Dashboard() {
    const [stats, setStats] = useState(null);
    const [revenueData, setRevenueData] = useState(null);
    const [peakHours, setPeakHours] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
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

        fetchDashboardData();
    }, []);

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="h-9 w-64 animate-pulse rounded-xl bg-gray-200" />
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {[1, 2, 3, 4].map(item => <div key={item} className="h-36 animate-pulse rounded-2xl bg-white" />)}
                </div>
            </div>
        );
    }

    const formatMoney = (num) => num ? num.toLocaleString("vi-VN") + "đ" : "0đ";

    return (
        <div className="space-y-8">
            <div>
                <h1 className="admin-page-title">Dashboard tổng quan</h1>
                <p className="admin-page-subtitle">Theo dõi doanh thu, booking, dòng tiền và hiệu suất sân.</p>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard title="Tổng số sân" value={stats?.totalCourts || 0} icon="sports_tennis" color="bg-primary-container text-primary" />
                <StatCard title="Tổng booking" value={stats?.totalBookings || 0} icon="event_available" color="bg-blue-50 text-blue-600" />
                <StatCard
                    title="Tổng doanh thu"
                    value={formatMoney(stats?.totalRevenue)}
                    icon="payments"
                    color="bg-amber-50 text-amber-600"
                    subtext={`Sân: ${formatMoney(stats?.courtRevenue)} | Thiết bị: ${formatMoney(stats?.equipmentRevenue)}`}
                />
                <StatCard
                    title="Người dùng"
                    value={stats?.totalUsers || 0}
                    icon="group"
                    color="bg-gray-100 text-gray-700"
                    subtext={`${stats?.newReviewCount || 0} đánh giá mới trong 30 ngày`}
                />
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <div className="admin-card p-6">
                    <h3 className="text-sm font-black text-gray-800">Tỷ lệ lấp đầy sân</h3>
                    <div className="mt-5 flex items-center gap-5">
                        <div className="grid h-24 w-24 place-items-center rounded-full border-[10px] border-primary-container text-xl font-black text-primary">
                            {stats?.occupancyRate || 0}%
                        </div>
                        <div className="text-sm text-gray-500">
                            <p><span className="font-black text-gray-800">{stats?.bookedSlots || 0}</span> slot đã đặt</p>
                            <p><span className="font-black text-gray-800">{stats?.totalSlots || 0}</span> tổng slot</p>
                        </div>
                    </div>
                </div>

                <div className="admin-card p-6">
                    <h3 className="text-sm font-black text-gray-800">Trạng thái booking</h3>
                    <div className="mt-4 space-y-1">
                        {stats?.bookingStatusBreakdown?.length ? stats.bookingStatusBreakdown.map(item => (
                            <StatusBadge key={item._id} status={item._id} count={item.count} />
                        )) : <p className="py-4 text-center text-sm text-gray-400">Chưa có dữ liệu</p>}
                    </div>
                </div>

                <div className="admin-card p-6">
                    <h3 className="text-sm font-black text-gray-800">Giờ cao điểm</h3>
                    <div className="mt-4 space-y-3">
                        {peakHours?.peakHours?.slice(0, 5).map((item, idx) => (
                            <div key={item._id} className="flex items-center gap-3">
                                <span className="grid h-7 w-7 place-items-center rounded-full bg-primary-container text-xs font-black text-primary">{idx + 1}</span>
                                <span className="flex-1 text-sm font-bold text-gray-700">{item._id}</span>
                                <span className="text-sm font-black text-primary">{item.count} lượt</span>
                            </div>
                        ))}
                        {(!peakHours?.peakHours || peakHours.peakHours.length === 0) && (
                            <p className="py-4 text-center text-sm text-gray-400">Chưa có dữ liệu</p>
                        )}
                    </div>
                </div>
            </div>

            <div className="admin-card overflow-hidden">
                <div className="border-b border-gray-100 px-6 py-5">
                    <h3 className="text-sm font-black text-gray-800">Doanh thu 30 ngày gần nhất</h3>
                </div>
                {revenueData?.data?.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="table-head-cell">Ngày</th>
                                    <th className="table-head-cell text-right">Booking</th>
                                    <th className="table-head-cell text-right">Doanh thu sân</th>
                                    <th className="table-head-cell text-right">Thiết bị</th>
                                    <th className="table-head-cell text-right">Tổng</th>
                                </tr>
                            </thead>
                            <tbody>
                                {revenueData.data.map(row => (
                                    <tr key={row._id} className="border-t border-gray-100 hover:bg-gray-50/70">
                                        <td className="px-4 py-3 font-bold text-gray-800">{row._id}</td>
                                        <td className="px-4 py-3 text-right text-gray-600">{row.bookingCount}</td>
                                        <td className="px-4 py-3 text-right text-gray-600">{formatMoney(row.courtRevenue)}</td>
                                        <td className="px-4 py-3 text-right text-gray-600">{formatMoney(row.equipmentRevenue)}</td>
                                        <td className="px-4 py-3 text-right font-black text-primary">{formatMoney(row.totalRevenue)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p className="py-10 text-center text-sm text-gray-400">Chưa có dữ liệu doanh thu trong 30 ngày qua</p>
                )}
            </div>
        </div>
    );
}
