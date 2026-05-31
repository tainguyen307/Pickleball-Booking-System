// src/components/SkeletonCard.jsx
export default function SkeletonCard() {
    return (
        <div className="bg-surface-container-lowest rounded-2xl overflow-hidden border border-outline-variant/30 shadow-sm animate-pulse">
            {/* Image Skeleton */}
            <div className="relative h-52 bg-gradient-to-br from-surface-variant/60 to-surface-variant/30 w-full">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
            </div>

            {/* Content Skeleton */}
            <div className="p-4 space-y-3">
                <div className="h-5 bg-surface-variant/50 rounded-lg w-3/4" />
                <div className="h-3.5 bg-surface-variant/40 rounded-lg w-1/2" />

                <div className="flex justify-between items-center pt-3 border-t border-outline-variant/20">
                    <div className="space-y-1.5 w-1/3">
                        <div className="h-2.5 bg-surface-variant/40 rounded" />
                        <div className="h-5 bg-surface-variant/50 rounded w-4/5" />
                    </div>
                    <div className="h-9 bg-surface-variant/50 rounded-xl w-20" />
                </div>
            </div>
        </div>
    );
}