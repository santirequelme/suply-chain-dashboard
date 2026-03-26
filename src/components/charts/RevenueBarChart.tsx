import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { useChartColors } from "@/lib/chartColors";

interface DataPoint { name: string; revenue: number; }

interface RevenueBarChartProps {
  data: DataPoint[];
  title?: string;
}

function CustomTooltip({ active, payload, label, colors }: {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
  colors: ReturnType<typeof useChartColors>;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: colors.tooltipBg, border: `1px solid ${colors.tooltipBorder}`, borderRadius: 12, padding: "10px 14px" }}>
      <p style={{ color: colors.tooltipSub, fontSize: 12, marginBottom: 4 }}>{label}</p>
      <p style={{ color: colors.tooltipText, fontWeight: 700, fontSize: 14 }}>
        ${(payload[0].value / 1_000_000).toFixed(2)}M
      </p>
    </div>
  );
}

export default function RevenueBarChart({ data, title }: RevenueBarChartProps) {
  const colors = useChartColors();
  return (
    <div className="card p-5 flex flex-col gap-4 h-full">
      {title && <p className="font-heading text-sm font-semibold text-slate-900 dark:text-white">{title}</p>}
      <div className="flex-1 min-h-0" style={{ minHeight: 220 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={colors.primaryLight} />
                <stop offset="100%" stopColor={colors.primary} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={colors.gridLine} vertical={false} />
            <XAxis dataKey="name" tick={{ fill: colors.text, fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis
              tick={{ fill: colors.text, fontSize: 11 }} axisLine={false} tickLine={false}
              tickFormatter={(v: number) => `$${(v / 1_000_000).toFixed(0)}M`} width={48}
            />
            <Tooltip content={<CustomTooltip colors={colors} />} cursor={{ fill: colors.gridLine }} />
            <Bar dataKey="revenue" fill="url(#barGrad)" radius={[6, 6, 0, 0]} maxBarSize={40} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
