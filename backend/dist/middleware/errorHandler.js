"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const AppError_1 = require("../utils/AppError");
const ApiResponse_1 = require("../utils/ApiResponse");
const zod_1 = require("zod");
const errorHandler = (err, _req, res, _next) => {
    console.error('Error:', err);
    if (err instanceof AppError_1.AppError) {
        ApiResponse_1.ApiResponse.error(res, err.statusCode, err.message);
        return;
    }
    if (err instanceof zod_1.ZodError) {
        const errors = err.issues.map((e) => ({
            field: e.path.join('.'),
            message: e.message,
        }));
        ApiResponse_1.ApiResponse.error(res, 400, 'Validation failed', errors);
        return;
    }
    if (err.name === 'ValidationError') {
        const errors = [
            {
                field: 'validation',
                message: err.message,
            },
        ];
        ApiResponse_1.ApiResponse.error(res, 400, 'Validation error', errors);
        return;
    }
    if (err.name === 'CastError') {
        ApiResponse_1.ApiResponse.error(res, 400, 'Invalid ID format');
        return;
    }
    const mongoError = err;
    if (mongoError.code === 11000) {
        const field = Object.keys(mongoError.keyPattern || {})[0] || 'field';
        ApiResponse_1.ApiResponse.error(res, 409, `${field} already exists`);
        return;
    }
    ApiResponse_1.ApiResponse.error(res, 500, 'Internal server error');
};
exports.errorHandler = errorHandler;
//# sourceMappingURL=errorHandler.js.map