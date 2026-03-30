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
  variant?: "default" | "revenue";
}

const COLOR_STYLES = {
  brand:   { icon: "bg-brand/10 text-brand dark:bg-brand/20 dark:text-brand-300" },
  success: { icon: "bg-success/10 text-success dark:bg-success/20" },
  warning: { icon: "bg-warning/10 text-warning dark:bg-warning/20" },
  danger:  { icon: "bg-danger/10 text-danger dark:bg-danger/20" },
};

export default function KpiCard({
  label, value, subValue, trend, trendLabel, icon, color = "brand", className, variant = "default"
}: KpiCardProps) {
  const isPositive = trend >= 0;
  const isRev = variant === "revenue";

  return (
    <article
      className={cn(
        "card kpi-card p-5 flex flex-col gap-4 relative overflow-hidden",
        isRev && "revenue-wave-card border-none shadow-[0_8px_30px_rgb(0,0,0,0.12)]",
        className
      )}
      data-color={color}
      aria-label={`${label}: ${value}`}
    >
      {/* Absolute animated background layers for revenue variant */}
      {isRev && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
          <div className="revenue-wave wave-1" />
          <div className="revenue-wave wave-2" />
          <div className="revenue-wave wave-3" />
        </div>
      )}

      {/* Content wrapper with z-index to stay above background */}
      <div className="relative z-10 flex flex-col gap-4 h-full justify-between">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className={cn("text-sm font-medium mb-1", isRev ? "text-white/80" : "text-slate-500 dark:text-slate-400")}>
              {label}
            </p>
            <p className={cn("font-heading text-2xl font-bold leading-tight truncate", isRev ? "text-white drop-shadow-sm" : "text-slate-900 dark:text-white")}>
              {value}
            </p>
            {subValue && (
              <p className={cn("text-xs mt-0.5", isRev ? "text-white/60" : "text-slate-400 dark:text-slate-500")}>
                {subValue}
              </p>
            )}
          </div>
          <div
            className={cn(
              "flex-shrink-0 h-12 w-12 rounded-2xl flex items-center justify-center text-2xl",
              isRev ? "bg-white/10 text-white backdrop-blur-md border border-white/20 shadow-inner" : COLOR_STYLES[color].icon
            )}
            aria-hidden="true"
          >
            {icon}
          </div>
        </div>

        <div className="flex items-center gap-2 mt-auto">
          <span className={cn(
            "inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full backdrop-blur-sm",
            isRev 
              ? (isPositive ? "bg-white/20 text-white border border-white/10" : "bg-white/10 text-white border border-white/10")
              : (isPositive ? "bg-success/10 text-success dark:bg-success/15" : "bg-danger/10 text-danger dark:bg-danger/15")
          )}>
            {isPositive
              ? <TrendingUp className="h-3 w-3" aria-hidden="true" />
              : <TrendingDown className="h-3 w-3" aria-hidden="true" />}
            {Math.abs(trend).toFixed(1)}%
          </span>
          <span className={cn("text-xs", isRev ? "text-white/70" : "text-slate-400 dark:text-slate-500")}>
            {trendLabel}
          </span>
        </div>
      </div>
    </article>
  );
}
