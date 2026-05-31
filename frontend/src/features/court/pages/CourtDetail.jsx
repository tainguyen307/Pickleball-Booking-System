// src/features/court/pages/CourtDetail.jsx
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { courtService } from "@/services/court.service";

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
                        <div className="h-8 bg-surface-variant/40 rounded w-1/4" />
                        <div className="h-96 bg-gradient-to-br from-surface-variant/40 to-surface-variant/20 rounded-2xl" />
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-2 space-y-6">
                                <div className="h-32 bg-surface-variant/40 rounded-2xl" />
                                <div className="h-48 bg-surface-variant/40 rounded-2xl" />
                            </div>
                            <div className="h-96 bg-surface-variant/40 rounded-2xl" />
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
                                            <span key={star} className="material-symbols-outlined text-[18px] text-amber-400" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                                        ))}
                                    </div>
                                    <span className="font-semibold text-on-surface">5.0</span>
                                    <span className="text-on-surface-variant">(142 đánh giá)</span>
                                </div>
                                <div className="w-1 h-1 bg-outline-variant rounded-full" />
                                <div className="flex items-center gap-1.5 text-on-surface-variant">
                                    <span className="material-symbols-outlined text-[18px]">location_on</span>
                                    <span>{court.address || court.location}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Lưới ảnh Bento Gallery bốc URL Cloudinary */}
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-3 h-[450px] lg:h-[500px]">
                        <div className="lg:col-span-3 relative rounded-2xl overflow-hidden bg-surface-container-high group">
                            <img
                                src={images[activeImageIndex]}
                                alt={court.name}
                                crossOrigin="anonymous" // 🎯 FIX COEP BẢO MẬT TRÌNH DUYỆT
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
                                        crossOrigin="anonymous" // 🎯 FIX COEP BẢO MẬT TRÌNH DUYỆT
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
                                        <div className="w-56 shrink-0 pl-6 text-xs font-black text-outline uppercase tracking-wider">Danh sách sân nhỏ</div>
                                        <div className="flex flex-grow justify-between">
                                            {globalTimeSlots.map((time) => (
                                                <div key={time} className="w-16 text-center text-[11px] font-black text-on-surface-variant tracking-tighter border-l border-outline-variant/10">{time}</div>
                                            ))}
                                        </div>
                                    </div>

                                    {subCourtsTimeline.length === 0 ? (
                                        <div className="text-center py-12 text-sm font-semibold text-outline-variant bg-surface-container-low/20">
                                            📭 Cụm sân này hiện tại chưa được cấu hình các sân thi đấu nhỏ bên trong!
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
                            <div className="bg-gradient-to-br from-primary/5 to-primary/2 rounded-2xl p-4 border border-primary/10 flex items-center gap-3">
                                <span className="material-symbols-outlined text-2xl text-primary">sports_tennis</span>
                                <div>
                                    <p className="text-[10px] text-outline uppercase font-bold tracking-wide">Môi trường</p>
                                    <p className="font-bold text-sm text-on-surface mt-0.5">{court.type === "INDOOR" ? "Sân Trong nhà" : "Sân Ngoài trời"}</p>
                                </div>
                            </div>
                            <div className="bg-gradient-to-br from-primary/5 to-primary/2 rounded-2xl p-4 border border-primary/10 flex items-center gap-3">
                                <span className="material-symbols-outlined text-2xl text-primary">schedule</span>
                                <div>
                                    <p className="text-[10px] text-outline uppercase font-bold tracking-wide">Thời gian hoạt động</p>
                                    <p className="font-bold text-sm text-on-surface mt-0.5">{court.openTime || "06:00"} - {court.closeTime || "22:00"}</p>
                                </div>
                            </div>
                            <div className="bg-gradient-to-br from-primary/5 to-primary/2 rounded-2xl p-4 border border-primary/10 flex items-center gap-3">
                                <span className="material-symbols-outlined text-2xl text-primary">timer</span>
                                <div>
                                    <p className="text-[10px] text-outline uppercase font-bold tracking-wide">Thời lượng block</p>
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
                        <div className="sticky top-24 bg-surface-container-lowest rounded-2xl shadow-xl border border-outline-variant/40 overflow-hidden">
                            <div className="p-5 bg-gradient-to-r from-primary/10 to-transparent border-b border-outline-variant/30">
                                <span className="text-xs font-black text-primary uppercase tracking-widest block mb-1">Chi phí gốc cơ sở</span>
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