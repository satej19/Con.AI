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
const env_1 = require("../config/env");
const registerUser = async (input) => {
    const { name, email, password, role } = input;
    const existingUser = await User_model_1.default.findOne({ email });
    if (existingUser) {
        throw new AppError_1.AppError('Email already registered', 409);
    }
    // If email matches ADMIN_EMAIL, assign admin role (override request).
    // Otherwise cap at 'manager' — admin can never be self-assigned through registration.
    let userRole = role || 'user';
    if (env_1.env.ADMIN_EMAIL && email.toLowerCase() === env_1.env.ADMIN_EMAIL.toLowerCase()) {
        userRole = 'admin';
    }
    else if (userRole === 'admin') {
        // Block any attempt to self-register as admin
        userRole = 'user';
    }
    // If this is the very first user ever and no ADMIN_EMAIL is set, promote to admin
    const userCount = await User_model_1.default.countDocuments();
    if (userCount === 0 && !env_1.env.ADMIN_EMAIL) {
        userRole = 'admin';
    }
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
    const user = await User_model_1.default.findById(userId).select('-password');
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