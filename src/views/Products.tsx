import { useState, useMemo } from "react";
import {
  products, supplierMap, facilityMap, shipments,
  getRevenueByCategory, getProductVolumeTrend,
} from "@/data";
import { useAppStore } from "@/store/useAppStore";
import Badge from "@/components/ui/Badge";
import DonutChart from "@/components/charts/DonutChart";
import ShipmentLineChart from "@/components/charts/ShipmentLineChart";
import FilterBar from "@/components/filters/FilterBar";
import ActiveFilterChips from "@/components/filters/ActiveFilterChips";
import MobileFilterSheet from "@/components/filters/MobileFilterSheet";
import { formatCurrency, cn } from "@/lib/utils";
import {
  ChevronDown, ChevronUp, ChevronLeft, ChevronRight,
  ArrowRight, Ship, TrendingUp, TrendingDown,
} from "lucide-react";

const PRODUCT_STATUSES = ["in_stock", "low_stock", "out_of_stock", "discontinued"];
const PAGE_SIZE = 10;

function StockBar({ stock, demandMonthly }: { stock: number; demandMonthly: number }) {
  const weeks = demandMonthly > 0 ? (stock / demandMonthly) * 4 : 0;
  const color = stock === 0 ? "bg-danger" : weeks < 4 ? "bg-warning" : "bg-success";
  const pct   = Math.min(100, (stock / (demandMonthly * 3 || 1)) * 100);
  return (
    <div className="flex items-center gap-2 min-w-[80px]">
      <div className="flex-1 h-1.5 bg-slate-200 dark:bg-white/10 rounded-full">
        <div className={cn("h-full rounded-full", color)} style={{ width: `${pct}%` }} />
      </div>
      <span className={cn("text-xs w-10 text-right font-medium",
        stock === 0 ? "text-danger" : weeks < 4 ? "text-warning" : "text-slate-700 dark:text-slate-300"
      )}>
        {stock.toLocaleString()}
      </span>
    </div>
  );
}

