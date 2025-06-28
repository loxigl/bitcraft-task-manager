import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { UserModel } from '../models/User';
import { TaskModel } from '../models/Task';
import { ProfessionType, TaskStatus, Priority } from '../types';

dotenv.config();

const seedUsers = async () => {
  // Создаем тестового пользователя Lyra Moonweaver
  const lyra = new UserModel({
    name: "Lyra Moonweaver",
    email: "lyra@bitcraft.guild",
    avatar: "/placeholder.svg?height=100&width=100",
    level: 67,
    guild: "BitCraft",
    professions: new Map([
      [ProfessionType.CARPENTRY, { level: 45 }],
      [ProfessionType.FARMING, { level: 72 }],
      [ProfessionType.FISHING, { level: 38 }],
      [ProfessionType.FORAGING, { level: 55 }],
      [ProfessionType.FORESTRY, { level: 62 }],
      [ProfessionType.HUNTING, { level: 25 }],
      [ProfessionType.LEATHERWORKING, { level: 33 }],
      [ProfessionType.MASONRY, { level: 18 }],
      [ProfessionType.MINING, { level: 85 }],
      [ProfessionType.SCHOLAR, { level: 91 }],
      [ProfessionType.SMITHING, { level: 67 }],
      [ProfessionType.TAILORING, { level: 54 }]
    ]),
    completedTasks: 47,
    currentTasks: 3,
    reputation: 2840
  });

  // Создаем других пользователей
  const marcus = new UserModel({
    name: "Marcus the Woodsman",
    email: "marcus@bitcraft.guild",
    level: 52,
    guild: "BitCraft",
    professions: new Map([
      [ProfessionType.FORESTRY, { level: 85 }],
      [ProfessionType.CARPENTRY, { level: 78 }],
      [ProfessionType.HUNTING, { level: 65 }]
    ]),
    completedTasks: 23,
    currentTasks: 2,
    reputation: 1650
  });

  const elena = new UserModel({
    name: "Elena the Smith",
    email: "elena@bitcraft.guild",
    level: 48,
    guild: "BitCraft",
    professions: new Map([
      [ProfessionType.SMITHING, { level: 88 }],
      [ProfessionType.MINING, { level: 70 }],
      [ProfessionType.MASONRY, { level: 45 }]
    ]),
    completedTasks: 31,
    currentTasks: 1,
    reputation: 1920
  });

  const tom = new UserModel({
    name: "Tom the Farmer",
    email: "tom@bitcraft.guild",
    level: 35,
    guild: "BitCraft",
    professions: new Map([
      [ProfessionType.FARMING, { level: 80 }],
      [ProfessionType.FORAGING, { level: 45 }]
    ]),
    completedTasks: 18,
    currentTasks: 2,
    reputation: 1100
  });

  const sarah = new UserModel({
    name: "Sarah the Gardener",
    email: "sarah@bitcraft.guild",
    level: 28,
    guild: "BitCraft",
    professions: new Map([
      [ProfessionType.FARMING, { level: 65 }],
      [ProfessionType.FORAGING, { level: 50 }]
    ]),
    completedTasks: 12,
    currentTasks: 1,
    reputation: 750
  });

  const thorin = new UserModel({
    name: "Guild Master Thorin",
    email: "thorin@bitcraft.guild",
    level: 95,
    guild: "BitCraft",
    professions: new Map([
      [ProfessionType.SCHOLAR, { level: 95 }],
      [ProfessionType.SMITHING, { level: 80 }],
      [ProfessionType.MASONRY, { level: 75 }]
    ]),
    completedTasks: 150,
    currentTasks: 0,
    reputation: 8500
  });

  const luna = new UserModel({
    name: "Luna the Forager",
    email: "luna@bitcraft.guild",
    level: 42,
    guild: "BitCraft",
    professions: new Map([
      [ProfessionType.FORAGING, { level: 88 }],
      [ProfessionType.HUNTING, { level: 55 }]
    ]),
    completedTasks: 25,
    currentTasks: 1,
    reputation: 1400
  });

  const meredith = new UserModel({
    name: "Chef Meredith",
    email: "meredith@bitcraft.guild",
    level: 38,
    guild: "BitCraft",
    professions: new Map([
      [ProfessionType.FARMING, { level: 60 }],
      [ProfessionType.FISHING, { level: 70 }],
      [ProfessionType.FORAGING, { level: 65 }]
    ]),
    completedTasks: 20,
    currentTasks: 1,
    reputation: 1200
  });

  await Promise.all([
    lyra.save(),
    marcus.save(),
    elena.save(),
    tom.save(),
    sarah.save(),
    thorin.save(),
    luna.save(),
    meredith.save()
  ]);

  console.log('✅ Пользователи созданы');
};

