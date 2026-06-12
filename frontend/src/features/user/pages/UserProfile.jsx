// src/features/user/pages/UserProfile.jsx
import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { userService } from "@/services/user.service";
import { reviewService } from "@/services/review.service";

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

// ─── Star Rating Component ─────────────────────────────────────────────────────
function StarRating({ value, onChange, size = 32, readonly = false }) {
    const [hovered, setHovered] = useState(0);
    return (
        <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
                <button
                    key={star}
                    type="button"
                    disabled={readonly}
                    onClick={() => !readonly && onChange?.(star)}
                    onMouseEnter={() => !readonly && setHovered(star)}
                    onMouseLeave={() => !readonly && setHovered(0)}
                    className={`transition-transform ${!readonly ? "hover:scale-110 cursor-pointer" : "cursor-default"}`}
                    style={{ fontSize: size }}
                >
                    <span
                        className="material-symbols-outlined select-none"
                        style={{
                            fontSize: size,
                            color: star <= (hovered || value) ? "#f59e0b" : "#d1d5db",
                            transition: "color 0.15s",
                            fontVariationSettings: "'FILL' 1",
                        }}
                    >
                        star
                    </span>
                </button>
            ))}
        </div>
    );
}

// ─── Review Modal ─────────────────────────────────────────────────────────────
function ReviewModal({ booking, onClose, onSuccess }) {
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!rating) return setError("Vui lòng chọn số sao đánh giá!");
        setSubmitting(true);
        setError("");
        try {
            await reviewService.createReview({
                courtId: booking.courtId?._id || booking.courtId,
                bookingId: booking._id,
                rating,
                comment,
            });
            onSuccess();
        } catch (err) {
            setError(err?.response?.data?.message || "Gửi đánh giá thất bại. Vui lòng thử lại!");
        } finally {
            setSubmitting(false);
        }
    };

    const ratingLabels = ["", "Tệ", "Không tốt", "Bình thường", "Tốt", "Xuất sắc"];

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ backgroundColor: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)" }}
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <div className="bg-white rounded-2xl shadow-soft w-full max-w-md overflow-hidden animate-fadeIn">
                {/* Header */}
                <div className="bg-ink px-6 py-5 relative">
                    <button
                        onClick={onClose}
                        className="absolute right-4 top-4 text-white/70 hover:text-white transition-colors"
                    >
                        <span className="material-symbols-outlined text-[22px]">close</span>
                    </button>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                            <span className="material-symbols-outlined text-white text-[22px]">rate_review</span>
                        </div>
                        <div>
                            <h3 className="text-white font-bold text-lg">Đánh giá sân</h3>
                            <p className="text-white/65 text-xs mt-0.5">{booking.courtId?.name || "Sân Pickleball"}</p>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">
                    {/* Booking info */}
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                        <span className="material-symbols-outlined text-primary text-[20px]">calendar_month</span>
                        <div>
                            <p className="text-xs font-semibold text-gray-700">
                                {booking.bookingDate} · {booking.startTime} – {booking.endTime}
                            </p>
                            <p className="text-[11px] text-gray-400 font-mono mt-0.5">#{booking.bookingCode}</p>
                        </div>
                    </div>

                    {/* Star rating */}
                    <div className="text-center space-y-3">
                        <p className="text-sm font-semibold text-gray-700">Bạn đánh giá thế nào?</p>
                        <div className="flex justify-center">
                            <StarRating value={rating} onChange={setRating} size={40} />
                        </div>
                        {rating > 0 && (
                            <span className="inline-block px-3 py-1 rounded-full text-sm font-semibold bg-amber-50 text-amber-600 border border-amber-200">
                                {ratingLabels[rating]}
                            </span>
                        )}
                    </div>

                    {/* Comment */}
                    <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-gray-700">
                            Nhận xét <span className="text-gray-400 font-normal">(tùy chọn)</span>
                        </label>
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Chia sẻ trải nghiệm của bạn về sân này..."
                            maxLength={1500}
                            rows={4}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-none"
                        />
                        <p className="text-[11px] text-gray-400 text-right">{comment.length}/1500</p>
                    </div>

                    {/* Points reward notice */}
                    <div className="flex items-center gap-2.5 p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                        <span className="material-symbols-outlined text-primary text-[22px]">redeem</span>
                        <p className="text-xs text-emerald-700 font-medium">
                            Bạn sẽ nhận <span className="font-bold">20 điểm thưởng</span> sau khi gửi đánh giá!
                        </p>
                    </div>

                    {error && (
                        <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 px-4 py-3 rounded-xl border border-red-200">
                            <span className="material-symbols-outlined text-[18px]">error</span>
                            {error}
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3 pt-1">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-3 border border-gray-200 text-gray-600 font-semibold rounded-xl hover:bg-gray-50 text-sm transition-all"
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            disabled={submitting || !rating}
                            className="flex-1 flex items-center justify-center gap-2 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-sm shadow-primary/20"
                        >
                            {submitting ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                                    Đang gửi...
                                </>
                            ) : (
                                <>
                                    <span className="material-symbols-outlined text-[18px]">send</span>
                                    Gửi đánh giá
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ─── Review Done Badge ────────────────────────────────────────────────────────
function ReviewedBadge({ review }) {
    return (
        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 border border-amber-200 rounded-lg">
            <StarRating value={review.rating} size={14} readonly />
            <span className="text-[11px] font-semibold text-amber-700">Đã đánh giá</span>
        </div>
    );
}

// ─── Sub-component: Booking Card ──────────────────────────────────────────────
function BookingCard({ booking, onCancel, onReview }) {
    const status = statusConfig[booking.status] || { label: booking.status, cls: "bg-gray-100 text-gray-600" };
    const payment = paymentConfig[booking.paymentStatus] || { label: booking.paymentStatus, cls: "bg-gray-100 text-gray-600" };
    const canCancel = !["CANCELLED", "COMPLETED"].includes(booking.status);
    const canReview = booking.status === "COMPLETED" && booking.paymentStatus === "PAID";
    const formatMoney = (n) => n?.toLocaleString("vi-VN") + "đ";

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden group">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3.5 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
                <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="text-xs font-mono font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-lg">
                        #{booking.bookingCode}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${status.cls}`}>
                        {status.label}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${payment.cls}`}>
                        {payment.label}
                    </span>
                    {/* Đã đánh giá badge */}
                    {booking._review && <ReviewedBadge review={booking._review} />}
                </div>
                <div className="flex items-center gap-2">
                    {/* Nút đánh giá */}
                    {canReview && !booking._review && (
                        <button
                            onClick={() => onReview(booking)}
                            className="flex items-center gap-1.5 text-xs text-amber-600 hover:text-amber-700 font-semibold px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 border border-amber-200 transition-all"
                        >
                            <span className="material-symbols-outlined text-[15px]">star</span>
                            Đánh giá
                        </button>
                    )}
                    {canCancel && (
                        <button
                            onClick={() => onCancel(booking._id)}
                            className="text-xs text-red-400 hover:text-red-600 font-semibold opacity-0 group-hover:opacity-100 transition-all px-2 py-1 rounded-lg hover:bg-red-50"
                        >
                            Hủy đơn
                        </button>
                    )}
                </div>
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
                                +{booking.equipmentItems.length} thiết bị thuê kèm
                            </p>
                        )}
                        {/* Review comment preview */}
                        {booking._review?.comment && (
                            <p className="text-xs text-gray-400 italic mt-1 line-clamp-1">
                                "{booking._review.comment}"
                            </p>
                        )}
                        {/* Lý do hủy */}
                        {booking.status === "CANCELLED" && booking.cancelReason && (
                            <p className="text-xs text-red-400 mt-1 line-clamp-1">
                                {booking.cancelReason}
                            </p>
                        )}
                    </div>
                </div>
                <div className="text-right sm:flex-shrink-0">
                    <p className="text-lg font-black text-primary">{formatMoney(booking.totalPrice)}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">Tổng chi phí</p>
                </div>
            </div>

            {/* Banner hoàn tiền */}
            {booking.status === "CANCELLED" && booking.paymentStatus === "REFUNDED" && (
                <div className="mx-5 mb-4 flex items-start gap-2.5 p-3 bg-amber-50 rounded-xl border border-amber-200">
                    <span className="material-symbols-outlined text-amber-500 text-[18px] flex-shrink-0 mt-0.5">account_balance_wallet</span>
                    <div>
                        <p className="text-xs font-bold text-amber-700">Hoàn tiền đang được xử lý</p>
                        <p className="text-xs text-amber-600 mt-0.5">
                            Số tiền <span className="font-black">{formatMoney(booking.totalPrice)}</span> sẽ được hoàn lại trong vòng <span className="font-bold">24 giờ làm việc</span> qua phương thức thanh toán ban đầu.
                        </p>
                    </div>
                </div>
            )}
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

    // Review modal state
    const [reviewTarget, setReviewTarget] = useState(null); // booking đang muốn review
    const [reviewSuccess, setReviewSuccess] = useState(false);

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
                if (storeUser) {
                    setProfileData(storeUser);
                    setEditForm({ fullName: storeUser.fullName || "", phone: storeUser.phone || "" });
                }
            })
            .finally(() => setLoadingProfile(false));
    }, []);

    // ── Fetch bookings + review status ──
    const fetchBookings = useCallback(async () => {
        setLoadingBookings(true);
        try {
            const res = await userService.getMyBookings();
            if (!res?.success) return;
            const rawBookings = res.bookings || [];

            // Fetch review cho các booking COMPLETED + PAID song song
            const completedPaid = rawBookings.filter(
                b => b.status === "COMPLETED" && b.paymentStatus === "PAID"
            );
            const reviewResults = await Promise.allSettled(
                completedPaid.map(b => reviewService.getMyBookingReview(b._id))
            );

            const reviewMap = {};
            completedPaid.forEach((b, i) => {
                const r = reviewResults[i];
                if (r.status === "fulfilled" && r.value?.review) {
                    reviewMap[b._id] = r.value.review;
                }
            });

            // Gắn _review vào booking
            const enriched = rawBookings.map(b => ({
                ...b,
                _review: reviewMap[b._id] || null,
            }));
            setBookings(enriched);
        } catch (err) {
            console.error("Bookings error:", err);
        } finally {
            setLoadingBookings(false);
        }
    }, []);

    useEffect(() => {
        if (activeTab !== "bookings") return;
        fetchBookings();
    }, [activeTab, fetchBookings]);

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
                setAuth(res.user, accessToken);
                setSuccessMsg("Cập nhật hồ sơ thành công!");
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
        if (reason === null) return;
        try {
            await userService.cancelMyBooking(bookingId, reason || "Khách hàng tự hủy");
            setBookings(prev => prev.map(b =>
                b._id === bookingId ? { ...b, status: "CANCELLED" } : b
            ));
        } catch (err) {
            alert(err?.response?.data?.message || "Không thể hủy đơn này!");
        }
    };

    const handleReviewSuccess = () => {
        setReviewTarget(null);
        setReviewSuccess(true);
        // Reload bookings để cập nhật trạng thái đánh giá
        fetchBookings();
        setTimeout(() => setReviewSuccess(false), 4000);
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
        <div className="min-h-screen bg-background pt-8 pb-16">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* ─── Hero Card ─────────────────────────────────────── */}
                <div className="relative bg-ink rounded-2xl overflow-hidden shadow-soft mb-8">
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
                                    <p className="text-white/65 text-sm mt-0.5">{displayUser?.email}</p>
                                    <div className="flex items-center justify-center sm:justify-start gap-2 mt-2">
                                        <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-300 text-xs font-semibold rounded-full border border-emerald-500/30">
                                            {displayUser?.role === "ADMIN" ? "Admin" : "Player"}
                                        </span>
                                        <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full border ${
                                            displayUser?.status === "ACTIVE"
                                                ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
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
                    <div className="surface-panel overflow-hidden">
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
                        {/* Review success toast */}
                        {reviewSuccess && (
                            <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-700 font-semibold animate-fadeIn">
                                <span className="material-symbols-outlined text-emerald-500 text-[22px]">check_circle</span>
                                <div>
                                    <p className="font-bold">Đánh giá thành công!</p>
                                    <p className="text-sm font-normal text-emerald-600">Bạn đã nhận được 20 điểm thưởng vào ví tích lũy.</p>
                                </div>
                            </div>
                        )}

                        {loadingBookings ? (
                            <div className="space-y-3">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="bg-white rounded-2xl border border-gray-100 h-24 animate-pulse" />
                                ))}
                            </div>
                        ) : bookings.length === 0 ? (
                            <div className="surface-panel py-20 text-center">
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
                                    <p className="text-xs text-amber-600 font-medium flex items-center gap-1">
                                        <span className="material-symbols-outlined text-[14px]">star</span>
                                        Nhấn "Đánh giá" trên đơn đã hoàn thành để nhận điểm thưởng
                                    </p>
                                </div>
                                <div className="space-y-3">
                                    {bookings.map(booking => (
                                        <BookingCard
                                            key={booking._id}
                                            booking={booking}
                                            onCancel={handleCancelBooking}
                                            onReview={setReviewTarget}
                                        />
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                )}
            </div>

            {/* ─── Review Modal ──────────────────────────────────────── */}
            {reviewTarget && (
                <ReviewModal
                    booking={reviewTarget}
                    onClose={() => setReviewTarget(null)}
                    onSuccess={handleReviewSuccess}
                />
            )}
        </div>
    );
}
