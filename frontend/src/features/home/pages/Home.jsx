// src/features/home/pages/Home.jsx
import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { courtService } from "@/services/court.service";
import CourtCard from "@/components/CourtCard";
import SkeletonCard from "@/components/SkeletonCard";

export default function Home() {
    const navigate = useNavigate();
    const [featuredCourts, setFeaturedCourts] = useState([]);
    const [searchLocation, setSearchLocation] = useState("");
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        courtService.getCourts({ limit: 3 })
            .then(res => {
                if (res?.success && Array.isArray(res.courts)) {
                    setFeaturedCourts(res.courts);
                } else {
                    setFeaturedCourts([]);
                }
            })
            .catch(err => {
                console.error("Lỗi fetch sân nổi bật:", err);
                setFeaturedCourts([]);
            })
            .finally(() => setIsLoading(false));
    }, []);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (!searchLocation.trim()) return;
        navigate(`/courts?location=${encodeURIComponent(searchLocation.trim())}`);
    };

    return (
        <div>
            {/* 🎯 HERO BANNER SECTION */}
            <section className="relative h-[680px] flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <img
                        alt="Professional Pickleball Court"
                        className="w-full h-full object-cover brightness-50"
                        src="https://res.cloudinary.com/djasmz67j/image/upload/v1779472663/7c3a1ab9-74f8-40df-b87a-379c18191099.png"
                    />
                </div>
                <div className="relative z-10 text-center px-6 max-w-5xl">
                    <h1 className="font-display-lg text-display-lg text-white mb-4 tracking-tight leading-tight">
                        Master the Court with Precision
                    </h1>
                    <p className="font-body-lg text-body-lg text-white/90 mb-8 max-w-2xl mx-auto">
                        Book premium pickleball courts, join elite tournaments, and connect with a thriving community of enthusiasts.
                    </p>

                    <form onSubmit={handleSearchSubmit} className="max-w-2xl mx-auto bg-white p-2 rounded-full shadow-lg flex items-center gap-1">
                        <div className="flex items-center gap-2 flex-grow pl-5">
                            <span className="material-symbols-outlined text-primary text-[22px]">location_on</span>
                            <input
                                type="text"
                                placeholder="Bạn muốn chơi ở khu vực nào? (Ví dụ: Thủ Đức, Quận 7...)"
                                value={searchLocation}
                                onChange={(e) => setSearchLocation(e.target.value)}
                                className="w-full bg-transparent focus:outline-none text-sm text-on-surface placeholder:text-outline/60 py-3"
                            />
                        </div>
                        <button type="submit" className="bg-primary hover:bg-primary/90 text-white px-8 py-3 text-sm font-semibold rounded-full transition-all shadow-md">
                            Tìm Sân Ngay
                        </button>
                    </form>
                </div>
            </section>

            {/* 🏟️ FEATURED COURTS SECTION */}
            <section className="py-16 px-2 max-w-[1400px] mx-auto">
                <div className="flex items-center gap-6 mb-10">
                    <h2 className="text-3xl font-bold text-on-surface whitespace-nowrap">Featured Courts</h2>
                    <div className="flex-1 h-px bg-outline-variant/50"></div>
                    <Link to="/courts" className="text-primary font-semibold flex items-center gap-1 hover:gap-2 transition-all text-sm">
                        View All <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {isLoading ? (
                        [1, 2, 3].map(i => <SkeletonCard key={i} />)
                    ) : featuredCourts.length > 0 ? (
                        featuredCourts.map(court => <CourtCard key={court._id || court.id} court={court} />)
                    ) : (
                        // Hiển thị placeholder khi không có dữ liệu
                        [1, 2, 3].map(i => (
                            <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-outline-variant/30">
                                <div className="h-48 bg-gradient-to-br from-surface-variant/60 to-surface-variant/30" />
                                <div className="p-4">
                                    <div className="h-5 bg-surface-variant/50 rounded w-3/4 mb-2" />
                                    <div className="h-4 bg-surface-variant/40 rounded w-1/2 mb-3" />
                                    <div className="flex justify-between">
                                        <div className="h-4 bg-surface-variant/40 rounded w-1/4" />
                                        <div className="h-4 bg-surface-variant/40 rounded w-1/6" />
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </section>

            {/* 💎 WHY CHOOSE US SECTION */}
            <section className="bg-surface-container-low py-16">
                <div className="px-6 max-w-7xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-on-surface mb-2">Why Choose PickleballPro</h2>
                        <p className="text-on-surface-variant">The definitive platform for the modern player.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="flex flex-col items-center text-center p-6 bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300">
                            <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                                <span className="material-symbols-outlined text-2xl text-primary">bolt</span>
                            </div>
                            <h4 className="text-xl font-semibold mb-2">Instant Booking</h4>
                            <p className="text-sm text-on-surface-variant leading-relaxed">Reserve your favorite court in seconds with real-time availability and instant confirmation.</p>
                        </div>
                        <div className="flex flex-col items-center text-center p-6 bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300">
                            <div className="w-14 h-14 bg-secondary/10 rounded-full flex items-center justify-center mb-4">
                                <span className="material-symbols-outlined text-2xl text-secondary">groups</span>
                            </div>
                            <h4 className="text-xl font-semibold mb-2">Matchmaking</h4>
                            <p className="text-sm text-on-surface-variant leading-relaxed">Find players at your exact skill level using our advanced rating and matchmaking system.</p>
                        </div>
                        <div className="flex flex-col items-center text-center p-6 bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300">
                            <div className="w-14 h-14 bg-tertiary/10 rounded-full flex items-center justify-center mb-4">
                                <span className="material-symbols-outlined text-2xl text-tertiary">emoji_events</span>
                            </div>
                            <h4 className="text-xl font-semibold mb-2">Tournaments</h4>
                            <p className="text-sm text-on-surface-variant leading-relaxed">Access exclusive local and national tournaments with professional bracket management.</p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}