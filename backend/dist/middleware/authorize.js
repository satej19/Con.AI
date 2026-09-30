"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireUser = exports.requireManager = exports.requireAdmin = exports.authorize = void 0;
const AppError_1 = require("../utils/AppError");
const constants_1 = require("../config/constants");
const authorize = (...allowedRoles) => {
    return (req, _res, next) => {
        if (!req.user) {
            throw new AppError_1.AppError('Authentication required', 401);
        }
        if (!allowedRoles.includes(req.user.role)) {
            throw new AppError_1.AppError('Insufficient permissions', 403);
        }
        next();
    };
};
exports.authorize = authorize;
// Simplified authorization for MVP
exports.requireAdmin = (0, exports.authorize)(constants_1.USER_ROLES.ADMIN);
exports.requireManager = (0, exports.authorize)(constants_1.USER_ROLES.ADMIN, constants_1.USER_ROLES.MANAGER);
exports.requireUser = (0, exports.authorize)(constants_1.USER_ROLES.ADMIN, constants_1.USER_ROLES.MANAGER, constants_1.USER_ROLES.USER);
//# sourceMappingURL=authorize.js.map