import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { useChartColors } from "@/lib/chartColors";

interface DataPoint { name: string; value: number; }

interface DonutChartProps {
  data: DataPoint[];
  title?: string;
  centerLabel?: string;
  centerValue?: string;
  formatter?: (value: number) => string;
}

const PALETTE = [
  "#4318FF", "#868CFF", "#01B574", "#FFB547",
  "#E53E3E", "#38B2AC", "#9F7AEA", "#F6AD55",
  "#48BB78", "#4299E1",
];

function CustomTooltip({ active, payload, formatter, colors }: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; payload: { fill: string } }>;
  formatter?: (v: number) => string;
  colors: ReturnType<typeof useChartColors>;
}) {
  if (!active || !payload?.length) return null;
  const item = payload[0];
  return (
    <div style={{ background: colors.tooltipBg, border: `1px solid ${colors.tooltipBorder}`, borderRadius: 12, padding: "10px 14px" }}>
      <p style={{ color: colors.tooltipSub, fontSize: 12 }}>{item.name}</p>
      <p style={{ color: item.payload.fill, fontWeight: 700, fontSize: 14 }}>
        {formatter ? formatter(item.value) : item.value.toLocaleString()}
      </p>
    </div>
  );
}

export default function DonutChart({ data, title, centerLabel, centerValue, formatter }: DonutChartProps) {
  const colors = useChartColors();
  return (
    <div className="card p-5 flex flex-col gap-4 h-full">
      {title && <p className="font-heading text-sm font-semibold text-slate-900 dark:text-white">{title}</p>}
      <div className="flex-1 relative" style={{ minHeight: 220 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} cx="50%" cy="50%" innerRadius="55%" outerRadius="80%" paddingAngle={3} dataKey="value" strokeWidth={0}>
              {data.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
            </Pie>
            <Tooltip content={<CustomTooltip formatter={formatter} colors={colors} />} />
            <Legend
              iconType="circle" iconSize={8}
              formatter={(value: string) => (
                <span style={{ color: colors.text, fontSize: 11 }}>{value}</span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>

        {centerValue && (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <p className="font-heading text-xl font-bold text-slate-900 dark:text-white">{centerValue}</p>
            {centerLabel && <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{centerLabel}</p>}
          </div>
        )}
      </div>
    </div>
  );
}
