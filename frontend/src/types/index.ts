export type UserRole = 'admin' | 'manager' | 'user';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export type ProjectStatus = 'planning' | 'active' | 'on_hold' | 'completed';

export interface Project {
  _id: string;
  code: string;
  name: string;
  description?: string;
  location: string;
  status: ProjectStatus;
  budget: number;
  startDate: string;
  expectedEndDate?: string;
  actualEndDate?: string;
  manager?: {
    _id: string;
    name: string;
    email: string;
  } | string;
  createdAt?: string;
  updatedAt?: string;
}

export type MaterialCategory =
  | 'cement'
  | 'steel'
  | 'aggregate'
  | 'chemical'
  | 'pipe'
  | 'valve'
  | 'electrical'
  | 'other';

export type MaterialUnit =
  | 'kg'
  | 'ton'
  | 'litre'
  | 'metre'
  | 'piece'
  | 'bag'
  | 'cubic_metre'
  | 'sq_metre';

export interface Material {
  _id: string;
  code: string;
  name: string;
  category: MaterialCategory;
  unit: MaterialUnit;
  hsnCode?: string;
  reorderLevel: number;
  description?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Supplier {
  _id: string;
  code: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  gstNumber?: string;
  materialsSupplied: Array<{
    _id: string;
    name: string;
    code: string;
    unit: string;
  } | string>;
  rating: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export type PurchaseOrderStatus =
  | 'draft'
  | 'approved'
  | 'partially_received'
  | 'received'
  | 'cancelled';

export interface POItem {
  _id?: string;
  material: {
    _id: string;
    name: string;
    code: string;
    unit: string;
  } | string;
  quantity: number;
  unitPrice: number;
  totalPrice?: number;
  receivedQuantity?: number;
}

export interface PurchaseOrder {
  _id: string;
  poNumber: string;
  project: {
    _id: string;
    name: string;
    code: string;
  } | string;
  supplier: {
    _id: string;
    name: string;
    code: string;
  } | string;
  items: POItem[];
  totalAmount: number;
  status: PurchaseOrderStatus;
  orderDate: string;
  expectedDelivery?: string;
  notes?: string;
  createdBy?: {
    _id: string;
    name: string;
  } | string;
  createdAt?: string;
  updatedAt?: string;
}

export interface InventoryItem {
  _id: string;
  project: {
    _id: string;
    name: string;
    code: string;
  } | string;
  material: {
    _id: string;
    name: string;
    code: string;
    unit: string;
    category: MaterialCategory;
    reorderLevel: number;
  };
  currentStock: number;
  lastUpdated?: string;
}

export type TransactionType = 'RECEIVE' | 'ISSUE' | 'RETURN';

export interface InventoryTransaction {
  _id: string;
  project: {
    _id: string;
    name: string;
    code: string;
  } | string;
  material: {
    _id: string;
    name: string;
    code: string;
    unit: string;
  } | string;
  type: TransactionType;
  quantity: number;
  balanceAfter: number;
  referenceType?: 'PO' | 'SITE_ISSUE' | 'SITE_RETURN' | 'MANUAL';
  referenceId?: string;
  performedBy?: {
    _id: string;
    name: string;
  } | string;
  notes?: string;
  createdAt: string;
}

export type WasteReason =
  | 'damaged'
  | 'expired'
  | 'spillage'
  | 'defective'
  | 'overuse'
  | 'natural_loss'
  | 'other';

export interface WasteRecord {
  _id: string;
  project: {
    _id: string;
    name: string;
    code: string;
  } | string;
  material: {
    _id: string;
    name: string;
    code: string;
    unit: string;
  } | string;
  quantity: number;
  reason: WasteReason;
  costImpact: number;
  reportedBy?: {
    _id: string;
    name: string;
  } | string;
  incidentDate: string;
  description?: string;
  createdAt?: string;
}

export interface ConsumptionPlan {
  _id: string;
  project: {
    _id: string;
    name: string;
    code: string;
  } | string;
  material: {
    _id: string;
    name: string;
    code: string;
    unit: string;
  } | string;
  period: string; // e.g., '2026-Q1' or '2026-09'
  plannedQuantity: number;
  actualQuantity: number;
  plannedUnitCost: number;
  actualUnitCost: number;
  totalPlannedCost?: number;
  totalActualCost?: number;
  costVariance?: number;
  quantityVariance?: number;
  notes?: string;
  createdAt?: string;
}

export interface DashboardSummary {
  activeProjectsCount: number;
  totalStockValue: number;
  lowStockCount: number;
  pendingPOCount: number;
  monthlyWasteCost: number;
  costVariance: number;
  recentPurchaseOrders: PurchaseOrder[];
  recentWasteRecords: WasteRecord[];
  lowStockItems: InventoryItem[];
  stockByCategory?: { category: string; value: number }[];
}

export interface ABCAnalysisItem {
  materialId: string;
  materialName: string;
  materialCode: string;
  annualConsumptionValue: number;
  cumulativePercentage: number;
  classification: 'A' | 'B' | 'C';
}

export interface SDEAnalysisItem {
  materialId: string;
  materialName: string;
  category: string;
  scarcity: 'Scarce' | 'Difficult' | 'Easy';
  classification: 'SD' | 'SE' | 'DN' | 'NE';
  supplierCount: number;
}

export interface EOQAnalysisItem {
  materialId: string;
  materialName: string;
  annualDemand: number;
  orderingCost: number;
  holdingCost: number;
  eoq: number;
  totalAnnualCost: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    pages?: number;
  };
}
