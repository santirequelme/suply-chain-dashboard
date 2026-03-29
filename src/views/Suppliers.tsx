import { useState, useMemo, useEffect } from "react";
import {
  suppliers, products, shipments, getSuppliersByTier,
  getShipmentsFilteredByDate,
} from "@/data";
import { useAppStore } from "@/store/useAppStore";
import { useSectionLoading } from "@/hooks/useLoading";
import Badge from "@/components/ui/Badge";
import FilterBar from "@/components/filters/FilterBar";
import ActiveFilterChips from "@/components/filters/ActiveFilterChips";
import MobileFilterSheet from "@/components/filters/MobileFilterSheet";
import RevenueBarChart from "@/components/charts/RevenueBarChart";
import {
  SkeletonChart,
  SkeletonTable,
  LoadingSpinner,
} from "@/components/ui/LoadingContent";
import { formatCurrency, formatPercent, cn } from "@/lib/utils";
import {
  TrendingUp, TrendingDown, Star, ChevronDown, ChevronUp,
  ChevronLeft, ChevronRight, Mail, Phone, Package, Ship,
} from "lucide-react";

const SUPPLIER_STATUSES = ["active", "inactive", "on_hold"];
const PAGE_SIZE = 10;

function RatingStars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`Rating: ${rating} out of 5`}>
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={cn("h-3 w-3", i < Math.round(rating) ? "text-warning fill-warning" : "text-slate-300 dark:text-slate-600")}
          aria-hidden="true"
        />
      ))}
      <span className="text-xs text-slate-400 ml-1">{rating.toFixed(1)}</span>
    </div>
  );
}

function TierBadge({ tier }: { tier: string }) {
  const colors: Record<string, string> = {
    "Tier 1": "bg-brand/10 text-brand dark:bg-brand/20 dark:text-blue-300 border-brand/20",
    "Tier 2": "bg-success/10 text-success dark:bg-success/20 border-success/20",
    "Tier 3": "bg-warning/10 text-warning dark:bg-warning/20 border-warning/20",
  };
  return (
    <span className={cn("text-xs font-medium px-2.5 py-0.5 rounded-full border", colors[tier] ?? "bg-slate-100 text-slate-600 border-slate-200 dark:bg-white/5 dark:text-slate-400 dark:border-white/10")}>
      {tier}
    </span>
  );
}

function OnTimeBadge({ value }: { value: number }) {
  const good = value >= 90;
  const ok   = value >= 80;
  return (
    <span className={cn("inline-flex items-center gap-1 text-xs font-semibold", good ? "text-success" : ok ? "text-warning" : "text-danger")}>
      {good ? <TrendingUp className="h-3 w-3" aria-hidden="true" /> : <TrendingDown className="h-3 w-3" aria-hidden="true" />}
      {value.toFixed(1)}%
    </span>
  );
}

