import { useEffect, useState } from "react";
import { vendorService } from "@/services/vendor.service";

export default function VendorDashboard() {
    const [stats, setStats] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        vendorService.getStats()
            .then(res => {
                if (res.success) {
                    setStats(res.stats);
                }
            })
            .catch(err => {
                setError(err.response?.data?.message || "Không thể tải số liệu thống kê!");
            })
            .finally(() => {
                setIsLoading(false);
            });
    }, []);

    if (isLoading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50/50 border border-red-200/50 text-red-700 p-4 rounded-xl text-xs font-semibold">
                {error}
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="admin-page-title">Tổng quan cung cấp</h1>
                <p className="admin-page-subtitle">Số liệu hiệu suất cung ứng dụng cụ thiết bị cho hệ thống.</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="admin-card p-6 flex items-center gap-4">
                    <div className="p-2.5 bg-purple-500/8 rounded-xl text-purple-600 shrink-0">
                        <span className="material-symbols-outlined text-[22px]">assignment</span>
                    </div>
                    <div className="min-w-0">
                        <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Tổng đơn yêu cầu</p>
                        <h3 className="text-xl font-bold text-zinc-900 mt-1 leading-none">{stats?.totalOrders || 0} đơn</h3>
                    </div>
                </div>

                <div className="admin-card p-6 flex items-center gap-4">
                    <div className="p-2.5 bg-amber-500/8 rounded-xl text-amber-600 shrink-0">
                        <span className="material-symbols-outlined text-[22px]">pending_actions</span>
                    </div>
                    <div className="min-w-0">
                        <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Chờ xác nhận</p>
                        <h3 className="text-xl font-bold text-zinc-900 mt-1 leading-none">{stats?.pendingOrdersCount || 0} đơn</h3>
                    </div>
                </div>

                <div className="admin-card p-6 flex items-center gap-4">
                    <div className="p-2.5 bg-blue-500/8 rounded-xl text-blue-600 shrink-0">
                        <span className="material-symbols-outlined text-[22px]">thumbs_up_down</span>
                    </div>
                    <div className="min-w-0">
                        <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Đã xác nhận</p>
                        <h3 className="text-xl font-bold text-zinc-900 mt-1 leading-none">{stats?.confirmedOrdersCount || 0} đơn</h3>
                    </div>
                </div>

                <div className="admin-card p-6 flex items-center gap-4">
                    <div className="p-2.5 bg-primary/8 rounded-xl text-primary shrink-0">
                        <span className="material-symbols-outlined text-[22px]">local_shipping</span>
                    </div>
                    <div className="min-w-0">
                        <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Đã giao thành công</p>
                        <h3 className="text-xl font-bold text-zinc-900 mt-1 leading-none">{(stats?.totalSuppliedQuantity || 0).toLocaleString("vi-VN")} chiếc</h3>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Chi tiết thống kê */}
                <div className="admin-card p-6 space-y-6">
                    <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider border-b pb-3 border-zinc-100">Chi tiết trạng thái đơn</h3>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center text-xs font-semibold">
                            <span className="text-zinc-500">Đơn hoàn thành (đã giao):</span>
                            <span className="text-emerald-600 font-bold">{stats?.completedOrdersCount || 0} đơn</span>
                        </div>
                        <div className="flex justify-between items-center text-xs font-semibold">
                            <span className="text-zinc-500">Đơn đang xác nhận:</span>
                            <span className="text-blue-600 font-bold">{stats?.confirmedOrdersCount || 0} đơn</span>
                        </div>
                        <div className="flex justify-between items-center text-xs font-semibold">
                            <span className="text-zinc-500">Đơn chờ tiếp nhận:</span>
                            <span className="text-amber-500 font-bold">{stats?.pendingOrdersCount || 0} đơn</span>
                        </div>
                        <div className="border-t border-zinc-100 pt-4 flex justify-between items-center text-xs font-bold">
                            <span className="text-zinc-900">Tổng dụng cụ đã cung cấp:</span>
                            <span className="text-primary text-base font-bold">{(stats?.totalSuppliedQuantity || 0).toLocaleString("vi-VN")} cái</span>
                        </div>
                    </div>
                </div>

                {/* Biểu đồ số lượng theo tháng */}
                <div className="lg:col-span-2 admin-card p-6 flex flex-col justify-between">
                    <div>
                        <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider border-b pb-3 border-zinc-100">Số lượng thiết bị giao theo tháng</h3>
                    </div>

                    {!stats?.monthlyRevenue || stats?.monthlyRevenue?.length === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center py-12 text-zinc-400 text-xs">
                            <span className="material-symbols-outlined text-3xl mb-2">bar_chart</span>
                            Chưa có dữ liệu dụng cụ bàn giao trong năm nay.
                        </div>
                    ) : (
                        <div className="mt-6 flex flex-col gap-4">
                            {stats?.monthlyRevenue?.map((item, idx) => {
                                const maxQuantity = Math.max(...stats.monthlyRevenue.map(m => m.revenue), 1);
                                const percentage = Math.round((item.revenue / maxQuantity) * 100);
                                return (
                                    <div key={idx} className="space-y-1">
                                        <div className="flex justify-between text-[11px] font-bold">
                                            <span className="text-zinc-500">{item.month}</span>
                                            <span className="text-zinc-800 font-bold">{item.revenue} cái ({item.bookings} đơn)</span>
                                        </div>
                                        <div className="h-2 bg-zinc-100 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-primary rounded-full transition-all duration-500"
                                                style={{ width: `${percentage}%` }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
