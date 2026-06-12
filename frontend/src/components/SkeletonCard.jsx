// src/components/SkeletonCard.jsx
export default function SkeletonCard() {
    return (
        <div className="surface-panel-flat overflow-hidden animate-pulse">
            {/* Image Skeleton */}
            <div className="relative h-52 w-full bg-surface-container">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent" />
            </div>

            {/* Content Skeleton */}
            <div className="p-4 space-y-3">
                <div className="h-5 bg-surface-container-high rounded-lg w-3/4" />
                <div className="h-3.5 bg-surface-container rounded-lg w-1/2" />

                <div className="flex justify-between items-center pt-3 border-t border-outline-variant/20">
                    <div className="space-y-1.5 w-1/3">
                        <div className="h-2.5 bg-surface-container rounded" />
                        <div className="h-5 bg-surface-container-high rounded w-4/5" />
                    </div>
                    <div className="h-9 bg-surface-container-high rounded-xl w-20" />
                </div>
            </div>
        </div>
    );
}
