# Интеграция фронтенда с бэкендом - Руководство

## Что было изменено

### 1. API клиент
- Создан `frontend/lib/api-client.ts` для работы с backend API
- Поддержка всех endpoints: задачи, пользователи, ресурсы
- Типизированные интерфейсы для Task, User, ApiResponse

### 2. Новые hooks для работы с API
- `frontend/hooks/use-api-tasks.ts` - управление задачами через API
- `frontend/hooks/use-api-users.ts` - управление пользователями через API
- Автоматическая обработка ошибок и отображение уведомлений

### 3. Система авторизации
- `frontend/contexts/UserContext.tsx` - контекст для текущего пользователя
- `frontend/components/auth/login-form.tsx` - форма входа
- Сохранение состояния в localStorage

### 4. Адаптер совместимости
- `frontend/lib/compatibility-adapter.ts` - адаптер для совместимости старых компонентов с новым API
- Преобразование типов данных между API и компонентами

### 5. Docker интеграция
- `frontend/Dockerfile` - контейнеризация фронтенда
- `frontend/.dockerignore` - исключения для Docker
- Обновлен `frontend/next.config.mjs` с `output: 'standalone'`

## Настройка и запуск

### 1. Переменные окружения
Создайте файл `frontend/.env.local`:
```bash
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### 2. Запуск в development режиме

#### Запуск backend:
```bash
cd backend
npm install
npm run dev
```

#### Запуск frontend:
```bash
cd frontend
pnpm install
pnpm run dev
```

### 3. Запуск с Docker

#### Запуск всего стека:
```bash
cd deployment
docker-compose up --build
```

Сервисы будут доступны:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- MongoDB: localhost:27017
- Nginx (proxy): http://localhost:80

## Процесс входа в систему

1. При первом заходе отображается форма входа
2. Введите имя пользователя (например: "Marcus the Woodsman")
3. Система попытается найти пользователя в базе данных
4. Если пользователь найден - выполняется вход
5. Если пользователя нет - отображается ошибка

## Работа с задачами

- Загрузка задач происходит автоматически при входе
- Все операции (назначение, обновление ресурсов, удаление) работают через API
- Изменения отображаются в реальном времени
- Автоматические уведомления об ошибках и успешных операциях

## Известные ограничения

1. **Subtasks**: API пока не поддерживает subtasks, используется заглушка
2. **Типы данных**: Некоторые преобразования типов в адаптере для совместимости
3. **Аватары**: Используются заглушки для изображений пользователей

## Следующие шаги

1. **Реализовать subtasks в API** - добавить поддержку подзадач
2. **Аутентификация** - добавить JWT токены для безопасности
3. **Загрузка файлов** - поддержка аватаров пользователей
4. **WebSocket** - real-time обновления для командной работы
5. **Кеширование** - добавить React Query для оптимизации запросов

## Отладка

### Проверка подключения к API:
```bash
curl http://localhost:5000/api/users
curl http://localhost:5000/api/tasks
```

### Логи Docker:
```bash
docker-compose logs frontend
docker-compose logs backend
docker-compose logs mongo
```

### Очистка и пересборка:
```bash
docker-compose down -v
docker-compose up --build
``` 