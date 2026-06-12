// src/components/CourtCard.jsx
import { Link } from "react-router-dom";
import FavoriteButton from "@/components/FavoriteButton";

export default function CourtCard({ court }) {
    return (
        <article className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-outline-variant/70 bg-white shadow-[0_16px_45px_rgba(15,122,75,0.06)] transition-all duration-300 hover:-translate-y-1 hover:border-primary/25 hover:shadow-[0_22px_60px_rgba(15,122,75,0.12)]">
            {/* Image Container with Overlay Gradient */}
            <div className="relative h-52 overflow-hidden bg-surface-container">
                <img
                    alt={court.name}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                    src={court.images?.[0]?.imageUrl}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/5 to-transparent opacity-80 transition-opacity duration-300" />

                {/* Court Type Badge */}
                <span className={`absolute top-3 right-3 rounded-full px-2.5 py-1 text-[11px] font-bold shadow-lg backdrop-blur-sm ${court.type === "INDOOR" ? "bg-court-blue/90 text-white" : "bg-court-amber/95 text-white"}`}>
                    {court.type}
                </span>

                <div className="absolute top-3 left-3">
                    <FavoriteButton courtId={court._id} compact />
                </div>

                {/* Quick View Overlay */}
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white">
                    <div className="rounded-full bg-black/35 px-3 py-1.5 text-xs font-bold backdrop-blur-md">
                        {court.averageRating || 0}/5 sao
                    </div>
                    <div className="rounded-full bg-black/35 px-3 py-1.5 text-xs font-bold backdrop-blur-md">
                        {court.bookingCount || 0} lượt đặt
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="p-4 flex flex-grow flex-col justify-between">
                <div>
                    <h3 className="mb-1 line-clamp-1 text-lg font-black tracking-tight text-on-surface transition-colors duration-200 group-hover:text-primary" title={court.name}>
                        {court.name}
                    </h3>
                    <div className="flex items-center gap-1 text-on-surface-variant/70 text-sm mb-3">
                        <span className="material-symbols-outlined text-[16px]">location_on</span>
                        <span className="text-xs line-clamp-1">{court.address || court.location}</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-[11px] text-on-surface-variant mb-3">
                        <span className="inline-flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px]">star</span>
                            {court.averageRating || 0} ({court.reviewCount || 0})
                        </span>
                        <span className="inline-flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px]">favorite</span>
                            {court.favoriteCount || 0}
                        </span>
                        <span className="inline-flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px]">visibility</span>
                            {court.viewCount || 0}
                        </span>
                    </div>
                </div>

                {/* Price & Action */}
                <div className="flex items-center justify-between border-t border-outline-variant/50 pt-3">
                    <div>
                        <p className="text-[11px] font-bold text-outline">Chi phí từ</p>
                        <p className="text-xl font-bold text-primary tracking-tight">
                            {court.pricePerHour?.toLocaleString("vi-VN")}đ
                            <span className="text-xs font-normal text-on-surface-variant/60 ml-0.5">/giờ</span>
                        </p>
                    </div>
                    <Link
                        to={`/courts/${court._id}`}
                        className="group/btn rounded-xl bg-primary-container px-4 py-2 text-sm font-bold text-on-primary-container transition-all duration-200 hover:bg-primary hover:text-white"
                    >
                        Chi tiết
                        <span className="material-symbols-outlined ml-1 inline-block text-[16px] transition-transform group-hover/btn:translate-x-0.5">arrow_forward</span>
                    </Link>
                </div>
            </div>
        </article>
    );
}
