import { useMemo, useState, useEffect } from "react";
import {
  getDashboardStats, getRevenueByCategory,
  getTopFacilitiesByRevenue, getMonthlyRevenueFiltered, getShipmentsFilteredByDate,
  facilityMap, productMap, supplierMap, CARBON_BY_PHASE,
} from "@/data";
import { useAppStore } from "@/store/useAppStore";
import { useSectionLoading } from "@/hooks/useLoading";
import KpiCard from "@/components/ui/KpiCard";
import RevenueBarChart from "@/components/charts/RevenueBarChart";
import ShipmentLineChart from "@/components/charts/ShipmentLineChart";
import DonutChart from "@/components/charts/DonutChart";
import Badge from "@/components/ui/Badge";
import FilterBar from "@/components/filters/FilterBar";
import ActiveFilterChips from "@/components/filters/ActiveFilterChips";
import MobileFilterSheet from "@/components/filters/MobileFilterSheet";
import {
  SkeletonCard,
  SkeletonChart,
  SkeletonTable,
  LoadingSpinner,
} from "@/components/ui/LoadingContent";
import { formatCurrency, formatPercent, formatDate, cn } from "@/lib/utils";
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import type { SortConfig } from "@/types";

const PAGE_SIZE = 8;

type ShipmentCol = "trackingNumber" | "value" | "status" | "shippedAt";

