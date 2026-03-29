import type {
  Facility,
  Supplier,
  Product,
  Shipment,
  MonthlyRevenue,
} from "@/types";

// ─── Seed helpers ─────────────────────────────────────────────────────────────
function seededRng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return ((s >>> 0) / 0xffffffff);
  };
}

function randInt(min: number, max: number, rng: () => number) {
  return Math.floor(rng() * (max - min + 1)) + min;
}

function randFloat(min: number, max: number, decimals: number, rng: () => number) {
  return parseFloat((rng() * (max - min) + min).toFixed(decimals));
}

function genDate(startYear: number, endYear: number, rng: () => number) {
  const start = new Date(startYear, 0, 1).getTime();
  const end = new Date(endYear, 11, 31).getTime();
  return new Date(start + rng() * (end - start)).toISOString().split("T")[0];
}

// ─── Static reference data ────────────────────────────────────────────────────
const COUNTRIES: Record<string, { region: string; cities: string[] }> = {
  "United States": {
    region: "North America",
    cities: ["Chicago", "Houston", "Los Angeles", "Detroit", "Atlanta"],
  },
  "Germany": {
    region: "Europe",
    cities: ["Munich", "Frankfurt", "Berlin", "Hamburg", "Stuttgart"],
  },
  "China": {
    region: "Asia Pacific",
    cities: ["Shanghai", "Shenzhen", "Guangzhou", "Beijing", "Tianjin"],
  },
  "Japan": {
    region: "Asia Pacific",
    cities: ["Tokyo", "Osaka", "Nagoya", "Yokohama", "Kobe"],
  },
  "Brazil": {
    region: "Latin America",
    cities: ["São Paulo", "Rio de Janeiro", "Manaus", "Campinas", "Curitiba"],
  },
  "India": {
    region: "Asia Pacific",
    cities: ["Mumbai", "Chennai", "Pune", "Bengaluru", "Hyderabad"],
  },
  "Mexico": {
    region: "Latin America",
    cities: ["Monterrey", "Guadalajara", "Mexico City", "Tijuana", "Querétaro"],
  },
  "Canada": {
    region: "North America",
    cities: ["Toronto", "Vancouver", "Montreal", "Calgary", "Ottawa"],
  },
  "United Kingdom": {
    region: "Europe",
    cities: ["London", "Birmingham", "Manchester", "Leeds", "Glasgow"],
  },
  "South Korea": {
    region: "Asia Pacific",
    cities: ["Seoul", "Busan", "Incheon", "Daegu", "Daejeon"],
  },
  "France": {
    region: "Europe",
    cities: ["Paris", "Lyon", "Marseille", "Toulouse", "Bordeaux"],
  },
  "Australia": {
    region: "Oceania",
    cities: ["Sydney", "Melbourne", "Brisbane", "Perth", "Adelaide"],
  },
};

const COUNTRIES_LIST = Object.keys(COUNTRIES);

const FACILITY_TYPES = ["Manufacturing", "Warehouse", "Distribution", "Assembly"] as const;
const FACILITY_STATUSES = ["active", "active", "active", "inactive", "maintenance"] as const;

const SUPPLIER_CATEGORIES = [
  "Raw Materials",
  "Components",
  "Electronics",
  "Packaging",
  "Logistics",
  "Chemicals",
  "Textiles",
  "Machinery",
];

const CARRIER_NAMES = ["DHL", "FedEx", "UPS", "Maersk", "MSC", "CEVA", "DB Schenker", "Kuehne+Nagel"];

const PRODUCT_CATEGORIES = [
  "Electronics",
  "Automotive Parts",
  "Industrial Components",
  "Consumer Goods",
  "Chemicals",
  "Textiles",
  "Packaging Materials",
  "Machinery Parts",
  "Medical Devices",
  "Food & Beverage",
];

// ─── Suppliers (22) ────────────────────────────────────────────────────────────
const SUPPLIER_NAMES = [
  "Apex Components Ltd",
  "SinoTech Industries",
  "EuroMech GmbH",
  "Pacific Supply Co.",
  "NipponParts Corp",
  "Brastech Solutions",
  "IndiaSource Pvt Ltd",
  "CanadaParts Inc",
  "BritishSupply PLC",
  "KoreaMfg Co.",
  "FranceParts SAS",
  "AustraliaMaterials Pty",
  "GlobalChem AG",
  "FusionComponents LLC",
  "MetroLogistics SA",
  "TechSource KK",
  "HorizonMaterials AB",
  "AlphaRaw GmbH",
  "OmegaElectronics Ltd",
  "NexusPacking Inc",
  "TriangleParts Corp",
  "SunriseMachinery Co",
];

