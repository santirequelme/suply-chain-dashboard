// ─── Status Types ────────────────────────────────────────────────────────────

export const FACILITY_STATUS = {
  ACTIVE: "active",
  INACTIVE: "inactive",
  MAINTENANCE: "maintenance",
} as const;
export type FacilityStatus = (typeof FACILITY_STATUS)[keyof typeof FACILITY_STATUS];

export const FACILITY_TYPE = {
  MANUFACTURING: "Manufacturing",
  WAREHOUSE: "Warehouse",
  DISTRIBUTION: "Distribution",
  ASSEMBLY: "Assembly",
} as const;
export type FacilityType = (typeof FACILITY_TYPE)[keyof typeof FACILITY_TYPE];

export const SUPPLIER_STATUS = {
  ACTIVE: "active",
  INACTIVE: "inactive",
  ON_HOLD: "on_hold",
} as const;
export type SupplierStatus = (typeof SUPPLIER_STATUS)[keyof typeof SUPPLIER_STATUS];

export const SUPPLIER_TIER = {
  TIER_1: "Tier 1",
  TIER_2: "Tier 2",
  TIER_3: "Tier 3",
} as const;
export type SupplierTier = (typeof SUPPLIER_TIER)[keyof typeof SUPPLIER_TIER];

export const PRODUCT_STATUS = {
  IN_STOCK: "in_stock",
  LOW_STOCK: "low_stock",
  OUT_OF_STOCK: "out_of_stock",
  DISCONTINUED: "discontinued",
} as const;
export type ProductStatus = (typeof PRODUCT_STATUS)[keyof typeof PRODUCT_STATUS];

export const SHIPMENT_STATUS = {
  DELIVERED: "delivered",
  IN_TRANSIT: "in_transit",
  PENDING: "pending",
  DELAYED: "delayed",
  CANCELLED: "cancelled",
} as const;
export type ShipmentStatus = (typeof SHIPMENT_STATUS)[keyof typeof SHIPMENT_STATUS];

// ─── Entity Interfaces ────────────────────────────────────────────────────────

export interface FacilityLocation {
  country: string;
  region: string;
  city: string;
  lat: number;
  lng: number;
}

export interface Facility {
  id: string;
  name: string;
  type: FacilityType;
  status: FacilityStatus;
  location: FacilityLocation;
  capacity: number;
  utilization: number;
  employees: number;
  supplierId: string;
  revenue: number;
  createdAt: string;
}

export interface SupplierContact {
  name: string;
  email: string;
  phone: string;
}

export interface Supplier {
  id: string;
  name: string;
  country: string;
  region: string;
  category: string;
  tier: SupplierTier;
  status: SupplierStatus;
  rating: number;
  onTimeDelivery: number;
  defectRate: number;
  revenue: number;
  productsCount: number;
  contact: SupplierContact;
  createdAt: string;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  category: string;
  supplierId: string;
  facilityId: string;
  unitPrice: number;
  stock: number;
  demandMonthly: number;
  leadTimeDays: number;
  status: ProductStatus;
  weight: number;
  createdAt: string;
}

export interface Shipment {
  id: string;
  trackingNumber: string;
  productId: string;
  supplierId: string;
  originFacilityId: string;
  destinationFacilityId: string;
  status: ShipmentStatus;
  quantity: number;
  value: number;
  shippedAt: string;
  estimatedArrival: string;
  actualArrival: string | null;
  carrier: string;
}

// ─── Chart / Table helpers ────────────────────────────────────────────────────

export interface KpiMetric {
  label: string;
  value: string;
  subValue?: string;
  trend: number;
  trendLabel: string;
  icon: string;
  color: "brand" | "success" | "warning" | "danger";
}

export interface MonthlyRevenue {
  month: string;
  revenue: number;
  shipments: number;
  year: number;
}

export type SortDirection = "asc" | "desc";

export interface SortConfig {
  key: string;
  direction: SortDirection;
}

export interface PaginationState {
  page: number;
  pageSize: number;
}
