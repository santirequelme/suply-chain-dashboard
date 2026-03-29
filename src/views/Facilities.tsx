import { useState, useMemo } from "react";
import {
  facilities, supplierMap, products, shipments,
  getFacilitiesByType, getFacilitiesByRegion,
} from "@/data";
import { useAppStore } from "@/store/useAppStore";
import Badge from "@/components/ui/Badge";
import FilterBar from "@/components/filters/FilterBar";
import ActiveFilterChips from "@/components/filters/ActiveFilterChips";
import MobileFilterSheet from "@/components/filters/MobileFilterSheet";
import DonutChart from "@/components/charts/DonutChart";
import RevenueBarChart from "@/components/charts/RevenueBarChart";
import { formatCurrency, formatPercent, cn } from "@/lib/utils";
import {
  ChevronDown, ChevronUp, ChevronLeft, ChevronRight,
  MapPin, Users, Package, TrendingUp,
} from "lucide-react";

const TYPE_COLORS: Record<string, string> = {
  Manufacturing: "bg-teal-500/10 text-teal-600 border-teal-500/20 dark:bg-teal-500/15 dark:text-teal-400",
  Warehouse:     "bg-blue-500/10 text-blue-600 border-blue-500/20 dark:bg-blue-500/15 dark:text-blue-400",
  Distribution:  "bg-purple-500/10 text-purple-600 border-purple-500/20 dark:bg-purple-500/15 dark:text-purple-400",
  Assembly:      "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-500/15 dark:text-slate-400",
};

const FACILITY_STATUSES = ["active", "inactive", "maintenance"];
const PAGE_SIZE = 10;

function UtilizationBar({ value }: { value: number }) {
  const color = value >= 80 ? "bg-danger" : value >= 60 ? "bg-warning" : "bg-success";
  return (
    <div className="flex items-center gap-2 min-w-[90px]">
      <div className="flex-1 h-1.5 bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden">
        <div
          className={cn("h-full rounded-full", color)}
          style={{ width: `${value}%` }}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
      <span className="text-xs text-slate-500 dark:text-slate-400 w-10 text-right">{formatPercent(value)}</span>
    </div>
  );
}

