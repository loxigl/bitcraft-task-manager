# BitCraft Task Manager - Деплой

Полная инструкция по развертыванию приложения BitCraft Task Manager с помощью Docker.

## 🚀 Быстрый старт

1. **Клонируйте репозиторий и перейдите в папку deployment:**
   ```bash
   cd deployment
   ```

2. **Запустите все сервисы:**
   ```bash
   docker-compose up -d
   ```

3. **Проверьте статус сервисов:**
   ```bash
   docker-compose ps
   ```

4. **Инициализируйте базу данных тестовыми данными:**
   ```bash
   docker-compose exec backend npm run seed
   ```

5. **Откройте приложение:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - Nginx (reverse proxy): http://localhost:80

## 📋 Требования

- Docker (версия 20.0+)
- Docker Compose (версия 2.0+)
- Минимум 2GB RAM
- Минимум 5GB свободного места

## 🏗️ Архитектура

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│     Nginx       │    │    Frontend     │    │     Backend     │
│   (Port 80)     │◄──►│   (Port 3000)   │◄──►│   (Port 5000)   │
│  Reverse Proxy  │    │    Next.js      │    │    Express      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                       │
                                                       ▼
                                              ┌─────────────────┐
                                              │     MongoDB     │
                                              │   (Port 27017)  │
                                              │    Database     │
                                              └─────────────────┘
```

## 🔧 Конфигурация

### Переменные окружения

#### Backend (.env)
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb://root:bitcraft_password_2024@mongo:27017/bitcraft_task_manager?authSource=admin
JWT_SECRET=bitcraft_production_secret_2024_very_secure_key
JWT_EXPIRE=7d
CORS_ORIGIN=http://localhost:3000
```

#### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### Порты

| Сервис | Внутренний порт | Внешний порт | Описание |
|--------|----------------|-------------|----------|
| Nginx | 80/443 | 80/443 | Reverse proxy, статика |
| Frontend | 3000 | 3000 | Next.js приложение |
| Backend | 5000 | 5000 | Express API |
| MongoDB | 27017 | 27017 | База данных |

## 📊 API Endpoints

### Задачи (Tasks)
- `GET /api/tasks` - Получить все задачи
- `GET /api/tasks/:id` - Получить задачу по ID
- `POST /api/tasks` - Создать новую задачу
- `POST /api/tasks/:id/claim` - Назначить/снять пользователя
- `PUT /api/tasks/:id/resources/:name` - Обновить ресурс
- `DELETE /api/tasks/:id` - Удалить задачу

### Пользователи (Users)
- `GET /api/users` - Получить всех пользователей
- `GET /api/users/:id` - Получить пользователя по ID
- `GET /api/users/name/:name` - Получить пользователя по имени
- `POST /api/users` - Создать пользователя
- `PUT /api/users/:id/profile` - Обновить профиль
- `PUT /api/users/:id/professions/:profession` - Обновить уровень профессии

## 🛠️ Команды Docker

### Управление контейнерами

```bash
# Запуск всех сервисов
docker-compose up -d

# Остановка всех сервисов
docker-compose down

# Перезапуск определенного сервиса
docker-compose restart backend

# Просмотр логов
docker-compose logs -f backend
docker-compose logs -f frontend

# Просмотр статуса
docker-compose ps
```

### Работа с базой данных

```bash
# Подключение к MongoDB
docker-compose exec mongo mongosh -u root -p bitcraft_password_2024

# Заполнение тестовыми данными
docker-compose exec backend npm run seed

# Бэкап базы данных
docker-compose exec mongo mongodump --uri="mongodb://root:bitcraft_password_2024@localhost:27017/bitcraft_task_manager?authSource=admin" --out=/data/backup

# Восстановление базы данных
docker-compose exec mongo mongorestore --uri="mongodb://root:bitcraft_password_2024@localhost:27017/bitcraft_task_manager?authSource=admin" /data/backup/bitcraft_task_manager
```

### Разработка

```bash
# Пересборка после изменений
docker-compose build backend
docker-compose build frontend

# Запуск только определенных сервисов
docker-compose up mongo backend

# Выполнение команд внутри контейнера
docker-compose exec backend bash
docker-compose exec frontend sh
```

## 🔍 Мониторинг и логи

### Health Check
- Backend: http://localhost:5000/health
- Frontend: http://localhost:3000
- Nginx: http://localhost:80/health

### Логи

```bash
# Все логи
docker-compose logs -f

# Логи конкретного сервиса
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f mongo
docker-compose logs -f nginx

# Последние 100 строк
docker-compose logs --tail=100 backend
```

## 🐛 Отладка

### Частые проблемы

1. **Контейнер не запускается:**
   ```bash
   docker-compose logs [service_name]
   ```

2. **Проблемы с подключением к БД:**
   ```bash
   # Проверить, что MongoDB запущен
   docker-compose ps mongo
   
   # Проверить логи MongoDB
   docker-compose logs mongo
   ```

3. **Frontend не подключается к Backend:**
   ```bash
   # Проверить переменные окружения
   docker-compose exec frontend env | grep API
   
   # Проверить сеть
   docker network ls
   docker network inspect deployment_bitcraft_network
   ```

4. **Проблемы с правами доступа:**
   ```bash
   # Сбросить права на папки
   sudo chown -R $USER:$USER ./
   ```

### Полная очистка

```bash
# Остановить и удалить все контейнеры
docker-compose down -v

# Удалить все образы проекта
docker rmi $(docker images "deployment*" -q)

# Очистить неиспользуемые ресурсы
docker system prune -a
```

## 📈 Производительность

### Рекомендации для production

1. **Используйте внешний MongoDB:**
   - MongoDB Atlas
   - Или выделенный сервер с MongoDB

2. **Настройте SSL/HTTPS:**
   - Добавьте SSL сертификаты в `deployment/ssl/`
   - Раскомментируйте SSL конфигурацию в nginx.conf

3. **Настройте мониторинг:**
   - Prometheus + Grafana
   - Или используйте облачные решения

4. **Оптимизируйте ресурсы:**
   ```yaml
   # В docker-compose.yml добавьте:
   deploy:
     resources:
       limits:
         memory: 512M
         cpus: '0.5'
   ```

## 🔐 Безопасность

### Production checklist

- [ ] Изменить пароли по умолчанию
- [ ] Настроить HTTPS
- [ ] Ограничить доступ к портам БД
- [ ] Настроить firewall
- [ ] Регулярные бэкапы
- [ ] Мониторинг логов
- [ ] Rate limiting в nginx

### Обновление паролей

1. **MongoDB:**
   ```bash
   # В docker-compose.yml изменить:
   MONGO_INITDB_ROOT_PASSWORD: your_secure_password
   ```

2. **JWT Secret:**
   ```bash
   # В docker-compose.yml изменить:
   JWT_SECRET: your_very_secure_jwt_secret_key
   ```

## 📞 Поддержка

При проблемах с деплоем:

1. Проверьте логи: `docker-compose logs -f`
2. Убедитесь в наличии свободного места: `df -h`
3. Проверьте статус сервисов: `docker-compose ps`
4. Перезапустите проблемный сервис: `docker-compose restart [service]`

Успешного деплоя! 🚀 