"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateUser = exports.validateClaimTask = exports.validateUpdateResource = exports.validateCreateTask = exports.handleValidationErrors = void 0;
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
        .withMessage('Название задачи должно быть от 3 до 100 символов'),
    (0, express_validator_1.body)('professions')
        .isArray({ min: 1 })
        .withMessage('Должна быть указана хотя бы одна профессия')
        .custom((value) => {
        if (!Array.isArray(value))
            return false;
        return value.every(prof => Object.values(types_1.ProfessionType).includes(prof));
    })
        .withMessage('Недопустимая профессия'),
    (0, express_validator_1.body)('levels')
        .isObject()
        .withMessage('Уровни должны быть объектом')
        .custom((value, { req }) => {
        if (!req.body.professions)
            return true;
        return req.body.professions.every((prof) => value[prof] !== undefined &&
            Number.isInteger(value[prof]) &&
            value[prof] >= 1 &&
            value[prof] <= 100);
    })
        .withMessage('Все указанные профессии должны иметь уровень от 1 до 100'),
    (0, express_validator_1.body)('deadline')
        .isISO8601()
        .withMessage('Дедлайн должен быть в формате ISO 8601'),
    (0, express_validator_1.body)('priority')
        .isIn(Object.values(types_1.Priority))
        .withMessage('Недопустимый приоритет'),
    (0, express_validator_1.body)('description')
        .trim()
        .isLength({ min: 10, max: 1000 })
        .withMessage('Описание должно быть от 10 до 1000 символов'),
    (0, express_validator_1.body)('shipTo')
        .trim()
        .isLength({ min: 1, max: 100 })
        .withMessage('Место доставки обязательно'),
    (0, express_validator_1.body)('takeFrom')
        .trim()
        .isLength({ min: 1, max: 100 })
        .withMessage('Место получения обязательно'),
    (0, express_validator_1.body)('resources')
        .optional()
        .isArray()
        .withMessage('Ресурсы должны быть массивом'),
    (0, express_validator_1.body)('resources.*.name')
        .if((0, express_validator_1.body)('resources').exists())
        .trim()
        .isLength({ min: 1, max: 50 })
        .withMessage('Название ресурса обязательно'),
    (0, express_validator_1.body)('resources.*.needed')
        .if((0, express_validator_1.body)('resources').exists())
        .isInt({ min: 1 })
        .withMessage('Количество ресурса должно быть положительным числом'),
    (0, express_validator_1.body)('resources.*.unit')
        .if((0, express_validator_1.body)('resources').exists())
        .trim()
        .isLength({ min: 1, max: 20 })
        .withMessage('Единица измерения обязательна'),
    exports.handleValidationErrors
];
exports.validateUpdateResource = [
    (0, express_validator_1.param)('taskId')
        .isMongoId()
        .withMessage('Недопустимый ID задачи'),
    (0, express_validator_1.param)('resourceName')
        .trim()
        .isLength({ min: 1 })
        .withMessage('Название ресурса обязательно'),
    (0, express_validator_1.body)('quantity')
        .isInt({ min: 0 })
        .withMessage('Количество должно быть неотрицательным числом'),
    exports.handleValidationErrors
];
exports.validateClaimTask = [
    (0, express_validator_1.param)('taskId')
        .isMongoId()
        .withMessage('Недопустимый ID задачи'),
    exports.handleValidationErrors
];
exports.validateUser = [
    (0, express_validator_1.body)('name')
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('Имя должно быть от 2 до 50 символов'),
    (0, express_validator_1.body)('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Недопустимый email'),
    (0, express_validator_1.body)('guild')
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('Название гильдии должно быть от 2 до 50 символов'),
    exports.handleValidationErrors
];
//# sourceMappingURL=validation.js.map