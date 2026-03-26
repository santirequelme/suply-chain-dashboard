import { NavLink } from "react-router-dom";
import { LayoutDashboard, Building2, Truck, Package, Ship } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { path: "/facilities", label: "Facilities", icon: Building2 },
  { path: "/suppliers", label: "Suppliers", icon: Truck },
  { path: "/products", label: "Products", icon: Package },
  { path: "/shipments", label: "Shipments", icon: Ship },
];

export default function MobileBottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-20 lg:hidden" aria-label="Mobile navigation">
      <div className="h-6 bg-gradient-to-t from-slate-50 dark:from-navy-950 to-transparent pointer-events-none" />
      <div className={cn(
        "border-t px-2 pb-safe",
        "bg-white/95 border-slate-200",
        "dark:bg-navy-950/95 dark:border-white/10",
        "backdrop-blur-md"
      )}>
        <ul className="flex items-center justify-around" role="list">
          {NAV_ITEMS.map(({ path, label, icon: Icon }) => (
            <li key={path} className="flex-1">
              <NavLink
                to={path}
                className={({ isActive }) =>
                  cn(
                    "flex flex-col items-center gap-1 py-2.5 px-1 rounded-2xl mx-0.5 transition-all duration-200",
                    isActive ? "text-white" : "text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"
                  )
                }
                aria-label={label}
              >
                {({ isActive }) => (
                  <>
                    <span className={cn(
                      "flex items-center justify-center h-9 w-9 rounded-xl transition-all duration-200",
                      isActive ? "bg-brand shadow-brand-glow" : "bg-transparent"
                    )}>
                      <Icon className={cn("h-5 w-5", !isActive && "text-slate-500 dark:text-slate-400")} aria-hidden="true" />
                    </span>
                    <span className={cn(
                      "text-[10px] font-medium leading-none",
                      isActive ? "text-brand dark:text-white" : "text-slate-400 dark:text-slate-500"
                    )}>
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
