// src/features/admin/pages/MaintenanceManagement.jsx
import { useState, useEffect } from "react";
import adminService from "../../../services/adminService";

const statusColors = {
    REPORTED: "bg-red-100 text-red-700",
    IN_PROGRESS: "bg-yellow-100 text-yellow-700",
    COMPLETED: "bg-green-100 text-green-700",
};

const severityColors = {
    LOW: "bg-blue-100 text-blue-700",
    MEDIUM: "bg-orange-100 text-orange-700",
    HIGH: "bg-red-100 text-red-700",
};

const MaintenanceFormModal = ({ onClose, onSave }) => {
    const [form, setForm] = useState({
        targetType: "COURT",
        targetId: "",
        title: "",
        description: "",
        severity: "LOW",
    });
    const [saving, setSaving] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await adminService.createMaintenance(form);
            onSave();
        } catch (err) {
            alert(err?.response?.data?.message || err.message || "Có lỗi xảy ra!");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-lg">
                <div className="flex items-center justify-between p-6 border-b">
                    <h2 className="text-lg font-bold text-gray-800">Tạo yêu cầu Bảo trì</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Đối tượng *</label>
                            <select
                                value={form.targetType}
                                onChange={(e) => setForm({ ...form, targetType: e.target.value })}
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                            >
                                <option value="COURT">Sân</option>
                                <option value="EQUIPMENT">Thiết bị</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Mức độ</label>
                            <select
                                value={form.severity}
                                onChange={(e) => setForm({ ...form, severity: e.target.value })}
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                            >
                                <option value="LOW">Thấp</option>
                                <option value="MEDIUM">Trung bình</option>
                                <option value="HIGH">Cao</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">ID Đối tượng *</label>
                        <input
                            type="text" required value={form.targetId} placeholder="Nhập ID sân hoặc thiết bị..."
                            onChange={(e) => setForm({ ...form, targetId: e.target.value })}
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tiêu đề *</label>
                        <input
                            type="text" required value={form.title} placeholder="Mô tả ngắn vấn đề..."
                            onChange={(e) => setForm({ ...form, title: e.target.value })}
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả chi tiết</label>
                        <textarea
                            rows={3} value={form.description}
                            onChange={(e) => setForm({ ...form, description: e.target.value })}
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none resize-none"
                            placeholder="Chi tiết hư hỏng, vị trí, tình trạng..."
                        />
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 font-medium">
                            Hủy bỏ
                        </button>
                        <button type="submit" disabled={saving} className="flex-1 px-4 py-2.5 bg-primary text-white rounded-xl hover:bg-primary/90 font-medium disabled:opacity-50">
                            {saving ? "Đang xử lý..." : "Tạo yêu cầu"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default function MaintenanceManagement() {
    const [records, setRecords] = useState([]);
    const [pagination, setPagination] = useState({});
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [filters, setFilters] = useState({ page: 1, targetType: "", status: "" });

    useEffect(() => {
        fetchMaintenance();
    }, [filters.page, filters.targetType, filters.status]);

    const fetchMaintenance = async () => {
        try {
            setLoading(true);
            const params = { page: filters.page, limit: 10 };
            if (filters.targetType) params.targetType = filters.targetType;
            if (filters.status) params.status = filters.status;
            const res = await adminService.getMaintenance(params);
            setRecords(res.records);
            setPagination(res.pagination);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (id, newStatus) => {
        try {
            await adminService.updateMaintenanceStatus(id, newStatus);
            fetchMaintenance();
        } catch (err) {
            alert(err?.response?.data?.message || err.message);
        }
    };

    const handleSaved = () => {
        setShowModal(false);
        fetchMaintenance();
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return "—";
        return new Date(dateStr).toLocaleDateString("vi-VN");
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Quản lý Bảo trì</h1>
                    <p className="text-gray-500 mt-1">Theo dõi và xử lý yêu cầu bảo trì sân & thiết bị</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl hover:bg-primary/90 font-medium shadow-sm"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Tạo yêu cầu
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                <div className="flex flex-wrap gap-3">
                    <select
                        value={filters.targetType}
                        onChange={(e) => setFilters({ ...filters, targetType: e.target.value, page: 1 })}
                        className="px-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                    >
                        <option value="">Tất cả đối tượng</option>
                        <option value="COURT">Sân</option>
                        <option value="EQUIPMENT">Thiết bị</option>
                    </select>
                    <select
                        value={filters.status}
                        onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}
                        className="px-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                    >
                        <option value="">Tất cả trạng thái</option>
                        <option value="REPORTED">Đã báo cáo</option>
                        <option value="IN_PROGRESS">Đang xử lý</option>
                        <option value="COMPLETED">Hoàn thành</option>
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center h-48">
                        <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent"></div>
                    </div>
                ) : records.length === 0 ? (
                    <div className="text-center py-12 text-gray-400">
                        <p className="text-lg">Chưa có yêu cầu bảo trì nào</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="text-left py-3 px-4 font-medium text-gray-500">Tiêu đề</th>
                                    <th className="text-center py-3 px-4 font-medium text-gray-500">Đối tượng</th>
                                    <th className="text-center py-3 px-4 font-medium text-gray-500">Mức độ</th>
                                    <th className="text-left py-3 px-4 font-medium text-gray-500">Ngày tạo</th>
                                    <th className="text-left py-3 px-4 font-medium text-gray-500">Ngày xong</th>
                                    <th className="text-left py-3 px-4 font-medium text-gray-500">Người tạo</th>
                                    <th className="text-center py-3 px-4 font-medium text-gray-500">Trạng thái</th>
                                    <th className="text-center py-3 px-4 font-medium text-gray-500">Hành động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {records.map((r) => (
                                    <tr key={r._id} className="border-b border-gray-50 hover:bg-gray-50/50">
                                        <td className="py-3 px-4">
                                            <p className="font-medium text-gray-800">{r.title}</p>
                                            {r.description && <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{r.description}</p>}
                                        </td>
                                        <td className="py-3 px-4 text-center">
                                            <span className="px-2 py-1 rounded-lg text-xs font-medium bg-gray-100 text-gray-600">
                                                {r.targetType === "COURT" ? "🏟️ Sân" : "🏓 Thiết bị"}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-center">
                                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${severityColors[r.severity]}`}>
                                                {r.severity}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-gray-600">{formatDate(r.maintenanceDate)}</td>
                                        <td className="py-3 px-4 text-gray-600">{formatDate(r.completedDate)}</td>
                                        <td className="py-3 px-4 text-gray-600 text-xs">{r.createdBy?.fullName || "—"}</td>
                                        <td className="py-3 px-4 text-center">
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[r.status]}`}>
                                                {r.status}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="flex items-center justify-center gap-1">
                                                {r.status === "REPORTED" && (
                                                    <button
                                                        onClick={() => handleStatusUpdate(r._id, "IN_PROGRESS")}
                                                        className="px-3 py-1.5 bg-yellow-50 text-yellow-700 rounded-lg text-xs font-medium hover:bg-yellow-100"
                                                    >
                                                        Bắt đầu
                                                    </button>
                                                )}
                                                {r.status === "IN_PROGRESS" && (
                                                    <button
                                                        onClick={() => handleStatusUpdate(r._id, "COMPLETED")}
                                                        className="px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-xs font-medium hover:bg-green-100"
                                                    >
                                                        Hoàn thành
                                                    </button>
                                                )}
                                                {r.status === "COMPLETED" && (
                                                    <span className="text-xs text-gray-400">✓ Done</span>
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
                            Trang {pagination.currentPage} / {pagination.totalPages} ({pagination.totalItems} yêu cầu)
                        </span>
                        <div className="flex gap-2">
                            <button disabled={pagination.currentPage <= 1} onClick={() => setFilters({ ...filters, page: filters.page - 1 })} className="px-3 py-1.5 border rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50">Trước</button>
                            <button disabled={pagination.currentPage >= pagination.totalPages} onClick={() => setFilters({ ...filters, page: filters.page + 1 })} className="px-3 py-1.5 border rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50">Sau</button>
                        </div>
                    </div>
                )}
            </div>

            {showModal && (
                <MaintenanceFormModal
                    onClose={() => setShowModal(false)}
                    onSave={handleSaved}
                />
            )}
        </div>
    );
}
