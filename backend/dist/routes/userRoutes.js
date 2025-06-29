"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const userController_1 = require("../controllers/userController");
const validation_1 = require("../middleware/validation");
const router = (0, express_1.Router)();
router.get('/', userController_1.UserController.getAllUsers);
router.get('/:userId', userController_1.UserController.getUserById);
router.get('/name/:userName', userController_1.UserController.getUserByName);
router.post('/', validation_1.validateUser, userController_1.UserController.createUser);
router.put('/:userId/professions/:profession', userController_1.UserController.updateProfessionLevel);
router.put('/:userId/profile', userController_1.UserController.updateProfile);
router.put('/:userId/guild', userController_1.UserController.updateGuild);
router.get('/:userId/stats', userController_1.UserController.getUserStats);
router.delete('/:userId', userController_1.UserController.deleteUser);
exports.default = router;
//# sourceMappingURL=userRoutes.js.map