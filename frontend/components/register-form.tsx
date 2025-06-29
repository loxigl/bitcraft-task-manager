'use client'

import React, { useState } from 'react'
import { apiClient, RegisterRequest } from '@/lib/api-client'
import { toast } from '@/hooks/use-toast'

interface RegisterFormProps {
  onSuccess: () => void
  onSwitchToLogin: () => void
}

export function RegisterForm({ onSuccess, onSwitchToLogin }: RegisterFormProps) {
  const [formData, setFormData] = useState<RegisterRequest>({
    name: '',
    email: '',
    password: '',
    guild: ''
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await apiClient.register(formData)
      
      if (response.success && response.data) {
        // Сохраняем токен в localStorage
        localStorage.setItem('authToken', response.data.token)
        localStorage.setItem('currentUser', JSON.stringify(response.data.user))
        
        toast({
          title: "Успешная регистрация!",
          description: "Добро пожаловать в BitCraft Task Manager!",
        })
        
        onSuccess()
      } else {
        toast({
          title: "Ошибка регистрации",
          description: response.message || "Произошла ошибка при регистрации",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось подключиться к серверу",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
        Регистрация в BitCraft
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Имя персонажа
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Введите имя персонажа"
          />
        </div>
        
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Введите email"
          />
        </div>
        
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Пароль
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            minLength={6}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Минимум 6 символов"
          />
        </div>
        
        <div>
          <label htmlFor="guild" className="block text-sm font-medium text-gray-700">
            Гильдия
          </label>
          <input
            type="text"
            id="guild"
            name="guild"
            value={formData.guild}
            onChange={handleChange}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Название гильдии"
          />
        </div>
        
        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Регистрация...' : 'Зарегистрироваться'}
        </button>
      </form>
      
      <p className="mt-4 text-center text-sm text-gray-600">
        Уже есть аккаунт?{' '}
        <button
          onClick={onSwitchToLogin}
          className="font-medium text-indigo-600 hover:text-indigo-500"
        >
          Войти
        </button>
      </p>
    </div>
  )
} 