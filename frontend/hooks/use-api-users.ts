"use client"

import { useState, useEffect } from "react"
import { apiClient, type User, type ApiResponse } from "@/lib/api-client"
import { useToast } from "@/hooks/use-toast"

export function useApiUsers() {
  const [users, setUsers] = useState<User[]>([])
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const showError = (message: string) => {
    setError(message)
    toast({
      variant: "destructive",
      title: "Ошибка",
      description: message,
    })
  }

  const showSuccess = (message: string) => {
    toast({
      title: "Успешно",
      description: message,
    })
  }

  // Загрузка всех пользователей
  const loadUsers = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await apiClient.getAllUsers()
      
      if (response.success) {
        setUsers(response.data)
      } else {
        showError(response.message || "Не удалось загрузить пользователей")
      }
    } catch (err) {
      showError("Ошибка подключения к серверу")
    } finally {
      setLoading(false)
    }
  }

  // Загрузка пользователя по имени
  const loadUserByName = async (userName: string) => {
    try {
      const response = await apiClient.getUserByName(userName)
      
      if (response.success) {
        setCurrentUser(response.data)
        return response.data
      } else {
        showError(response.message || "Пользователь не найден")
        return null
      }
    } catch (err) {
      showError("Ошибка при загрузке пользователя")
      return null
    }
  }

  // Создание нового пользователя
  const createUser = async (userData: Partial<User>) => {
    try {
      const response = await apiClient.createUser(userData)
      
      if (response.success) {
        setUsers((prevUsers: User[]) => [...prevUsers, response.data])
        showSuccess("Пользователь создан успешно")
        return response.data
      } else {
        showError(response.message || "Не удалось создать пользователя")
        return null
      }
    } catch (err) {
      showError("Ошибка при создании пользователя")
      return null
    }
  }

  // Обновление уровня профессии
  const updateProfessionLevel = async (
    userId: string,
    profession: string,
    level: number
  ) => {
    try {
      const response = await apiClient.updateProfessionLevel(userId, profession, level)
      
      if (response.success) {
        // Обновляем локальное состояние
        setUsers((prevUsers: User[]) => 
          prevUsers.map((user: User) => 
            user.id === userId ? response.data : user
          )
        )
        
        // Обновляем текущего пользователя если это он
        if (currentUser && currentUser.id === userId) {
          setCurrentUser(response.data)
        }
        
        showSuccess("Уровень профессии обновлен")
      } else {
        showError(response.message || "Не удалось обновить уровень профессии")
      }
    } catch (err) {
      showError("Ошибка при обновлении профессии")
    }
  }

  // Обновление профиля пользователя
  const updateProfile = async (userId: string, profileData: Partial<User>) => {
    try {
      const response = await apiClient.updateProfile(userId, profileData)
      
      if (response.success) {
        setUsers((prevUsers: User[]) => 
          prevUsers.map((user: User) => 
            user.id === userId ? response.data : user
          )
        )
        
        if (currentUser && currentUser.id === userId) {
          setCurrentUser(response.data)
        }
        
        showSuccess("Профиль обновлен")
      } else {
        showError(response.message || "Не удалось обновить профиль")
      }
    } catch (err) {
      showError("Ошибка при обновлении профиля")
    }
  }

  // Получение статистики пользователя
  const getUserStats = async (userId: string) => {
    try {
      const response = await apiClient.getUserStats(userId)
      
      if (response.success) {
        return response.data
      } else {
        showError(response.message || "Не удалось загрузить статистику")
        return null
      }
    } catch (err) {
      showError("Ошибка при загрузке статистики")
      return null
    }
  }

  // Удаление пользователя
  const deleteUser = async (userId: string) => {
    try {
      const response = await apiClient.deleteUser(userId)
      
      if (response.success) {
        setUsers((prevUsers: User[]) => prevUsers.filter((user: User) => user.id !== userId))
        if (currentUser && currentUser.id === userId) {
          setCurrentUser(null)
        }
        showSuccess("Пользователь удален")
      } else {
        showError(response.message || "Не удалось удалить пользователя")
      }
    } catch (err) {
      showError("Ошибка при удалении пользователя")
    }
  }

  // УДАЛЕНО: автоматическая загрузка пользователей при монтировании
  // Теперь loadUsers нужно вызывать вручную после авторизации

  return {
    users,
    currentUser,
    loading,
    error,
    loadUsers,
    loadUserByName,
    createUser,
    updateProfessionLevel,
    updateProfile,
    getUserStats,
    deleteUser,
    setCurrentUser,
  }
} 