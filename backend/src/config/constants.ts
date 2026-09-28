// User Roles
export const USER_ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  ENGINEER: 'engineer',
  STORE_KEEPER: 'store_keeper',
  VIEWER: 'viewer',
} as const;

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];

// Project Status
export const PROJECT_STATUS = {
  PLANNING: 'planning',
  ACTIVE: 'active',
  ON_HOLD: 'on_hold',
  COMPLETED: 'completed',
} as const;

export type ProjectStatus = typeof PROJECT_STATUS[keyof typeof PROJECT_STATUS];

// Material Category
export const MATERIAL_CATEGORY = {
  CEMENT: 'cement',
  STEEL: 'steel',
  AGGREGATE: 'aggregate',
  CHEMICAL: 'chemical',
  PIPE: 'pipe',
  VALVE: 'valve',
  ELECTRICAL: 'electrical',
  OTHER: 'other',
} as const;

export type MaterialCategory = typeof MATERIAL_CATEGORY[keyof typeof MATERIAL_CATEGORY];

// Material Unit
export const MATERIAL_UNIT = {
  KG: 'kg',
  TON: 'ton',
  LITRE: 'litre',
  METRE: 'metre',
  PIECE: 'piece',
  BAG: 'bag',
  CUBIC_METRE: 'cubic_metre',
  SQ_METRE: 'sq_metre',
} as const;

export type MaterialUnit = typeof MATERIAL_UNIT[keyof typeof MATERIAL_UNIT];

// Purchase Order Status
export const PO_STATUS = {
  DRAFT: 'draft',
  APPROVED: 'approved',
  PARTIALLY_RECEIVED: 'partially_received',
  RECEIVED: 'received',
  CANCELLED: 'cancelled',
} as const;

export type POStatus = typeof PO_STATUS[keyof typeof PO_STATUS];

// Inventory Transaction Type
export const TRANSACTION_TYPE = {
  RECEIVE: 'RECEIVE',
  ISSUE: 'ISSUE',
  RETURN: 'RETURN',
} as const;

export type TransactionType = typeof TRANSACTION_TYPE[keyof typeof TRANSACTION_TYPE];

// Transaction Reference Type
export const REFERENCE_TYPE = {
  PURCHASE_ORDER: 'purchase_order',
  MANUAL: 'manual',
  WASTE_RETURN: 'waste_return',
} as const;

export type ReferenceType = typeof REFERENCE_TYPE[keyof typeof REFERENCE_TYPE];

// Waste Reason
export const WASTE_REASON = {
  DAMAGED: 'damaged',
  EXPIRED: 'expired',
  SPILLAGE: 'spillage',
  DEFECTIVE: 'defective',
  OVERUSE: 'overuse',
  NATURAL_LOSS: 'natural_loss',
  OTHER: 'other',
} as const;

export type WasteReason = typeof WASTE_REASON[keyof typeof WASTE_REASON];

// Pagination Defaults
export const DEFAULT_PAGE = 1;
export const DEFAULT_LIMIT = 20;
export const MAX_LIMIT = 100;
