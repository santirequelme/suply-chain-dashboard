import { useState } from "react";
import { shipments, productMap, supplierMap, facilityMap, getShipmentTrend } from "@/data";
import DataTable from "@/components/ui/DataTable";
import Badge from "@/components/ui/Badge";
import ShipmentLineChart from "@/components/charts/ShipmentLineChart";
import { useAppStore } from "@/store/useAppStore";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { ColumnDef } from "@/components/ui/DataTable";
import type { Shipment } from "@/types";

const STATUSES = ["All Statuses", "delivered", "in_transit", "pending", "delayed", "cancelled"];
const CARRIERS = ["All Carriers", ...Array.from(new Set(shipments.map((s) => s.carrier))).sort()];
const YEARS    = ["All Years", "2020", "2021", "2022", "2023", "2024", "2025", "2026"];

const COLUMNS: ColumnDef<Shipment>[] = [
  {
    key: "trackingNumber", header: "Tracking #", accessor: (s) => s.trackingNumber, pinned: true,
    render: (s) => <span className="font-mono text-xs text-slate-400">{s.trackingNumber}</span>,
  },
  { key: "status", header: "Status", accessor: (s) => s.status, render: (s) => <Badge status={s.status} /> },
  {
    key: "product", header: "Product", accessor: (s) => productMap[s.productId]?.name ?? "—",
    render: (s) => <span className="text-slate-900 dark:text-white text-sm font-medium">{productMap[s.productId]?.name ?? "—"}</span>,
  },
  {
    key: "supplier", header: "Supplier", accessor: (s) => supplierMap[s.supplierId]?.name ?? "—",
    render: (s) => <span className="text-slate-500 dark:text-slate-400 text-xs">{supplierMap[s.supplierId]?.name ?? "—"}</span>,
  },
  {
    key: "origin", header: "Origin", accessor: (s) => facilityMap[s.originFacilityId]?.location.city ?? "—",
    render: (s) => (
      <span className="text-slate-500 dark:text-slate-400 text-xs">
        {facilityMap[s.originFacilityId]?.location.city ?? "—"}, {facilityMap[s.originFacilityId]?.location.country ?? ""}
      </span>
    ),
  },
  {
    key: "destination", header: "Destination", accessor: (s) => facilityMap[s.destinationFacilityId]?.location.city ?? "—",
    render: (s) => (
      <span className="text-slate-500 dark:text-slate-400 text-xs">
        {facilityMap[s.destinationFacilityId]?.location.city ?? "—"}, {facilityMap[s.destinationFacilityId]?.location.country ?? ""}
      </span>
    ),
  },
  {
    key: "carrier", header: "Carrier", accessor: (s) => s.carrier,
    render: (s) => (
      <span className="text-xs font-medium px-2.5 py-0.5 rounded-full border bg-slate-100 text-slate-600 border-slate-200 dark:bg-white/5 dark:text-slate-300 dark:border-white/10">
        {s.carrier}
      </span>
    ),
  },
  {
    key: "quantity", header: "Qty", accessor: (s) => s.quantity,
    render: (s) => <span className="text-slate-700 dark:text-slate-300">{s.quantity.toLocaleString()}</span>,
  },
  {
    key: "value", header: "Value", accessor: (s) => s.value,
    render: (s) => <span className="font-medium text-slate-900 dark:text-white">{formatCurrency(s.value, true)}</span>,
  },
  {
    key: "shippedAt", header: "Shipped", accessor: (s) => s.shippedAt,
    render: (s) => <span className="text-xs text-slate-400">{formatDate(s.shippedAt)}</span>,
  },
  {
    key: "estimatedArrival", header: "Est. Arrival", accessor: (s) => s.estimatedArrival,
    render: (s) => <span className="text-xs text-slate-400">{formatDate(s.estimatedArrival)}</span>,
  },
];

export default function Shipments() {
  const globalSearch = useAppStore((s) => s.globalSearch);
  const [statusFilter,  setStatusFilter]  = useState("All Statuses");
  const [carrierFilter, setCarrierFilter] = useState("All Carriers");
  const [yearFilter,    setYearFilter]    = useState("All Years");

  const trend = getShipmentTrend();

  const filtered = shipments.filter((s) => {
    if (statusFilter  !== "All Statuses" && s.status  !== statusFilter)              return false;
    if (carrierFilter !== "All Carriers" && s.carrier !== carrierFilter)             return false;
    if (yearFilter    !== "All Years"    && !s.shippedAt.startsWith(yearFilter))     return false;
    return true;
  });

  const totalValue = filtered.reduce((sum, s) => sum + s.value, 0);
  const delivered  = filtered.filter((s) => s.status === "delivered").length;
  const delayed    = filtered.filter((s) => s.status === "delayed").length;
  const isFiltered = statusFilter !== "All Statuses" || carrierFilter !== "All Carriers" || yearFilter !== "All Years";

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total Shipments", value: filtered.length.toLocaleString(), color: "" },
          { label: "Total Value",     value: formatCurrency(totalValue, true),  color: "" },
          { label: "Delivered",       value: String(delivered),                 color: "text-success" },
          { label: "Delayed",         value: String(delayed),                   color: "text-danger" },
        ].map(({ label, value, color }) => (
          <div key={label} className="card px-4 py-3 text-center">
            <p className={`text-xl font-heading font-bold ${color || "text-slate-900 dark:text-white"}`}>{value}</p>
            <p className="text-xs text-slate-400 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      <div style={{ minHeight: 260 }}>
        <ShipmentLineChart data={trend} title="Shipments & Revenue Trend (2020–2026)" />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">Filters:</span>
        {[
          { value: statusFilter,  setter: setStatusFilter,  options: STATUSES, label: "Filter by status" },
          { value: carrierFilter, setter: setCarrierFilter, options: CARRIERS, label: "Filter by carrier" },
          { value: yearFilter,    setter: setYearFilter,    options: YEARS,    label: "Filter by year" },
        ].map(({ value, setter, options, label }) => (
          <select key={label} value={value} onChange={(e) => setter(e.target.value)} className="select py-1.5 text-sm" aria-label={label}>
            {options.map((o) => <option key={o} value={o}>{o.replace("_", " ")}</option>)}
          </select>
        ))}
        {isFiltered && (
          <button onClick={() => { setStatusFilter("All Statuses"); setCarrierFilter("All Carriers"); setYearFilter("All Years"); }} className="btn-ghost py-1.5 text-xs">
            Clear filters
          </button>
        )}
        <span className="ml-auto text-xs text-slate-400">{filtered.length} of {shipments.length} shipments</span>
      </div>

      <DataTable
        data={filtered as unknown as Record<string, unknown>[]}
        columns={COLUMNS as unknown as ColumnDef<Record<string, unknown>>[]}
        searchValue={globalSearch}
        searchFields={["trackingNumber", "carrier"] as never[]}
        exportFilename="shipments"
        pageSize={10}
      />
    </div>
  );
}
