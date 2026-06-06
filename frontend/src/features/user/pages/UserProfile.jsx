// src/features/user/pages/UserProfile.jsx
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { userService } from "@/services/user.service";

// ─── Màu sắc trạng thái đơn đặt sân ──────────────────────────────────────────
const statusConfig = {
    PENDING: { label: "Chờ duyệt", cls: "bg-amber-100 text-amber-700 border border-amber-200" },
    CONFIRMED: { label: "Đã xác nhận", cls: "bg-blue-100 text-blue-700 border border-blue-200" },
    COMPLETED: { label: "Hoàn thành", cls: "bg-emerald-100 text-emerald-700 border border-emerald-200" },
    CANCELLED: { label: "Đã hủy", cls: "bg-red-100 text-red-700 border border-red-200" },
};

const paymentConfig = {
    UNPAID: { label: "Chưa thanh toán", cls: "bg-orange-100 text-orange-700" },
    PAID: { label: "Đã thanh toán", cls: "bg-green-100 text-green-700" },
    REFUNDED: { label: "Đã hoàn tiền", cls: "bg-purple-100 text-purple-700" },
};

// ─── Sub-component: Booking Card ──────────────────────────────────────────────
function BookingCard({ booking, onCancel }) {
    const status = statusConfig[booking.status] || { label: booking.status, cls: "bg-gray-100 text-gray-600" };
    const payment = paymentConfig[booking.paymentStatus] || { label: booking.paymentStatus, cls: "bg-gray-100 text-gray-600" };
    const canCancel = !["CANCELLED", "COMPLETED"].includes(booking.status);
    const formatMoney = (n) => n?.toLocaleString("vi-VN") + "đ";

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden group">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3.5 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
                <div className="flex items-center gap-2.5">
                    <span className="text-xs font-mono font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-lg">
                        #{booking.bookingCode}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${status.cls}`}>
                        {status.label}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${payment.cls}`}>
                        {payment.label}
                    </span>
                </div>
                {canCancel && (
                    <button
                        onClick={() => onCancel(booking._id)}
                        className="text-xs text-red-400 hover:text-red-600 font-semibold opacity-0 group-hover:opacity-100 transition-all px-2 py-1 rounded-lg hover:bg-red-50"
                    >
                        Hủy đơn
                    </button>
                )}
            </div>

            {/* Body */}
            <div className="px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="material-symbols-outlined text-primary text-[20px]">sports_tennis</span>
                    </div>
                    <div>
                        <p className="font-bold text-gray-800 text-sm">{booking.courtId?.name || "Sân Pickleball"}</p>
                        <p className="text-xs text-gray-500 mt-0.5">
                            <span className="font-medium text-gray-700">{booking.bookingDate}</span>
                            {" · "}
                            <span>{booking.startTime} – {booking.endTime}</span>
                        </p>
                        {booking.equipmentItems?.length > 0 && (
                            <p className="text-xs text-primary/70 mt-1">
                                🎾 +{booking.equipmentItems.length} thiết bị thuê kèm
                            </p>
                        )}
                    </div>
                </div>
                <div className="text-right sm:flex-shrink-0">
                    <p className="text-lg font-black text-primary">{formatMoney(booking.totalPrice)}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">Tổng chi phí</p>
                </div>
            </div>
        </div>
    );
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function UserProfile() {
    const navigate = useNavigate();
    const { user: storeUser, accessToken, setAuth, clearAuth } = useAuthStore();

    const [activeTab, setActiveTab] = useState("profile");
    const [profileData, setProfileData] = useState(null);
    const [bookings, setBookings] = useState([]);
    const [loadingProfile, setLoadingProfile] = useState(true);
    const [loadingBookings, setLoadingBookings] = useState(true);
    const [saving, setSaving] = useState(false);
    const [successMsg, setSuccessMsg] = useState("");
    const [errorMsg, setErrorMsg] = useState("");

    // Edit form state
    const [editForm, setEditForm] = useState({ fullName: "", phone: "" });
    const [avatarPreview, setAvatarPreview] = useState(null);
    const [avatarFile, setAvatarFile] = useState(null);
    const fileInputRef = useRef(null);

    // ── Fetch profile ──
    useEffect(() => {
        userService.getMyProfile()
            .then(res => {
                if (res?.success && res.user) {
                    setProfileData(res.user);
                    setEditForm({ fullName: res.user.fullName || "", phone: res.user.phone || "" });
                }
            })
            .catch(err => {
                console.error("Profile error:", err);
                // Fallback sang authStore nếu API lỗi
                if (storeUser) {
                    setProfileData(storeUser);
                    setEditForm({ fullName: storeUser.fullName || "", phone: storeUser.phone || "" });
                }
            })
            .finally(() => setLoadingProfile(false));
    }, []);

    // ── Fetch bookings ──
    useEffect(() => {
        if (activeTab !== "bookings") return;
        setLoadingBookings(true);
        userService.getMyBookings()
            .then(res => {
                if (res?.success) setBookings(res.bookings || []);
            })
            .catch(err => console.error("Bookings error:", err))
            .finally(() => setLoadingBookings(false));
    }, [activeTab]);

    // ── Handlers ──
    const handleAvatarChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setAvatarFile(file);
        setAvatarPreview(URL.createObjectURL(file));
    };

    const handleSaveProfile = async (e) => {
        e.preventDefault();
        setSaving(true);
        setSuccessMsg("");
        setErrorMsg("");
        try {
            const form = new FormData();
            form.append("fullName", editForm.fullName);
            form.append("phone", editForm.phone);
            if (avatarFile) form.append("avatar", avatarFile);

            const res = await userService.updateMyProfile(form);
            if (res?.success && res.user) {
                setProfileData(res.user);
                // Cập nhật authStore để navbar phản ánh ngay
                setAuth(res.user, accessToken);
                setSuccessMsg("✅ Cập nhật hồ sơ thành công!");
                setAvatarFile(null);
                setAvatarPreview(null);
            }
        } catch (err) {
            setErrorMsg(err?.response?.data?.message || "Cập nhật thất bại. Vui lòng thử lại!");
        } finally {
            setSaving(false);
        }
    };

    const handleCancelBooking = async (bookingId) => {
        const reason = window.prompt("Lý do hủy đơn (tùy chọn):");
        if (reason === null) return; // Bấm Cancel trên prompt
        try {
            await userService.cancelMyBooking(bookingId, reason || "Khách hàng tự hủy");
            setBookings(prev => prev.map(b =>
                b._id === bookingId ? { ...b, status: "CANCELLED" } : b
            ));
        } catch (err) {
            alert(err?.response?.data?.message || "Không thể hủy đơn này!");
        }
    };

    const handleLogout = () => {
        clearAuth();
        localStorage.removeItem("refreshToken");
        navigate("/login");
    };

    const displayUser = profileData || storeUser;
    const avatarSrc = avatarPreview || displayUser?.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${displayUser?.fullName || "user"}`;

    // ── Booking stats ──
    const bookingStats = {
        total: bookings.length,
        completed: bookings.filter(b => b.status === "COMPLETED").length,
        pending: bookings.filter(b => b.status === "PENDING").length,
        cancelled: bookings.filter(b => b.status === "CANCELLED").length,
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary/5 pt-8 pb-16">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* ─── Hero Card ─────────────────────────────────────── */}
                <div className="relative bg-gradient-to-r from-[#003d1a] via-[#005c26] to-[#008040] rounded-3xl overflow-hidden shadow-2xl shadow-green-900/20 mb-8">
                    {/* Decorative blobs */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3" />
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/4" />

                    <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-end gap-6 px-8 pt-8 pb-6">
                        {/* Avatar */}
                        <div className="relative group">
                            <div className="w-24 h-24 rounded-2xl overflow-hidden border-4 border-white/30 shadow-xl">
                                <img
                                    src={avatarSrc}
                                    alt="Avatar"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="absolute inset-0 bg-black/40 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                            >
                                <span className="material-symbols-outlined text-white text-[22px]">photo_camera</span>
                            </button>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleAvatarChange}
                            />
                        </div>

                        {/* Info */}
                        <div className="text-center sm:text-left flex-1">
                            {loadingProfile ? (
                                <div className="animate-pulse space-y-2">
                                    <div className="h-7 bg-white/20 rounded w-48" />
                                    <div className="h-4 bg-white/10 rounded w-32" />
                                </div>
                            ) : (
                                <>
                                    <h1 className="text-2xl font-black text-white tracking-tight">
                                        {displayUser?.fullName || "Người dùng"}
                                    </h1>
                                    <p className="text-emerald-200/80 text-sm mt-0.5">{displayUser?.email}</p>
                                    <div className="flex items-center justify-center sm:justify-start gap-2 mt-2">
                                        <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-300 text-xs font-semibold rounded-full border border-emerald-500/30">
                                            {displayUser?.role === "ADMIN" ? "🛡️ Admin" : "🎾 Player"}
                                        </span>
                                        <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full border ${
                                            displayUser?.status === "ACTIVE"
                                                ? "bg-green-500/20 text-green-300 border-green-500/30"
                                                : "bg-red-500/20 text-red-300 border-red-500/30"
                                        }`}>
                                            {displayUser?.status === "ACTIVE" ? "Hoạt động" : "Đã khóa"}
                                        </span>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Logout button */}
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-sm font-medium rounded-xl border border-white/20 transition-all"
                        >
                            <span className="material-symbols-outlined text-[18px]">logout</span>
                            Đăng xuất
                        </button>
                    </div>
                </div>

                {/* ─── Stats Row ─────────────────────────────────────── */}
                <div className="grid grid-cols-3 gap-4 mb-8">
                    {[
                        { label: "Tổng đơn", value: bookingStats.total, icon: "calendar_month", color: "text-blue-600 bg-blue-50" },
                        { label: "Hoàn thành", value: bookingStats.completed, icon: "check_circle", color: "text-emerald-600 bg-emerald-50" },
                        { label: "Chờ duyệt", value: bookingStats.pending, icon: "schedule", color: "text-amber-600 bg-amber-50" },
                    ].map(stat => (
                        <div key={stat.label} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${stat.color}`}>
                                <span className="material-symbols-outlined text-[20px]">{stat.icon}</span>
                            </div>
                            <div>
                                <p className="text-2xl font-black text-gray-800">{stat.value}</p>
                                <p className="text-xs text-gray-500 font-medium">{stat.label}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* ─── Tab Navigation ─────────────────────────────────── */}
                <div className="flex gap-1 p-1 bg-gray-100 rounded-2xl mb-6 w-fit">
                    {[
                        { id: "profile", label: "Hồ sơ cá nhân", icon: "person" },
                        { id: "bookings", label: "Lịch sử đặt sân", icon: "history" },
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                                activeTab === tab.id
                                    ? "bg-white text-primary shadow-sm"
                                    : "text-gray-500 hover:text-gray-700"
                            }`}
                        >
                            <span className="material-symbols-outlined text-[18px]">{tab.icon}</span>
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* ─── Tab: Hồ sơ ────────────────────────────────────── */}
                {activeTab === "profile" && (
                    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="px-8 py-6 border-b border-gray-100">
                            <h2 className="text-lg font-bold text-gray-800">Thông tin cá nhân</h2>
                            <p className="text-sm text-gray-500 mt-0.5">Cập nhật tên, số điện thoại và ảnh đại diện</p>
                        </div>

                        <form onSubmit={handleSaveProfile} className="px-8 py-6 space-y-5">
                            {/* Avatar preview khi đổi */}
                            {avatarPreview && (
                                <div className="flex items-center gap-4 p-4 bg-primary/5 rounded-2xl border border-primary/20">
                                    <img src={avatarPreview} alt="Preview" className="w-16 h-16 rounded-xl object-cover border-2 border-primary/30" />
                                    <div>
                                        <p className="text-sm font-semibold text-primary">Ảnh mới đã chọn</p>
                                        <p className="text-xs text-gray-500">Nhấn "Lưu thay đổi" để cập nhật</p>
                                        <button
                                            type="button"
                                            onClick={() => { setAvatarFile(null); setAvatarPreview(null); }}
                                            className="text-xs text-red-400 hover:text-red-600 mt-1"
                                        >
                                            Hủy đổi ảnh
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Full Name */}
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-gray-700">Họ và tên</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2">
                                        <span className="material-symbols-outlined text-gray-400 text-[20px]">person</span>
                                    </span>
                                    <input
                                        type="text"
                                        value={editForm.fullName}
                                        onChange={e => setEditForm({ ...editForm, fullName: e.target.value })}
                                        placeholder="Nhập họ và tên..."
                                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                    />
                                </div>
                            </div>

                            {/* Email (readonly) */}
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-gray-700">Email</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2">
                                        <span className="material-symbols-outlined text-gray-400 text-[20px]">mail</span>
                                    </span>
                                    <input
                                        type="email"
                                        value={displayUser?.email || ""}
                                        readOnly
                                        className="w-full pl-10 pr-4 py-3 border border-gray-100 rounded-xl text-sm bg-gray-50 text-gray-400 cursor-not-allowed outline-none"
                                    />
                                </div>
                                <p className="text-xs text-gray-400">Email không thể thay đổi</p>
                            </div>

                            {/* Phone */}
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-gray-700">Số điện thoại</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2">
                                        <span className="material-symbols-outlined text-gray-400 text-[20px]">phone</span>
                                    </span>
                                    <input
                                        type="tel"
                                        value={editForm.phone}
                                        onChange={e => setEditForm({ ...editForm, phone: e.target.value })}
                                        placeholder="Nhập số điện thoại..."
                                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                    />
                                </div>
                            </div>

                            {/* Feedback messages */}
                            {successMsg && (
                                <div className="flex items-center gap-2 text-emerald-700 text-sm font-semibold bg-emerald-50 px-4 py-3 rounded-xl">
                                    <span className="material-symbols-outlined text-[18px]">check_circle</span>
                                    {successMsg}
                                </div>
                            )}
                            {errorMsg && (
                                <div className="flex items-center gap-2 text-red-600 text-sm font-semibold bg-red-50 px-4 py-3 rounded-xl">
                                    <span className="material-symbols-outlined text-[18px]">error</span>
                                    {errorMsg}
                                </div>
                            )}

                            {/* Submit */}
                            <div className="flex items-center gap-3 pt-2">
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="flex items-center gap-2 px-6 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-sm shadow-primary/20"
                                >
                                    {saving ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                                            Đang lưu...
                                        </>
                                    ) : (
                                        <>
                                            <span className="material-symbols-outlined text-[18px]">save</span>
                                            Lưu thay đổi
                                        </>
                                    )}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="flex items-center gap-2 px-5 py-3 border border-gray-200 text-gray-600 font-semibold rounded-xl hover:bg-gray-50 text-sm transition-all"
                                >
                                    <span className="material-symbols-outlined text-[18px]">photo_camera</span>
                                    Đổi ảnh đại diện
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* ─── Tab: Lịch sử đặt sân ──────────────────────────── */}
                {activeTab === "bookings" && (
                    <div className="space-y-4">
                        {loadingBookings ? (
                            <div className="space-y-3">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="bg-white rounded-2xl border border-gray-100 h-24 animate-pulse" />
                                ))}
                            </div>
                        ) : bookings.length === 0 ? (
                            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 py-20 text-center">
                                <div className="w-20 h-20 mx-auto bg-primary/5 rounded-full flex items-center justify-center mb-4">
                                    <span className="material-symbols-outlined text-primary/40 text-5xl">calendar_month</span>
                                </div>
                                <h3 className="text-lg font-bold text-gray-700 mb-2">Chưa có lịch sử đặt sân</h3>
                                <p className="text-sm text-gray-400 mb-6">Bạn chưa từng đặt sân pickleball nào. Hãy khám phá ngay!</p>
                                <button
                                    onClick={() => navigate("/courts")}
                                    className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 transition-all shadow-sm"
                                >
                                    <span className="material-symbols-outlined text-[18px]">search</span>
                                    Tìm sân ngay
                                </button>
                            </div>
                        ) : (
                            <>
                                <div className="flex items-center justify-between mb-2">
                                    <h2 className="text-base font-bold text-gray-700">
                                        Tổng cộng {bookings.length} đơn đặt sân
                                    </h2>
                                </div>
                                <div className="space-y-3">
                                    {bookings.map(booking => (
                                        <BookingCard
                                            key={booking._id}
                                            booking={booking}
                                            onCancel={handleCancelBooking}
                                        />
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
