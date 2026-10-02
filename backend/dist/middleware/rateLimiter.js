"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRateLimiter = exports.rateLimiter = void 0;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const env_1 = require("../config/env");
// General API rate limiter — generous in development, strict in production
exports.rateLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: env_1.env.NODE_ENV === 'production' ? 300 : 1000,
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
    skip: () => env_1.env.NODE_ENV === 'test',
});
// Auth endpoints — always strict regardless of environment
exports.authRateLimiter = (0, express_rate_limit_1.default)({
    windowMs: env_1.env.NODE_ENV === 'production' ? 15 * 60 * 1000 : 60 * 1000,
    max: env_1.env.NODE_ENV === 'production' ? 5 : 50,
    message: 'Too many authentication attempts, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
});
//# sourceMappingURL=rateLimiter.js.map