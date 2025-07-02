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
    .withMessage('Task name must be between 3 and 100 characters'),
  
  body('professions')
    .isArray({ min: 1 })
    .withMessage('At least one profession must be specified')
    .custom((value) => {
      if (!Array.isArray(value)) return false;
      return value.every(prof => Object.values(ProfessionType).includes(prof));
    })
    .withMessage('Invalid profession'),
  
  body('levels')
    .isObject()
    .withMessage('Levels must be an object')
    .custom((value, { req }) => {
      if (!req.body.professions) return true;
      return req.body.professions.every((prof: string) => 
        value[prof] !== undefined && 
        Number.isInteger(value[prof]) && 
        value[prof] >= 1 && 
        value[prof] <= 100
      );
    })
    .withMessage('All specified professions must have a level between 1 and 100'),
  
  body('deadline')
    .isISO8601()
    .withMessage('Deadline must be in ISO 8601 format'),
  
  body('priority')
    .isIn(Object.values(Priority))
    .withMessage('Invalid priority'),
  
  body('description')
    .optional({ values: 'falsy' })
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Description must be between 10 and 1000 characters'),
  
  body('createdBy')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Creator name is required'),
  
  body('shipTo')
    .optional({ values: 'falsy' })
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Ship to location is required if provided'),
  
  body('takeFrom')
    .optional({ values: 'falsy' })
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Take from location is required if provided'),
  
  body('resources')
    .optional()
    .isArray()
    .withMessage('Resources must be an array'),
  
  body('resources.*.name')
    .if(body('resources').exists())
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Resource name is required'),
  
  body('resources.*.needed')
    .if(body('resources').exists())
    .isInt({ min: 1 })
    .withMessage('Resource quantity must be a positive number'),
  
  body('resources.*.unit')
    .if(body('resources').exists())
    .optional({ values: 'falsy' })
    .trim()
    .isLength({ min: 1, max: 20 })
    .withMessage('Unit is required if provided'),
  
  handleValidationErrors
];

export const validateUpdateResource = [
  param('taskId')
    .custom((value) => {
      // Принимаем как MongoDB ObjectId так и числовые ID
      return /^[0-9a-fA-F]{24}$/.test(value) || /^\d+$/.test(value);
    })
    .withMessage('Invalid task ID'),
  
  param('resourceName')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Resource name is required'),
  
  body('quantity')
    .isInt()
    .withMessage('Quantity must be a number'),
  
  handleValidationErrors
];

export const validateClaimTask = [
  param('taskId')
    .custom((value) => {
      // Принимаем как MongoDB ObjectId так и числовые ID
      return /^[0-9a-fA-F]{24}$/.test(value) || /^\d+$/.test(value);
    })
    .withMessage('Invalid task ID'),
  
  handleValidationErrors
];

export const validateUser = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Имя должно быть от 2 до 50 символов'),
  
  body('email')
    .isEmail()
    .withMessage('Недопустимый email'),
  
  body('guild')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Название гильдии должно быть от 2 до 50 символов'),
  
  handleValidationErrors
];

export const validateRegister = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  
  body('email')
    .isEmail()
    .withMessage('Invalid email'),
  
  body('password')
    .isLength({ min: 6, max: 100 })
    .withMessage('Password must be between 6 and 100 characters'),
  
  body('guild')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Guild name must be between 2 and 50 characters'),
  
  handleValidationErrors
];

export const validateLogin = [
  body('email')
    .isEmail()
    .withMessage('Invalid email'),
  
  body('password')
    .isLength({ min: 1 })
    .withMessage('Password is required'),
  
  handleValidationErrors
]; 