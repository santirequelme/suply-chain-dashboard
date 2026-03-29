import { useState, useMemo, useCallback } from "react";
import {
  shipments, productMap, supplierMap, facilityMap,
  getShipmentsFilteredByDate, getMonthlyRevenueFiltered,
} from "@/data";
import { useAppStore } from "@/store/useAppStore";
import Badge from "@/components/ui/Badge";
import ShipmentLineChart from "@/components/charts/ShipmentLineChart";
import FilterBar from "@/components/filters/FilterBar";
import ActiveFilterChips from "@/components/filters/ActiveFilterChips";
import MobileFilterSheet from "@/components/filters/MobileFilterSheet";
import RouteMap from "@/components/map/RouteMap";
import RouteDetailDrawer from "@/components/map/RouteDetailDrawer";
import type { AggregatedRoute } from "@/components/map/RouteMap";
import { formatCurrency, formatDate, cn } from "@/lib/utils";
import {
  ChevronDown, ChevronUp, ChevronLeft, ChevronRight,
  MapPin, Package, TrendingDown, TrendingUp, Ship,
  TableProperties, Globe,
} from "lucide-react";

const SHIPMENT_STATUSES = ["delivered", "in_transit", "pending", "delayed", "cancelled"];
const CARRIERS = Array.from(new Set(shipments.map((s) => s.carrier))).sort();
const PAGE_SIZE = 10;

