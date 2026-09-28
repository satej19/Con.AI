"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const mongoose_1 = __importDefault(require("mongoose"));
const auth_routes_1 = __importDefault(require("./auth.routes"));
const project_routes_1 = __importDefault(require("./project.routes"));
const material_routes_1 = __importDefault(require("./material.routes"));
const supplier_routes_1 = __importDefault(require("./supplier.routes"));
const user_routes_1 = __importDefault(require("./user.routes"));
const purchaseOrder_routes_1 = __importDefault(require("./purchaseOrder.routes"));
const inventory_routes_1 = __importDefault(require("./inventory.routes"));
const waste_routes_1 = __importDefault(require("./waste.routes"));
const consumption_routes_1 = __importDefault(require("./consumption.routes"));
const analytics_routes_1 = __importDefault(require("./analytics.routes"));
const dashboard_routes_1 = __importDefault(require("./dashboard.routes"));
const router = (0, express_1.Router)();
// Health check endpoint
router.get('/health', (_req, res) => {
    const isDbConnected = mongoose_1.default.connection.readyState === 1;
    res.json({
        status: isDbConnected ? 'ok' : 'degraded',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        dbStatus: isDbConnected ? 'connected' : 'disconnected',
    });
});
// Mount sub-routers
router.use('/auth', auth_routes_1.default);
router.use('/users', user_routes_1.default);
router.use('/projects', project_routes_1.default);
router.use('/materials', material_routes_1.default);
router.use('/suppliers', supplier_routes_1.default);
router.use('/purchase-orders', purchaseOrder_routes_1.default);
router.use('/inventory', inventory_routes_1.default);
router.use('/waste', waste_routes_1.default);
router.use('/consumption-plans', consumption_routes_1.default);
router.use('/analytics', analytics_routes_1.default);
router.use('/dashboard', dashboard_routes_1.default);
exports.default = router;
//# sourceMappingURL=index.js.map