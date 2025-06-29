"use client"

import { useState, useMemo, useEffect, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Trophy, CheckCircle, Clock, Package, User, Award, Activity, Plus, Save, X } from "lucide-react"
import { format } from "date-fns"
import { professionIcons } from "@/lib/constants"
import { isUserAssigned, getStatusColor } from "@/lib/utils/task-utils"
import { cn } from "@/lib/utils"
import { type User as ApiUser, apiClient } from '@/lib/api-client'
import { useUser } from '@/contexts/UserContext'
import { useToast } from "@/hooks/use-toast"

interface UserProfileProps {
    user: ApiUser | null // Real user data instead of mockUser
  userProfessions: Record<string, { level: number }>
  editingProfessions: boolean
  setEditingProfessions: (editing: boolean) => void
  updateProfessionLevel: (profession: string, level: number) => void
  saveChanges: () => Promise<void>
  cancelChanges: () => void
  hasChanges: boolean
  isSaving: boolean
  tasks: any[]
}

export function UserProfile({
  user,
  userProfessions,
  editingProfessions,
  setEditingProfessions,
  updateProfessionLevel,
  saveChanges,
  cancelChanges,
  hasChanges,
  isSaving,
  tasks,
}: UserProfileProps) {
  const { refreshUser, loading } = useUser()
  const { toast } = useToast()
  const hasRefreshedRef = useRef(false)
  
  // Состояние для смены гильдии
  const [editingGuild, setEditingGuild] = useState(false)
  const [guildOption, setGuildOption] = useState<string>(() => 
    user?.guild === "The Vermilion Expanse" ? "the_vermilion_expanse" : "other"
  )
  const [customGuild, setCustomGuild] = useState(() => 
    user?.guild !== "The Vermilion Expanse" ? (user?.guild || "") : ""
  )

  // Обновляем данные пользователя при заходе в профиль только один раз
  useEffect(() => {
    if (!hasRefreshedRef.current) {
      console.log('Profile mounted, refreshing user data...')
      hasRefreshedRef.current = true
      refreshUser()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Пустой массив зависимостей - срабатывает только при монтировании
  
  // Обновляем состояние гильдии при смене пользователя
  useEffect(() => {
    if (user?.guild) {
      if (user.guild === "The Vermilion Expanse") {
        setGuildOption("the_vermilion_expanse")
        setCustomGuild("")
      } else {
        setGuildOption("other")
        setCustomGuild(user.guild)
      }
    }
  }, [user?.guild])
  
  const handleGuildSave = async () => {
    if (!user?._id) {
      toast({
        title: "Error",
        description: "User ID not found",
        variant: "destructive",
      })
      return
    }

    try {
      const finalGuild = guildOption === "other" ? customGuild : "The Vermilion Expanse"
      console.log('Saving guild:', finalGuild)
      
      const response = await apiClient.updateGuild(user._id, finalGuild)
      
      if (response.success) {
        setEditingGuild(false)
        toast({
          title: "Guild Updated",
          description: "Your guild has been successfully updated.",
        })
        // Обновляем пользователя после изменения гильдии
        refreshUser()
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to update guild",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Error updating guild:', error)
      toast({
        title: "Error",
        description: "Failed to update guild",
        variant: "destructive",
      })
    }
  }
  
  const handleGuildCancel = () => {
    // Возвращаем к исходным значениям
    if (user?.guild === "The Vermilion Expanse") {
      setGuildOption("the_vermilion_expanse")
      setCustomGuild("")
    } else {
      setGuildOption("other")
      setCustomGuild(user?.guild || "")
    }
    setEditingGuild(false)
  }

  // Filter user's current assignments (exclude completed tasks)
  const currentAssignments = tasks.filter((task) => 
    isUserAssigned(task.assignedTo, user?.name) && 
    task.status !== "done" && 
    task.status !== "completed"
  )
  
  // Filter user's completed tasks
  const completedTasks = tasks.filter((task) => 
    (task.status === "done" || task.status === "completed") && isUserAssigned(task.assignedTo, user?.name)
  )

  // Get user's recent activities
  const getRecentActivities = () => {
    const activities: Array<{
      id: string
      type: string
      text: string
      time: string
      icon: any
      iconColor: string
      bgColor: string
    }> = []
    
    // Add all completed tasks
    completedTasks.forEach(task => {
      activities.push({
        id: `completed-${task._id || task.id}`,
        type: 'completed',
        text: `Completed "${task.name}"`,
        time: task.updatedAt || task.createdAt || new Date().toISOString(),
        icon: CheckCircle,
        iconColor: 'text-green-500',
        bgColor: 'bg-green-50'
      })
    })

    // Add all claimed tasks in progress
    currentAssignments.forEach(task => {
      if (task.status === 'in_progress' || task.status === 'taken') {
        activities.push({
          id: `claimed-${task._id || task.id}`,
          type: 'claimed',
          text: `Claimed "${task.name}"`,
          time: task.updatedAt || task.createdAt || new Date().toISOString(),
          icon: Trophy,
          iconColor: 'text-blue-500',
          bgColor: 'bg-blue-50'
        })
      }
    })

    // Add resource contributions activities
    tasks.forEach(task => {
      if (task.resources) {
        task.resources.forEach((resource: any) => {
          if (resource.contributors && resource.contributors[user?.name || '']) {
            const contribution = resource.contributors[user?.name || '']
            if (contribution > 0) {
              activities.push({
                id: `resource-${task._id || task.id}-${resource.name}`,
                type: 'contribution',
                text: `Contributed ${contribution} ${resource.unit || 'units'} of ${resource.name} to "${task.name}"`,
                time: task.updatedAt || task.createdAt || new Date().toISOString(),
                icon: Package,
                iconColor: 'text-purple-500',
                bgColor: 'bg-purple-50'
              })
            }
          }
        })
      }
    })

    // Sort by time (most recent first) and limit to 20
    return activities
      .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
      .slice(0, 20)
  }

  const recentActivities = getRecentActivities()

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Avatar className="h-20 w-20">
          <AvatarImage src={user?.avatar || "/placeholder.svg"} />
          <AvatarFallback>
            {user?.name ? user.name.substring(0, 2).toUpperCase() : "UN"}
          </AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-3xl font-bold">{user?.name}</h1>
          <p className="text-gray-600">
            Level {user?.level} • {user?.guild}
          </p>
          <div className="flex items-center gap-4 mt-2">
            <div className="flex items-center gap-1">
              <Trophy className="h-4 w-4 text-yellow-500" />
              <span className="text-sm">{user?.reputation} Reputation</span>
            </div>
            <div className="flex items-center gap-1">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm">{completedTasks.length} Tasks Completed</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4 text-blue-500" />
              <span className="text-sm">{currentAssignments.length} Active Tasks</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Profile Settings</CardTitle>
              <CardDescription>Manage your character and guild information</CardDescription>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => {
                console.log('Manual refresh triggered')
                refreshUser()
              }}
              disabled={loading}
            >
              {loading ? "Updating..." : "Refresh Profile"}
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Guild</label>
              {editingGuild ? (
                <div className="space-y-3">
                  <Select value={guildOption} onValueChange={setGuildOption}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your guild" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="the_vermilion_expanse">The Vermilion Expanse</SelectItem>
                      <SelectItem value="other">Other (custom guild name)</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  {guildOption === "other" && (
                    <Input
                      type="text"
                      placeholder="Enter your guild name"
                      value={customGuild}
                      onChange={(e) => setCustomGuild(e.target.value)}
                    />
                  )}
                  
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleGuildCancel}
                    >
                      Cancel
                    </Button>
                    <Button 
                      size="sm" 
                      onClick={handleGuildSave}
                      disabled={guildOption === "other" && !customGuild.trim()}
                    >
                      Save
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <span className="text-sm">{user?.guild}</span>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setEditingGuild(true)}
                  >
                    Change Guild
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Profession Levels</CardTitle>
            <CardDescription>Your crafting expertise across different professions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">
                  {editingProfessions ? "Edit profession levels" : "Click Edit to modify levels"}
                </span>
                {hasChanges && (
                  <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded">
                    Unsaved changes
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                {editingProfessions ? (
                  <>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={cancelChanges}
                      disabled={isSaving}
                    >
                      Cancel
                    </Button>
                    <Button 
                      size="sm" 
                      onClick={saveChanges}
                      disabled={!hasChanges || isSaving}
                    >
                      {isSaving ? "Saving..." : "Save Changes"}
                    </Button>
                  </>
                ) : (
                  <Button variant="outline" size="sm" onClick={() => setEditingProfessions(true)}>
                    Edit Levels
                  </Button>
                )}
              </div>
            </div>
            {Object.entries(userProfessions).map(([profession, data]: [string, any]) => {
              const Icon = professionIcons[profession as keyof typeof professionIcons]
              const level = data?.level || 0
              const percentage = (level / 100) * 100
              return (
                <div key={profession} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4" />
                      <span className="capitalize font-medium">{profession}</span>
                    </div>
                    {editingProfessions ? (
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          value={level}
                          onChange={(e) => updateProfessionLevel(profession, Number.parseInt(e.target.value) || 0)}
                          className="w-16 h-8 text-center"
                        />
                        <span className="text-sm">/ 100</span>
                      </div>
                    ) : (
                      <span className="text-sm font-medium">Level {level}</span>
                    )}
                  </div>
                  <Progress value={percentage} className="h-2" />
                  <div className="text-xs text-gray-500 text-right">{percentage.toFixed(0)}% of max level</div>
                </div>
              )
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Task Statistics</CardTitle>
            <CardDescription>Overview of your completed and active tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-6">
              {/* Stats Numbers */}
              <div className="space-y-4">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-700">{completedTasks.length}</div>
                  <div className="text-sm text-green-600">Completed Tasks</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-700">{currentAssignments.length}</div>
                  <div className="text-sm text-blue-600">Active Tasks</div>
                </div>
              </div>
              
              {/* Recent Completed Tasks */}
              <div className="space-y-2">
                <h4 className="font-medium text-sm text-gray-700">Recently Completed</h4>
                {completedTasks.length === 0 ? (
                  <div className="text-center py-4 text-gray-500">
                    <CheckCircle className="h-6 w-6 mx-auto mb-1 opacity-50" />
                    <p className="text-xs">No tasks completed yet</p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {completedTasks.slice(0, 3).map((task) => (
                      <div key={task._id || task.id} className="flex items-center justify-between p-2 bg-gray-50 rounded text-xs">
                        <span className="font-medium truncate">{task.name}</span>
                        <Badge variant="outline" className="text-green-600 bg-green-50 text-xs">
                          Done
                        </Badge>
                      </div>
                    ))}
                    {completedTasks.length > 3 && (
                      <div className="text-center">
                        <span className="text-xs text-gray-500">+{completedTasks.length - 3} more completed</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Your latest actions and achievements</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentActivities.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No recent activity</p>
                <p className="text-sm">Start by claiming some tasks to see your activity here</p>
              </div>
            ) : (
              recentActivities.map((activity) => {
                const Icon = activity.icon
                return (
                  <div key={activity.id} className={`flex items-center gap-3 p-3 rounded-lg ${activity.bgColor}`}>
                    <Icon className={`h-5 w-5 ${activity.iconColor}`} />
                    <div>
                      <div className="font-medium">{activity.text}</div>
                      <div className="text-sm text-gray-500">
                        {format(new Date(activity.time), "MMM dd, yyyy 'at' HH:mm")}
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
