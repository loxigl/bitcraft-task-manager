"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ClipboardList, AlertCircle, Clock, CheckCircle, Edit, Trash2, ChevronDown, ChevronRight, Package } from "lucide-react"
import { format } from "date-fns"
import { getStatusColor, getPriorityColor } from "@/lib/utils/task-utils"
import { cn } from "@/lib/utils"
import { SubtaskRenderer } from "@/components/tasks/subtask-renderer"
import { ResourceTracker } from "@/components/resources/resource-tracker"
import { useState } from "react"

interface AdminPanelProps {
  tasks: any[]
  setCurrentView: (view: string) => void
  setEditingTask: (task: any) => void
  setIsCreateTaskOpen: (open: boolean) => void
  deleteTask: (taskId: number) => void
  claimSubtask: (taskId: string | number, subtaskId: number | string) => void
  updateResourceContribution: (taskId: string | number, subtaskId: number | string | null, resourceName: string, quantity: number) => void
  completeSubtask: (taskId: string | number, subtaskId: number | string) => void
  updateTaskStatus: (taskId: string, status: string) => void
  userProfessions: any
  refreshTasks: () => void
}

export function AdminPanel({
  tasks,
  setCurrentView,
  setEditingTask,
  setIsCreateTaskOpen,
  deleteTask,
  claimSubtask,
  updateResourceContribution,
  completeSubtask,
  updateTaskStatus,
  userProfessions,
  refreshTasks,
}: AdminPanelProps) {
  const [expandedTasks, setExpandedTasks] = useState(new Set())
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Guild Administration</h1>
          <p className="text-gray-600">Manage tasks and monitor guild activity</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setCurrentView("dashboard")} variant="outline">
            Back to Tasks
          </Button>
          <Button onClick={refreshTasks} variant="outline" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Tasks</p>
                <p className="text-2xl font-bold">{tasks.length}</p>
              </div>
              <ClipboardList className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Open Tasks</p>
                <p className="text-2xl font-bold text-green-600">{tasks.filter((t) => t.status === "open").length}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">In Progress</p>
                <p className="text-2xl font-bold text-yellow-600">{tasks.filter((t) => t.status === "taken").length}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-600">{tasks.filter((t) => t.status === "done").length}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-gray-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Task Management</CardTitle>
          <CardDescription>Overview of all guild tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Task</TableHead>
                <TableHead>Assigned To</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Deadline</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tasks.map((task) => {
                const taskKey = task._id || task.id
                const isExpanded = expandedTasks.has(taskKey)
                
                return (
                  <>
                    <TableRow key={taskKey}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const newExpanded = new Set(expandedTasks)
                              if (isExpanded) {
                                newExpanded.delete(taskKey)
                              } else {
                                newExpanded.add(taskKey)
                              }
                              setExpandedTasks(newExpanded)
                            }}
                            className="h-6 w-6 p-0"
                          >
                            {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                          </Button>
                          <div>
                            <div>{task.name}</div>
                            <div className="text-xs text-gray-500">
                              Created by: {task.createdBy || "Unknown"}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {Array.isArray(task.assignedTo) && task.assignedTo.length > 0
                          ? task.assignedTo.join(", ")
                          : task.assignedTo || "Unassigned"}
                      </TableCell>
                      <TableCell>
                        <Select
                          value={task.status}
                          onValueChange={(status) => updateTaskStatus(taskKey, status)}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="open">Open</SelectItem>
                            <SelectItem value="in_progress">In Progress</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getPriorityColor(task.priority)}>
                          {task.priority}
                        </Badge>
                      </TableCell>
                      <TableCell>{format(new Date(task.deadline), "MMM dd, yyyy")}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setEditingTask(task)
                              setIsCreateTaskOpen(true)
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => deleteTask(taskKey)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                    {isExpanded && (
                      <TableRow>
                        <TableCell colSpan={6} className="p-0">
                          <div className="p-4 bg-gray-50 border-t">
                            <div className="space-y-4">
                              {task.subtasks && task.subtasks.length > 0 && (
                                <div>
                                  <h4 className="font-medium mb-2">Subtasks</h4>
                                  <SubtaskRenderer
                                    subtasks={task.subtasks}
                                    parentTask={task}
                                    taskId={taskKey}
                                    userProfessions={userProfessions}
                                    claimSubtask={claimSubtask}
                                    updateResourceContribution={updateResourceContribution}
                                    showOnlyAvailable={false}
                                    completeSubtask={completeSubtask}
                                  />
                                </div>
                              )}
                              {task.resources && task.resources.length > 0 && (
                                <div>
                                  <h4 className="font-medium mb-2">Resources</h4>
                                  <ResourceTracker
                                    resources={task.resources}
                                    taskId={taskKey}
                                    subtaskId={null}
                                    canEdit={true}
                                    title=""
                                    updateResourceContribution={updateResourceContribution}
                                    onCompleteTask={(taskId) => updateTaskStatus(taskId.toString(), 'completed')}
                                  />
                                </div>
                              )}
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