export default function Dashboard() {
  const { filters } = useAppStore();
  const globalSearch = useAppStore((s) => s.globalSearch);
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<SortConfig>({ key: "shippedAt", direction: "desc" });

  const kpiLoading = useSectionLoading();
  const chartsLoading = useSectionLoading();
  const tableLoading = useSectionLoading();

  useEffect(() => {
    kpiLoading.showWithDuration(800, 2000);
    chartsLoading.showWithDuration(1000, 2500);
    tableLoading.showWithDuration(1200, 2800);
  }, [filters, globalSearch]);

  const filteredShipments = useMemo(() => {
    let list = getShipmentsFilteredByDate(filters.dateRange.start, filters.dateRange.end);
    if (filters.regions.length > 0) {
      list = list.filter((s) => {
        const origin = facilityMap[s.originFacilityId];
        return origin && filters.regions.includes(origin.location.region);
      });
    }
    if (filters.statuses.length > 0) {
      list = list.filter((s) => filters.statuses.includes(s.status));
    }
    if (filters.products.length > 0) {
      list = list.filter((s) => {
        const p = productMap[s.productId];
        return p && filters.products.includes(p.category);
      });
    }
    if (globalSearch.trim()) {
      const q = globalSearch.toLowerCase();
      list = list.filter((s) => {
        const product  = productMap[s.productId];
        const supplier = supplierMap[s.supplierId];
        return (
          s.trackingNumber.toLowerCase().includes(q) ||
          product?.name.toLowerCase().includes(q) ||
          supplier?.name.toLowerCase().includes(q)
        );
      });
    }
    return list;
  }, [filters, globalSearch]);

  const sortedShipments = useMemo(() => {
    return [...filteredShipments].sort((a, b) => {
      const dir = sort.direction === "asc" ? 1 : -1;
      const key = sort.key as ShipmentCol;
      const av = a[key] ?? "";
      const bv = b[key] ?? "";
      if (typeof av === "number" && typeof bv === "number") return (av - bv) * dir;
      return String(av).localeCompare(String(bv)) * dir;
    });
  }, [filteredShipments, sort]);

  const totalPages = Math.max(1, Math.ceil(sortedShipments.length / PAGE_SIZE));
  const paginated = sortedShipments.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const toggleSort = (key: string) => {
    setSort((prev) =>
      prev.key === key
        ? { key, direction: prev.direction === "asc" ? "desc" : "asc" }
        : { key, direction: "desc" }
    );
    setPage(1);
  };

  // Stats based on filtered data
  const stats = useMemo(() => getDashboardStats(), []);

  const filteredRevenue = useMemo(
    () => getMonthlyRevenueFiltered(filters.dateRange.start, filters.dateRange.end),
    [filters.dateRange]
  );

  const filteredRevTotal = useMemo(
    () => filteredShipments.reduce((s, sh) => s + sh.value, 0),
    [filteredShipments]
  );

  const categoryRevenue = useMemo(() => getRevenueByCategory().slice(0, 7), []);
  const topFacilities = useMemo(() => getTopFacilitiesByRevenue(8), []);

  const kpis = [
    {
      label: "Total Shipments",
      value: String(filteredShipments.length),
      subValue: `${filteredShipments.filter((s) => s.status === "delivered").length} delivered`,
      trend: 8.3,
      trendLabel: "vs prior period",
      icon: "📦",
      color: "brand" as const,
    },
    {
      label: "Active Facilities",
      value: String(stats.activeFacilities),
      subValue: `of ${55} total`,
      trend: 3.1,
      trendLabel: "vs last quarter",
      icon: "🏗️",
      color: "success" as const,
    },
    {
      label: "Active Suppliers",
      value: String(stats.activeSuppliers),
      subValue: `${22 - stats.activeSuppliers} on hold`,
      trend: 4.2,
      trendLabel: "vs last quarter",
      icon: "🏭",
      color: "success" as const,
    },
    {
      label: "Revenue",
      value: formatCurrency(filteredRevTotal, true),
      subValue: formatPercent(stats.onTimeRate) + " on-time",
      trend: 12.4,
      trendLabel: "vs prior period",
      icon: "💰",
      color: "brand" as const,
    },
  ];

  const alertChips = [
    {
      label: "In Transit",
      value: filteredShipments.filter((s) => s.status === "in_transit").length,
      color: "text-brand",
    },
    {
      label: "Delayed",
      value: filteredShipments.filter((s) => s.status === "delayed").length,
      color: "text-danger",
    },
    {
      label: "Pending",
      value: filteredShipments.filter((s) => s.status === "pending").length,
      color: "text-warning",
    },
  ];

  const SortIcon = ({ col }: { col: string }) => {
    if (sort.key !== col) return <ChevronUp className="h-3 w-3 text-slate-300 dark:text-slate-600" aria-hidden="true" />;
    return sort.direction === "asc"
      ? <ChevronUp className="h-3 w-3 text-brand" aria-hidden="true" />
      : <ChevronDown className="h-3 w-3 text-brand" aria-hidden="true" />;
  };

  return (
    <div className="space-y-5" aria-label="Dashboard overview">

      {/* Filters row */}
      <div className="flex flex-wrap items-center gap-3 justify-between">
        {/* Desktop filters */}
        <div className="hidden lg:flex flex-wrap items-center gap-2 flex-1">
          <FilterBar />
        </div>
        {/* Mobile filter button */}
        <MobileFilterSheet />
        <ActiveFilterChips />
      </div>

      {/* KPI Grid */}
      <section aria-label="Key performance indicators">
        {kpiLoading.isLoading && kpiLoading.variant === "skeleton" ? (
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <SkeletonCard key={i} className="h-[130px]" />
            ))}
          </div>
        ) : kpiLoading.isLoading ? (
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-[130px] flex items-center justify-center bg-slate-100 dark:bg-white/[0.02] rounded-lg">
                <LoadingSpinner size="lg" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
            {kpis.map((kpi) => <KpiCard key={kpi.label} {...kpi} />)}
          </div>
        )}
      </section>

      {/* Alert chips */}
      <section className="grid grid-cols-3 gap-3" aria-label="Shipment status summary">
        {kpiLoading.isLoading ? (
          <>
            <div className="card px-4 py-3 flex items-center justify-between">
              <SkeletonCard className="h-3 w-16" />
              <SkeletonCard className="h-6 w-8" />
            </div>
            <div className="card px-4 py-3 flex items-center justify-between">
              <SkeletonCard className="h-3 w-16" />
              <SkeletonCard className="h-6 w-8" />
            </div>
            <div className="card px-4 py-3 flex items-center justify-between">
              <SkeletonCard className="h-3 w-16" />
              <SkeletonCard className="h-6 w-8" />
            </div>
          </>
        ) : (
          alertChips.map(({ label, value, color }) => (
            <div key={label} className="card px-4 py-3 flex items-center justify-between">
              <span className="text-xs text-slate-500 dark:text-slate-400">{label}</span>
              <span className={`font-heading text-xl font-bold ${color}`}>{value}</span>
            </div>
          ))
        )}
      </section>

      {/* Charts row 1 */}
      <section
        className="grid grid-cols-1 lg:grid-cols-3 gap-4"
        aria-label="Revenue and shipment trends"
        style={{ minHeight: 280 }}
      >
        {chartsLoading.isLoading && chartsLoading.variant === "skeleton" ? (
          <>
            <div className="lg:col-span-2">
              <SkeletonChart className="h-[260px]" />
            </div>
            <SkeletonChart className="h-[260px]" />
          </>
        ) : chartsLoading.isLoading ? (
          <>
            <div className="lg:col-span-2 flex items-center justify-center bg-slate-100 dark:bg-white/[0.02] rounded-lg">
              <LoadingSpinner size="lg" />
            </div>
            <div className="flex items-center justify-center bg-slate-100 dark:bg-white/[0.02] rounded-lg">
              <LoadingSpinner size="lg" />
            </div>
          </>
        ) : (
          <>
            <div className="lg:col-span-2">
              <ShipmentLineChart data={filteredRevenue} title="Revenue & Shipments Trend" />
            </div>
            <DonutChart
              data={CARBON_BY_PHASE}
              title="Carbon Footprint by Cycle Phase"
              centerValue="CO₂e"
              centerLabel="% share"
              formatter={(v) => `${v}%`}
            />
          </>
        )}
      </section>

      {/* Charts row 2 */}
      <section
        className="grid grid-cols-1 lg:grid-cols-2 gap-4"
        aria-label="Facility revenue and category breakdown"
        style={{ minHeight: 260 }}
      >
        {chartsLoading.isLoading ? (
          <>
            <SkeletonChart className="h-[260px]" />
            <SkeletonChart className="h-[260px]" />
          </>
        ) : (
          <>
            <RevenueBarChart data={topFacilities} title="Top 8 Facilities by Revenue" />
            <DonutChart
              data={categoryRevenue}
              title="Revenue by Product Category"
              formatter={(v) => formatCurrency(v, true)}
            />
          </>
        )}
      </section>

      {/* Recent shipments table */}
      <section className="card overflow-hidden" aria-label="Recent shipments">
        <div className="px-5 py-4 border-b border-slate-200 dark:border-white/10 flex items-center justify-between gap-3">
          <h2 className="font-heading text-sm font-semibold text-slate-900 dark:text-white">
            Recent Shipments
          </h2>
          <span className="text-xs text-slate-400 dark:text-slate-500">
            {tableLoading.isLoading ? "—" : `${filteredShipments.length} results`}
          </span>
        </div>

        {tableLoading.isLoading && tableLoading.variant === "skeleton" ? (
          <SkeletonTable rows={8} cols={7} />
        ) : tableLoading.isLoading ? (
          <div className="flex items-center justify-center py-20">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
        <>
        {/* Mobile card list */}
        <div className="lg:hidden divide-y divide-slate-100 dark:divide-white/5">
          {paginated.map((s, idx) => {
            const product  = productMap[s.productId];
            const supplier = supplierMap[s.supplierId];
            return (
              <div key={s.id} className={cn("px-4 py-3 flex items-start justify-between gap-3", idx % 2 !== 0 && "bg-slate-100/70 dark:bg-white/[0.042]")}>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge status={s.status} />
                    <span className="font-mono text-xs text-slate-400">{s.trackingNumber}</span>
                  </div>
                  <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                    {product?.name ?? "—"}
                  </p>
                  <p className="text-xs text-slate-400 truncate mt-0.5">{supplier?.name ?? "—"}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">{formatCurrency(s.value, true)}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{formatDate(s.shippedAt)}</p>
                </div>
              </div>
            );
          })}
          {paginated.length === 0 && (
            <div className="px-4 py-8 text-center text-sm text-slate-400">
              No shipments match the current filters.
            </div>
          )}
        </div>

        {/* Desktop table */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="min-w-full" role="table">
            <thead>
              <tr className="border-b border-slate-200 dark:border-white/10">
                {[
                  { label: "Tracking #", key: "trackingNumber" },
                  { label: "Product",    key: null },
                  { label: "Supplier",   key: null },
                  { label: "Route",      key: null },
                  { label: "Value",      key: "value" },
                  { label: "Status",     key: "status" },
                  { label: "Date",       key: "shippedAt" },
                ].map(({ label, key }) => (
                  <th
                    key={label}
                    scope="col"
                    className={cn("th", key && "cursor-pointer select-none hover:text-brand")}
                    onClick={() => key && toggleSort(key)}
                    aria-sort={
                      key && sort.key === key
                        ? sort.direction === "asc" ? "ascending" : "descending"
                        : undefined
                    }
                  >
                    <span className="flex items-center gap-1">
                      {label}
                      {key && <SortIcon col={key} />}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginated.map((s, idx) => {
                const product  = productMap[s.productId];
                const supplier = supplierMap[s.supplierId];
                const origin   = facilityMap[s.originFacilityId];
                const dest     = facilityMap[s.destinationFacilityId];
                return (
                  <tr key={s.id} className={cn("tr", idx % 2 !== 0 && "bg-slate-100/70 dark:bg-white/[0.042]")}>
                    <td className="td font-mono text-xs text-slate-400 dark:text-slate-400">
                      {s.trackingNumber}
                    </td>
                    <td className="td font-medium text-slate-900 dark:text-white max-w-[140px] truncate">
                      {product?.name ?? "—"}
                    </td>
                    <td className="td text-slate-500 dark:text-slate-400 max-w-[120px] truncate">
                      {supplier?.name ?? "—"}
                    </td>
                    <td className="td text-slate-400 dark:text-slate-500 text-xs whitespace-nowrap">
                      {origin?.location.city ?? "?"} → {dest?.location.city ?? "?"}
                    </td>
                    <td className="td font-medium text-slate-900 dark:text-white whitespace-nowrap">
                      {formatCurrency(s.value, true)}
                    </td>
                    <td className="td"><Badge status={s.status} /></td>
                    <td className="td text-slate-400 dark:text-slate-500 text-xs whitespace-nowrap">
                      {formatDate(s.shippedAt)}
                    </td>
                  </tr>
                );
              })}
              {paginated.length === 0 && (
                <tr>
                  <td colSpan={7} className="td text-center text-sm text-slate-400 py-8">
                    No shipments match the current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-5 py-3 border-t border-slate-200 dark:border-white/10 flex items-center justify-between gap-2">
            <p className="text-xs text-slate-400 dark:text-slate-500">
              Page {page} of {totalPages}
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1.5 rounded-lg disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
                aria-label="Previous page"
              >
                <ChevronLeft className="h-4 w-4" aria-hidden="true" />
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const p = Math.max(1, Math.min(totalPages - 4, page - 2)) + i;
                return (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={cn(
                      "h-7 w-7 rounded-lg text-xs font-medium transition-colors",
                      p === page
                        ? "bg-brand text-white"
                        : "text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-white/10"
                    )}
                    aria-label={`Page ${p}`}
                    aria-current={p === page ? "page" : undefined}
                  >
                    {p}
                  </button>
                );
              })}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-1.5 rounded-lg disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
                aria-label="Next page"
              >
                <ChevronRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        )}
        </>
        )}
      </section>
    </div>
  );
}