const TIERS = ["Tier 1", "Tier 1", "Tier 2", "Tier 2", "Tier 2", "Tier 3"] as const;

export const suppliers: Supplier[] = SUPPLIER_NAMES.map((name, i) => {
  const rng = seededRng(i * 1337 + 42);
  const countryKey = COUNTRIES_LIST[i % COUNTRIES_LIST.length];
  const countryData = COUNTRIES[countryKey];
  return {
    id: `SUP${String(i + 1).padStart(3, "0")}`,
    name,
    country: countryKey,
    region: countryData.region,
    category: SUPPLIER_CATEGORIES[i % SUPPLIER_CATEGORIES.length],
    tier: TIERS[i % TIERS.length],
    status:
      i < 17
        ? "active"
        : i === 18
        ? "on_hold"
        : "inactive",
    rating: randFloat(3.0, 5.0, 1, rng),
    onTimeDelivery: randFloat(72, 99, 1, rng),
    defectRate: randFloat(0.2, 4.5, 2, rng),
    revenue: randInt(1_200_000, 48_000_000, rng),
    productsCount: randInt(3, 18, rng),
    contact: {
      name: `Contact ${i + 1}`,
      email: `contact${i + 1}@${name.toLowerCase().replace(/\s+/g, "")}.com`,
      phone: `+${randInt(1, 99, rng)} ${randInt(100, 999, rng)}-${randInt(1000, 9999, rng)}`,
    },
    createdAt: genDate(2018, 2022, rng),
  };
});

// ─── Facilities (55) ─────────────────────────────────────────────────────────
const FACILITY_NAME_PREFIXES = [
  "Alpha", "Beta", "Central", "Delta", "East", "Frontier", "Global", "Harbor",
  "Inland", "Junction", "Keystone", "Liberty", "Metro", "North", "Omega",
  "Pacific", "Quantum", "River", "South", "Titan", "Unity", "Vega", "West",
  "Xcell", "Yankee", "Zenith", "Atlas", "Beacon", "Crown", "Domain",
  "Eagle", "Falcon", "Gateway", "Highland", "Iron", "Jade", "Kingston",
  "Lakeview", "Meridian", "Nordic", "Orbit", "Pinnacle", "Quest", "Ridge",
  "Stellar", "Terrace", "Ultra", "Valor", "Windsor", "Xpanse", "Yield", "Zephyr",
  "Apex", "Bravo", "Core",
];

export const facilities: Facility[] = FACILITY_NAME_PREFIXES.map((prefix, i) => {
  const rng = seededRng(i * 2731 + 99);
  const type = FACILITY_TYPES[i % FACILITY_TYPES.length];
  const countryKey = COUNTRIES_LIST[i % COUNTRIES_LIST.length];
  const countryData = COUNTRIES[countryKey];
  const city = countryData.cities[i % countryData.cities.length];
  const supplier = suppliers[i % suppliers.length];
  return {
    id: `FAC${String(i + 1).padStart(3, "0")}`,
    name: `${prefix} ${type} ${city}`,
    type,
    status: FACILITY_STATUSES[i % FACILITY_STATUSES.length],
    location: {
      country: countryKey,
      region: countryData.region,
      city,
      lat: randFloat(-55, 70, 4, rng),
      lng: randFloat(-180, 180, 4, rng),
    },
    capacity: randInt(10_000, 500_000, rng),
    utilization: randFloat(45, 97, 1, rng),
    employees: randInt(50, 4200, rng),
    supplierId: supplier.id,
    revenue: randInt(800_000, 62_000_000, rng),
    createdAt: genDate(2018, 2023, rng),
  };
});

// ─── Products (120) ──────────────────────────────────────────────────────────
const PRODUCT_NAMES_BASE = [
  "Control Module", "Power Unit", "Drive Shaft", "Heat Exchanger", "Bearing Assembly",
  "Sensor Array", "Actuator Kit", "Valve Block", "Pump Housing", "Filter Cartridge",
  "Circuit Board", "Cable Harness", "Bracket Set", "Gasket Pack", "Bolt Kit",
  "Motor Unit", "Compressor", "Converter", "Regulator", "Manifold",
  "Cover Panel", "Frame Section", "Coupling Joint", "Seal Ring", "Impeller",
  "Rotor Disk", "Stator Unit", "Winding Coil", "Core Assembly", "Terminal Block",
];

