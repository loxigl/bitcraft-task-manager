import mongoose from 'mongoose';
import { UserModel } from '../models/User';
import { UserRole, ProfessionType } from '../types';

async function createTestUser() {
  try {
    // Подключение к MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/bitcraft');
    console.log('Подключено к MongoDB');

    // Проверяем, существует ли уже тестовый пользователь
    const existingUser = await UserModel.findOne({ email: 'user@bitcraft.local' });
    if (existingUser) {
      console.log('Тестовый пользователь уже существует:', existingUser.name);
      return;
    }

    // Создаем базовые профессии с разными уровнями
    const defaultProfessions = new Map();
    defaultProfessions.set(ProfessionType.MINING, { level: 35 });
    defaultProfessions.set(ProfessionType.SMITHING, { level: 28 });
    defaultProfessions.set(ProfessionType.CARPENTRY, { level: 22 });
    defaultProfessions.set(ProfessionType.FARMING, { level: 18 });
    defaultProfessions.set(ProfessionType.FISHING, { level: 15 });
    // Остальные профессии на уровне 0
    Object.values(ProfessionType).forEach(profession => {
      if (!defaultProfessions.has(profession)) {
        defaultProfessions.set(profession, { level: 0 });
      }
    });

    // Создаем обычного пользователя
    const testUser = new UserModel({
      name: 'John Crafter',
      email: 'user@bitcraft.local',
      password: 'user123', // Будет захеширован автоматически
      guild: 'Crafters United',
      role: UserRole.MEMBER,
      level: 25,
      professions: defaultProfessions,
      completedTasks: 5,
      currentTasks: 2,
      reputation: 150,
      avatar: '/placeholder.svg'
    });

    await testUser.save();
    console.log('Тестовый пользователь создан успешно!');
    console.log('Email: user@bitcraft.local');
    console.log('Password: user123');

  } catch (error) {
    console.error('Ошибка создания тестового пользователя:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Отключено от MongoDB');
  }
}

createTestUser(); 