"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const env_1 = require("./config/env");
const db_1 = require("./config/db");
const errorHandler_1 = require("./middleware/errorHandler");
const rateLimiter_1 = require("./middleware/rateLimiter");
const routes_1 = __importDefault(require("./routes"));
const app = (0, express_1.default)();
// Security middleware
app.use((0, helmet_1.default)());
const allowedOrigins = env_1.env.CORS_ORIGIN.split(',').map((origin) => origin.trim());
app.use((0, cors_1.default)({
    origin: (requestOrigin, callback) => {
        if (!requestOrigin || allowedOrigins.includes(requestOrigin)) {
            callback(null, true);
            return;
        }
        callback(new Error('Origin not allowed by CORS'));
    },
}));
// Body parsing middleware (must be before logging)
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Request logging (only in development)
if (env_1.env.NODE_ENV === 'development') {
    app.use((req, _res, next) => {
        console.log(`→ ${req.method} ${req.path}${req.headers.origin ? ` (origin: ${req.headers.origin})` : ''}`);
        next();
    });
}
app.use(rateLimiter_1.rateLimiter);
// Routes
app.use('/api', routes_1.default);
// Error handling middleware (must be last)
app.use(errorHandler_1.errorHandler);
// Start server
const startServer = async () => {
    try {
        await (0, db_1.connectDB)();
        const PORT = parseInt(env_1.env.PORT, 10);
        app.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
            console.log(`📝 Environment: ${env_1.env.NODE_ENV}`);
        });
    }
    catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
};
startServer();
exports.default = app;
//# sourceMappingURL=index.js.map