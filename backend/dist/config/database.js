"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const connectDB = async () => {
    try {
        const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/bitcraft_task_manager';
        await mongoose_1.default.connect(mongoURI, {
            bufferCommands: false,
        });
        console.log('MongoDB подключена успешно');
        process.on('SIGINT', async () => {
            console.log('Отключение от MongoDB...');
            await mongoose_1.default.connection.close();
            process.exit(0);
        });
    }
    catch (error) {
        console.error('Ошибка подключения к MongoDB:', error);
        process.exit(1);
    }
};
exports.default = connectDB;
//# sourceMappingURL=database.js.map