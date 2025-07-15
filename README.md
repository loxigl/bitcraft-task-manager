<div align="center">

# 🏰 BitCraft Task Manager

*Современная система управления задачами гильдии*

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)
[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue)](https://www.docker.com/)

**Полнофункциональное приложение для управления задачами в гильдии**  
*Создано с использованием современных технологий для максимальной производительности и удобства*

[🚀 Быстрый старт](#-быстрый-старт) • 
[📖 Документация](#-документация) • 
[🛠️ API](#️-api-документация) • 
[🤝 Участие в разработке](#-участие-в-разработке)

</div>

---

## 📋 Содержание

- [✨ Основные возможности](#-основные-возможности)
- [🛠️ Технический стек](#️-технический-стек)
- [📂 Структура проекта](#-структура-проекта)
- [🚀 Быстрый старт](#-быстрый-старт)
- [⚙️ Конфигурация](#️-конфигурация)
- [🎮 Использование](#-использование)
- [🛠️ API документация](#️-api-документация)
- [📝 Скрипты разработки](#-скрипты-разработки)
- [🧪 Тестирование](#-тестирование)
- [🚀 Развертывание](#-развертывание)
- [🔧 Troubleshooting](#-troubleshooting)
- [🤝 Участие в разработке](#-участие-в-разработке)
- [📄 Лицензия](#-лицензия)

---

## ✨ Основные возможности

<table>
<tr>
<td width="50%">

### 🎯 Управление задачами
- 📝 Создание иерархических задач с подзадачами
- 🔗 Система зависимостей между задачами
- 📊 Отслеживание прогресса выполнения
- 🏷️ Теги и категории для организации

</td>
<td width="50%">

### 👥 Система пользователей
- 🔐 JWT-аутентификация и авторизация
- 👤 Детальные профили пользователей
- ⚔️ Профессии и уровни персонажей
- 🏆 Система достижений и статистики

</td>
</tr>
<tr>
<td width="50%">

### 💎 Учет ресурсов
- 📦 Отслеживание вкладов участников
- 💰 Система распределения наград
- 📈 Аналитика использования ресурсов
- 🔄 Автоматический расчет взносов

</td>
<td width="50%">

### 🎨 Современный интерфейс
- 📱 Адаптивный дизайн для всех устройств
- 🌙 Темная и светлая темы
- ⚡ Быстрая навигация и поиск
- 🎭 Интуитивный пользовательский опыт

</td>
</tr>
</table>

---

## 🛠️ Технический стек

<div align="center">

### Frontend
![Next.js](https://img.shields.io/badge/Next.js-15-000000?style=for-the-badge&logo=next.js&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

### Backend
![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-4-000000?style=for-the-badge&logo=express&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-6-47A248?style=for-the-badge&logo=mongodb&logoColor=white)

### DevOps & Tools
![Docker](https://img.shields.io/badge/Docker-4.24+-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![Docker Compose](https://img.shields.io/badge/Docker_Compose-2.22+-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![Nginx](https://img.shields.io/badge/Nginx-1.25+-009639?style=for-the-badge&logo=nginx&logoColor=white)

</div>

---

## 📂 Структура проекта

```
bitcraft-task-manager/
├── frontend/                    # Next.js приложение
│   ├── app/                     # App Router (Next.js 15)
│   ├── components/              # React компоненты
│   │   ├──auth/               # Компоненты аутентификации
│   │   ├──dashboard/          # Панель управления
│   │   ├──tasks/              # Управление задачами
│   │   ├──profile/            # Профили пользователей
│   │   └──ui/                 # UI компоненты
│   ├──hooks/                   # Пользовательские хуки
│   ├──lib/                     # Утилиты и API клиент
│   └──contexts/                # React контексты
│
├──backend/                     # Express.js API
│   └──src/
│       ├──controllers/         # API контроллеры
│       ├──models/              # Mongoose модели
│       ├──routes/              # Express маршруты
│       ├──middleware/          # Промежуточное ПО
│       ├──config/              # Конфигурация
│       ├──scripts/             # Служебные скрипты
│       └──types/               # TypeScript типы
│
└──deployment/                  # Docker конфигурация
    ├──docker-compose.yml       # Production
    ├──docker-compose.dev.yml   # Development
    ├──Makefile                 # Команды автоматизации
    └──nginx.conf               # Nginx конфигурация
```

---

## 🚀 Быстрый старт

### 📋 Предварительные требования

- **Docker** 4.24+ и **Docker Compose** 2.22+
- **Node.js** 18+ (для локальной разработки)
- **pnpm** или **npm** (для управления пакетами)

### 🐳 Запуск с Docker (рекомендуется)

1. **Клонирование репозитория:**
   ```bash
   git clone <repository-url>
   cd bitcraft-task-manager
   ```

2. **Запуск development окружения:**
   ```bash
   cd deployment
   make dev
   ```
   
   Или вручную:
   ```bash
   docker-compose -f docker-compose.dev.yml up --build
   ```

3. **Заполнение базы данных тестовыми данными:**
   ```bash
   make seed-dev
   ```

4. **Доступ к приложению:**
   - 🌐 **Frontend**: http://localhost
   - 🔌 **Backend API**: http://localhost:5000
   - 🗄️ **MongoDB**: mongodb://localhost:27017

### 💻 Локальная разработка

<details>
<summary>Развернуть инструкции для локальной разработки</summary>

#### Backend
```bash
cd backend
npm install
cp .env.example .env  # Настройте переменные окружения
npm run dev
```

#### Frontend
```bash
cd frontend
pnpm install
cp .env.local.example .env.local  # Настройте переменные окружения
pnpm dev
```

</details>

---

## ⚙️ Конфигурация

### 🔧 Переменные окружения Backend

```env
# .env файл в папке backend/
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://mongo:27017/bitcraft_dev
JWT_SECRET=your_super_secret_jwt_key_change_in_production
JWT_EXPIRE=7d
CORS_ORIGIN=http://localhost:3000
```

### 🔧 Переменные окружения Frontend

```env
# .env.local файл в папке frontend/
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

---

## 🎮 Использование

### 👤 Создание аккаунта

1. Перейдите на http://localhost
2. Нажмите "Регистрация"
3. Заполните форму регистрации
4. Войдите в систему

### 📋 Управление задачами

- **Создание задачи**: Используйте кнопку "+" в панели задач
- **Назначение задачи**: Выберите исполнителя из списка участников
- **Отслеживание прогресса**: Обновляйте статус выполнения
- **Добавление ресурсов**: Указывайте необходимые материалы

### 👥 Управление профилем

- Обновите информацию о персонаже
- Выберите профессию и укажите уровень
- Просматривайте статистику выполненных задач

---

## 🛠️ API документация

### 🔐 Аутентификация

| Метод | Endpoint | Описание |
|-------|----------|----------|
| `POST` | `/api/auth/register` | Регистрация пользователя |
| `POST` | `/api/auth/login` | Вход в систему |
| `GET` | `/api/auth/me` | Получение текущего пользователя |

### 👥 Пользователи

| Метод | Endpoint | Описание |
|-------|----------|----------|
| `GET` | `/api/users` | Список всех пользователей |
| `GET` | `/api/users/:id` | Получение пользователя по ID |
| `PUT` | `/api/users/:id/profile` | Обновление профиля |

### 📋 Задачи

| Метод | Endpoint | Описание |
|-------|----------|----------|
| `GET` | `/api/tasks` | Список задач (с пагинацией) |
| `POST` | `/api/tasks` | Создание новой задачи |
| `GET` | `/api/tasks/:id` | Получение задачи по ID |
| `PUT` | `/api/tasks/:id` | Обновление задачи |
| `DELETE` | `/api/tasks/:id` | Удаление задачи |
| `POST` | `/api/tasks/:id/claim` | Взятие задачи в работу |

<details>
<summary>Подробная API документация</summary>

### Примеры запросов

#### Создание задачи
```json
POST /api/tasks
{
  "title": "Добыть железную руду",
  "description": "Необходимо добыть 100 единиц железной руды",
  "priority": "high",
  "requiredResources": {
    "iron_ore": 100
  },
  "assignedTo": "user_id",
  "parentTask": "parent_task_id"
}
```

#### Обновление прогресса
```json
PUT /api/tasks/:id/resources/iron_ore
{
  "contribution": 25,
  "userId": "user_id"
}
```

</details>

---

## 📝 Скрипты разработки

### 🔧 Backend команды

```bash
npm run dev          # Запуск в режиме разработки с hot reload
npm run build        # Сборка проекта
npm run start        # Запуск production версии
npm run seed         # Заполнение БД тестовыми данными
npm run lint         # Проверка кода ESLint
npm run test         # Запуск тестов
```

### 🎨 Frontend команды

```bash
pnpm dev             # Запуск development сервера
pnpm build           # Сборка для production
pnpm start           # Запуск production версии
pnpm lint            # Проверка кода ESLint
pnpm type-check      # Проверка TypeScript типов
```

### 🐳 Docker команды

```bash
make dev             # Запуск development окружения
make prod            # Запуск production окружения
make stop            # Остановка всех контейнеров
make clean           # Очистка Docker ресурсов
make logs            # Просмотр логов
make seed-dev        # Заполнение БД (development)
make seed-prod       # Заполнение БД (production)
```

---

## 🧪 Тестирование

### Запуск тестов

```bash
# Backend тесты
cd backend
npm run test

# Frontend тесты
cd frontend
pnpm test

# E2E тесты
pnpm test:e2e
```

### Покрытие кода

```bash
npm run test:coverage
```

---

## 🚀 Развертывание

### 🐳 Production с Docker

1. **Настройка production environment:**
   ```bash
   cd deployment
   cp .env.example .env.prod
   # Отредактируйте .env.prod файл
   ```

2. **Запуск production окружения:**
   ```bash
   make prod
   ```

3. **Заполнение базы данных:**
   ```bash
   make seed-prod
   ```

### ☁️ Облачное развертывание

<details>
<summary>Инструкции для развертывания в облаке</summary>

#### AWS / Digital Ocean / VPS

1. Установите Docker и Docker Compose на сервер
2. Клонируйте репозиторий
3. Настройте переменные окружения
4. Запустите `make prod`
5. Настройте доменное имя и SSL сертификат

#### Использование с обратным прокси

Nginx конфигурация включена в docker-compose.yml для production развертывания.

</details>

---

## 🔧 Troubleshooting

### Частые проблемы

<details>
<summary>🚫 Порты заняты</summary>

**Проблема**: Ошибка "port already in use"

**Решение**:
```bash
# Проверьте какие порты заняты
netstat -tulpn | grep :80
netstat -tulpn | grep :3000
netstat -tulpn | grep :5000

# Остановите конфликтующие сервисы
sudo systemctl stop nginx  # если запущен системный nginx
```

</details>

<details>
<summary>🗄️ Проблемы с базой данных</summary>

**Проблема**: Не удается подключиться к MongoDB

**Решение**:
```bash
# Проверьте статус контейнера MongoDB
docker-compose logs mongo

# Пересоздайте контейнер базы данных
docker-compose down
docker volume rm deployment_mongo_data
docker-compose up mongo
```

</details>

<details>
<summary>🔧 Проблемы с зависимостями</summary>

**Проблема**: Ошибки при установке пакетов

**Решение**:
```bash
# Очистите кэш и переустановите зависимости
cd frontend && rm -rf node_modules pnpm-lock.yaml && pnpm install
cd backend && rm -rf node_modules package-lock.json && npm install
```

</details>

### Логи и отладка

```bash
# Просмотр логов всех сервисов
make logs

# Просмотр логов конкретного сервиса
docker-compose logs -f frontend
docker-compose logs -f backend
docker-compose logs -f mongo

# Подключение к контейнеру для отладки
docker-compose exec backend bash
docker-compose exec frontend bash
```

---

## 🤝 Участие в разработке

Мы приветствуем ваш вклад в развитие проекта! 

### 🔄 Процесс разработки

1. **Форк репозитория**
   ```bash
   git clone https://github.com/your-username/bitcraft-task-manager.git
   ```

2. **Создание ветки для новой функции**
   ```bash
   git checkout -b feature/amazing-new-feature
   ```

3. **Внесение изменений**
   - Следуйте стилю кода проекта
   - Добавляйте тесты для новой функциональности
   - Обновляйте документацию при необходимости

4. **Коммит изменений**
   ```bash
   git commit -m "✨ Add amazing new feature"
   ```

5. **Отправка Pull Request**
   - Опишите ваши изменения
   - Приложите скриншоты для UI изменений
   - Убедитесь, что все тесты проходят

### 📏 Стандарты кода

- **TypeScript**: Строгая типизация
- **ESLint**: Соблюдение правил линтера
- **Prettier**: Единообразное форматирование
- **Conventional Commits**: Стандарт для сообщений коммитов

### 🐛 Сообщение об ошибках

Если вы нашли баг, пожалуйста:
1. Проверьте, что баг еще не заведен в Issues
2. Создайте новый Issue с подробным описанием
3. Приложите скриншоты и логи если возможно
4. Укажите шаги для воспроизведения

---

## 📚 Дополнительная документация

- 📖 [Руководство по интеграции](INTEGRATION_GUIDE.md)
- 🔧 [Улучшения подзадач](SUBTASK_IMPROVEMENTS.md)
- ✅ [Успешная интеграция Frontend-Backend](FRONTEND_BACKEND_INTEGRATION_SUCCESS.md)
- 🚀 [Подробное руководство по развертыванию](deployment/README.md)

---

## 👨‍💻 Команда разработки

<div align="center">

**Создано с ❤️ для гильдии BitCraft**

*Если у вас есть вопросы или предложения, не стесняйтесь обращаться!*

</div>

---

## 📄 Лицензия

Этот проект распространяется под лицензией **MIT License**.

```
MIT License

Copyright (c) 2024 BitCraft Task Manager

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

<div align="center">

**⭐ Если проект оказался полезным, поставьте звездочку!**

[![GitHub stars](https://img.shields.io/github/stars/loxigl/bitcraft-task-manager?style=social)](https://github.com/loxigl/bitcraft-task-manager/stargazers)

</div>
