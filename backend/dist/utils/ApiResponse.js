"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiResponse = void 0;
class ApiResponse {
    static success(res, statusCode = 200, message = 'Success', data, meta) {
        const response = {
            success: true,
            statusCode,
            message,
        };
        if (data !== undefined) {
            response.data = data;
        }
        if (meta) {
            response.meta = meta;
        }
        res.status(statusCode).json(response);
    }
    static error(res, statusCode = 500, message = 'Internal server error', errors) {
        const response = {
            success: false,
            statusCode,
            message,
        };
        if (errors && errors.length > 0) {
            response.errors = errors;
        }
        res.status(statusCode).json(response);
    }
}
exports.ApiResponse = ApiResponse;
//# sourceMappingURL=ApiResponse.js.map