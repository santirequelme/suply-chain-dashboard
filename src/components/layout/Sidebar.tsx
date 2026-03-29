import { useState, useRef, useEffect } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Building2, Truck, Package, Ship, TrendingUp,
  Settings, User, LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { path: "/dashboard",  label: "Dashboard",  icon: LayoutDashboard },
  { path: "/suppliers",  label: "Suppliers",  icon: Truck },
  { path: "/facilities", label: "Facilities", icon: Building2 },
  { path: "/products",   label: "Products",   icon: Package },
  { path: "/shipments",  label: "Shipments",  icon: Ship },
];

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
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

  // Close menu when route changes
  useEffect(() => { setUserMenuOpen(false); }, [location.pathname]);

  function handleAccount() {
    setUserMenuOpen(false);
    navigate("/account");
  }

  function handleLogout() {
    setUserMenuOpen(false);
    // Placeholder — in a real app this would clear auth state / redirect
    alert("Logged out (demo)");
  }

  return (
    <aside
      className={cn(
        "hidden lg:flex flex-col w-64 flex-shrink-0 h-screen",
        "sidebar-glass"
      )}
      aria-label="Main navigation"
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-200 dark:border-white/10">
        <div className="logo-icon flex h-9 w-9 items-center justify-center rounded-xl bg-brand shadow-brand-glow">
          <TrendingUp className="h-5 w-5 text-white" aria-hidden="true" />
        </div>
        <div>
          <p className="font-heading text-base font-bold text-slate-900 dark:text-white leading-tight">Make2Flow</p>
          <p className="text-[10px] font-medium uppercase tracking-widest text-slate-400">Supply Chain</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4" aria-label="Sidebar navigation">
        <p className="px-3 mb-3 text-[10px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">Menu</p>
        <ul className="space-y-1" role="list">
          {NAV_ITEMS.map(({ path, label, icon: Icon }) => {
            const isActive = location.pathname === path;
            return (
              <li key={path}>
                <NavLink
                  to={path}
                  className={cn(
                    "nav-item flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium",
                    isActive
                      ? "nav-active"
                      : "text-slate-600 dark:text-slate-400 dark:hover:text-white"
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

        {/* Settings — desktop only entry point */}
        <div className="mt-4 pt-4 border-t border-slate-200 dark:border-white/10">
          <NavLink
            to="/settings"
            className={cn(
              "nav-item flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium",
              location.pathname === "/settings"
                ? "nav-active"
                : "text-slate-600 dark:text-slate-400 dark:hover:text-white"
            )}
            aria-current={location.pathname === "/settings" ? "page" : undefined}
          >
            <Settings className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
            Settings
          </NavLink>
        </div>
      </nav>

      {/* User footer */}
      <div className="px-4 py-4 border-t border-slate-200 dark:border-white/10" ref={menuRef}>
        <div className="relative">
          <button
            onClick={() => setUserMenuOpen((o) => !o)}
            className={cn(
              "w-full flex items-center gap-3 rounded-xl p-1.5 transition-all duration-150",
              userMenuOpen ? "bg-slate-100 dark:bg-white/10" : "hover:bg-slate-100 dark:hover:bg-white/5"
            )}
            aria-label="Open user menu"
            aria-expanded={userMenuOpen}
            aria-haspopup="menu"
          >
            <div className="h-8 w-8 rounded-full bg-brand/10 border border-brand/30 dark:bg-brand/30 dark:border-brand/50 flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-bold text-brand">SR</span>
            </div>
            <div className="min-w-0 flex-1 text-left">
              <p className="text-sm font-medium text-slate-900 dark:text-white truncate">Santi Reke</p>
              <p className="text-xs text-slate-400 dark:text-slate-500 truncate">Admin</p>
            </div>
          </button>

          {userMenuOpen && (
            <div
              className="absolute left-0 right-0 bottom-full mb-2 z-50 rounded-2xl overflow-hidden shadow-lg bg-white border border-slate-200 dark:bg-navy-800 dark:border-white/10"
              role="menu"
              aria-label="User menu"
            >
              {/* User info header */}
              <div className="px-4 py-3 border-b border-slate-100 dark:border-white/5">
                <p className="text-sm font-semibold text-slate-900 dark:text-white">Santi Reke</p>
                <p className="text-xs text-slate-400">santireke37@gmail.com</p>
              </div>

              <ul className="py-1.5" role="none">
                <li role="none">
                  <button
                    role="menuitem"
                    onClick={handleAccount}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors group hover:bg-slate-50 dark:hover:bg-white/5"
                  >
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg flex-shrink-0 bg-slate-100 group-hover:bg-brand/10 dark:bg-white/5 dark:group-hover:bg-brand/20 transition-colors">
                      <User className="h-3.5 w-3.5 text-slate-400 group-hover:text-brand transition-colors" aria-hidden="true" />
                    </span>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">Account</p>
                  </button>
                </li>
                <li role="none">
                  <button
                    role="menuitem"
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors group hover:bg-danger/5"
                  >
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg flex-shrink-0 bg-slate-100 group-hover:bg-danger/10 dark:bg-white/5 dark:group-hover:bg-danger/20 transition-colors">
                      <LogOut className="h-3.5 w-3.5 text-slate-400 group-hover:text-danger transition-colors" aria-hidden="true" />
                    </span>
                    <p className="text-sm font-medium text-slate-700 group-hover:text-danger dark:text-slate-300 transition-colors">Logout</p>
                  </button>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
