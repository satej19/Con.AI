"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateParams = exports.validateQuery = exports.validateBody = void 0;
const validateBody = (schema) => {
    return (req, _res, next) => {
        try {
            const result = schema.safeParse(req.body);
            if (!result.success) {
                throw result.error;
            }
            req.body = result.data;
            next();
        }
        catch (error) {
            next(error);
        }
    };
};
exports.validateBody = validateBody;
const validateQuery = (schema) => {
    return (req, _res, next) => {
        try {
            const result = schema.safeParse(req.query);
            if (!result.success) {
                throw result.error;
            }
            Object.assign(req.query, result.data);
            next();
        }
        catch (error) {
            next(error);
        }
    };
};
exports.validateQuery = validateQuery;
const validateParams = (schema) => {
    return (req, _res, next) => {
        try {
            const result = schema.safeParse(req.params);
            if (!result.success) {
                throw result.error;
            }
            req.params = result.data;
            next();
        }
        catch (error) {
            next(error);
        }
    };
};
exports.validateParams = validateParams;
//# sourceMappingURL=validate.js.map