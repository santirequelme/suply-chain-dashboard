import { useState, useMemo, useCallback, useRef } from "react";
import type { Shipment, Facility } from "@/types";
import { facilityMap } from "@/data";
import { formatCurrency, cn } from "@/lib/utils";

// ─── Mercator projection ─────────────────────────────────────────────────────
const MAP_W = 960;
const MAP_H = 500;
const PAD = 40;

function mercatorX(lng: number): number {
  return PAD + ((lng + 180) / 360) * (MAP_W - PAD * 2);
}

function mercatorY(lat: number): number {
  const latRad = (lat * Math.PI) / 180;
  const mercN = Math.log(Math.tan(Math.PI / 4 + latRad / 2));
  const yNorm = (1 - mercN / Math.PI) / 2;
  return PAD + yNorm * (MAP_H - PAD * 2);
}

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

// ─── Simplified world outline paths (major landmasses) ───────────────────────
// Using a highly simplified set of continent outlines for visual reference
const WORLD_PATHS = [
  // North America
  "M130,100 L200,80 L260,90 L280,120 L260,160 L240,180 L200,200 L180,220 L160,200 L140,170 L120,140 Z",
  // South America
  "M200,230 L220,240 L240,260 L240,300 L230,340 L210,370 L190,360 L180,320 L175,280 L185,250 Z",
  // Europe
  "M440,90 L470,80 L500,85 L510,100 L500,120 L490,140 L470,130 L450,120 L440,110 Z",
  // Africa
  "M440,160 L480,150 L510,170 L520,210 L510,260 L490,300 L470,310 L450,290 L440,250 L430,210 L435,180 Z",
  // Asia
  "M520,70 L580,60 L650,65 L720,80 L740,100 L730,130 L700,150 L660,140 L620,120 L580,130 L540,140 L520,120 L510,100 Z",
  // India
  "M600,150 L620,155 L630,180 L620,210 L600,220 L590,200 L585,170 Z",
  // Southeast Asia
  "M660,160 L690,150 L710,165 L700,190 L680,200 L660,185 Z",
  // Australia
  "M700,280 L750,270 L780,280 L790,300 L770,330 L740,340 L710,320 L700,300 Z",
  // Japan/Korea
  "M730,95 L735,85 L738,100 L732,110 Z",
  // UK
  "M440,88 L445,80 L448,90 L443,95 Z",
];

// ─── Aggregate routes ────────────────────────────────────────────────────────
interface AggregatedRoute {
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

// ─── Curved path between two points ─────────────────────────────────────────
function curvedPath(
  x1: number,
  y1: number,
  x2: number,
  y2: number
): string {
  const midX = (x1 + x2) / 2;
  const midY = (y1 + y2) / 2;
  const dx = x2 - x1;
  const dy = y2 - y1;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const curvature = Math.min(dist * 0.3, 60);
  // Perpendicular offset for the control point
  const nx = -dy / dist;
  const ny = dx / dist;
  const cx = midX + nx * curvature;
  const cy = midY + ny * curvature;
  return `M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`;
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

export type { AggregatedRoute };

export default function RouteMap({ shipments, onRouteClick, className }: RouteMapProps) {
  const svgRef = useRef<SVGSVGElement>(null);
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
      if (!svgRef.current) return { x: 0, y: 0 };
      const rect = svgRef.current.getBoundingClientRect();
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    },
    []
  );

