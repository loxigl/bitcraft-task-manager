"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const compression_1 = __importDefault(require("compression"));
const dotenv_1 = __importDefault(require("dotenv"));
const database_1 = __importDefault(require("./config/database"));
const taskRoutes_1 = __importDefault(require("./routes/taskRoutes"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
(0, database_1.default)();
app.use((0, helmet_1.default)({
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use((0, cors_1.default)({
    origin: [
        'http://localhost:3000',
        'http://localhost',
        'http://localhost:80',
        ...(process.env.CORS_ORIGIN ? [process.env.CORS_ORIGIN] : [])
    ],
    credentials: true
}));
app.use((0, compression_1.default)());
app.use((0, morgan_1.default)('combined'));
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
app.use('/api/auth', authRoutes_1.default);
app.use('/api/tasks', taskRoutes_1.default);
app.use('/api/users', userRoutes_1.default);
app.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'BitCraft Task Manager API is running!',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Welcome to BitCraft Task Manager API!',
        version: '1.0.0',
        endpoints: {
            auth: '/api/auth',
            tasks: '/api/tasks',
            users: '/api/users',
            health: '/health'
        }
    });
});
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Endpoint not found'
    });
});
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal server error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});
app.listen(PORT, () => {
    console.log(`🚀 Server started on port ${PORT}`);
    console.log(`📚 API available at: http://localhost:${PORT}`);
    console.log(`🏥 Health check: http://localhost:${PORT}/health`);
});
exports.default = app;
//# sourceMappingURL=app.js.map