import mongoose from 'mongoose';
import { TaskModel } from '../models/Task';
import { TaskStatus, Priority, ProfessionType, TaskType } from '../types';

async function createTestTasks() {
  try {
    // Подключение к MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/bitcraft');
    console.log('Подключено к MongoDB');

    // Удаляем старые тестовые задачи
    await TaskModel.deleteMany({ createdBy: 'System' });
    console.log('Старые тестовые задачи удалены');

    // Создаем guild задачу
    const guildTask = new TaskModel({
      name: 'Guild Castle Upgrade Materials',
      professions: [ProfessionType.MASONRY, ProfessionType.CARPENTRY, ProfessionType.MINING],
      levels: new Map([
        [ProfessionType.MASONRY, 40],
        [ProfessionType.CARPENTRY, 35],
        [ProfessionType.MINING, 30]
      ]),
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 дней
      priority: Priority.HIGH,
      description: 'Collect materials for upgrading the guild castle. This is a high-priority task for guild development.',
      resources: [
        {
          name: 'Stone Blocks',
          needed: 500,
          gathered: 0,
          unit: 'pieces',
          contributors: new Map()
        },
        {
          name: 'Iron Ingots',
          needed: 200,
          gathered: 0,
          unit: 'pieces',
          contributors: new Map()
        },
        {
          name: 'Wooden Planks',
          needed: 300,
          gathered: 0,
          unit: 'pieces',
          contributors: new Map()
        }
      ],
      assignedTo: [],
      createdBy: 'System',
      shipTo: 'Guild Warehouse',
      takeFrom: 'Various Locations',
      taskType: TaskType.GUILD,
      subtasks: [
        {
          id: 1,
          name: 'Mine Stone',
          completed: false,
          assignedTo: [],
          professions: [ProfessionType.MINING],
          levels: new Map([[ProfessionType.MINING, 30]]),
          dependencies: [],
          description: 'Mine stone blocks from the quarry',
          shipTo: 'Guild Warehouse',
          takeFrom: 'Northern Quarry',
          resources: [
            {
              name: 'Stone Blocks',
              needed: 500,
              gathered: 0,
              unit: 'pieces',
              contributors: new Map()
            }
          ],
          subtasks: []
        }
      ]
    });

    // Создаем member задачу
    const memberTask = new TaskModel({
      name: 'Personal Equipment Crafting',
      professions: [ProfessionType.SMITHING, ProfessionType.LEATHERWORKING],
      levels: new Map([
        [ProfessionType.SMITHING, 25],
        [ProfessionType.LEATHERWORKING, 20]
      ]),
      deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 дня
      priority: Priority.MEDIUM,
      description: 'Craft personal equipment for new guild members. Anyone can help with this task.',
      resources: [
        {
          name: 'Iron Ore',
          needed: 50,
          gathered: 0,
          unit: 'kg',
          contributors: new Map()
        },
        {
          name: 'Leather',
          needed: 20,
          gathered: 0,
          unit: 'pieces',
          contributors: new Map()
        }
      ],
      assignedTo: [],
      createdBy: 'System',
      shipTo: 'Equipment Storage',
      takeFrom: 'Crafting Materials Storage',
      taskType: TaskType.MEMBER,
      subtasks: []
    });

    // Создаем еще одну member задачу с подзадачами
    const complexMemberTask = new TaskModel({
      name: 'Food Supply Collection',
      professions: [ProfessionType.FARMING, ProfessionType.FISHING, ProfessionType.HUNTING],
      levels: new Map([
        [ProfessionType.FARMING, 15],
        [ProfessionType.FISHING, 20],
        [ProfessionType.HUNTING, 25]
      ]),
      deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 дней
      priority: Priority.MEDIUM,
      description: 'Collect various food supplies for the guild kitchen. Multiple gathering methods available.',
      resources: [
        {
          name: 'Grain',
          needed: 100,
          gathered: 0,
          unit: 'kg',
          contributors: new Map()
        },
        {
          name: 'Fish',
          needed: 50,
          gathered: 0,
          unit: 'pieces',
          contributors: new Map()
        },
        {
          name: 'Meat',
          needed: 30,
          gathered: 0,
          unit: 'kg',
          contributors: new Map()
        }
      ],
      assignedTo: [],
      createdBy: 'System',
      shipTo: 'Guild Kitchen',
      takeFrom: 'Various Sources',
      taskType: TaskType.MEMBER,
      subtasks: [
        {
          id: 1,
          name: 'Farm Grain',
          completed: false,
          assignedTo: [],
          professions: [ProfessionType.FARMING],
          levels: new Map([[ProfessionType.FARMING, 15]]),
          dependencies: [],
          description: 'Plant and harvest grain from the guild fields',
          shipTo: 'Guild Kitchen',
          takeFrom: 'Guild Fields',
          resources: [
            {
              name: 'Grain',
              needed: 100,
              gathered: 0,
              unit: 'kg',
              contributors: new Map()
            }
          ],
          subtasks: []
        },
        {
          id: 2,
          name: 'Catch Fish',
          completed: false,
          assignedTo: [],
          professions: [ProfessionType.FISHING],
          levels: new Map([[ProfessionType.FISHING, 20]]),
          dependencies: [],
          description: 'Catch fresh fish from the nearby lake',
          shipTo: 'Guild Kitchen',
          takeFrom: 'Crystal Lake',
          resources: [
            {
              name: 'Fish',
              needed: 50,
              gathered: 0,
              unit: 'pieces',
              contributors: new Map()
            }
          ],
          subtasks: []
        }
      ]
    });

    // Сохраняем все задачи
    await guildTask.save();
    await memberTask.save();
    await complexMemberTask.save();

    console.log('Тестовые задачи созданы успешно!');
    console.log('- 1 Guild Task: "Guild Castle Upgrade Materials"');
    console.log('- 2 Member Tasks: "Personal Equipment Crafting", "Food Supply Collection"');

  } catch (error) {
    console.error('Ошибка создания тестовых задач:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Отключено от MongoDB');
  }
}

createTestTasks(); 