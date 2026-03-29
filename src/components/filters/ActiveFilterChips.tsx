import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppStore, countActiveFilters } from "@/store/useAppStore";

export default function ActiveFilterChips() {
  const { filters, setFilters, resetFilters } = useAppStore();
  const count = countActiveFilters(filters);

  if (count === 0) return null;

  const chips: { label: string; onRemove: () => void }[] = [];

  const DEFAULT_START = "2020-01-01";
  const DEFAULT_END   = "2026-12-31";
  const isDefaultRange =
    filters.dateRange.start === DEFAULT_START && filters.dateRange.end === DEFAULT_END;

  if (!isDefaultRange) {
    chips.push({
      label: `${filters.dateRange.start.slice(0, 7)} → ${filters.dateRange.end.slice(0, 7)}`,
      onRemove: () => setFilters({ dateRange: { start: DEFAULT_START, end: DEFAULT_END } }),
    });
  }

  filters.regions.forEach((r) =>
    chips.push({ label: r, onRemove: () => setFilters({ regions: filters.regions.filter((x) => x !== r) }) })
  );

  filters.suppliers.forEach((s) =>
    chips.push({ label: s, onRemove: () => setFilters({ suppliers: filters.suppliers.filter((x) => x !== s) }) })
  );

  filters.products.forEach((p) =>
    chips.push({ label: p, onRemove: () => setFilters({ products: filters.products.filter((x) => x !== p) }) })
  );

  filters.statuses.forEach((st) =>
    chips.push({ label: st.replace(/_/g, " "), onRemove: () => setFilters({ statuses: filters.statuses.filter((x) => x !== st) }) })
  );

  return (
    <div className="flex flex-wrap items-center gap-2" role="list" aria-label="Active filters">
      {chips.map(({ label, onRemove }) => (
        <span
          key={label}
          role="listitem"
          className={cn(
            "inline-flex items-center gap-1.5 pl-2.5 pr-1.5 py-1 rounded-lg text-xs font-medium",
            "bg-brand/10 text-brand dark:bg-brand/20 dark:text-blue-300",
            "border border-brand/20 dark:border-brand/30"
          )}
        >
          {label}
          <button
            onClick={onRemove}
            className="rounded hover:bg-brand/20 p-0.5 transition-colors"
            aria-label={`Remove filter: ${label}`}
          >
            <X className="h-3 w-3" aria-hidden="true" />
          </button>
        </span>
      ))}
      <button
        onClick={resetFilters}
        className="text-xs font-medium text-slate-400 hover:text-danger transition-colors px-1"
        aria-label="Clear all filters"
      >
        Clear all
      </button>
    </div>
  );
}
