"use client"

import { useState, useEffect, useCallback } from "react"
import { apiClient, type Task, type ApiResponse } from "@/lib/api-client"
import { useToast } from "@/hooks/use-toast"
import { useUser } from "@/contexts/UserContext"

// Helper function to normalize task ID for consistency
const normalizeTask = (task: Task): Task => {
  return {
    ...task,
    id: task.id || parseInt(task._id.slice(-8), 16) // Create numeric ID from _id for compatibility
  }
}

const normalizeTaskArray = (tasks: Task[] | undefined | null): Task[] => {
  if (!tasks || !Array.isArray(tasks)) {
    return []
  }
  return tasks.map(task => normalizeTask(task))
}

export function useApiTasks() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()
  const { currentUser } = useUser()

  const showError = (message: string) => {
    setError(message)
    toast({
      variant: "destructive",
      title: "Error",
      description: message,
    })
  }

  const showSuccess = (message: string) => {
    toast({
      title: "Success",
      description: message,
    })
  }

  // Загрузка всех задач (мемоизированная для стабильности)
  const loadTasks = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await apiClient.getAllTasks()
      
      if (response.success) {
        const normalizedTasks = normalizeTaskArray(response.data)
        setTasks(normalizedTasks)
      } else {
        showError(response.message || "Failed to load tasks")
      }
    } catch (err) {
      console.error('LoadTasks error:', err)
      showError("Server connection error")
    } finally {
      setLoading(false)
    }
  }, [])

  // Назначение/снятие с задачи
  const claimTask = async (taskId: string, userName?: string) => {
    const userNameToUse = userName || currentUser?.name || ''
    if (!userNameToUse) {
      showError("User not logged in")
      return
    }
    
    try {
      const response = await apiClient.claimTask(taskId, userNameToUse)
      
      if (response.success) {
        const normalizedTask = normalizeTask(response.data)
        // Обновляем локальное состояние - поиск по _id или id
        setTasks(prevTasks => 
          prevTasks.map(task => 
            (task._id === taskId || task.id?.toString() === taskId) ? normalizedTask : task
          )
        )
        showSuccess("Task status updated")
      } else {
        showError(response.message || "Failed to update task")
      }
    } catch (err) {
      showError("Error updating task")
    }
  }

  // Назначение/снятие с подзадачи
  const claimSubtask = async (taskId: string, subtaskId: string, userName?: string) => {
    const userNameToUse = userName || currentUser?.name || ''
    if (!userNameToUse) {
      showError("User not logged in")
      return
    }
    
    try {
      const response = await apiClient.claimSubtask(taskId, subtaskId, userNameToUse)
      
      if (response.success) {
        const normalizedTask = normalizeTask(response.data)
        // Обновляем локальное состояние - поиск по _id или id
        setTasks(prevTasks => 
          prevTasks.map(task => 
            (task._id === taskId || task.id?.toString() === taskId) ? normalizedTask : task
          )
        )
        showSuccess("Subtask status updated")
      } else {
        showError(response.message || "Failed to update subtask")
      }
    } catch (err) {
      showError("Error updating subtask")
    }
  }

  // Создание новой задачи
  const createTask = async (taskData: Partial<Task>) => {
    try {
      const response = await apiClient.createTask(taskData)
      
      if (response.success) {
        const normalizedTask = normalizeTask(response.data)
        setTasks(prevTasks => [...prevTasks, normalizedTask])
        showSuccess("Task created successfully")
        return normalizedTask
      } else {
        showError(response.message || "Failed to create task")
        return null
      }
    } catch (err) {
      showError("Error creating task")
      return null
    }
  }

  // Удаление задачи
  const deleteTask = async (taskId: string) => {
    try {
      const response = await apiClient.deleteTask(taskId)
      
      if (response.success) {
        setTasks(prevTasks => 
          prevTasks.filter(task => 
            task._id !== taskId && task.id?.toString() !== taskId
          )
        )
        showSuccess("Task deleted")
      } else {
        showError(response.message || "Failed to delete task")
      }
    } catch (err) {
      showError("Error deleting task")
    }
  }

  // Обновление вклада в ресурс (задачи или подзадачи)
  const updateResourceContribution = async (
    taskId: string,
    resourceName: string,
    quantity: number,
    userName?: string,
    subtaskId?: string
  ) => {
    const userNameToUse = userName || currentUser?.name || ''
    if (!userNameToUse) {
      showError("User not logged in")
      return
    }
    
    try {
      const response = await apiClient.updateResourceContribution(
        taskId,
        resourceName,
        quantity,
        userNameToUse,
        subtaskId
      )
      
      if (response.success) {
        const normalizedTask = normalizeTask(response.data)
        setTasks(prevTasks => 
          prevTasks.map(task => 
            (task._id === taskId || task.id?.toString() === taskId) ? normalizedTask : task
          )
        )
        showSuccess("Resource contribution updated")
      } else {
        showError(response.message || "Failed to update contribution")
      }
    } catch (err) {
      showError("Error updating contribution")
    }
  }

  // Завершение подзадачи
  const completeSubtask = async (taskId: string, subtaskId: string) => {
    try {
      const response = await apiClient.completeSubtask(taskId, subtaskId)
      
      if (response.success) {
        const normalizedTask = normalizeTask(response.data)
        // Обновляем локальное состояние без полной перезагрузки
        setTasks(prevTasks => 
          prevTasks.map(task => 
            (task._id === taskId || task.id?.toString() === taskId) ? normalizedTask : task
          )
        )
        showSuccess("Subtask completed")
      } else {
        showError(response.message || "Failed to complete subtask")
      }
    } catch (err) {
      showError("Error completing subtask")
    }
  }

  // Завершение основной задачи
  const completeTask = async (taskId: string) => {
    try {
      const response = await apiClient.completeTask(taskId)
      
      if (response.success) {
        const normalizedTask = normalizeTask(response.data)
        // Обновляем локальное состояние без полной перезагрузки
        setTasks(prevTasks => 
          prevTasks.map(task => 
            (task._id === taskId || task.id?.toString() === taskId) ? normalizedTask : task
          )
        )
        showSuccess("Task completed")
      } else {
        showError(response.message || "Failed to complete task")
      }
    } catch (err) {
      showError("Error completing task")
    }
  }

  // Невидимое обновление конкретного таска в фоне
  const refreshTask = async (taskId: string) => {
    try {
      const response = await apiClient.getTaskById(taskId)
      
      if (response.success) {
        const normalizedTask = normalizeTask(response.data)
        // Тихо обновляем конкретный таск без уведомлений
        setTasks(prevTasks => 
          prevTasks.map(task => 
            (task._id === taskId || task.id?.toString() === taskId) ? normalizedTask : task
          )
        )
      }
    } catch (err) {
      // Тихо игнорируем ошибки при фоновом обновлении
      console.warn('Background refresh failed:', err)
    }
  }

  // Обновление статуса задачи
  const updateTaskStatus = async (taskId: string, status: string) => {
    try {
      const response = await apiClient.updateTask(taskId, { status })
      
      if (response.success) {
        const normalizedTask = normalizeTask(response.data)
        // Обновляем локальное состояние
        setTasks(prevTasks => 
          prevTasks.map(task => 
            (task._id === taskId || task.id?.toString() === taskId) ? normalizedTask : task
          )
        )
        showSuccess("Task status updated")
      } else {
        showError(response.message || "Failed to update task status")
      }
    } catch (err) {
      showError("Error updating task status")
    }
  }

  // Мягкий рефреш - обновляет данные без полной перезагрузки
  const softRefresh = async () => {
    try {
      const response = await apiClient.getAllTasks()
      if (response.success && Array.isArray(response.data)) {
        const normalizedTasks = response.data.map(normalizeTask)
        setTasks(normalizedTasks)
        showSuccess("Tasks refreshed")
      } else {
        showError("Failed to refresh tasks")
      }
    } catch (err) {
      console.error('Error during soft refresh:', err)
      showError("Error refreshing tasks")
    }
  }

  return {
    tasks,
    loading,
    error,
    loadTasks,
    claimTask,
    claimSubtask,
    createTask,
    deleteTask,
    updateResourceContribution,
    completeSubtask,
    completeTask,
    refreshTask,
    updateTaskStatus,
    softRefresh,
  }
} 