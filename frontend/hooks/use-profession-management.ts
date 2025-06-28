"use client"

import { useState } from "react"

export function useProfessionManagement(initialProfessions: any) {
  const [userProfessions, setUserProfessions] = useState(initialProfessions)
  const [editingProfessions, setEditingProfessions] = useState(false)

  const updateProfessionLevel = (profession: string, newLevel: number) => {
    setUserProfessions((prev: any) => ({
      ...prev,
      [profession]: {
        ...prev[profession],
        level: Math.max(1, Math.min(100, newLevel)),
      },
    }))
  }

  return {
    userProfessions,
    setUserProfessions,
    editingProfessions,
    setEditingProfessions,
    updateProfessionLevel,
  }
}
