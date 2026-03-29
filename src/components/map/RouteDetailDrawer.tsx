import { useEffect, useRef } from "react";
import type { AggregatedRoute } from "./RouteMap";
import { productMap, supplierMap } from "@/data";
import Badge from "@/components/ui/Badge";
import { formatCurrency, formatDate, cn } from "@/lib/utils";
import { X, MapPin, Package, Ship, ArrowRight } from "lucide-react";

interface RouteDetailDrawerProps {
  route: AggregatedRoute | null;
  onClose: () => void;
}

export default function RouteDetailDrawer({ route, onClose }: RouteDetailDrawerProps) {
  const drawerRef = useRef<HTMLDivElement>(null);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (route) {
      document.addEventListener("keydown", handler);
      return () => document.removeEventListener("keydown", handler);
    }
  }, [route, onClose]);

  // Focus trap
  useEffect(() => {
    if (route && drawerRef.current) {
      drawerRef.current.focus();
    }
  }, [route]);

  if (!route) return null;

  const statusBreakdown: Record<string, number> = {};
  for (const s of route.shipments) {
    statusBreakdown[s.status] = (statusBreakdown[s.status] ?? 0) + 1;
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 z-40 transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        ref={drawerRef}
        tabIndex={-1}
        role="dialog"
        aria-label={`Route details: ${route.origin.location.city} to ${route.dest.location.city}`}
        className={cn(
          "fixed top-0 right-0 h-full w-full sm:w-[420px] z-50",
          "bg-white dark:bg-navy-900 shadow-2xl",
          "overflow-y-auto",
          "animate-in slide-in-from-right duration-200"
        )}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white dark:bg-navy-900 border-b border-slate-200 dark:border-white/10 px-5 py-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-lg font-heading font-bold text-slate-900 dark:text-white">
                Route Details
              </p>
              <div className="flex items-center gap-2 mt-1 text-sm text-slate-500 dark:text-slate-400">
                <MapPin className="h-3.5 w-3.5 text-success flex-shrink-0" />
                <span className="truncate">{route.origin.location.city}</span>
                <ArrowRight className="h-3 w-3 flex-shrink-0" />
                <MapPin className="h-3.5 w-3.5 text-danger flex-shrink-0" />
                <span className="truncate">{route.dest.location.city}</span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
              aria-label="Close drawer"
            >
              <X className="h-5 w-5 text-slate-400" />
            </button>
          </div>
        </div>

        <div className="px-5 py-5 space-y-5">
          {/* Summary cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-50 dark:bg-white/[0.03] rounded-xl px-3 py-2.5 border border-slate-100 dark:border-white/5">
              <p className="text-[10px] uppercase tracking-wider text-slate-400 mb-0.5">Shipments</p>
              <p className="text-lg font-bold text-slate-900 dark:text-white">{route.shipments.length}</p>
            </div>
            <div className="bg-slate-50 dark:bg-white/[0.03] rounded-xl px-3 py-2.5 border border-slate-100 dark:border-white/5">
              <p className="text-[10px] uppercase tracking-wider text-slate-400 mb-0.5">Total Value</p>
              <p className="text-lg font-bold text-slate-900 dark:text-white">{formatCurrency(route.totalValue, true)}</p>
            </div>
            <div className="bg-slate-50 dark:bg-white/[0.03] rounded-xl px-3 py-2.5 border border-slate-100 dark:border-white/5">
              <p className="text-[10px] uppercase tracking-wider text-slate-400 mb-0.5">Total Units</p>
              <p className="text-lg font-bold text-slate-900 dark:text-white">{route.totalQuantity.toLocaleString()}</p>
            </div>
            <div className="bg-slate-50 dark:bg-white/[0.03] rounded-xl px-3 py-2.5 border border-slate-100 dark:border-white/5">
              <p className="text-[10px] uppercase tracking-wider text-slate-400 mb-0.5">Avg Value</p>
              <p className="text-lg font-bold text-slate-900 dark:text-white">
                {formatCurrency(route.totalValue / route.shipments.length, true)}
              </p>
            </div>
          </div>

          {/* Status breakdown */}
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
              Status Breakdown
            </p>
            <div className="flex flex-wrap gap-2">
              {Object.entries(statusBreakdown).map(([status, count]) => (
                <div
                  key={status}
                  className="flex items-center gap-1.5 bg-slate-50 dark:bg-white/[0.03] rounded-lg px-2.5 py-1.5 border border-slate-100 dark:border-white/5"
                >
                  <Badge status={status} />
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Facilities */}
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
              Facilities
            </p>
            <div className="space-y-3">
              <div className="bg-slate-50 dark:bg-white/[0.03] rounded-xl p-3 border border-slate-100 dark:border-white/5">
                <div className="flex items-center gap-2 mb-1">
                  <MapPin className="h-3.5 w-3.5 text-success" />
                  <p className="text-[10px] uppercase tracking-wider text-slate-400">Origin</p>
                </div>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">{route.origin.name}</p>
                <p className="text-xs text-slate-400 mt-0.5">
                  {route.origin.location.city}, {route.origin.location.country} · {route.origin.type}
                </p>
              </div>
              <div className="bg-slate-50 dark:bg-white/[0.03] rounded-xl p-3 border border-slate-100 dark:border-white/5">
                <div className="flex items-center gap-2 mb-1">
                  <MapPin className="h-3.5 w-3.5 text-danger" />
                  <p className="text-[10px] uppercase tracking-wider text-slate-400">Destination</p>
                </div>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">{route.dest.name}</p>
                <p className="text-xs text-slate-400 mt-0.5">
                  {route.dest.location.city}, {route.dest.location.country} · {route.dest.type}
                </p>
              </div>
            </div>
          </div>

          {/* Individual shipments */}
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
              Shipments on this Route
            </p>
            <div className="space-y-2">
              {route.shipments
                .sort((a, b) => new Date(b.shippedAt).getTime() - new Date(a.shippedAt).getTime())
                .map((s) => {
                  const product = productMap[s.productId];
                  const supplier = supplierMap[s.supplierId];
                  return (
                    <div
                      key={s.id}
                      className="bg-slate-50 dark:bg-white/[0.03] rounded-xl p-3 border border-slate-100 dark:border-white/5"
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <Badge status={s.status} />
                          <span className="font-mono text-[11px] text-slate-400">{s.trackingNumber}</span>
                        </div>
                        <span className="text-sm font-semibold text-slate-900 dark:text-white">
                          {formatCurrency(s.value, true)}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
                        {product && (
                          <div className="flex items-center gap-1">
                            <Package className="h-3 w-3 text-brand" />
                            <span className="truncate">{product.name}</span>
                          </div>
                        )}
                        {supplier && (
                          <span className="truncate">{supplier.name}</span>
                        )}
                        <div className="flex items-center gap-1">
                          <Ship className="h-3 w-3" />
                          <span>{s.carrier}</span>
                        </div>
                        <span>{s.quantity.toLocaleString()} units</span>
                        <span>Shipped {formatDate(s.shippedAt)}</span>
                        <span>ETA {formatDate(s.estimatedArrival)}</span>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
