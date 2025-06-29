import mongoose from 'mongoose';
import { UserModel } from '../models/User';
import { UserRole, ProfessionType } from '../types';

async function createAdminUser() {
  try {
    // Подключение к MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/bitcraft');
    console.log('Подключено к MongoDB');

    // Проверяем, существует ли уже админ
    const existingAdmin = await UserModel.findOne({ role: UserRole.ADMIN });
    if (existingAdmin) {
      console.log('Админ уже существует:', existingAdmin.name);
      return;
    }

    // Создаем базовые профессии
    const defaultProfessions = new Map();
    Object.values(ProfessionType).forEach(profession => {
      defaultProfessions.set(profession, { level: 50 }); // Админ получает уровень 50 во всех профессиях
    });

    // Создаем админ-пользователя
    const adminUser = new UserModel({
      name: 'Admin',
      email: 'admin@bitcraft.local',
      password: 'admin123', // Будет захеширован автоматически
      guild: 'BitCraft Staff',
      role: UserRole.ADMIN,
      level: 50,
      professions: defaultProfessions,
      completedTasks: 0,
      currentTasks: 0,
      reputation: 1000,
      avatar: '/placeholder.svg'
    });

    await adminUser.save();
    console.log('Админ-пользователь создан успешно!');
    console.log('Email: admin@bitcraft.local');
    console.log('Password: admin123');

  } catch (error) {
    console.error('Ошибка создания админа:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Отключено от MongoDB');
  }
}

createAdminUser(); 