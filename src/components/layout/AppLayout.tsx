import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import MobileBottomNav from "./MobileBottomNav";

export default function AppLayout() {
  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-navy-900" style={{ backgroundImage: "inherit" }}>
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden min-w-0">
        <Topbar />
        <main
          className="flex-1 overflow-y-auto p-4 md:p-6 pb-28 lg:pb-6"
          id="main-content"
          aria-label="Page content"
        >
          <Outlet />
        </main>
      </div>
      <MobileBottomNav />
    </div>
  );
}
