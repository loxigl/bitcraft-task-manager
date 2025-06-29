import { Router } from 'express';
import { UserController } from '../controllers/userController';
import { validateUser } from '../middleware/validation';

const router = Router();

// GET /api/users - получить всех пользователей
router.get('/', UserController.getAllUsers);

// GET /api/users/:userId - получить пользователя по ID
router.get('/:userId', UserController.getUserById);

// GET /api/users/name/:userName - получить пользователя по имени
router.get('/name/:userName', UserController.getUserByName);

// POST /api/users - создать нового пользователя
router.post('/', validateUser, UserController.createUser);

// PUT /api/users/:userId/professions/:profession - обновить уровень профессии
router.put('/:userId/professions/:profession', UserController.updateProfessionLevel);

// PUT /api/users/:userId/profile - обновить профиль пользователя
router.put('/:userId/profile', UserController.updateProfile);

// PUT /api/users/:userId/guild - обновить гильдию пользователя
router.put('/:userId/guild', UserController.updateGuild);

// GET /api/users/:userId/stats - получить статистику пользователя
router.get('/:userId/stats', UserController.getUserStats);

// DELETE /api/users/:userId - удалить пользователя
router.delete('/:userId', UserController.deleteUser);

export default router; 