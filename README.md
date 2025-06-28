# 🏰 BitCraft Task Manager

Полнофункциональное приложение для управления задачами в стиле гильдии с системой профессий, ресурсов и вложенных подзадач.

![BitCraft Task Manager](https://img.shields.io/badge/BitCraft-Task%20Manager-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-000000?logo=next.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?logo=mongodb&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?logo=docker&logoColor=white)

## 📋 Описание

BitCraft Task Manager - это система управления задачами, вдохновленная механиками MMORPG. Приложение позволяет создавать сложные задачи с требованиями к профессиям, управлять ресурсами, отслеживать прогресс выполнения и работать с многоуровневыми подзадачами.

### ✨ Основные возможности

- 🎯 **Сложные задачи** с требованиями к профессиям и уровням
- 🔗 **Многоуровневые подзадачи** с системой зависимостей
- 📦 **Управление ресурсами** с отслеживанием вкладов участников
- 👥 **Система пользователей** с профессиями и уровнями
- 📊 **Детальная статистика** и прогресс выполнения
- 🎨 **Современный UI** с темной темой
- 🐳 **Готовый Docker деплой** для быстрого запуска

## 🏗️ Архитектура

```
┌─────────────────────────────────────────────────┐
│                   Frontend                      │
│           Next.js 15 + TypeScript               │
│        Tailwind CSS + shadcn/ui                 │
└─────────────────┬───────────────────────────────┘
                  │ HTTP API
┌─────────────────▼───────────────────────────────┐
│                  Backend                        │
│           Express + TypeScript                  │
│         Mongoose + Validation                   │
└─────────────────┬───────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────┐
│                 MongoDB                         │
│            Схемы с валидацией                   │
│               Индексация                        │
└─────────────────────────────────────────────────┘
```

## 📁 Структура проекта

```
bitcraft_task_manager/
├── frontend/                 # Next.js приложение
│   ├── app/                 # App Router страницы
│   ├── components/          # UI компоненты
│   ├── lib/                # Утилиты
│   └── styles/             # Стили
├── backend/                 # Express API
│   ├── src/
│   │   ├── controllers/    # Контроллеры
│   │   ├── models/         # Mongoose модели
│   │   ├── routes/         # API маршруты
│   │   ├── middleware/     # Middleware
│   │   ├── config/         # Конфигурация
│   │   ├── types/          # TypeScript типы
│   │   └── scripts/        # Утилиты и скрипты
│   └── dist/               # Скомпилированный код
└── deployment/             # Docker конфигурация
    ├── docker-compose.yml  # Compose файл
    ├── nginx.conf          # Nginx конфигурация
    └── README.md           # Документация деплоя
```

## 🚀 Быстрый запуск

### С помощью Docker (рекомендуемый способ)

1. **Клонируйте репозиторий:**
   ```bash
   git clone <repository-url>
   cd bitcraft_task_manager
   ```

2. **Запустите все сервисы:**
   ```bash
   cd deployment
   docker-compose up -d
   ```

3. **Дождитесь запуска всех сервисов (займет 1-2 минуты)**

4. **Инициализируйте базу данных:**
   ```bash
   docker-compose exec backend npm run seed
   ```

5. **Откройте приложение:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - Nginx: http://localhost:80

> ✅ **Статус готовности:** Проект полностью готов к развертыванию! Все компоненты протестированы и собираются без ошибок.

### Ручная установка

#### Backend

```bash
cd backend
npm install
cp .env.example .env
# Настройте переменные в .env
npm run build
npm run seed
npm start
```

#### Frontend

```bash
cd frontend
pnpm install
pnpm dev
```

## 🎮 Использование

### Система профессий

Приложение поддерживает 12 профессий:
- 🔨 **Carpentry** (Столярное дело)
- 🌾 **Farming** (Сельское хозяйство) 
- 🐟 **Fishing** (Рыбалка)
- 🍃 **Foraging** (Собирательство)
- 🌲 **Forestry** (Лесничество)
- 🏹 **Hunting** (Охота)
- 🛡️ **Leatherworking** (Кожевничество)
- 🏗️ **Masonry** (Каменная кладка)
- ⛏️ **Mining** (Горное дело)
- 📚 **Scholar** (Ученость)
- ⚔️ **Smithing** (Кузнечное дело)
- ✂️ **Tailoring** (Портняжное дело)

### Создание задач

1. Укажите название и описание
2. Выберите требуемые профессии и уровни
3. Добавьте ресурсы с количеством
4. Создайте подзадачи с зависимостями
5. Установите приоритет и дедлайн

### Управление ресурсами

- Отслеживание прогресса сбора
- Вклады от разных участников
- Автоматический подсчет общего прогресса

## 📊 API Документация

### Задачи (Tasks)

| Метод | Endpoint | Описание |
|-------|----------|----------|
| GET | `/api/tasks` | Получить все задачи с фильтрацией |
| GET | `/api/tasks/:id` | Получить задачу по ID |
| POST | `/api/tasks` | Создать новую задачу |
| POST | `/api/tasks/:id/claim` | Назначить/снять пользователя |
| PUT | `/api/tasks/:id/resources/:name` | Обновить ресурс |
| DELETE | `/api/tasks/:id` | Удалить задачу |

### Пользователи (Users)

| Метод | Endpoint | Описание |
|-------|----------|----------|
| GET | `/api/users` | Получить всех пользователей |
| GET | `/api/users/:id` | Получить пользователя по ID |
| GET | `/api/users/name/:name` | Получить пользователя по имени |
| POST | `/api/users` | Создать пользователя |
| PUT | `/api/users/:id/profile` | Обновить профиль |
| PUT | `/api/users/:id/professions/:prof` | Обновить уровень профессии |

## 🛠️ Разработка

### Требования

- Node.js 18+
- pnpm (для фронтенда)
- npm (для бэкенда)
- MongoDB 5.0+
- Docker & Docker Compose (для деплоя)

### Установка для разработки

1. **Backend:**
   ```bash
   cd backend
   npm install
   npm run dev
   ```

2. **Frontend:**
   ```bash
   cd frontend
   pnpm install
   pnpm dev
   ```

3. **MongoDB:**
   ```bash
   # Локально или через Docker
   docker run -d -p 27017:27017 --name mongo mongo:7.0
   ```

### Скрипты

#### Backend
- `npm run dev` - Запуск в режиме разработки
- `npm run build` - Сборка для production
- `npm run seed` - Заполнение БД тестовыми данными
- `npm run lint` - Проверка кода

#### Frontend
- `pnpm dev` - Запуск в режиме разработки
- `pnpm build` - Сборка для production
- `pnpm lint` - Проверка кода

## 🐳 Docker деплой

Подробная документация по деплою находится в [`deployment/README.md`](deployment/README.md).

### Основные команды

```bash
# Запуск всех сервисов
docker-compose up -d

# Просмотр логов
docker-compose logs -f

# Остановка
docker-compose down

# Заполнение БД
docker-compose exec backend npm run seed
```

## 🧪 Тестовые данные

Приложение поставляется с готовыми тестовыми данными:

### Пользователи
- **Lyra Moonweaver** - главный персонаж с высокими уровнями
- **Marcus the Woodsman** - специалист по лесничеству
- **Elena the Smith** - мастер-кузнец
- **Tom the Farmer** - фермер
- **Guild Master Thorin** - глава гильдии

### Задачи
- **Build Wooden Fortress Gate** - сложная задача с подзадачами
- **Harvest Festival Feast** - задача по сбору ресурсов

## 🔧 Конфигурация

### Переменные окружения

#### Backend (.env)
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/bitcraft_task_manager
JWT_SECRET=your_secret_key
CORS_ORIGIN=http://localhost:3000
```

#### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

## 📱 Скриншоты

### Главная страница
Обзор всех задач с фильтрацией и сортировкой.

### Детали задачи
Подробная информация о задаче, ресурсах и подзадачах.

### Профиль пользователя
Статистика, профессии и личные достижения.

## 🤝 Вклад в проект

1. Fork проекта
2. Создайте feature branch (`git checkout -b feature/amazing-feature`)
3. Commit изменения (`git commit -m 'Add amazing feature'`)
4. Push в branch (`git push origin feature/amazing-feature`)
5. Откройте Pull Request

### Стандарты кода

- TypeScript для типизации
- ESLint для проверки кода
- Prettier для форматирования
- Conventional Commits для сообщений коммитов

## 📝 Лицензия

Этот проект распространяется под лицензией MIT. См. файл [LICENSE](LICENSE) для подробностей.

## 🆘 Поддержка

При возникновении проблем:

1. Проверьте [Issues](../../issues) на GitHub
2. Изучите документацию в [`deployment/README.md`](deployment/README.md)
3. Создайте новый Issue с детальным описанием проблемы

## 🙏 Благодарности

- [Next.js](https://nextjs.org/) за отличный React фреймворк
- [shadcn/ui](https://ui.shadcn.com/) за красивые компоненты
- [Tailwind CSS](https://tailwindcss.com/) за удобную стилизацию
- [Express.js](https://expressjs.com/) за надежный backend фреймворк
- [MongoDB](https://www.mongodb.com/) за гибкую базу данных

---

<div align="center">

**[⬆ Наверх](#-bitcraft-task-manager)**

Made with ❤️ for BitCraft Guild

</div> 