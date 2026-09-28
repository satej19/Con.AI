"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildPaginationMeta = exports.calculateTotalPages = exports.parsePagination = void 0;
const constants_1 = require("../config/constants");
const parsePagination = (query) => {
    const page = Math.max(constants_1.DEFAULT_PAGE, parseInt(query.page, 10) || constants_1.DEFAULT_PAGE);
    let limit = Math.min(constants_1.MAX_LIMIT, parseInt(query.limit, 10) || constants_1.DEFAULT_LIMIT);
    limit = Math.max(1, limit);
    const skip = (page - 1) * limit;
    return { page, limit, skip };
};
exports.parsePagination = parsePagination;
const calculateTotalPages = (total, limit) => {
    return Math.ceil(total / limit);
};
exports.calculateTotalPages = calculateTotalPages;
const buildPaginationMeta = (page, limit, total) => {
    return {
        page,
        limit,
        total,
        totalPages: (0, exports.calculateTotalPages)(total, limit),
    };
};
exports.buildPaginationMeta = buildPaginationMeta;
//# sourceMappingURL=pagination.js.map