"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateLogin = exports.validateRegister = exports.validateUser = exports.validateClaimTask = exports.validateUpdateResource = exports.validateCreateTask = exports.handleValidationErrors = void 0;
const express_validator_1 = require("express-validator");
const types_1 = require("../types");
const handleValidationErrors = (req, res, next) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        res.status(400).json({
            success: false,
            errors: errors.array()
        });
        return;
    }
    next();
};
exports.handleValidationErrors = handleValidationErrors;
exports.validateCreateTask = [
    (0, express_validator_1.body)('name')
        .trim()
        .isLength({ min: 3, max: 100 })
        .withMessage('Task name must be between 3 and 100 characters'),
    (0, express_validator_1.body)('professions')
        .isArray({ min: 1 })
        .withMessage('At least one profession must be specified')
        .custom((value) => {
        if (!Array.isArray(value))
            return false;
        return value.every(prof => Object.values(types_1.ProfessionType).includes(prof));
    })
        .withMessage('Invalid profession'),
    (0, express_validator_1.body)('levels')
        .isObject()
        .withMessage('Levels must be an object')
        .custom((value, { req }) => {
        if (!req.body.professions)
            return true;
        return req.body.professions.every((prof) => value[prof] !== undefined &&
            Number.isInteger(value[prof]) &&
            value[prof] >= 1 &&
            value[prof] <= 100);
    })
        .withMessage('All specified professions must have a level between 1 and 100'),
    (0, express_validator_1.body)('deadline')
        .isISO8601()
        .withMessage('Deadline must be in ISO 8601 format'),
    (0, express_validator_1.body)('priority')
        .isIn(Object.values(types_1.Priority))
        .withMessage('Invalid priority'),
    (0, express_validator_1.body)('description')
        .optional({ values: 'falsy' })
        .trim()
        .isLength({ min: 10, max: 1000 })
        .withMessage('Description must be between 10 and 1000 characters'),
    (0, express_validator_1.body)('createdBy')
        .trim()
        .isLength({ min: 1, max: 50 })
        .withMessage('Creator name is required'),
    (0, express_validator_1.body)('shipTo')
        .optional({ values: 'falsy' })
        .trim()
        .isLength({ min: 1, max: 100 })
        .withMessage('Ship to location is required if provided'),
    (0, express_validator_1.body)('takeFrom')
        .optional({ values: 'falsy' })
        .trim()
        .isLength({ min: 1, max: 100 })
        .withMessage('Take from location is required if provided'),
    (0, express_validator_1.body)('resources')
        .optional()
        .isArray()
        .withMessage('Resources must be an array'),
    (0, express_validator_1.body)('resources.*.name')
        .if((0, express_validator_1.body)('resources').exists())
        .trim()
        .isLength({ min: 1, max: 50 })
        .withMessage('Resource name is required'),
    (0, express_validator_1.body)('resources.*.needed')
        .if((0, express_validator_1.body)('resources').exists())
        .isInt({ min: 1 })
        .withMessage('Resource quantity must be a positive number'),
    (0, express_validator_1.body)('resources.*.unit')
        .if((0, express_validator_1.body)('resources').exists())
        .optional({ values: 'falsy' })
        .trim()
        .isLength({ min: 1, max: 20 })
        .withMessage('Unit is required if provided'),
    exports.handleValidationErrors
];
exports.validateUpdateResource = [
    (0, express_validator_1.param)('taskId')
        .custom((value) => {
        return /^[0-9a-fA-F]{24}$/.test(value) || /^\d+$/.test(value);
    })
        .withMessage('Invalid task ID'),
    (0, express_validator_1.param)('resourceName')
        .trim()
        .isLength({ min: 1 })
        .withMessage('Resource name is required'),
    (0, express_validator_1.body)('quantity')
        .isInt({ min: 0 })
        .withMessage('Quantity must be a non-negative number'),
    exports.handleValidationErrors
];
exports.validateClaimTask = [
    (0, express_validator_1.param)('taskId')
        .custom((value) => {
        return /^[0-9a-fA-F]{24}$/.test(value) || /^\d+$/.test(value);
    })
        .withMessage('Invalid task ID'),
    exports.handleValidationErrors
];
exports.validateUser = [
    (0, express_validator_1.body)('name')
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('Имя должно быть от 2 до 50 символов'),
    (0, express_validator_1.body)('email')
        .isEmail()
        .withMessage('Недопустимый email'),
    (0, express_validator_1.body)('guild')
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('Название гильдии должно быть от 2 до 50 символов'),
    exports.handleValidationErrors
];
exports.validateRegister = [
    (0, express_validator_1.body)('name')
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('Name must be between 2 and 50 characters'),
    (0, express_validator_1.body)('email')
        .isEmail()
        .withMessage('Invalid email'),
    (0, express_validator_1.body)('password')
        .isLength({ min: 6, max: 100 })
        .withMessage('Password must be between 6 and 100 characters'),
    (0, express_validator_1.body)('guild')
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('Guild name must be between 2 and 50 characters'),
    exports.handleValidationErrors
];
exports.validateLogin = [
    (0, express_validator_1.body)('email')
        .isEmail()
        .withMessage('Invalid email'),
    (0, express_validator_1.body)('password')
        .isLength({ min: 1 })
        .withMessage('Password is required'),
    exports.handleValidationErrors
];
//# sourceMappingURL=validation.js.map