"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskController = void 0;
const Task_1 = require("../models/Task");
const User_1 = require("../models/User");
const types_1 = require("../types");
class TaskController {
    static async getAllTasks(req, res) {
        try {
            const { status, profession, search, assignedTo, priority, sortBy = 'createdAt', sortOrder = 'desc', page = 1, limit = 20 } = req.query;
            const filter = {};
            if (status && status !== 'all') {
                filter.status = status;
            }
            if (profession && profession !== 'all') {
                filter.professions = profession;
            }
            if (search) {
                filter.$or = [
                    { name: { $regex: search, $options: 'i' } },
                    { description: { $regex: search, $options: 'i' } }
                ];
            }
            if (assignedTo) {
                filter.assignedTo = assignedTo;
            }
            if (priority) {
                filter.priority = priority;
            }
            const sortOptions = {};
            sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;
            const pageNum = parseInt(page);
            const limitNum = parseInt(limit);
            const skip = (pageNum - 1) * limitNum;
            const tasks = await Task_1.TaskModel
                .find(filter)
                .sort(sortOptions)
                .skip(skip)
                .limit(limitNum);
            const total = await Task_1.TaskModel.countDocuments(filter);
            res.json({
                success: true,
                data: {
                    tasks,
                    pagination: {
                        page: pageNum,
                        limit: limitNum,
                        total,
                        pages: Math.ceil(total / limitNum)
                    }
                }
            });
        }
        catch (error) {
            console.error('Ошибка получения задач:', error);
            res.status(500).json({
                success: false,
                message: 'Ошибка сервера при получении задач'
            });
        }
    }
    static async getTaskById(req, res) {
        try {
            const { taskId } = req.params;
            const task = await Task_1.TaskModel.findById(taskId);
            if (!task) {
                return res.status(404).json({
                    success: false,
                    message: 'Задача не найдена'
                });
            }
            return res.json({
                success: true,
                data: task
            });
        }
        catch (error) {
            console.error('Ошибка получения задачи:', error);
            return res.status(500).json({
                success: false,
                message: 'Ошибка сервера при получении задачи'
            });
        }
    }
    static async createTask(req, res) {
        try {
            const taskData = req.body;
            const processedResources = taskData.resources?.map(resource => ({
                ...resource,
                gathered: 0,
                contributors: new Map()
            })) || [];
            const processSubtasks = (subtasks, startId = 1) => {
                let currentId = startId;
                return subtasks.map(subtask => {
                    const processedSubtask = {
                        ...subtask,
                        id: currentId++,
                        completed: false,
                        assignedTo: [],
                        resources: subtask.resources?.map((resource) => ({
                            ...resource,
                            gathered: 0,
                            contributors: new Map()
                        })) || []
                    };
                    if (subtask.subtasks) {
                        processedSubtask.subtasks = processSubtasks(subtask.subtasks, currentId);
                        currentId += subtask.subtasks.length;
                    }
                    return processedSubtask;
                });
            };
            const processedSubtasks = processSubtasks(taskData.subtasks || []);
            const newTask = new Task_1.TaskModel({
                ...taskData,
                resources: processedResources,
                subtasks: processedSubtasks,
                assignedTo: [],
                status: types_1.TaskStatus.OPEN
            });
            await newTask.save();
            res.status(201).json({
                success: true,
                data: newTask,
                message: 'Задача успешно создана'
            });
        }
        catch (error) {
            console.error('Ошибка создания задачи:', error);
            res.status(500).json({
                success: false,
                message: 'Ошибка сервера при создании задачи'
            });
        }
    }
    static async claimTask(req, res) {
        try {
            const { taskId } = req.params;
            const { userName } = req.body;
            if (!userName) {
                return res.status(400).json({
                    success: false,
                    message: 'Имя пользователя обязательно'
                });
            }
            const task = await Task_1.TaskModel.findById(taskId);
            if (!task) {
                return res.status(404).json({
                    success: false,
                    message: 'Задача не найдена'
                });
            }
            const user = await User_1.UserModel.findOne({ name: userName });
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'Пользователь не найден'
                });
            }
            const isAssigned = task.assignedTo.includes(userName);
            if (isAssigned) {
                task.assignedTo = task.assignedTo.filter(name => name !== userName);
                if (task.assignedTo.length === 0) {
                    task.status = types_1.TaskStatus.OPEN;
                }
                user.currentTasks = Math.max(0, user.currentTasks - 1);
            }
            else {
                task.assignedTo.push(userName);
                task.status = types_1.TaskStatus.TAKEN;
                user.currentTasks += 1;
            }
            await Promise.all([task.save(), user.save()]);
            return res.json({
                success: true,
                data: task,
                message: isAssigned ? 'Пользователь снят с задачи' : 'Пользователь назначен на задачу'
            });
        }
        catch (error) {
            console.error('Ошибка при назначении задачи:', error);
            return res.status(500).json({
                success: false,
                message: 'Ошибка сервера при назначении задачи'
            });
        }
    }
    static async updateResourceContribution(req, res) {
        try {
            const { taskId, resourceName } = req.params;
            const { quantity, userName } = req.body;
            if (!userName) {
                return res.status(400).json({
                    success: false,
                    message: 'Имя пользователя обязательно'
                });
            }
            const task = await Task_1.TaskModel.findById(taskId);
            if (!task) {
                return res.status(404).json({
                    success: false,
                    message: 'Задача не найдена'
                });
            }
            const resource = task.resources.find(r => r.name === resourceName);
            if (!resource) {
                return res.status(404).json({
                    success: false,
                    message: 'Ресурс не найден'
                });
            }
            const currentContribution = resource.contributors.get(userName) || 0;
            const newContribution = Math.max(0, currentContribution + quantity);
            if (newContribution === 0) {
                resource.contributors.delete(userName);
            }
            else {
                resource.contributors.set(userName, newContribution);
            }
            resource.gathered = Array.from(resource.contributors.values()).reduce((sum, val) => sum + val, 0);
            await task.save();
            return res.json({
                success: true,
                data: task,
                message: 'Вклад в ресурс обновлен'
            });
        }
        catch (error) {
            console.error('Ошибка обновления ресурса:', error);
            return res.status(500).json({
                success: false,
                message: 'Ошибка сервера при обновлении ресурса'
            });
        }
    }
    static async deleteTask(req, res) {
        try {
            const { taskId } = req.params;
            const task = await Task_1.TaskModel.findByIdAndDelete(taskId);
            if (!task) {
                return res.status(404).json({
                    success: false,
                    message: 'Задача не найдена'
                });
            }
            return res.json({
                success: true,
                message: 'Задача успешно удалена'
            });
        }
        catch (error) {
            console.error('Ошибка удаления задачи:', error);
            return res.status(500).json({
                success: false,
                message: 'Ошибка сервера при удалении задачи'
            });
        }
    }
}
exports.TaskController = TaskController;
//# sourceMappingURL=taskController.js.map