"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getById = exports.list = exports.create = void 0;
const ApiResponse_1 = require("../utils/ApiResponse");
const waste_service_1 = require("../services/waste.service");
const create = async (req, res) => {
    if (!req.user) {
        throw new Error('User not authenticated');
    }
    const input = req.body;
    const wasteRecord = await (0, waste_service_1.createWasteRecord)(input, req.user.userId);
    ApiResponse_1.ApiResponse.success(res, 201, 'Waste record created successfully', wasteRecord);
};
exports.create = create;
const list = async (req, res) => {
    const { wasteRecords, meta } = await (0, waste_service_1.getAllWasteRecords)(req.query);
    ApiResponse_1.ApiResponse.success(res, 200, 'Waste records retrieved successfully', wasteRecords, meta);
};
exports.list = list;
const getById = async (req, res) => {
    const { id } = req.params;
    if (typeof id !== 'string') {
        throw new Error('Invalid ID');
    }
    const wasteRecord = await (0, waste_service_1.getWasteRecordById)(id);
    ApiResponse_1.ApiResponse.success(res, 200, 'Waste record retrieved successfully', wasteRecord);
};
exports.getById = getById;
//# sourceMappingURL=waste.controller.js.map