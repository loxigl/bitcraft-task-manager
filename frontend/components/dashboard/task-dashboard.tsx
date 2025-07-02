"use client"

import React, { useState, useCallback, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import {
  Search,
  Filter,
  Plus,
  BarChart3,
  Clock,
  User,
  ChevronDown,
  ChevronRight,
  UserPlus,
  UserMinus,
  CalendarIcon,
  MapPin,
  Package,
  Save,
  AlertCircle,
} from "lucide-react"
import { format } from "date-fns"
import { professionIcons } from "@/lib/constants"
import {
  canClaimTask,
  canDoAnySubtask,
  canDoSubtask,
  isUserAssigned,
  getStatusColor,
  getPriorityColor,
  calculateOverallProgress,
  getAllAvailableSubtasks,
} from "@/lib/utils/task-utils"
import { ResourceTracker } from "@/components/resources/resource-tracker"
import { SubtaskRenderer } from "@/components/tasks/subtask-renderer"
import { useUser } from "@/contexts/UserContext"
import { cn } from "@/lib/utils"
import { SaveTemplateDialog } from "@/components/tasks/save-template-dialog"
import { useToast } from "@/hooks/use-toast"

interface TaskDashboardProps {
  tasks: any[]
  userProfessions: any
  claimTask: (taskId: string | number) => void
  claimSubtask: (taskId: string | number, subtaskId: number | string) => void
  updateResourceContribution: (taskId: string | number, subtaskId: number | string | null, resourceName: string, quantity: number) => void
  setCurrentView: (view: string) => void
  setIsCreateTaskOpen: (open: boolean) => void
  onTaskUpdate?: () => void
  completeSubtask?: (taskId: string | number, subtaskId: number | string) => void
  completeTask?: (taskId: string | number) => void
  refreshTasks?: () => void
}

export function TaskDashboard({
  tasks,
  userProfessions,
  claimTask,
  claimSubtask,
  updateResourceContribution,
  setCurrentView,
  setIsCreateTaskOpen,
  onTaskUpdate,
  completeSubtask,
  completeTask,
  refreshTasks,
}: TaskDashboardProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("active")
  const [professionFilter, setProfessionFilter] = useState("all")
  const [showOnlyAvailable, setShowOnlyAvailable] = useState(false)
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" })
  const [expandedTasks, setExpandedTasks] = useState(new Set())
  const [expandedResources, setExpandedResources] = useState(new Set())
  const [selectedTask, setSelectedTask] = useState(null)
  
  const { currentUser } = useUser()
  const { toast } = useToast()
  const currentUserName = currentUser?.name || ""

  // Состояние для работы с шаблонами
  const [saveTemplateDialogOpen, setSaveTemplateDialogOpen] = useState(false)
  const [currentTemplateTaskId, setCurrentTemplateTaskId] = useState<number | null>(null)
  const [currentTemplateName, setCurrentTemplateName] = useState("")

  const toggleTaskExpansion = (taskId: number) => {
    const newExpanded = new Set(expandedTasks)
    if (newExpanded.has(taskId)) {
      newExpanded.delete(taskId)
    } else {
      newExpanded.add(taskId)
    }
    setExpandedTasks(newExpanded)
  }

  const toggleResourceExpansion = (itemId: string) => {
    const newExpanded = new Set(expandedResources)
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId)
    } else {
      newExpanded.add(itemId)
    }
    setExpandedResources(newExpanded)
  }

  // Функция для получения всех элементов для отображения (задачи + подзадачи в плоской структуре при фильтрах)
  const getAllDisplayItems = () => {
    const items: any[] = []
    
    // Если есть поисковый запрос или фильтры (кроме default), включаем подзадачи в плоскую структуру
    const shouldFlattenSubtasks = searchTerm.trim() !== "" || 
                                 statusFilter !== "active" || 
                                 professionFilter !== "all"

    // Функция для проверки соответствия задачи критериям поиска
    const matchesSearchCriteria = (item: any, searchTerm: string) => {
      if (searchTerm.trim() === "") return true
      return item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
             (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()))
    }

    // Функция для проверки наличия подзадач, соответствующих критериям
    const hasMatchingSubtasks = (subtasks: any[], searchTerm: string, professionFilter: string, statusFilter: string, showOnlyAvailable: boolean) => {
      if (!subtasks) return false
      return subtasks.some(subtask => {
        const subtaskMatchesSearch = matchesSearchCriteria(subtask, searchTerm)
        const subtaskMatchesStatus = 
          statusFilter === "all" || 
          (subtask.status && subtask.status === statusFilter) ||
          (statusFilter === "active" && (!subtask.status || subtask.status === "open" || subtask.status === "in_progress"))
        const subtaskMatchesProfession = professionFilter === "all" || 
                                       (subtask.professions && subtask.professions.includes(professionFilter))
        const subtaskMatchesUserLevel = !showOnlyAvailable || 
          canDoSubtask(subtask, tasks.find(t => t._id === subtask.parentTaskId || t.id === subtask.parentTaskId), userProfessions)

        return (subtaskMatchesSearch && subtaskMatchesStatus && subtaskMatchesProfession && subtaskMatchesUserLevel) ||
               (subtask.subtasks && hasMatchingSubtasks(subtask.subtasks, searchTerm, professionFilter, statusFilter, showOnlyAvailable))
      })
    }

    tasks.forEach(task => {
      const taskMatchesSearch = matchesSearchCriteria(task, searchTerm)
      const taskMatchesStatus = 
        statusFilter === "all" || 
        task.status === statusFilter ||
        (statusFilter === "active" && (task.status === "open" || task.status === "in_progress"))
      const taskMatchesProfession = professionFilter === "all" || task.professions.includes(professionFilter)
      
      const taskMatchesUserLevel =
        !showOnlyAvailable ||
        task.professions.every((prof: string) => {
          const userLevel = userProfessions[prof]?.level || 0
          const requiredLevel = task.levels[prof] || 0
          return userLevel >= requiredLevel
        }) ||
        canDoAnySubtask(task.subtasks, task, userProfessions)

      // Проверяем, есть ли подходящие подзадачи
      const hasMatchingSubtasksResult = hasMatchingSubtasks(task.subtasks, searchTerm, professionFilter, statusFilter, showOnlyAvailable)

      // Добавляем основную задачу, если:
      // 1. Нет активных фильтров/поиска И задача соответствует критериям
      // 2. ИЛИ задача сама соответствует критериям 
      // 3. ИЛИ у задачи есть подходящие подзадачи (и мы не в режиме плоской структуры)
      const shouldIncludeMainTask = 
        (!shouldFlattenSubtasks && taskMatchesSearch && taskMatchesStatus && taskMatchesProfession && taskMatchesUserLevel) ||
        (shouldFlattenSubtasks && taskMatchesSearch && taskMatchesStatus && taskMatchesProfession && taskMatchesUserLevel) ||
        (!shouldFlattenSubtasks && hasMatchingSubtasksResult && taskMatchesStatus && taskMatchesProfession && taskMatchesUserLevel)

      if (shouldIncludeMainTask) {
        items.push({
          ...task,
          isMainTask: true,
          parentTaskId: null,
          originalHierarchyInfo: null
        })
      }

      // Если нужно выравнивать подзадачи, добавляем подходящие подзадачи
      if (shouldFlattenSubtasks && task.subtasks) {
        const addMatchingSubtasks = (subtasks: any[], parentTask: any, parentSubtaskName?: string) => {
          subtasks.forEach(subtask => {
            const subtaskMatchesSearch = matchesSearchCriteria(subtask, searchTerm)
            const subtaskMatchesStatus = 
              statusFilter === "all" || 
              (subtask.status && subtask.status === statusFilter) ||
              (statusFilter === "active" && (!subtask.status || subtask.status === "open" || subtask.status === "in_progress"))
            const subtaskMatchesProfession = professionFilter === "all" || 
                                           (subtask.professions && subtask.professions.includes(professionFilter))

            const subtaskMatchesUserLevel = !showOnlyAvailable || 
              canDoSubtask(subtask, parentTask, userProfessions)

            if (subtaskMatchesSearch && subtaskMatchesStatus && subtaskMatchesProfession && subtaskMatchesUserLevel) {
              items.push({
                ...subtask,
                isMainTask: false,
                parentTaskId: parentTask._id || parentTask.id,
                parentTaskName: parentTask.name,
                originalHierarchyInfo: parentSubtaskName ? `${parentTask.name} > ${parentSubtaskName}` : parentTask.name,
                // Добавляем информацию о родительской задаче для ресурсов
                parentTask: parentTask
              })
            }

            // Рекурсивно обрабатываем вложенные подзадачи
            if (subtask.subtasks) {
              addMatchingSubtasks(subtask.subtasks, parentTask, subtask.name)
            }
          })
        }
        
        addMatchingSubtasks(task.subtasks, task)
      }
    })

    return items
  }

  const filteredItems = getAllDisplayItems()

  const sortedTasks = [...filteredItems].sort((a, b) => {
    if (!sortConfig.key) return 0

    let aValue = a[sortConfig.key]
    let bValue = b[sortConfig.key]

    if (sortConfig.key === "deadline") {
      aValue = new Date(aValue)
      bValue = new Date(bValue)
    }

    if (aValue < bValue) {
      return sortConfig.direction === "asc" ? -1 : 1
    }
    if (aValue > bValue) {
      return sortConfig.direction === "asc" ? 1 : -1
    }
    return 0
  })

  const handleSort = (key: string) => {
    let direction = "asc"
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc"
    }
    setSortConfig({ key, direction })
  }

  const getAvailableSubtasks = (task: any) => {
    if (!showOnlyAvailable) {
      return task.subtasks || []
    }
    return getAllAvailableSubtasks(task.subtasks, task, userProfessions)
  }

  // Обертка для клейма с обновлением (используем useCallback для оптимизации)
  const handleClaimTask = useCallback(async (taskId: string | number) => {
    await claimTask(taskId)
    // Вызываем onTaskUpdate только если он существует
    if (onTaskUpdate) {
      onTaskUpdate()
    }
  }, [claimTask, onTaskUpdate])

  const handleClaimSubtask = useCallback(async (taskId: string | number, subtaskId: number | string) => {
    await claimSubtask(taskId, subtaskId)
    // Вызываем onTaskUpdate только если он существует
    if (onTaskUpdate) {
      onTaskUpdate()
    }
  }, [claimSubtask, onTaskUpdate])

  // Функция для открытия диалога сохранения шаблона
  const openSaveTemplateDialog = (taskId: string | number, name?: string) => {
    setCurrentTemplateTaskId(Number(taskId))
    setCurrentTemplateName(name || "")
    setSaveTemplateDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filters Sidebar */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="search">Search Tasks</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Search by name..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div>
              <Label>Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active (Open & In Progress)</SelectItem>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Profession</Label>
              <Select value={professionFilter} onValueChange={setProfessionFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Professions</SelectItem>
                  {Object.keys(professionIcons).map((profession) => (
                    <SelectItem key={profession} value={profession}>
                      {profession.charAt(0).toUpperCase() + profession.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="available-only"
                checked={showOnlyAvailable}
                onChange={(e) => setShowOnlyAvailable(e.target.checked)}
                className="rounded border-gray-300"
              />
              <Label htmlFor="available-only" className="text-sm">
                Available for me
              </Label>
            </div>
          </CardContent>
        </Card>

        {/* Tasks Table */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Available Tasks</CardTitle>
                <CardDescription>{sortedTasks.length} items found</CardDescription>
              </div>
              {refreshTasks && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={refreshTasks}
                  className="flex items-center gap-2"
                >
                  <Clock className="h-4 w-4" />
                  Refresh
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-8"></TableHead>
                    <TableHead>
                      <Button variant="ghost" onClick={() => handleSort("name")} className="h-auto p-0 font-semibold">
                        Task
                      </Button>
                    </TableHead>
                    <TableHead>Professions</TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        onClick={() => handleSort("deadline")}
                        className="h-auto p-0 font-semibold"
                      >
                        Deadline
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button variant="ghost" onClick={() => handleSort("status")} className="h-auto p-0 font-semibold">
                        Status
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        onClick={() => handleSort("priority")}
                        className="h-auto p-0 font-semibold"
                      >
                        Priority
                      </Button>
                    </TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedTasks.map((item) => {
                    const isMainTask = item.isMainTask !== false // по умолчанию true для старых элементов
                    
                    // Если это подзадача в плоской структуре
                    if (!isMainTask) {
                      const parentTask = item.parentTask
                      const subtask = item
                      const canDoTask = canDoSubtask(subtask, parentTask, userProfessions)
                      const userAssignedToTask = isUserAssigned(subtask.assignedTo, currentUserName)
                      
                                            return (
                        <React.Fragment key={`subtask-${parentTask._id || parentTask.id}-${subtask.id}`}>
                          <TableRow>
                            <TableCell>
                              {subtask.resources && subtask.resources.length > 0 && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => toggleResourceExpansion(`subtask-${parentTask._id || parentTask.id}-${subtask.id}`)}
                                  className="h-6 w-6 p-0"
                                >
                                  {expandedResources.has(`subtask-${parentTask._id || parentTask.id}-${subtask.id}`) ? (
                                    <ChevronDown className="h-4 w-4" />
                                  ) : (
                                    <ChevronRight className="h-4 w-4" />
                                  )}
                                </Button>
                              )}
                            </TableCell>
                            <TableCell>
                              <div>
                                <div className="font-medium flex items-center gap-2">
                                  <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">
                                    Subtask
                                  </Badge>
                                  {subtask.name}
                                  {userAssignedToTask && (
                                    <Badge variant="outline" className="text-blue-600 bg-blue-50 text-xs">
                                      <User className="h-3 w-3 mr-1" />
                                      You
                                    </Badge>
                                  )}
                                  {subtask.resources && subtask.resources.length > 0 && (
                                    <Badge variant="outline" className="text-xs text-orange-600 bg-orange-50">
                                      <Package className="h-3 w-3 mr-1" />
                                      {subtask.resources.length} Resources
                                    </Badge>
                                  )}
                                </div>
                                <div className="text-sm text-gray-500 truncate max-w-xs">{subtask.description}</div>
                                <div className="text-xs text-blue-600 mt-1">
                                  Parent task: {item.originalHierarchyInfo}
                                </div>
                                {subtask.assignedTo && (
                                  <div className="text-xs text-blue-600 mt-1">
                                    Assigned to:{" "}
                                    {Array.isArray(subtask.assignedTo) ? subtask.assignedTo.join(", ") : subtask.assignedTo}
                                  </div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-1 flex-wrap">
                                {(subtask.professions || []).map((prof: string) => {
                                  const Icon = professionIcons[prof as keyof typeof professionIcons]
                                  const userLevel = userProfessions[prof]?.level || 0
                                  const requiredLevel = subtask.levels?.[prof] || 0
                                  const canDo = userLevel >= requiredLevel
                                  if (!Icon) return null
                                  return (
                                    <div
                                      key={prof}
                                      className={cn(
                                        "flex items-center gap-1 rounded px-2 py-1",
                                        canDo ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800",
                                      )}
                                    >
                                      <Icon className="h-3 w-3" />
                                      <span className="text-xs">{requiredLevel}</span>
                                    </div>
                                  )
                                })}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1 text-sm">
                                <Clock className="h-3 w-3" />
                                {format(new Date(parentTask.deadline), "MMM dd")}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge className={cn(getStatusColor(subtask.status || 'open'))}>{subtask.status || 'open'}</Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className={getPriorityColor(parentTask.priority)}>
                                {parentTask.priority}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-1">
                                {canDoTask ? (
                                  <Button
                                    variant={userAssignedToTask ? "secondary" : "default"}
                                    size="sm"
                                    onClick={() => handleClaimSubtask(parentTask._id || parentTask.id, subtask.id)}
                                    className="text-xs"
                                  >
                                    {userAssignedToTask ? (
                                      <>
                                        <UserMinus className="h-3 w-3 mr-1" />
                                        Leave
                                      </>
                                    ) : (
                                      <>
                                        <UserPlus className="h-3 w-3 mr-1" />
                                        Claim
                                      </>
                                    )}
                                  </Button>
                                ) : (
                                  <div className="text-xs text-gray-500 px-2">Can't claim</div>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>

                          {/* Отдельная строка для ресурсов подзадачи */}
                          {subtask.resources && subtask.resources.length > 0 && expandedResources.has(`subtask-${parentTask._id || parentTask.id}-${subtask.id}`) && (
                            <TableRow>
                              <TableCell colSpan={7} className="bg-orange-50 border-l-4 border-orange-200 p-0">
                                <div className="p-4">
                                  <h5 className="font-medium mb-3 text-orange-800 flex items-center gap-2">
                                    <Package className="h-4 w-4" />
                                    Subtask Resources ({subtask.resources.length})
                                  </h5>
                                  <div className="bg-white rounded border p-3">
                                    <ResourceTracker
                                      resources={subtask.resources}
                                      taskId={parentTask._id || parentTask.id}
                                      subtaskId={subtask.id}
                                      canEdit={userAssignedToTask}
                                      title=""
                                      updateResourceContribution={updateResourceContribution}
                                      onCompleteSubtask={completeSubtask}
                                    />
                                  </div>
                                </div>
                              </TableCell>
                            </TableRow>
                          )}
                        </React.Fragment>
                      )
                    }

                    // Для основных задач
                    const task = item
                    const availableSubtasks = getAvailableSubtasks(task)
                    const isExpanded = expandedTasks.has(task.id)
                    const hasSubtasks = task.subtasks && task.subtasks.length > 0
                    const canDoTask = canClaimTask(task, userProfessions)
                    const userAssignedToTask = isUserAssigned(task.assignedTo, currentUserName)
                    const hasTaskAssignees = Array.isArray(task.assignedTo)
                      ? task.assignedTo.length > 0
                      : !!task.assignedTo

                    return (
                      <React.Fragment key={task.id || task._id}>
                        <TableRow
                          className={cn(
                            "border-b",
                            !canDoTask && !canDoAnySubtask(task.subtasks, task, userProfessions) && showOnlyAvailable
                              ? "opacity-50"
                              : "",
                            hasSubtasks ? "border-b-2 border-gray-200" : "",
                          )}
                        >
                          <TableCell>
                            {hasSubtasks && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleTaskExpansion(task.id)}
                                className="h-6 w-6 p-0"
                              >
                                {isExpanded ? (
                                  <ChevronDown className="h-4 w-4" />
                                ) : (
                                  <ChevronRight className="h-4 w-4" />
                                )}
                              </Button>
                            )}
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium flex items-center gap-2">
                                {task.name}
                                {userAssignedToTask && (
                                  <Badge variant="outline" className="text-blue-600 bg-blue-50 text-xs">
                                    <User className="h-3 w-3 mr-1" />
                                    You
                                  </Badge>
                                )}
                              </div>
                              <div className="text-sm text-gray-500 truncate max-w-xs">{task.description}</div>
                              {task.createdBy && (
                                <div className="text-xs text-gray-400 mt-1">
                                  Created by: {task.createdBy}
                                </div>
                              )}
                              {hasTaskAssignees && (
                                <div className="text-xs text-blue-600 mt-1">
                                  Assigned to:{" "}
                                  {Array.isArray(task.assignedTo) ? task.assignedTo.join(", ") : task.assignedTo}
                                </div>
                              )}
                              {hasSubtasks && (
                                <div className="text-xs text-blue-600 mt-1">
                                  {availableSubtasks.length} subtask{availableSubtasks.length !== 1 ? "s" : ""}{" "}
                                  {showOnlyAvailable ? "available" : "total"}
                                </div>
                              )}
                              {(task.shipTo || task.takeFrom) && (
                                <div className="flex gap-3 mt-1 text-xs text-gray-500">
                                  {task.takeFrom && (
                                    <div className="flex items-center gap-1">
                                      <MapPin className="h-3 w-3" />
                                      <span>From: {task.takeFrom}</span>
                                    </div>
                                  )}
                                  {task.shipTo && (
                                    <div className="flex items-center gap-1">
                                      <Package className="h-3 w-3" />
                                      <span>To: {task.shipTo}</span>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1 flex-wrap">
                              {task.professions.map((prof: string) => {
                                const Icon = professionIcons[prof as keyof typeof professionIcons]
                                const userLevel = userProfessions[prof]?.level || 0
                                const requiredLevel = task.levels[prof] || 0
                                const canDo = userLevel >= requiredLevel
                                if (!Icon) return null
                                return (
                                  <div
                                    key={prof}
                                    className={cn(
                                      "flex items-center gap-1 rounded px-2 py-1",
                                      canDo ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800",
                                    )}
                                  >
                                    <Icon className="h-3 w-3" />
                                    <span className="text-xs">{requiredLevel}</span>
                                  </div>
                                )
                              })}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1 text-sm">
                              <Clock className="h-3 w-3" />
                              {format(new Date(task.deadline), "MMM dd")}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={cn(getStatusColor(task.status))}>{task.status}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={getPriorityColor(task.priority)}>
                              {task.priority}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              {canDoTask ? (
                                <Button
                                  variant={userAssignedToTask ? "secondary" : "default"}
                                  size="sm"
                                  onClick={() => handleClaimTask(task._id || task.id)}
                                  className="text-xs"
                                >
                                  {userAssignedToTask ? (
                                    <>
                                      <UserMinus className="h-3 w-3 mr-1" />
                                      Leave
                                    </>
                                  ) : (
                                    <>
                                      <UserPlus className="h-3 w-3 mr-1" />
                                      Claim
                                    </>
                                  )}
                                </Button>
                              ) : (
                                <div className="text-xs text-gray-500 px-2">Can't claim</div>
                              )}
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => openSaveTemplateDialog(task.id || task._id, task.name)}
                                className="text-xs"
                                title="Save as template"
                              >
                                <Save className="h-3 w-3 mr-1" />
                                Save
                              </Button>
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button variant="outline" size="sm" onClick={() => setSelectedTask(task)}>
                                    Details
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                                  <DialogHeader>
                                    <DialogTitle>{task.name}</DialogTitle>
                                    <DialogDescription>
                                      Created by {task.createdBy} • Due {format(new Date(task.deadline), "PPP")}
                                    </DialogDescription>
                                  </DialogHeader>
                                  {selectedTask && selectedTask.id === task.id && (
                                    <div className="space-y-6">
                                      <div>
                                        <h3 className="text-lg font-semibold mb-2">Description</h3>
                                        <p className="text-gray-700">{task.description}</p>
                                      </div>

                                      <div>
                                        <h3 className="text-lg font-semibold mb-2">Required Professions</h3>
                                        <div className="flex gap-2 flex-wrap">
                                          {task.professions.map((prof: string) => {
                                            const Icon = professionIcons[prof]
                                            const userLevel = userProfessions[prof]?.level || 0
                                            const requiredLevel = task.levels[prof] || 0
                                            const canDo = userLevel >= requiredLevel
                                            return (
                                              <div
                                                key={prof}
                                                className={cn(
                                                  "flex items-center gap-2 rounded px-3 py-2",
                                                  canDo ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800",
                                                )}
                                              >
                                                <Icon className="h-4 w-4" />
                                                <span className="capitalize">{prof}</span>
                                                <Badge variant="outline">
                                                  {userLevel}/{requiredLevel}
                                                </Badge>
                                              </div>
                                            )
                                          })}
                                        </div>
                                      </div>

                                      <div className="flex justify-end">
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() => openSaveTemplateDialog(task.id, task.name)}
                                          className="flex items-center gap-1"
                                        >
                                          <Save className="h-4 w-4" />
                                          Save as Template
                                        </Button>
                                      </div>

                                      {task.resources && task.resources.length > 0 && (
                                        <div>
                                          <h3 className="text-lg font-semibold mb-2">Resources Required</h3>
                                          <ResourceTracker
                                            resources={task.resources}
                                            taskId={task._id || task.id}
                                            subtaskId={null}
                                            canEdit={userAssignedToTask}
                                            title=""
                                            updateResourceContribution={updateResourceContribution}
                                            onCompleteTask={completeTask}
                                          />
                                        </div>
                                      )}

                                      {hasSubtasks && (
                                        <div>
                                          <h3 className="text-lg font-semibold mb-2">Subtasks</h3>
                                          <SubtaskRenderer
                                            subtasks={task.subtasks}
                                            parentTask={task}
                                            taskId={task._id || task.id}
                                            userProfessions={userProfessions}
                                            claimSubtask={handleClaimSubtask}
                                            updateResourceContribution={updateResourceContribution}
                                            showOnlyAvailable={showOnlyAvailable}
                                            completeSubtask={completeSubtask}
                                          />
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </DialogContent>
                              </Dialog>
                            </div>
                          </TableCell>
                        </TableRow>

                        {isExpanded && (task.resources?.length > 0 || hasSubtasks) && (
                          <TableRow>
                            <TableCell colSpan={7} className="bg-gray-50 p-0">
                              <div className="p-4 space-y-4">
                                {/* Блок ресурсов */}
                                {task.resources && task.resources.length > 0 && (
                                  <div>
                                    <h4 className="font-semibold mb-3 text-gray-700 flex items-center gap-2">
                                      <Package className="h-4 w-4" />
                                      Resources Required ({task.resources.length})
                                    </h4>
                                    <div className="bg-white rounded border p-3">
                                      <ResourceTracker
                                        resources={task.resources}
                                        taskId={task._id || task.id}
                                        subtaskId={null}
                                        canEdit={userAssignedToTask}
                                        title=""
                                        updateResourceContribution={updateResourceContribution}
                                        onCompleteTask={completeTask}
                                      />
                                    </div>
                                  </div>
                                )}

                                {/* Блок подзадач */}
                                {hasSubtasks && (
                                  <div>
                                    <h4 className="font-semibold mb-3 text-gray-700 flex items-center gap-2">
                                      <BarChart3 className="h-4 w-4" />
                                      Subtasks ({availableSubtasks.length} available)
                                    </h4>
                                    <SubtaskRenderer
                                      subtasks={availableSubtasks}
                                      parentTask={task}
                                      taskId={task._id || task.id}
                                      userProfessions={userProfessions}
                                      claimSubtask={handleClaimSubtask}
                                      updateResourceContribution={updateResourceContribution}
                                      showOnlyAvailable={showOnlyAvailable}
                                      completeSubtask={completeSubtask}
                                    />
                                  </div>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </React.Fragment>
                    )
                  })}
                </TableBody>
              </Table>

              {sortedTasks.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <p>No tasks found matching your criteria.</p>
                  <p className="text-sm mt-2">Try adjusting your filters or check back later for new tasks.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Диалог сохранения шаблона */}
      <SaveTemplateDialog 
        isOpen={saveTemplateDialogOpen}
        onClose={() => setSaveTemplateDialogOpen(false)}
        taskId={currentTemplateTaskId!}
        subtaskId={null}
        defaultName={currentTemplateName}
        onSuccess={() => {
          toast({
            title: "Template saved",
            description: "Your template has been saved successfully"
          })
          if (refreshTasks) refreshTasks()
        }}
      />
    </div>
  )
}
