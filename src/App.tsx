import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAppStore } from "@/store/useAppStore";
import AppLayout from "@/components/layout/AppLayout";
import Dashboard from "@/views/Dashboard";
import Facilities from "@/views/Facilities";
import Suppliers from "@/views/Suppliers";
import Products from "@/views/Products";
import Shipments from "@/views/Shipments";
import SettingsView from "@/views/Settings";
import AccountView from "@/views/Account";
import DesignSystem from "@/views/DesignSystem";

export default function App() {
  const darkMode = useAppStore((s) => s.darkMode);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/facilities" element={<Facilities />} />
          <Route path="/suppliers" element={<Suppliers />} />
          <Route path="/products" element={<Products />} />
          <Route path="/shipments" element={<Shipments />} />
          <Route path="/settings" element={<SettingsView />} />
          <Route path="/account" element={<AccountView />} />
          <Route path="/design-system" element={<DesignSystem />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
