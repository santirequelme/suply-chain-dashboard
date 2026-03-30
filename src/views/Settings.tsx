import { useAppStore } from "@/store/useAppStore";
import { cn } from "@/lib/utils";
import { Sun, Moon, Package, Calendar, MapPin, Settings2, Database, Clock, Palette } from "lucide-react";

const SECTION_CLASS = "card p-5 space-y-5";
const LABEL_CLASS = "text-sm font-medium text-slate-700 dark:text-slate-300";
const DESC_CLASS = "text-xs text-slate-400 dark:text-slate-500 mt-0.5";

function SectionHeader({ icon: Icon, title, description }: { icon: React.ElementType; title: string; description: string }) {
  return (
    <div className="flex items-start gap-3 pb-4 border-b border-slate-100 dark:border-white/5">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand/10 dark:bg-brand/20 flex-shrink-0 mt-0.5">
        <Icon className="h-4.5 w-4.5 text-brand" aria-hidden="true" />
      </div>
      <div>
        <p className="text-sm font-semibold text-slate-900 dark:text-white">{title}</p>
        <p className={DESC_CLASS}>{description}</p>
      </div>
    </div>
  );
}

function ToggleSwitch({ checked, onChange, label, id }: { checked: boolean; onChange: () => void; label: string; id: string }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      id={id}
      onClick={onChange}
      className={cn(
        "relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/60",
        checked ? "bg-brand" : "bg-slate-200 dark:bg-white/10"
      )}
      aria-label={label}
    >
      <span
        className={cn(
          "inline-block h-4 w-4 rounded-full bg-white shadow transition-transform duration-200",
          checked ? "translate-x-6" : "translate-x-1"
        )}
      />
    </button>
  );
}

