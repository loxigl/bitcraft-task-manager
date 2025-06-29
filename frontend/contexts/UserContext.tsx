"use client"

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import { type User, apiClient, type LoginRequest } from '@/lib/api-client'

interface UserContextType {
  currentUser: User | null
  setCurrentUser: (user: User | null) => void
  loading: boolean
  isLoggedIn: boolean
  login: (loginData: LoginRequest) => Promise<{ success: boolean; message?: string }>
  logout: () => void
  refreshUser: () => Promise<void>
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const lastRefreshTimeRef = useRef(0)

  const isLoggedIn = currentUser !== null

  const login = async (loginData: LoginRequest): Promise<{ success: boolean; message?: string }> => {
    setLoading(true)
    try {
      const response = await apiClient.login(loginData)
      
      if (response.success && response.data) {
        // response.data это AuthResponse = { user: User, token: string }
        // Но backend может возвращать двойную обертку, проверяем оба случая
        let authData = response.data
        
        // Если есть вложенная data (двойная обертка от backend)
        if ('data' in authData && typeof authData.data === 'object' && authData.data !== null) {
          authData = authData.data as any
        }
        
        
        if (authData && authData.user && authData.token) {
          setCurrentUser(authData.user)
          // Сохраняем токен и пользователя в localStorage только на клиенте
          if (typeof window !== 'undefined') {
            localStorage.setItem('authToken', authData.token)
            localStorage.setItem('currentUser', JSON.stringify(authData.user))
          }
          return { success: true }
        } else {
          return { success: false, message: "No user data received" }
        }
      } else {
        return { success: false, message: response.message || "Invalid email or password" }
      }
    } catch (error) {
      console.error('Login error:', error)
      return { success: false, message: "Failed to connect to server" }
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    setCurrentUser(null)
    if (typeof window !== 'undefined') {
      localStorage.removeItem('authToken')
      localStorage.removeItem('currentUser')
    }
  }

  const refreshUser = useCallback(async () => {
    if (typeof window === 'undefined') {
      console.log('RefreshUser called on server side, skipping...')
      return
    }
    
    // Предотвращаем повторные вызовы
    if (refreshing) {
      console.log('Refresh already in progress, skipping...')
      return
    }

    // Предотвращаем слишком частые вызовы (не чаще чем раз в 2 секунды)
    const now = Date.now()
    if (now - lastRefreshTimeRef.current < 2000) {
      console.log('Refresh called too soon, skipping... (last refresh was', now - lastRefreshTimeRef.current, 'ms ago)')
      return
    }
    
    const savedToken = localStorage.getItem('authToken')
    if (!savedToken || savedToken === 'undefined') {
      console.log('No valid token found, skipping refresh...')
      return
    }

    console.log('Starting user refresh...')
    try {
      setRefreshing(true)
      setLoading(true)
      lastRefreshTimeRef.current = now
      const response = await apiClient.getCurrentUser(savedToken)
      
      if (response.success && response.data) {
        console.log('User refreshed successfully from server')
        setCurrentUser(response.data)
        localStorage.setItem('currentUser', JSON.stringify(response.data))
      } else {
        console.error('Failed to refresh user:', response.message || 'Unknown error')
        // Если токен недействителен, выходим из системы
        logout()
      }
    } catch (error) {
      console.error('Error refreshing user:', error)
      // Проверяем тип ошибки для более детального логирования
      if (error instanceof Error) {
        if (error.message.includes('<!DOCTYPE')) {
          console.error('Server returned HTML instead of JSON - possible 404 or server error')
          // Не логаутим при сетевых ошибках, оставляем существующие данные
        } else {
          console.error('Unexpected error:', error.message)
        }
      }
      // При ошибке сети оставляем старые данные, не логаутим
    } finally {
      console.log('User refresh completed')
      setRefreshing(false)
      setLoading(false)
    }
  }, []) // Теперь функция стабильна без зависимостей

  // Устанавливаем mounted флаг
  useEffect(() => {
    setMounted(true)
  }, [])

  // Восстанавливаем пользователя из localStorage только после монтирования
  useEffect(() => {
    if (!mounted) return

    const savedUser = localStorage.getItem('currentUser')
    const savedToken = localStorage.getItem('authToken')
    
    if (savedUser && savedToken && savedUser !== 'undefined' && savedToken !== 'undefined') {
      try {
        const user = JSON.parse(savedUser)
        setCurrentUser(user)
        // НЕ вызываем refreshUser автоматически - это будет делаться по необходимости
      } catch (error) {
        console.error('Error parsing saved user:', error)
        // Очищаем поврежденные данные
        localStorage.removeItem('currentUser')
        localStorage.removeItem('authToken')
      }
    }
  }, [mounted])

  // Показываем loading состояние вместо null
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-lg">Initializing...</div>
      </div>
    )
  }

  return (
    <UserContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        loading,
        isLoggedIn,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return context
} 