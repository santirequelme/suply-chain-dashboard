import { useState, useRef, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Building2,
  Truck,
  Package,
  Ship,
  TrendingUp,
  User,
  Settings,
  Sliders,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { path: "/facilities", label: "Facilities", icon: Building2 },
  { path: "/suppliers", label: "Suppliers", icon: Truck },
  { path: "/products", label: "Products", icon: Package },
  { path: "/shipments", label: "Shipments", icon: Ship },
];

const USER_MENU_ITEMS = [
  { label: "Edit Profile", icon: User, description: "Update your personal info" },
  { label: "Account Settings", icon: Settings, description: "Manage your account" },
  { label: "Preferences", icon: Sliders, description: "Customize your experience" },
];

export default function Sidebar() {
  const location = useLocation();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

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
      if (e.key === "Escape") setUserMenuOpen(false);
    }
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, []);

  return (
    <aside
      className={cn(
        "hidden lg:flex flex-col w-64 flex-shrink-0 h-screen",
        // Light: white bg, subtle border
        "bg-white border-r border-slate-200",
        // Dark: gradient bg
        "dark:bg-sidebar-gradient dark:border-white/10"
      )}
      aria-label="Main navigation"
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-200 dark:border-white/10">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand shadow-brand-glow">
          <TrendingUp className="h-5 w-5 text-white" aria-hidden="true" />
        </div>
        <div>
          <p className="font-heading text-base font-bold text-slate-900 dark:text-white leading-tight">
            Make2Flow
          </p>
          <p className="text-[10px] font-medium uppercase tracking-widest text-slate-400 dark:text-slate-400">
            Supply Chain
          </p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4" aria-label="Sidebar navigation">
        <p className="px-3 mb-3 text-[10px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">
          Menu
        </p>
        <ul className="space-y-1" role="list">
          {NAV_ITEMS.map(({ path, label, icon: Icon }) => {
            const isActive = location.pathname === path;
            return (
              <li key={path}>
                <NavLink
                  to={path}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150",
                    isActive
                      ? "bg-brand text-white shadow-brand-glow"
                      : [
                          "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
                          "dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-white",
                        ]
                  )}
                  aria-current={isActive ? "page" : undefined}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
                  {label}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User footer */}
      <div className="px-6 py-5 border-t border-slate-200 dark:border-white/10" ref={menuRef}>
        <div className="relative">
          <button
            onClick={() => setUserMenuOpen((o) => !o)}
            className={cn(
              "w-full flex items-center gap-3 rounded-xl p-1.5 transition-all duration-150",
              userMenuOpen
                ? "bg-slate-100 dark:bg-white/10"
                : "hover:bg-slate-100 dark:hover:bg-white/5"
            )}
            aria-label="Open user menu"
            aria-expanded={userMenuOpen}
            aria-haspopup="menu"
          >
            <div className="h-8 w-8 rounded-full bg-brand/10 border border-brand/30 dark:bg-brand/30 dark:border-brand/50 flex items-center justify-center">
              <span className="text-xs font-bold text-brand">SR</span>
            </div>
            <div className="min-w-0 flex-1 text-left">
              <p className="text-sm font-medium text-slate-900 dark:text-white truncate">Santi Reke</p>
              <p className="text-xs text-slate-400 dark:text-slate-500 truncate">Admin</p>
            </div>
          </button>

          {userMenuOpen && (
            <div
              className={cn(
                "absolute left-0 right-0 bottom-full mb-2 z-50",
                "rounded-2xl overflow-hidden shadow-lg",
                "bg-white border border-slate-200",
                "dark:bg-navy-800 dark:border-white/10"
              )}
              role="menu"
              aria-label="User menu"
            >
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
      </div>
    </aside>
  );
}
