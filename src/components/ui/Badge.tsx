import { cn } from "@/lib/utils";

type BadgeVariant =
  | "active" | "inactive" | "maintenance" | "on_hold"
  | "in_stock" | "low_stock" | "out_of_stock" | "discontinued"
  | "delivered" | "in_transit" | "pending" | "delayed" | "cancelled"
  | "default";

const VARIANT_STYLES: Record<BadgeVariant, string> = {
  active:        "bg-success/10 text-success border border-success/20 dark:bg-success/20 dark:border-success/30",
  inactive:      "bg-slate-100 text-slate-500 border border-slate-200 dark:bg-slate-700/50 dark:text-slate-400 dark:border-slate-600/30",
  maintenance:   "bg-warning/10 text-warning border border-warning/20 dark:bg-warning/20 dark:border-warning/30",
  on_hold:       "bg-warning/10 text-warning border border-warning/20 dark:bg-warning/20 dark:border-warning/30",
  in_stock:      "bg-success/10 text-success border border-success/20 dark:bg-success/20 dark:border-success/30",
  low_stock:     "bg-warning/10 text-warning border border-warning/20 dark:bg-warning/20 dark:border-warning/30",
  out_of_stock:  "bg-danger/10 text-danger border border-danger/20 dark:bg-danger/20 dark:border-danger/30",
  discontinued:  "bg-slate-100 text-slate-500 border border-slate-200 dark:bg-slate-700/50 dark:text-slate-400 dark:border-slate-600/30",
  delivered:     "bg-success/10 text-success border border-success/20 dark:bg-success/20 dark:border-success/30",
  in_transit:    "bg-brand/10 text-brand border border-brand/20 dark:bg-brand/20 dark:text-brand-200 dark:border-brand/30",
  pending:       "bg-slate-100 text-slate-500 border border-slate-200 dark:bg-slate-700/50 dark:text-slate-400 dark:border-slate-600/30",
  delayed:       "bg-danger/10 text-danger border border-danger/20 dark:bg-danger/20 dark:border-danger/30",
  cancelled:     "bg-slate-100 text-slate-500 border border-slate-200 dark:bg-slate-700/50 dark:text-slate-400 dark:border-slate-600/30",
  default:       "bg-slate-100 text-slate-500 border border-slate-200 dark:bg-slate-700/50 dark:text-slate-400 dark:border-slate-600/30",
};

const VARIANT_LABELS: Record<string, string> = {
  active: "Active", inactive: "Inactive", maintenance: "Maintenance",
  on_hold: "On Hold", in_stock: "In Stock", low_stock: "Low Stock",
  out_of_stock: "Out of Stock", discontinued: "Discontinued",
  delivered: "Delivered", in_transit: "In Transit",
  pending: "Pending", delayed: "Delayed", cancelled: "Cancelled",
};

interface BadgeProps {
  status: string;
  className?: string;
}

export default function Badge({ status, className }: BadgeProps) {
  const variant = (status as BadgeVariant) in VARIANT_STYLES ? (status as BadgeVariant) : "default";
  return (
    <span className={cn("badge", VARIANT_STYLES[variant], className)} aria-label={`Status: ${VARIANT_LABELS[status] ?? status}`}>
      <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-current opacity-80" aria-hidden="true" />
      {VARIANT_LABELS[status] ?? status}
    </span>
  );
}
