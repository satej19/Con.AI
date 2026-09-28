"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateStatus = exports.updateRole = exports.listUsers = exports.getMe = exports.login = exports.register = void 0;
const ApiResponse_1 = require("../utils/ApiResponse");
const auth_service_1 = require("../services/auth.service");
const register = async (req, res) => {
    const input = req.body;
    const result = await (0, auth_service_1.registerUser)(input);
    ApiResponse_1.ApiResponse.success(res, 201, 'User registered successfully', result);
};
exports.register = register;
const login = async (req, res) => {
    const input = req.body;
    const result = await (0, auth_service_1.loginUser)(input);
    ApiResponse_1.ApiResponse.success(res, 200, 'Login successful', result);
};
exports.login = login;
const getMe = async (req, res) => {
    if (!req.user) {
        throw new Error('User not authenticated');
    }
    const user = await (0, auth_service_1.getCurrentUser)(req.user.userId);
    ApiResponse_1.ApiResponse.success(res, 200, 'User profile retrieved', user);
};
exports.getMe = getMe;
const listUsers = async (_req, res) => {
    const users = await (0, auth_service_1.getAllUsers)();
    ApiResponse_1.ApiResponse.success(res, 200, 'Users retrieved successfully', users);
};
exports.listUsers = listUsers;
const updateRole = async (req, res) => {
    const { id } = req.params;
    if (typeof id !== 'string') {
        throw new Error('Invalid ID');
    }
    const input = req.body;
    const user = await (0, auth_service_1.updateUserRole)(id, input);
    ApiResponse_1.ApiResponse.success(res, 200, 'User role updated successfully', user);
};
exports.updateRole = updateRole;
const updateStatus = async (req, res) => {
    const { id } = req.params;
    if (typeof id !== 'string') {
        throw new Error('Invalid ID');
    }
    const input = req.body;
    const user = await (0, auth_service_1.updateUserStatus)(id, input);
    ApiResponse_1.ApiResponse.success(res, 200, 'User status updated successfully', user);
};
exports.updateStatus = updateStatus;
//# sourceMappingURL=auth.controller.js.map