export const products: Product[] = Array.from({ length: 120 }, (_, i) => {
  const rng = seededRng(i * 4567 + 123);
  const baseName = PRODUCT_NAMES_BASE[i % PRODUCT_NAMES_BASE.length];
  const category = PRODUCT_CATEGORIES[i % PRODUCT_CATEGORIES.length];
  const supplier = suppliers[i % suppliers.length];
  const facility = facilities[i % facilities.length];
  const stock = randInt(0, 15_000, rng);
  let status: Product["status"] =
    stock === 0
      ? "out_of_stock"
      : stock < 200
      ? "low_stock"
      : i % 25 === 0
      ? "discontinued"
      : "in_stock";
  return {
    id: `PRD${String(i + 1).padStart(4, "0")}`,
    sku: `SKU-${category.slice(0, 3).toUpperCase()}-${String(i + 1).padStart(4, "0")}`,
    name: `${baseName} ${String(i + 1).padStart(3, "0")}`,
    category,
    supplierId: supplier.id,
    facilityId: facility.id,
    unitPrice: randFloat(12, 8500, 2, rng),
    stock,
    demandMonthly: randInt(50, 3000, rng),
    leadTimeDays: randInt(3, 90, rng),
    status,
    weight: randFloat(0.1, 250, 2, rng),
    createdAt: genDate(2019, 2024, rng),
  };
});

// ─── Shipments (220) ─────────────────────────────────────────────────────────
const SHIPMENT_STATUSES = [
  "delivered", "delivered", "delivered", "in_transit", "in_transit",
  "pending", "delayed", "cancelled",
] as const;

export const shipments: Shipment[] = Array.from({ length: 220 }, (_, i) => {
  const rng = seededRng(i * 9871 + 555);
  const product = products[i % products.length];
  const supplier = suppliers[i % suppliers.length];
  const originFacility = facilities[i % facilities.length];
  const destFacility = facilities[(i + 7) % facilities.length];
  const shippedDate = genDate(2020, 2026, rng);
  const shippedMs = new Date(shippedDate).getTime();
  const transitDays = randInt(3, 45, rng);
  const estimatedArrival = new Date(shippedMs + transitDays * 86400000)
    .toISOString()
    .split("T")[0];
  const status = SHIPMENT_STATUSES[i % SHIPMENT_STATUSES.length];
  const actualArrival =
    status === "delivered"
      ? new Date(shippedMs + (transitDays + randInt(-2, 5, rng)) * 86400000)
          .toISOString()
          .split("T")[0]
      : null;
  const quantity = randInt(10, 2000, rng);
  return {
    id: `SHP${String(i + 1).padStart(5, "0")}`,
    trackingNumber: `TRK${String(i * 7 + 100031).padStart(9, "0")}`,
    productId: product.id,
    supplierId: supplier.id,
    originFacilityId: originFacility.id,
    destinationFacilityId: destFacility.id,
    status,
    quantity,
    value: parseFloat((quantity * product.unitPrice).toFixed(2)),
    shippedAt: shippedDate,
    estimatedArrival,
    actualArrival,
    carrier: CARRIER_NAMES[i % CARRIER_NAMES.length],
  };
});

// ─── Monthly Revenue (2020-2026) ──────────────────────────────────────────────
const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

export const monthlyRevenue: MonthlyRevenue[] = [];
const baseRevenue = 4_200_000;

for (let year = 2020; year <= 2026; year++) {
  const maxMonth = year === 2026 ? 3 : 12;
  for (let m = 0; m < maxMonth; m++) {
    const rng = seededRng(year * 12 + m);
    const growth = 1 + (year - 2020) * 0.12;
    const seasonal = 1 + Math.sin((m / 12) * Math.PI * 2) * 0.15;
    monthlyRevenue.push({
      month: MONTHS[m],
      year,
      revenue: Math.round(baseRevenue * growth * seasonal * (0.9 + rng() * 0.2)),
      shipments: Math.round(120 * growth * seasonal * (0.85 + rng() * 0.3)),
    });
  }
}

// ─── Derived lookups ─────────────────────────────────────────────────────────
export const supplierMap = Object.fromEntries(suppliers.map((s) => [s.id, s]));
export const facilityMap = Object.fromEntries(facilities.map((f) => [f.id, f]));
export const productMap = Object.fromEntries(products.map((p) => [p.id, p]));

