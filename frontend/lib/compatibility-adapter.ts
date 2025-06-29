"use client"

import { type Task, type User } from '@/lib/api-client'

// Adapters to bridge API types with component types

interface ComponentUser {
  id?: string;
  name: string;
  level: number;
  guild: string;
  avatar?: string;
  reputation: number;
  completedTasks: number;
  currentTasks: number;
}

interface ComponentTask {
  id: string | number;
  name: string;
  professions: string[];
  levels: Record<string, number>;
  deadline: string;
  status: string;
  priority: string;
  description: string;
  resources: Array<{
    name: string;
    needed: number;
    gathered: number;
    unit: string;
    contributors: Record<string, number>;
  }>;
  assignedTo: string[];
  createdBy: string;
  shipTo: string;
  takeFrom: string;
  subtasks?: ComponentTask[];
}

// Функции для преобразования типов между API и старыми компонентами

export function adaptTaskForComponent(apiTask: Task): ComponentTask {
  return {
    id: apiTask._id,
    name: apiTask.name,
    professions: apiTask.professions,
    levels: apiTask.levels,
    deadline: apiTask.deadline,
    status: apiTask.status,
    priority: apiTask.priority,
    description: apiTask.description,
    resources: apiTask.resources,
    assignedTo: apiTask.assignedTo,
    createdBy: apiTask.createdBy,
    shipTo: apiTask.shipTo,
    takeFrom: apiTask.takeFrom,
    subtasks: apiTask.subtasks?.map(adaptTaskForComponent),
  };
}

export function adaptTasksForComponents(apiTasks: Task[]): any[] {
  // Защита от undefined/null - возвращаем пустой массив
  if (!apiTasks || !Array.isArray(apiTasks)) {
    return []
  }
  return apiTasks.map(adaptTaskForComponent)
}

export function adaptUserForComponent(apiUser: User): ComponentUser {
  return {
    id: apiUser._id,
    name: apiUser.name,
    level: apiUser.level,
    guild: apiUser.guild,
    avatar: apiUser.avatar,
    reputation: apiUser.reputation,
    completedTasks: apiUser.completedTasks,
    currentTasks: apiUser.currentTasks,
  };
}

// Функции-обертки для API вызовов с преобразованием типов

export function createCompatibilityWrapper(
  currentUser: User | null,
  apiTasks: Task[],
  claimTask: (taskId: string, userName: string) => Promise<void>,
  claimSubtask: (taskId: string, subtaskId: string, userName: string) => Promise<void>,
  deleteTask: (taskId: string) => Promise<void>,
  updateResourceContribution: (taskId: string, resourceName: string, quantity: number, userName: string) => Promise<void>,
  createTask: (taskData: any) => Promise<Task | null>
) {
  // Обертка для claimTask
  const wrappedClaimTask = (taskId: number) => {
    if (currentUser) {
      return claimTask(taskId.toString(), currentUser.name)
    }
  }

  // Обертка для claimSubtask
  const wrappedClaimSubtask = (taskId: number, subtaskId: number) => {
    if (currentUser) {
      return claimSubtask(taskId.toString(), subtaskId.toString(), currentUser.name)
    }
  }

  // Обертка для deleteTask
  const wrappedDeleteTask = (taskId: number) => {
    return deleteTask(taskId.toString())
  }

  // Обертка для updateResourceContribution
  const wrappedUpdateResourceContribution = (
    taskId: number,
    subtaskId: number | null,
    resourceName: string,
    quantity: number
  ) => {
    if (currentUser) {
      return updateResourceContribution(taskId.toString(), resourceName, quantity, currentUser.name)
    }
  }

  // Заглушка для setTasks (не нужна с API)
  const setTasks = (newTasks: any) => {
    console.warn('setTasks не нужен при работе с API')
  }

  return {
    tasks: adaptTasksForComponents(apiTasks),
    setTasks,
    mockUser: currentUser ? adaptUserForComponent(currentUser) : null,
    claimTask: wrappedClaimTask,
    claimSubtask: wrappedClaimSubtask,
    deleteTask: wrappedDeleteTask,
    updateResourceContribution: wrappedUpdateResourceContribution,
    createTask,
  }
}

export function createGenericWrapper<T extends (...args: any[]) => any>(
  fn: T
): T {
  return ((...args: Parameters<T>) => {
    // Here you can add any compatibility logic if needed
    return fn(...args);
  }) as T;
} 