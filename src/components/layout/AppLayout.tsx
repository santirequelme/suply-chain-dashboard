import { Outlet, useLocation, Link } from "react-router-dom";
import { Palette } from "lucide-react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import MobileBottomNav from "./MobileBottomNav";
import { cn } from "@/lib/utils";

export default function AppLayout() {
  const location = useLocation();
  const isDesignSystem = location.pathname === "/design-system";

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-navy-900" style={{ backgroundImage: "inherit" }}>
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden min-w-0">
        {!isDesignSystem && <Topbar />}
        <main
          className={cn(
            "flex-1 overflow-y-auto",
            isDesignSystem ? "p-0" : "p-4 md:p-6 pb-28 lg:pb-6"
          )}
          id="main-content"
          aria-label="Page content"
        >
          <Outlet />
        </main>
        
        {/* Floating Design System Button - Desktop */}
        {!isDesignSystem && (
          <Link
            to="/design-system"
            className="hidden lg:flex fixed bottom-6 right-6 z-40 p-2.5 rounded-xl btn-primary shadow-lg hover:shadow-xl transition-shadow group"
            aria-label="Go to Design System"
          >
            <Palette className="w-5 h-5" />
            <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 dark:bg-navy-800 text-white text-xs font-medium px-2.5 py-1.5 rounded-lg shadow-lg whitespace-nowrap">
              Access Design System
            </span>
          </Link>
        )}
      </div>
      <MobileBottomNav />
    </div>
  );
}
