"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cancel = exports.receive = exports.approve = exports.update = exports.getById = exports.list = exports.create = void 0;
const ApiResponse_1 = require("../utils/ApiResponse");
const purchaseOrder_service_1 = require("../services/purchaseOrder.service");
const create = async (req, res) => {
    if (!req.user) {
        throw new Error('User not authenticated');
    }
    const input = req.body;
    const purchaseOrder = await (0, purchaseOrder_service_1.createPurchaseOrder)(input, req.user.userId);
    ApiResponse_1.ApiResponse.success(res, 201, 'Purchase order created successfully', purchaseOrder);
};
exports.create = create;
const list = async (req, res) => {
    const query = req.query;
    const { purchaseOrders, meta } = await (0, purchaseOrder_service_1.getAllPurchaseOrders)(query);
    ApiResponse_1.ApiResponse.success(res, 200, 'Purchase orders retrieved successfully', purchaseOrders, meta);
};
exports.list = list;
const getById = async (req, res) => {
    const { id } = req.params;
    const purchaseOrder = await (0, purchaseOrder_service_1.getPurchaseOrderById)(id);
    ApiResponse_1.ApiResponse.success(res, 200, 'Purchase order retrieved successfully', purchaseOrder);
};
exports.getById = getById;
const update = async (req, res) => {
    const { id } = req.params;
    const input = req.body;
    const purchaseOrder = await (0, purchaseOrder_service_1.updatePurchaseOrder)(id, input);
    ApiResponse_1.ApiResponse.success(res, 200, 'Purchase order updated successfully', purchaseOrder);
};
exports.update = update;
const approve = async (req, res) => {
    if (!req.user) {
        throw new Error('User not authenticated');
    }
    const { id } = req.params;
    const purchaseOrder = await (0, purchaseOrder_service_1.approvePurchaseOrder)(id, req.user.userId);
    ApiResponse_1.ApiResponse.success(res, 200, 'Purchase order approved successfully', purchaseOrder);
};
exports.approve = approve;
const receive = async (req, res) => {
    if (!req.user) {
        throw new Error('User not authenticated');
    }
    const { id } = req.params;
    const input = req.body;
    const purchaseOrder = await (0, purchaseOrder_service_1.receiveGoods)(id, input, req.user.userId);
    ApiResponse_1.ApiResponse.success(res, 200, 'Goods received and inventory updated successfully', purchaseOrder);
};
exports.receive = receive;
const cancel = async (req, res) => {
    const { id } = req.params;
    const purchaseOrder = await (0, purchaseOrder_service_1.cancelPurchaseOrder)(id);
    ApiResponse_1.ApiResponse.success(res, 200, 'Purchase order cancelled successfully', purchaseOrder);
};
exports.cancel = cancel;
//# sourceMappingURL=purchaseOrder.controller.js.map