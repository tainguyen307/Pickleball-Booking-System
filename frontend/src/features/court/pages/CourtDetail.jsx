// src/features/court/pages/CourtDetail.jsx
import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { courtService } from "@/services/court.service";
import { useAuthStore } from "@/store/authStore";
import { userService } from "@/services/user.service";
import { commerceService } from "@/services/commerce.service";
import { engagementService } from "@/services/engagement.service";
import FavoriteButton from "@/components/FavoriteButton";
import ReviewsSection from "@/components/ReviewsSection";
import CourtRail from "@/components/CourtRail";

export default function CourtDetail() {
    const { id } = useParams();
    const [court, setCourt] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

    // 🎯 FIX LỆCH MÚI GIỜ: Sử dụng format ngày sv-SE (YYYY-MM-DD) chuẩn múi giờ địa phương đồng bộ với Backend
    const [selectedDate, setSelectedDate] = useState(new Date().toLocaleDateString("sv-SE"));

    // 🎯 DATA THẬT: Nhận danh sách ma trận timeline từ API Backend mới
    const [subCourtsTimeline, setSubCourtsTimeline] = useState([]);

    // 🎯 CHỐT CHẶN BOOKING ENGINE: Lưu trữ thông tin ô giờ thật khi người chơi click chọn
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [activeImageIndex, setActiveImageIndex] = useState(0);

    const navigate = useNavigate();
    const { isAuthenticated } = useAuthStore();

    // Booking modal states
    const [showBookingModal, setShowBookingModal] = useState(false);
    const [equipments, setEquipments] = useState([]);
    const [selectedEquipments, setSelectedEquipments] = useState({}); // { equipmentId: quantity }
    const [note, setNote] = useState("");
    const [bookingLoading, setBookingLoading] = useState(false);
    const [bookingError, setBookingError] = useState("");
    const [couponCode, setCouponCode] = useState("");
    const [couponDiscount, setCouponDiscount] = useState(0);
    const [couponMessage, setCouponMessage] = useState("");
    const [pointWallet, setPointWallet] = useState(null);
    const [pointsToUse, setPointsToUse] = useState(0);
    const [pointToVnd, setPointToVnd] = useState(1000);
    const [similarCourts, setSimilarCourts] = useState([]);
    const [recentCourts, setRecentCourts] = useState([]);

    // Payment modal states
    const [bookingSuccessData, setBookingSuccessData] = useState(null);
    const [paymentLoading, setPaymentLoading] = useState(false);
    const [paymentSuccess, setPaymentSuccess] = useState(false);

    const handleOpenBooking = async () => {
        if (!isAuthenticated) {
            alert("Vui lòng đăng nhập để thực hiện đặt sân!");
            navigate("/login");
            return;
        }
        if (!selectedSlot) return;

        setShowBookingModal(true);
        setBookingError("");
        setCouponMessage("");
        try {
            const [res, walletRes] = await Promise.all([
                userService.getEquipments(),
                commerceService.getPointWallet()
            ]);
            if (res.success) {
                setEquipments(res.equipments || []);
                const initialSelected = {};
                res.equipments.forEach(eq => {
                    initialSelected[eq._id] = 0;
                });
                setSelectedEquipments(initialSelected);
            }
            if (walletRes.success) {
                setPointWallet(walletRes.wallet);
                setPointToVnd(walletRes.pointToVnd || 1000);
            }
        } catch (err) {
            console.error("Lỗi lấy danh sách thiết bị:", err);
        }
    };

    const handleQtyChange = (eqId, val, maxQty) => {
        const num = parseInt(val) || 0;
        if (num < 0) return;
        if (num > maxQty) {
            alert(`Chỉ còn tối đa ${maxQty} sản phẩm trong kho!`);
            return;
        }
        setSelectedEquipments(prev => ({
            ...prev,
            [eqId]: num
        }));
    };

    const getEquipmentPrice = () => {
        let total = 0;
        const durationHours = court.slotDuration / 60 || 1;
        equipments.forEach(eq => {
            const qty = selectedEquipments[eq._id] || 0;
            if (qty > 0) {
                const subtotal = eq.rentalType === "HOUR"
                    ? eq.rentalPrice * qty * durationHours
                    : eq.rentalPrice * qty;
                total += subtotal;
            }
        });
        return total;
    };

    const getBaseCourtPrice = () => court.pricePerHour * (court.slotDuration / 60 || 1);
    const getSystemFee = () => Math.round((getBaseCourtPrice() + getEquipmentPrice()) * 0.05);
    const getSubtotal = () => getBaseCourtPrice() + getEquipmentPrice() + getSystemFee();
    const getPointDiscount = () => Math.min((parseInt(pointsToUse) || 0) * pointToVnd, Math.max(0, getSubtotal() - couponDiscount));
    const getFinalTotal = () => Math.max(0, getSubtotal() - couponDiscount - getPointDiscount());

    const handleApplyCoupon = async () => {
        if (!couponCode.trim()) {
            setCouponDiscount(0);
            setCouponMessage("");
            return;
        }

        try {
            const res = await commerceService.validateCoupon({
                code: couponCode,
                orderValue: getSubtotal(),
                courtId: id
            });
            if (res.success) {
                setCouponDiscount(res.discountAmount || 0);
                setCouponMessage(`Đã áp dụng mã ${res.coupon.code}, giảm ${(res.discountAmount || 0).toLocaleString("vi-VN")}đ`);
            }
        } catch (error) {
            setCouponDiscount(0);
            setCouponMessage(error.response?.data?.message || "Mã giảm giá không hợp lệ!");
        }
    };

    const handleConfirmBooking = async () => {
        setBookingLoading(true);
        setBookingError("");
        try {
            const reqEquipments = Object.entries(selectedEquipments)
                .filter(([, qty]) => qty > 0)
                .map(([eqId, qty]) => ({
                    equipmentId: eqId,
                    quantity: qty
                }));

            const payload = {
                slotId: selectedSlot.slotId,
                equipments: reqEquipments,
                paymentMethod: "BANKING",
                note,
                couponCode: couponCode.trim(),
                pointsToUse: parseInt(pointsToUse) || 0
            };

            const res = await userService.createBooking(payload);
            if (res.success && res.bookingId) {
                try {
                    const paymentRes = await userService.getPaymentIntent(res.bookingId);
                    if (paymentRes.success) {
                        setBookingSuccessData({
                            bookingId: res.bookingId,
                            bookingCode: res.bookingCode,
                            totalPrice: res.totalPrice,
                            discount: res.discount,
                            rewardMessage: res.pointsUsed > 0 ? `Bạn đã dùng ${res.pointsUsed} điểm.` : "",
                            qrCodeUrl: paymentRes.qrCodeUrl,
                            paymentDescription: paymentRes.paymentDescription
                        });
                    } else {
                        setBookingSuccessData({
                            bookingId: res.bookingId,
                            bookingCode: res.bookingCode,
                            totalPrice: res.totalPrice,
                            discount: res.discount,
                            qrCodeUrl: `https://img.vietqr.io/image/MB-0900000002-qr_only.png?amount=${res.totalPrice}&addInfo=CHUYEN%20TIEN%20SAN%20${res.bookingCode}`
                        });
                    }
                } catch {
                    setBookingSuccessData({
                        bookingId: res.bookingId,
                        bookingCode: res.bookingCode,
                        totalPrice: res.totalPrice,
                        discount: res.discount,
                        qrCodeUrl: `https://img.vietqr.io/image/MB-0900000002-qr_only.png?amount=${res.totalPrice}&addInfo=CHUYEN%20TIEN%20SAN%20${res.bookingCode}`
                    });
                }
            }
        } catch (err) {
            setBookingError(err.response?.data?.message || "Đặt sân thất bại. Vui lòng thử lại!");
        } finally {
            setBookingLoading(false);
        }
    };

    const handleVerifyPayment = async () => {
        if (!bookingSuccessData) return;
        setPaymentLoading(true);
        try {
            const res = await userService.confirmPayment(bookingSuccessData.bookingId, "BANKING");
            if (res.success) {
                setPaymentSuccess(true);
                // Cập nhật lại sơ đồ sân
                courtService.getCourtDetail(id, selectedDate)
                    .then(r => {
                        if (r.success) {
                            const cleanCourtData = r.court?.court ? r.court.court : r.court;
                            setCourt(cleanCourtData);
                            setSubCourtsTimeline(r.subCourtsTimeline || r.court?.subCourtsTimeline || []);
                            setSelectedSlot(null);
                        }
                    });
            }
        } catch (err) {
            alert(err.response?.data?.message || "Không thể xác minh thanh toán!");
        } finally {
            setPaymentLoading(false);
        }
    };

    const handleCloseAll = () => {
        setShowBookingModal(false);
        setBookingSuccessData(null);
        setPaymentSuccess(false);
        setNote("");
        setSelectedEquipments({});
        setCouponCode("");
        setCouponDiscount(0);
        setCouponMessage("");
        setPointsToUse(0);
    };

    useEffect(() => {
        let isMounted = true;

        courtService.getCourtDetail(id, selectedDate)
            .then(res => {
                if (res.success && isMounted) {
                    // Phòng thủ bóc tách vỏ dữ liệu Object lặp từ Backend
                    const cleanCourtData = res.court?.court ? res.court.court : res.court;
                    setCourt(cleanCourtData);

                    // Bốc đúng mảng ma trận sân thi đấu nhỏ
                    setSubCourtsTimeline(res.subCourtsTimeline || res.court?.subCourtsTimeline || []);
                    setSelectedSlot(null); // Reset slot khi đổi ngày chơi
                }
            })
            .catch(err => {
                if (isMounted) setError(err.response?.data?.message || "Không thể tải chi tiết cụm sân này!");
            })
            .finally(() => {
                if (isMounted) setIsLoading(false);
            });

        return () => { isMounted = false; };
    }, [id, selectedDate]);

    useEffect(() => {
        let mounted = true;

        engagementService.recordView(id)
            .then(res => {
                if (res.guestId) localStorage.setItem("pickleball-guest-id", res.guestId);
            })
            .catch(() => {});

        Promise.all([
            engagementService.getSimilarCourts(id),
            engagementService.getRecentlyViewed()
        ]).then(([similarRes, recentRes]) => {
            if (!mounted) return;
            if (similarRes.success) setSimilarCourts(similarRes.courts || []);
            if (recentRes.success) setRecentCourts((recentRes.courts || []).filter(item => item._id !== id));
        }).catch(() => {});

        return () => { mounted = false; };
    }, [id]);

    // Hàm xử lý khi người dùng đổi ngày chơi trên bộ lịch UI
    const handleDateChange = (e) => {
        setIsLoading(true);
        setSelectedDate(e.target.value);
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background pt-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                    <div className="animate-pulse space-y-6">
                        <div className="h-8 bg-surface-container rounded w-1/4" />
                        <div className="h-96 bg-surface-container rounded-2xl" />
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-2 space-y-6">
                                <div className="h-32 bg-surface-container rounded-2xl" />
                                <div className="h-48 bg-surface-container rounded-2xl" />
                            </div>
                            <div className="h-96 bg-surface-container rounded-2xl" />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !court) {
        return (
            <div className="min-h-screen bg-background pt-16 flex items-center justify-center">
                <div className="text-center max-w-md mx-auto px-6">
                    <div className="w-24 h-24 mx-auto bg-error/10 rounded-full flex items-center justify-center mb-6">
                        <span className="material-symbols-outlined text-error text-5xl">error</span>
                    </div>
                    <h3 className="text-2xl font-bold text-on-surface mb-3">{error || "Cụm sân không tồn tại"}</h3>
                    <p className="text-on-surface-variant mb-6">Có vẻ như địa chỉ bạn truy cập không chính xác.</p>
                    <Link to="/courts" className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-semibold hover:shadow-lg transition-all">
                        <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                        Quay lại danh sách
                    </Link>
                </div>
            </div>
        );
    }

    // 🎯 CLOUDINARY CONVERT: Biến đổi mảng Object ảnh của database mới thành mảng chuỗi URL sạch
    const images = court.images?.length > 0
        ? court.images.map(imgObj => imgObj.imageUrl)
        : [
            "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?q=80&w=1200",
            "https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?q=80&w=800",
            "https://images.unsplash.com/photo-1542144557-f550eeed3b6c?q=80&w=800"
        ];

    const globalTimeSlots = ["06:00", "07:00", "08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00", "21:00", "22:00"];

    return (
        <div className="min-h-screen bg-background pt-0 font-lexend">
            {/* Gallery Header Section */}
            <div className="relative bg-surface-container">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-10">
                    <div className="flex items-center gap-2 text-sm mb-6">
                        <Link to="/courts" className="text-on-surface-variant hover:text-primary transition-colors">Sân bóng</Link>
                        <span className="material-symbols-outlined text-[16px] text-on-surface-variant">chevron_right</span>
                        <span className="text-primary font-medium">{court.name}</span>
                    </div>

                    <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8">
                        <div>
                            <h1 className="text-4xl lg:text-5xl font-bold text-on-surface tracking-tight mb-3">{court.name}</h1>
                            <div className="flex flex-wrap items-center gap-4 text-sm">
                                <div className="flex items-center gap-1.5">
                                    <div className="flex items-center gap-0.5">
                                        {[1,2,3,4,5].map((star) => (
                                            <span
                                                key={star}
                                                className={`material-symbols-outlined text-[18px] ${star <= Math.round(court.averageRating || 0) ? "text-amber-400" : "text-gray-300"}`}
                                                style={{ fontVariationSettings: star <= Math.round(court.averageRating || 0) ? "'FILL' 1" : "'FILL' 0" }}
                                            >
                                                star
                                            </span>
                                        ))}
                                    </div>
                                    <span className="font-semibold text-on-surface">{court.averageRating || 0}</span>
                                    <span className="text-on-surface-variant">({court.reviewCount || 0} đánh giá)</span>
                                </div>
                                <div className="w-1 h-1 bg-outline-variant rounded-full" />
                                <div className="flex items-center gap-1.5 text-on-surface-variant">
                                    <span className="material-symbols-outlined text-[18px]">favorite</span>
                                    <span>{court.favoriteCount || 0} yêu thích</span>
                                </div>
                                <div className="w-1 h-1 bg-outline-variant rounded-full" />
                                <div className="flex items-center gap-1.5 text-on-surface-variant">
                                    <span className="material-symbols-outlined text-[18px]">visibility</span>
                                    <span>{court.viewCount || 0} lượt xem</span>
                                </div>
                                <div className="w-1 h-1 bg-outline-variant rounded-full" />
                                <div className="flex items-center gap-1.5 text-on-surface-variant">
                                    <span className="material-symbols-outlined text-[18px]">payments</span>
                                    <span>{court.bookingCount || 0} lượt đặt</span>
                                </div>
                                <div className="w-1 h-1 bg-outline-variant rounded-full" />
                                <div className="flex items-center gap-1.5 text-on-surface-variant">
                                    <span className="material-symbols-outlined text-[18px]">location_on</span>
                                    <span>{court.address || court.location}</span>
                                </div>
                            </div>
                        </div>
                        <FavoriteButton courtId={court._id} />
                    </div>

                    {/* Lưới ảnh Bento Gallery bốc URL Cloudinary */}
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-3 h-[450px] lg:h-[500px]">
                        <div className="lg:col-span-3 relative rounded-2xl overflow-hidden bg-surface-container-high group">
                            <img
                                src={images[activeImageIndex]}
                                alt={court.name}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                        </div>
                        <div className="grid grid-cols-3 lg:grid-cols-1 gap-3">
                            {images.slice(0, 3).map((img, idx) => (
                                <div
                                    key={idx}
                                    onClick={() => setActiveImageIndex(idx)}
                                    className={`relative rounded-xl overflow-hidden h-full lg:h-[calc(33.33%-8px)] cursor-pointer group ${activeImageIndex === idx ? 'ring-2 ring-primary ring-offset-2' : ''}`}
                                >
                                    <img
                                        src={img}
                                        alt={`Thumbnail ${idx + 1}`}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Details Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

                    {/* 📊 BẢNG MA TRẬN TIMELINE HIỂN THỊ DỮ LIỆU THẬT */}
                    <div className="lg:col-span-12 space-y-6">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl border border-outline-variant/40 shadow-sm">
                            <div>
                                <h2 className="text-2xl font-black text-on-surface flex items-center gap-2">
                                    <span className="material-symbols-outlined text-primary text-[26px]">apps</span>
                                    Sơ Đồ Trạng Thái Sân Theo Thời Gian Thực
                                </h2>
                                <p className="text-sm text-on-surface-variant mt-0.5">Chọn chính xác ô giờ trống của từng sân nhỏ để tiến hành giữ chỗ lịch chơi</p>
                            </div>

                            <div className="relative w-full sm:w-60 shrink-0">
                                <input
                                    type="date"
                                    value={selectedDate}
                                    onChange={handleDateChange}
                                    className="w-full px-4 py-2.5 bg-surface-container rounded-xl border border-outline-variant focus:outline-none focus:border-primary font-bold text-sm text-on-surface cursor-pointer shadow-sm"
                                />
                            </div>
                        </div>

                        <div className="bg-white border border-outline-variant/40 rounded-2xl shadow-sm overflow-hidden">
                            <div className="overflow-x-auto custom-scrollbar">
                                <div className="min-w-[1000px] divide-y divide-outline-variant/30">
                                    <div className="flex bg-surface-container-low/60 h-12 items-center">
                                        <div className="w-56 shrink-0 pl-6 text-xs font-bold text-outline">Danh sách sân nhỏ</div>
                                        <div className="flex flex-grow justify-between">
                                            {globalTimeSlots.map((time) => (
                                                <div key={time} className="w-16 text-center text-[11px] font-black text-on-surface-variant tracking-tighter border-l border-outline-variant/10">{time}</div>
                                            ))}
                                        </div>
                                    </div>

                                    {subCourtsTimeline.length === 0 ? (
                                        <div className="text-center py-12 text-sm font-semibold text-outline bg-surface-container-low/20">
                                            <span className="material-symbols-outlined block text-3xl text-outline-variant mb-2">inbox</span>
                                            Cụm sân này hiện tại chưa được cấu hình các sân thi đấu nhỏ bên trong.
                                        </div>
                                    ) : (
                                        subCourtsTimeline.map((subCourt) => (
                                            <div key={subCourt._id} className="flex h-16 items-center hover:bg-surface-container-lowest transition-colors group">
                                                <div className="w-56 shrink-0 pl-6">
                                                    <p className="font-bold text-sm text-on-surface group-hover:text-primary transition-colors">{subCourt.name}</p>
                                                    <span className="text-[10px] text-outline font-medium">Kích thước chuẩn USAPA</span>
                                                </div>

                                                <div className="flex flex-grow justify-between h-full items-center">
                                                    {globalTimeSlots.map((time) => {
                                                        const matchedSlot = subCourt.slots?.find(s => s.startTime === time);
                                                        const isBooked = matchedSlot ? matchedSlot.isBooked : true;
                                                        const isSelected = selectedSlot?.slotId === matchedSlot?._id;

                                                        return (
                                                            <div key={time} className="w-16 h-full border-l border-outline-variant/10 flex items-center justify-center px-1">
                                                                {isBooked ? (
                                                                    <div className="w-full h-10 rounded-lg bg-surface-container text-on-surface-variant/30 text-[10px] font-bold flex items-center justify-center cursor-not-allowed border border-dashed border-outline-variant/40">Kín</div>
                                                                ) : (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => setSelectedSlot({
                                                                            slotId: matchedSlot._id,
                                                                            courtName: subCourt.name,
                                                                            time: matchedSlot.startTime
                                                                        })}
                                                                        className={`w-full h-10 rounded-lg text-xs font-bold transition-all flex flex-col items-center justify-center ${
                                                                            isSelected
                                                                                ? "bg-primary text-white shadow-md scale-95 border border-primary"
                                                                                : "bg-green-50/40 text-primary border border-green-200/60 hover:bg-primary/10 hover:border-primary"
                                                                        }`}
                                                                    >
                                                                        <span>Trống</span>
                                                                    </button>
                                                                )}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>

                            <div className="bg-surface-container-low/30 px-6 py-3 flex gap-6 text-xs font-semibold text-on-surface-variant border-t border-outline-variant/30">
                                <div className="flex items-center gap-1.5"><div className="w-4 h-4 rounded bg-green-50 border border-green-200" /><span>Sân trống (Sẵn sàng đặt)</span></div>
                                <div className="flex items-center gap-1.5"><div className="w-4 h-4 rounded bg-surface-container border border-dashed border-outline-variant/40" /><span>Sân đã kín lịch chơi</span></div>
                                <div className="flex items-center gap-1.5"><div className="w-4 h-4 rounded bg-primary" /><span>Ô giờ bạn đang chọn đặt</span></div>
                            </div>
                        </div>
                    </div>

                    {/* COLUMN TRÁI DƯỚI: CHI TIẾT TIỆN ÍCH */}
                    <div className="lg:col-span-8 space-y-10 pt-4">
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                            <div className="surface-panel-flat rounded-2xl p-4 flex items-center gap-3">
                                <span className="material-symbols-outlined text-2xl text-primary">sports_tennis</span>
                                <div>
                                    <p className="text-[11px] text-outline font-bold">Môi trường</p>
                                    <p className="font-bold text-sm text-on-surface mt-0.5">{court.type === "INDOOR" ? "Sân Trong nhà" : "Sân Ngoài trời"}</p>
                                </div>
                            </div>
                            <div className="surface-panel-flat rounded-2xl p-4 flex items-center gap-3">
                                <span className="material-symbols-outlined text-2xl text-primary">schedule</span>
                                <div>
                                    <p className="text-[11px] text-outline font-bold">Thời gian hoạt động</p>
                                    <p className="font-bold text-sm text-on-surface mt-0.5">{court.openTime || "06:00"} - {court.closeTime || "22:00"}</p>
                                </div>
                            </div>
                            <div className="surface-panel-flat rounded-2xl p-4 flex items-center gap-3">
                                <span className="material-symbols-outlined text-2xl text-primary">timer</span>
                                <div>
                                    <p className="text-[11px] text-outline font-bold">Thời lượng block</p>
                                    <p className="font-bold text-sm text-on-surface mt-0.5">{court.slotDuration || 60} phút / slot</p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <h2 className="text-2xl font-bold text-on-surface">Giới thiệu cụm sân</h2>
                            <p className="text-on-surface-variant leading-relaxed text-sm">{court.description || "Trải nghiệm sân pickleball đẳng cấp hàng đầu tại cụm sân chuyên nghiệp với mặt sân đạt chuẩn quốc tế."}</p>
                        </div>

                        <div className="space-y-4">
                            <h2 className="text-2xl font-bold text-on-surface">Tiện ích miễn phí đi kèm</h2>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                {(court.amenities?.length > 0 ? court.amenities : ["Wifi miễn phí", "Bãi xe ô tô", "Phòng tắm nước nóng"]).map((amenityName, idx) => (
                                    <div key={idx} className="flex items-center gap-2.5 p-3 rounded-xl bg-surface-container-low/40 border border-outline-variant/20">
                                        <span className="material-symbols-outlined text-primary text-[20px]">check_circle</span>
                                        <span className="text-xs font-bold text-on-surface-variant">{amenityName}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* COLUMN PHẢI DƯỚI: THANH BILLING HOÁ ĐƠN THANH TOÁN */}
                    <div className="lg:col-span-4 pt-4">
                        <div className="sticky top-24 surface-panel overflow-hidden">
                            <div className="p-5 border-b border-outline-variant/30">
                                <span className="text-xs font-bold text-primary block mb-1">Chi phí gốc cơ sở</span>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-3xl font-black text-primary">{court.pricePerHour?.toLocaleString("vi-VN")}đ</span>
                                    <span className="text-on-surface-variant text-xs font-semibold">/ giờ chơi</span>
                                </div>
                            </div>

                            <div className="p-6 space-y-5">
                                <div className="bg-surface-container-low p-4 rounded-xl border border-outline-variant/40 text-xs font-semibold space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-on-surface-variant">Ngày đặt lịch:</span>
                                        <span className="text-on-surface font-bold">{selectedDate}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-on-surface-variant">Sân thi đấu:</span>
                                        <span className="text-primary font-black">{selectedSlot ? selectedSlot.courtName : "Chưa chọn"}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-on-surface-variant">Khung giờ:</span>
                                        <span className="text-primary font-black">{selectedSlot ? `${selectedSlot.time} - ${(parseInt(selectedSlot.time) + 1)}:00` : "Chưa chọn"}</span>
                                    </div>
                                </div>

                                <div className="space-y-2.5 pt-2 text-xs font-semibold text-on-surface-variant">
                                    <div className="flex justify-between">
                                        <span>Tiền thuê sân (1 slot)</span>
                                        <span>{court.pricePerHour?.toLocaleString("vi-VN")}đ</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Thuế phí dịch vụ hệ thống (5%)</span>
                                        <span>{(court.pricePerHour * 0.05).toLocaleString("vi-VN")}đ</span>
                                    </div>
                                    <div className="flex justify-between font-black text-sm pt-4 border-t border-dashed border-outline-variant text-on-surface">
                                        <span>Tổng chi phí trả trước</span>
                                        <span>{selectedSlot ? (court.pricePerHour * 1.05).toLocaleString("vi-VN") : 0}đ</span>
                                    </div>
                                </div>

                                <button
                                    onClick={handleOpenBooking}
                                    disabled={!selectedSlot}
                                    className={`w-full py-4 rounded-xl font-bold text-sm text-white transition-all shadow-md flex items-center justify-center gap-2 ${
                                        selectedSlot ? "bg-primary hover:bg-primary/90 hover:scale-[1.01] active:scale-98 cursor-pointer shadow-green-900/10" : "bg-outline-variant text-on-surface-variant/40 cursor-not-allowed"
                                    }`}
                                >
                                    <span className="material-symbols-outlined text-[20px]">calendar_checked</span>
                                    {selectedSlot ? `Tiến Hành Đặt Lịch` : "Vui lòng chọn Sân & Giờ trống"}
                                </button>
                                <p className="text-center text-[10px] text-outline font-medium">Hỗ trợ thanh toán bảo mật bằng ví điện tử Momo / VNPAY.</p>
                            </div>
                        </div>
                    </div>

                </div>
                <div className="mt-12 space-y-12">
                    <ReviewsSection courtId={court._id} court={court} />
                    <CourtRail title="Sân tương tự" courts={similarCourts} emptyText="Chưa tìm thấy sân tương tự phù hợp." />
                    <CourtRail title="Đã xem gần đây" courts={recentCourts} emptyText="Bạn chưa xem thêm sân nào khác gần đây." />
                </div>
            {/* ─── BOOKING & PAYMENT MODAL ─── */}
            {showBookingModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
                    <div className="bg-white rounded-2xl w-full max-w-xl shadow-soft border border-gray-100 overflow-hidden transform scale-100 transition-all duration-300">
                        {/* Header */}
                        <div className="px-6 py-5 bg-ink text-white flex justify-between items-center">
                            <div>
                                <h3 className="font-bold text-lg">
                                    {!bookingSuccessData ? "Xác nhận Đặt lịch & Thuê Đồ" : "Thanh toán Đặt sân"}
                                </h3>
                                <p className="text-xs text-white/65 mt-0.5">
                                    {!bookingSuccessData ? "Kiểm tra thông tin chi tiết và dụng cụ" : `Mã đơn hàng: #${bookingSuccessData.bookingCode}`}
                                </p>
                            </div>
                            {!paymentSuccess && (
                                <button
                                    onClick={handleCloseAll}
                                    className="p-1.5 hover:bg-white/10 rounded-xl transition-all"
                                >
                                    <span className="material-symbols-outlined text-white">close</span>
                                </button>
                            )}
                        </div>

                        {/* Content */}
                        {!bookingSuccessData ? (
                            /* --- Bước 1: Chọn thuê thiết bị --- */
                            <div className="p-6 space-y-5">
                                {/* Slot Info */}
                                <div className="bg-emerald-50/60 border border-emerald-100 p-4 rounded-2xl flex items-center gap-3">
                                    <span className="material-symbols-outlined text-primary text-[28px]">schedule</span>
                                    <div>
                                        <p className="font-black text-sm text-gray-800">{selectedSlot?.courtName}</p>
                                        <p className="text-xs text-gray-500 mt-0.5">
                                            Ngày chơi: <span className="font-bold text-gray-700">{selectedDate}</span>
                                            {" · "}
                                            Giờ: <span className="font-bold text-primary">{selectedSlot?.time} - {(parseInt(selectedSlot?.time) + 1)}:00</span>
                                        </p>
                                    </div>
                                </div>

                                {/* Equipment List */}
                                <div className="space-y-3">
                                    <h4 className="text-sm font-bold text-gray-700">Thuê dụng cụ kèm theo</h4>
                                    {equipments.length === 0 ? (
                                        <p className="text-xs text-gray-400">Không có dụng cụ khả dụng trong kho.</p>
                                    ) : (
                                        <div className="space-y-2 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
                                            {equipments.map(eq => (
                                                <div key={eq._id} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl border border-gray-100">
                                                    <div className="text-left">
                                                        <p className="font-bold text-xs text-gray-800">{eq.name}</p>
                                                        <p className="text-[10px] text-gray-500 mt-0.5">
                                                            {eq.rentalPrice.toLocaleString("vi-VN")}đ / {eq.rentalType === "HOUR" ? "giờ" : "lượt"}
                                                            {" · "}
                                                            Kho: <span className="font-semibold">{eq.availableQuantity}</span>
                                                        </p>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleQtyChange(eq._id, (selectedEquipments[eq._id] || 0) - 1, eq.availableQuantity)}
                                                            className="w-7 h-7 rounded-lg bg-white border border-gray-200 flex items-center justify-center font-bold text-gray-600 hover:bg-gray-50"
                                                        >
                                                            -
                                                        </button>
                                                        <span className="text-sm font-black text-gray-800 w-6 text-center">
                                                            {selectedEquipments[eq._id] || 0}
                                                        </span>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleQtyChange(eq._id, (selectedEquipments[eq._id] || 0) + 1, eq.availableQuantity)}
                                                            className="w-7 h-7 rounded-lg bg-white border border-gray-200 flex items-center justify-center font-bold text-gray-600 hover:bg-gray-50"
                                                        >
                                                            +
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Note */}
                                <div className="space-y-1.5">
                                    <label className="text-sm font-bold text-gray-700">Ghi chú gửi sân</label>
                                    <input
                                        type="text"
                                        placeholder="Ví dụ: Cần mượn thêm khăn lau hoặc nước uống..."
                                        value={note}
                                        onChange={e => setNote(e.target.value)}
                                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                                    />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-bold text-gray-700">Mã giảm giá</label>
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                placeholder="VD: PICKLE20"
                                                value={couponCode}
                                                onChange={e => setCouponCode(e.target.value.toUpperCase())}
                                                className="min-w-0 flex-1 px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                                            />
                                            <button
                                                type="button"
                                                onClick={handleApplyCoupon}
                                                className="px-3 py-2.5 rounded-xl bg-primary text-white text-xs font-bold"
                                            >
                                                Áp dụng
                                            </button>
                                        </div>
                                        {couponMessage && <p className="text-[11px] font-semibold text-primary">{couponMessage}</p>}
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-sm font-bold text-gray-700">
                                            Dùng điểm ({pointWallet?.balance || 0} điểm)
                                        </label>
                                        <input
                                            type="number"
                                            min="0"
                                            max={pointWallet?.balance || 0}
                                            value={pointsToUse}
                                            onChange={e => setPointsToUse(Math.min(parseInt(e.target.value) || 0, pointWallet?.balance || 0))}
                                            className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                                        />
                                        <p className="text-[11px] text-gray-400">1 điểm = {pointToVnd.toLocaleString("vi-VN")}đ</p>
                                    </div>
                                </div>

                                {/* Price breakdown */}
                                <div className="border-t border-dashed border-gray-200 pt-3 space-y-1.5 text-xs text-gray-500 text-left">
                                    <div className="flex justify-between">
                                        <span>Tiền thuê sân</span>
                                        <span className="font-semibold text-gray-700">{getBaseCourtPrice().toLocaleString("vi-VN")}đ</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Tiền thuê thiết bị</span>
                                        <span className="font-semibold text-gray-700">{getEquipmentPrice().toLocaleString("vi-VN")}đ</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Phí dịch vụ hệ thống (5%)</span>
                                        <span className="font-semibold text-gray-700">{getSystemFee().toLocaleString("vi-VN")}đ</span>
                                    </div>
                                    {couponDiscount > 0 && (
                                        <div className="flex justify-between text-emerald-600">
                                            <span>Giảm giá coupon</span>
                                            <span className="font-semibold">-{couponDiscount.toLocaleString("vi-VN")}đ</span>
                                        </div>
                                    )}
                                    {getPointDiscount() > 0 && (
                                        <div className="flex justify-between text-emerald-600">
                                            <span>Giảm bằng điểm</span>
                                            <span className="font-semibold">-{getPointDiscount().toLocaleString("vi-VN")}đ</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between">
                                        <span>Tạm tính</span>
                                        <span className="font-semibold text-gray-700">{getSubtotal().toLocaleString("vi-VN")}đ</span>
                                    </div>
                                    <div className="flex justify-between font-black text-sm pt-2 border-t text-on-surface">
                                        <span>Tổng chi phí cần trả</span>
                                        <span className="text-primary text-base">
                                            {getFinalTotal().toLocaleString("vi-VN")}đ
                                        </span>
                                    </div>
                                </div>

                                {bookingError && (
                                    <p className="text-xs text-red-500 font-semibold">{bookingError}</p>
                                )}

                                {/* Action Buttons */}
                                <div className="flex gap-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={handleCloseAll}
                                        className="flex-1 py-3 border border-gray-200 hover:bg-gray-50 text-gray-600 font-bold rounded-xl text-xs transition-all"
                                    >
                                        Hủy bỏ
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleConfirmBooking}
                                        disabled={bookingLoading}
                                        className="flex-1 py-3 bg-primary hover:bg-primary/95 text-white font-bold rounded-xl text-xs transition-all shadow-md shadow-primary/25 disabled:opacity-50"
                                    >
                                        {bookingLoading ? "Đang xử lý..." : "Xác nhận Đặt sân"}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            /* --- Bước 2: Thanh toán chuyển khoản ngân hàng thật --- */
                            <div className="p-6 space-y-5 text-center">
                                {!paymentSuccess ? (
                                    <>
                                        <p className="text-xs text-gray-500 font-medium leading-relaxed">
                                            Quét mã QR bằng ứng dụng ngân hàng của bạn để chuyển khoản thanh toán tự động hoặc chuyển thủ công theo thông tin bên dưới:
                                        </p>
                                        <div className="w-48 h-48 mx-auto border-2 border-emerald-100 rounded-2xl overflow-hidden p-1 shadow-inner bg-emerald-50/10">
                                            <img
                                                src={bookingSuccessData.qrCodeUrl}
                                                alt="VietQR MBBank"
                                                className="w-full h-full object-contain"
                                            />
                                        </div>
                                        <div className="bg-gray-50 p-4 rounded-2xl text-xs font-semibold text-gray-600 space-y-2 border border-gray-100 text-left max-w-sm mx-auto">
                                            <div className="flex justify-between">
                                                <span>Ngân hàng:</span>
                                                <span className="text-gray-800">MB Bank (Quân Đội)</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Số tài khoản:</span>
                                                <span className="text-primary font-black">0900000002</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Số tiền:</span>
                                                <span className="text-red-500 font-black">{bookingSuccessData.totalPrice.toLocaleString("vi-VN")}đ</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Nội dung CK:</span>
                                                <span className="text-primary font-black select-all">{bookingSuccessData.paymentDescription || `CHUYEN TIEN SAN ${bookingSuccessData.bookingCode}`}</span>
                                            </div>
                                        </div>
                                        <p className="text-[10px] text-gray-400">Lưu ý: Nội dung chuyển khoản phải ghi chính xác để hệ thống tự động duyệt sân.</p>

                                        {/* Action buttons */}
                                        <div className="flex gap-3 pt-2 max-w-sm mx-auto">
                                            <button
                                                type="button"
                                                onClick={handleCloseAll}
                                                className="flex-1 py-3 border border-gray-200 hover:bg-gray-50 text-gray-600 font-bold rounded-xl text-xs transition-all"
                                            >
                                                Thanh toán sau
                                            </button>
                                            <button
                                                type="button"
                                                onClick={handleVerifyPayment}
                                                disabled={paymentLoading}
                                                className="flex-1 py-3 bg-primary hover:bg-primary/95 text-white font-bold rounded-xl text-xs transition-all shadow-md shadow-primary/25 disabled:opacity-50 flex items-center justify-center gap-1.5"
                                            >
                                                {paymentLoading ? (
                                                    "Đang xác minh..."
                                                ) : (
                                                    <>
                                                        <span className="material-symbols-outlined text-[16px]">check_circle</span>
                                                        Tôi đã chuyển khoản
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </>
                                ) : (
                                    <div className="py-8 space-y-4">
                                        <div className="w-16 h-16 mx-auto bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
                                            <span className="material-symbols-outlined text-emerald-600 text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                                        </div>
                                        <div>
                                            <h4 className="text-xl font-black text-gray-800">Đặt Sân Thành Công Rực Rỡ!</h4>
                                            <p className="text-xs text-gray-500 mt-1.5 leading-relaxed max-w-xs mx-auto">
                                                Mã đơn hàng <span className="font-bold text-gray-800">#{bookingSuccessData.bookingCode}</span> đã được chuyển trạng thái đã thanh toán. Sân chơi của bạn đã khóa giữ chỗ an toàn!
                                            </p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={handleCloseAll}
                                            className="px-8 py-3 bg-primary hover:bg-primary/95 text-white font-bold rounded-xl text-xs transition-all shadow-md shadow-primary/20"
                                        >
                                            Xong
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}
            </div>

            <style>{`
                .custom-scrollbar::-webkit-scrollbar { height: 6px; width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: #f1f5f9; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
            `}</style>
        </div>
    );
}
