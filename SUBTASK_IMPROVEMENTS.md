# Subtask Improvements - Implementation Summary

## Изменения реализованы ✅

### 1. Исправлен редирект после регистрации 
- После успешной регистрации пользователь теперь перенаправляется на страницу входа
- Изменен `auth-container.tsx` для разделения обработчиков успеха логина и регистрации

### 2. Исправлен бесконечный скролл в диалоге создания задач
- Удалены ограниченные по высоте скроллы для подзадач и ресурсов  
- Добавлен основной скролл для всего диалогового окна (`max-h-[90vh] overflow-y-auto`)
- Теперь весь диалог прокручивается, а не отдельные секции

### 3. Добавлены поля связей для подзадач
- **"Depends On"** - выбор подзадачи, которая должна быть завершена перед началом текущей
- **"Subtask Of"** - выбор родительской подзадачи для создания иерархической структуры
- Поля реализованы как селекторы (Select) вместо текстовых полей

### 4. Логика селекторов
- **Subtask Of**: 
  - По умолчанию "Main Task" (привязка к основной задаче)
  - Можно выбрать любую другую созданную подзадачу как родительскую
  - Показываются только подзадачи с названиями
- **Depends On**:
  - По умолчанию "No dependency" 
  - Можно выбрать подзадачу, которая должна быть завершена первой
  - Исключается текущая редактируемая подзадача из списка

### 5. Обновления бэкенда
- Добавлено поле `subtaskOf` в модель Subtask (backend/src/models/Task.ts)
- Добавлено поле `subtaskOf` в интерфейс Subtask (backend/src/types/index.ts)
- Обновлены контроллеры для обработки новых полей при создании и обновлении

### 6. Улучшена логика проверки доступности
- Функция `canDoSubtask` теперь проверяет:
  - Уровни профессий пользователя
  - Завершение зависимых подзадач (dependencies)
  - Завершение родительской подзадачи (subtaskOf)
- Добавлена функция `findSubtaskById` для поиска подзадач в иерархической структуре

### 7. Обновлен рендеринг подзадач
- В SubtaskRenderer добавлено отображение родительской подзадачи
- Улучшено отображение зависимостей с более четкими лейблами
- Добавлена поддержка новой иерархической структуры

## Как использовать новые функции

1. **Создание иерархических подзадач**:
   - Создайте основную подзадачу
   - Для дочерних подзадач выберите родительскую в поле "Subtask Of"

2. **Создание зависимостей**:
   - В поле "Depends On" выберите подзадачу, которая должна быть завершена первой
   - Зависимая подзадача станет доступной только после завершения родительской

3. **Логика выполнения**:
   - Подзадачи с невыполненными зависимостями отображаются как "Waiting"
   - Дочерние подзадачи недоступны пока не завершена родительская
   - Проверяются уровни профессий пользователя

## Структура данных

```typescript
interface Subtask {
  id: number | string;
  name: string;
  dependencies: number[]; // ID подзадач, которые должны быть завершены первыми
  subtaskOf: number | null; // ID родительской подзадачи или null для основной задачи
  // ... остальные поля
}
```

Все изменения обратно совместимы с существующими данными. 