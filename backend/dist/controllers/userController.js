"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const User_1 = require("../models/User");
const types_1 = require("../types");
class UserController {
    static async getAllUsers(req, res) {
        try {
            const { guild, sortBy = 'name', sortOrder = 'asc' } = req.query;
            const filter = {};
            if (guild) {
                filter.guild = guild;
            }
            const sortOptions = {};
            sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;
            const users = await User_1.UserModel.find(filter).sort(sortOptions);
            res.json({
                success: true,
                data: users
            });
        }
        catch (error) {
            console.error('Ошибка получения пользователей:', error);
            res.status(500).json({
                success: false,
                message: 'Ошибка сервера при получении пользователей'
            });
        }
    }
    static async getUserById(req, res) {
        try {
            const { userId } = req.params;
            const user = await User_1.UserModel.findById(userId);
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'Пользователь не найден'
                });
            }
            return res.json({
                success: true,
                data: user
            });
        }
        catch (error) {
            console.error('Ошибка получения пользователя:', error);
            return res.status(500).json({
                success: false,
                message: 'Ошибка сервера при получении пользователя'
            });
        }
    }
    static async getUserByName(req, res) {
        try {
            const { userName } = req.params;
            const user = await User_1.UserModel.findOne({ name: userName });
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'Пользователь не найден'
                });
            }
            return res.json({
                success: true,
                data: user
            });
        }
        catch (error) {
            console.error('Ошибка получения пользователя:', error);
            return res.status(500).json({
                success: false,
                message: 'Ошибка сервера при получении пользователя'
            });
        }
    }
    static async createUser(req, res) {
        try {
            const { name, email, guild, avatar } = req.body;
            const existingUser = await User_1.UserModel.findOne({
                $or: [{ name }, { email }]
            });
            if (existingUser) {
                return res.status(409).json({
                    success: false,
                    message: existingUser.name === name
                        ? 'Пользователь с таким именем уже существует'
                        : 'Пользователь с таким email уже существует'
                });
            }
            const newUser = new User_1.UserModel({
                name,
                email,
                guild,
                avatar,
                level: 1,
                completedTasks: 0,
                currentTasks: 0,
                reputation: 0
            });
            await newUser.save();
            return res.status(201).json({
                success: true,
                data: newUser,
                message: 'Пользователь успешно создан'
            });
        }
        catch (error) {
            console.error('Ошибка создания пользователя:', error);
            return res.status(500).json({
                success: false,
                message: 'Ошибка сервера при создании пользователя'
            });
        }
    }
    static async updateProfessionLevel(req, res) {
        try {
            const { userId, profession } = req.params;
            const { level } = req.body;
            if (!Object.values(types_1.ProfessionType).includes(profession)) {
                return res.status(400).json({
                    success: false,
                    message: 'Недопустимая профессия'
                });
            }
            if (typeof level !== 'number' || level < 0 || level > 100) {
                return res.status(400).json({
                    success: false,
                    message: 'Уровень должен быть числом от 0 до 100'
                });
            }
            const user = await User_1.UserModel.findById(userId);
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'Пользователь не найден'
                });
            }
            user.professions.set(profession, { level });
            await user.save();
            return res.json({
                success: true,
                data: user,
                message: 'Уровень профессии обновлен'
            });
        }
        catch (error) {
            console.error('Ошибка обновления уровня профессии:', error);
            return res.status(500).json({
                success: false,
                message: 'Ошибка сервера при обновлении уровня профессии'
            });
        }
    }
    static async updateProfile(req, res) {
        try {
            const { userId } = req.params;
            const updates = req.body;
            delete updates._id;
            delete updates.createdAt;
            delete updates.updatedAt;
            delete updates.completedTasks;
            delete updates.currentTasks;
            delete updates.reputation;
            const user = await User_1.UserModel.findByIdAndUpdate(userId, { $set: updates }, { new: true, runValidators: true });
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'Пользователь не найден'
                });
            }
            return res.json({
                success: true,
                data: user,
                message: 'Профиль успешно обновлен'
            });
        }
        catch (error) {
            console.error('Ошибка обновления профиля:', error);
            return res.status(500).json({
                success: false,
                message: 'Ошибка сервера при обновлении профиля'
            });
        }
    }
    static async deleteUser(req, res) {
        try {
            const { userId } = req.params;
            const user = await User_1.UserModel.findByIdAndDelete(userId);
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'Пользователь не найден'
                });
            }
            return res.json({
                success: true,
                message: 'Пользователь успешно удален'
            });
        }
        catch (error) {
            console.error('Ошибка удаления пользователя:', error);
            return res.status(500).json({
                success: false,
                message: 'Ошибка сервера при удалении пользователя'
            });
        }
    }
    static async updateGuild(req, res) {
        try {
            const { userId } = req.params;
            const { guild } = req.body;
            if (!guild || typeof guild !== 'string' || guild.trim().length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Guild name is required and must be a non-empty string'
                });
            }
            const user = await User_1.UserModel.findByIdAndUpdate(userId, { $set: { guild: guild.trim() } }, { new: true, runValidators: true });
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }
            return res.json({
                success: true,
                data: user,
                message: 'Guild successfully updated'
            });
        }
        catch (error) {
            console.error('Error updating guild:', error);
            return res.status(500).json({
                success: false,
                message: 'Server error while updating guild'
            });
        }
    }
    static async getUserStats(req, res) {
        try {
            const { userId } = req.params;
            const user = await User_1.UserModel.findById(userId);
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'Пользователь не найден'
                });
            }
            const professionsMap = user.professions;
            const stats = {
                level: user.level,
                reputation: user.reputation,
                completedTasks: user.completedTasks,
                currentTasks: user.currentTasks,
                professions: Object.fromEntries(professionsMap),
                totalProfessionLevels: Array.from(professionsMap.values()).reduce((sum, prof) => sum + prof.level, 0),
                averageProfessionLevel: Array.from(professionsMap.values()).reduce((sum, prof) => sum + prof.level, 0) / professionsMap.size
            };
            return res.json({
                success: true,
                data: stats
            });
        }
        catch (error) {
            console.error('Ошибка получения статистики:', error);
            return res.status(500).json({
                success: false,
                message: 'Ошибка сервера при получении статистики'
            });
        }
    }
}
exports.UserController = UserController;
//# sourceMappingURL=userController.js.map