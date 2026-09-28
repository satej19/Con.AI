"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEOQ = exports.getSDE = exports.getABC = exports.getCost = void 0;
const ApiResponse_1 = require("../utils/ApiResponse");
const analytics_service_1 = require("../services/analytics.service");
const getCost = async (req, res) => {
    const { projectId, startDate, endDate } = req.query;
    if (!projectId || typeof projectId !== 'string') {
        throw new Error('Project ID is required');
    }
    const analysis = await (0, analytics_service_1.getCostAnalysis)(projectId, startDate, endDate);
    ApiResponse_1.ApiResponse.success(res, 200, 'Cost analysis retrieved successfully', analysis);
};
exports.getCost = getCost;
const getABC = async (req, res) => {
    const { projectId } = req.query;
    if (!projectId || typeof projectId !== 'string') {
        throw new Error('Project ID is required');
    }
    const classification = await (0, analytics_service_1.getABCClassification)(projectId);
    ApiResponse_1.ApiResponse.success(res, 200, 'ABC classification retrieved successfully', classification);
};
exports.getABC = getABC;
const getSDE = async (req, res) => {
    const { projectId } = req.query;
    if (!projectId || typeof projectId !== 'string') {
        throw new Error('Project ID is required');
    }
    const classification = await (0, analytics_service_1.getSDEClassification)(projectId);
    ApiResponse_1.ApiResponse.success(res, 200, 'SDE classification retrieved successfully', classification);
};
exports.getSDE = getSDE;
const getEOQ = async (req, res) => {
    const { projectId } = req.query;
    if (!projectId || typeof projectId !== 'string') {
        throw new Error('Project ID is required');
    }
    const analysis = await (0, analytics_service_1.getEOQAnalysis)(projectId);
    ApiResponse_1.ApiResponse.success(res, 200, 'EOQ analysis retrieved successfully', analysis);
};
exports.getEOQ = getEOQ;
//# sourceMappingURL=analytics.controller.js.map