"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.disconnectDB = exports.connectDB = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const env_1 = require("./env");
const connectDB = async () => {
    const maxRetries = 5;
    const retryDelay = 5000; // 5 seconds
    for (let i = 0; i < maxRetries; i++) {
        try {
            await mongoose_1.default.connect(env_1.env.MONGO_URI);
            console.log('✅ MongoDB connected successfully');
            return;
        }
        catch (error) {
            console.error(`❌ MongoDB connection attempt ${i + 1}/${maxRetries} failed:`, error);
            if (i === maxRetries - 1) {
                console.error('❌ Max retries reached. Exiting...');
                process.exit(1);
            }
            console.log(`⏳ Retrying in ${retryDelay / 1000} seconds...`);
            await new Promise(resolve => setTimeout(resolve, retryDelay));
        }
    }
};
exports.connectDB = connectDB;
const disconnectDB = async () => {
    try {
        await mongoose_1.default.disconnect();
        console.log('✅ MongoDB disconnected successfully');
    }
    catch (error) {
        console.error('❌ Error disconnecting from MongoDB:', error);
    }
};
exports.disconnectDB = disconnectDB;
mongoose_1.default.connection.on('error', (err) => {
    console.error('MongoDB connection error:', err);
});
mongoose_1.default.connection.on('disconnected', () => {
    console.log('MongoDB disconnected');
});
//# sourceMappingURL=db.js.map