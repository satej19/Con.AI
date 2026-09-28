"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getReport = exports.getVariance = exports.update = exports.getById = exports.list = exports.create = void 0;
const ApiResponse_1 = require("../utils/ApiResponse");
const consumption_service_1 = require("../services/consumption.service");
const create = async (req, res) => {
    if (!req.user) {
        throw new Error('User not authenticated');
    }
    const input = req.body;
    const consumptionPlan = await (0, consumption_service_1.createConsumptionPlan)(input, req.user.userId);
    ApiResponse_1.ApiResponse.success(res, 201, 'Consumption plan created successfully', consumptionPlan);
};
exports.create = create;
const list = async (req, res) => {
    const { consumptionPlans, meta } = await (0, consumption_service_1.getAllConsumptionPlans)(req.query);
    ApiResponse_1.ApiResponse.success(res, 200, 'Consumption plans retrieved successfully', consumptionPlans, meta);
};
exports.list = list;
const getById = async (req, res) => {
    const { id } = req.params;
    if (typeof id !== 'string') {
        throw new Error('Invalid ID');
    }
    const consumptionPlan = await (0, consumption_service_1.getConsumptionPlanById)(id);
    ApiResponse_1.ApiResponse.success(res, 200, 'Consumption plan retrieved successfully', consumptionPlan);
};
exports.getById = getById;
const update = async (req, res) => {
    const { id } = req.params;
    if (typeof id !== 'string') {
        throw new Error('Invalid ID');
    }
    const input = req.body;
    const consumptionPlan = await (0, consumption_service_1.updateConsumptionPlan)(id, input);
    ApiResponse_1.ApiResponse.success(res, 200, 'Consumption plan updated successfully', consumptionPlan);
};
exports.update = update;
const getVariance = async (req, res) => {
    const { id } = req.params;
    if (typeof id !== 'string') {
        throw new Error('Invalid ID');
    }
    const consumptionPlan = await (0, consumption_service_1.getVarianceAnalysis)(id);
    ApiResponse_1.ApiResponse.success(res, 200, 'Variance analysis retrieved successfully', consumptionPlan);
};
exports.getVariance = getVariance;
const getReport = async (req, res) => {
    const { projectId, period } = req.query;
    if (!projectId || typeof projectId !== 'string') {
        throw new Error('Project ID is required');
    }
    const report = await (0, consumption_service_1.getVarianceReport)(projectId, period);
    ApiResponse_1.ApiResponse.success(res, 200, 'Variance report retrieved successfully', report);
};
exports.getReport = getReport;
//# sourceMappingURL=consumption.controller.js.map