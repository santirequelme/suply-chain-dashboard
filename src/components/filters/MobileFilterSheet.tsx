import { useState } from "react";
import { SlidersHorizontal, Check, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppStore, countActiveFilters } from "@/store/useAppStore";
import { ALL_REGIONS, ALL_CATEGORIES, ALL_STATUSES } from "@/data";
import BottomSheet from "./BottomSheet";

interface MobileFilterSheetProps {
  statusOptions?: string[];
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">{title}</p>
      {children}
    </div>
  );
}

function PillGroup({
  options,
  selected,
  onChange,
}: {
  options: string[];
  selected: string[];
  onChange: (v: string[]) => void;
}) {
  const toggle = (val: string) => {
    onChange(selected.includes(val) ? selected.filter((x) => x !== val) : [...selected, val]);
  };

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const active = selected.includes(opt);
        return (
          <button
            key={opt}
            onClick={() => toggle(opt)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all duration-150",
              active
                ? "bg-brand text-white border-brand"
                : "bg-slate-50 text-slate-600 border-slate-200 dark:bg-white/5 dark:text-slate-400 dark:border-white/10"
            )}
            aria-pressed={active}
          >
            {active && <Check className="h-3 w-3" aria-hidden="true" />}
            {opt.replace(/_/g, " ")}
          </button>
        );
      })}
    </div>
  );
}

export default function MobileFilterSheet({ statusOptions }: MobileFilterSheetProps) {
  const [open, setOpen] = useState(false);
  const { filters, setFilters, resetFilters } = useAppStore();
  const [localDates, setLocalDates] = useState({ ...filters.dateRange });
  const count = countActiveFilters(filters);
  const statuses = statusOptions ?? ALL_STATUSES;

  const applyDates = () => {
    setFilters({ dateRange: localDates });
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={cn(
          "lg:hidden flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border transition-all duration-150",
          count > 0
            ? "bg-brand text-white border-brand shadow-brand-glow"
            : "bg-white text-slate-600 border-slate-200 dark:bg-navy-800 dark:text-slate-400 dark:border-white/10"
        )}
        aria-label={`Open filters${count > 0 ? `, ${count} active` : ""}`}
      >
        <SlidersHorizontal className="h-3.5 w-3.5" aria-hidden="true" />
        Filters
        {count > 0 && (
          <span className="ml-0.5 bg-white/20 rounded-full px-1.5 py-0.5 text-[10px] leading-none">
            {count}
          </span>
        )}
      </button>

      <BottomSheet open={open} onClose={() => setOpen(false)} title="Filters">
        {/* Date Range */}
        <Section title="Date Range">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] text-slate-400 dark:text-slate-500 mb-1 block">From</label>
              <input
                type="date"
                value={localDates.start}
                min="2020-01-01"
                max={localDates.end}
                onChange={(e) => setLocalDates((l) => ({ ...l, start: e.target.value }))}
                onBlur={applyDates}
                className="input text-xs py-2 w-full"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 dark:text-slate-500 mb-1 block">To</label>
              <input
                type="date"
                value={localDates.end}
                min={localDates.start}
                max="2026-12-31"
                onChange={(e) => setLocalDates((l) => ({ ...l, end: e.target.value }))}
                onBlur={applyDates}
                className="input text-xs py-2 w-full"
              />
            </div>
          </div>
          <button
            onClick={applyDates}
            className="mt-2 w-full py-2 rounded-xl text-xs font-medium bg-brand/10 text-brand dark:bg-brand/20 dark:text-blue-300 transition-colors"
          >
            <Calendar className="h-3.5 w-3.5 inline mr-1" aria-hidden="true" />
            Apply dates
          </button>
        </Section>

        {/* Regions */}
        <Section title="Region">
          <PillGroup
            options={ALL_REGIONS}
            selected={filters.regions}
            onChange={(v) => setFilters({ regions: v })}
          />
        </Section>

        {/* Status */}
        <Section title="Status">
          <PillGroup
            options={statuses}
            selected={filters.statuses}
            onChange={(v) => setFilters({ statuses: v })}
          />
        </Section>

        {/* Categories */}
        <Section title="Category">
          <PillGroup
            options={ALL_CATEGORIES}
            selected={filters.products}
            onChange={(v) => setFilters({ products: v })}
          />
        </Section>

        {/* Reset */}
        {count > 0 && (
          <button
            onClick={() => { resetFilters(); setLocalDates({ start: "2020-01-01", end: "2026-12-31" }); setOpen(false); }}
            className="w-full py-2.5 rounded-xl text-sm font-medium text-danger border border-danger/30 hover:bg-danger/5 transition-colors"
          >
            Clear all filters
          </button>
        )}
      </BottomSheet>
    </>
  );
}
