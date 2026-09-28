"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MAX_LIMIT = exports.DEFAULT_LIMIT = exports.DEFAULT_PAGE = exports.WASTE_REASON = exports.REFERENCE_TYPE = exports.TRANSACTION_TYPE = exports.PO_STATUS = exports.MATERIAL_UNIT = exports.MATERIAL_CATEGORY = exports.PROJECT_STATUS = exports.USER_ROLES = void 0;
// User Roles
exports.USER_ROLES = {
    ADMIN: 'admin',
    MANAGER: 'manager',
    ENGINEER: 'engineer',
    STORE_KEEPER: 'store_keeper',
    VIEWER: 'viewer',
};
// Project Status
exports.PROJECT_STATUS = {
    PLANNING: 'planning',
    ACTIVE: 'active',
    ON_HOLD: 'on_hold',
    COMPLETED: 'completed',
};
// Material Category
exports.MATERIAL_CATEGORY = {
    CEMENT: 'cement',
    STEEL: 'steel',
    AGGREGATE: 'aggregate',
    CHEMICAL: 'chemical',
    PIPE: 'pipe',
    VALVE: 'valve',
    ELECTRICAL: 'electrical',
    OTHER: 'other',
};
// Material Unit
exports.MATERIAL_UNIT = {
    KG: 'kg',
    TON: 'ton',
    LITRE: 'litre',
    METRE: 'metre',
    PIECE: 'piece',
    BAG: 'bag',
    CUBIC_METRE: 'cubic_metre',
    SQ_METRE: 'sq_metre',
};
// Purchase Order Status
exports.PO_STATUS = {
    DRAFT: 'draft',
    APPROVED: 'approved',
    PARTIALLY_RECEIVED: 'partially_received',
    RECEIVED: 'received',
    CANCELLED: 'cancelled',
};
// Inventory Transaction Type
exports.TRANSACTION_TYPE = {
    RECEIVE: 'RECEIVE',
    ISSUE: 'ISSUE',
    RETURN: 'RETURN',
};
// Transaction Reference Type
exports.REFERENCE_TYPE = {
    PURCHASE_ORDER: 'purchase_order',
    MANUAL: 'manual',
    WASTE_RETURN: 'waste_return',
};
// Waste Reason
exports.WASTE_REASON = {
    DAMAGED: 'damaged',
    EXPIRED: 'expired',
    SPILLAGE: 'spillage',
    DEFECTIVE: 'defective',
    OVERUSE: 'overuse',
    NATURAL_LOSS: 'natural_loss',
    OTHER: 'other',
};
// Pagination Defaults
exports.DEFAULT_PAGE = 1;
exports.DEFAULT_LIMIT = 20;
exports.MAX_LIMIT = 100;
//# sourceMappingURL=constants.js.map