import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import dotenv from 'dotenv';

import connectDB from './config/database';
import taskRoutes from './routes/taskRoutes';
import userRoutes from './routes/userRoutes';
import authRoutes from './routes/authRoutes';

// Загружаем переменные окружения
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Подключение к базе данных
connectDB();

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

app.use(cors({
  origin: [
    'http://localhost:3000',  // Direct frontend dev server
    'http://localhost',       // Through nginx proxy (port 80)
    'http://localhost:80',    // Explicit port 80
    ...(process.env.CORS_ORIGIN ? [process.env.CORS_ORIGIN] : [])
  ],
  credentials: true
}));

app.use(compression());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Маршруты
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/users', userRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'BitCraft Task Manager API is running!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Базовый маршрут
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

// 404 обработчик
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found'
  });
});

// Глобальный обработчик ошибок
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`🚀 Server started on port ${PORT}`);
  console.log(`📚 API available at: http://localhost:${PORT}`);
  console.log(`🏥 Health check: http://localhost:${PORT}/health`);
});

export default app; 