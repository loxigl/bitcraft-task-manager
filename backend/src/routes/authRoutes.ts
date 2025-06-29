import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { validateRegister, validateLogin } from '../middleware/validation';

const router = Router();

// POST /api/auth/register - регистрация нового пользователя
router.post('/register', validateRegister, AuthController.register);

// POST /api/auth/login - вход в систему
router.post('/login', validateLogin, AuthController.login);

// GET /api/auth/me - получение текущего пользователя
router.get('/me', AuthController.getCurrentUser);

export default router; 