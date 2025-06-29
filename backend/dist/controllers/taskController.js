"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskController = void 0;
const Task_1 = require("../models/Task");
const User_1 = require("../models/User");
const types_1 = require("../types");
class TaskController {
    static async getAllTasks(req, res) {
        try {
            const { status, profession, search, assignedTo, priority, taskType, sortBy = 'createdAt', sortOrder = 'desc', page = 1, limit = 20 } = req.query;
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
            if (taskType) {
                filter.taskType = taskType;
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
            console.log('=== CREATE TASK DEBUG ===');
            console.log('Received data:', JSON.stringify(req.body, null, 2));
            const taskData = req.body;
            console.log('Processing resources...');
            const processedResources = taskData.resources?.map(resource => ({
                ...resource,
                gathered: 0,
                contributors: new Map()
            })) || [];
            console.log('Processed resources:', processedResources);
            console.log('Processing subtasks...');
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
            console.log('Processed subtasks:', processedSubtasks);
            console.log('Creating task object...');
            const newTask = new Task_1.TaskModel({
                ...taskData,
                resources: processedResources,
                subtasks: processedSubtasks,
                assignedTo: [],
                status: types_1.TaskStatus.OPEN
            });
            console.log('Task object created:', newTask);
            console.log('Saving to database...');
            await newTask.save();
            console.log('Task saved successfully!');
            res.status(201).json({
                success: true,
                data: newTask,
                message: 'Задача успешно создана'
            });
        }
        catch (error) {
            console.error('=== CREATE TASK ERROR ===');
            console.error('Error details:', error);
            if (error instanceof Error) {
                console.error('Stack trace:', error.stack);
            }
            res.status(500).json({
                success: false,
                message: 'Ошибка сервера при создании задачи'
            });
        }
    }
    static async updateTask(req, res) {
        try {
            const { taskId } = req.params;
            const taskData = req.body;
            if (!taskId) {
                return res.status(400).json({
                    success: false,
                    message: 'ID задачи обязателен'
                });
            }
            console.log('=== UPDATE TASK DEBUG ===');
            console.log('Task ID:', taskId);
            console.log('Update data:', JSON.stringify(taskData, null, 2));
            const task = await Task_1.TaskModel.findById(taskId);
            if (!task) {
                return res.status(404).json({
                    success: false,
                    message: 'Задача не найдена'
                });
            }
            const allowedFields = ['name', 'description', 'deadline', 'priority', 'status', 'taskType', 'shipTo', 'takeFrom'];
            allowedFields.forEach(field => {
                if (taskData[field] !== undefined) {
                    task[field] = taskData[field];
                }
            });
            if (taskData.resources) {
                task.resources = taskData.resources.map((resource) => ({
                    ...resource,
                    gathered: resource.gathered || 0,
                    contributors: resource.contributors instanceof Map
                        ? resource.contributors
                        : new Map(Object.entries(resource.contributors || {}))
                }));
            }
            if (taskData.subtasks) {
                const processSubtasks = (subtasks, startId = 1) => {
                    let currentId = startId;
                    return subtasks.map(subtask => {
                        const processedSubtask = {
                            ...subtask,
                            id: subtask.id || currentId++,
                            completed: subtask.completed || false,
                            assignedTo: subtask.assignedTo || [],
                            resources: subtask.resources?.map((resource) => ({
                                ...resource,
                                gathered: resource.gathered || 0,
                                contributors: resource.contributors instanceof Map
                                    ? resource.contributors
                                    : new Map(Object.entries(resource.contributors || {}))
                            })) || []
                        };
                        if (subtask.subtasks) {
                            processedSubtask.subtasks = processSubtasks(subtask.subtasks, currentId);
                            currentId += subtask.subtasks.length;
                        }
                        return processedSubtask;
                    });
                };
                task.subtasks = processSubtasks(taskData.subtasks);
            }
            await task.save();
            console.log('Task updated successfully!');
            res.json({
                success: true,
                data: task,
                message: 'Задача успешно обновлена'
            });
        }
        catch (error) {
            console.error('=== UPDATE TASK ERROR ===');
            console.error('Error details:', error);
            if (error instanceof Error) {
                console.error('Stack trace:', error.stack);
            }
            res.status(500).json({
                success: false,
                message: 'Ошибка сервера при обновлении задачи'
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
                task.status = types_1.TaskStatus.IN_PROGRESS;
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
    static async claimSubtask(req, res) {
        try {
            const { taskId, subtaskId } = req.params;
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
            const findAndUpdateSubtask = (subtasks) => {
                for (const subtask of subtasks) {
                    if (subtask.id === parseInt(subtaskId)) {
                        const isAssigned = subtask.assignedTo.includes(userName);
                        if (isAssigned) {
                            subtask.assignedTo = subtask.assignedTo.filter((name) => name !== userName);
                            user.currentTasks = Math.max(0, user.currentTasks - 1);
                            if (subtask.assignedTo.length === 0) {
                                subtask.status = 'open';
                            }
                        }
                        else {
                            subtask.assignedTo.push(userName);
                            user.currentTasks += 1;
                            subtask.status = 'in_progress';
                        }
                        return true;
                    }
                    if (subtask.subtasks && findAndUpdateSubtask(subtask.subtasks)) {
                        return true;
                    }
                }
                return false;
            };
            const found = findAndUpdateSubtask(task.subtasks);
            if (!found) {
                return res.status(404).json({
                    success: false,
                    message: 'Подзадача не найдена'
                });
            }
            await Promise.all([task.save(), user.save()]);
            return res.json({
                success: true,
                data: task,
                message: 'Подзадача успешно обновлена'
            });
        }
        catch (error) {
            console.error('Ошибка при назначении подзадачи:', error);
            return res.status(500).json({
                success: false,
                message: 'Ошибка сервера при назначении подзадачи'
            });
        }
    }
    static async completeSubtask(req, res) {
        try {
            const { taskId, subtaskId } = req.params;
            const task = await Task_1.TaskModel.findById(taskId);
            if (!task) {
                return res.status(404).json({
                    success: false,
                    message: 'Задача не найдена'
                });
            }
            let completedSubtask = null;
            const findAndCompleteSubtask = (subtasks) => {
                for (const subtask of subtasks) {
                    if (subtask.id === parseInt(subtaskId)) {
                        if (subtask.completed) {
                            subtask.status = 'open';
                            subtask.completed = false;
                            completedSubtask = subtask;
                            return true;
                        }
                        subtask.completed = true;
                        completedSubtask = subtask;
                        return true;
                    }
                    if (subtask.subtasks && findAndCompleteSubtask(subtask.subtasks)) {
                        return true;
                    }
                }
                return false;
            };
            if (!findAndCompleteSubtask(task.subtasks)) {
                return res.status(404).json({
                    success: false,
                    message: 'Подзадача не найдена'
                });
            }
            if (completedSubtask && completedSubtask.assignedTo) {
                const UserModel = require('../models/User').UserModel;
                const reputationReward = task.taskType === 'guild' ? 1000 : 100;
                const assignedUsers = Array.isArray(completedSubtask.assignedTo)
                    ? completedSubtask.assignedTo
                    : [completedSubtask.assignedTo];
                await Promise.all(assignedUsers.map(async (userName) => {
                    await UserModel.findOneAndUpdate({ name: userName }, {
                        $inc: {
                            reputation: reputationReward,
                            completedTasks: 1
                        }
                    });
                }));
            }
            await task.save();
            return res.json({
                success: true,
                data: task,
                message: 'Подзадача отмечена как завершенная'
            });
        }
        catch (error) {
            console.error('Ошибка при завершении подзадачи:', error);
            return res.status(500).json({
                success: false,
                message: 'Ошибка сервера при завершении подзадачи'
            });
        }
    }
    static async updateResourceContribution(req, res) {
        try {
            const { taskId, resourceName } = req.params;
            const { quantity, userName, subtaskId } = req.body;
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
            let resource;
            let resourceLocation = 'task';
            if (subtaskId) {
                const findResourceInSubtasks = (subtasks) => {
                    for (const subtask of subtasks) {
                        if (subtask.id === parseInt(subtaskId)) {
                            return subtask.resources.find((r) => r.name === resourceName);
                        }
                        if (subtask.subtasks) {
                            const found = findResourceInSubtasks(subtask.subtasks);
                            if (found)
                                return found;
                        }
                    }
                    return null;
                };
                resource = findResourceInSubtasks(task.subtasks);
                resourceLocation = 'subtask';
            }
            else {
                resource = task.resources.find(r => r.name === resourceName);
            }
            if (!resource) {
                return res.status(404).json({
                    success: false,
                    message: `Ресурс не найден в ${resourceLocation === 'task' ? 'задаче' : 'подзадаче'}`
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
    static async completeTask(req, res) {
        try {
            const { taskId } = req.params;
            const task = await Task_1.TaskModel.findById(taskId);
            if (!task) {
                return res.status(404).json({
                    success: false,
                    message: 'Задача не найдена'
                });
            }
            task.status = types_1.TaskStatus.COMPLETED;
            if (task.assignedTo && task.assignedTo.length > 0) {
                const UserModel = require('../models/User').UserModel;
                const reputationReward = task.taskType === 'guild' ? 1000 : 100;
                await Promise.all(task.assignedTo.map(async (userName) => {
                    await UserModel.findOneAndUpdate({ name: userName }, {
                        $inc: {
                            reputation: reputationReward,
                            completedTasks: 1
                        }
                    });
                }));
            }
            await task.save();
            return res.json({
                success: true,
                data: task,
                message: 'Задача отмечена как завершенная'
            });
        }
        catch (error) {
            console.error('Ошибка при завершении задачи:', error);
            return res.status(500).json({
                success: false,
                message: 'Ошибка сервера при завершении задачи'
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