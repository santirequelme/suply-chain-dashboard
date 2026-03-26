import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface KpiCardProps {
  label: string;
  value: string;
  subValue?: string;
  trend: number;
  trendLabel: string;
  icon: string;
  color?: "brand" | "success" | "warning" | "danger";
  className?: string;
}

const COLOR_STYLES = {
  brand:   { icon: "bg-brand/10 text-brand dark:bg-brand/20 dark:text-brand-300" },
  success: { icon: "bg-success/10 text-success dark:bg-success/20" },
  warning: { icon: "bg-warning/10 text-warning dark:bg-warning/20" },
  danger:  { icon: "bg-danger/10 text-danger dark:bg-danger/20" },
};

export default function KpiCard({
  label, value, subValue, trend, trendLabel, icon, color = "brand", className,
}: KpiCardProps) {
  const isPositive = trend >= 0;

  return (
    <article className={cn("card p-5 flex flex-col gap-4", className)} aria-label={`${label}: ${value}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">{label}</p>
          <p className="font-heading text-2xl font-bold text-slate-900 dark:text-white leading-tight truncate">
            {value}
          </p>
          {subValue && <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{subValue}</p>}
        </div>
        <div
          className={cn("flex-shrink-0 h-12 w-12 rounded-2xl flex items-center justify-center text-2xl", COLOR_STYLES[color].icon)}
          aria-hidden="true"
        >
          {icon}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span className={cn(
          "inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full",
          isPositive ? "bg-success/10 text-success dark:bg-success/15" : "bg-danger/10 text-danger dark:bg-danger/15"
        )}>
          {isPositive
            ? <TrendingUp className="h-3 w-3" aria-hidden="true" />
            : <TrendingDown className="h-3 w-3" aria-hidden="true" />}
          {Math.abs(trend).toFixed(1)}%
        </span>
        <span className="text-xs text-slate-400 dark:text-slate-500">{trendLabel}</span>
      </div>
    </article>
  );
}
