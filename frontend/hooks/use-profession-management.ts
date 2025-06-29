"use client"

import { useState, useEffect, useMemo, useRef } from "react"
import { professionIcons } from "@/lib/constants"
import { apiClient } from "@/lib/api-client"
import { useUser } from "@/contexts/UserContext"
import { useToast } from "@/hooks/use-toast"

export function useProfessionManagement(initialProfessions: any) {
  const { currentUser, refreshUser } = useUser()
  const { toast } = useToast()
  
  // Стабилизируем initialProfessions с помощью useMemo
  const stableInitialProfessions = useMemo(() => {
    if (!initialProfessions || typeof initialProfessions !== 'object') {
      return {}
    }
    return initialProfessions
  }, [initialProfessions])
  
  // Нормализуем профессии - используем level 0 как в бэкенде по умолчанию  
  const normalizedProfessions = useMemo(() => {
    return Object.keys(professionIcons).reduce((acc, profession) => {
      const userProfessionData = stableInitialProfessions?.[profession]
      acc[profession] = {
        level: userProfessionData?.level ?? 0
      }
      return acc
    }, {} as Record<string, { level: number }>)
  }, [stableInitialProfessions])

  const [userProfessions, setUserProfessions] = useState(normalizedProfessions)
  const [originalProfessions, setOriginalProfessions] = useState(normalizedProfessions)
  const [editingProfessions, setEditingProfessions] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  
  // Отслеживаем предыдущее значение нормализованных профессий
  const prevNormalizedRef = useRef<string>('')

  // Обновляем состояние при изменении normalizedProfessions, но только если данные действительно изменились
  useEffect(() => {
    const newDataString = JSON.stringify(normalizedProfessions)
    
    if (prevNormalizedRef.current !== newDataString) {
      setUserProfessions(normalizedProfessions)
      setOriginalProfessions(normalizedProfessions)
      prevNormalizedRef.current = newDataString
    }
  }, [normalizedProfessions])

  // Проверяем есть ли изменения
  const hasChanges = JSON.stringify(userProfessions) !== JSON.stringify(originalProfessions)

  const updateProfessionLevel = (profession: string, newLevel: number) => {
    const clampedLevel = Math.max(0, Math.min(100, newLevel))
    
    // Обновляем только локально
    setUserProfessions(prev => ({
      ...prev,
      [profession]: {
        ...prev[profession],
        level: clampedLevel,
      },
    }))
  }

  const saveChanges = async () => {
    if (!currentUser?._id || !hasChanges) {
      toast({
        variant: "destructive",
        title: "No changes to save",
        description: "Make some changes to profession levels first"
      })
      return
    }

    setIsSaving(true)

    try {
      // Находим все измененные профессии
      const changedProfessions = Object.keys(userProfessions).filter(profession => 
        userProfessions[profession].level !== originalProfessions[profession].level
      )

      if (changedProfessions.length === 0) {
        toast({
          variant: "destructive",
          title: "No changes detected",
          description: "All profession levels are the same"
        })
        return
      }

      console.log('Saving changes for professions:', changedProfessions)

      // Сохраняем все изменения параллельно
      const savePromises = changedProfessions.map(profession => 
        apiClient.updateProfessionLevel(currentUser._id, profession, userProfessions[profession].level)
      )

      const responses = await Promise.all(savePromises)
      
      // Проверяем что все запросы успешны
      const failedUpdates = responses.filter(response => !response.success)
      
      if (failedUpdates.length > 0) {
        toast({
          variant: "destructive",
          title: "Some changes failed to save",
          description: failedUpdates.map(r => r.message).join(', ')
        })
        return
      }

      // При успехе обновляем данные пользователя с сервера
      await refreshUser()
      
      // Обновляем оригинальные данные
      setOriginalProfessions({...userProfessions})

      toast({
        title: "Profession levels saved",
        description: `Successfully updated ${changedProfessions.length} profession(s)`
      })

      console.log('All profession levels updated successfully')
    } catch (error) {
      console.error('Error saving profession levels:', error)
      toast({
        variant: "destructive", 
        title: "Error saving profession levels",
        description: "Please try again later"
      })
    } finally {
      setIsSaving(false)
    }
  }

  const cancelChanges = () => {
    setUserProfessions({...originalProfessions})
    setEditingProfessions(false)
  }

  return {
    userProfessions,
    editingProfessions,
    setEditingProfessions,
    updateProfessionLevel,
    saveChanges,
    cancelChanges,
    hasChanges,
    isSaving,
  }
}
