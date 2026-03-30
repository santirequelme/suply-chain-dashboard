import React, { useState, useMemo, useCallback } from "react";
import type { Shipment, Facility } from "@/types";
import { facilityMap } from "@/data";
import { formatCurrency, cn } from "@/lib/utils";
import { ComposableMap, Geographies, Geography, Marker, Line } from "react-simple-maps";
import geoData from "@/data/features.json";

// ─── Status colors ───────────────────────────────────────────────────────────
const STATUS_COLORS: Record<string, string> = {
  delivered: "#01B574",
  in_transit: "#4318FF",
  pending: "#94A3B8",
  delayed: "#E53E3E",
  cancelled: "#64748B",
};

const STATUS_LABELS: Record<string, string> = {
  delivered: "Delivered",
  in_transit: "In Transit",
  pending: "Pending",
  delayed: "Delayed",
  cancelled: "Cancelled",
};

// ─── Aggregate routes ────────────────────────────────────────────────────────
export interface AggregatedRoute {
  key: string;
  originId: string;
  destId: string;
  origin: Facility;
  dest: Facility;
  shipments: Shipment[];
  totalValue: number;
  totalQuantity: number;
  dominantStatus: string;
}

function aggregateRoutes(shipments: Shipment[]): AggregatedRoute[] {
  const map = new Map<string, AggregatedRoute>();
  for (const s of shipments) {
    const origin = facilityMap[s.originFacilityId];
    const dest = facilityMap[s.destinationFacilityId];
    if (!origin || !dest) continue;
    const key = `${s.originFacilityId}->${s.destinationFacilityId}`;
    const existing = map.get(key);
    if (existing) {
      existing.shipments.push(s);
      existing.totalValue += s.value;
      existing.totalQuantity += s.quantity;
    } else {
      map.set(key, {
        key,
        originId: s.originFacilityId,
        destId: s.destinationFacilityId,
        origin,
        dest,
        shipments: [s],
        totalValue: s.value,
        totalQuantity: s.quantity,
        dominantStatus: s.status,
      });
    }
  }
  // Determine dominant status per route
  for (const route of map.values()) {
    const statusCount: Record<string, number> = {};
    for (const s of route.shipments) {
      statusCount[s.status] = (statusCount[s.status] ?? 0) + 1;
    }
    route.dominantStatus = Object.entries(statusCount).sort(
      (a, b) => b[1] - a[1]
    )[0][0];
  }
  return Array.from(map.values());
}

// ─── Tooltip ─────────────────────────────────────────────────────────────────
interface TooltipData {
  x: number;
  y: number;
  route?: AggregatedRoute;
  facility?: Facility;
}

// ─── Component Props ─────────────────────────────────────────────────────────
interface RouteMapProps {
  shipments: Shipment[];
  onRouteClick: (route: AggregatedRoute) => void;
  className?: string;
}

