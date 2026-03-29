import {
  useState,
  useRef,
  useEffect,
  useLayoutEffect,
  useCallback,
} from "react";
import { createPortal } from "react-dom";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Building2,
  Truck,
  Package,
  Ship,
  TrendingUp,
  Settings,
  User,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/useAppStore";

const NAV_ITEMS = [
  { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { path: "/suppliers", label: "Suppliers", icon: Truck },
  { path: "/facilities", label: "Facilities", icon: Building2 },
  { path: "/products", label: "Products", icon: Package },
  { path: "/shipments", label: "Shipments", icon: Ship },
];

/** Width + easing: smooth, friendly micro-interaction */
const SIDEBAR_TRANSITION_MS = 320;
const SIDEBAR_EASE = "cubic-bezier(0.4, 0, 0.2, 1)";

function NavTooltipPortal({
  label,
  show,
  anchorRef,
}: {
  label: string;
  show: boolean;
  anchorRef: React.RefObject<HTMLElement | null>;
}) {
  const [pos, setPos] = useState({ top: 0, left: 0 });

  const update = useCallback(() => {
    const el = anchorRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setPos({ top: r.top + r.height / 2, left: r.right + 12 });
  }, [anchorRef]);

  useLayoutEffect(() => {
    if (!show) return;
    update();
  }, [show, update]);

  useEffect(() => {
    if (!show) return;
    window.addEventListener("scroll", update, true);
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update, true);
      window.removeEventListener("resize", update);
    };
  }, [show, update]);

  if (!show || typeof document === "undefined") return null;

  return createPortal(
    <div
      role="tooltip"
      className={cn(
        "pointer-events-none fixed z-[100] -translate-y-1/2 rounded-lg border px-2.5 py-1.5",
        "border-white/10 bg-slate-900/95 text-xs font-medium text-white shadow-lg backdrop-blur-sm",
        "dark:border-white/10 dark:bg-navy-900/95",
        "origin-left scale-100 opacity-100 transition-[opacity,transform] duration-200 ease-out",
        "motion-reduce:transition-none"
      )}
      style={{ top: pos.top, left: pos.left }}
    >
      {label}
    </div>,
    document.body
  );
}