function ExpandedProduct({ product }: { product: typeof products[0] }) {
  const supplier = supplierMap[product.supplierId];
  const facility = facilityMap[product.facilityId];
  const productShipments = shipments.filter((s) => s.productId === product.id).slice(0, 5);

  return (
    <div className="py-4 px-4 bg-slate-50 dark:bg-white/[0.02] border-t border-slate-100 dark:border-white/5">
      {/* Flow: Supplier → Facility → Shipment */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 mb-4">
        {/* Supplier */}
        <div className="flex-1 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-navy-800 px-3 py-2 min-w-[130px]">
          <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">Supplier</p>
          {supplier ? (
            <>
              <p className="text-xs font-semibold text-slate-900 dark:text-white">{supplier.name}</p>
              <p className="text-[10px] text-slate-400">{supplier.tier} · {supplier.country}</p>
            </>
          ) : <p className="text-xs text-slate-400">Unknown</p>}
        </div>

        <ArrowRight className="h-4 w-4 text-slate-300 dark:text-slate-600 flex-shrink-0 hidden sm:block" aria-hidden="true" />

        {/* Facility */}
        <div className="flex-1 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-navy-800 px-3 py-2 min-w-[130px]">
          <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">Facility</p>
          {facility ? (
            <>
              <p className="text-xs font-semibold text-slate-900 dark:text-white">{facility.name}</p>
              <p className="text-[10px] text-slate-400">{facility.type} · {facility.location.city}</p>
            </>
          ) : <p className="text-xs text-slate-400">Unknown</p>}
        </div>

        <ArrowRight className="h-4 w-4 text-slate-300 dark:text-slate-600 flex-shrink-0 hidden sm:block" aria-hidden="true" />

        {/* Shipment summary */}
        <div className="flex-1 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-navy-800 px-3 py-2 min-w-[130px]">
          <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">Shipments</p>
          <p className="text-xs font-semibold text-slate-900 dark:text-white">
            {shipments.filter((s) => s.productId === product.id).length} total
          </p>
          <p className="text-[10px] text-slate-400">{product.leadTimeDays}d lead time</p>
        </div>
      </div>

      {/* Recent shipments */}
      {productShipments.length > 0 && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">Recent Shipments</p>
          <div className="space-y-1.5">
            {productShipments.map((s) => {
              const origin = facilityMap[s.originFacilityId];
              const dest   = facilityMap[s.destinationFacilityId];
              return (
                <div key={s.id} className="flex items-center justify-between text-xs flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <Ship className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
                    <span className="font-mono text-slate-400 dark:text-slate-500">{s.trackingNumber}</span>
                    <span className="text-slate-400 dark:text-slate-500">
                      {origin?.location.city ?? "?"} → {dest?.location.city ?? "?"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-slate-700 dark:text-slate-300">{formatCurrency(s.value, true)}</span>
                    <Badge status={s.status} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default function Products() {
  const { filters } = useAppStore();
  const globalSearch = useAppStore((s) => s.globalSearch);
  const [page, setPage] = useState(1);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  // Volume trend for line chart (converted to MonthlyRevenue-like shape)
  const volumeTrend = useMemo(() => {
    return getProductVolumeTrend().slice(-12).map((d) => ({
      month: d.label.split(" ")[0],
      year: 2000 + parseInt(d.label.split("'")[1]),
      revenue: d.volume,
      shipments: d.volume,
    }));
  }, []);

  const categoryRevenue = useMemo(() => getRevenueByCategory().slice(0, 8), []);

  const filtered = useMemo(() => {
    let list = [...products];
    if (globalSearch.trim()) {
      const q = globalSearch.toLowerCase();
      list = list.filter((p) => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q));
    }
    if (filters.statuses.length > 0) list = list.filter((p) => filters.statuses.includes(p.status));
    if (filters.products.length > 0) list = list.filter((p) => filters.products.includes(p.category));
    return list;
  }, [globalSearch, filters]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const dir = sortDir === "asc" ? 1 : -1;
      const getVal = (p: typeof products[0]) => {
        if (sortKey === "name")         return p.name;
        if (sortKey === "sku")          return p.sku;
        if (sortKey === "category")     return p.category;
        if (sortKey === "status")       return p.status;
        if (sortKey === "unitPrice")    return p.unitPrice;
        if (sortKey === "stock")        return p.stock;
        if (sortKey === "leadTimeDays") return p.leadTimeDays;
        if (sortKey === "demandMonthly") return p.demandMonthly;
        return p.name;
      };
      const av = getVal(a), bv = getVal(b);
      if (typeof av === "number" && typeof bv === "number") return (av - bv) * dir;
      return String(av).localeCompare(String(bv)) * dir;
    });
  }, [filtered, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const paginated  = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const toggleSort = (key: string) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("asc"); }
    setPage(1);
  };

  const stockStats = useMemo(() => ({
    inStock:      filtered.filter((p) => p.status === "in_stock").length,
    lowStock:     filtered.filter((p) => p.status === "low_stock").length,
    outOfStock:   filtered.filter((p) => p.status === "out_of_stock").length,
    discontinued: filtered.filter((p) => p.status === "discontinued").length,
  }), [filtered]);

  const SortIcon = ({ col }: { col: string }) =>
    sortKey !== col ? <ChevronUp className="h-3 w-3 opacity-30" aria-hidden="true" /> :
      sortDir === "asc" ? <ChevronUp className="h-3 w-3 text-brand" aria-hidden="true" /> :
        <ChevronDown className="h-3 w-3 text-brand" aria-hidden="true" />;

  const headers: { label: string; key: string }[] = [
    { label: "SKU",           key: "sku" },
    { label: "Product",       key: "name" },
    { label: "Category",      key: "category" },
    { label: "Status",        key: "status" },
    { label: "Supplier",      key: "supplier" },
    { label: "Unit Price",    key: "unitPrice" },
    { label: "Stock",         key: "stock" },
    { label: "Lead Time",     key: "leadTimeDays" },
    { label: "Monthly Demand",key: "demandMonthly" },
  ];

  return (
    <div className="space-y-5">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 justify-between">
        <div className="hidden lg:flex flex-wrap gap-2 flex-1">
          <FilterBar
            statusOptions={PRODUCT_STATUSES}
            show={{ statuses: true, suppliers: true, dateRange: false, regions: false }}
          />
        </div>
        <MobileFilterSheet statusOptions={PRODUCT_STATUSES} />
        <ActiveFilterChips />
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "In Stock",     value: String(stockStats.inStock),     color: "text-success" },
          { label: "Low Stock",    value: String(stockStats.lowStock),    color: "text-warning" },
          { label: "Out of Stock", value: String(stockStats.outOfStock),  color: "text-danger" },
          { label: "Discontinued", value: String(stockStats.discontinued),color: "text-slate-400" },
        ].map(({ label, value, color }) => (
          <div key={label} className="card px-4 py-3 text-center">
            <p className={cn("text-xl font-heading font-bold", color)}>{value}</p>
            <p className="text-xs text-slate-400 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4" style={{ minHeight: 260 }}>
        <div className="lg:col-span-2">
          <ShipmentLineChart
            data={volumeTrend}
            title="Product Volume Trend (Units shipped)"
            dataKey="revenue"
            lineLabel="Volume"
          />
        </div>
        <DonutChart
          data={categoryRevenue}
          title="Revenue by Category"
          formatter={(v) => formatCurrency(v, true)}
        />
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-200 dark:border-white/10 flex items-center justify-between">
          <p className="text-sm font-semibold text-slate-900 dark:text-white">Products</p>
          <span className="text-xs text-slate-400">{filtered.length} records</span>
        </div>
        {/* Mobile card list */}
        <div className="lg:hidden divide-y divide-slate-100 dark:divide-white/5">
          {paginated.map((p, idx) => {
            const isExpanded = expandedId === p.id;
            const leadOk = p.leadTimeDays <= 14;
            const leadWarn = p.leadTimeDays <= 30;
            return (
              <div key={p.id} className={cn(!isExpanded && idx % 2 !== 0 && "bg-slate-100/70 dark:bg-white/[0.042]")}>
                <button
                  className="w-full px-4 py-3 flex items-center justify-between gap-3 text-left active:bg-slate-50 dark:active:bg-white/5 transition-colors"
                  onClick={() => setExpandedId(isExpanded ? null : p.id)}
                  aria-expanded={isExpanded}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge status={p.status} />
                      <span className="font-mono text-xs text-slate-400">{p.sku}</span>
                    </div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{p.name}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{p.category}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{formatCurrency(p.unitPrice)}</p>
                    <span className={cn("text-xs font-medium flex items-center justify-end gap-1 mt-0.5",
                      leadOk ? "text-success" : leadWarn ? "text-warning" : "text-danger"
                    )}>
                      {leadOk
                        ? <TrendingDown className="h-3 w-3" aria-hidden="true" />
                        : <TrendingUp className="h-3 w-3" aria-hidden="true" />}
                      {p.leadTimeDays}d lead
                    </span>
                    {isExpanded
                      ? <ChevronUp className="h-4 w-4 text-brand ml-auto mt-1" aria-hidden="true" />
                      : <ChevronDown className="h-4 w-4 text-slate-400 ml-auto mt-1" aria-hidden="true" />}
                  </div>
                </button>
                {isExpanded && <ExpandedProduct product={p} />}
              </div>
            );
          })}
          {paginated.length === 0 && (
            <div className="px-4 py-8 text-center text-sm text-slate-400">No products match the current filters.</div>
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
              {paginated.map((p, idx) => {
                const isExpanded = expandedId === p.id;
                const supplier = supplierMap[p.supplierId];
                const leadOk = p.leadTimeDays <= 14;
                const leadWarn = p.leadTimeDays <= 30;
                return (
                  <>
                    <tr
                      key={p.id}
                      className={cn("tr cursor-pointer", isExpanded ? "bg-slate-50 dark:bg-white/[0.02]" : idx % 2 !== 0 && "bg-slate-100/70 dark:bg-white/[0.042]")}
                      onClick={() => setExpandedId(isExpanded ? null : p.id)}
                      aria-expanded={isExpanded}
                    >
                      <td className="td">
                        {isExpanded
                          ? <ChevronUp className="h-4 w-4 text-brand" aria-hidden="true" />
                          : <ChevronDown className="h-4 w-4 text-slate-400" aria-hidden="true" />}
                      </td>
                      <td className="td font-mono text-xs text-slate-400">{p.sku}</td>
                      <td className="td">
                        <div className="min-w-[150px]">
                          <p className="font-medium text-slate-900 dark:text-white text-sm">{p.name}</p>
                          <p className="text-xs text-slate-400">{p.weight} kg</p>
                        </div>
                      </td>
                      <td className="td">
                        <span className="text-xs font-medium px-2.5 py-0.5 rounded-full border bg-slate-100 text-slate-600 border-slate-200 dark:bg-white/5 dark:text-slate-300 dark:border-white/10">
                          {p.category}
                        </span>
                      </td>
                      <td className="td"><Badge status={p.status} /></td>
                      <td className="td text-slate-500 dark:text-slate-400 text-xs max-w-[120px] truncate">
                        {supplier?.name ?? "—"}
                      </td>
                      <td className="td font-medium text-slate-900 dark:text-white">
                        {formatCurrency(p.unitPrice)}
                      </td>
                      <td className="td">
                        <StockBar stock={p.stock} demandMonthly={p.demandMonthly} />
                      </td>
                      <td className="td">
                        <span className={cn("text-xs font-medium flex items-center gap-1",
                          leadOk ? "text-success" : leadWarn ? "text-warning" : "text-danger"
                        )}>
                          {leadOk
                            ? <TrendingDown className="h-3 w-3" aria-hidden="true" />
                            : <TrendingUp className="h-3 w-3" aria-hidden="true" />}
                          {p.leadTimeDays}d
                        </span>
                      </td>
                      <td className="td text-slate-400 dark:text-slate-500 text-xs">
                        {p.demandMonthly.toLocaleString()} / mo
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr key={`${p.id}-expanded`} aria-label={`Details for ${p.name}`}>
                        <td colSpan={headers.length + 1} className="p-0">
                          <ExpandedProduct product={p} />
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}
              {paginated.length === 0 && (
                <tr>
                  <td colSpan={headers.length + 1} className="td text-center text-slate-400 py-12">
                    No products match the current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="px-5 py-3 border-t border-slate-200 dark:border-white/10 flex items-center justify-between gap-2">
            <p className="text-xs text-slate-400">Page {page} of {totalPages}</p>
            <div className="flex items-center gap-1">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="p-1.5 rounded-lg disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors" aria-label="Previous page">
                <ChevronLeft className="h-4 w-4" aria-hidden="true" />
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pg = Math.max(1, Math.min(totalPages - 4, page - 2)) + i;
                return (
                  <button key={pg} onClick={() => setPage(pg)}
                    className={cn("h-7 w-7 rounded-lg text-xs font-medium transition-colors", pg === page ? "bg-brand text-white" : "text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-white/10")}
                    aria-current={pg === page ? "page" : undefined}
                  >{pg}</button>
                );
              })}
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-1.5 rounded-lg disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors" aria-label="Next page">
                <ChevronRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
