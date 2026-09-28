"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.update = exports.getById = exports.list = exports.create = void 0;
const ApiResponse_1 = require("../utils/ApiResponse");
const supplier_service_1 = require("../services/supplier.service");
const create = async (req, res) => {
    const input = req.body;
    const supplier = await (0, supplier_service_1.createSupplier)(input);
    ApiResponse_1.ApiResponse.success(res, 201, 'Supplier created successfully', supplier);
};
exports.create = create;
const list = async (req, res) => {
    const query = req.query;
    const { suppliers, meta } = await (0, supplier_service_1.getAllSuppliers)(query);
    ApiResponse_1.ApiResponse.success(res, 200, 'Suppliers retrieved successfully', suppliers, meta);
};
exports.list = list;
const getById = async (req, res) => {
    const { id } = req.params;
    const supplier = await (0, supplier_service_1.getSupplierById)(id);
    ApiResponse_1.ApiResponse.success(res, 200, 'Supplier retrieved successfully', supplier);
};
exports.getById = getById;
const update = async (req, res) => {
    const { id } = req.params;
    const input = req.body;
    const supplier = await (0, supplier_service_1.updateSupplier)(id, input);
    ApiResponse_1.ApiResponse.success(res, 200, 'Supplier updated successfully', supplier);
};
exports.update = update;
//# sourceMappingURL=supplier.controller.js.map