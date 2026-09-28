export declare const USER_ROLES: {
    readonly ADMIN: 'admin';
    readonly MANAGER: 'manager';
    readonly ENGINEER: 'engineer';
    readonly STORE_KEEPER: 'store_keeper';
    readonly VIEWER: 'viewer';
};
export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];
export declare const PROJECT_STATUS: {
    readonly PLANNING: 'planning';
    readonly ACTIVE: 'active';
    readonly ON_HOLD: 'on_hold';
    readonly COMPLETED: 'completed';
};
export type ProjectStatus = typeof PROJECT_STATUS[keyof typeof PROJECT_STATUS];
export declare const MATERIAL_CATEGORY: {
    readonly CEMENT: 'cement';
    readonly STEEL: 'steel';
    readonly AGGREGATE: 'aggregate';
    readonly CHEMICAL: 'chemical';
    readonly PIPE: 'pipe';
    readonly VALVE: 'valve';
    readonly ELECTRICAL: 'electrical';
    readonly OTHER: 'other';
};
export type MaterialCategory = typeof MATERIAL_CATEGORY[keyof typeof MATERIAL_CATEGORY];
export declare const MATERIAL_UNIT: {
    readonly KG: 'kg';
    readonly TON: 'ton';
    readonly LITRE: 'litre';
    readonly METRE: 'metre';
    readonly PIECE: 'piece';
    readonly BAG: 'bag';
    readonly CUBIC_METRE: 'cubic_metre';
    readonly SQ_METRE: 'sq_metre';
};
export type MaterialUnit = typeof MATERIAL_UNIT[keyof typeof MATERIAL_UNIT];
export declare const PO_STATUS: {
    readonly DRAFT: 'draft';
    readonly APPROVED: 'approved';
    readonly PARTIALLY_RECEIVED: 'partially_received';
    readonly RECEIVED: 'received';
    readonly CANCELLED: 'cancelled';
};
export type POStatus = typeof PO_STATUS[keyof typeof PO_STATUS];
export declare const TRANSACTION_TYPE: {
    readonly RECEIVE: 'RECEIVE';
    readonly ISSUE: 'ISSUE';
    readonly RETURN: 'RETURN';
};
export type TransactionType = typeof TRANSACTION_TYPE[keyof typeof TRANSACTION_TYPE];
export declare const REFERENCE_TYPE: {
    readonly PURCHASE_ORDER: 'purchase_order';
    readonly MANUAL: 'manual';
    readonly WASTE_RETURN: 'waste_return';
};
export type ReferenceType = typeof REFERENCE_TYPE[keyof typeof REFERENCE_TYPE];
export declare const WASTE_REASON: {
    readonly DAMAGED: 'damaged';
    readonly EXPIRED: 'expired';
    readonly SPILLAGE: 'spillage';
    readonly DEFECTIVE: 'defective';
    readonly OVERUSE: 'overuse';
    readonly NATURAL_LOSS: 'natural_loss';
    readonly OTHER: 'other';
};
export type WasteReason = typeof WASTE_REASON[keyof typeof WASTE_REASON];
export declare const DEFAULT_PAGE = 1;
export declare const DEFAULT_LIMIT = 20;
export declare const MAX_LIMIT = 100;
//# sourceMappingURL=constants.d.ts.map