function ExpandedShipment({ shipment }: { shipment: typeof shipments[0] }) {
  const product  = productMap[shipment.productId];
  const supplier = supplierMap[shipment.supplierId];
  const origin   = facilityMap[shipment.originFacilityId];
  const dest     = facilityMap[shipment.destinationFacilityId];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 py-4 px-4 bg-slate-50 dark:bg-white/[0.02] border-t border-slate-100 dark:border-white/5">
      {/* Product */}
      <div>
        <p className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5">Product</p>
        {product ? (
          <div className="space-y-1">
            <div className="flex items-center gap-1.5">
              <Package className="h-3.5 w-3.5 text-brand" aria-hidden="true" />
              <p className="text-xs font-semibold text-slate-900 dark:text-white">{product.name}</p>
            </div>
            <p className="text-xs text-slate-400">{product.sku} · {product.category}</p>
            <p className="text-xs text-slate-400">{shipment.quantity.toLocaleString()} units @ {formatCurrency(product.unitPrice)}</p>
          </div>
        ) : <p className="text-xs text-slate-400">—</p>}
      </div>

      {/* Supplier */}
      <div>
        <p className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5">Supplier</p>
        {supplier ? (
          <div className="space-y-1">
            <p className="text-xs font-semibold text-slate-900 dark:text-white">{supplier.name}</p>
            <p className="text-xs text-slate-400">{supplier.tier} · {supplier.country}</p>
            <p className="text-xs text-slate-400">⭐ {supplier.rating.toFixed(1)}</p>
          </div>
        ) : <p className="text-xs text-slate-400">—</p>}
      </div>

      {/* Route */}
      <div>
        <p className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5">Route</p>
        <div className="space-y-1.5">
          {origin && (
            <div className="flex items-start gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-success mt-0.5 flex-shrink-0" aria-hidden="true" />
              <div>
                <p className="text-xs font-medium text-slate-700 dark:text-slate-300">{origin.name}</p>
                <p className="text-[10px] text-slate-400">{origin.location.city}, {origin.location.country}</p>
              </div>
            </div>
          )}
          <div className="ml-1.5 border-l-2 border-dashed border-slate-200 dark:border-white/10 h-3" aria-hidden="true" />
          {dest && (
            <div className="flex items-start gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-danger mt-0.5 flex-shrink-0" aria-hidden="true" />
              <div>
                <p className="text-xs font-medium text-slate-700 dark:text-slate-300">{dest.name}</p>
                <p className="text-[10px] text-slate-400">{dest.location.city}, {dest.location.country}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Timeline */}
      <div>
        <p className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5">Timeline</p>
        <div className="space-y-1.5">
          <div>
            <p className="text-[10px] text-slate-400">Shipped</p>
            <p className="text-xs font-medium text-slate-700 dark:text-slate-300">{formatDate(shipment.shippedAt)}</p>
          </div>
          <div>
            <p className="text-[10px] text-slate-400">Est. Arrival</p>
            <p className="text-xs font-medium text-slate-700 dark:text-slate-300">{formatDate(shipment.estimatedArrival)}</p>
          </div>
          {shipment.actualArrival && (
            <div>
              <p className="text-[10px] text-slate-400">Actual Arrival</p>
              <p className="text-xs font-medium text-success">{formatDate(shipment.actualArrival)}</p>
            </div>
          )}
          <div className="pt-1">
            <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-lg bg-slate-100 text-slate-600 dark:bg-white/5 dark:text-slate-400">
              <Ship className="h-3 w-3" aria-hidden="true" />
              {shipment.carrier}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Shipments() {
  const { filters } = useAppStore();
  const globalSearch = useAppStore((s) => s.globalSearch);
  const [page, setPage] = useState(1);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState("shippedAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [carrierFilter, setCarrierFilter] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<"table" | "map">("table");
  const [selectedRoute, setSelectedRoute] = useState<AggregatedRoute | null>(null);

  const handleRouteClick = useCallback((route: AggregatedRoute) => {
    setSelectedRoute(route);
  }, []);

  const trend = useMemo(
    () => getMonthlyRevenueFiltered(filters.dateRange.start, filters.dateRange.end),
    [filters.dateRange]
  );

  const filtered = useMemo(() => {
    let list = getShipmentsFilteredByDate(filters.dateRange.start, filters.dateRange.end);
    if (filters.statuses.length > 0) list = list.filter((s) => filters.statuses.includes(s.status));
    if (filters.regions.length > 0) {
      list = list.filter((s) => {
        const origin = facilityMap[s.originFacilityId];
        return origin && filters.regions.includes(origin.location.region);
      });
    }
    if (filters.products.length > 0) {
      list = list.filter((s) => {
        const p = productMap[s.productId];
        return p && filters.products.includes(p.category);
      });
    }
    if (carrierFilter.length > 0) list = list.filter((s) => carrierFilter.includes(s.carrier));
    if (globalSearch.trim()) {
      const q = globalSearch.toLowerCase();
      list = list.filter((s) => s.trackingNumber.toLowerCase().includes(q) || s.carrier.toLowerCase().includes(q));
    }
    return list;
  }, [filters, carrierFilter, globalSearch]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const dir = sortDir === "asc" ? 1 : -1;
      const getVal = (s: typeof shipments[0]) => {
        if (sortKey === "trackingNumber") return s.trackingNumber;
        if (sortKey === "status")         return s.status;
        if (sortKey === "value")          return s.value;
        if (sortKey === "quantity")       return s.quantity;
        if (sortKey === "shippedAt")      return s.shippedAt;
        if (sortKey === "carrier")        return s.carrier;
        return s.shippedAt;
      };
      const av = getVal(a), bv = getVal(b);
      if (typeof av === "number" && typeof bv === "number") return (av - bv) * dir;
      return String(av).localeCompare(String(bv)) * dir;
    });
  }, [filtered, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const paginated = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const toggleSort = (key: string) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("desc"); }
    setPage(1);
  };

  const totalValue = filtered.reduce((s, sh) => s + sh.value, 0);
  const delivered  = filtered.filter((s) => s.status === "delivered").length;
  const delayed    = filtered.filter((s) => s.status === "delayed").length;
  const inTransit  = filtered.filter((s) => s.status === "in_transit").length;

  const prevPeriod = shipments.length;
  const volTrend = ((filtered.length - prevPeriod * 0.8) / (prevPeriod * 0.8)) * 100;

  const SortIcon = ({ col }: { col: string }) =>
    sortKey !== col ? <ChevronUp className="h-3 w-3 opacity-30" aria-hidden="true" /> :
      sortDir === "asc" ? <ChevronUp className="h-3 w-3 text-brand" aria-hidden="true" /> :
        <ChevronDown className="h-3 w-3 text-brand" aria-hidden="true" />;

  const headers: { label: string; key: string }[] = [
    { label: "Tracking #",  key: "trackingNumber" },
    { label: "Status",      key: "status" },
    { label: "Product",     key: "product" },
    { label: "Supplier",    key: "supplier" },
    { label: "Origin",      key: "origin" },
    { label: "Destination", key: "destination" },
    { label: "Carrier",     key: "carrier" },
    { label: "Qty",         key: "quantity" },
    { label: "Value",       key: "value" },
    { label: "Shipped",     key: "shippedAt" },
  ];

  return (
    <div className="space-y-5">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 justify-between">
        <div className="hidden lg:flex flex-wrap gap-2 flex-1">
          <FilterBar statusOptions={SHIPMENT_STATUSES} show={{ dateRange: true, regions: true, statuses: true, suppliers: true }} />
          {/* Carrier multi-select */}
          <div className="flex flex-wrap gap-1">
            {CARRIERS.map((c) => (
              <button
                key={c}
                onClick={() => setCarrierFilter((prev) =>
                  prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]
                )}
                className={cn(
                  "px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all",
                  carrierFilter.includes(c)
                    ? "bg-brand text-white border-brand"
                    : "bg-white text-slate-600 border-slate-200 hover:border-brand/50 dark:bg-navy-800 dark:text-slate-400 dark:border-white/10"
                )}
                aria-pressed={carrierFilter.includes(c)}
              >
                {c}
              </button>
            ))}
            {carrierFilter.length > 0 && (
              <button onClick={() => setCarrierFilter([])} className="px-2 py-1.5 text-xs text-danger hover:underline">Clear</button>
            )}
          </div>
        </div>
        <MobileFilterSheet statusOptions={SHIPMENT_STATUSES} />
        <ActiveFilterChips />
        {/* View toggle */}
        <div className="flex items-center bg-white dark:bg-navy-800 border border-slate-200 dark:border-white/10 rounded-lg p-0.5">
          <button
            onClick={() => setViewMode("table")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all",
              viewMode === "table"
                ? "bg-brand text-white shadow-sm"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
            )}
            aria-pressed={viewMode === "table"}
          >
            <TableProperties className="h-3.5 w-3.5" />
            Table
          </button>
          <button
            onClick={() => setViewMode("map")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all",
              viewMode === "map"
                ? "bg-brand text-white shadow-sm"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
            )}
            aria-pressed={viewMode === "map"}
          >
            <Globe className="h-3.5 w-3.5" />
            Map
          </button>
        </div>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="card px-4 py-3 text-center">
          <div className="flex items-center justify-center gap-1 mb-0.5">
            <p className="text-xl font-heading font-bold text-slate-900 dark:text-white">{filtered.length}</p>
            <span className={cn("text-xs font-semibold flex items-center", volTrend >= 0 ? "text-success" : "text-danger")}>
              {volTrend >= 0 ? <TrendingUp className="h-3 w-3" aria-hidden="true" /> : <TrendingDown className="h-3 w-3" aria-hidden="true" />}
              {Math.abs(volTrend).toFixed(0)}%
            </span>
          </div>
          <p className="text-xs text-slate-400">Total Shipments</p>
        </div>
        <div className="card px-4 py-3 text-center">
          <p className="text-xl font-heading font-bold text-slate-900 dark:text-white">{formatCurrency(totalValue, true)}</p>
          <p className="text-xs text-slate-400 mt-0.5">Total Value</p>
        </div>
        <div className="card px-4 py-3 text-center">
          <div className="flex items-center justify-center gap-1 mb-0.5">
            <p className="text-xl font-heading font-bold text-success">{delivered}</p>
          </div>
          <p className="text-xs text-slate-400">Delivered</p>
        </div>
        <div className="card px-4 py-3 text-center">
          <div className="flex items-center justify-center gap-2 mb-0.5">
            <p className="text-xl font-heading font-bold text-danger">{delayed}</p>
            <p className="text-xl font-heading font-bold text-slate-300 dark:text-slate-600">/</p>
            <p className="text-xl font-heading font-bold text-brand">{inTransit}</p>
          </div>
          <p className="text-xs text-slate-400">Delayed / In Transit</p>
        </div>
      </div>

      {/* Map view */}
      {viewMode === "map" && (
        <>
          <RouteMap
            shipments={filtered}
            onRouteClick={handleRouteClick}
          />
          <RouteDetailDrawer
            route={selectedRoute}
            onClose={() => setSelectedRoute(null)}
          />
        </>
      )}

      {/* Line chart */}
      {viewMode === "table" && (
      <div style={{ minHeight: 260 }}>
        <ShipmentLineChart data={trend} title="Shipment Revenue & Volume Trend" />
      </div>
      )}

      {/* Table */}
      {viewMode === "table" && (
      <div className="card overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-200 dark:border-white/10 flex items-center justify-between">
          <p className="text-sm font-semibold text-slate-900 dark:text-white">Shipments</p>
          <span className="text-xs text-slate-400">{filtered.length} records</span>
        </div>
        {/* Mobile card list */}
        <div className="lg:hidden divide-y divide-slate-100 dark:divide-white/5">
          {paginated.map((s, idx) => {
            const isExpanded = expandedId === s.id;
            const product  = productMap[s.productId];
            const supplier = supplierMap[s.supplierId];
            const origin   = facilityMap[s.originFacilityId];
            const dest     = facilityMap[s.destinationFacilityId];
            return (
              <div key={s.id} className={cn(!isExpanded && idx % 2 !== 0 && "bg-slate-100/70 dark:bg-white/[0.042]")}>
                <button
                  className="w-full px-4 py-3 flex items-center justify-between gap-3 text-left active:bg-slate-50 dark:active:bg-white/5 transition-colors"
                  onClick={() => setExpandedId(isExpanded ? null : s.id)}
                  aria-expanded={isExpanded}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge status={s.status} />
                      <span className="font-mono text-xs text-slate-400">{s.trackingNumber}</span>
                    </div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                      {product?.name ?? "—"}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5 truncate">
                      {supplier?.name ?? "—"} · {origin?.location.city ?? "?"} → {dest?.location.city ?? "?"}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{formatCurrency(s.value, true)}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{formatDate(s.shippedAt)}</p>
                    {isExpanded
                      ? <ChevronUp className="h-4 w-4 text-brand ml-auto mt-1" aria-hidden="true" />
                      : <ChevronDown className="h-4 w-4 text-slate-400 ml-auto mt-1" aria-hidden="true" />}
                  </div>
                </button>
                {isExpanded && <ExpandedShipment shipment={s} />}
              </div>
            );
          })}
          {paginated.length === 0 && (
            <div className="px-4 py-8 text-center text-sm text-slate-400">No shipments match the current filters.</div>
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
                    className={cn("th", ["product", "supplier", "origin", "destination"].includes(key) ? "cursor-default" : "cursor-pointer select-none hover:text-brand")}
                    onClick={() => !["product", "supplier", "origin", "destination"].includes(key) && toggleSort(key)}
                    aria-sort={sortKey === key ? (sortDir === "asc" ? "ascending" : "descending") : undefined}
                  >
                    <span className="inline-flex items-center gap-1">
                      {label}
                      {!["product", "supplier", "origin", "destination"].includes(key) && <SortIcon col={key} />}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginated.map((s, idx) => {
                const isExpanded = expandedId === s.id;
                const product    = productMap[s.productId];
                const supplier   = supplierMap[s.supplierId];
                const origin     = facilityMap[s.originFacilityId];
                const dest       = facilityMap[s.destinationFacilityId];
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
                      <td className="td font-mono text-xs text-slate-400">{s.trackingNumber}</td>
                      <td className="td"><Badge status={s.status} /></td>
                      <td className="td font-medium text-slate-900 dark:text-white text-sm max-w-[140px] truncate">
                        {product?.name ?? "—"}
                      </td>
                      <td className="td text-slate-500 dark:text-slate-400 text-xs max-w-[120px] truncate">
                        {supplier?.name ?? "—"}
                      </td>
                      <td className="td text-slate-400 text-xs whitespace-nowrap">
                        {origin?.location.city ?? "—"}, {origin?.location.country ?? ""}
                      </td>
                      <td className="td text-slate-400 text-xs whitespace-nowrap">
                        {dest?.location.city ?? "—"}, {dest?.location.country ?? ""}
                      </td>
                      <td className="td">
                        <span className="text-xs font-medium px-2 py-0.5 rounded-lg bg-slate-100 text-slate-600 border border-slate-200 dark:bg-white/5 dark:text-slate-400 dark:border-white/10">
                          {s.carrier}
                        </span>
                      </td>
                      <td className="td text-slate-700 dark:text-slate-300">{s.quantity.toLocaleString()}</td>
                      <td className="td font-medium text-slate-900 dark:text-white whitespace-nowrap">
                        {formatCurrency(s.value, true)}
                      </td>
                      <td className="td text-slate-400 text-xs whitespace-nowrap">{formatDate(s.shippedAt)}</td>
                    </tr>
                    {isExpanded && (
                      <tr key={`${s.id}-expanded`} aria-label={`Details for ${s.trackingNumber}`}>
                        <td colSpan={headers.length + 1} className="p-0">
                          <ExpandedShipment shipment={s} />
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}
              {paginated.length === 0 && (
                <tr>
                  <td colSpan={headers.length + 1} className="td text-center text-slate-400 py-12">
                    No shipments match the current filters.
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
      )}
    </div>
  );
}
