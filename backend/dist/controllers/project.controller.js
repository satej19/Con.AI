"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.update = exports.getById = exports.list = exports.create = void 0;
const ApiResponse_1 = require("../utils/ApiResponse");
const project_service_1 = require("../services/project.service");
const create = async (req, res) => {
    const input = req.body;
    const project = await (0, project_service_1.createProject)(input);
    ApiResponse_1.ApiResponse.success(res, 201, 'Project created successfully', project);
};
exports.create = create;
const list = async (req, res) => {
    const query = req.query;
    const { projects, meta } = await (0, project_service_1.getProjects)(query);
    ApiResponse_1.ApiResponse.success(res, 200, 'Projects retrieved successfully', projects, meta);
};
exports.list = list;
const getById = async (req, res) => {
    const { id } = req.params;
    const project = await (0, project_service_1.getProjectById)(id);
    ApiResponse_1.ApiResponse.success(res, 200, 'Project retrieved successfully', project);
};
exports.getById = getById;
const update = async (req, res) => {
    const { id } = req.params;
    const input = req.body;
    const project = await (0, project_service_1.updateProject)(id, input);
    ApiResponse_1.ApiResponse.success(res, 200, 'Project updated successfully', project);
};
exports.update = update;
//# sourceMappingURL=project.controller.js.map