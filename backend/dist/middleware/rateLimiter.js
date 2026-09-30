"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRateLimiter = exports.rateLimiter = void 0;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const env_1 = require("../config/env");
exports.rateLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
});
exports.authRateLimiter = (0, express_rate_limit_1.default)({
    windowMs: env_1.env.NODE_ENV === 'production' ? 15 * 60 * 1000 : 60 * 1000, // 15 min in prod, 1 min in dev
    max: env_1.env.NODE_ENV === 'production' ? 5 : 50, // 5 in prod, 50 in dev
    message: 'Too many authentication attempts, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
});
//# sourceMappingURL=rateLimiter.js.map