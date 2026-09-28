"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.update = exports.getById = exports.list = exports.create = void 0;
const ApiResponse_1 = require("../utils/ApiResponse");
const material_service_1 = require("../services/material.service");
const create = async (req, res) => {
    const input = req.body;
    const material = await (0, material_service_1.createMaterial)(input);
    ApiResponse_1.ApiResponse.success(res, 201, 'Material created successfully', material);
};
exports.create = create;
const list = async (req, res) => {
    const { materials, meta } = await (0, material_service_1.getAllMaterials)(req.query);
    ApiResponse_1.ApiResponse.success(res, 200, 'Materials retrieved successfully', materials, meta);
};
exports.list = list;
const getById = async (req, res) => {
    const { id } = req.params;
    if (typeof id !== 'string') {
        throw new Error('Invalid ID');
    }
    const material = await (0, material_service_1.getMaterialById)(id);
    ApiResponse_1.ApiResponse.success(res, 200, 'Material retrieved successfully', material);
};
exports.getById = getById;
const update = async (req, res) => {
    const { id } = req.params;
    if (typeof id !== 'string') {
        throw new Error('Invalid ID');
    }
    const input = req.body;
    const material = await (0, material_service_1.updateMaterial)(id, input);
    ApiResponse_1.ApiResponse.success(res, 200, 'Material updated successfully', material);
};
exports.update = update;
//# sourceMappingURL=material.controller.js.map