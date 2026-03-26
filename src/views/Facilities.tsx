import { useState } from "react";
import { facilities } from "@/data";
import DataTable from "@/components/ui/DataTable";
import Badge from "@/components/ui/Badge";
import { useAppStore } from "@/store/useAppStore";
import { formatCurrency, formatPercent } from "@/lib/utils";
import type { ColumnDef } from "@/components/ui/DataTable";
import type { Facility } from "@/types";
import { Eye } from "lucide-react";

const TYPE_COLORS: Record<string, string> = {
  Manufacturing: "bg-teal-500/10 text-teal-600 border-teal-500/20 dark:bg-teal-500/15 dark:text-teal-400 dark:border-teal-500/20",
  Warehouse:     "bg-blue-500/10 text-blue-600 border-blue-500/20 dark:bg-blue-500/15 dark:text-blue-400 dark:border-blue-500/20",
  Distribution:  "bg-purple-500/10 text-purple-600 border-purple-500/20 dark:bg-purple-500/15 dark:text-purple-400 dark:border-purple-500/20",
  Assembly:      "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-500/15 dark:text-slate-400 dark:border-slate-500/20",
};

const TYPES    = ["All Types", "Manufacturing", "Warehouse", "Distribution", "Assembly"];
const STATUSES = ["All Statuses", "active", "inactive", "maintenance"];
const REGIONS  = ["All Regions", ...Array.from(new Set(facilities.map((f) => f.location.region))).sort()];

const COLUMNS: ColumnDef<Facility>[] = [
  {
    key: "name", header: "Facility", accessor: (f) => f.name, pinned: true,
    render: (f) => (
      <div className="min-w-[180px]">
        <p className="font-medium text-slate-900 dark:text-white text-sm">{f.name}</p>
        <p className="text-xs text-slate-400">{f.id}</p>
      </div>
    ),
  },
  {
    key: "type", header: "Type", accessor: (f) => f.type,
    render: (f) => (
      <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full border ${TYPE_COLORS[f.type] ?? "bg-slate-100 text-slate-600 border-slate-200"}`}>
        {f.type}
      </span>
    ),
  },
  { key: "status", header: "Status", accessor: (f) => f.status, render: (f) => <Badge status={f.status} /> },
  { key: "country", header: "Country", accessor: (f) => f.location.country },
  {
    key: "region", header: "Region", accessor: (f) => f.location.region,
    render: (f) => <span className="text-slate-500 dark:text-slate-400 text-xs">{f.location.region}</span>,
  },
  {
    key: "city", header: "City", accessor: (f) => f.location.city,
    render: (f) => <span className="text-slate-400 text-xs">{f.location.city}</span>,
  },
  {
    key: "utilization", header: "Utilization", accessor: (f) => f.utilization,
    render: (f) => (
      <div className="flex items-center gap-2 min-w-[90px]">
        <div className="flex-1 h-1.5 bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-brand"
            style={{ width: `${f.utilization}%` }}
            role="progressbar" aria-valuenow={f.utilization} aria-valuemin={0} aria-valuemax={100}
          />
        </div>
        <span className="text-xs text-slate-500 dark:text-slate-400 w-10 text-right">{formatPercent(f.utilization)}</span>
      </div>
    ),
  },
  {
    key: "employees", header: "Employees", accessor: (f) => f.employees,
    render: (f) => <span className="text-slate-700 dark:text-slate-300">{f.employees.toLocaleString()}</span>,
  },
  {
    key: "capacity", header: "Capacity", accessor: (f) => f.capacity,
    render: (f) => <span className="text-slate-400 text-xs">{f.capacity.toLocaleString()} units</span>,
  },
  {
    key: "revenue", header: "Revenue", accessor: (f) => f.revenue,
    render: (f) => <span className="font-medium text-slate-900 dark:text-white">{formatCurrency(f.revenue, true)}</span>,
  },
];

export default function Facilities() {
  const globalSearch = useAppStore((s) => s.globalSearch);
  const [typeFilter,   setTypeFilter]   = useState("All Types");
  const [statusFilter, setStatusFilter] = useState("All Statuses");
  const [regionFilter, setRegionFilter] = useState("All Regions");

  const filtered = facilities.filter((f) => {
    if (typeFilter   !== "All Types"    && f.type              !== typeFilter)   return false;
    if (statusFilter !== "All Statuses" && f.status            !== statusFilter) return false;
    if (regionFilter !== "All Regions"  && f.location.region   !== regionFilter) return false;
    return true;
  });

  const isFiltered = typeFilter !== "All Types" || statusFilter !== "All Statuses" || regionFilter !== "All Regions";

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">Filters:</span>
        {[
          { value: typeFilter,   setter: setTypeFilter,   options: TYPES,    label: "Filter by type" },
          { value: statusFilter, setter: setStatusFilter, options: STATUSES, label: "Filter by status" },
          { value: regionFilter, setter: setRegionFilter, options: REGIONS,  label: "Filter by region" },
        ].map(({ value, setter, options, label }) => (
          <select key={label} value={value} onChange={(e) => setter(e.target.value)} className="select py-1.5 text-sm" aria-label={label}>
            {options.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
        ))}
        {isFiltered && (
          <button onClick={() => { setTypeFilter("All Types"); setStatusFilter("All Statuses"); setRegionFilter("All Regions"); }} className="btn-ghost py-1.5 text-xs">
            Clear filters
          </button>
        )}
        <span className="ml-auto text-xs text-slate-400">{filtered.length} of {facilities.length} facilities</span>
      </div>

      <DataTable
        data={filtered as unknown as Record<string, unknown>[]}
        columns={COLUMNS as unknown as ColumnDef<Record<string, unknown>>[]}
        searchValue={globalSearch}
        searchFields={["name"] as never[]}
        exportFilename="facilities"
        pageSize={10}
        rowActions={(row) => {
          const f = row as unknown as Facility;
          return (
            <button className="btn-ghost py-1 px-2 text-xs" aria-label={`View details for ${f.name}`}>
              <Eye className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          );
        }}
      />
    </div>
  );
}
