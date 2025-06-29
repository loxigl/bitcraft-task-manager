import { Request, Response } from 'express';
import { UserModel } from '../models/User';
import { ProfessionType } from '../types';

export class UserController {
  // Получить всех пользователей
  static async getAllUsers(req: Request, res: Response) {
    try {
      const { guild, sortBy = 'name', sortOrder = 'asc' } = req.query;
      
      const filter: any = {};
      if (guild) {
        filter.guild = guild;
      }

      const sortOptions: any = {};
      sortOptions[sortBy as string] = sortOrder === 'asc' ? 1 : -1;

      const users = await UserModel.find(filter).sort(sortOptions);

      res.json({
        success: true,
        data: users
      });
    } catch (error) {
      console.error('Ошибка получения пользователей:', error);
      res.status(500).json({
        success: false,
        message: 'Ошибка сервера при получении пользователей'
      });
    }
  }

  // Получить пользователя по ID
  static async getUserById(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      
      const user = await UserModel.findById(userId);
      
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
    } catch (error) {
      console.error('Ошибка получения пользователя:', error);
      return res.status(500).json({
        success: false,
        message: 'Ошибка сервера при получении пользователя'
      });
    }
  }

  // Получить пользователя по имени
  static async getUserByName(req: Request, res: Response) {
    try {
      const { userName } = req.params;
      
      const user = await UserModel.findOne({ name: userName });
      
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
    } catch (error) {
      console.error('Ошибка получения пользователя:', error);
      return res.status(500).json({
        success: false,
        message: 'Ошибка сервера при получении пользователя'
      });
    }
  }

  // Создать нового пользователя
  static async createUser(req: Request, res: Response) {
    try {
      const { name, email, guild, avatar } = req.body;

      // Проверяем уникальность имени и email
      const existingUser = await UserModel.findOne({
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

      const newUser = new UserModel({
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
    } catch (error) {
      console.error('Ошибка создания пользователя:', error);
      return res.status(500).json({
        success: false,
        message: 'Ошибка сервера при создании пользователя'
      });
    }
  }

  // Обновить уровень профессии пользователя
  static async updateProfessionLevel(req: Request, res: Response) {
    try {
      const { userId, profession } = req.params;
      const { level } = req.body;

      if (!Object.values(ProfessionType).includes(profession as ProfessionType)) {
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

      const user = await UserModel.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Пользователь не найден'
        });
      }

      (user.professions as Map<ProfessionType, any>).set(profession as ProfessionType, { level });
      await user.save();

      return res.json({
        success: true,
        data: user,
        message: 'Уровень профессии обновлен'
      });
    } catch (error) {
      console.error('Ошибка обновления уровня профессии:', error);
      return res.status(500).json({
        success: false,
        message: 'Ошибка сервера при обновлении уровня профессии'
      });
    }
  }

  // Обновить профиль пользователя
  static async updateProfile(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const updates = req.body;

      // Удаляем поля, которые нельзя обновлять напрямую
      delete updates._id;
      delete updates.createdAt;
      delete updates.updatedAt;
      delete updates.completedTasks;
      delete updates.currentTasks;
      delete updates.reputation;

      const user = await UserModel.findByIdAndUpdate(
        userId,
        { $set: updates },
        { new: true, runValidators: true }
      );

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
    } catch (error) {
      console.error('Ошибка обновления профиля:', error);
      return res.status(500).json({
        success: false,
        message: 'Ошибка сервера при обновлении профиля'
      });
    }
  }

  // Удалить пользователя
  static async deleteUser(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      
      const user = await UserModel.findByIdAndDelete(userId);
      
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
    } catch (error) {
      console.error('Ошибка удаления пользователя:', error);
      return res.status(500).json({
        success: false,
        message: 'Ошибка сервера при удалении пользователя'
      });
    }
  }

  // Обновить гильдию пользователя
  static async updateGuild(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const { guild } = req.body;

      if (!guild || typeof guild !== 'string' || guild.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Guild name is required and must be a non-empty string'
        });
      }

      const user = await UserModel.findByIdAndUpdate(
        userId,
        { $set: { guild: guild.trim() } },
        { new: true, runValidators: true }
      );

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
    } catch (error) {
      console.error('Error updating guild:', error);
      return res.status(500).json({
        success: false,
        message: 'Server error while updating guild'
      });
    }
  }

  // Получить статистику пользователя
  static async getUserStats(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      
      const user = await UserModel.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Пользователь не найден'
        });
      }

      // Дополнительная статистика может быть добавлена здесь
      const professionsMap = user.professions as Map<ProfessionType, any>;
      const stats = {
        level: user.level,
        reputation: user.reputation,
        completedTasks: user.completedTasks,
        currentTasks: user.currentTasks,
        professions: Object.fromEntries(professionsMap),
        totalProfessionLevels: Array.from(professionsMap.values()).reduce((sum: number, prof: any) => sum + prof.level, 0),
        averageProfessionLevel: Array.from(professionsMap.values()).reduce((sum: number, prof: any) => sum + prof.level, 0) / professionsMap.size
      };

      return res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Ошибка получения статистики:', error);
      return res.status(500).json({
        success: false,
        message: 'Ошибка сервера при получении статистики'
      });
    }
  }
} 