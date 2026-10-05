"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.chat = void 0;
const ApiResponse_1 = require("../utils/ApiResponse");
const ai_service_1 = require("../services/ai.service");
const chat = async (req, res) => {
    if (!req.user) {
        throw new Error('User not authenticated');
    }
    const { messages } = req.body;
    if (!Array.isArray(messages) || messages.length === 0) {
        throw new Error('messages array is required');
    }
    const result = await (0, ai_service_1.processChat)(messages, req.user.userId);
    ApiResponse_1.ApiResponse.success(res, 200, 'AI response generated', result);
};
exports.chat = chat;
//# sourceMappingURL=ai.controller.js.map