import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface GlobalFilters {
  dateRange: { start: string; end: string };
  regions: string[];
  suppliers: string[];
  products: string[];
  statuses: string[];
}

export interface AppSettings {
  units: "metric" | "imperial";
  volumeUnit: "units" | "kg" | "tons";
  defaultDateRange: "1y" | "2y" | "all";
  timeGranularity: "monthly" | "quarterly" | "yearly";
  defaultSuppliers: string[];
  defaultFacilities: string[];
  defaultCategories: string[];
}

const DEFAULT_FILTERS: GlobalFilters = {
  dateRange: { start: "2020-01-01", end: "2026-12-31" },
  regions: [],
  suppliers: [],
  products: [],
  statuses: [],
};

const DEFAULT_SETTINGS: AppSettings = {
  units: "metric",
  volumeUnit: "units",
  defaultDateRange: "all",
  timeGranularity: "monthly",
  defaultSuppliers: [],
  defaultFacilities: [],
  defaultCategories: [],
};

interface AppStore {
  darkMode: boolean;
  toggleDarkMode: () => void;

  globalSearch: string;
  setGlobalSearch: (q: string) => void;

  filters: GlobalFilters;
  setFilters: (f: Partial<GlobalFilters>) => void;
  resetFilters: () => void;

  settings: AppSettings;
  setSettings: (s: Partial<AppSettings>) => void;
}

export const useAppStore = create<AppStore>()(
  persist(
    (set) => ({
      darkMode: true,
      toggleDarkMode: () => set((s) => ({ darkMode: !s.darkMode })),

      globalSearch: "",
      setGlobalSearch: (q) => set({ globalSearch: q }),

      filters: DEFAULT_FILTERS,
      setFilters: (f) => set((s) => ({ filters: { ...s.filters, ...f } })),
      resetFilters: () => set({ filters: DEFAULT_FILTERS }),

      settings: DEFAULT_SETTINGS,
      setSettings: (s) => set((prev) => ({ settings: { ...prev.settings, ...s } })),
    }),
    {
      name: "m2f-app-store",
      partialize: (s) => ({ darkMode: s.darkMode, settings: s.settings }),
    }
  )
);

// ─── Filter helpers ───────────────────────────────────────────────────────────
export function countActiveFilters(f: GlobalFilters): number {
  let n = 0;
  if (f.regions.length)   n++;
  if (f.suppliers.length) n++;
  if (f.products.length)  n++;
  if (f.statuses.length)  n++;
  const isDefaultRange = f.dateRange.start === DEFAULT_FILTERS.dateRange.start &&
                         f.dateRange.end   === DEFAULT_FILTERS.dateRange.end;
  if (!isDefaultRange) n++;
  return n;
}
