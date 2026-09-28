"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProjectDashboard = exports.getSummary = void 0;
const ApiResponse_1 = require("../utils/ApiResponse");
const dashboard_service_1 = require("../services/dashboard.service");
const getSummary = async (req, res) => {
    const { projectId } = req.query;
    const summary = await (0, dashboard_service_1.getDashboardSummary)(projectId);
    ApiResponse_1.ApiResponse.success(res, 200, 'Dashboard summary retrieved successfully', summary);
};
exports.getSummary = getSummary;
const getProjectDashboard = async (req, res) => {
    const { projectId } = req.params;
    if (typeof projectId !== 'string') {
        throw new Error('Invalid project ID');
    }
    const dashboard = await (0, dashboard_service_1.getProjectDashboard)(projectId);
    ApiResponse_1.ApiResponse.success(res, 200, 'Project dashboard retrieved successfully', dashboard);
};
exports.getProjectDashboard = getProjectDashboard;
//# sourceMappingURL=dashboard.controller.js.map