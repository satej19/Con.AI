"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUserStatus = exports.updateUserRole = exports.getAllUsers = exports.getCurrentUser = exports.loginUser = exports.registerUser = void 0;
const User_model_1 = __importDefault(require("../models/User.model"));
const password_1 = require("../utils/password");
const jwt_1 = require("../utils/jwt");
const AppError_1 = require("../utils/AppError");
const registerUser = async (input) => {
    const { name, email, password, role } = input;
    const existingUser = await User_model_1.default.findOne({ email });
    if (existingUser) {
        throw new AppError_1.AppError('Email already registered', 409);
    }
    const userCount = await User_model_1.default.countDocuments();
    const userRole = role || (userCount === 0 ? 'admin' : 'viewer');
    const hashedPassword = await (0, password_1.hashPassword)(password);
    const user = await User_model_1.default.create({
        name,
        email,
        password: hashedPassword,
        role: userRole,
    });
    const token = (0, jwt_1.signToken)({ userId: user._id.toString(), role: user.role });
    const userResponse = user.toObject();
    const { password: _, ...userWithoutPassword } = userResponse;
    return { user: userWithoutPassword, token };
};
exports.registerUser = registerUser;
const loginUser = async (input) => {
    const { email, password } = input;
    const user = await User_model_1.default.findOne({ email }).select('+password');
    if (!user) {
        throw new AppError_1.AppError('Invalid credentials', 401);
    }
    if (!user.isActive) {
        throw new AppError_1.AppError('Account is deactivated', 403);
    }
    const isPasswordValid = await (0, password_1.comparePassword)(password, user.password);
    if (!isPasswordValid) {
        throw new AppError_1.AppError('Invalid credentials', 401);
    }
    const token = (0, jwt_1.signToken)({ userId: user._id.toString(), role: user.role });
    const userResponse = user.toObject();
    const { password: _, ...userWithoutPassword } = userResponse;
    return { user: userWithoutPassword, token };
};
exports.loginUser = loginUser;
const getCurrentUser = async (userId) => {
    const user = await User_model_1.default.findById(userId);
    if (!user) {
        throw new AppError_1.AppError('User not found', 404);
    }
    const userResponse = user.toObject();
    const { password: _, ...userWithoutPassword } = userResponse;
    return userWithoutPassword;
};
exports.getCurrentUser = getCurrentUser;
const getAllUsers = async () => {
    const users = await User_model_1.default.find().select('-password');
    return users.map(user => user.toObject());
};
exports.getAllUsers = getAllUsers;
const updateUserRole = async (userId, input) => {
    const user = await User_model_1.default.findById(userId);
    if (!user) {
        throw new AppError_1.AppError('User not found', 404);
    }
    user.role = input.role;
    await user.save();
    const userResponse = user.toObject();
    const { password: _, ...userWithoutPassword } = userResponse;
    return userWithoutPassword;
};
exports.updateUserRole = updateUserRole;
const updateUserStatus = async (userId, input) => {
    const user = await User_model_1.default.findById(userId);
    if (!user) {
        throw new AppError_1.AppError('User not found', 404);
    }
    user.isActive = input.isActive;
    await user.save();
    const userResponse = user.toObject();
    const { password: _, ...userWithoutPassword } = userResponse;
    return userWithoutPassword;
};
exports.updateUserStatus = updateUserStatus;
//# sourceMappingURL=auth.service.js.map