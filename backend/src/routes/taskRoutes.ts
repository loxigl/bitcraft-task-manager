import { Router } from 'express';
import { TaskController } from '../controllers/taskController';
import { validateCreateTask, validateClaimTask, validateUpdateResource } from '../middleware/validation';

const router = Router();

// GET /api/tasks - получить все задачи с фильтрацией
router.get('/', TaskController.getAllTasks);

// GET /api/tasks/:taskId - получить задачу по ID
router.get('/:taskId', TaskController.getTaskById);

// POST /api/tasks - создать новую задачу
router.post('/', validateCreateTask, TaskController.createTask);

// POST /api/tasks/:taskId/claim - назначить/снять пользователя с задачи
router.post('/:taskId/claim', validateClaimTask, TaskController.claimTask);

// PUT /api/tasks/:taskId/resources/:resourceName - обновить вклад в ресурс
router.put('/:taskId/resources/:resourceName', validateUpdateResource, TaskController.updateResourceContribution);

// DELETE /api/tasks/:taskId - удалить задачу
router.delete('/:taskId', TaskController.deleteTask);

export default router; 