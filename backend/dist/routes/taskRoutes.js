"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const taskController_1 = require("../controllers/taskController");
const validation_1 = require("../middleware/validation");
const router = (0, express_1.Router)();
router.get('/', taskController_1.TaskController.getAllTasks);
router.get('/:taskId', taskController_1.TaskController.getTaskById);
router.post('/', validation_1.validateCreateTask, taskController_1.TaskController.createTask);
router.post('/test', taskController_1.TaskController.createTask);
router.put('/:taskId', taskController_1.TaskController.updateTask);
router.post('/:taskId/claim', validation_1.validateClaimTask, taskController_1.TaskController.claimTask);
router.post('/:taskId/subtasks/:subtaskId/claim', validation_1.validateClaimTask, taskController_1.TaskController.claimSubtask);
router.put('/:taskId/subtasks/:subtaskId/complete', taskController_1.TaskController.completeSubtask);
router.put('/:taskId/complete', taskController_1.TaskController.completeTask);
router.put('/:taskId/resources/:resourceName', validation_1.validateUpdateResource, taskController_1.TaskController.updateResourceContribution);
router.delete('/:taskId', taskController_1.TaskController.deleteTask);
exports.default = router;
//# sourceMappingURL=taskRoutes.js.map