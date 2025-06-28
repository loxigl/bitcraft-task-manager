import { body, param, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';
import { ProfessionType, Priority } from '../types';

export const handleValidationErrors = (req: Request, res: Response, next: NextFunction): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({
      success: false,
      errors: errors.array()
    });
    return;
  }
  next();
};

export const validateCreateTask = [
  body('name')
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Название задачи должно быть от 3 до 100 символов'),
  
  body('professions')
    .isArray({ min: 1 })
    .withMessage('Должна быть указана хотя бы одна профессия')
    .custom((value) => {
      if (!Array.isArray(value)) return false;
      return value.every(prof => Object.values(ProfessionType).includes(prof));
    })
    .withMessage('Недопустимая профессия'),
  
  body('levels')
    .isObject()
    .withMessage('Уровни должны быть объектом')
    .custom((value, { req }) => {
      if (!req.body.professions) return true;
      return req.body.professions.every((prof: string) => 
        value[prof] !== undefined && 
        Number.isInteger(value[prof]) && 
        value[prof] >= 1 && 
        value[prof] <= 100
      );
    })
    .withMessage('Все указанные профессии должны иметь уровень от 1 до 100'),
  
  body('deadline')
    .isISO8601()
    .withMessage('Дедлайн должен быть в формате ISO 8601'),
  
  body('priority')
    .isIn(Object.values(Priority))
    .withMessage('Недопустимый приоритет'),
  
  body('description')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Описание должно быть от 10 до 1000 символов'),
  
  body('shipTo')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Место доставки обязательно'),
  
  body('takeFrom')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Место получения обязательно'),
  
  body('resources')
    .optional()
    .isArray()
    .withMessage('Ресурсы должны быть массивом'),
  
  body('resources.*.name')
    .if(body('resources').exists())
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Название ресурса обязательно'),
  
  body('resources.*.needed')
    .if(body('resources').exists())
    .isInt({ min: 1 })
    .withMessage('Количество ресурса должно быть положительным числом'),
  
  body('resources.*.unit')
    .if(body('resources').exists())
    .trim()
    .isLength({ min: 1, max: 20 })
    .withMessage('Единица измерения обязательна'),
  
  handleValidationErrors
];

export const validateUpdateResource = [
  param('taskId')
    .isMongoId()
    .withMessage('Недопустимый ID задачи'),
  
  param('resourceName')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Название ресурса обязательно'),
  
  body('quantity')
    .isInt({ min: 0 })
    .withMessage('Количество должно быть неотрицательным числом'),
  
  handleValidationErrors
];

export const validateClaimTask = [
  param('taskId')
    .isMongoId()
    .withMessage('Недопустимый ID задачи'),
  
  handleValidationErrors
];

export const validateUser = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Имя должно быть от 2 до 50 символов'),
  
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Недопустимый email'),
  
  body('guild')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Название гильдии должно быть от 2 до 50 символов'),
  
  handleValidationErrors
]; 