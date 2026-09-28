"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProject = exports.getProjectById = exports.getProjects = exports.createProject = void 0;
const Project_model_1 = __importDefault(require("../models/Project.model"));
const User_model_1 = __importDefault(require("../models/User.model"));
const constants_1 = require("../config/constants");
const AppError_1 = require("../utils/AppError");
const pagination_1 = require("../utils/pagination");
const VALID_STATUS_TRANSITIONS = {
    [constants_1.PROJECT_STATUS.PLANNING]: [constants_1.PROJECT_STATUS.PLANNING, constants_1.PROJECT_STATUS.ACTIVE],
    [constants_1.PROJECT_STATUS.ACTIVE]: [constants_1.PROJECT_STATUS.ACTIVE, constants_1.PROJECT_STATUS.ON_HOLD, constants_1.PROJECT_STATUS.COMPLETED],
    [constants_1.PROJECT_STATUS.ON_HOLD]: [constants_1.PROJECT_STATUS.ON_HOLD, constants_1.PROJECT_STATUS.ACTIVE],
    [constants_1.PROJECT_STATUS.COMPLETED]: [constants_1.PROJECT_STATUS.COMPLETED],
};
const createProject = async (input) => {
    const existingProject = await Project_model_1.default.findOne({ code: input.code });
    if (existingProject) {
        throw new AppError_1.AppError(`Project with code '${input.code}' already exists`, 409);
    }
    const manager = await User_model_1.default.findById(input.managerId);
    if (!manager) {
        throw new AppError_1.AppError('Assigned project manager does not exist', 404);
    }
    const actualEndDate = input.status === constants_1.PROJECT_STATUS.COMPLETED ? new Date() : null;
    const project = new Project_model_1.default({
        name: input.name,
        code: input.code,
        description: input.description,
        location: input.location,
        status: input.status,
        startDate: input.startDate,
        expectedEndDate: input.expectedEndDate,
        actualEndDate,
        budget: input.budget,
        managerId: manager._id,
    });
    await project.save();
    await project.populate('managerId', 'name email role');
    return project;
};
exports.createProject = createProject;
const getProjects = async (query) => {
    const { page, limit, skip } = (0, pagination_1.parsePagination)(query);
    const filter = {};
    if (query.status) {
        filter['status'] = query.status;
    }
    const [projects, total] = await Promise.all([
        Project_model_1.default.find(filter)
            .populate('managerId', 'name email role')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit),
        Project_model_1.default.countDocuments(filter),
    ]);
    const meta = (0, pagination_1.buildPaginationMeta)(page, limit, total);
    return { projects, meta };
};
exports.getProjects = getProjects;
const getProjectById = async (id) => {
    const project = await Project_model_1.default.findById(id).populate('managerId', 'name email role');
    if (!project) {
        throw new AppError_1.AppError('Project not found', 404);
    }
    return project;
};
exports.getProjectById = getProjectById;
const updateProject = async (id, input) => {
    const project = await Project_model_1.default.findById(id);
    if (!project) {
        throw new AppError_1.AppError('Project not found', 404);
    }
    // Business Rule 2: Status transitions
    if (input.status && input.status !== project.status) {
        const allowed = VALID_STATUS_TRANSITIONS[project.status] || [];
        if (!allowed.includes(input.status)) {
            throw new AppError_1.AppError(`Invalid status transition from '${project.status}' to '${input.status}'`, 400);
        }
        project.status = input.status;
    }
    // Business Rule 3: Setting status to completed auto-fills actualEndDate
    if (project.status === constants_1.PROJECT_STATUS.COMPLETED) {
        if (input.actualEndDate !== undefined) {
            project.actualEndDate = input.actualEndDate;
        }
        else if (!project.actualEndDate) {
            project.actualEndDate = new Date();
        }
    }
    else if (input.actualEndDate !== undefined) {
        project.actualEndDate = input.actualEndDate;
    }
    // Manager verification
    if (input.managerId && input.managerId !== project.managerId.toString()) {
        const manager = await User_model_1.default.findById(input.managerId);
        if (!manager) {
            throw new AppError_1.AppError('Assigned project manager does not exist', 404);
        }
        project.managerId = manager._id;
    }
    if (input.name !== undefined)
        project.name = input.name;
    if (input.description !== undefined)
        project.description = input.description;
    if (input.location !== undefined)
        project.location = input.location;
    if (input.startDate !== undefined)
        project.startDate = input.startDate;
    if (input.expectedEndDate !== undefined)
        project.expectedEndDate = input.expectedEndDate;
    if (input.budget !== undefined)
        project.budget = input.budget;
    await project.save();
    return project.populate('managerId', 'name email role');
};
exports.updateProject = updateProject;
//# sourceMappingURL=project.service.js.map