// ─── Dashboard KPI helpers ────────────────────────────────────────────────────
export function getDashboardStats() {
  const totalRevenue = shipments.reduce((sum, s) => sum + s.value, 0);
  const activeSuppliers = suppliers.filter((s) => s.status === "active").length;
  const activeFacilities = facilities.filter((f) => f.status === "active").length;
  const onTimeShipments = shipments.filter((s) => s.status === "delivered").length;
  const totalShipments = shipments.length;
  const onTimeRate = (onTimeShipments / totalShipments) * 100;
  const avgUtilization =
    facilities.reduce((sum, f) => sum + f.utilization, 0) / facilities.length;

  return {
    totalRevenue,
    activeSuppliers,
    activeFacilities,
    onTimeRate,
    onTimeShipments,
    avgUtilization,
    totalShipments,
    inTransit: shipments.filter((s) => s.status === "in_transit").length,
    delayed: shipments.filter((s) => s.status === "delayed").length,
  };
}

export function getRevenueByCategory() {
  const map: Record<string, number> = {};
  products.forEach((p) => {
    const shipmentsForProduct = shipments.filter((s) => s.productId === p.id);
    const rev = shipmentsForProduct.reduce((sum, s) => sum + s.value, 0);
    map[p.category] = (map[p.category] ?? 0) + rev;
  });
  return Object.entries(map)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
}

export function getShipmentsByStatus() {
  const map: Record<string, number> = {};
  shipments.forEach((s) => {
    map[s.status] = (map[s.status] ?? 0) + 1;
  });
  return Object.entries(map).map(([name, value]) => ({ name, value }));
}

export function getTopFacilitiesByRevenue(limit = 8) {
  return [...facilities]
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, limit)
    .map((f) => ({ name: f.name.split(" ").slice(0, 2).join(" "), revenue: f.revenue }));
}

export function getShipmentTrend() {
  const last12 = monthlyRevenue
    .filter((m) => !(m.year === 2026 && m.month === "Mar"))
    .slice(-13);
  return last12;
}

export function getSuppliersByTier() {
  const map: Record<string, number> = {};
  suppliers.forEach((s) => { map[s.tier] = (map[s.tier] ?? 0) + 1; });
  return ["Tier 1", "Tier 2", "Tier 3"].map((t) => ({ name: t, value: map[t] ?? 0 }));
}

export function getFacilitiesByType() {
  const map: Record<string, number> = {};
  facilities.forEach((f) => { map[f.type] = (map[f.type] ?? 0) + 1; });
  return Object.entries(map).map(([name, value]) => ({ name, value }));
}

export function getFacilitiesByRegion() {
  const map: Record<string, number> = {};
  facilities.forEach((f) => { map[f.location.region] = (map[f.location.region] ?? 0) + 1; });
  return Object.entries(map)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
}

export function getProductVolumeTrend() {
  // Aggregate shipment quantities by month/year
  const map: Record<string, number> = {};
  shipments.forEach((s) => {
    const d = new Date(s.shippedAt);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    map[key] = (map[key] ?? 0) + s.quantity;
  });
  return Object.entries(map)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, volume]) => {
      const [year, month] = key.split("-");
      const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
      return { label: `${MONTHS[parseInt(month) - 1]} '${year.slice(2)}`, volume, key };
    });
}

export function getShipmentsFilteredByDate(start: string, end: string) {
  const s = new Date(start).getTime();
  const e = new Date(end).getTime();
  return shipments.filter((sh) => {
    const t = new Date(sh.shippedAt).getTime();
    return t >= s && t <= e;
  });
}

export function getMonthlyRevenueFiltered(start: string, end: string) {
  const ds = new Date(start);
  const de = new Date(end);
  const y0 = ds.getFullYear();
  const y1 = de.getFullYear();
  if (Number.isNaN(y0) || Number.isNaN(y1)) return [];
  const sy = Math.min(y0, y1);
  const ey = Math.max(y0, y1);
  return monthlyRevenue.filter((m) => m.year >= sy && m.year <= ey);
}

// All unique regions across facilities and suppliers
export const ALL_REGIONS = Array.from(
  new Set([
    ...facilities.map((f) => f.location.region),
    ...suppliers.map((s) => s.region),
  ])
).sort();

export const ALL_CATEGORIES = Array.from(new Set(products.map((p) => p.category))).sort();
export const ALL_STATUSES   = Array.from(new Set(shipments.map((s) => s.status))).sort();

// ─── Carbon per cycle phase (kg CO₂e %) ──────────────────────────────────────
// Industry-representative breakdown of supply chain carbon footprint by phase.
export const CARBON_BY_PHASE = [
  { name: "Manufacturing",    value: 38 },
  { name: "Transportation",   value: 27 },
  { name: "Raw Materials",    value: 17 },
  { name: "Warehousing",      value: 9  },
  { name: "Last-Mile",        value: 6  },
  { name: "Returns",          value: 3  },
];
