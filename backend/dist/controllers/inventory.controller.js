"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listTransactions = exports.returnMaterial = exports.issue = exports.getById = exports.list = void 0;
const ApiResponse_1 = require("../utils/ApiResponse");
const inventory_service_1 = require("../services/inventory.service");
const list = async (req, res) => {
    const { inventory, meta } = await (0, inventory_service_1.getAllInventory)(req.query);
    ApiResponse_1.ApiResponse.success(res, 200, 'Inventory retrieved successfully', inventory, meta);
};
exports.list = list;
const getById = async (req, res) => {
    const { id } = req.params;
    if (typeof id !== 'string') {
        throw new Error('Invalid ID');
    }
    const inventory = await (0, inventory_service_1.getInventoryById)(id);
    ApiResponse_1.ApiResponse.success(res, 200, 'Inventory retrieved successfully', inventory);
};
exports.getById = getById;
const issue = async (req, res) => {
    if (!req.user) {
        throw new Error('User not authenticated');
    }
    const input = req.body;
    const inventory = await (0, inventory_service_1.issueMaterial)(input, req.user.userId);
    ApiResponse_1.ApiResponse.success(res, 200, 'Material issued successfully', inventory);
};
exports.issue = issue;
const returnMaterial = async (req, res) => {
    if (!req.user) {
        throw new Error('User not authenticated');
    }
    const input = req.body;
    const inventory = await (0, inventory_service_1.returnMaterial)(input, req.user.userId);
    ApiResponse_1.ApiResponse.success(res, 200, 'Material returned successfully', inventory);
};
exports.returnMaterial = returnMaterial;
const listTransactions = async (req, res) => {
    const { transactions, meta } = await (0, inventory_service_1.getTransactions)(req.query);
    ApiResponse_1.ApiResponse.success(res, 200, 'Transactions retrieved successfully', transactions, meta);
};
exports.listTransactions = listTransactions;
//# sourceMappingURL=inventory.controller.js.map