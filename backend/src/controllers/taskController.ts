import { Request, Response } from 'express';
import { TaskModel } from '../models/Task';
import { UserModel } from '../models/User';
import { CreateTaskRequest, TaskStatus, AuthRequest } from '../types';

export class TaskController {
  // Получить все задачи с фильтрацией
  static async getAllTasks(req: Request, res: Response) {
    try {
      const { 
        status, 
        profession, 
        search, 
        assignedTo, 
        priority,
        sortBy = 'createdAt',
        sortOrder = 'desc',
        page = 1,
        limit = 20
      } = req.query;

      const filter: any = {};
      
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

      const sortOptions: any = {};
      sortOptions[sortBy as string] = sortOrder === 'asc' ? 1 : -1;

      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      const skip = (pageNum - 1) * limitNum;

      const tasks = await TaskModel
        .find(filter)
        .sort(sortOptions)
        .skip(skip)
        .limit(limitNum);

      const total = await TaskModel.countDocuments(filter);

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
    } catch (error) {
      console.error('Ошибка получения задач:', error);
      res.status(500).json({
        success: false,
        message: 'Ошибка сервера при получении задач'
      });
    }
  }

  // Получить задачу по ID
  static async getTaskById(req: Request, res: Response) {
    try {
      const { taskId } = req.params;
      
      const task = await TaskModel.findById(taskId);
      
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
    } catch (error) {
      console.error('Ошибка получения задачи:', error);
      return res.status(500).json({
        success: false,
        message: 'Ошибка сервера при получении задачи'
      });
    }
  }

  // Создать новую задачу
  static async createTask(req: Request, res: Response) {
    try {
      const taskData: CreateTaskRequest = req.body;
      
      // Преобразуем ресурсы, добавляя gathered: 0 и contributors: {}
      const processedResources = taskData.resources?.map(resource => ({
        ...resource,
        gathered: 0,
        contributors: new Map()
      })) || [];

      // Обрабатываем подзадачи рекурсивно
      const processSubtasks = (subtasks: any[], startId = 1): any[] => {
        let currentId = startId;
        return subtasks.map(subtask => {
          const processedSubtask = {
            ...subtask,
            id: currentId++,
            completed: false,
            assignedTo: [],
            resources: subtask.resources?.map((resource: any) => ({
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

      const newTask = new TaskModel({
        ...taskData,
        resources: processedResources,
        subtasks: processedSubtasks,
        assignedTo: [],
        status: TaskStatus.OPEN
      });

      await newTask.save();

      res.status(201).json({
        success: true,
        data: newTask,
        message: 'Задача успешно создана'
      });
    } catch (error) {
      console.error('Ошибка создания задачи:', error);
      res.status(500).json({
        success: false,
        message: 'Ошибка сервера при создании задачи'
      });
    }
  }

  // Назначить/снять пользователя с задачи
  static async claimTask(req: Request, res: Response) {
    try {
      const { taskId } = req.params;
      const { userName } = req.body;

      if (!userName) {
        return res.status(400).json({
          success: false,
          message: 'Имя пользователя обязательно'
        });
      }

      const task = await TaskModel.findById(taskId);
      if (!task) {
        return res.status(404).json({
          success: false,
          message: 'Задача не найдена'
        });
      }

      const user = await UserModel.findOne({ name: userName });
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Пользователь не найден'
        });
      }

      const isAssigned = task.assignedTo.includes(userName);
      
      if (isAssigned) {
        // Снимаем с задачи
        task.assignedTo = task.assignedTo.filter(name => name !== userName);
        if (task.assignedTo.length === 0) {
          task.status = TaskStatus.OPEN;
        }
        user.currentTasks = Math.max(0, user.currentTasks - 1);
      } else {
        // Назначаем на задачу
        task.assignedTo.push(userName);
        task.status = TaskStatus.TAKEN;
        user.currentTasks += 1;
      }

      await Promise.all([task.save(), user.save()]);

      return res.json({
        success: true,
        data: task,
        message: isAssigned ? 'Пользователь снят с задачи' : 'Пользователь назначен на задачу'
      });
    } catch (error) {
      console.error('Ошибка при назначении задачи:', error);
      return res.status(500).json({
        success: false,
        message: 'Ошибка сервера при назначении задачи'
      });
    }
  }

  // Обновить вклад в ресурс
  static async updateResourceContribution(req: Request, res: Response) {
    try {
      const { taskId, resourceName } = req.params;
      const { quantity, userName } = req.body;

      if (!userName) {
        return res.status(400).json({
          success: false,
          message: 'Имя пользователя обязательно'
        });
      }

      const task = await TaskModel.findById(taskId);
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

      // Обновляем вклад пользователя
      const currentContribution = (resource.contributors as Map<string, number>).get(userName) || 0;
      const newContribution = Math.max(0, currentContribution + quantity);
      
      if (newContribution === 0) {
        (resource.contributors as Map<string, number>).delete(userName);
      } else {
        (resource.contributors as Map<string, number>).set(userName, newContribution);
      }

      // Пересчитываем общее количество собранных ресурсов
      resource.gathered = Array.from((resource.contributors as Map<string, number>).values()).reduce((sum: number, val: number) => sum + val, 0);

      await task.save();

      return res.json({
        success: true,
        data: task,
        message: 'Вклад в ресурс обновлен'
      });
    } catch (error) {
      console.error('Ошибка обновления ресурса:', error);
      return res.status(500).json({
        success: false,
        message: 'Ошибка сервера при обновлении ресурса'
      });
    }
  }

  // Удалить задачу
  static async deleteTask(req: Request, res: Response) {
    try {
      const { taskId } = req.params;
      
      const task = await TaskModel.findByIdAndDelete(taskId);
      
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
    } catch (error) {
      console.error('Ошибка удаления задачи:', error);
      return res.status(500).json({
        success: false,
        message: 'Ошибка сервера при удалении задачи'
      });
    }
  }
} 