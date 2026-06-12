import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { courtService } from "@/services/court.service";
import CourtCard from "@/components/CourtCard";
import SkeletonCard from "@/components/SkeletonCard";

const heroImage = "https://res.cloudinary.com/djasmz67j/image/upload/v1779472663/7c3a1ab9-74f8-40df-b87a-379c18191099.png";

export default function Home() {
    const navigate = useNavigate();
    const [featuredCourts, setFeaturedCourts] = useState([]);
    const [searchLocation, setSearchLocation] = useState("");
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        courtService.getCourts({ limit: 3 })
            .then(res => {
                setFeaturedCourts(res?.success && Array.isArray(res.courts) ? res.courts : []);
            })
            .catch(() => setFeaturedCourts([]))
            .finally(() => setIsLoading(false));
    }, []);

    const handleSearchSubmit = (event) => {
        event.preventDefault();
        if (!searchLocation.trim()) return;
        navigate(`/courts?location=${encodeURIComponent(searchLocation.trim())}`);
    };

    return (
        <div className="bg-background">
            <section className="relative overflow-hidden bg-ink text-white">
                <div className="absolute inset-0">
                    <img
                        alt="Sân pickleball chuyên nghiệp"
                        className="h-full w-full object-cover opacity-58"
                        src={heroImage}
                    />
                    <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(11,20,16,0.94)_0%,rgba(11,20,16,0.76)_42%,rgba(11,20,16,0.18)_100%)]" />
                </div>

                <div className="app-shell relative grid min-h-[calc(100dvh-56px)] items-center gap-10 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:py-20">
                    <div className="max-w-3xl">
                        <p className="mb-5 inline-flex rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-bold text-white/85 backdrop-blur">
                            Đặt sân pickleball theo thời gian thực
                        </p>
                        <h1 className="text-balance text-5xl font-black leading-[0.98] tracking-tight md:text-6xl lg:text-7xl">
                            Chọn sân nhanh. Vào trận đúng giờ.
                        </h1>
                        <p className="mt-6 max-w-2xl text-base leading-8 text-white/76 md:text-lg">
                            PickleballPro gom lịch sân, thanh toán, dụng cụ thuê kèm và đánh giá đã xác thực vào một trải nghiệm gọn gàng cho người chơi bận rộn.
                        </p>

                        <form onSubmit={handleSearchSubmit} className="mt-8 max-w-2xl rounded-2xl border border-white/15 bg-white p-2 shadow-[0_30px_90px_rgba(0,0,0,0.28)]">
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                                <div className="flex min-w-0 flex-1 items-center gap-3 px-4">
                                    <span className="material-symbols-outlined text-primary text-[22px]">location_on</span>
                                    <input
                                        type="text"
                                        placeholder="Nhập khu vực, ví dụ Thủ Đức hoặc Quận 7"
                                        value={searchLocation}
                                        onChange={(event) => setSearchLocation(event.target.value)}
                                        className="min-w-0 flex-1 bg-transparent py-3 text-sm text-on-surface outline-none"
                                    />
                                </div>
                                <button type="submit" className="btn-primary whitespace-nowrap">
                                    Tìm sân
                                    <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                                </button>
                            </div>
                        </form>
                    </div>

                    <div className="hidden lg:block">
                        <div className="ml-auto max-w-md rounded-2xl border border-white/16 bg-white/10 p-5 backdrop-blur-md">
                            <div className="grid grid-cols-2 gap-3">
                                {[
                                    ["Slot realtime", "Không giữ lịch ảo"],
                                    ["Thanh toán", "QR chuyển khoản"],
                                    ["Điểm thưởng", "Sau đánh giá"],
                                    ["Dụng cụ", "Thuê kèm khi đặt"],
                                ].map(([title, text]) => (
                                    <div key={title} className="rounded-2xl bg-white/12 p-4">
                                        <p className="text-sm font-black">{title}</p>
                                        <p className="mt-2 text-xs leading-5 text-white/68">{text}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="app-shell py-14 lg:py-20">
                <div className="mb-9 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <h2 className="section-heading">Sân nổi bật</h2>
                        <p className="muted-copy mt-2 max-w-xl">Các cụm sân đang sẵn sàng đặt lịch, có ảnh thật, giá rõ ràng và thống kê tương tác.</p>
                    </div>
                    <Link to="/courts" className="btn-secondary w-fit">
                        Xem tất cả
                        <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                    </Link>
                </div>

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                    {isLoading ? (
                        [1, 2, 3].map(item => <SkeletonCard key={item} />)
                    ) : featuredCourts.length > 0 ? (
                        featuredCourts.map(court => <CourtCard key={court._id || court.id} court={court} />)
                    ) : (
                        <div className="surface-panel-flat col-span-full p-10 text-center">
                            <h3 className="text-xl font-black text-on-surface">Chưa có sân khả dụng</h3>
                            <p className="muted-copy mx-auto mt-2 max-w-lg">Khi admin thêm sân đang hoạt động, danh sách nổi bật sẽ tự cập nhật tại đây.</p>
                        </div>
                    )}
                </div>
            </section>

            <section className="border-y border-outline-variant/70 bg-white">
                <div className="app-shell grid gap-8 py-14 md:grid-cols-[0.9fr_1.1fr] lg:py-16">
                    <div>
                        <h2 className="section-heading">Một luồng đặt sân đủ rõ cho cả người chơi lẫn vận hành.</h2>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                        {[
                            ["Lịch sân trực quan", "Ma trận giờ giúp người chơi thấy ngay slot trống và slot đã kín."],
                            ["Chi phí minh bạch", "Tách tiền sân, thiết bị, phí hệ thống, coupon và điểm dùng trong checkout."],
                            ["Đánh giá xác thực", "Chỉ booking đã hoàn tất mới được đánh giá, hạn chế bình luận ảo."],
                            ["Admin gọn hơn", "Dashboard, đơn, thiết bị và coupon dùng cùng một ngôn ngữ giao diện."],
                        ].map(([title, text]) => (
                            <div key={title} className="rounded-2xl border border-outline-variant/70 bg-background p-5">
                                <h3 className="font-black text-on-surface">{title}</h3>
                                <p className="muted-copy mt-2">{text}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}