function SidebarNavLink({
  to,
  label,
  icon: Icon,
  expanded,
  isActive,
}: {
  to: string;
  label: string;
  icon: LucideIcon;
  expanded: boolean;
  isActive: boolean;
}) {
  const anchorRef = useRef<HTMLAnchorElement>(null);
  const [tipOpen, setTipOpen] = useState(false);
  const collapsed = !expanded;

  return (
    <>
      <NavLink
        ref={anchorRef}
        to={to}
        onMouseEnter={() => collapsed && setTipOpen(true)}
        onMouseLeave={() => setTipOpen(false)}
        onFocus={() => collapsed && setTipOpen(true)}
        onBlur={() => setTipOpen(false)}
        className={cn(
          "nav-item flex items-center rounded-xl text-sm font-medium",
          "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand",
          "transition-[transform,box-shadow] duration-200 ease-out motion-reduce:transition-none",
          expanded
            ? "gap-3 px-3 py-2.5"
            : "flex w-full min-h-11 justify-center px-2 py-2 hover:scale-[1.04] active:scale-[0.98]",
          isActive
            ? "nav-active"
            : "text-slate-600 dark:text-slate-400 dark:hover:text-white"
        )}
        aria-current={isActive ? "page" : undefined}
        aria-label={expanded ? undefined : label}
      >
        <Icon
          className={cn(
            "flex-shrink-0 transition-transform duration-200 ease-out motion-reduce:transition-none",
            expanded ? "h-5 w-5" : "h-6 w-6"
          )}
          aria-hidden="true"
        />
        <span
          className={cn(
            "inline-block min-w-0 overflow-hidden transition-[opacity,transform] ease-out motion-reduce:transition-none",
            expanded ? "max-w-[200px] translate-x-0 opacity-100" : "max-w-0 -translate-x-1 opacity-0"
          )}
          style={{ transitionDuration: `${SIDEBAR_TRANSITION_MS}ms` }}
          aria-hidden={!expanded}
        >
          {label}
        </span>
      </NavLink>
      <NavTooltipPortal
        label={label}
        show={collapsed && tipOpen}
        anchorRef={anchorRef}
      />
    </>
  );
}

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const sidebarCollapsed = useAppStore((s) => s.sidebarCollapsed);
  const toggleSidebarCollapsed = useAppStore((s) => s.toggleSidebarCollapsed);

  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);
  const collapseBtnRef = useRef<HTMLButtonElement>(null);
  const [collapseTipOpen, setCollapseTipOpen] = useState(false);

  const expanded = !sidebarCollapsed;

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

  useEffect(() => {
    setUserMenuOpen(false);
  }, [location.pathname]);

  function handleAccount() {
    setUserMenuOpen(false);
    navigate("/account");
  }

  function handleLogout() {
    setUserMenuOpen(false);
    alert("Logged out (demo)");
  }

  return (
    <aside
      className={cn(
        "relative z-40 hidden h-screen flex-shrink-0 flex-col overflow-visible lg:flex",
        "sidebar-glass",
        "transition-[width,box-shadow] motion-reduce:transition-none",
        expanded
          ? "w-64 shadow-none"
          : "w-[4.5rem] shadow-[inset_-1px_0_0_rgba(148,163,184,0.12)] dark:shadow-[inset_-1px_0_0_rgba(255,255,255,0.06)]"
      )}
      style={{
        transitionDuration: `${SIDEBAR_TRANSITION_MS}ms`,
        transitionTimingFunction: SIDEBAR_EASE,
      }}
      aria-label="Main navigation"
    >
      {/* Logo */}
      <div
        className={cn(
          "flex shrink-0 border-b border-slate-200 dark:border-white/10",
          expanded
            ? "items-center gap-3 px-6 py-5"
            : "flex-col items-center gap-3 px-2 py-4"
        )}
      >
        <div
          className={cn(
            "flex min-w-0 items-center gap-3 transition-transform duration-300 ease-out motion-reduce:transition-none",
            expanded ? "" : "flex-col",
            !expanded && "hover:scale-[1.02]"
          )}
        >
          <div className="logo-icon flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand shadow-brand-glow transition-transform duration-300 ease-out motion-reduce:transition-none">
            <TrendingUp className="h-5 w-5 text-white" aria-hidden="true" />
          </div>
          <div
            className={cn(
              "min-w-0 overflow-hidden transition-[opacity,transform] ease-out motion-reduce:transition-none",
              expanded
                ? "max-w-[200px] translate-x-0 opacity-100"
                : "pointer-events-none max-w-0 -translate-x-2 opacity-0"
            )}
            style={{ transitionDuration: `${SIDEBAR_TRANSITION_MS}ms` }}
            aria-hidden={!expanded}
          >
            <p className="font-heading text-base font-bold leading-tight text-slate-900 dark:text-white">
              Make2Flow
            </p>
            <p className="text-[10px] font-medium uppercase tracking-widest text-slate-400">
              Supply Chain
            </p>
          </div>
        </div>
      </div>

      <nav
        id="sidebar-primary-nav"
        className="flex min-h-0 flex-1 flex-col overflow-y-auto overflow-x-visible px-3 py-4"
        aria-label="Sidebar navigation"
      >
        <p
          className={cn(
            "mb-3 px-3 text-[10px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500",
            "transition-opacity duration-300 ease-out motion-reduce:transition-none",
            expanded ? "opacity-100" : "sr-only"
          )}
          style={{ transitionDuration: `${SIDEBAR_TRANSITION_MS}ms` }}
        >
          Menu
        </p>
        <ul className="flex flex-col gap-2" role="list">
          {NAV_ITEMS.map(({ path, label, icon }) => (
            <li key={path}>
              <SidebarNavLink
                to={path}
                label={label}
                icon={icon}
                expanded={expanded}
                isActive={location.pathname === path}
              />
            </li>
          ))}
          <li
            className={cn(
              "mt-4 border-t border-slate-200 pt-4 dark:border-white/10",
              expanded ? "" : "flex justify-center"
            )}
          >
            <SidebarNavLink
              to="/settings"
              label="Settings"
              icon={Settings}
              expanded={expanded}
              isActive={location.pathname === "/settings"}
            />
          </li>
        </ul>
      </nav>

      <div
        className="flex shrink-0 flex-col gap-2 border-t border-slate-200 px-3 pb-4 pt-3 dark:border-white/10"
        ref={menuRef}
      >
        <div
          className={cn(
            "relative z-10 flex w-full shrink-0",
            expanded ? "justify-start" : "justify-center"
          )}
        >
          <button
            ref={collapseBtnRef}
            type="button"
            onClick={() => toggleSidebarCollapsed()}
            onMouseEnter={() => setCollapseTipOpen(true)}
            onMouseLeave={() => setCollapseTipOpen(false)}
            onFocus={() => setCollapseTipOpen(true)}
            onBlur={() => setCollapseTipOpen(false)}
            className={cn(
              "flex items-center justify-center rounded-xl border border-transparent",
              "min-h-11 min-w-11 text-slate-500 transition-all duration-200 ease-out motion-reduce:transition-none",
              "hover:scale-[1.05] active:scale-[0.97]",
              "hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-white",
              "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            )}
            aria-expanded={expanded}
            aria-controls="sidebar-primary-nav"
            aria-label={expanded ? "Collapse sidebar" : "Expand sidebar"}
          >
            {expanded ? (
              <ChevronLeft className="h-5 w-5" aria-hidden="true" />
            ) : (
              <ChevronRight className="h-5 w-5" aria-hidden="true" />
            )}
          </button>
          <NavTooltipPortal
            label={expanded ? "Collapse menu" : "Expand menu"}
            show={collapseTipOpen}
            anchorRef={collapseBtnRef}
          />
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={() => setUserMenuOpen((o) => !o)}
            className={cn(
              "flex w-full items-center rounded-xl p-1.5 transition-all duration-200 ease-out motion-reduce:transition-none",
              "min-h-11 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand",
              expanded ? "gap-3" : "justify-center hover:scale-[1.02] active:scale-[0.98]",
              userMenuOpen
                ? "bg-slate-100 dark:bg-white/10"
                : "hover:bg-slate-100 dark:hover:bg-white/5"
            )}
            aria-label="Open user menu"
            aria-expanded={userMenuOpen}
            aria-haspopup="menu"
            title={!expanded ? "User menu" : undefined}
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-brand/30 bg-brand/10 dark:border-brand/50 dark:bg-brand/30">
              <span className="text-xs font-bold text-brand">SR</span>
            </div>
            <div
              className={cn(
                "min-w-0 flex-1 overflow-hidden text-left transition-[opacity,transform] ease-out motion-reduce:transition-none",
                expanded
                  ? "max-w-[200px] translate-x-0 opacity-100"
                  : "max-w-0 -translate-x-1 opacity-0"
              )}
              style={{ transitionDuration: `${SIDEBAR_TRANSITION_MS}ms` }}
              aria-hidden={!expanded}
            >
              <p className="truncate text-sm font-medium text-slate-900 dark:text-white">
                Santi Reke
              </p>
              <p className="truncate text-xs text-slate-400 dark:text-slate-500">Admin</p>
            </div>
          </button>

          {userMenuOpen && (
            <div
              className={cn(
                "absolute bottom-full z-50 mb-2 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg dark:border-white/10 dark:bg-navy-800",
                expanded ? "left-0 right-0" : "left-0 w-64 max-w-[calc(100vw-2rem)]"
              )}
              role="menu"
              aria-label="User menu"
            >
              <div className="border-b border-slate-100 px-4 py-3 dark:border-white/5">
                <p className="text-sm font-semibold text-slate-900 dark:text-white">Santi Reke</p>
                <p className="text-xs text-slate-400">santireke37@gmail.com</p>
              </div>

              <ul className="py-1.5" role="none">
                <li role="none">
                  <button
                    type="button"
                    role="menuitem"
                    onClick={handleAccount}
                    className="group flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-slate-50 dark:hover:bg-white/5"
                  >
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-100 transition-colors group-hover:bg-brand/10 dark:bg-white/5 dark:group-hover:bg-brand/20">
                      <User
                        className="h-3.5 w-3.5 text-slate-400 transition-colors group-hover:text-brand"
                        aria-hidden="true"
                      />
                    </span>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">Account</p>
                  </button>
                </li>
                <li role="none">
                  <button
                    type="button"
                    role="menuitem"
                    onClick={handleLogout}
                    className="group flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-danger/5"
                  >
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-100 transition-colors group-hover:bg-danger/10 dark:bg-white/5 dark:group-hover:bg-danger/20">
                      <LogOut
                        className="h-3.5 w-3.5 text-slate-400 transition-colors group-hover:text-danger"
                        aria-hidden="true"
                      />
                    </span>
                    <p className="text-sm font-medium text-slate-700 transition-colors group-hover:text-danger dark:text-slate-300">
                      Logout
                    </p>
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