function RadioGroup<T extends string>({
  options,
  value,
  onChange,
  name,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
  name: string;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          role="radio"
          aria-checked={value === opt.value}
          aria-label={`${name}: ${opt.label}`}
          className={cn(
            "px-3 py-1.5 rounded-lg text-xs font-medium border transition-all duration-150",
            value === opt.value
              ? "bg-brand text-white border-brand shadow-brand-glow"
              : "bg-slate-50 text-slate-600 border-slate-200 hover:border-brand/50 dark:bg-white/5 dark:text-slate-400 dark:border-white/10 dark:hover:border-brand/40"
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

export default function SettingsView() {
  const { darkMode, toggleDarkMode, settings, setSettings } = useAppStore();

  return (
    <div className="space-y-4 max-w-2xl mx-auto">
      {/* Page header */}
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">Settings</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Configure your dashboard preferences</p>
      </div>

      {/* ── Appearance ─────────────────────────────────────────── */}
      <section className={SECTION_CLASS} aria-labelledby="appearance-heading">
        <SectionHeader
          icon={darkMode ? Moon : Sun}
          title="Appearance"
          description="Customize how the dashboard looks"
        />

        <div className="flex items-center justify-between gap-4">
          <div>
            {/* Label shows where the toggle will take you, not the current state */}
            <label htmlFor="dark-toggle" className={LABEL_CLASS}>
              {darkMode ? "Switch to Light mode" : "Switch to Dark mode"}
            </label>
            <p className={DESC_CLASS}>
              Currently <span className="font-medium text-slate-700 dark:text-slate-300">{darkMode ? "Dark" : "Light"}</span> — tap to switch
            </p>
          </div>
          <ToggleSwitch
            checked={darkMode}
            onChange={toggleDarkMode}
            label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
            id="dark-toggle"
          />
        </div>
      </section>

      {/* ── Data Preferences ───────────────────────────────────── */}
      <section className={SECTION_CLASS} aria-labelledby="data-prefs-heading">
        <SectionHeader
          icon={Database}
          title="Data Preferences"
          description="Configure measurement units and data display"
        />

        <div className="space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className={LABEL_CLASS}>Unit System</p>
              <p className={DESC_CLASS}>Choose metric or imperial for weight/distance</p>
            </div>
            <RadioGroup
              name="Unit system"
              options={[
                { value: "metric" as const, label: "Metric" },
                { value: "imperial" as const, label: "Imperial" },
              ]}
              value={settings.units}
              onChange={(v) => setSettings({ units: v })}
            />
          </div>

          <div className="flex items-start justify-between gap-4">
            <div>
              <p className={LABEL_CLASS}>Volume Unit</p>
              <p className={DESC_CLASS}>Default unit for product volumes</p>
            </div>
            <RadioGroup
              name="Volume unit"
              options={[
                { value: "units" as const, label: "Units" },
                { value: "kg" as const, label: "kg" },
                { value: "tons" as const, label: "Tons" },
              ]}
              value={settings.volumeUnit}
              onChange={(v) => setSettings({ volumeUnit: v })}
            />
          </div>
        </div>
      </section>

      {/* ── Time & Analysis ────────────────────────────────────── */}
      <section className={SECTION_CLASS} aria-labelledby="time-heading">
        <SectionHeader
          icon={Clock}
          title="Time & Analysis Settings"
          description="Set defaults for date ranges and data granularity"
        />

        <div className="space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className={LABEL_CLASS}>Default Date Range</p>
              <p className={DESC_CLASS}>The time window applied when you open the dashboard</p>
            </div>
            <RadioGroup
              name="Default date range"
              options={[
                { value: "1y" as const, label: "1 Year" },
                { value: "2y" as const, label: "2 Years" },
                { value: "all" as const, label: "All time" },
              ]}
              value={settings.defaultDateRange}
              onChange={(v) => setSettings({ defaultDateRange: v })}
            />
          </div>

          <div className="flex items-start justify-between gap-4">
            <div>
              <p className={LABEL_CLASS}>Time Granularity</p>
              <p className={DESC_CLASS}>How chart data is grouped by default</p>
            </div>
            <RadioGroup
              name="Time granularity"
              options={[
                { value: "monthly" as const, label: "Monthly" },
                { value: "quarterly" as const, label: "Quarterly" },
                { value: "yearly" as const, label: "Yearly" },
              ]}
              value={settings.timeGranularity}
              onChange={(v) => setSettings({ timeGranularity: v })}
            />
          </div>
        </div>
      </section>

      {/* ── Filtering Defaults ─────────────────────────────────── */}
      <section className={SECTION_CLASS} aria-labelledby="filter-defaults-heading">
        <SectionHeader
          icon={Settings2}
          title="Filtering Defaults"
          description="These defaults pre-populate filter panels across all views"
        />

        <div className="space-y-4">
          <div>
            <p className={LABEL_CLASS}>Applied filters are saved automatically</p>
            <p className={DESC_CLASS}>
              Your active filter selections (regions, suppliers, products, statuses) are remembered
              per session. Use the "Reset filters" button in the filter panel to clear them at any time.
            </p>
          </div>

          <div className="rounded-xl border border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-white/[0.02] px-4 py-3">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="h-4 w-4 text-brand" aria-hidden="true" />
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Date range coverage</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Mock data spans from <span className="font-medium text-slate-700 dark:text-slate-300">January 2020</span> to <span className="font-medium text-slate-700 dark:text-slate-300">December 2026</span>.
              All date pickers are bounded to this range.
            </p>
          </div>

          <div className="rounded-xl border border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-white/[0.02] px-4 py-3">
            <div className="flex items-center gap-2 mb-2">
              <Package className="h-4 w-4 text-brand" aria-hidden="true" />
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Dataset summary</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              The dashboard includes <span className="font-medium text-slate-700 dark:text-slate-300">55 facilities</span>,{" "}
              <span className="font-medium text-slate-700 dark:text-slate-300">22 suppliers</span>,{" "}
              <span className="font-medium text-slate-700 dark:text-slate-300">120 products</span>, and{" "}
              <span className="font-medium text-slate-700 dark:text-slate-300">220 shipments</span> across all regions.
            </p>
          </div>

          <div className="rounded-xl border border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-white/[0.02] px-4 py-3">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="h-4 w-4 text-brand" aria-hidden="true" />
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Regions available</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              North America, Europe, Asia Pacific, Latin America, Middle East &amp; Africa — filterable on every view.
            </p>
          </div>
        </div>
      </section>

      {/* ── Design System ─────────────────────────────────────────── */}
      <section className={SECTION_CLASS} aria-labelledby="design-system-heading">
        <SectionHeader
          icon={Palette}
          title="Design System"
          description="Component library and style guide"
        />

        <a
          href="/design-system"
          className="flex items-center justify-between p-3 -mx-3 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 dark:bg-white/10 group-hover:bg-brand/10 transition-colors">
              <Palette className="h-4.5 w-4.5 text-slate-500 dark:text-slate-400 group-hover:text-brand transition-colors" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-900 dark:text-white">View Design System</p>
              <p className="text-xs text-slate-400 dark:text-slate-500">Colors, typography, components, and more</p>
            </div>
          </div>
          <span className="text-brand opacity-0 group-hover:opacity-100 transition-opacity">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </span>
        </a>
      </section>
    </div>
  );
}