export default function RouteMap({ shipments, onRouteClick, className }: RouteMapProps) {
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);
  const [hoveredRoute, setHoveredRoute] = useState<string | null>(null);
  const [hoveredFacility, setHoveredFacility] = useState<string | null>(null);

  const routes = useMemo(() => aggregateRoutes(shipments), [shipments]);

  // Unique facilities involved in these shipments
  const activeFacilities = useMemo(() => {
    const ids = new Set<string>();
    for (const s of shipments) {
      ids.add(s.originFacilityId);
      ids.add(s.destinationFacilityId);
    }
    const result: Facility[] = [];
    for (const id of ids) {
      const f = facilityMap[id];
      if (f) result.push(f);
    }
    return result;
  }, [shipments]);

  // Shipment count per facility for node sizing
  const facilityCounts = useMemo(() => {
    const map = new Map<string, number>();
    for (const s of shipments) {
      map.set(s.originFacilityId, (map.get(s.originFacilityId) ?? 0) + 1);
      map.set(s.destinationFacilityId, (map.get(s.destinationFacilityId) ?? 0) + 1);
    }
    return map;
  }, [shipments]);

  const maxCount = useMemo(
    () => Math.max(1, ...Array.from(facilityCounts.values())),
    [facilityCounts]
  );

  const maxRouteQty = useMemo(
    () => Math.max(1, ...routes.map((r) => r.totalQuantity)),
    [routes]
  );

  const getTooltipPosition = useCallback(
    (e: React.MouseEvent) => {
      const parentRect = e.currentTarget.closest('.map-container')?.getBoundingClientRect();
      if (!parentRect) return { x: e.clientX, y: e.clientY };
      return {
        x: e.clientX - parentRect.left,
        y: e.clientY - parentRect.top,
      };
    },
    []
  );

  return (
    <div className={cn("card overflow-hidden relative map-container", className)}>
      <style>
        {`
          @keyframes route-pulse {
            from { stroke-dashoffset: 24; }
            to { stroke-dashoffset: 0; }
          }
          .route-animated {
            animation: route-pulse 1.5s linear infinite;
          }
        `}
      </style>
      <div className="px-5 py-3 border-b border-slate-200 dark:border-white/10 flex items-center justify-between z-10 relative bg-white/50 dark:bg-navy-800/50 backdrop-blur-sm">
        <div>
          <p className="text-sm font-semibold text-slate-900 dark:text-white">
            Route Intelligence Map
          </p>
          <p className="text-xs text-slate-400 mt-0.5">
            {routes.length} routes · {activeFacilities.length} facilities
          </p>
        </div>
        {/* Legend */}
        <div className="hidden sm:flex items-center gap-3">
          {Object.entries(STATUS_LABELS).map(([key, label]) => (
            <div key={key} className="flex items-center gap-1.5">
              <span
                className="inline-block h-2 w-2 rounded-full"
                style={{ backgroundColor: STATUS_COLORS[key] }}
              />
              <span className="text-[10px] text-slate-400">{label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="relative overflow-hidden bg-slate-50 dark:bg-[#0B1023]">
        <ComposableMap
          projectionConfig={{
            scale: 140,
            center: [0, 20]
          }}
          height={500}
          width={960}
          className="w-full h-auto"
          style={{ minHeight: 300, maxHeight: 600 }}
        >
          {/* Map Base */}
          <Geographies geography={geoData}>
            {({ geographies }) =>
              geographies.map((geo) => (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  className="fill-slate-200/80 dark:fill-white/[0.04] stroke-slate-300/80 dark:stroke-white/[0.06]"
                  strokeWidth={0.5}
                  style={{
                    default: { outline: "none" },
                    hover:   { outline: "none" },
                    pressed: { outline: "none" },
                  }}
                />
              ))
            }
          </Geographies>

          {/* Routes */}
          {routes.map((route) => {
            const originCoords: [number, number] = [route.origin.location.lng, route.origin.location.lat];
            const destCoords: [number, number] = [route.dest.location.lng, route.dest.location.lat];
            const color = STATUS_COLORS[route.dominantStatus] ?? "#94A3B8";
            const thickness = 1.2 + (route.totalQuantity / maxRouteQty) * 3.5;
            const isHovered = hoveredRoute === route.key;

            return (
              <g key={route.key}>
                {/* Background Line */}
                <Line
                  from={originCoords}
                  to={destCoords}
                  stroke={color}
                  strokeWidth={isHovered ? thickness + 1 : thickness}
                  strokeOpacity={isHovered ? 0.6 : 0.25}
                  strokeLinecap="round"
                  className="cursor-pointer transition-opacity"
                  onMouseEnter={(e: any) => {
                    setHoveredRoute(route.key);
                    setTooltip({ ...getTooltipPosition(e), route });
                  }}
                  onMouseMove={(e: any) => setTooltip({ ...getTooltipPosition(e), route })}
                  onMouseLeave={() => {
                    setHoveredRoute(null);
                    setTooltip(null);
                  }}
                  onClick={() => onRouteClick(route)}
                />

                {/* Animated Particles / Dashes for In Transit shipments */}
                <Line
                  from={originCoords}
                  to={destCoords}
                  stroke={color}
                  strokeWidth={isHovered ? thickness + 1 : thickness}
                  strokeOpacity={route.dominantStatus === "pending" ? 0.3 : 0.8}
                  strokeLinecap="round"
                  strokeDasharray={route.dominantStatus === "pending" ? "4 6" : "2 10"}
                  className={cn("pointer-events-none", route.dominantStatus !== "pending" && "route-animated")}
                />
              </g>
            );
          })}

          {/* Markers (Facilities) */}
          {activeFacilities.map((f) => {
            const coords: [number, number] = [f.location.lng, f.location.lat];
            const count = facilityCounts.get(f.id) ?? 1;
            const r = 3 + (count / maxCount) * 5;
            const isHovered = hoveredFacility === f.id;

            return (
              <Marker
                key={f.id}
                coordinates={coords}
                onMouseEnter={(e: any) => {
                  setHoveredFacility(f.id);
                  setTooltip({ ...getTooltipPosition(e), facility: f });
                }}
                onMouseMove={(e: any) => setTooltip({ ...getTooltipPosition(e), facility: f })}
                onMouseLeave={() => {
                  setHoveredFacility(null);
                  setTooltip(null);
                }}
              >
                {/* Pulse ring on hover */}
                {isHovered && (
                  <circle
                    r={r + 6}
                    fill="none"
                    stroke="#4318FF"
                    strokeWidth={1.5}
                    opacity={0.4}
                  >
                    <animate
                      attributeName="r"
                      from={r + 2}
                      to={r + 10}
                      dur="1.2s"
                      repeatCount="indefinite"
                    />
                    <animate
                      attributeName="opacity"
                      from={0.5}
                      to={0}
                      dur="1.2s"
                      repeatCount="indefinite"
                    />
                  </circle>
                )}
                {/* Core facility node */}
                <circle
                  r={isHovered ? r + 1.5 : r}
                  className="fill-brand stroke-white dark:stroke-navy-900 cursor-pointer"
                  strokeWidth={1.5}
                  opacity={isHovered ? 1 : 0.85}
                />
              </Marker>
            );
          })}
        </ComposableMap>

        {/* Tooltip overlay */}
        {tooltip && (
          <div
            className="absolute z-50 pointer-events-none transition-transform duration-75"
            style={{
              left: Math.min(tooltip.x + 12, 960 - 200),
              top: tooltip.y - 10,
              transform: tooltip.x > 960 * 0.7 ? "translateX(-110%)" : "translateX(0)",
            }}
          >
            <div className="bg-white dark:bg-navy-800 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2.5 shadow-xl text-xs min-w-[160px]">
              {tooltip.route && (
                <>
                  <p className="font-semibold text-slate-900 dark:text-white mb-1">
                    {tooltip.route.origin.location.city} → {tooltip.route.dest.location.city}
                  </p>
                  <div className="space-y-0.5 text-slate-500 dark:text-slate-400">
                    <p>{tooltip.route.shipments.length} shipment{tooltip.route.shipments.length !== 1 ? "s" : ""}</p>
                    <p>{formatCurrency(tooltip.route.totalValue, true)} total value</p>
                    <p>{tooltip.route.totalQuantity.toLocaleString()} units</p>
                    <div className="flex items-center gap-1 pt-0.5">
                      <span
                        className="h-1.5 w-1.5 rounded-full"
                        style={{ backgroundColor: STATUS_COLORS[tooltip.route.dominantStatus] }}
                      />
                      <span>{STATUS_LABELS[tooltip.route.dominantStatus]}</span>
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1.5 pt-1 border-t border-slate-100 dark:border-white/5">
                    Click for details
                  </p>
                </>
              )}
              {tooltip.facility && (
                <>
                  <p className="font-semibold text-slate-900 dark:text-white mb-1">
                    {tooltip.facility.name}
                  </p>
                  <div className="space-y-0.5 text-slate-500 dark:text-slate-400">
                    <p>{tooltip.facility.location.city}, {tooltip.facility.location.country}</p>
                    <p>{tooltip.facility.type} · {tooltip.facility.status}</p>
                    <p>{facilityCounts.get(tooltip.facility.id) ?? 0} shipments</p>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Mobile legend */}
      <div className="sm:hidden px-4 py-2 border-t border-slate-200 dark:border-white/10 flex flex-wrap gap-x-3 gap-y-1">
        {Object.entries(STATUS_LABELS).map(([key, label]) => (
          <div key={key} className="flex items-center gap-1">
            <span
              className="inline-block h-1.5 w-1.5 rounded-full"
              style={{ backgroundColor: STATUS_COLORS[key] }}
            />
            <span className="text-[10px] text-slate-400">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
