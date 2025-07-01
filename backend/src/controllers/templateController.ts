import { Request, Response } from 'express';
import { TemplateModel } from '../models/Template';
import { TaskModel } from '../models/Task';
import { Template, TemplateRequest, TemplateResource, TemplateSubtask } from '../types';

export class TemplateController {
  // Get all templates with filtering
  static async getAllTemplates(req: Request, res: Response) {
    try {
      const { search, createdBy, page = 1, limit = 20 } = req.query;
      const filter: any = {};
      
      if (search) {
        filter.name = { $regex: search, $options: 'i' };
      }
      
      if (createdBy) {
        filter.createdBy = createdBy;
      }
      
      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      const skip = (pageNum - 1) * limitNum;

      const templates = await TemplateModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum);

      const total = await TemplateModel.countDocuments(filter);

      res.json({
        success: true,
        data: {
          templates,
          pagination: {
            page: pageNum,
            limit: limitNum,
            total,
            pages: Math.ceil(total / limitNum)
          }
        }
      });
    } catch (error) {
      console.error('Error getting templates:', error);
      res.status(500).json({
        success: false,
        message: 'Server error while getting templates'
      });
    }
  }

  // Get template by ID
  static async getTemplateById(req: Request, res: Response) {
    try {
      const { templateId } = req.params;
      
      const template = await TemplateModel.findOne({ id: templateId });
      
      if (!template) {
        return res.status(404).json({
          success: false,
          message: 'Template not found'
        });
      }

      return res.json({
        success: true,
        data: template
      });
    } catch (error) {
      console.error('Error getting template:', error);
      return res.status(500).json({
        success: false,
        message: 'Server error while getting template'
      });
    }
  }

  // Create new template from task
  static async createTemplate(req: Request, res: Response) {
    try {
      console.log('=== CREATE TEMPLATE DEBUG ===');
      console.log('Received data:', JSON.stringify(req.body, null, 2));
      
      const templateData: TemplateRequest = req.body;
      
      if (!templateData.name?.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Template name is required'
        });
      }
      
      if (!templateData.taskId && !templateData.subtaskId) {
        return res.status(400).json({
          success: false,
          message: 'Either taskId or subtaskId is required'
        });
      }
      
      // Найдем все задачи, чтобы искать в них подзадачи
      const allTasks = await TaskModel.find({});
      
      // Источник шаблона и его подзадачи
      let templateSource: any = null;
      let allSubtasks: any[] = [];
      
      // Если указан taskId, ищем задачу
      if (templateData.taskId) {
        const task = allTasks.find(t => String(t.id) === String(templateData.taskId));
        
        if (!task) {
          return res.status(404).json({
            success: false,
            message: 'Source task not found'
          });
        }
        
        // Если указан subtaskId, используем подзадачу как источник шаблона
        if (templateData.subtaskId) {
          // Функция для поиска подзадачи в задаче
          const findSubtask = (subtasks: any[]): any => {
            for (const subtask of subtasks) {
              if (String(subtask.id) === String(templateData.subtaskId)) {
                return subtask;
              }
              if (subtask.subtasks?.length) {
                const foundInNested = findSubtask(subtask.subtasks);
                if (foundInNested) return foundInNested;
              }
            }
            return null;
          };
          
          templateSource = findSubtask(task.subtasks || []);
          
          if (!templateSource) {
            return res.status(404).json({
              success: false,
              message: 'Source subtask not found'
            });
          }
          
          // Собираем все подзадачи из задачи
          allSubtasks = task.subtasks || [];
        } else {
          // Используем всю задачу как шаблон
          templateSource = task.toObject();
          allSubtasks = task.subtasks || [];
        }
      } 
      // Если указан только subtaskId, ищем подзадачу во всех задачах
      else if (templateData.subtaskId) {
        let foundSubtask = null;
        
        // Ищем подзадачу во всех задачах
        for (const task of allTasks) {
          const findSubtask = (subtasks: any[]): any => {
            for (const subtask of subtasks) {
              if (String(subtask.id) === String(templateData.subtaskId)) {
                return subtask;
              }
              if (subtask.subtasks?.length) {
                const foundInNested = findSubtask(subtask.subtasks);
                if (foundInNested) return foundInNested;
              }
            }
            return null;
          };
          
          foundSubtask = findSubtask(task.subtasks || []);
          if (foundSubtask) {
            templateSource = foundSubtask;
            allSubtasks = task.subtasks || [];
            break;
          }
        }
        
        if (!templateSource) {
          return res.status(404).json({
            success: false,
            message: 'Source subtask not found in any task'
          });
        }
      }
      
      // Генерируем уникальный ID для шаблона
      const templateId = `template-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      
      // Обработка ресурсов - удаляем gathered и contributors
      const processResources = (resources: any[]): TemplateResource[] => {
        if (!resources || !Array.isArray(resources)) return [];
        return resources.map(resource => ({
          name: resource.name,
          needed: resource.needed,
          unit: resource.unit
        }));
      };
      
      // Собираем все подзадачи, которые относятся к выбранной подзадаче
      const collectChildSubtasks = (parentId: string): any[] => {
        // Находим прямые дочерние подзадачи
        const directChildren = allSubtasks.filter(s => String(s.subtaskOf) === String(parentId));
        
        // Рекурсивно собираем их дочерние подзадачи
        let allChildren = [...directChildren];
        for (const child of directChildren) {
          const childrenOfChild = collectChildSubtasks(child.id);
          allChildren = [...allChildren, ...childrenOfChild];
        }
        
        return allChildren;
      };
      
      // Собираем все подзадачи, которые нужно включить в шаблон
      let subtasksToInclude: any[] = [];
      if (templateData.subtaskId) {
        // Если сохраняем подзадачу, включаем её и все её дочерние подзадачи
        subtasksToInclude = [templateSource, ...collectChildSubtasks(templateData.subtaskId)];
      } else {
        // Если сохраняем всю задачу, включаем все её подзадачи
        subtasksToInclude = allSubtasks;
      }
      
      // Обработка подзадач - удаляем completed, assignedTo, etc.
      const processedSubtasks = subtasksToInclude.map(subtask => {
        // Если это исходная подзадача и мы сохраняем шаблон из подзадачи,
        // то устанавливаем subtaskOf в null, чтобы она стала корневой
        const isRootSubtask = templateData.subtaskId && String(subtask.id) === String(templateData.subtaskId);
        
        return {
          id: subtask.id,
          name: subtask.name,
          professions: subtask.professions || [],
          levels: subtask.levels || {},
          dependencies: subtask.dependencies || [],
          // Если это корневая подзадача шаблона, то subtaskOf = null
          subtaskOf: isRootSubtask ? null : subtask.subtaskOf,
          description: subtask.description || '',
          shipTo: subtask.shipTo || '',
          takeFrom: subtask.takeFrom || '',
          resources: processResources(subtask.resources || [])
        };
      });
      
      // Создаем объект шаблона
      const template: Partial<Template> = {
        id: templateId,
        name: templateData.name,
        originalTaskId: templateData.taskId ? Number(templateData.taskId) : undefined,
        description: templateSource.description || '',
        professions: templateSource.professions || [],
        levels: templateSource.levels || {},
        priority: templateSource.priority || 'medium',
        resources: processResources(templateSource.resources || []),
        createdBy: req.body.userName || 'Unknown',
        shipTo: templateSource.shipTo || '',
        takeFrom: templateSource.takeFrom || '',
        taskType: templateSource.taskType || 'member',
        subtasks: processedSubtasks
      };
      
      console.log('Creating template:', template);
      
      const newTemplate = new TemplateModel(template);
      await newTemplate.save();
      
      return res.status(201).json({
        success: true,
        data: newTemplate,
        message: 'Template created successfully'
      });
    } catch (error) {
      console.error('=== CREATE TEMPLATE ERROR ===');
      console.error('Error details:', error);
      if (error instanceof Error) {
        console.error('Stack trace:', error.stack);
      }
      res.status(500).json({
        success: false,
        message: 'Server error while creating template'
      });
    }
  }

  // Delete template
  static async deleteTemplate(req: Request, res: Response) {
    try {
      const { templateId } = req.params;
      
      const template = await TemplateModel.findOne({ id: templateId });
      
      if (!template) {
        return res.status(404).json({
          success: false,
          message: 'Template not found'
        });
      }

      await template.deleteOne();

      return res.json({
        success: true,
        message: 'Template deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting template:', error);
      return res.status(500).json({
        success: false,
        message: 'Server error while deleting template'
      });
    }
  }

  // Update template
  static async updateTemplate(req: Request, res: Response) {
    try {
      const { templateId } = req.params;
      const updateData = req.body;
      
      // Находим шаблон
      const template = await TemplateModel.findOne({ id: templateId });
      
      if (!template) {
        return res.status(404).json({
          success: false,
          message: 'Template not found'
        });
      }

      // Поля, которые можно обновить
      const allowedFields = [
        'name',
        'description',
        'priority',
        'professions',
        'levels',
        'resources',
        'taskType',
        'shipTo',
        'takeFrom'
      ];
      
      // Обновляем только разрешенные поля
      allowedFields.forEach(field => {
        if (updateData[field] !== undefined) {
          // @ts-ignore - Игнорируем ошибку типа, так как мы проверяем поля динамически
          template[field] = updateData[field];
        }
      });
      
      // Если обновляются подзадачи
      if (updateData.subtasks && Array.isArray(updateData.subtasks)) {
        // Преобразуем подзадачи в правильный формат
        const processedSubtasks: TemplateSubtask[] = updateData.subtasks.map((subtask: any) => ({
          id: subtask.id,
          name: subtask.name,
          professions: subtask.professions || [],
          levels: subtask.levels || {},
          dependencies: subtask.dependencies || [],
          subtaskOf: subtask.subtaskOf,
          description: subtask.description || '',
          shipTo: subtask.shipTo || '',
          takeFrom: subtask.takeFrom || '',
          resources: (subtask.resources || []).map((resource: any): TemplateResource => ({
            name: resource.name,
            needed: resource.needed,
            unit: resource.unit
          }))
        }));
        
        template.subtasks = processedSubtasks;
      }
      
      await template.save();

      return res.json({
        success: true,
        data: template,
        message: 'Template updated successfully'
      });
    } catch (error) {
      console.error('Error updating template:', error);
      return res.status(500).json({
        success: false,
        message: 'Server error while updating template'
      });
    }
  }
} 