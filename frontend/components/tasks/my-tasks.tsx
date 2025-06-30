"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { format } from "date-fns"
import { 
  getStatusColor, 
  isUserAssigned, 
  calculateResourceProgress, 
  calculateOverallProgress 
} from "@/lib/utils/task-utils"
import { useUser } from "@/contexts/UserContext"
import { cn } from "@/lib/utils"
import { professionIcons } from "@/lib/constants"
import { ResourceTracker } from "@/components/resources/resource-tracker"
import { SubtaskRenderer } from "@/components/tasks/subtask-renderer"
import { 
  ChevronDown, 
  ChevronRight, 
  CheckCircle, 
  Clock, 
  Package, 
  MapPin, 
  Users,
  Calendar,
  Pencil,
  Trash2
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { apiClient } from "@/lib/api-client"

interface MyTasksProps {
  tasks: any[]
  userProfessions: any
  updateResourceContribution: (taskId: string | number, subtaskId: number | string | null, resourceName: string, quantity: number) => void
  claimSubtask: (taskId: string | number, subtaskId: number | string) => void
  onTaskUpdate?: () => void
  completeSubtask?: (taskId: string | number, subtaskId: number | string) => void
  onEditTask?: (task: any) => void
  updateTaskStatus?: (taskId: string, status: string) => void
  refreshTasks?: () => void
}

export function MyTasks({ 
  tasks, 
  userProfessions,
  updateResourceContribution, 
  claimSubtask,
  onTaskUpdate,
  completeSubtask,
  onEditTask,
  updateTaskStatus,
  refreshTasks
}: MyTasksProps) {
  const { currentUser } = useUser()
  const { toast } = useToast()
  const currentUserName = currentUser?.name || ""
  
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set())
  const [typeFilter, setTypeFilter] = useState("all") // Для assigned tab
  const [statusFilter, setStatusFilter] = useState("all") // Для created tab
  const [activeTab, setActiveTab] = useState("assigned")
  
  const userTasks = tasks.filter((task) => 
    isUserAssigned(task.assignedTo, currentUserName) && task.status !== 'completed'
  )
  
  const createdTasks = tasks.filter((task) => 
    task.createdBy === currentUserName
  )
  
  const filteredTasks = userTasks.filter(task => {
    if (typeFilter === "all") return true
    return task.taskType === typeFilter
  })
  
  const filteredCreatedTasks = createdTasks.filter(task => {
    if (statusFilter === "all") return true
    return task.status === statusFilter
  })

  const toggleExpanded = (taskId: string) => {
    const newExpanded = new Set(expandedTasks)
    if (newExpanded.has(taskId)) {
      newExpanded.delete(taskId)
    } else {
      newExpanded.add(taskId)
    }
    setExpandedTasks(newExpanded)
  }

  const markTaskCompleted = async (taskId: string) => {
    if (updateTaskStatus) {
      await updateTaskStatus(taskId, 'completed')
    } else {
      // Fallback to API client
      try {
        const response = await apiClient.updateTask(taskId, { status: 'completed' })
        if (response.success) {
          toast({
            title: "Task completed",
            description: "Task has been marked as completed successfully"
          })
          onTaskUpdate?.()
        } else {
          toast({
            variant: "destructive",
            title: "Failed to update task",
            description: response.message || "Please try again"
          })
        }
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error updating task",
          description: "Please try again later"
        })
      }
    }
  }

  const leaveTask = async (taskId: string) => {
    try {
      const response = await apiClient.claimTask(taskId, currentUserName)
      if (response.success) {
        toast({
          title: "Left task",
          description: "You have left the task successfully"
        })
        onTaskUpdate?.()
      } else {
        toast({
          variant: "destructive",
          title: "Failed to leave task",
          description: response.message || "Please try again"
        })
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error leaving task",
        description: "Please try again later"
      })
    }
  }

  const deleteTask = async (taskId: string) => {
    if (!confirm("Are you sure you want to delete this task? This action cannot be undone.")) {
      return
    }

    try {
      const response = await apiClient.deleteTask(taskId)
      if (response.success) {
        toast({
          title: "Task deleted",
          description: "Task has been deleted successfully"
        })
        onTaskUpdate?.()
      } else {
        toast({
          variant: "destructive",
          title: "Failed to delete task",
          description: response.message || "Please try again"
        })
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error deleting task",
        description: "Please try again later"
      })
    }
  }

  return (
    <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
          <h1 className="text-3xl font-bold">My Tasks</h1>
          <p className="text-gray-600">Manage your assigned and created tasks</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Filter:</span>
            {activeTab === "assigned" ? (
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="guild">Guild Tasks</SelectItem>
                  <SelectItem value="member">Member Tasks</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>
          {refreshTasks && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={refreshTasks}
              className="flex items-center gap-2"
            >
              <Package className="h-4 w-4" />
              Refresh
            </Button>
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="assigned">Assigned to Me ({filteredTasks.length})</TabsTrigger>
          <TabsTrigger value="created">Created by Me ({filteredCreatedTasks.length})</TabsTrigger>
        </TabsList>
        
        <TabsContent value="assigned" className="mt-6">
          {filteredTasks.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Package className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks assigned</h3>
            <p className="text-gray-600">
              {typeFilter === "all" 
                ? "You don't have any tasks assigned. Check the task board to claim some tasks!"
                : `No ${typeFilter} tasks found.`
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredTasks.map((task) => {
            const isExpanded = expandedTasks.has(task._id || task.id)
            const resourceProgress = calculateResourceProgress(task.resources)
            const overallProgress = calculateOverallProgress(task)
            
            return (
              <Card key={task._id || task.id} className="overflow-hidden">
                <Collapsible 
                  open={isExpanded} 
                  onOpenChange={() => toggleExpanded(task._id || task.id)}
                >
                  <CollapsibleTrigger asChild>
                    <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            {isExpanded ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                            <CardTitle className="text-lg">{task.name}</CardTitle>
                          </div>
                          <Badge className={cn(getStatusColor(task.status))}>
                            {task.status.replace('_', ' ')}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>Due {format(new Date(task.deadline), "MMM dd, yyyy")}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Package className="h-4 w-4" />
                            <span>{overallProgress}% Complete</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Progress bar */}
                      <div className="mt-3">
                        <Progress value={overallProgress} className="h-2" />
                      </div>
                    </CardHeader>
                  </CollapsibleTrigger>
                  
                  <CollapsibleContent>
                    <CardContent className="pt-0">
                      <Tabs defaultValue="overview" className="w-full">
                        <TabsList className="grid w-full grid-cols-4">
                          <TabsTrigger value="overview">Overview</TabsTrigger>
                          <TabsTrigger value="resources">Resources</TabsTrigger>
                          <TabsTrigger value="subtasks">Subtasks</TabsTrigger>
                          <TabsTrigger value="actions">Actions</TabsTrigger>
                        </TabsList>
                        
                        <TabsContent value="overview" className="space-y-4 mt-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <h4 className="font-medium mb-3">Task Details</h4>
                              <div className="space-y-2 text-sm">
                                {task.description && (
                                  <div>
                                    <span className="font-medium">Description:</span>
                                    <p className="text-gray-600 mt-1">{task.description}</p>
                                  </div>
                                )}
                                <div>
                                  <span className="font-medium">Priority:</span>
                                  <Badge className="ml-2" variant="outline">{task.priority}</Badge>
                                </div>
                                {task.shipTo && (
                                  <div className="flex items-center gap-2">
                                    <MapPin className="h-4 w-4" />
                                    <span className="font-medium">Ship to:</span>
                                    <span className="text-gray-600">{task.shipTo}</span>
                                  </div>
                                )}
                                {task.takeFrom && (
                                  <div className="flex items-center gap-2">
                                    <Package className="h-4 w-4" />
                                    <span className="font-medium">Take from:</span>
                                    <span className="text-gray-600">{task.takeFrom}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            <div>
                              <h4 className="font-medium mb-3">Required Professions</h4>
                              <div className="flex flex-wrap gap-2">
                                {task.professions?.map((prof: string) => {
                                  const Icon = professionIcons[prof as keyof typeof professionIcons]
                                  const requiredLevel = task.levels?.[prof] || 0
                                  return (
                                    <div key={prof} className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2">
                                      {Icon && <Icon className="h-4 w-4" />}
                                      <span className="capitalize font-medium">{prof}</span>
                                      <span className="text-sm text-gray-600">Lv.{requiredLevel}</span>
                                    </div>
                                  )
                                })}
                              </div>
                              
                              {task.assignedTo.length > 1 && (
                                <div className="mt-4">
                                  <h4 className="font-medium mb-2">Team Members</h4>
                                  <div className="flex flex-wrap gap-2">
                                    {task.assignedTo.map((member: string) => (
                                      <div key={member} className="flex items-center gap-2 bg-blue-50 text-blue-700 rounded px-2 py-1 text-sm">
                                        <Users className="h-3 w-3" />
                                        <span>{member}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </TabsContent>
                        
                        <TabsContent value="resources" className="mt-4">
                          <ResourceTracker
                            resources={task.resources || []}
                            taskId={task._id || task.id}
                            updateResourceContribution={updateResourceContribution}
                            canEdit={true}
                            title="Task Resources"
                            onCompleteTask={(taskId) => markTaskCompleted(taskId.toString())}
                          />
                        </TabsContent>
                        
                        <TabsContent value="subtasks" className="mt-4">
                          {task.subtasks && task.subtasks.length > 0 ? (
                            <SubtaskRenderer
                              subtasks={task.subtasks}
                              parentTask={task}
                              taskId={task._id || task.id}
                              userProfessions={userProfessions}
                              claimSubtask={claimSubtask}
                              updateResourceContribution={updateResourceContribution}
                              showOnlyAvailable={false}
                              level={0}
                              completeSubtask={completeSubtask}
                            />
                          ) : (
                            <div className="text-center py-8 text-gray-500">
                              <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                              <p>No subtasks for this task</p>
                            </div>
                          )}
                        </TabsContent>
                        
                        <TabsContent value="actions" className="mt-4">
                          <div className="space-y-4">
                            <h4 className="font-medium">Task Actions</h4>
                            <div className="flex flex-wrap gap-3">
                              {task.status !== 'completed' && (
                                <Button 
                                  onClick={() => markTaskCompleted(task._id || task.id)}
                                  className="flex items-center gap-2"
                                >
                                  <CheckCircle className="h-4 w-4" />
                                  Mark as Completed
                                </Button>
                              )}
                              
                              <Button 
                                variant="outline"
                                onClick={() => leaveTask(task._id || task.id)}
                                className="flex items-center gap-2"
                              >
                                <Users className="h-4 w-4" />
                                Leave Task
                              </Button>
                            </div>
                            
                            {task.status === 'completed' && (
                              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                <div className="flex items-center gap-2 text-green-700">
                                  <CheckCircle className="h-5 w-5" />
                                  <span className="font-medium">Task Completed!</span>
                                </div>
                                <p className="text-green-600 text-sm mt-1">
                                  Great job! This task has been marked as completed.
                                </p>
                              </div>
                            )}
                </div>
                        </TabsContent>
                      </Tabs>
                    </CardContent>
                  </CollapsibleContent>
                </Collapsible>
              </Card>
            )
          })}
              </div>
      )}
        </TabsContent>
        
        <TabsContent value="created" className="mt-6">
          {filteredCreatedTasks.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Package className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks created</h3>
                <p className="text-gray-600">
                  {statusFilter === "all" 
                    ? "You haven't created any tasks yet. Go to the main dashboard to create new tasks!"
                    : `No ${statusFilter} tasks found.`
                  }
                </p>
            </CardContent>
          </Card>
          ) : (
            <div className="space-y-4">
              {filteredCreatedTasks.map((task) => {
                const isExpanded = expandedTasks.has(task._id || task.id)
                const resourceProgress = calculateResourceProgress(task.resources)
                const overallProgress = calculateOverallProgress(task)
                
                return (
                  <Card key={task._id || task.id} className="overflow-hidden">
                    <Collapsible 
                      open={isExpanded} 
                      onOpenChange={() => toggleExpanded(task._id || task.id)}
                    >
                      <CollapsibleTrigger asChild>
                        <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-2">
                                {isExpanded ? (
                                  <ChevronDown className="h-4 w-4" />
                                ) : (
                                  <ChevronRight className="h-4 w-4" />
                                )}
                                <CardTitle className="text-lg">{task.name}</CardTitle>
                              </div>
                              <Badge className={cn(getStatusColor(task.status))}>
                                {task.status.replace('_', ' ')}
                              </Badge>
                              <Badge variant="outline" className="text-purple-600 bg-purple-50">
                                Creator
                              </Badge>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <div className="flex items-center gap-1">
                                <Users className="h-4 w-4" />
                                <span>{task.assignedTo.length} assigned</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                <span>Due {format(new Date(task.deadline), "MMM dd, yyyy")}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Package className="h-4 w-4" />
                                <span>{overallProgress}% Complete</span>
                              </div>
                            </div>
                          </div>
                          
                          {/* Progress bar */}
                          <div className="mt-3">
                            <Progress value={overallProgress} className="h-2" />
                          </div>
                        </CardHeader>
                      </CollapsibleTrigger>
                      
                      <CollapsibleContent>
                        <CardContent className="pt-0">
                          <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div>
                                <h4 className="font-medium mb-3">Task Details</h4>
                                <div className="space-y-2 text-sm">
                                  {task.description && (
                                    <div>
                                      <span className="font-medium">Description:</span>
                                      <p className="text-gray-600 mt-1">{task.description}</p>
                                    </div>
                                  )}
                                  <div>
                                    <span className="font-medium">Priority:</span>
                                    <Badge className="ml-2" variant="outline">{task.priority}</Badge>
                                  </div>
                                  <div>
                                    <span className="font-medium">Status:</span>
                                    <Badge className={cn("ml-2", getStatusColor(task.status))}>
                                      {task.status.replace('_', ' ')}
                                    </Badge>
                                  </div>
                                </div>
                              </div>
                              
                              <div>
                                <h4 className="font-medium mb-3">Assigned Members</h4>
                                <div className="flex flex-wrap gap-2">
                                  {task.assignedTo.length > 0 ? (
                                    task.assignedTo.map((member: string) => (
                                      <div key={member} className="flex items-center gap-2 bg-blue-50 text-blue-700 rounded px-2 py-1 text-sm">
                                        <Users className="h-3 w-3" />
                                        <span>{member}</span>
                                      </div>
                                    ))
                                  ) : (
                                    <p className="text-gray-500 text-sm">No members assigned yet</p>
                                  )}
                                </div>
                              </div>
                            </div>
                            
                            {/* Task Status Control for Creators */}
                            {updateTaskStatus && (
                              <div className="pt-4 border-t">
                                <h4 className="font-medium mb-3">Task Status</h4>
                                <div className="flex gap-2">
                                  <Select
                                    value={task.status}
                                    onValueChange={(status) => updateTaskStatus(task._id || task.id, status)}
                                  >
                                    <SelectTrigger className="w-40">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="open">Open</SelectItem>
                                      <SelectItem value="in_progress">In Progress</SelectItem>
                                      <SelectItem value="completed">Completed</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                            )}

                            {/* Edit/Delete Task Buttons */}
                            <div className="flex gap-2 pt-4 border-t">
                              {onEditTask && (
                                <Button 
                                  variant="outline" 
                                  onClick={() => onEditTask(task)}
                                  className="flex items-center gap-2"
                                >
                                  <Pencil className="h-4 w-4" />
                                  Edit Task
                                </Button>
                              )}
                              <Button 
                                variant="destructive" 
                                onClick={() => deleteTask(task._id || task.id)}
                                className="flex items-center gap-2"
                              >
                                <Trash2 className="h-4 w-4" />
                                Delete Task
                              </Button>
                            </div>
                            
                            {task.resources && task.resources.length > 0 && (
                              <div>
                                <h4 className="font-medium mb-3">Resources Progress</h4>
                                <ResourceTracker
                                  resources={task.resources || []}
                                  taskId={task._id || task.id}
                                  updateResourceContribution={updateResourceContribution}
                                  canEdit={false}
                                  title=""
                                />
                              </div>
                            )}
                            
                            {task.subtasks && task.subtasks.length > 0 && (
                              <div>
                                <h4 className="font-medium mb-3">Subtasks</h4>
                                <SubtaskRenderer
                                  subtasks={task.subtasks}
                                  parentTask={task}
                                  taskId={task._id || task.id}
                                  userProfessions={userProfessions}
                                  claimSubtask={claimSubtask}
                                  updateResourceContribution={updateResourceContribution}
                                  showOnlyAvailable={false}
                                  level={0}
                                  completeSubtask={completeSubtask}
                                />
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </CollapsibleContent>
                    </Collapsible>
                  </Card>
                )
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
