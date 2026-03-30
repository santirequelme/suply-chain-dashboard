import { useAppStore } from "@/store/useAppStore";
import { cn } from "@/lib/utils";
import {
  Palette,
  Type,
  Box,
  Layers,
  MousePointer,
  Search,
  Filter,
  ChevronDown,
  Bell,
  Sun,
  Moon,
  User,
  Grid3X3,
  CheckCircle,
  AlertCircle,
  Clock,
  TrendingUp,
  Package,
  Truck,
  Factory,
  Store
} from "lucide-react";

const SECTION_CLASS = "card p-6 space-y-6";
const SECTION_TITLE = "text-lg font-heading font-semibold text-slate-900 dark:text-white";
const SECTION_DESC = "text-sm text-slate-500 dark:text-slate-400";

const COLORS = {
  brand: ["#EDE8FF", "#D4C8FF", "#A991FF", "#7E5AFF", "#5C34FF", "#4318FF", "#3511CC", "#270D99", "#1A0866", "#0D0433"],
  navy: ["#060B28", "#0F1535", "#141727", "#1A1F37", "#2D3748"],
  status: [
    { name: "Brand", value: "#4318FF" },
    { name: "Brand Light", value: "#868CFF" },
    { name: "Success", value: "#01B574" },
    { name: "Warning", value: "#FFB547" },
    { name: "Danger", value: "#E53E3E" },
    { name: "Slate 400", value: "#94A3B8" },
    { name: "Slate 500", value: "#64748B" },
  ],
};

const FONTS = [
  { name: "Inter", role: "Body / UI", usage: "text-slate-900 dark:text-white" },
  { name: "Space Grotesk", role: "Headings", usage: "font-heading" },
];

const SHADOWS = [
  { name: "card", class: "shadow-card", desc: "Default card shadow" },
  { name: "brand-glow", class: "shadow-brand-glow", desc: "Brand colored glow" },
  { name: "neu-light", class: "shadow-neu-light", desc: "Neumorphism light" },
  { name: "neu-dark", class: "shadow-neu-dark", desc: "Neumorphism dark" },
  { name: "glass", class: "shadow-glass", desc: "Glass effect shadow" },
  { name: "kpi-brand", class: "shadow-kpi-brand", desc: "KPI card brand" },
  { name: "kpi-success", class: "shadow-kpi-success", desc: "KPI card success" },
];

const BADGE_VARIANTS = [
  { label: "Delivered", class: "bg-success/20 text-success border-success/30" },
  { label: "Pending", class: "bg-slate-400/20 text-slate-400 border-slate-400/30" },
  { label: "In Transit", class: "bg-brand/20 text-brand border-brand/30" },
  { label: "Delayed", class: "bg-danger/20 text-danger border-danger/30" },
  { label: "Processing", class: "bg-warning/20 text-warning border-warning/30" },
];

const BUTTON_VARIANTS = [
  { label: "Primary", class: "btn-primary" },
  { label: "Ghost", class: "btn-ghost" },
];

const INPUT_SIZES = [
  { label: "Small", class: "input py-1.5 px-3 text-xs" },
  { label: "Medium", class: "input py-2 px-4 text-sm" },
  { label: "Large", class: "input py-3 px-4 text-base" },
];

function ColorSwatch({ color, name, dark }: { color: string; name: string; dark?: boolean }) {
  return (
    <div className="flex flex-col gap-1.5">
      <div
        className={cn(
          "h-16 w-full rounded-xl border shadow-inner flex items-end justify-end p-2",
          dark ? "border-white/10" : "border-slate-200"
        )}
        style={{ backgroundColor: color }}
      >
        <span className={cn("text-xs font-mono", parseInt(color.replace("#", ""), 16) > 0x888888 ? "text-slate-900" : "text-white")}>
          {color}
        </span>
      </div>
      <p className="text-xs font-medium text-slate-600 dark:text-slate-400">{name}</p>
    </div>
  );
}

