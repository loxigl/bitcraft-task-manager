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
        taskType,
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

      if (taskType) {
        filter.taskType = taskType;
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
      console.log('=== CREATE TASK DEBUG ===');
      console.log('Received data:', JSON.stringify(req.body, null, 2));
      
      const taskData: CreateTaskRequest = req.body;
      
      console.log('Processing resources...');
      // Преобразуем ресурсы, добавляя gathered: 0 и contributors: {}
      const processedResources = taskData.resources?.map(resource => ({
        ...resource,
        gathered: 0,
        contributors: new Map()
      })) || [];
      console.log('Processed resources:', processedResources);

      console.log('Processing subtasks...');
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
      console.log('Processed subtasks:', processedSubtasks);

      console.log('Creating task object...');
      const newTask = new TaskModel({
        ...taskData,
        resources: processedResources,
        subtasks: processedSubtasks,
        assignedTo: [],
        status: TaskStatus.OPEN
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
    } catch (error) {
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

  // Обновить существующую задачу
  static async updateTask(req: Request, res: Response) {
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

      const task = await TaskModel.findById(taskId as string);
      if (!task) {
        return res.status(404).json({
          success: false,
          message: 'Задача не найдена'
        });
      }

      // Обновляем разрешенные поля
      const allowedFields = ['name', 'description', 'deadline', 'priority', 'status', 'taskType', 'shipTo', 'takeFrom'];
      allowedFields.forEach(field => {
        if (taskData[field] !== undefined) {
          (task as any)[field] = taskData[field];
        }
      });

      // Обрабатываем ресурсы если они переданы
      if (taskData.resources) {
        task.resources = taskData.resources.map((resource: any) => ({
          ...resource,
          gathered: resource.gathered || 0,
          contributors: resource.contributors instanceof Map 
            ? resource.contributors 
            : new Map(Object.entries(resource.contributors || {}))
        }));
      }

      // Обрабатываем подзадачи если они переданы
      if (taskData.subtasks) {
        const processSubtasks = (subtasks: any[], startId = 1): any[] => {
          let currentId = startId;
          return subtasks.map(subtask => {
            const processedSubtask = {
              ...subtask,
              id: subtask.id || currentId++,
              completed: subtask.completed || false,
              assignedTo: subtask.assignedTo || [],
              resources: subtask.resources?.map((resource: any) => ({
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
    } catch (error) {
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
        task.status = TaskStatus.IN_PROGRESS; // Меняем на IN_PROGRESS вместо TAKEN
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

  // Назначить/снять пользователя с подзадачи
  static async claimSubtask(req: Request, res: Response) {
    try {
      const { taskId, subtaskId } = req.params;
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

      // Рекурсивно ищем подзадачу
      const findAndUpdateSubtask = (subtasks: any[]): boolean => {
        for (const subtask of subtasks) {
          if (subtask.id === parseInt(subtaskId!)) {
            const isAssigned = subtask.assignedTo.includes(userName);
            
            if (isAssigned) {
              // Снимаем с подзадачи
              subtask.assignedTo = subtask.assignedTo.filter((name: string) => name !== userName);
              user.currentTasks = Math.max(0, user.currentTasks - 1);
              
              // Если никого не осталось, возвращаем статус в open
              if (subtask.assignedTo.length === 0) {
                subtask.status = 'open';
              }
            } else {
              // Назначаем на подзадачу
              subtask.assignedTo.push(userName);
              user.currentTasks += 1;
              
              // Меняем статус на in_progress
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
    } catch (error) {
      console.error('Ошибка при назначении подзадачи:', error);
      return res.status(500).json({
        success: false,
        message: 'Ошибка сервера при назначении подзадачи'
      });
    }
  }

  // Отметить подзадачу как завершенную
  static async completeSubtask(req: Request, res: Response) {
    try {
      const { taskId, subtaskId } = req.params;

      const task = await TaskModel.findById(taskId);
      if (!task) {
        return res.status(404).json({
          success: false,
          message: 'Задача не найдена'
        });
      }

      let completedSubtask: any = null;

      // Рекурсивно ищем подзадачу и отмечаем как завершенную
      const findAndCompleteSubtask = (subtasks: any[]): boolean => {
        for (const subtask of subtasks) {
          if (subtask.id === parseInt(subtaskId!)) {
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

      // Начисляем репутацию участникам
      if (completedSubtask && completedSubtask.assignedTo) {
        const UserModel = require('../models/User').UserModel;
        const reputationReward = task.taskType === 'guild' ? 1000 : 100;
        
        const assignedUsers = Array.isArray(completedSubtask.assignedTo) 
          ? completedSubtask.assignedTo 
          : [completedSubtask.assignedTo];

        // Обновляем репутацию для всех назначенных пользователей
        await Promise.all(assignedUsers.map(async (userName: string) => {
          await UserModel.findOneAndUpdate(
            { name: userName },
            { 
              $inc: { 
                reputation: reputationReward,
                completedTasks: 1
                // Убираем currentTasks: -1 чтобы не снимать участников
              }
            }
          );
        }));
      }

      await task.save();

      return res.json({
        success: true,
        data: task,
        message: 'Подзадача отмечена как завершенная'
      });
    } catch (error) {
      console.error('Ошибка при завершении подзадачи:', error);
      return res.status(500).json({
        success: false,
        message: 'Ошибка сервера при завершении подзадачи'
      });
    }
  }

  // Обновить вклад в ресурс основной задачи или подзадачи
  static async updateResourceContribution(req: Request, res: Response) {
    try {
      const { taskId, resourceName } = req.params;
      const { quantity, userName, subtaskId } = req.body;

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

      let resource;
      let resourceLocation = 'task';

      // Если указан subtaskId, ищем ресурс в подзадаче
      if (subtaskId) {
        const findResourceInSubtasks = (subtasks: any[]): any => {
          for (const subtask of subtasks) {
            if (subtask.id === parseInt(subtaskId)) {
              return subtask.resources.find((r: any) => r.name === resourceName);
            }
            if (subtask.subtasks) {
              const found = findResourceInSubtasks(subtask.subtasks);
              if (found) return found;
            }
          }
          return null;
        };

        resource = findResourceInSubtasks(task.subtasks);
        resourceLocation = 'subtask';
      } else {
        // Ищем ресурс в основной задаче
        resource = task.resources.find(r => r.name === resourceName);
      }

      if (!resource) {
        return res.status(404).json({
          success: false,
          message: `Ресурс не найден в ${resourceLocation === 'task' ? 'задаче' : 'подзадаче'}`
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

  // Отметить основную задачу как завершенную
  static async completeTask(req: Request, res: Response) {
    try {
      const { taskId } = req.params;

      const task = await TaskModel.findById(taskId);
      if (!task) {
        return res.status(404).json({
          success: false,
          message: 'Задача не найдена'
        });
      }

      // Отмечаем задачу как завершенную
      task.status = TaskStatus.COMPLETED;

      // Начисляем репутацию участникам
      if (task.assignedTo && task.assignedTo.length > 0) {
        const UserModel = require('../models/User').UserModel;
        const reputationReward = task.taskType === 'guild' ? 1000 : 100;

        // Обновляем репутацию для всех назначенных пользователей
        await Promise.all(task.assignedTo.map(async (userName: string) => {
          await UserModel.findOneAndUpdate(
            { name: userName },
            { 
              $inc: { 
                reputation: reputationReward,
                completedTasks: 1
                // Убираем currentTasks: -1 чтобы не снимать участников
              }
            }
          );
        }));
      }

      await task.save();

      return res.json({
        success: true,
        data: task,
        message: 'Задача отмечена как завершенная'
      });
    } catch (error) {
      console.error('Ошибка при завершении задачи:', error);
      return res.status(500).json({
        success: false,
        message: 'Ошибка сервера при завершении задачи'
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