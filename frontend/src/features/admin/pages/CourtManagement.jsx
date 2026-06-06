// src/features/admin/pages/CourtManagement.jsx
import { useState, useEffect } from "react";
import adminService from "../../../services/adminService";

const statusColors = {
    AVAILABLE: "bg-green-100 text-green-700",
    MAINTENANCE: "bg-yellow-100 text-yellow-700",
    HIDDEN: "bg-gray-100 text-gray-500",
};

const CourtFormModal = ({ court, onClose, onSave }) => {
    const [form, setForm] = useState({
        name: court?.name || "",
        location: court?.location || "",
        address: court?.address || "",
        type: court?.type || "INDOOR",
        description: court?.description || "",
        pricePerHour: court?.pricePerHour || "",
        openTime: court?.openTime || "06:00",
        closeTime: court?.closeTime || "22:00",
        slotDuration: court?.slotDuration || 60,
        amenities: court?.amenities?.join(", ") || "",
    });
    const [files, setFiles] = useState([]);
    const [saving, setSaving] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const formData = new FormData();
            Object.entries(form).forEach(([key, value]) => formData.append(key, value));
            files.forEach((file) => formData.append("images", file));

            if (court?._id) {
                await adminService.updateCourt(court._id, formData);
            } else {
                await adminService.createCourt(formData);
            }
            onSave();
        } catch (err) {
            alert(err?.response?.data?.message || err.message || "Có lỗi xảy ra!");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-6 border-b">
                    <h2 className="text-lg font-bold text-gray-800">
                        {court?._id ? "Cập nhật Cụm sân" : "Thêm Cụm sân mới"}
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Tên sân *</label>
                            <input
                                type="text" required value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Khu vực *</label>
                            <input
                                type="text" required value={form.location}
                                onChange={(e) => setForm({ ...form, location: e.target.value })}
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ</label>
                        <input
                            type="text" value={form.address}
                            onChange={(e) => setForm({ ...form, address: e.target.value })}
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Loại sân *</label>
                            <select
                                value={form.type}
                                onChange={(e) => setForm({ ...form, type: e.target.value })}
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                            >
                                <option value="INDOOR">Indoor</option>
                                <option value="OUTDOOR">Outdoor</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Giá/giờ (VNĐ) *</label>
                            <input
                                type="number" required min={0} value={form.pricePerHour}
                                onChange={(e) => setForm({ ...form, pricePerHour: e.target.value })}
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Slot (phút)</label>
                            <input
                                type="number" min={30} value={form.slotDuration}
                                onChange={(e) => setForm({ ...form, slotDuration: e.target.value })}
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Giờ mở cửa</label>
                            <input
                                type="time" value={form.openTime}
                                onChange={(e) => setForm({ ...form, openTime: e.target.value })}
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Giờ đóng cửa</label>
                            <input
                                type="time" value={form.closeTime}
                                onChange={(e) => setForm({ ...form, closeTime: e.target.value })}
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
                        <textarea
                            rows={3} value={form.description}
                            onChange={(e) => setForm({ ...form, description: e.target.value })}
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none resize-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tiện ích (ngăn cách bởi dấu phẩy)</label>
                        <input
                            type="text" value={form.amenities} placeholder="Wi-Fi, Nhà vệ sinh, Bãi xe..."
                            onChange={(e) => setForm({ ...form, amenities: e.target.value })}
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Hình ảnh</label>
                        <input
                            type="file" accept="image/*" multiple
                            onChange={(e) => setFiles(Array.from(e.target.files))}
                            className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                        />
                        {court?.images?.length > 0 && (
                            <div className="flex gap-2 mt-2 flex-wrap">
                                {court.images.map((img, idx) => (
                                    <img key={idx} src={img.imageUrl} alt="" className="w-16 h-16 rounded-lg object-cover border" />
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            type="button" onClick={onClose}
                            className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 font-medium"
                        >
                            Hủy bỏ
                        </button>
                        <button
                            type="submit" disabled={saving}
                            className="flex-1 px-4 py-2.5 bg-primary text-white rounded-xl hover:bg-primary/90 font-medium disabled:opacity-50"
                        >
                            {saving ? "Đang lưu..." : court?._id ? "Cập nhật" : "Tạo mới"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default function CourtManagement() {
    const [courts, setCourts] = useState([]);
    const [pagination, setPagination] = useState({});
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingCourt, setEditingCourt] = useState(null);
    const [filters, setFilters] = useState({ page: 1, type: "", status: "", search: "" });

    useEffect(() => {
        fetchCourts();
    }, [filters.page, filters.type, filters.status]);

    const fetchCourts = async () => {
        try {
            setLoading(true);
            const params = { page: filters.page, limit: 10 };
            if (filters.type) params.type = filters.type;
            if (filters.status) params.status = filters.status;
            if (filters.search) params.search = filters.search;
            const res = await adminService.getCourts(params);
            setCourts(res.courts);
            setPagination(res.pagination);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        setFilters({ ...filters, page: 1 });
        fetchCourts();
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Bạn có chắc muốn ẩn cụm sân này?")) return;
        try {
            await adminService.deleteCourt(id);
            fetchCourts();
        } catch (err) {
            alert(err?.response?.data?.message || err.message);
        }
    };

    const handleBlock = async (id) => {
        try {
            await adminService.blockCourt(id);
            fetchCourts();
        } catch (err) {
            alert(err?.response?.data?.message || err.message);
        }
    };

    const openEdit = (court) => {
        setEditingCourt(court);
        setShowModal(true);
    };

    const openCreate = () => {
        setEditingCourt(null);
        setShowModal(true);
    };

    const handleSaved = () => {
        setShowModal(false);
        setEditingCourt(null);
        fetchCourts();
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Quản lý Sân</h1>
                    <p className="text-gray-500 mt-1">Thêm, sửa, xóa và quản lý trạng thái cụm sân</p>
                </div>
                <button
                    onClick={openCreate}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl hover:bg-primary/90 font-medium shadow-sm"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Thêm sân mới
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                <form onSubmit={handleSearch} className="flex flex-wrap gap-3">
                    <input
                        type="text" placeholder="Tìm kiếm tên sân, khu vực..."
                        value={filters.search}
                        onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                        className="flex-1 min-w-[200px] px-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                    />
                    <select
                        value={filters.type}
                        onChange={(e) => setFilters({ ...filters, type: e.target.value, page: 1 })}
                        className="px-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                    >
                        <option value="">Tất cả loại</option>
                        <option value="INDOOR">Indoor</option>
                        <option value="OUTDOOR">Outdoor</option>
                    </select>
                    <select
                        value={filters.status}
                        onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}
                        className="px-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                    >
                        <option value="">Tất cả trạng thái</option>
                        <option value="AVAILABLE">Hoạt động</option>
                        <option value="MAINTENANCE">Bảo trì</option>
                        <option value="HIDDEN">Đã ẩn</option>
                    </select>
                    <button type="submit" className="px-5 py-2 bg-primary/10 text-primary rounded-xl hover:bg-primary/20 font-medium text-sm">
                        Tìm kiếm
                    </button>
                </form>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center h-48">
                        <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent"></div>
                    </div>
                ) : courts.length === 0 ? (
                    <div className="text-center py-12 text-gray-400">
                        <p className="text-lg">Chưa có dữ liệu sân</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="text-left py-3 px-4 font-medium text-gray-500">Sân</th>
                                    <th className="text-left py-3 px-4 font-medium text-gray-500">Khu vực</th>
                                    <th className="text-left py-3 px-4 font-medium text-gray-500">Loại</th>
                                    <th className="text-right py-3 px-4 font-medium text-gray-500">Giá/giờ</th>
                                    <th className="text-center py-3 px-4 font-medium text-gray-500">Trạng thái</th>
                                    <th className="text-center py-3 px-4 font-medium text-gray-500">Hành động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {courts.map((court) => (
                                    <tr key={court._id} className="border-b border-gray-50 hover:bg-gray-50/50">
                                        <td className="py-3 px-4">
                                            <div className="flex items-center gap-3">
                                                {court.images?.[0]?.imageUrl ? (
                                                    <img src={court.images[0].imageUrl} alt="" className="w-10 h-10 rounded-lg object-cover" />
                                                ) : (
                                                    <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400">🏟️</div>
                                                )}
                                                <span className="font-medium text-gray-800">{court.name}</span>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4 text-gray-600">{court.location}</td>
                                        <td className="py-3 px-4">
                                            <span className={`px-2 py-1 rounded-lg text-xs font-medium ${court.type === "INDOOR" ? "bg-blue-50 text-blue-600" : "bg-orange-50 text-orange-600"}`}>
                                                {court.type}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-right font-medium text-gray-700">
                                            {court.pricePerHour?.toLocaleString("vi-VN")}đ
                                        </td>
                                        <td className="py-3 px-4 text-center">
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[court.status]}`}>
                                                {court.status}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="flex items-center justify-center gap-1">
                                                <button onClick={() => openEdit(court)} className="p-2 hover:bg-blue-50 rounded-lg text-blue-600" title="Sửa">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                    </svg>
                                                </button>
                                                <button onClick={() => handleBlock(court._id)} className="p-2 hover:bg-yellow-50 rounded-lg text-yellow-600" title="Bảo trì / Mở">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    </svg>
                                                </button>
                                                <button onClick={() => handleDelete(court._id)} className="p-2 hover:bg-red-50 rounded-lg text-red-500" title="Ẩn sân">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                    <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
                        <span className="text-sm text-gray-500">
                            Trang {pagination.currentPage} / {pagination.totalPages} ({pagination.totalItems} sân)
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

            {/* Modal */}
            {showModal && (
                <CourtFormModal
                    court={editingCourt}
                    onClose={() => { setShowModal(false); setEditingCourt(null); }}
                    onSave={handleSaved}
                />
            )}
        </div>
    );
}