  return (
    <div className={cn("card overflow-hidden relative", className)}>
      <div className="px-5 py-3 border-b border-slate-200 dark:border-white/10 flex items-center justify-between">
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

      <div className="relative overflow-hidden">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${MAP_W} ${MAP_H}`}
          className="w-full h-auto"
          style={{ minHeight: 300, maxHeight: 520 }}
          role="img"
          aria-label="Shipment route map showing origin and destination facilities"
        >
          {/* Background */}
          <rect width={MAP_W} height={MAP_H} className="fill-slate-50 dark:fill-[#0B1023]" rx={8} />

          {/* Grid lines */}
          {Array.from({ length: 7 }, (_, i) => {
            const x = PAD + (i * (MAP_W - PAD * 2)) / 6;
            return (
              <line
                key={`vg-${i}`}
                x1={x} y1={PAD} x2={x} y2={MAP_H - PAD}
                className="stroke-slate-200/50 dark:stroke-white/[0.04]"
                strokeWidth={0.5}
              />
            );
          })}
          {Array.from({ length: 5 }, (_, i) => {
            const y = PAD + (i * (MAP_H - PAD * 2)) / 4;
            return (
              <line
                key={`hg-${i}`}
                x1={PAD} y1={y} x2={MAP_W - PAD} y2={y}
                className="stroke-slate-200/50 dark:stroke-white/[0.04]"
                strokeWidth={0.5}
              />
            );
          })}

          {/* World landmass outlines */}
          {WORLD_PATHS.map((d, i) => (
            <path
              key={`land-${i}`}
              d={d}
              className="fill-slate-200/60 dark:fill-white/[0.06] stroke-slate-300/50 dark:stroke-white/[0.08]"
              strokeWidth={0.5}
            />
          ))}

          {/* Route lines */}
          {routes.map((route) => {
            const x1 = mercatorX(route.origin.location.lng);
            const y1 = mercatorY(route.origin.location.lat);
            const x2 = mercatorX(route.dest.location.lng);
            const y2 = mercatorY(route.dest.location.lat);
            const d = curvedPath(x1, y1, x2, y2);
            const color = STATUS_COLORS[route.dominantStatus] ?? "#94A3B8";
            const thickness = 1 + (route.totalQuantity / maxRouteQty) * 3.5;
            const isHovered = hoveredRoute === route.key;

            return (
              <g key={route.key}>
                {/* Glow on hover */}
                {isHovered && (
                  <path
                    d={d}
                    fill="none"
                    stroke={color}
                    strokeWidth={thickness + 4}
                    strokeOpacity={0.25}
                    strokeLinecap="round"
                  />
                )}
                <path
                  d={d}
                  fill="none"
                  stroke={color}
                  strokeWidth={isHovered ? thickness + 1 : thickness}
                  strokeOpacity={isHovered ? 0.9 : 0.55}
                  strokeLinecap="round"
                  strokeDasharray={route.dominantStatus === "pending" ? "6 4" : undefined}
                  className="cursor-pointer transition-opacity"
                  onMouseEnter={(e) => {
                    setHoveredRoute(route.key);
                    setTooltip({ ...getTooltipPosition(e), route });
                  }}
                  onMouseMove={(e) => setTooltip({ ...getTooltipPosition(e), route })}
                  onMouseLeave={() => {
                    setHoveredRoute(null);
                    setTooltip(null);
                  }}
                  onClick={() => onRouteClick(route)}
                />
                {/* Arrowhead direction indicator */}
                <circle
                  cx={x2}
                  cy={y2}
                  r={2}
                  fill={color}
                  opacity={0.7}
                  pointerEvents="none"
                />
              </g>
            );
          })}

          {/* Facility nodes */}
          {activeFacilities.map((f) => {
            const x = mercatorX(f.location.lng);
            const y = mercatorY(f.location.lat);
            const count = facilityCounts.get(f.id) ?? 1;
            const r = 3 + (count / maxCount) * 5;
            const isHovered = hoveredFacility === f.id;

            return (
              <g key={f.id}>
                {/* Pulse ring on hover */}
                {isHovered && (
                  <circle
                    cx={x}
                    cy={y}
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
                <circle
                  cx={x}
                  cy={y}
                  r={isHovered ? r + 1.5 : r}
                  className="fill-brand stroke-white dark:stroke-navy-900 cursor-pointer"
                  strokeWidth={1.5}
                  opacity={isHovered ? 1 : 0.85}
                  onMouseEnter={(e) => {
                    setHoveredFacility(f.id);
                    setTooltip({ ...getTooltipPosition(e), facility: f });
                  }}
                  onMouseMove={(e) => setTooltip({ ...getTooltipPosition(e), facility: f })}
                  onMouseLeave={() => {
                    setHoveredFacility(null);
                    setTooltip(null);
                  }}
                />
              </g>
            );
          })}
        </svg>

        {/* Tooltip overlay */}
        {tooltip && (
          <div
            className="absolute z-50 pointer-events-none"
            style={{
              left: Math.min(tooltip.x + 12, MAP_W - 200),
              top: tooltip.y - 10,
              transform: tooltip.x > MAP_W * 0.7 ? "translateX(-110%)" : undefined,
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
