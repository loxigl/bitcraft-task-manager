"use client"

import { useState, useCallback } from "react"
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
} from "lucide-react"
import { format } from "date-fns"
import { professionIcons } from "@/lib/constants"
import {
  canClaimTask,
  canDoAnySubtask,
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
  refreshTasks,
}: TaskDashboardProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("active")
  const [professionFilter, setProfessionFilter] = useState("all")
  const [showOnlyAvailable, setShowOnlyAvailable] = useState(false)
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" })
  const [expandedTasks, setExpandedTasks] = useState(new Set())
  const [selectedTask, setSelectedTask] = useState(null)
  
  const { currentUser } = useUser()
  const currentUserName = currentUser?.name || ""

  const toggleTaskExpansion = (taskId: number) => {
    const newExpanded = new Set(expandedTasks)
    if (newExpanded.has(taskId)) {
      newExpanded.delete(taskId)
    } else {
      newExpanded.add(taskId)
    }
    setExpandedTasks(newExpanded)
  }

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch = task.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = 
      statusFilter === "all" || 
      task.status === statusFilter ||
      (statusFilter === "active" && (task.status === "open" || task.status === "in_progress"))
    const matchesProfession = professionFilter === "all" || task.professions.includes(professionFilter)

    const matchesUserLevel =
      !showOnlyAvailable ||
      task.professions.every((prof: string) => {
        const userLevel = userProfessions[prof]?.level || 0
        const requiredLevel = task.levels[prof] || 0
        return userLevel >= requiredLevel
      }) ||
      canDoAnySubtask(task.subtasks, task, userProfessions)

    return matchesSearch && matchesStatus && matchesProfession && matchesUserLevel
  })

  const sortedTasks = [...filteredTasks].sort((a, b) => {
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
                <CardDescription>{sortedTasks.length} tasks found</CardDescription>
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
                  {sortedTasks.map((task) => {
                    const availableSubtasks = getAvailableSubtasks(task)
                    const isExpanded = expandedTasks.has(task.id)
                    const hasSubtasks = task.subtasks && task.subtasks.length > 0
                    const canDoTask = canClaimTask(task, userProfessions)
                    const userAssignedToTask = isUserAssigned(task.assignedTo, currentUserName)
                    const hasTaskAssignees = Array.isArray(task.assignedTo)
                      ? task.assignedTo.length > 0
                      : !!task.assignedTo

                    return (
                      <>
                        <TableRow
                          key={task.id}
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

                        {isExpanded && hasSubtasks && (
                          <TableRow>
                            <TableCell colSpan={7} className="bg-gray-50 p-0">
                              <div className="p-4">
                                <h4 className="font-semibold mb-3 text-gray-700">
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
                            </TableCell>
                          </TableRow>
                        )}
                      </>
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
    </div>
  )
}
