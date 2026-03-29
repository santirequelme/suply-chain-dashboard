import { NavLink } from "react-router-dom";
import { LayoutDashboard, Building2, Truck, Package, Ship } from "lucide-react";
import { cn } from "@/lib/utils";

// Settings is NOT in mobile bottom nav — it's accessed via the top CTA button.
const NAV_ITEMS = [
  { path: "/dashboard",  label: "Dashboard",  icon: LayoutDashboard },
  { path: "/suppliers",  label: "Suppliers",  icon: Truck },
  { path: "/facilities", label: "Facilities", icon: Building2 },
  { path: "/products",   label: "Products",   icon: Package },
  { path: "/shipments",  label: "Shipments",  icon: Ship },
];

export default function MobileBottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-20 lg:hidden" aria-label="Mobile navigation">
      <div
        className="pointer-events-none h-6 bg-gradient-to-t from-white/95 to-transparent dark:from-[rgba(5,21,63,0.55)]"
        aria-hidden="true"
      />
      <div className={cn("mobile-nav-glass px-2 pb-safe")}>
        <ul className="flex items-center justify-around" role="list">
          {NAV_ITEMS.map(({ path, label, icon: Icon }) => (
            <li key={path} className="flex-1">
              <NavLink
                to={path}
                className={({ isActive }) =>
                  cn(
                    "nav-item flex min-h-[48px] flex-col items-center justify-center gap-1 rounded-xl px-2 py-2 transition-all duration-200",
                    isActive
                      ? "nav-active"
                      : "text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"
                  )
                }
                aria-label={label}
              >
                {({ isActive }) => (
                  <>
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg">
                      <Icon
                        className={cn(
                          "h-5 w-5",
                          isActive ? "text-brand dark:text-white" : "text-slate-500 dark:text-slate-400"
                        )}
                        aria-hidden="true"
                      />
                    </span>
                    <span
                      className={cn(
                        "text-[10px] font-medium leading-none",
                        isActive ? "text-brand dark:text-white" : "text-slate-400 dark:text-slate-500"
                      )}
                    >
                      {label}
                    </span>
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
