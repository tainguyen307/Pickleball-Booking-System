// src/components/CourtCard.jsx
import { Link } from "react-router-dom";

export default function CourtCard({ court }) {
    return (
        <div className="group relative bg-surface-container-lowest rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-400 border border-outline-variant/40 hover:border-primary/20 flex flex-col justify-between">
            {/* Image Container with Overlay Gradient */}
            <div className="relative h-52 overflow-hidden bg-surface-container">
                <img
                    alt={court.name}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                    src={court.images?.[0]?.imageUrl}
                />
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Court Type Badge */}
                <span className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide shadow-lg backdrop-blur-sm ${court.type === "INDOOR" ? "bg-blue-500/90 text-white" : "bg-orange-500/90 text-white"}`}>
                    {court.type}
                </span>

                {/* Quick View Overlay */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 bg-black/50">
                    <span className="bg-white/90 text-primary px-4 py-2 rounded-full text-sm font-semibold backdrop-blur-sm transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                        Xem nhanh
                    </span>
                </div>
            </div>

            {/* Content */}
            <div className="p-4 flex-grow flex flex-col justify-between">
                <div>
                    <h3 className="font-semibold text-lg text-on-surface line-clamp-1 mb-1 group-hover:text-primary transition-colors duration-200" title={court.name}>
                        {court.name}
                    </h3>
                    <div className="flex items-center gap-1 text-on-surface-variant/70 text-sm mb-3">
                        <span className="material-symbols-outlined text-[16px]">location_on</span>
                        <span className="text-xs line-clamp-1">{court.address || court.location}</span>
                    </div>
                </div>

                {/* Price & Action */}
                <div className="flex justify-between items-center pt-3 border-t border-outline-variant/30">
                    <div>
                        <p className="text-[10px] text-outline/70 uppercase font-semibold tracking-wider">Chi phí từ</p>
                        <p className="text-xl font-bold text-primary tracking-tight">
                            {court.pricePerHour?.toLocaleString("vi-VN")}đ
                            <span className="text-xs font-normal text-on-surface-variant/60 ml-0.5">/giờ</span>
                        </p>
                    </div>
                    <Link
                        to={`/courts/${court._id}`}
                        className="group/btn bg-primary/5 border-2 border-primary/30 text-primary font-bold px-4 py-2 rounded-xl text-sm hover:bg-primary hover:border-primary hover:text-white transition-all duration-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0"
                    >
                        Chi tiết
                        <span className="inline-block ml-1 group-hover/btn:translate-x-0.5 transition-transform">→</span>
                    </Link>
                </div>
            </div>
        </div>
    );
}