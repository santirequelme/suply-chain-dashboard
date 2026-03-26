import {
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart,
} from "recharts";
import { useChartColors } from "@/lib/chartColors";

interface DataPoint { month: string; year: number; shipments: number; revenue: number; }

interface ShipmentLineChartProps {
  data: DataPoint[];
  title?: string;
}

function CustomTooltip({ active, payload, label, colors }: {
  active?: boolean;
  payload?: Array<{ value: number; dataKey: string; color: string }>;
  label?: string;
  colors: ReturnType<typeof useChartColors>;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: colors.tooltipBg, border: `1px solid ${colors.tooltipBorder}`, borderRadius: 12, padding: "10px 14px", minWidth: 130 }}>
      <p style={{ color: colors.tooltipSub, fontSize: 12, marginBottom: 6 }}>{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} style={{ color: p.color, fontWeight: 700, fontSize: 13 }}>
          {p.dataKey === "revenue" ? `$${(p.value / 1_000_000).toFixed(2)}M` : p.value.toLocaleString()}{" "}
          <span style={{ fontWeight: 400, color: colors.tooltipSub, fontSize: 11 }}>{p.dataKey}</span>
        </p>
      ))}
    </div>
  );
}

export default function ShipmentLineChart({ data, title }: ShipmentLineChartProps) {
  const colors = useChartColors();
  const chartData = data.map((d) => ({ ...d, label: `${d.month} '${String(d.year).slice(2)}` }));

  return (
    <div className="card p-5 flex flex-col gap-4 h-full">
      {title && (
        <div className="flex items-center justify-between">
          <p className="font-heading text-sm font-semibold text-slate-900 dark:text-white">{title}</p>
          <div className="flex items-center gap-4">
            {[
              { label: "Revenue", color: colors.primary },
              { label: "Shipments", color: colors.success },
            ].map(({ label, color }) => (
              <span key={label} className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                <span className="inline-block h-2 w-2 rounded-full" style={{ background: color }} />
                {label}
              </span>
            ))}
          </div>
        </div>
      )}
      <div className="flex-1 min-h-0" style={{ minHeight: 220 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={colors.primary} stopOpacity={0.25} />
                <stop offset="95%" stopColor={colors.primary} stopOpacity={0} />
              </linearGradient>
              <linearGradient id="shipGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={colors.success} stopOpacity={0.25} />
                <stop offset="95%" stopColor={colors.success} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke={colors.gridLine} strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="label" tick={{ fill: colors.text, fontSize: 10 }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
            <YAxis yAxisId="revenue" orientation="left" tick={{ fill: colors.text, fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v: number) => `$${(v / 1_000_000).toFixed(0)}M`} width={44} />
            <YAxis yAxisId="shipments" orientation="right" tick={{ fill: colors.text, fontSize: 10 }} axisLine={false} tickLine={false} width={36} />
            <Tooltip content={<CustomTooltip colors={colors} />} />
            <Area yAxisId="revenue" type="monotone" dataKey="revenue" stroke={colors.primary} strokeWidth={2} fill="url(#revenueGrad)" dot={false} activeDot={{ r: 4, fill: colors.primary }} />
            <Area yAxisId="shipments" type="monotone" dataKey="shipments" stroke={colors.success} strokeWidth={2} fill="url(#shipGrad)" dot={false} activeDot={{ r: 4, fill: colors.success }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
