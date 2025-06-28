"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const User_1 = require("../models/User");
const Task_1 = require("../models/Task");
const types_1 = require("../types");
dotenv_1.default.config();
const seedUsers = async () => {
    const lyra = new User_1.UserModel({
        name: "Lyra Moonweaver",
        email: "lyra@bitcraft.guild",
        avatar: "/placeholder.svg?height=100&width=100",
        level: 67,
        guild: "BitCraft",
        professions: new Map([
            [types_1.ProfessionType.CARPENTRY, { level: 45 }],
            [types_1.ProfessionType.FARMING, { level: 72 }],
            [types_1.ProfessionType.FISHING, { level: 38 }],
            [types_1.ProfessionType.FORAGING, { level: 55 }],
            [types_1.ProfessionType.FORESTRY, { level: 62 }],
            [types_1.ProfessionType.HUNTING, { level: 25 }],
            [types_1.ProfessionType.LEATHERWORKING, { level: 33 }],
            [types_1.ProfessionType.MASONRY, { level: 18 }],
            [types_1.ProfessionType.MINING, { level: 85 }],
            [types_1.ProfessionType.SCHOLAR, { level: 91 }],
            [types_1.ProfessionType.SMITHING, { level: 67 }],
            [types_1.ProfessionType.TAILORING, { level: 54 }]
        ]),
        completedTasks: 47,
        currentTasks: 3,
        reputation: 2840
    });
    const marcus = new User_1.UserModel({
        name: "Marcus the Woodsman",
        email: "marcus@bitcraft.guild",
        level: 52,
        guild: "BitCraft",
        professions: new Map([
            [types_1.ProfessionType.FORESTRY, { level: 85 }],
            [types_1.ProfessionType.CARPENTRY, { level: 78 }],
            [types_1.ProfessionType.HUNTING, { level: 65 }]
        ]),
        completedTasks: 23,
        currentTasks: 2,
        reputation: 1650
    });
    const elena = new User_1.UserModel({
        name: "Elena the Smith",
        email: "elena@bitcraft.guild",
        level: 48,
        guild: "BitCraft",
        professions: new Map([
            [types_1.ProfessionType.SMITHING, { level: 88 }],
            [types_1.ProfessionType.MINING, { level: 70 }],
            [types_1.ProfessionType.MASONRY, { level: 45 }]
        ]),
        completedTasks: 31,
        currentTasks: 1,
        reputation: 1920
    });
    const tom = new User_1.UserModel({
        name: "Tom the Farmer",
        email: "tom@bitcraft.guild",
        level: 35,
        guild: "BitCraft",
        professions: new Map([
            [types_1.ProfessionType.FARMING, { level: 80 }],
            [types_1.ProfessionType.FORAGING, { level: 45 }]
        ]),
        completedTasks: 18,
        currentTasks: 2,
        reputation: 1100
    });
    const sarah = new User_1.UserModel({
        name: "Sarah the Gardener",
        email: "sarah@bitcraft.guild",
        level: 28,
        guild: "BitCraft",
        professions: new Map([
            [types_1.ProfessionType.FARMING, { level: 65 }],
            [types_1.ProfessionType.FORAGING, { level: 50 }]
        ]),
        completedTasks: 12,
        currentTasks: 1,
        reputation: 750
    });
    const thorin = new User_1.UserModel({
        name: "Guild Master Thorin",
        email: "thorin@bitcraft.guild",
        level: 95,
        guild: "BitCraft",
        professions: new Map([
            [types_1.ProfessionType.SCHOLAR, { level: 95 }],
            [types_1.ProfessionType.SMITHING, { level: 80 }],
            [types_1.ProfessionType.MASONRY, { level: 75 }]
        ]),
        completedTasks: 150,
        currentTasks: 0,
        reputation: 8500
    });
    const luna = new User_1.UserModel({
        name: "Luna the Forager",
        email: "luna@bitcraft.guild",
        level: 42,
        guild: "BitCraft",
        professions: new Map([
            [types_1.ProfessionType.FORAGING, { level: 88 }],
            [types_1.ProfessionType.HUNTING, { level: 55 }]
        ]),
        completedTasks: 25,
        currentTasks: 1,
        reputation: 1400
    });
    const meredith = new User_1.UserModel({
        name: "Chef Meredith",
        email: "meredith@bitcraft.guild",
        level: 38,
        guild: "BitCraft",
        professions: new Map([
            [types_1.ProfessionType.FARMING, { level: 60 }],
            [types_1.ProfessionType.FISHING, { level: 70 }],
            [types_1.ProfessionType.FORAGING, { level: 65 }]
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
    const task1 = new Task_1.TaskModel({
        id: 1,
        name: "Build Wooden Fortress Gate",
        professions: [types_1.ProfessionType.CARPENTRY, types_1.ProfessionType.FORESTRY],
        levels: new Map([
            [types_1.ProfessionType.CARPENTRY, 75],
            [types_1.ProfessionType.FORESTRY, 60]
        ]),
        deadline: "2024-01-15",
        status: types_1.TaskStatus.OPEN,
        priority: types_1.Priority.HIGH,
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
                professions: [types_1.ProfessionType.FORESTRY],
                levels: new Map([[types_1.ProfessionType.FORESTRY, 60]]),
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
                        professions: [types_1.ProfessionType.FORESTRY],
                        levels: new Map([[types_1.ProfessionType.FORESTRY, 45]]),
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
                        professions: [types_1.ProfessionType.SMITHING],
                        levels: new Map([[types_1.ProfessionType.SMITHING, 40]]),
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
                professions: [types_1.ProfessionType.CARPENTRY],
                levels: new Map([[types_1.ProfessionType.CARPENTRY, 50]]),
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
    const task2 = new Task_1.TaskModel({
        id: 2,
        name: "Harvest Festival Feast",
        professions: [types_1.ProfessionType.FARMING, types_1.ProfessionType.FISHING, types_1.ProfessionType.FORAGING],
        levels: new Map([
            [types_1.ProfessionType.FARMING, 50],
            [types_1.ProfessionType.FISHING, 45],
            [types_1.ProfessionType.FORAGING, 40]
        ]),
        deadline: "2024-01-20",
        status: types_1.TaskStatus.OPEN,
        priority: types_1.Priority.MEDIUM,
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
                professions: [types_1.ProfessionType.FARMING],
                levels: new Map([[types_1.ProfessionType.FARMING, 50]]),
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
        await mongoose_1.default.connect(mongoURI);
        console.log('📊 Подключено к MongoDB');
        await User_1.UserModel.deleteMany({});
        await Task_1.TaskModel.deleteMany({});
        console.log('🧹 Существующие данные удалены');
        await seedUsers();
        await seedTasks();
        console.log('🎉 База данных успешно заполнена!');
    }
    catch (error) {
        console.error('❌ Ошибка при заполнении базы данных:', error);
    }
    finally {
        await mongoose_1.default.connection.close();
    }
};
if (require.main === module) {
    seedDatabase();
}
exports.default = seedDatabase;
//# sourceMappingURL=seedDatabase.js.map