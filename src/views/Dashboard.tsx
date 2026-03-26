import {
  getDashboardStats, getRevenueByCategory, getShipmentsByStatus,
  getTopFacilitiesByRevenue, getShipmentTrend,
  shipments, facilityMap, productMap, supplierMap,
} from "@/data";
import KpiCard from "@/components/ui/KpiCard";
import RevenueBarChart from "@/components/charts/RevenueBarChart";
import ShipmentLineChart from "@/components/charts/ShipmentLineChart";
import DonutChart from "@/components/charts/DonutChart";
import Badge from "@/components/ui/Badge";
import { formatCurrency, formatPercent, formatDate } from "@/lib/utils";

export default function Dashboard() {
  const stats = getDashboardStats();
  const categoryRevenue = getRevenueByCategory().slice(0, 7);
  const shipmentsByStatus = getShipmentsByStatus();
  const topFacilities = getTopFacilitiesByRevenue(8);
  const trend = getShipmentTrend();
  const recentShipments = shipments.slice(0, 8);

  const kpis = [
    { label: "Total Revenue", value: formatCurrency(stats.totalRevenue, true), subValue: "All shipments YTD", trend: 12.4, trendLabel: "vs last year", icon: "💰", color: "brand" as const },
    { label: "Active Suppliers", value: String(stats.activeSuppliers), subValue: `${22 - stats.activeSuppliers} inactive`, trend: 4.2, trendLabel: "vs last quarter", icon: "🏭", color: "success" as const },
    { label: "On-Time Rate", value: formatPercent(stats.onTimeRate), subValue: `${stats.onTimeShipments} of ${stats.totalShipments}`, trend: -1.8, trendLabel: "vs last month", icon: "⏱️", color: "warning" as const },
    { label: "Facility Utilization", value: formatPercent(stats.avgUtilization), subValue: `${stats.activeFacilities} active facilities`, trend: 3.1, trendLabel: "vs last quarter", icon: "📦", color: "brand" as const },
  ];

  const alertChips = [
    { label: "In Transit", value: stats.inTransit, color: "text-brand dark:text-brand-300" },
    { label: "Delayed",    value: stats.delayed,    color: "text-danger" },
    { label: "Pending",    value: stats.totalShipments - stats.inTransit - stats.delayed - stats.onTimeShipments, color: "text-warning" },
  ];

  return (
    <div className="space-y-6" aria-label="Dashboard overview">
      {/* KPI Grid */}
      <section aria-label="Key performance indicators">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {kpis.map((kpi) => <KpiCard key={kpi.label} {...kpi} />)}
        </div>
      </section>

      {/* Alert chips */}
      <section className="grid grid-cols-3 gap-3" aria-label="Shipment status summary">
        {alertChips.map(({ label, value, color }) => (
          <div key={label} className="card px-4 py-3 flex items-center justify-between">
            <span className="text-xs text-slate-500 dark:text-slate-400">{label}</span>
            <span className={`font-heading text-xl font-bold ${color}`}>{value}</span>
          </div>
        ))}
      </section>

      {/* Charts row 1 */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4" aria-label="Revenue and shipment trends" style={{ minHeight: 280 }}>
        <div className="lg:col-span-2">
          <ShipmentLineChart data={trend} title="Revenue & Shipments Trend" />
        </div>
        <DonutChart data={shipmentsByStatus} title="Shipments by Status" centerValue={String(stats.totalShipments)} centerLabel="Total" />
      </section>

      {/* Charts row 2 */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4" aria-label="Facility revenue and category breakdown" style={{ minHeight: 260 }}>
        <RevenueBarChart data={topFacilities} title="Top 8 Facilities by Revenue" />
        <DonutChart data={categoryRevenue} title="Revenue by Product Category" formatter={(v) => formatCurrency(v, true)} />
      </section>

      {/* Recent shipments */}
      <section className="card overflow-hidden" aria-label="Recent shipments">
        <div className="px-5 py-4 border-b border-slate-200 dark:border-white/10">
          <h2 className="font-heading text-sm font-semibold text-slate-900 dark:text-white">Recent Shipments</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full" role="table">
            <thead>
              <tr className="border-b border-slate-200 dark:border-white/10">
                {["Tracking #", "Product", "Supplier", "Origin → Dest", "Value", "Status", "Date"].map((h) => (
                  <th key={h} scope="col" className="th">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentShipments.map((s) => {
                const product  = productMap[s.productId];
                const supplier = supplierMap[s.supplierId];
                const origin   = facilityMap[s.originFacilityId];
                const dest     = facilityMap[s.destinationFacilityId];
                return (
                  <tr key={s.id} className="tr">
                    <td className="td font-mono text-xs text-slate-400 dark:text-slate-400">{s.trackingNumber}</td>
                    <td className="td font-medium text-slate-900 dark:text-white">{product?.name ?? "—"}</td>
                    <td className="td text-slate-500 dark:text-slate-400">{supplier?.name ?? "—"}</td>
                    <td className="td text-slate-400 dark:text-slate-500 text-xs">
                      {origin?.location.city ?? "?"} → {dest?.location.city ?? "?"}
                    </td>
                    <td className="td font-medium text-slate-900 dark:text-white">{formatCurrency(s.value, true)}</td>
                    <td className="td"><Badge status={s.status} /></td>
                    <td className="td text-slate-400 dark:text-slate-500 text-xs">{formatDate(s.shippedAt)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
