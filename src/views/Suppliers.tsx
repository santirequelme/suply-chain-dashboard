import { useState } from "react";
import { suppliers } from "@/data";
import DataTable from "@/components/ui/DataTable";
import Badge from "@/components/ui/Badge";
import { useAppStore } from "@/store/useAppStore";
import { formatCurrency, formatPercent } from "@/lib/utils";
import type { ColumnDef } from "@/components/ui/DataTable";
import type { Supplier } from "@/types";
import { TrendingUp, TrendingDown, Star } from "lucide-react";

const CATEGORIES = ["All Categories", ...Array.from(new Set(suppliers.map((s) => s.category))).sort()];
const STATUSES   = ["All Statuses", "active", "inactive", "on_hold"];
const REGIONS    = ["All Regions",  ...Array.from(new Set(suppliers.map((s) => s.region))).sort()];

function RatingStars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1" aria-label={`Rating: ${rating} out of 5`}>
      {Array.from({ length: 5 }, (_, i) => (
        <Star key={i} className={`h-3 w-3 ${i < Math.round(rating) ? "text-warning fill-warning" : "text-slate-300 dark:text-slate-600"}`} aria-hidden="true" />
      ))}
      <span className="text-xs text-slate-400 ml-1">{rating.toFixed(1)}</span>
    </div>
  );
}

function TrendBadge({ value }: { value: number }) {
  const isGood = value >= 90;
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-semibold ${isGood ? "text-success" : "text-warning"}`}>
      {isGood ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
      {value.toFixed(1)}%
    </span>
  );
}

const COLUMNS: ColumnDef<Supplier>[] = [
  {
    key: "name", header: "Supplier", accessor: (s) => s.name, pinned: true,
    render: (s) => (
      <div className="min-w-[170px]">
        <p className="font-medium text-slate-900 dark:text-white text-sm">{s.name}</p>
        <p className="text-xs text-slate-400">{s.id} · {s.contact.email}</p>
      </div>
    ),
  },
  {
    key: "category", header: "Category", accessor: (s) => s.category,
    render: (s) => (
      <span className="text-xs font-medium px-2.5 py-0.5 rounded-full border bg-slate-100 text-slate-600 border-slate-200 dark:bg-white/5 dark:text-slate-300 dark:border-white/10">
        {s.category}
      </span>
    ),
  },
  { key: "status",  header: "Status",  accessor: (s) => s.status,  render: (s) => <Badge status={s.status} /> },
  { key: "country", header: "Country", accessor: (s) => s.country },
  {
    key: "region", header: "Region", accessor: (s) => s.region,
    render: (s) => <span className="text-slate-500 dark:text-slate-400 text-xs">{s.region}</span>,
  },
  { key: "rating",         header: "Rating",     accessor: (s) => s.rating,         render: (s) => <RatingStars rating={s.rating} /> },
  { key: "onTimeDelivery", header: "On-Time",    accessor: (s) => s.onTimeDelivery, render: (s) => <TrendBadge value={s.onTimeDelivery} /> },
  {
    key: "defectRate", header: "Defect Rate", accessor: (s) => s.defectRate,
    render: (s) => (
      <span className={`text-xs font-semibold ${s.defectRate < 1.5 ? "text-success" : s.defectRate < 3 ? "text-warning" : "text-danger"}`}>
        {formatPercent(s.defectRate, 2)}
      </span>
    ),
  },
  { key: "productsCount", header: "Products", accessor: (s) => s.productsCount },
  {
    key: "revenue", header: "Revenue", accessor: (s) => s.revenue,
    render: (s) => <span className="font-medium text-slate-900 dark:text-white">{formatCurrency(s.revenue, true)}</span>,
  },
];

export default function Suppliers() {
  const globalSearch = useAppStore((s) => s.globalSearch);
  const [categoryFilter, setCategoryFilter] = useState("All Categories");
  const [statusFilter,   setStatusFilter]   = useState("All Statuses");
  const [regionFilter,   setRegionFilter]   = useState("All Regions");

  const filtered = suppliers.filter((s) => {
    if (categoryFilter !== "All Categories" && s.category !== categoryFilter) return false;
    if (statusFilter   !== "All Statuses"   && s.status   !== statusFilter)   return false;
    if (regionFilter   !== "All Regions"    && s.region   !== regionFilter)   return false;
    return true;
  });

  const avgOnTime = filtered.reduce((sum, s) => sum + s.onTimeDelivery, 0) / (filtered.length || 1);
  const avgRating = filtered.reduce((sum, s) => sum + s.rating,         0) / (filtered.length || 1);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total Suppliers", value: String(filtered.length) },
          { label: "Active",          value: String(filtered.filter((s) => s.status === "active").length) },
          { label: "Avg On-Time",     value: formatPercent(avgOnTime) },
          { label: "Avg Rating",      value: avgRating.toFixed(1) + " ★" },
        ].map(({ label, value }) => (
          <div key={label} className="card px-4 py-3 text-center">
            <p className="text-xl font-heading font-bold text-slate-900 dark:text-white">{value}</p>
            <p className="text-xs text-slate-400 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">Filters:</span>
        {[
          { value: categoryFilter, setter: setCategoryFilter, options: CATEGORIES, label: "Filter by category" },
          { value: statusFilter,   setter: setStatusFilter,   options: STATUSES,   label: "Filter by status" },
          { value: regionFilter,   setter: setRegionFilter,   options: REGIONS,    label: "Filter by region" },
        ].map(({ value, setter, options, label }) => (
          <select key={label} value={value} onChange={(e) => setter(e.target.value)} className="select py-1.5 text-sm" aria-label={label}>
            {options.map((o) => <option key={o} value={o}>{o.replace("_", " ")}</option>)}
          </select>
        ))}
      </div>

      <DataTable
        data={filtered as unknown as Record<string, unknown>[]}
        columns={COLUMNS as unknown as ColumnDef<Record<string, unknown>>[]}
        searchValue={globalSearch}
        searchFields={["name"] as never[]}
        exportFilename="suppliers"
        pageSize={10}
      />
    </div>
  );
}