function ColorPalette() {
  const darkMode = useAppStore((s) => s.darkMode);
  
  return (
    <div className={SECTION_CLASS}>
      <div className="space-y-1">
        <h3 className={SECTION_TITLE}>Color Palette</h3>
        <p className={SECTION_DESC}>Core brand colors and semantic tokens</p>
      </div>
      
      <div className="space-y-6">
        <div>
          <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Brand Colors</h4>
          <div className="grid grid-cols-5 gap-3">
            {COLORS.brand.map((color, i) => (
              <ColorSwatch key={color} color={color} name={`brand-${i * 100 + 50}`} />
            ))}
          </div>
        </div>
        
        <div>
          <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Navy Scale</h4>
          <div className="grid grid-cols-5 gap-3">
            {COLORS.navy.map((color, i) => (
              <ColorSwatch key={color} color={color} name={`navy-${950 - i * 50}`} />
            ))}
          </div>
        </div>
        
        <div>
          <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Semantic Colors</h4>
          <div className="grid grid-cols-4 gap-3">
            {COLORS.status.map((s) => (
              <ColorSwatch key={s.value} color={s.value} name={s.name} />
            ))}
          </div>
        </div>
        
        <div className={cn("p-4 rounded-xl border", darkMode ? "bg-navy-900/50 border-white/10" : "bg-slate-50 border-slate-200")}>
          <p className="text-xs text-slate-500 mb-2">Current Background</p>
          <div className="flex gap-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-[#F8FAFC] border border-slate-200" />
              <span className="text-xs text-slate-600">Light: #F8FAFC</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-[#0F1535] border border-white/10" />
              <span className="text-xs text-slate-400">Dark: #0F1535</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function TypographySection() {
  return (
    <div className={SECTION_CLASS}>
      <div className="space-y-1">
        <h3 className={SECTION_TITLE}>Typography</h3>
        <p className={SECTION_DESC}>Font families and type scale</p>
      </div>
      
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          {FONTS.map((font) => (
            <div key={font.name} className="p-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10">
              <p className="text-2xl mb-2" style={{ fontFamily: font.name }}>Aa</p>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">{font.name}</p>
              <p className="text-xs text-slate-500">{font.role}</p>
              <code className="text-xs text-brand bg-brand/10 px-1.5 py-0.5 rounded mt-1 inline-block">{font.usage}</code>
            </div>
          ))}
        </div>
        
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Type Scale</h4>
          {[
            { size: "text-4xl", label: "4xl (2.25rem)", weight: "font-heading font-bold" },
            { size: "text-3xl", label: "3xl (1.875rem)", weight: "font-heading font-bold" },
            { size: "text-2xl", label: "2xl (1.5rem)", weight: "font-heading font-semibold" },
            { size: "text-xl", label: "xl (1.25rem)", weight: "font-heading font-semibold" },
            { size: "text-lg", label: "lg (1.125rem)", weight: "font-medium" },
            { size: "text-base", label: "base (1rem)", weight: "font-normal" },
            { size: "text-sm", label: "sm (0.875rem)", weight: "font-normal" },
            { size: "text-xs", label: "xs (0.75rem)", weight: "font-normal" },
          ].map((type) => (
            <div key={type.label} className="flex items-center gap-4">
              <span className="text-xs text-slate-400 w-28">{type.label}</span>
              <span className={cn("text-slate-900 dark:text-white", type.size, type.weight)}>
                The quick brown fox jumps over the lazy dog
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ComponentsSection() {
  return (
    <div className={SECTION_CLASS}>
      <div className="space-y-1">
        <h3 className={SECTION_TITLE}>Components</h3>
        <p className={SECTION_DESC}>Reusable UI components</p>
      </div>
      
      <div className="space-y-8">
        <div>
          <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">Buttons</h4>
          <div className="flex flex-wrap gap-3">
            {BUTTON_VARIANTS.map((btn) => (
              <button key={btn.label} className={cn(btn.class)}>
                <MousePointer className="w-4 h-4" />
                {btn.label}
              </button>
            ))}
            <button className="btn-primary">
              <TrendingUp className="w-4 h-4" />
              With Icon
            </button>
            <button className="btn-primary opacity-50 cursor-not-allowed">
              <User className="w-4 h-4" />
              Disabled
            </button>
          </div>
          
          <div className="flex flex-wrap gap-3 mt-4">
            <button className="btn-ghost">
              <Sun className="w-4 h-4" />
              Light
            </button>
            <button className="btn-ghost">
              <Moon className="w-4 h-4" />
              Dark
            </button>
          </div>
        </div>
        
        <div>
          <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">Badges</h4>
          <div className="flex flex-wrap gap-2">
            {BADGE_VARIANTS.map((badge) => (
              <span key={badge.label} className={cn("badge border", badge.class)}>
                {badge.label}
              </span>
            ))}
          </div>
        </div>
        
        <div>
          <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">Inputs</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input type="text" placeholder="Search..." className="input pl-10" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Select</label>
              <div className="relative">
                <select className="select w-full appearance-none pr-10">
                  <option>Select option</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Disabled</label>
              <input type="text" placeholder="Disabled" className="input opacity-50 cursor-not-allowed" disabled />
            </div>
          </div>
          
          <div className="flex gap-3 mt-4">
            {INPUT_SIZES.map((input) => (
              <div key={input.label} className="space-y-2">
                <label className="text-xs font-medium text-slate-600 dark:text-slate-400">{input.label}</label>
                <input type="text" placeholder="Input" className={input.class} />
              </div>
            ))}
          </div>
        </div>
        
        <div>
          <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">Icon Buttons</h4>
          <div className="flex flex-wrap gap-3">
            <button className="p-2.5 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-brand/10 hover:text-brand transition-colors">
              <Bell className="w-5 h-5" />
            </button>
            <button className="p-2.5 rounded-xl bg-brand text-white hover:bg-brand/90 transition-colors">
              <Sun className="w-5 h-5" />
            </button>
            <button className="p-2.5 rounded-xl bg-white dark:bg-white/10 border border-slate-200 dark:border-white/10 shadow-sm hover:shadow-md transition-shadow">
              <Moon className="w-5 h-5" />
            </button>
            <button className="p-2.5 rounded-full bg-success/10 text-success">
              <CheckCircle className="w-5 h-5" />
            </button>
            <button className="p-2.5 rounded-full bg-danger/10 text-danger">
              <AlertCircle className="w-5 h-5" />
            </button>
            <button className="p-2.5 rounded-full bg-warning/10 text-warning">
              <Clock className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function CardsSection() {
  const darkMode = useAppStore((s) => s.darkMode);
  
  return (
    <div className={SECTION_CLASS}>
      <div className="space-y-1">
        <h3 className={SECTION_TITLE}>Cards</h3>
        <p className={SECTION_DESC}>Card variants with glassmorphism and neumorphism effects</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="card p-5 space-y-3">
          <h4 className="font-semibold text-slate-900 dark:text-white">Glass Card</h4>
          <p className="text-sm text-slate-500">Default card with glassmorphism effect and subtle shadow.</p>
          <code className="text-xs bg-slate-100 dark:bg-white/10 px-2 py-1 rounded">.card</code>
        </div>
        
        <div className="kpi-card card p-5 space-y-3" data-color="brand">
          <h4 className="font-semibold text-slate-900 dark:text-white">KPI Card</h4>
          <p className="text-sm text-slate-500">Interactive card with glow effect on hover.</p>
          <code className="text-xs bg-slate-100 dark:bg-white/10 px-2 py-1 rounded">.kpi-card</code>
        </div>
        
        <div className="chart-card card p-5 space-y-3">
          <h4 className="font-semibold text-slate-900 dark:text-white">Chart Card</h4>
          <p className="text-sm text-slate-500">Card with shimmer animation on hover.</p>
          <code className="text-xs bg-slate-100 dark:bg-white/10 px-2 py-1 rounded">.chart-card</code>
        </div>
      </div>
      
      <div className="mt-6">
        <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">Glassmorphism Preview</h4>
        <div className={cn(
          "p-6 rounded-2xl border transition-all",
          darkMode 
            ? "bg-navy-900/60 backdrop-blur-xl border-white/10" 
            : "bg-white/80 backdrop-blur-xl border-white/60"
        )}>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-brand/20">
              <Layers className="w-5 h-5 text-brand" />
            </div>
            <div>
              <p className="font-semibold text-slate-900 dark:text-white">Glassmorphism Effect</p>
              <p className="text-sm text-slate-500">backdrop-blur with semi-transparent background</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function EffectsSection() {
  const darkMode = useAppStore((s) => s.darkMode);
  
  return (
    <div className={SECTION_CLASS}>
      <div className="space-y-1">
        <h3 className={SECTION_TITLE}>Effects & Shadows</h3>
        <p className={SECTION_DESC}>Visual effects and shadow tokens</p>
      </div>
      
      <div className="space-y-6">
        <div>
          <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">Shadow Tokens</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {SHADOWS.map((shadow) => (
              <div key={shadow.name} className="space-y-2">
                <div className={cn("h-20 rounded-xl bg-slate-100 dark:bg-white/5", shadow.class)} />
                <p className="text-xs font-medium text-slate-700 dark:text-slate-300">{shadow.name}</p>
                <p className="text-xs text-slate-400">{shadow.desc}</p>
              </div>
            ))}
          </div>
        </div>
        
        <div>
          <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">Gradients</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="h-20 rounded-xl bg-sidebar-gradient flex items-center justify-center">
              <span className="text-xs font-medium text-white">sidebar-gradient</span>
            </div>
            <div className="h-20 rounded-xl bg-brand-gradient flex items-center justify-center">
              <span className="text-xs font-medium text-white">brand-gradient</span>
            </div>
            <div 
              className="h-20 rounded-xl flex items-center justify-center"
              style={{ background: 'radial-gradient(circle at 75% 15%, rgba(67, 24, 255, 0.2) 0%, transparent 70%)' }}
            >
              <span className="text-xs font-medium text-slate-700 dark:text-white">kpi-glow</span>
            </div>
          </div>
        </div>
        
        <div>
          <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">CSS Variables</h4>
          <div className={cn(
            "p-4 rounded-xl font-mono text-xs space-y-2 overflow-x-auto",
            darkMode ? "bg-navy-950 text-slate-300" : "bg-slate-900 text-slate-300"
          )}>
            <p><span className="text-brand">:root</span> {'{'}</p>
            <p className="pl-4">--glass-bg: rgba(255, 255, 255, 0.82);</p>
            <p className="pl-4">--glass-border: rgba(255, 255, 255, 0.60);</p>
            <p className="pl-4">--glass-blur: blur(20px) saturate(160%);</p>
            <p className="pl-4">--neu-shadow: 5px 8px 20px rgba(148, 163, 184, 0.38)...;</p>
            <p className="pl-4">--brand: #4318FF;</p>
            <p className="pl-4">--success: #01B574;</p>
            <p>{'}'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function IconsSection() {
  const ICON_CATEGORIES = [
    { name: "Navigation", icons: [Grid3X3, Package, Truck, Factory, Store] },
    { name: "Status", icons: [CheckCircle, AlertCircle, Clock, Bell] },
    { name: "Actions", icons: [Search, Filter, Sun, Moon, User] },
  ];
  
  return (
    <div className={SECTION_CLASS}>
      <div className="space-y-1">
        <h3 className={SECTION_TITLE}>Icons</h3>
        <p className={SECTION_DESC}>Lucide React icon library</p>
      </div>
      
      <div className="space-y-6">
        {ICON_CATEGORIES.map((category) => (
          <div key={category.name}>
            <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">{category.name}</h4>
            <div className="flex flex-wrap gap-2">
              {category.icons.map((Icon) => (
                <div 
                  key={Icon.name}
                  className="flex flex-col items-center gap-2 p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10"
                >
                  <Icon className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                  <span className="text-xs text-slate-400">{Icon.name}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SpacingSection() {
  const SPACING = [
    { name: "space-1", value: "0.25rem (4px)" },
    { name: "space-2", value: "0.5rem (8px)" },
    { name: "space-3", value: "0.75rem (12px)" },
    { name: "space-4", value: "1rem (16px)" },
    { name: "space-5", value: "1.25rem (20px)" },
    { name: "space-6", value: "1.5rem (24px)" },
    { name: "space-8", value: "2rem (32px)" },
    { name: "space-10", value: "2.5rem (40px)" },
    { name: "space-12", value: "3rem (48px)" },
  ];
  
  return (
    <div className={SECTION_CLASS}>
      <div className="space-y-1">
        <h3 className={SECTION_TITLE}>Spacing</h3>
        <p className={SECTION_DESC}>Spacing scale and layout tokens</p>
      </div>
      
      <div className="space-y-4">
        <div className="flex flex-wrap gap-4">
          {SPACING.map((s) => (
            <div key={s.name} className="flex flex-col items-center gap-2">
              <div 
                className="bg-brand rounded"
                style={{ width: "1.5rem", height: s.name === "space-1" ? "0.25rem" : "1.5rem" }}
              />
              <div className={cn("flex", s.name.includes("1") ? "flex-row gap-1" : "flex-col items-center")}>
                <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{s.name}</span>
                <span className="text-xs text-slate-400">{s.value}</span>
              </div>
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/5">
            <p className="text-xs text-slate-400 mb-1">Border Radius</p>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded bg-brand" />
                <span className="text-xs">rounded-lg (8px)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-brand" />
                <span className="text-xs">rounded-xl (12px)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-2xl bg-brand" />
                <span className="text-xs">rounded-2xl (16px)</span>
              </div>
            </div>
          </div>
          
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/5">
            <p className="text-xs text-slate-400 mb-1">Touch Targets</p>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 flex items-center justify-center rounded bg-brand text-white text-xs">44</div>
                <span className="text-xs">min touch</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 flex items-center justify-center rounded bg-brand text-white text-xs">48</div>
                <span className="text-xs">comfortable</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function QuickReferenceSection() {
  return (
    <div className={SECTION_CLASS}>
      <div className="space-y-1">
        <h3 className={SECTION_TITLE}>Quick Reference</h3>
        <p className={SECTION_DESC}>Common utility patterns</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Tailwind Utilities</h4>
          <div className={cn("p-3 rounded-lg text-xs font-mono space-y-1", "bg-slate-900 text-slate-300")}>
            <p>bg-brand / bg-success</p>
            <p>text-brand / text-success</p>
            <p>border-brand / rounded-xl</p>
            <p>shadow-brand-glow</p>
            <p>font-heading / font-sans</p>
          </div>
        </div>
        
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300">CSS Classes</h4>
          <div className={cn("p-3 rounded-lg text-xs font-mono space-y-1", "bg-slate-900 text-slate-300")}>
            <p>.card</p>
            <p>.kpi-card</p>
            <p>.chart-card</p>
            <p>.btn-primary</p>
            <p>.btn-ghost</p>
            <p>.input / .select</p>
            <p>.badge / .th / .td</p>
          </div>
        </div>
        
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Color Scheme</h4>
          <div className={cn("p-3 rounded-lg text-xs font-mono space-y-1", "bg-slate-900 text-slate-300")}>
            <p>.dark class on html</p>
            <p>dark: variant prefix</p>
            <p>darkMode: class (config)</p>
          </div>
        </div>
        
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Responsive</h4>
          <div className={cn("p-3 rounded-lg text-xs font-mono space-y-1", "bg-slate-900 text-slate-300")}>
            <p>mobile: default</p>
            <p>md: 768px+</p>
            <p>lg: 1024px+</p>
            <p>xl: 1280px+</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DesignSystem() {
  const darkMode = useAppStore((s) => s.darkMode);
  
  const SECTIONS = [
    { id: "colors", icon: Palette, label: "Colors" },
    { id: "typography", icon: Type, label: "Typography" },
    { id: "components", icon: Box, label: "Components" },
    { id: "cards", icon: Layers, label: "Cards" },
    { id: "effects", icon: Sun, label: "Effects" },
    { id: "icons", icon: Grid3X3, label: "Icons" },
    { id: "spacing", icon: Box, label: "Spacing" },
    { id: "reference", icon: Type, label: "Reference" },
  ];

  return (
    <div className="min-h-screen pb-20 md:pb-0">
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-heading font-bold text-slate-900 dark:text-white">
              Design System
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Make2Flow component library and style guide
            </p>
          </div>
          <div className={cn(
            "px-3 py-1.5 rounded-lg text-xs font-medium",
            darkMode ? "bg-navy-800 text-brand" : "bg-brand/10 text-brand"
          )}>
            {darkMode ? "Dark Mode" : "Light Mode"}
          </div>
        </div>

        <nav className="flex flex-wrap gap-2 pb-4 border-b border-slate-200 dark:border-white/10">
          {SECTIONS.map((section) => (
            <a
              key={section.id}
              href={`#${section.id}`}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
                "text-slate-600 dark:text-slate-400 hover:text-brand hover:bg-brand/10"
              )}
            >
              <section.icon className="w-4 h-4" />
              {section.label}
            </a>
          ))}
        </nav>

        <div className="space-y-6">
          <div id="colors">
            <ColorPalette />
          </div>
          
          <div id="typography">
            <TypographySection />
          </div>
          
          <div id="components">
            <ComponentsSection />
          </div>
          
          <div id="cards">
            <CardsSection />
          </div>
          
          <div id="effects">
            <EffectsSection />
          </div>
          
          <div id="icons">
            <IconsSection />
          </div>
          
          <div id="spacing">
            <SpacingSection />
          </div>
          
          <div id="reference">
            <QuickReferenceSection />
          </div>
        </div>
      </div>
    </div>
  );
}