function ExpandedSupplier({ supplier }: { supplier: typeof suppliers[0] }) {
  const supplierProducts = products.filter((p) => p.supplierId === supplier.id);
  const supplierShipments = shipments.filter((s) => s.supplierId === supplier.id).slice(0, 5);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-4 px-4 bg-slate-50 dark:bg-white/[0.02] border-t border-slate-100 dark:border-white/5">
      {/* Contact */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">Contact</p>
        <div className="space-y-1.5">
          <p className="text-sm font-medium text-slate-900 dark:text-white">{supplier.contact.name}</p>
          <a href={`mailto:${supplier.contact.email}`} className="flex items-center gap-1.5 text-xs text-brand hover:underline">
            <Mail className="h-3 w-3" aria-hidden="true" /> {supplier.contact.email}
          </a>
          <p className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <Phone className="h-3 w-3" aria-hidden="true" /> {supplier.contact.phone}
          </p>
        </div>
      </div>

      {/* Products */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
          Products <span className="text-brand">({supplierProducts.length})</span>
        </p>
        <div className="space-y-1">
          {supplierProducts.slice(0, 4).map((p) => (
            <div key={p.id} className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1 text-slate-700 dark:text-slate-300">
                <Package className="h-3 w-3 text-slate-400" aria-hidden="true" />
                <span className="truncate max-w-[130px]">{p.name}</span>
              </span>
              <Badge status={p.status} />
            </div>
          ))}
          {supplierProducts.length > 4 && (
            <p className="text-xs text-slate-400">+{supplierProducts.length - 4} more</p>
          )}
        </div>
      </div>

      {/* Recent shipments */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
          Recent Shipments
        </p>
        <div className="space-y-1">
          {supplierShipments.map((s) => (
            <div key={s.id} className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400 font-mono">
                <Ship className="h-3 w-3 text-slate-400" aria-hidden="true" />
                {s.trackingNumber}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-slate-700 dark:text-slate-300">{formatCurrency(s.value, true)}</span>
                <Badge status={s.status} />
              </div>
            </div>
          ))}
          {supplierShipments.length === 0 && (
            <p className="text-xs text-slate-400">No shipments found</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Suppliers() {
  const { filters } = useAppStore();
  const globalSearch = useAppStore((s) => s.globalSearch);
  const [page, setPage] = useState(1);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const kpiLoading = useSectionLoading();
  const chartLoading = useSectionLoading();
  const tableLoading = useSectionLoading();

  useEffect(() => {
    kpiLoading.showWithDuration(800, 2000);
    chartLoading.showWithDuration(1000, 2500);
    tableLoading.showWithDuration(1200, 2800);
  }, [filters, globalSearch]);

  const tierData = useMemo(() => getSuppliersByTier().map((t) => ({ name: t.name, revenue: t.value })), []);

  const filteredByDate = useMemo(
    () => getShipmentsFilteredByDate(filters.dateRange.start, filters.dateRange.end),
    [filters.dateRange]
  );

  const filtered = useMemo(() => {
    let list = [...suppliers];
    if (globalSearch.trim()) {
      const q = globalSearch.toLowerCase();
      list = list.filter((s) => s.name.toLowerCase().includes(q) || s.category.toLowerCase().includes(q));
    }
    if (filters.regions.length > 0) list = list.filter((s) => filters.regions.includes(s.region));
    if (filters.statuses.length > 0) list = list.filter((s) => filters.statuses.includes(s.status));
    // Apply tier filter via products filter field
    if (filters.products.length > 0) list = list.filter((s) => filters.products.includes(s.category));
    return list;
  }, [globalSearch, filters]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const dir = sortDir === "asc" ? 1 : -1;
      const av = (a as unknown as Record<string, unknown>)[sortKey];
      const bv = (b as unknown as Record<string, unknown>)[sortKey];
      if (typeof av === "number" && typeof bv === "number") return (av - bv) * dir;
      return String(av ?? "").localeCompare(String(bv ?? "")) * dir;
    });
  }, [filtered, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const paginated = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const toggleSort = (key: string) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("asc"); }
    setPage(1);
  };

  const avgOnTime = filtered.reduce((sum, s) => sum + s.onTimeDelivery, 0) / (filtered.length || 1);
  const avgRating = filtered.reduce((sum, s) => sum + s.rating, 0) / (filtered.length || 1);
  const activeSupplierShipments = filteredByDate.filter((sh) =>
    filtered.some((s) => s.id === sh.supplierId)
  ).length;

  const SortIcon = ({ col }: { col: string }) =>
    sortKey !== col ? <ChevronUp className="h-3 w-3 opacity-30" aria-hidden="true" /> :
      sortDir === "asc" ? <ChevronUp className="h-3 w-3 text-brand" aria-hidden="true" /> :
        <ChevronDown className="h-3 w-3 text-brand" aria-hidden="true" />;

  const headers: { label: string; key: string }[] = [
    { label: "Supplier",    key: "name" },
    { label: "Tier",        key: "tier" },
    { label: "Category",    key: "category" },
    { label: "Status",      key: "status" },
    { label: "Region",      key: "region" },
    { label: "Rating",      key: "rating" },
    { label: "On-Time",     key: "onTimeDelivery" },
    { label: "Defect Rate", key: "defectRate" },
    { label: "Revenue",     key: "revenue" },
  ];

  return (
    <div className="space-y-5">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 justify-between">
        <div className="hidden lg:flex flex-wrap gap-2 flex-1">
          <FilterBar statusOptions={SUPPLIER_STATUSES} show={{ dateRange: true, regions: true, statuses: true, suppliers: true }} />
        </div>
        <MobileFilterSheet statusOptions={SUPPLIER_STATUSES} />
        <ActiveFilterChips />
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {kpiLoading.isLoading ? (
          <>
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="card px-4 py-3 text-center">
                <div className="h-7 w-20 mx-auto bg-slate-200 dark:bg-slate-700/50 animate-pulse rounded" />
                <div className="h-3 w-24 mx-auto mt-2 bg-slate-200 dark:bg-slate-700/50 animate-pulse rounded" />
              </div>
            ))}
          </>
        ) : (
          [
            { label: "Total Suppliers",  value: String(filtered.length) },
            { label: "Active",           value: String(filtered.filter((s) => s.status === "active").length) },
            { label: "Avg On-Time",      value: formatPercent(avgOnTime) },
            { label: "Period Shipments", value: String(activeSupplierShipments) },
          ].map(({ label, value }) => (
            <div key={label} className="card px-4 py-3 text-center">
              <p className="text-xl font-heading font-bold text-slate-900 dark:text-white">{value}</p>
              <p className="text-xs text-slate-400 mt-0.5">{label}</p>
            </div>
          ))
        )}
      </div>

      {/* Tier chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {chartLoading.isLoading && chartLoading.variant === "skeleton" ? (
          <>
            <SkeletonChart className="lg:col-span-2 h-[260px]" />
            <SkeletonChart className="h-[260px]" />
          </>
        ) : chartLoading.isLoading ? (
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
          <RevenueBarChart data={tierData} title="Suppliers by Tier" valueLabel="Suppliers" isCurrency={false} />
        </div>
        <div className="card p-5 flex flex-col justify-between">
          <p className="text-sm font-semibold text-slate-900 dark:text-white mb-3">Performance Summary</p>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-500 dark:text-slate-400">Avg On-Time Rate</span>
                <span className="font-medium text-slate-900 dark:text-white">{formatPercent(avgOnTime)}</span>
              </div>
              <div className="h-1.5 rounded-full bg-slate-100 dark:bg-white/10">
                <div className="h-full rounded-full bg-success" style={{ width: `${Math.min(100, avgOnTime)}%` }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-500 dark:text-slate-400">Avg Rating</span>
                <span className="font-medium text-slate-900 dark:text-white">{avgRating.toFixed(1)} / 5.0</span>
              </div>
              <div className="h-1.5 rounded-full bg-slate-100 dark:bg-white/10">
                <div className="h-full rounded-full bg-brand" style={{ width: `${(avgRating / 5) * 100}%` }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-500 dark:text-slate-400">Active Rate</span>
                <span className="font-medium text-slate-900 dark:text-white">
                  {formatPercent((filtered.filter((s) => s.status === "active").length / (filtered.length || 1)) * 100)}
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-slate-100 dark:bg-white/10">
                <div
                  className="h-full rounded-full bg-warning"
                  style={{ width: `${(filtered.filter((s) => s.status === "active").length / (filtered.length || 1)) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>
          </>
        )}
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-200 dark:border-white/10 flex items-center justify-between">
          <p className="text-sm font-semibold text-slate-900 dark:text-white">Suppliers</p>
          <span className="text-xs text-slate-400">{tableLoading.isLoading ? "—" : `${filtered.length} records`}</span>
        </div>
        {tableLoading.isLoading && tableLoading.variant === "skeleton" ? (
          <SkeletonTable rows={10} cols={6} />
        ) : tableLoading.isLoading ? (
          <div className="flex items-center justify-center py-20">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
        <>
        {/* Mobile card list */}
        <div className="lg:hidden divide-y divide-slate-100 dark:divide-white/5">
          {paginated.map((s, idx) => {
            const isExpanded = expandedId === s.id;
            return (
              <div key={s.id} className={cn(!isExpanded && idx % 2 !== 0 && "bg-slate-100/70 dark:bg-white/[0.042]")}>
                <button
                  className="w-full px-4 py-3 flex items-center justify-between gap-3 text-left active:bg-slate-50 dark:active:bg-white/5 transition-colors"
                  onClick={() => setExpandedId(isExpanded ? null : s.id)}
                  aria-expanded={isExpanded}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <TierBadge tier={s.tier} />
                      <Badge status={s.status} />
                    </div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{s.name}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{s.country} · {s.category}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{formatCurrency(s.revenue, true)}</p>
                    <OnTimeBadge value={s.onTimeDelivery} />
                    {isExpanded
                      ? <ChevronUp className="h-4 w-4 text-brand ml-auto mt-1" aria-hidden="true" />
                      : <ChevronDown className="h-4 w-4 text-slate-400 ml-auto mt-1" aria-hidden="true" />}
                  </div>
                </button>
                {isExpanded && <ExpandedSupplier supplier={s} />}
              </div>
            );
          })}
          {paginated.length === 0 && (
            <div className="px-4 py-8 text-center text-sm text-slate-400">No suppliers match the current filters.</div>
          )}
        </div>

        {/* Desktop table */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="min-w-full" role="table">
            <thead>
              <tr className="border-b border-slate-200 dark:border-white/10">
                <th scope="col" className="th w-10" aria-label="Expand row" />
                {headers.map(({ label, key }) => (
                  <th
                    key={key}
                    scope="col"
                    className="th cursor-pointer select-none hover:text-brand"
                    onClick={() => toggleSort(key)}
                    aria-sort={sortKey === key ? (sortDir === "asc" ? "ascending" : "descending") : undefined}
                  >
                    <span className="inline-flex items-center gap-1">{label}<SortIcon col={key} /></span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginated.map((s, idx) => {
                const isExpanded = expandedId === s.id;
                return (
                  <>
                    <tr
                      key={s.id}
                      className={cn("tr cursor-pointer", isExpanded ? "bg-slate-50 dark:bg-white/[0.02]" : idx % 2 !== 0 && "bg-slate-100/70 dark:bg-white/[0.042]")}
                      onClick={() => setExpandedId(isExpanded ? null : s.id)}
                      aria-expanded={isExpanded}
                    >
                      <td className="td">
                        {isExpanded
                          ? <ChevronUp className="h-4 w-4 text-brand" aria-hidden="true" />
                          : <ChevronDown className="h-4 w-4 text-slate-400" aria-hidden="true" />}
                      </td>
                      <td className="td">
                        <div className="min-w-[160px]">
                          <p className="font-medium text-slate-900 dark:text-white text-sm">{s.name}</p>
                          <p className="text-xs text-slate-400">{s.country}</p>
                        </div>
                      </td>
                      <td className="td"><TierBadge tier={s.tier} /></td>
                      <td className="td">
                        <span className="text-xs font-medium px-2.5 py-0.5 rounded-full border bg-slate-100 text-slate-600 border-slate-200 dark:bg-white/5 dark:text-slate-300 dark:border-white/10">
                          {s.category}
                        </span>
                      </td>
                      <td className="td"><Badge status={s.status} /></td>
                      <td className="td text-slate-500 dark:text-slate-400 text-xs">{s.region}</td>
                      <td className="td"><RatingStars rating={s.rating} /></td>
                      <td className="td"><OnTimeBadge value={s.onTimeDelivery} /></td>
                      <td className="td">
                        <span className={cn("text-xs font-semibold", s.defectRate < 1.5 ? "text-success" : s.defectRate < 3 ? "text-warning" : "text-danger")}>
                          {formatPercent(s.defectRate, 2)}
                        </span>
                      </td>
                      <td className="td font-medium text-slate-900 dark:text-white whitespace-nowrap">
                        {formatCurrency(s.revenue, true)}
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr key={`${s.id}-expanded`} aria-label={`Details for ${s.name}`}>
                        <td colSpan={headers.length + 1} className="p-0">
                          <ExpandedSupplier supplier={s} />
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}
              {paginated.length === 0 && (
                <tr>
                  <td colSpan={headers.length + 1} className="td text-center text-slate-400 py-12">
                    No suppliers match the current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-5 py-3 border-t border-slate-200 dark:border-white/10 flex items-center justify-between gap-2">
            <p className="text-xs text-slate-400">Page {page} of {totalPages}</p>
            <div className="flex items-center gap-1">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="p-1.5 rounded-lg disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors" aria-label="Previous page">
                <ChevronLeft className="h-4 w-4" aria-hidden="true" />
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const p = Math.max(1, Math.min(totalPages - 4, page - 2)) + i;
                return (
                  <button key={p} onClick={() => setPage(p)}
                    className={cn("h-7 w-7 rounded-lg text-xs font-medium transition-colors", p === page ? "bg-brand text-white" : "text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-white/10")}
                    aria-current={p === page ? "page" : undefined}
                  >{p}</button>
                );
              })}
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-1.5 rounded-lg disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors" aria-label="Next page">
                <ChevronRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        )}
        </>
        )}
      </div>
    </div>
  );
}
