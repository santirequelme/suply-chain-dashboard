import { useState, useRef, useEffect } from "react";
import { Search, Sun, Moon, Bell, User, Settings, Sliders, X } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

const PAGE_TITLES: Record<string, { title: string; subtitle: string }> = {
  "/dashboard": { title: "Dashboard", subtitle: "Supply chain overview" },
  "/facilities": { title: "Facilities", subtitle: "Manage your facility network" },
  "/suppliers": { title: "Suppliers", subtitle: "Supplier performance & contacts" },
  "/products": { title: "Products", subtitle: "Catalog & inventory status" },
  "/shipments": { title: "Shipments", subtitle: "Track all shipment activity" },
};

const USER_MENU_ITEMS = [
  { label: "Edit Profile", icon: User, description: "Update your personal info" },
  { label: "Account Settings", icon: Settings, description: "Manage your account" },
  { label: "Preferences", icon: Sliders, description: "Customize your experience" },
];

export default function Topbar() {
  const { toggleDarkMode, darkMode, globalSearch, setGlobalSearch } = useAppStore();
  const location = useLocation();
  const page = PAGE_TITLES[location.pathname] ?? PAGE_TITLES["/dashboard"];

  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);
  const mobileSearchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (mobileSearchOpen) setTimeout(() => mobileSearchRef.current?.focus(), 50);
  }, [mobileSearchOpen]);

  useEffect(() => {
    setMobileSearchOpen(false);
    setUserMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node))
        setUserMenuOpen(false);
    }
    if (userMenuOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [userMenuOpen]);

  useEffect(() => {
    function handleEsc(e: KeyboardEvent) {
      if (e.key === "Escape") { setUserMenuOpen(false); setMobileSearchOpen(false); }
    }
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, []);

  function closeMobileSearch() {
    setMobileSearchOpen(false);
    setGlobalSearch("");
  }

  return (
    <header className={cn(
      "sticky top-0 z-10 flex h-16 items-center gap-3 px-4 md:px-6",
      "border-b backdrop-blur-md",
      "bg-white/80 border-slate-200",
      "dark:bg-navy-900/80 dark:border-white/10"
    )}>

      {/* ── Mobile: SR avatar + dropdown ─────────────────────── */}
      <div
        className={cn("relative flex-shrink-0 lg:hidden", mobileSearchOpen ? "hidden" : "flex")}
        ref={menuRef}
      >
        <button
          onClick={() => setUserMenuOpen((o) => !o)}
          className={cn(
            "h-9 w-9 rounded-full border-2 flex items-center justify-center transition-all duration-150",
            userMenuOpen
              ? "border-brand bg-brand/20"
              : "border-brand/40 bg-brand/10 hover:border-brand hover:bg-brand/20"
          )}
          aria-label="Open user menu"
          aria-expanded={userMenuOpen}
          aria-haspopup="menu"
        >
          <span className="text-xs font-bold text-brand">SR</span>
        </button>

        {userMenuOpen && (
          <div
            className={cn(
              "absolute left-0 top-full mt-2 w-56 z-50",
              "rounded-2xl overflow-hidden shadow-lg",
              "bg-white border border-slate-200",
              "dark:bg-navy-800 dark:border-white/10"
            )}
            role="menu"
            aria-label="User menu"
          >
            <div className={cn(
              "px-4 py-3 flex items-center gap-3",
              "border-b border-slate-100 dark:border-white/10"
            )}>
              <div className="h-9 w-9 rounded-full bg-brand/10 border border-brand/30 dark:bg-brand/20 dark:border-brand/50 flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-bold text-brand">SR</span>
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">Santi Reke</p>
                <p className="text-xs text-slate-400 dark:text-slate-500 truncate">Admin</p>
              </div>
            </div>

            <ul className="py-1.5" role="none">
              {USER_MENU_ITEMS.map(({ label, icon: Icon, description }) => (
                <li key={label} role="none">
                  <button
                    role="menuitem"
                    onClick={() => setUserMenuOpen(false)}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors group",
                      "hover:bg-slate-50 dark:hover:bg-white/5"
                    )}
                  >
                    <span className={cn(
                      "flex h-7 w-7 items-center justify-center rounded-lg flex-shrink-0 transition-colors",
                      "bg-slate-100 group-hover:bg-brand/10",
                      "dark:bg-white/5 dark:group-hover:bg-brand/20"
                    )}>
                      <Icon className="h-3.5 w-3.5 text-slate-400 group-hover:text-brand transition-colors" aria-hidden="true" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-900 dark:text-white">{label}</p>
                      <p className="text-xs text-slate-400 dark:text-slate-500 truncate">{description}</p>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* ── Mobile search input ────────────────────────────── */}
      {mobileSearchOpen && (
        <div className="flex flex-1 items-center gap-2 md:hidden">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" aria-hidden="true" />
            <input
              ref={mobileSearchRef}
              type="search"
              placeholder="Search..."
              value={globalSearch}
              onChange={(e) => setGlobalSearch(e.target.value)}
              className="input pl-9 h-9 text-sm w-full"
              aria-label="Search"
            />
          </div>
          <button
            onClick={closeMobileSearch}
            className={cn(
              "flex-shrink-0 h-9 w-9 flex items-center justify-center rounded-xl transition-colors",
              "text-slate-400 hover:text-slate-700 hover:bg-slate-100",
              "dark:hover:text-white dark:hover:bg-white/10"
            )}
            aria-label="Close search"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
      )}

      {/* ── Page title ────────────────────────────────────── */}
      {!mobileSearchOpen && (
        <div className="flex-1 lg:flex-none min-w-0">
          <h1
            className="font-heading font-bold leading-tight truncate text-base lg:text-lg text-slate-900 dark:text-white"
            aria-live="polite"
          >
            {page.title}
          </h1>
          <p className="hidden lg:block text-xs text-slate-400 dark:text-slate-500">{page.subtitle}</p>
        </div>
      )}

      {/* ── Desktop search ────────────────────────────────── */}
      <div className="relative hidden md:flex flex-1 max-w-sm ml-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" aria-hidden="true" />
        <input
          type="search"
          placeholder="Search..."
          value={globalSearch}
          onChange={(e) => setGlobalSearch(e.target.value)}
          className="input pl-9 h-9 text-sm w-full"
          aria-label="Global search"
        />
      </div>

      {/* ── Actions ───────────────────────────────────────── */}
      {!mobileSearchOpen && (
        <div className="flex-shrink-0 flex items-center gap-1 lg:ml-auto">
          <button
            className={cn(
              "md:hidden p-2 rounded-xl transition-colors",
              "text-slate-500 hover:text-slate-900 hover:bg-slate-100",
              "dark:text-slate-400 dark:hover:text-white dark:hover:bg-white/10"
            )}
            aria-label="Open search"
            onClick={() => setMobileSearchOpen(true)}
          >
            <Search className="h-5 w-5" aria-hidden="true" />
          </button>

          <button
            className={cn(
              "relative p-2 rounded-xl transition-colors",
              "text-slate-500 hover:text-slate-900 hover:bg-slate-100",
              "dark:text-slate-400 dark:hover:text-white dark:hover:bg-white/10"
            )}
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" aria-hidden="true" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-brand" aria-hidden="true" />
          </button>

          <button
            onClick={toggleDarkMode}
            className={cn(
              "p-2 rounded-xl transition-colors",
              "text-slate-500 hover:text-slate-900 hover:bg-slate-100",
              "dark:text-slate-400 dark:hover:text-white dark:hover:bg-white/10"
            )}
            aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
          >
            {darkMode ? <Sun className="h-5 w-5" aria-hidden="true" /> : <Moon className="h-5 w-5" aria-hidden="true" />}
          </button>
        </div>
      )}
    </header>
  );
}
