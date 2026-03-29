import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
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
    <div className="card p-5 flex flex-col gap-3 h-full">
      {title && <p className="font-heading text-sm font-semibold text-slate-900 dark:text-white">{title}</p>}

      {/* Donut — perfectly centred, no built-in Legend pushing it around */}
      <div className="relative" style={{ height: 200 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
            <Pie
              data={data}
              cx="50%" cy="50%"
              innerRadius="52%" outerRadius="78%"
              paddingAngle={3}
              dataKey="value"
              strokeWidth={0}
            >
              {data.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
            </Pie>
            <Tooltip content={<CustomTooltip formatter={formatter} colors={colors} />} />
          </PieChart>
        </ResponsiveContainer>

        {/* Centre label — absolutely positioned over the hole */}
        {centerValue && (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <p className="font-heading text-xl font-bold text-slate-900 dark:text-white leading-none">
              {centerValue}
            </p>
            {centerLabel && (
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{centerLabel}</p>
            )}
          </div>
        )}
      </div>

      {/* Custom legend — centred below the donut */}
      <div className="flex flex-wrap justify-center gap-x-4 gap-y-1.5 pt-1">
        {data.map((entry, i) => (
          <span key={entry.name} className="flex items-center gap-1.5 text-xs" style={{ color: colors.text }}>
            <span
              className="inline-block h-2 w-2 rounded-full flex-shrink-0"
              style={{ background: PALETTE[i % PALETTE.length] }}
              aria-hidden="true"
            />
            {entry.name}
            {formatter && (
              <span className="font-semibold" style={{ color: PALETTE[i % PALETTE.length] }}>
                {formatter(entry.value)}
              </span>
            )}
          </span>
        ))}
      </div>
    </div>
  );
}
