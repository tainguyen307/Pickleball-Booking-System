// src/features/admin/pages/EquipmentManagement.jsx
import { useState, useEffect } from "react";
import adminService from "../../../services/adminService";

const statusColors = {
    AVAILABLE: "bg-green-100 text-green-700",
    IN_USE: "bg-blue-100 text-blue-700",
    DAMAGED: "bg-red-100 text-red-700",
    LOST: "bg-gray-100 text-gray-500",
};

const typeLabels = {
    PADDLE: "🏓 Vợt",
    BALL: "🟡 Bóng",
    ACCESSORY: "🎒 Phụ kiện",
};

const EquipmentFormModal = ({ equipment, onClose, onSave }) => {
    const [form, setForm] = useState({
        name: equipment?.name || "",
        type: equipment?.type || "PADDLE",
        description: equipment?.description || "",
        quantity: equipment?.quantity || "",
        rentalType: equipment?.rentalType || "HOUR",
        rentalPrice: equipment?.rentalPrice || "",
        image: equipment?.image || "",
    });
    const [saving, setSaving] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            if (equipment?._id) {
                await adminService.updateEquipment(equipment._id, form);
            } else {
                await adminService.createEquipment(form);
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
            <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-6 border-b">
                    <h2 className="text-lg font-bold text-gray-800">
                        {equipment?._id ? "Cập nhật Thiết bị" : "Nhập kho Thiết bị mới"}
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tên thiết bị *</label>
                        <input
                            type="text" required value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Loại *</label>
                            <select
                                value={form.type}
                                onChange={(e) => setForm({ ...form, type: e.target.value })}
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                            >
                                <option value="PADDLE">Vợt (Paddle)</option>
                                <option value="BALL">Bóng</option>
                                <option value="ACCESSORY">Phụ kiện</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Số lượng *</label>
                            <input
                                type="number" required min={0} value={form.quantity}
                                onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Tính phí theo *</label>
                            <select
                                value={form.rentalType}
                                onChange={(e) => setForm({ ...form, rentalType: e.target.value })}
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                            >
                                <option value="HOUR">Theo giờ</option>
                                <option value="TURN">Theo lượt</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Giá thuê (VNĐ) *</label>
                            <input
                                type="number" required min={0} value={form.rentalPrice}
                                onChange={(e) => setForm({ ...form, rentalPrice: e.target.value })}
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
                        <textarea
                            rows={2} value={form.description}
                            onChange={(e) => setForm({ ...form, description: e.target.value })}
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none resize-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Link ảnh (URL)</label>
                        <input
                            type="url" value={form.image} placeholder="https://..."
                            onChange={(e) => setForm({ ...form, image: e.target.value })}
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                        />
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 font-medium">
                            Hủy bỏ
                        </button>
                        <button type="submit" disabled={saving} className="flex-1 px-4 py-2.5 bg-primary text-white rounded-xl hover:bg-primary/90 font-medium disabled:opacity-50">
                            {saving ? "Đang lưu..." : equipment?._id ? "Cập nhật" : "Nhập kho"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const StockInModal = ({ equipment, onClose, onSave }) => {
    const [quantity, setQuantity] = useState("");
    const [saving, setSaving] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await adminService.stockIn(equipment._id, parseInt(quantity));
            onSave();
        } catch (err) {
            alert(err?.response?.data?.message || err.message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-sm">
                <div className="p-6 border-b">
                    <h2 className="text-lg font-bold text-gray-800">Nhập thêm kho</h2>
                    <p className="text-sm text-gray-500 mt-1">{equipment.name}</p>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Số lượng nhập thêm</label>
                        <input
                            type="number" required min={1} value={quantity}
                            onChange={(e) => setQuantity(e.target.value)}
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                            placeholder="Nhập số lượng..."
                        />
                        <p className="text-xs text-gray-400 mt-1">Hiện tại: {equipment.availableQuantity} / {equipment.quantity}</p>
                    </div>
                    <div className="flex gap-3">
                        <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 font-medium">
                            Hủy
                        </button>
                        <button type="submit" disabled={saving} className="flex-1 px-4 py-2.5 bg-primary text-white rounded-xl hover:bg-primary/90 font-medium disabled:opacity-50">
                            {saving ? "Đang xử lý..." : "Nhập kho"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default function EquipmentManagement() {
    const [equipments, setEquipments] = useState([]);
    const [pagination, setPagination] = useState({});
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [showStockIn, setShowStockIn] = useState(false);
    const [editingEquipment, setEditingEquipment] = useState(null);
    const [filters, setFilters] = useState({ page: 1, type: "", status: "", search: "" });

    useEffect(() => {
        fetchEquipments();
    }, [filters.page, filters.type, filters.status]);

    const fetchEquipments = async () => {
        try {
            setLoading(true);
            const params = { page: filters.page, limit: 10 };
            if (filters.type) params.type = filters.type;
            if (filters.status) params.status = filters.status;
            if (filters.search) params.search = filters.search;
            const res = await adminService.getEquipments(params);
            setEquipments(res.equipments);
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
        fetchEquipments();
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Bạn có chắc muốn xóa thiết bị này?")) return;
        try {
            await adminService.deleteEquipment(id);
            fetchEquipments();
        } catch (err) {
            alert(err?.response?.data?.message || err.message);
        }
    };

    const handleSaved = () => {
        setShowModal(false);
        setShowStockIn(false);
        setEditingEquipment(null);
        fetchEquipments();
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Quản lý Thiết bị</h1>
                    <p className="text-gray-500 mt-1">Quản lý kho vợt, bóng và phụ kiện pickleball</p>
                </div>
                <button
                    onClick={() => { setEditingEquipment(null); setShowModal(true); }}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl hover:bg-primary/90 font-medium shadow-sm"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Nhập kho mới
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                <form onSubmit={handleSearch} className="flex flex-wrap gap-3">
                    <input
                        type="text" placeholder="Tìm kiếm tên thiết bị..."
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
                        <option value="PADDLE">Vợt</option>
                        <option value="BALL">Bóng</option>
                        <option value="ACCESSORY">Phụ kiện</option>
                    </select>
                    <select
                        value={filters.status}
                        onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}
                        className="px-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                    >
                        <option value="">Tất cả trạng thái</option>
                        <option value="AVAILABLE">Sẵn sàng</option>
                        <option value="IN_USE">Đang dùng</option>
                        <option value="DAMAGED">Hỏng</option>
                        <option value="LOST">Thất lạc</option>
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
                ) : equipments.length === 0 ? (
                    <div className="text-center py-12 text-gray-400">
                        <p className="text-lg">Kho thiết bị trống</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="text-left py-3 px-4 font-medium text-gray-500">Thiết bị</th>
                                    <th className="text-left py-3 px-4 font-medium text-gray-500">Loại</th>
                                    <th className="text-center py-3 px-4 font-medium text-gray-500">Tồn kho</th>
                                    <th className="text-center py-3 px-4 font-medium text-gray-500">Khả dụng</th>
                                    <th className="text-right py-3 px-4 font-medium text-gray-500">Giá thuê</th>
                                    <th className="text-center py-3 px-4 font-medium text-gray-500">Tính phí</th>
                                    <th className="text-center py-3 px-4 font-medium text-gray-500">Trạng thái</th>
                                    <th className="text-center py-3 px-4 font-medium text-gray-500">Hành động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {equipments.map((eq) => (
                                    <tr key={eq._id} className="border-b border-gray-50 hover:bg-gray-50/50">
                                        <td className="py-3 px-4 font-medium text-gray-800">{eq.name}</td>
                                        <td className="py-3 px-4 text-gray-600">{typeLabels[eq.type] || eq.type}</td>
                                        <td className="py-3 px-4 text-center font-semibold text-gray-700">{eq.quantity}</td>
                                        <td className="py-3 px-4 text-center">
                                            <span className={`font-semibold ${eq.availableQuantity > 0 ? "text-green-600" : "text-red-500"}`}>
                                                {eq.availableQuantity}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-right font-medium text-gray-700">
                                            {eq.rentalPrice?.toLocaleString("vi-VN")}đ
                                        </td>
                                        <td className="py-3 px-4 text-center">
                                            <span className="px-2 py-1 rounded-lg text-xs font-medium bg-gray-100 text-gray-600">
                                                {eq.rentalType === "HOUR" ? "Theo giờ" : "Theo lượt"}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-center">
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[eq.status]}`}>
                                                {eq.status}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="flex items-center justify-center gap-1">
                                                <button onClick={() => { setEditingEquipment(eq); setShowModal(true); }} className="p-2 hover:bg-blue-50 rounded-lg text-blue-600" title="Sửa">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                    </svg>
                                                </button>
                                                <button onClick={() => { setEditingEquipment(eq); setShowStockIn(true); }} className="p-2 hover:bg-emerald-50 rounded-lg text-emerald-600" title="Nhập kho">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                                    </svg>
                                                </button>
                                                <button onClick={() => handleDelete(eq._id)} className="p-2 hover:bg-red-50 rounded-lg text-red-500" title="Xóa">
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

                {pagination.totalPages > 1 && (
                    <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
                        <span className="text-sm text-gray-500">
                            Trang {pagination.currentPage} / {pagination.totalPages} ({pagination.totalItems} thiết bị)
                        </span>
                        <div className="flex gap-2">
                            <button disabled={pagination.currentPage <= 1} onClick={() => setFilters({ ...filters, page: filters.page - 1 })} className="px-3 py-1.5 border rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50">Trước</button>
                            <button disabled={pagination.currentPage >= pagination.totalPages} onClick={() => setFilters({ ...filters, page: filters.page + 1 })} className="px-3 py-1.5 border rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50">Sau</button>
                        </div>
                    </div>
                )}
            </div>

            {showModal && (
                <EquipmentFormModal
                    equipment={editingEquipment}
                    onClose={() => { setShowModal(false); setEditingEquipment(null); }}
                    onSave={handleSaved}
                />
            )}
            {showStockIn && editingEquipment && (
                <StockInModal
                    equipment={editingEquipment}
                    onClose={() => { setShowStockIn(false); setEditingEquipment(null); }}
                    onSave={handleSaved}
                />
            )}
        </div>
    );
}