function ExpandedFacility({ facility }: { facility: typeof facilities[0] }) {
  const supplier = supplierMap[facility.supplierId];
  const facilityProducts = products.filter((p) => p.facilityId === facility.id);
  const facilityShipments = shipments
    .filter((s) => s.originFacilityId === facility.id || s.destinationFacilityId === facility.id)
    .slice(0, 4);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-4 px-4 bg-slate-50 dark:bg-white/[0.02] border-t border-slate-100 dark:border-white/5">
      {/* Location + Supplier */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">Details</p>
        <div className="space-y-2">
          <p className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300">
            <MapPin className="h-3.5 w-3.5 text-brand" aria-hidden="true" />
            {facility.location.city}, {facility.location.country}
          </p>
          <p className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <Users className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
            {facility.employees.toLocaleString()} employees
          </p>
          <p className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <Package className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
            {facility.capacity.toLocaleString()} unit capacity
          </p>
          <p className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <TrendingUp className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
            {formatCurrency(facility.revenue, true)} revenue
          </p>
          {supplier && (
            <div className="mt-2 pt-2 border-t border-slate-100 dark:border-white/5">
              <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">Linked Supplier</p>
              <p className="text-xs font-medium text-slate-700 dark:text-slate-300">{supplier.name}</p>
              <p className="text-xs text-slate-400">{supplier.tier} · {supplier.category}</p>
            </div>
          )}
        </div>
      </div>

      {/* Products */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
          Products <span className="text-brand">({facilityProducts.length})</span>
        </p>
        <div className="space-y-1">
          {facilityProducts.slice(0, 5).map((p) => (
            <div key={p.id} className="flex items-center justify-between text-xs">
              <span className="text-slate-700 dark:text-slate-300 truncate max-w-[130px]">{p.name}</span>
              <Badge status={p.status} />
            </div>
          ))}
          {facilityProducts.length > 5 && (
            <p className="text-xs text-slate-400">+{facilityProducts.length - 5} more</p>
          )}
          {facilityProducts.length === 0 && (
            <p className="text-xs text-slate-400">No products assigned</p>
          )}
        </div>
      </div>

      {/* Shipments */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">Shipments</p>
        <div className="space-y-1.5">
          {facilityShipments.map((s) => (
            <div key={s.id} className="flex items-center justify-between text-xs">
              <span className="font-mono text-slate-400 dark:text-slate-500">{s.trackingNumber}</span>
              <div className="flex items-center gap-2">
                <span className="text-slate-700 dark:text-slate-300">{formatCurrency(s.value, true)}</span>
                <Badge status={s.status} />
              </div>
            </div>
          ))}
          {facilityShipments.length === 0 && (
            <p className="text-xs text-slate-400">No shipments found</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Facilities() {
  const { filters } = useAppStore();
  const globalSearch = useAppStore((s) => s.globalSearch);
  const [page, setPage] = useState(1);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const regionChartData = useMemo(() => getFacilitiesByRegion().map((d) => ({ name: d.name, revenue: d.value })), []);
  const typeDonutData = useMemo(() => getFacilitiesByType(), []);

  const filtered = useMemo(() => {
    let list = [...facilities];
    if (globalSearch.trim()) {
      const q = globalSearch.toLowerCase();
      list = list.filter((f) => f.name.toLowerCase().includes(q) || f.location.city.toLowerCase().includes(q));
    }
    if (filters.regions.length > 0) list = list.filter((f) => filters.regions.includes(f.location.region));
    if (filters.statuses.length > 0) list = list.filter((f) => filters.statuses.includes(f.status));
    return list;
  }, [globalSearch, filters]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const dir = sortDir === "asc" ? 1 : -1;
      const getVal = (f: typeof facilities[0]) => {
        if (sortKey === "name")        return f.name;
        if (sortKey === "type")        return f.type;
        if (sortKey === "status")      return f.status;
        if (sortKey === "region")      return f.location.region;
        if (sortKey === "city")        return f.location.city;
        if (sortKey === "utilization") return f.utilization;
        if (sortKey === "employees")   return f.employees;
        if (sortKey === "revenue")     return f.revenue;
        return f.name;
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
    else { setSortKey(key); setSortDir("asc"); }
    setPage(1);
  };

  const avgUtil = filtered.reduce((s, f) => s + f.utilization, 0) / (filtered.length || 1);
  const totalEmployees = filtered.reduce((s, f) => s + f.employees, 0);

  const SortIcon = ({ col }: { col: string }) =>
    sortKey !== col ? <ChevronUp className="h-3 w-3 opacity-30" aria-hidden="true" /> :
      sortDir === "asc" ? <ChevronUp className="h-3 w-3 text-brand" aria-hidden="true" /> :
        <ChevronDown className="h-3 w-3 text-brand" aria-hidden="true" />;

  const headers: { label: string; key: string }[] = [
    { label: "Facility",     key: "name" },
    { label: "Type",         key: "type" },
    { label: "Status",       key: "status" },
    { label: "City",         key: "city" },
    { label: "Region",       key: "region" },
    { label: "Utilization",  key: "utilization" },
    { label: "Employees",    key: "employees" },
    { label: "Revenue",      key: "revenue" },
  ];

  return (
    <div className="space-y-5">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 justify-between">
        <div className="hidden lg:flex flex-wrap gap-2 flex-1">
          <FilterBar statusOptions={FACILITY_STATUSES} show={{ dateRange: true, regions: true, statuses: true }} />
        </div>
        <MobileFilterSheet statusOptions={FACILITY_STATUSES} />
        <ActiveFilterChips />
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total Facilities",  value: String(filtered.length) },
          { label: "Active",            value: String(filtered.filter((f) => f.status === "active").length) },
          { label: "Avg Utilization",   value: formatPercent(avgUtil) },
          { label: "Total Employees",   value: totalEmployees.toLocaleString() },
        ].map(({ label, value }) => (
          <div key={label} className="card px-4 py-3 text-center">
            <p className="text-xl font-heading font-bold text-slate-900 dark:text-white">{value}</p>
            <p className="text-xs text-slate-400 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <DonutChart
          data={typeDonutData}
          title="Facilities by Type"
          centerValue={String(filtered.length)}
          centerLabel="Total"
        />
        <div className="lg:col-span-2">
          <RevenueBarChart data={regionChartData} title="Facilities by Region" isCurrency={false} valueLabel="facilities" />
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-200 dark:border-white/10 flex items-center justify-between">
          <p className="text-sm font-semibold text-slate-900 dark:text-white">Facilities</p>
          <span className="text-xs text-slate-400">{filtered.length} records</span>
        </div>
        {/* Mobile card list */}
        <div className="lg:hidden divide-y divide-slate-100 dark:divide-white/5">
          {paginated.map((f, idx) => {
            const isExpanded = expandedId === f.id;
            return (
              <div key={f.id} className={cn(!isExpanded && idx % 2 !== 0 && "bg-slate-100/70 dark:bg-white/[0.042]")}>
                <button
                  className="w-full px-4 py-3 flex items-center justify-between gap-3 text-left active:bg-slate-50 dark:active:bg-white/5 transition-colors"
                  onClick={() => setExpandedId(isExpanded ? null : f.id)}
                  aria-expanded={isExpanded}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full border", TYPE_COLORS[f.type])}>
                        {f.type}
                      </span>
                      <Badge status={f.status} />
                    </div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{f.name}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{f.location.city}, {f.location.region}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{formatCurrency(f.revenue, true)}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{formatPercent(f.utilization)} util.</p>
                    {isExpanded
                      ? <ChevronUp className="h-4 w-4 text-brand ml-auto mt-1" aria-hidden="true" />
                      : <ChevronDown className="h-4 w-4 text-slate-400 ml-auto mt-1" aria-hidden="true" />}
                  </div>
                </button>
                {isExpanded && <ExpandedFacility facility={f} />}
              </div>
            );
          })}
          {paginated.length === 0 && (
            <div className="px-4 py-8 text-center text-sm text-slate-400">No facilities match the current filters.</div>
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
              {paginated.map((f, idx) => {
                const isExpanded = expandedId === f.id;
                const supplier = supplierMap[f.supplierId];
                return (
                  <>
                    <tr
                      key={f.id}
                      className={cn("tr cursor-pointer", isExpanded ? "bg-slate-50 dark:bg-white/[0.02]" : idx % 2 !== 0 && "bg-slate-100/70 dark:bg-white/[0.042]")}
                      onClick={() => setExpandedId(isExpanded ? null : f.id)}
                      aria-expanded={isExpanded}
                    >
                      <td className="td">
                        {isExpanded
                          ? <ChevronUp className="h-4 w-4 text-brand" aria-hidden="true" />
                          : <ChevronDown className="h-4 w-4 text-slate-400" aria-hidden="true" />}
                      </td>
                      <td className="td">
                        <div className="min-w-[160px]">
                          <p className="font-medium text-slate-900 dark:text-white text-sm">{f.name}</p>
                          <p className="text-xs text-slate-400">
                            {supplier?.name ?? f.id} · {f.createdAt.slice(0, 4)}
                          </p>
                        </div>
                      </td>
                      <td className="td">
                        <span className={cn("text-xs font-medium px-2.5 py-0.5 rounded-full border", TYPE_COLORS[f.type])}>
                          {f.type}
                        </span>
                      </td>
                      <td className="td"><Badge status={f.status} /></td>
                      <td className="td text-slate-400 text-xs">{f.location.city}</td>
                      <td className="td text-slate-500 dark:text-slate-400 text-xs">{f.location.region}</td>
                      <td className="td"><UtilizationBar value={f.utilization} /></td>
                      <td className="td text-slate-700 dark:text-slate-300">{f.employees.toLocaleString()}</td>
                      <td className="td font-medium text-slate-900 dark:text-white whitespace-nowrap">
                        {formatCurrency(f.revenue, true)}
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr key={`${f.id}-expanded`} aria-label={`Details for ${f.name}`}>
                        <td colSpan={headers.length + 1} className="p-0">
                          <ExpandedFacility facility={f} />
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}
              {paginated.length === 0 && (
                <tr>
                  <td colSpan={headers.length + 1} className="td text-center text-slate-400 py-12">
                    No facilities match the current filters.
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
      </div>
    </div>
  );
}
