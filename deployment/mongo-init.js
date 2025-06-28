// Инициализация MongoDB для BitCraft Task Manager
print('🚀 Инициализация MongoDB для BitCraft Task Manager...');

// Переключаемся на базу данных приложения
db = db.getSiblingDB('bitcraft_task_manager');

// Создаем коллекции с валидацией
db.createCollection('users', {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["name", "email", "guild"],
      properties: {
        name: {
          bsonType: "string",
          description: "Имя пользователя обязательно"
        },
        email: {
          bsonType: "string",
          description: "Email обязателен"
        },
        guild: {
          bsonType: "string",
          description: "Гильдия обязательна"
        }
      }
    }
  }
});

db.createCollection('tasks', {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["name", "professions", "deadline", "priority", "description"],
      properties: {
        name: {
          bsonType: "string",
          description: "Название задачи обязательно"
        },
        professions: {
          bsonType: "array",
          description: "Массив профессий обязателен"
        },
        deadline: {
          bsonType: "string",
          description: "Дедлайн обязателен"
        },
        priority: {
          bsonType: "string",
          enum: ["low", "medium", "high", "critical"],
          description: "Приоритет должен быть одним из: low, medium, high, critical"
        }
      }
    }
  }
});

// Создаем индексы для оптимизации запросов
db.users.createIndex({ "name": 1 }, { unique: true });
db.users.createIndex({ "email": 1 }, { unique: true });
db.users.createIndex({ "guild": 1 });
db.users.createIndex({ "reputation": -1 });

db.tasks.createIndex({ "id": 1 }, { unique: true });
db.tasks.createIndex({ "status": 1 });
db.tasks.createIndex({ "priority": 1 });
db.tasks.createIndex({ "deadline": 1 });
db.tasks.createIndex({ "professions": 1 });
db.tasks.createIndex({ "assignedTo": 1 });
db.tasks.createIndex({ "createdAt": -1 });

print('✅ MongoDB инициализирована успешно!');
print('📋 Созданы коллекции: users, tasks');
print('🔍 Добавлены индексы для оптимизации');
print('🎉 Готово к работе!'); 