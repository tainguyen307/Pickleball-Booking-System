// src/features/court/pages/CourtList.jsx
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { courtService } from "@/services/court.service";
import CourtCard from "@/components/CourtCard";
import SkeletonCard from "@/components/SkeletonCard";

export default function CourtList() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [courts, setCourts] = useState([]);
    const [pagination, setPagination] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    // State cục bộ cho form (chưa áp dụng)
    const [localSearch, setLocalSearch] = useState(searchParams.get("search") || "");
    const [localLocation, setLocalLocation] = useState(searchParams.get("location") || "");
    const [localMinPrice, setLocalMinPrice] = useState(searchParams.get("minPrice") || "");
    const [localMaxPrice, setLocalMaxPrice] = useState(searchParams.get("maxPrice") || "");

    // State đã được áp dụng (dùng để hiển thị chip)
    const [appliedSearch, setAppliedSearch] = useState(searchParams.get("search") || "");
    const [appliedLocation, setAppliedLocation] = useState(searchParams.get("location") || "");
    const [appliedMinPrice, setAppliedMinPrice] = useState(searchParams.get("minPrice") || "");
    const [appliedMaxPrice, setAppliedMaxPrice] = useState(searchParams.get("maxPrice") || "");

    const type = searchParams.get("type") || "";
    const page = searchParams.get("page") || "1";

    // Đồng bộ state cục bộ khi URL thay đổi từ bên ngoài
    useEffect(() => {
        const newSearch = searchParams.get("search") || "";
        const newLocation = searchParams.get("location") || "";
        const newMinPrice = searchParams.get("minPrice") || "";
        const newMaxPrice = searchParams.get("maxPrice") || "";

        setLocalSearch(newSearch);
        setLocalLocation(newLocation);
        setLocalMinPrice(newMinPrice);
        setLocalMaxPrice(newMaxPrice);

        setAppliedSearch(newSearch);
        setAppliedLocation(newLocation);
        setAppliedMinPrice(newMinPrice);
        setAppliedMaxPrice(newMaxPrice);
    }, [searchParams]);

    // Gọi API khi URL thay đổi
    useEffect(() => {
        let isMounted = true;
        setIsLoading(true);

        const params = Object.fromEntries([...searchParams]);
        if (!params.page) params.page = "1";

        courtService.getCourts(params)
            .then(res => {
                if (res.success && isMounted) {
                    setCourts(res.courts);
                    setPagination(res.pagination);
                }
            })
            .catch(err => console.error("Lỗi fetch danh sách sân:", err))
            .finally(() => {
                if (isMounted) setIsLoading(false);
            });

        return () => { isMounted = false; };
    }, [searchParams]);

    // Cập nhật filter dạng click (type, page) - Áp dụng ngay
    const updateFilter = (key, value) => {
        const newParams = new URLSearchParams(searchParams);
        newParams.set("page", "1");
        if (value) {
            newParams.set(key, value);
        } else {
            newParams.delete(key);
        }
        setSearchParams(newParams);
    };

    // Áp dụng bộ lọc từ sidebar
    const handleApplyFilters = (e) => {
        e.preventDefault();
        const newParams = new URLSearchParams(searchParams);
        newParams.set("page", "1");

        if (localSearch.trim()) newParams.set("search", localSearch.trim());
        else newParams.delete("search");

        if (localLocation.trim()) newParams.set("location", localLocation.trim());
        else newParams.delete("location");

        if (localMinPrice) newParams.set("minPrice", localMinPrice);
        else newParams.delete("minPrice");

        if (localMaxPrice) newParams.set("maxPrice", localMaxPrice);
        else newParams.delete("maxPrice");

        setSearchParams(newParams);
        setIsFilterOpen(false);

        // Cập nhật applied state
        setAppliedSearch(localSearch.trim());
        setAppliedLocation(localLocation.trim());
        setAppliedMinPrice(localMinPrice);
        setAppliedMaxPrice(localMaxPrice);
    };

    // Reset tất cả bộ lọc
    const handleResetAll = () => {
        setSearchParams({});
        setLocalSearch("");
        setLocalLocation("");
        setLocalMinPrice("");
        setLocalMaxPrice("");
        setAppliedSearch("");
        setAppliedLocation("");
        setAppliedMinPrice("");
        setAppliedMaxPrice("");
    };

    // Xóa một filter cụ thể
    const removeFilter = (filterName) => {
        const newParams = new URLSearchParams(searchParams);
        newParams.set("page", "1");
        newParams.delete(filterName);
        setSearchParams(newParams);

        if (filterName === "search") setLocalSearch("");
        if (filterName === "location") setLocalLocation("");
        if (filterName === "minPrice") setLocalMinPrice("");
        if (filterName === "maxPrice") setLocalMaxPrice("");
    };

    const hasActiveFilters = appliedSearch || appliedLocation || type || appliedMinPrice || appliedMaxPrice;

    return (
        <div className="min-h-screen bg-background">
            <div className="app-shell py-8 lg:py-10">

                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                    <div>
                        <h1 className="section-heading">
                            Khám phá sân bóng
                        </h1>
                        <p className="muted-copy mt-2">
                            {pagination.totalItems || 0} sân bóng đang chờ bạn
                        </p>
                    </div>

                    {/* Mobile filter button */}
                    <button
                        onClick={() => setIsFilterOpen(!isFilterOpen)}
                        className="btn-primary lg:hidden"
                    >
                        <span className="material-symbols-outlined text-[18px]">tune</span>
                        {hasActiveFilters ? "Đang lọc" : "Lọc sân"}
                        {hasActiveFilters && (
                            <span className="bg-white/20 px-1.5 py-0.5 rounded-full text-xs">
                                {[appliedSearch, appliedLocation, type, appliedMinPrice, appliedMaxPrice].filter(Boolean).length}
                            </span>
                        )}
                    </button>
                </div>

                <div className="flex flex-col lg:flex-row gap-6">
                    {/* Sidebar Filter - TO HƠN */}
                    <aside className={`
                        lg:w-96 lg:sticky lg:top-20 lg:h-[calc(100vh-5rem)] lg:overflow-y-auto
                        ${isFilterOpen ? "fixed inset-0 z-50 bg-black/50 lg:relative lg:bg-transparent" : "hidden lg:block"}
                    `}>
                        <form onSubmit={handleApplyFilters} className={`
                            surface-panel-flat
                            ${isFilterOpen ? "absolute inset-x-4 top-20 bottom-4 overflow-y-auto" : ""}
                            lg:relative lg:inset-auto lg:overflow-visible
                        `}>
                            {/* Filter header */}
                            <div className="flex items-center justify-between border-b border-outline-variant/60 p-5">
                                <div className="flex items-center gap-2">
                                    <span className="material-symbols-outlined text-primary text-[22px]">tune</span>
                                    <h2 className="text-lg font-black text-on-surface">Bộ lọc sân</h2>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setIsFilterOpen(false)}
                                    className="lg:hidden p-2 rounded-full hover:bg-surface-container transition-colors"
                                >
                                    <span className="material-symbols-outlined text-[20px]">close</span>
                                </button>
                            </div>

                            <div className="p-5 space-y-6">
                                {/* Ô tìm kiếm theo tên */}
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-on-surface flex items-center gap-1">
                                        <span className="material-symbols-outlined text-[18px]">search</span>
                                        Tìm kiếm
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Tên câu lạc bộ, thành phố, mã bưu điện..."
                                        value={localSearch}
                                        onChange={(e) => setLocalSearch(e.target.value)}
                                        className="field-control"
                                    />
                                </div>

                                {/* Khu vực */}
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-on-surface flex items-center gap-1">
                                        <span className="material-symbols-outlined text-[18px]">location_on</span>
                                        Khu vực / Quận huyện
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Ví dụ: Thủ Đức, Quận 7, Bình Thạnh..."
                                        value={localLocation}
                                        onChange={(e) => setLocalLocation(e.target.value)}
                                        className="field-control"
                                    />
                                </div>

                                {/* Loại sân - NÚT TO HƠN */}
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-on-surface">Loại sân</label>
                                    <div className="grid grid-cols-3 gap-3">
                                        {[
                                            { value: "", label: "Tất cả", icon: "grid_view" },
                                            { value: "INDOOR", label: "Trong nhà", icon: "home" },
                                            { value: "OUTDOOR", label: "Ngoài trời", icon: "park" }
                                        ].map((t) => (
                                            <button
                                                key={t.value}
                                                type="button"
                                                onClick={() => updateFilter("type", t.value)}
                                                className={`flex items-center justify-center gap-2 rounded-xl px-2 py-3.5 text-sm font-bold transition-all whitespace-nowrap ${
                                                    type === t.value
                                                        ? "bg-primary text-white shadow-md"
                                                        : "bg-white border border-outline-variant text-on-surface-variant hover:border-primary/35 hover:text-primary"
                                                }`}
                                            >
                                                <span className="material-symbols-outlined text-[20px]">{t.icon}</span>
                                                {t.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Khoảng giá */}
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-on-surface flex items-center gap-1">
                                        <span className="material-symbols-outlined text-[18px]">attach_money</span>
                                        Giá mỗi giờ
                                    </label>
                                    <div className="flex items-center gap-3">
                                        <div className="flex-1">
                                            <input
                                                type="number"
                                                placeholder="Từ (đ)"
                                                value={localMinPrice}
                                                onChange={(e) => setLocalMinPrice(e.target.value)}
                                                className="field-control px-3"
                                            />
                                        </div>
                                        <span className="text-outline text-sm">—</span>
                                        <div className="flex-1">
                                            <input
                                                type="number"
                                                placeholder="Đến (đ)"
                                                value={localMaxPrice}
                                                onChange={(e) => setLocalMaxPrice(e.target.value)}
                                                className="field-control px-3"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Action buttons */}
                                <div className="space-y-3 pt-2">
                                    <button
                                        type="submit"
                                        className="btn-primary w-full"
                                    >
                                        Áp dụng bộ lọc
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleResetAll}
                                        className="btn-secondary w-full"
                                    >
                                        Xóa tất cả
                                    </button>
                                </div>
                            </div>
                        </form>
                    </aside>

                    {/* Main Content */}
                    <main className="flex-1 space-y-6">
                        {/* Active filters display - CHỈ HIỂN THỊ SAU KHI ÁP DỤNG */}
                        {hasActiveFilters && (
                            <div className="flex flex-wrap items-center gap-2 pb-3 border-b border-outline-variant/30">
                                <span className="text-sm text-on-surface-variant">Đang lọc:</span>
                                {appliedSearch && (
                                    <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-primary/10 text-primary rounded-full text-xs font-medium">
                                        {appliedSearch.length > 20 ? appliedSearch.slice(0, 20) + "..." : appliedSearch}
                                        <button onClick={() => removeFilter("search")} className="hover:bg-primary/20 rounded-full p-0.5">
                                            <span className="material-symbols-outlined text-[12px]">close</span>
                                        </button>
                                    </span>
                                )}
                                {appliedLocation && (
                                    <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-primary/10 text-primary rounded-full text-xs font-medium">
                                        {appliedLocation}
                                        <button onClick={() => removeFilter("location")} className="hover:bg-primary/20 rounded-full p-0.5">
                                            <span className="material-symbols-outlined text-[12px]">close</span>
                                        </button>
                                    </span>
                                )}
                                {type && (
                                    <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-primary/10 text-primary rounded-full text-xs font-medium">
                                        {type === "INDOOR" ? "Trong nhà" : "Ngoài trời"}
                                        <button onClick={() => updateFilter("type", "")} className="hover:bg-primary/20 rounded-full p-0.5">
                                            <span className="material-symbols-outlined text-[12px]">close</span>
                                        </button>
                                    </span>
                                )}
                                {(appliedMinPrice || appliedMaxPrice) && (
                                    <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-primary/10 text-primary rounded-full text-xs font-medium">
                                        {appliedMinPrice || "0"}đ - {appliedMaxPrice || "∞"}đ
                                        <button onClick={() => { removeFilter("minPrice"); removeFilter("maxPrice"); }} className="hover:bg-primary/20 rounded-full p-0.5">
                                            <span className="material-symbols-outlined text-[12px]">close</span>
                                        </button>
                                    </span>
                                )}
                                <button
                                    onClick={handleResetAll}
                                    className="text-xs text-primary hover:underline ml-2"
                                >
                                    Xóa tất cả
                                </button>
                            </div>
                        )}

                        {/* Results header */}
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-bold text-on-background">
                                Sân khả dụng
                                <span className="text-outline text-sm font-medium ml-2">({pagination.totalItems || 0} kết quả)</span>
                            </h2>
                        </div>

                        {/* Courts Grid */}
                        {isLoading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                                {[1, 2, 3, 4, 5, 6].map(i => <SkeletonCard key={i} />)}
                            </div>
                        ) : courts.length === 0 ? (
                            <div className="surface-panel-flat py-16 text-center">
                                <div className="w-20 h-20 mx-auto bg-surface-container-high rounded-full flex items-center justify-center mb-4">
                                    <span className="material-symbols-outlined text-4xl text-outline">search_off</span>
                                </div>
                                <h3 className="text-xl font-black text-on-surface mb-2">Không tìm thấy sân bóng</h3>
                                <p className="text-on-surface-variant mb-6">Hãy thử điều chỉnh bộ lọc hoặc tìm kiếm khác nhé!</p>
                                <button
                                    onClick={handleResetAll}
                                    className="btn-primary"
                                >
                                    Xóa tất cả bộ lọc
                                </button>
                            </div>
                        ) : (
                            <>
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                                    {courts.map(court => (
                                        <CourtCard key={court._id} court={court} />
                                    ))}
                                </div>

                                {/* Pagination */}
                                {pagination.totalPages > 1 && (
                                    <div className="pt-8 flex justify-center items-center gap-1.5">
                                        <button
                                            disabled={parseInt(page) === 1}
                                            onClick={() => updateFilter("page", parseInt(page) - 1)}
                                            className="w-10 h-10 rounded-full border border-outline-variant flex items-center justify-center text-on-surface-variant hover:border-primary hover:text-primary transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                                        >
                                            <span className="material-symbols-outlined text-[20px]">chevron_left</span>
                                        </button>

                                        {[...Array(Math.min(pagination.totalPages, 5))].map((_, idx) => {
                                            const total = pagination.totalPages;
                                            const current = parseInt(page);
                                            let pNum;

                                            if (total <= 5) {
                                                pNum = idx + 1;
                                            } else if (current <= 3) {
                                                pNum = idx + 1;
                                                if (idx === 4) pNum = total;
                                            } else if (current >= total - 2) {
                                                pNum = total - 4 + idx;
                                            } else {
                                                pNum = current - 2 + idx;
                                                if (idx === 4) pNum = total;
                                            }

                                            if (idx === 3 && total > 5 && current < total - 2 && current > 3) {
                                                return <span key="ellipsis" className="px-2 text-on-surface-variant">...</span>;
                                            }

                                            return (
                                                <button
                                                    key={pNum}
                                                    onClick={() => updateFilter("page", pNum)}
                                                    className={`w-10 h-10 rounded-full font-medium text-sm transition-all ${
                                                        current === pNum
                                                            ? "bg-primary text-white shadow-sm"
                                                            : "text-on-surface-variant hover:bg-surface-container"
                                                    }`}
                                                >
                                                    {pNum}
                                                </button>
                                            );
                                        })}

                                        <button
                                            disabled={parseInt(page) === pagination.totalPages}
                                            onClick={() => updateFilter("page", parseInt(page) + 1)}
                                            className="w-10 h-10 rounded-full border border-outline-variant flex items-center justify-center text-on-surface-variant hover:border-primary hover:text-primary transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                                        >
                                            <span className="material-symbols-outlined text-[20px]">chevron_right</span>
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                    </main>
                </div>
            </div>
        </div>
    );
}
