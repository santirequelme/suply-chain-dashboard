import { useState } from "react";
import { SlidersHorizontal, Calendar, X, Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppStore, countActiveFilters } from "@/store/useAppStore";
import { ALL_REGIONS, ALL_CATEGORIES, ALL_STATUSES } from "@/data";

// ─── Types ────────────────────────────────────────────────────────────────────

interface FilterBarProps {
  /** Extra filter key labels for status pills (overrides ALL_STATUSES) */
  statusOptions?: string[];
  /** Show/hide specific filter groups */
  show?: {
    dateRange?: boolean;
    regions?: boolean;
    suppliers?: boolean;
    products?: boolean;
    statuses?: boolean;
  };
}

// ─── Dropdown Multi-select ────────────────────────────────────────────────────

function MultiSelect({
  label,
  options,
  selected,
  onChange,
  icon: Icon,
}: {
  label: string;
  options: string[];
  selected: string[];
  onChange: (v: string[]) => void;
  icon?: React.ElementType;
}) {
  const [open, setOpen] = useState(false);

  const toggle = (val: string) => {
    if (selected.includes(val)) {
      onChange(selected.filter((x) => x !== val));
    } else {
      onChange([...selected, val]);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border transition-all duration-150",
          selected.length > 0
            ? "bg-brand text-white border-brand shadow-brand-glow"
            : "bg-white text-slate-600 border-slate-200 hover:border-brand/50 dark:bg-navy-800 dark:text-slate-400 dark:border-white/10 dark:hover:border-brand/40"
        )}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label={`Filter by ${label}`}
      >
        {Icon && <Icon className="h-3.5 w-3.5" aria-hidden="true" />}
        {label}
        {selected.length > 0 && (
          <span className="ml-0.5 bg-white/20 rounded-full px-1.5 py-0.5 text-[10px] leading-none">
            {selected.length}
          </span>
        )}
        <ChevronDown className={cn("h-3 w-3 transition-transform", open && "rotate-180")} aria-hidden="true" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} aria-hidden="true" />
          <div
            className={cn(
              "absolute top-full left-0 mt-1.5 z-40 min-w-[180px] rounded-2xl shadow-lg overflow-hidden",
              "bg-white border border-slate-200 dark:bg-navy-800 dark:border-white/10"
            )}
            role="listbox"
            aria-multiselectable="true"
            aria-label={`${label} options`}
          >
            <ul className="py-1.5 max-h-56 overflow-y-auto">
              {options.map((opt) => {
                const isSelected = selected.includes(opt);
                return (
                  <li key={opt} role="option" aria-selected={isSelected}>
                    <button
                      onClick={() => toggle(opt)}
                      className={cn(
                        "w-full flex items-center gap-2.5 px-3 py-2 text-left text-xs transition-colors",
                        isSelected
                          ? "text-brand dark:text-blue-300"
                          : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5"
                      )}
                    >
                      <span className={cn(
                        "flex h-4 w-4 items-center justify-center rounded border flex-shrink-0",
                        isSelected
                          ? "bg-brand border-brand"
                          : "border-slate-300 dark:border-white/20"
                      )}>
                        {isSelected && <Check className="h-2.5 w-2.5 text-white" aria-hidden="true" />}
                      </span>
                      {opt.replace(/_/g, " ")}
                    </button>
                  </li>
                );
              })}
            </ul>
            {selected.length > 0 && (
              <div className="border-t border-slate-100 dark:border-white/5 p-1.5">
                <button
                  onClick={() => onChange([])}
                  className="w-full text-center text-xs text-danger hover:text-danger/80 py-1 transition-colors"
                >
                  Clear
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

// ─── Date Range Picker ────────────────────────────────────────────────────────

function DateRangePicker() {
  const { filters, setFilters } = useAppStore();
  const [open, setOpen] = useState(false);
  const [local, setLocal] = useState({ ...filters.dateRange });

  const isDefault =
    filters.dateRange.start === "2020-01-01" && filters.dateRange.end === "2026-12-31";

  const apply = () => {
    setFilters({ dateRange: local });
    setOpen(false);
  };

  const reset = () => {
    const def = { start: "2020-01-01", end: "2026-12-31" };
    setLocal(def);
    setFilters({ dateRange: def });
    setOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border transition-all duration-150",
          !isDefault
            ? "bg-brand text-white border-brand shadow-brand-glow"
            : "bg-white text-slate-600 border-slate-200 hover:border-brand/50 dark:bg-navy-800 dark:text-slate-400 dark:border-white/10 dark:hover:border-brand/40"
        )}
        aria-expanded={open}
        aria-label="Filter by date range"
      >
        <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
        Date Range
        {!isDefault && (
          <span className="ml-0.5 bg-white/20 rounded-full px-1.5 py-0.5 text-[10px] leading-none">
            1
          </span>
        )}
        <ChevronDown className={cn("h-3 w-3 transition-transform", open && "rotate-180")} aria-hidden="true" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} aria-hidden="true" />
          <div
            className={cn(
              "absolute top-full left-0 mt-1.5 z-40 w-72 rounded-2xl shadow-lg",
              "bg-white border border-slate-200 dark:bg-navy-800 dark:border-white/10 p-4 space-y-3"
            )}
          >
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">Date Range</p>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-slate-400 dark:text-slate-500 mb-1 block">From</label>
                <input
                  type="date"
                  value={local.start}
                  min="2020-01-01"
                  max={local.end}
                  onChange={(e) => setLocal((l) => ({ ...l, start: e.target.value }))}
                  className="input text-xs py-1.5 w-full"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 dark:text-slate-500 mb-1 block">To</label>
                <input
                  type="date"
                  value={local.end}
                  min={local.start}
                  max="2026-12-31"
                  onChange={(e) => setLocal((l) => ({ ...l, end: e.target.value }))}
                  className="input text-xs py-1.5 w-full"
                />
              </div>
            </div>
            <div className="flex gap-2 pt-1">
              <button
                onClick={reset}
                className="flex-1 py-1.5 rounded-lg text-xs font-medium border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
              >
                Reset
              </button>
              <button
                onClick={apply}
                className="flex-1 py-1.5 rounded-lg text-xs font-medium bg-brand text-white hover:bg-brand/90 transition-colors"
              >
                Apply
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ─── FilterBar ─────────────────────────────────────────────────────────────────

export default function FilterBar({ statusOptions, show = {} }: FilterBarProps) {
  const { filters, setFilters, resetFilters } = useAppStore();
  const count = countActiveFilters(filters);

  const showAll = {
    dateRange: show.dateRange !== false,
    regions: show.regions !== false,
    statuses: show.statuses !== false,
    suppliers: show.suppliers !== false,
    products: show.products !== false,
  };

  const statuses = statusOptions ?? ALL_STATUSES;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex items-center gap-1.5 text-xs font-medium text-slate-400 dark:text-slate-500">
        <SlidersHorizontal className="h-3.5 w-3.5" aria-hidden="true" />
        <span className="sr-only">Filters</span>
      </div>

      {showAll.dateRange && <DateRangePicker />}

      {showAll.regions && (
        <MultiSelect
          label="Region"
          options={ALL_REGIONS}
          selected={filters.regions}
          onChange={(v) => setFilters({ regions: v })}
        />
      )}

      {showAll.statuses && (
        <MultiSelect
          label="Status"
          options={statuses}
          selected={filters.statuses}
          onChange={(v) => setFilters({ statuses: v })}
        />
      )}

      {showAll.suppliers && (
        <MultiSelect
          label="Category"
          options={ALL_CATEGORIES}
          selected={filters.products}
          onChange={(v) => setFilters({ products: v })}
        />
      )}

      {count > 0 && (
        <button
          onClick={resetFilters}
          className="flex items-center gap-1 px-2.5 py-2 rounded-xl text-xs font-medium text-danger hover:bg-danger/10 transition-colors border border-transparent hover:border-danger/20"
          aria-label="Reset all filters"
        >
          <X className="h-3 w-3" aria-hidden="true" />
          Reset
        </button>
      )}
    </div>
  );
}
