import { useState } from "react";
import { products, supplierMap, getRevenueByCategory } from "@/data";
import DataTable from "@/components/ui/DataTable";
import Badge from "@/components/ui/Badge";
import DonutChart from "@/components/charts/DonutChart";
import { useAppStore } from "@/store/useAppStore";
import { formatCurrency, formatPercent } from "@/lib/utils";
import type { ColumnDef } from "@/components/ui/DataTable";
import type { Product } from "@/types";

const CATEGORIES = ["All Categories", ...Array.from(new Set(products.map((p) => p.category))).sort()];
const STATUSES   = ["All Statuses", "in_stock", "low_stock", "out_of_stock", "discontinued"];

const COLUMNS: ColumnDef<Product>[] = [
  {
    key: "sku", header: "SKU", accessor: (p) => p.sku,
    render: (p) => <span className="font-mono text-xs text-slate-400">{p.sku}</span>,
  },
  {
    key: "name", header: "Product", accessor: (p) => p.name, pinned: true,
    render: (p) => (
      <div className="min-w-[160px]">
        <p className="font-medium text-slate-900 dark:text-white text-sm">{p.name}</p>
        <p className="text-xs text-slate-400">{p.id}</p>
      </div>
    ),
  },
  {
    key: "category", header: "Category", accessor: (p) => p.category,
    render: (p) => (
      <span className="text-xs font-medium px-2.5 py-0.5 rounded-full border bg-slate-100 text-slate-600 border-slate-200 dark:bg-white/5 dark:text-slate-300 dark:border-white/10">
        {p.category}
      </span>
    ),
  },
  { key: "status",   header: "Status",   accessor: (p) => p.status,   render: (p) => <Badge status={p.status} /> },
  {
    key: "supplier", header: "Supplier", accessor: (p) => supplierMap[p.supplierId]?.name ?? "—",
    render: (p) => <span className="text-slate-500 dark:text-slate-400 text-xs">{supplierMap[p.supplierId]?.name ?? "—"}</span>,
  },
  {
    key: "unitPrice", header: "Unit Price", accessor: (p) => p.unitPrice,
    render: (p) => <span className="font-medium text-slate-900 dark:text-white">{formatCurrency(p.unitPrice)}</span>,
  },
  {
    key: "stock", header: "Stock", accessor: (p) => p.stock,
    render: (p) => (
      <span className={p.stock === 0 ? "text-danger font-semibold" : p.stock < 200 ? "text-warning font-semibold" : "text-slate-700 dark:text-slate-300"}>
        {p.stock.toLocaleString()}
      </span>
    ),
  },
  {
    key: "demandMonthly", header: "Monthly Demand", accessor: (p) => p.demandMonthly,
    render: (p) => <span className="text-slate-400 text-xs">{p.demandMonthly.toLocaleString()} / mo</span>,
  },
  {
    key: "leadTimeDays", header: "Lead Time", accessor: (p) => p.leadTimeDays,
    render: (p) => (
      <span className={`text-xs ${p.leadTimeDays <= 14 ? "text-success" : p.leadTimeDays <= 30 ? "text-warning" : "text-danger"}`}>
        {p.leadTimeDays}d
      </span>
    ),
  },
  {
    key: "weight", header: "Weight", accessor: (p) => p.weight,
    render: (p) => <span className="text-slate-400 text-xs">{p.weight} kg</span>,
  },
];

export default function Products() {
  const globalSearch   = useAppStore((s) => s.globalSearch);
  const [categoryFilter, setCategoryFilter] = useState("All Categories");
  const [statusFilter,   setStatusFilter]   = useState("All Statuses");

  const filtered = products.filter((p) => {
    if (categoryFilter !== "All Categories" && p.category !== categoryFilter) return false;
    if (statusFilter   !== "All Statuses"   && p.status   !== statusFilter)   return false;
    return true;
  });

  const categoryRevenue = getRevenueByCategory().slice(0, 8);
  const stockStats = {
    inStock:      products.filter((p) => p.status === "in_stock").length,
    lowStock:     products.filter((p) => p.status === "low_stock").length,
    outOfStock:   products.filter((p) => p.status === "out_of_stock").length,
    discontinued: products.filter((p) => p.status === "discontinued").length,
  };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "In Stock",      value: String(stockStats.inStock),      color: "text-success" },
          { label: "Low Stock",     value: String(stockStats.lowStock),      color: "text-warning" },
          { label: "Out of Stock",  value: String(stockStats.outOfStock),    color: "text-danger" },
          { label: "Discontinued",  value: String(stockStats.discontinued),  color: "text-slate-400" },
        ].map(({ label, value, color }) => (
          <div key={label} className="card px-4 py-3 text-center">
            <p className={`text-xl font-heading font-bold ${color}`}>{value}</p>
            <p className="text-xs text-slate-400 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 flex flex-col justify-end gap-3">
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-500 dark:text-slate-400 font-medium whitespace-nowrap">Filters:</span>
            <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="select py-1.5 text-sm flex-1" aria-label="Filter by category">
              {CATEGORIES.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-3">
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="select py-1.5 text-sm" aria-label="Filter by status">
              {STATUSES.map((o) => <option key={o} value={o}>{o.replace(/_/g, " ")}</option>)}
            </select>
            <span className="ml-auto text-xs text-slate-400 whitespace-nowrap">{filtered.length} of {products.length} products</span>
          </div>
        </div>
        <div style={{ minHeight: 260 }}>
          <DonutChart data={categoryRevenue} title="Revenue by Category" formatter={(v) => formatCurrency(v, true)} />
        </div>
      </div>

      <DataTable
        data={filtered as unknown as Record<string, unknown>[]}
        columns={COLUMNS as unknown as ColumnDef<Record<string, unknown>>[]}
        searchValue={globalSearch}
        searchFields={["name", "sku"] as never[]}
        exportFilename="products"
        pageSize={10}
      />
    </div>
  );
}