const seedTasks = async () => {
  // Задача 1: Build Wooden Fortress Gate
  const task1 = new TaskModel({
    id: 1,
    name: "Build Wooden Fortress Gate",
    professions: [ProfessionType.CARPENTRY, ProfessionType.FORESTRY],
    levels: new Map([
      [ProfessionType.CARPENTRY, 75],
      [ProfessionType.FORESTRY, 60]
    ]),
    deadline: "2024-01-15",
    status: TaskStatus.OPEN,
    priority: Priority.HIGH,
    description: "Construct a massive wooden gate for the guild fortress. Requires master carpentry and quality lumber.",
    resources: [
      {
        name: "Oak Planks",
        needed: 50,
        gathered: 12,
        unit: "pieces",
        contributors: new Map([
          ["Marcus the Woodsman", 8],
          ["Lyra Moonweaver", 4]
        ])
      },
      {
        name: "Iron Hinges",
        needed: 8,
        gathered: 3,
        unit: "pieces",
        contributors: new Map([
          ["Elena the Smith", 3]
        ])
      },
      {
        name: "Reinforcement Bars",
        needed: 12,
        gathered: 0,
        unit: "pieces",
        contributors: new Map()
      }
    ],
    assignedTo: ["Marcus the Woodsman", "Lyra Moonweaver"],
    createdBy: "Guild Master Thorin",
    shipTo: "Fortress Entrance",
    takeFrom: "Lumber Yard",
    subtasks: [
      {
        id: 1,
        name: "Harvest Oak Trees",
        completed: false,
        assignedTo: ["Marcus the Woodsman"],
        professions: [ProfessionType.FORESTRY],
        levels: new Map([[ProfessionType.FORESTRY, 60]]),
        dependencies: [],
        description: "Cut down mature oak trees for quality lumber",
        shipTo: "Sawmill",
        takeFrom: "Ancient Forest",
        resources: [
          {
            name: "Oak Logs",
            needed: 25,
            gathered: 18,
            unit: "logs",
            contributors: new Map([["Marcus the Woodsman", 18]])
          },
          {
            name: "Forestry Tools",
            needed: 1,
            gathered: 1,
            unit: "set",
            contributors: new Map([["Marcus the Woodsman", 1]])
          }
        ],
        subtasks: [
          {
            id: 11,
            name: "Scout Tree Locations",
            completed: true,
            assignedTo: ["Marcus the Woodsman"],
            professions: [ProfessionType.FORESTRY],
            levels: new Map([[ProfessionType.FORESTRY, 45]]),
            dependencies: [],
            description: "Identify the best oak trees for harvesting",
            shipTo: null,
            takeFrom: null,
            resources: [
              {
                name: "Scouting Reports",
                needed: 3,
                gathered: 3,
                unit: "reports",
                contributors: new Map([["Marcus the Woodsman", 3]])
              }
            ]
          },
          {
            id: 12,
            name: "Prepare Forestry Tools",
            completed: false,
            assignedTo: ["Elena the Smith"],
            professions: [ProfessionType.SMITHING],
            levels: new Map([[ProfessionType.SMITHING, 40]]),
            dependencies: [],
            description: "Sharpen axes and prepare forestry equipment",
            shipTo: null,
            takeFrom: "Tool Storage",
            resources: [
              {
                name: "Sharpened Axes",
                needed: 3,
                gathered: 2,
                unit: "axes",
                contributors: new Map([["Elena the Smith", 2]])
              },
              {
                name: "Tool Oil",
                needed: 5,
                gathered: 5,
                unit: "bottles",
                contributors: new Map([["Elena the Smith", 5]])
              }
            ]
          }
        ]
      },
      {
        id: 2,
        name: "Process Lumber",
        completed: false,
        assignedTo: [],
        professions: [ProfessionType.CARPENTRY],
        levels: new Map([[ProfessionType.CARPENTRY, 50]]),
        dependencies: [1],
        description: "Mill the oak logs into usable planks",
        shipTo: "Workshop",
        takeFrom: "Sawmill",
        resources: [
          {
            name: "Milled Planks",
            needed: 50,
            gathered: 0,
            unit: "planks",
            contributors: new Map()
          }
        ]
      }
    ]
  });

  // Задача 2: Harvest Festival Feast
  const task2 = new TaskModel({
    id: 2,
    name: "Harvest Festival Feast",
    professions: [ProfessionType.FARMING, ProfessionType.FISHING, ProfessionType.FORAGING],
    levels: new Map([
      [ProfessionType.FARMING, 50],
      [ProfessionType.FISHING, 45],
      [ProfessionType.FORAGING, 40]
    ]),
    deadline: "2024-01-20",
    status: TaskStatus.OPEN,
    priority: Priority.MEDIUM,
    description: "Prepare ingredients for the guild's harvest festival feast.",
    resources: [
      {
        name: "Fresh Vegetables",
        needed: 30,
        gathered: 15,
        unit: "baskets",
        contributors: new Map([
          ["Tom the Farmer", 10],
          ["Sarah the Gardener", 5]
        ])
      },
      {
        name: "River Fish",
        needed: 20,
        gathered: 8,
        unit: "fish",
        contributors: new Map([
          ["Lyra Moonweaver", 8]
        ])
      },
      {
        name: "Wild Herbs",
        needed: 15,
        gathered: 12,
        unit: "bundles",
        contributors: new Map([
          ["Luna the Forager", 12]
        ])
      }
    ],
    assignedTo: ["Tom the Farmer", "Lyra Moonweaver"],
    createdBy: "Chef Meredith",
    shipTo: "Guild Kitchen",
    takeFrom: "Various Locations",
    subtasks: [
      {
        id: 1,
        name: "Harvest Vegetables",
        completed: false,
        assignedTo: ["Tom the Farmer", "Sarah the Gardener"],
        professions: [ProfessionType.FARMING],
        levels: new Map([[ProfessionType.FARMING, 50]]),
        dependencies: [],
        description: "Harvest fresh vegetables from guild farms",
        shipTo: "Storage Cellar",
        takeFrom: "Guild Farms",
        resources: [
          {
            name: "Carrots",
            needed: 10,
            gathered: 7,
            unit: "bunches",
            contributors: new Map([
              ["Tom the Farmer", 4],
              ["Sarah the Gardener", 3]
            ])
          },
          {
            name: "Potatoes",
            needed: 15,
            gathered: 8,
            unit: "sacks",
            contributors: new Map([
              ["Tom the Farmer", 6],
              ["Sarah the Gardener", 2]
            ])
          }
        ]
      }
    ]
  });

  await Promise.all([task1.save(), task2.save()]);
  console.log('✅ Задачи созданы');
};

const seedDatabase = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/bitcraft_task_manager';
    await mongoose.connect(mongoURI);
    
    console.log('📊 Подключено к MongoDB');
    
    // Очищаем существующие данные
    await UserModel.deleteMany({});
    await TaskModel.deleteMany({});
    console.log('🧹 Существующие данные удалены');
    
    // Заполняем базу данных
    await seedUsers();
    await seedTasks();
    
    console.log('🎉 База данных успешно заполнена!');
    
  } catch (error) {
    console.error('❌ Ошибка при заполнении базы данных:', error);
  } finally {
    await mongoose.connection.close();
  }
};

// Запускаем скрипт если файл вызван напрямую
if (require.main === module) {
  seedDatabase();
}

export default seedDatabase; 