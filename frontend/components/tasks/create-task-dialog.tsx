"use client"

import { useState, useCallback, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Slider } from "@/components/ui/slider"
import { CalendarIcon, Plus, X, Package } from "lucide-react"
import { format } from "date-fns"
import { professionIcons } from "@/lib/constants"
import { apiClient } from "@/lib/api-client"
import { useToast } from "@/hooks/use-toast"
import { useUser } from "@/contexts/UserContext"

interface CreateTaskDialogProps {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  editingTask: any
  setEditingTask: (task: any) => void
  userProfessions: any
  onTaskCreated?: () => void
  taskType?: 'guild' | 'member'
}

// Вынесем компонент ResourceForm за пределы основного компонента
const ResourceForm = ({ resources, onAdd, onUpdate, onRemove, title = "Resources" }: any) => (
  <div>
    <div className="flex items-center justify-between mb-3">
      <Label className="text-xs font-medium">{title}</Label>
      <Button type="button" variant="outline" size="sm" onClick={onAdd}>
        <Plus className="h-3 w-3 mr-1" />
        Add Resource
      </Button>
    </div>

    {resources.length === 0 ? (
      <div className="text-center py-4 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
        <Package className="h-6 w-6 mx-auto mb-2 opacity-50" />
        <p className="text-xs">No resources yet. Click "Add Resource" to get started.</p>
      </div>
    ) : (
      <div className="space-y-3 max-h-32 overflow-y-auto">
        {resources.map((resource: any, index: number) => (
          <div key={resource.id} className="border rounded p-3 bg-gray-50">
            <div className="grid grid-cols-4 gap-2 mb-2">
              <div>
                <Label className="text-xs">Name</Label>
                <Input
                  placeholder="Resource name..."
                  value={resource.name}
                  onChange={(e) => onUpdate(index, "name", e.target.value)}
                  className="h-7 text-xs"
                />
              </div>
              <div>
                <Label className="text-xs">Needed</Label>
                <Input
                  type="number"
                  min="1"
                  value={resource.needed}
                  onChange={(e) => onUpdate(index, "needed", Number.parseInt(e.target.value) || 1)}
                  className="h-7 text-xs"
                />
              </div>
              <div>
                <Label className="text-xs">Unit</Label>
                <Input
                  placeholder="pieces, kg, etc."
                  value={resource.unit}
                  onChange={(e) => onUpdate(index, "unit", e.target.value)}
                  className="h-7 text-xs"
                />
              </div>
              <div className="flex items-end">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => onRemove(index)}
                  className="h-7 px-2 text-red-600 hover:text-red-700"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
)

// Вынесем SubtaskForm на уровень модуля
interface SubtaskFormProps {
  subtasks: any[]
  professionIcons: any
  addSubtask: () => void
  updateSubtask: (index: number, field: string, value: any) => void
  removeSubtask: (index: number) => void
  addSubtaskResource: (subtaskIndex: number) => void
  updateSubtaskResource: (subtaskIndex: number, resourceIndex: number, field: string, value: any) => void
  removeSubtaskResource: (subtaskIndex: number, resourceIndex: number) => void
}

const SubtaskForm: React.FC<SubtaskFormProps> = ({
  subtasks,
  professionIcons,
  addSubtask,
  updateSubtask,
  removeSubtask,
  addSubtaskResource,
  updateSubtaskResource,
  removeSubtaskResource,
}) => (
  <div>
    <div className="flex items-center justify-between mb-3">
      <Label className="text-sm font-medium">Subtasks</Label>
      <Button type="button" variant="outline" size="sm" onClick={addSubtask}>
        <Plus className="h-3 w-3 mr-1" />
        Add Subtask
      </Button>
    </div>

    <div className="space-y-4 max-h-96 overflow-y-auto">
      {subtasks.map((subtask: any, index: number) => (
        <div key={subtask.id} className="border rounded-lg p-4 bg-gray-50">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text-sm">Subtask {index + 1}</h4>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => removeSubtask(index)}
              className="h-7 px-2 text-red-600 hover:text-red-700"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
          
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <Label className="text-xs">Subtask Name</Label>
              <Input
                placeholder="Enter subtask name..."
                value={subtask.name}
                onChange={(e) => updateSubtask(index, "name", e.target.value)}
                className="h-8 text-xs"
              />
            </div>
            <div>
              <Label className="text-xs">Description</Label>
              <Input
                placeholder="Brief description..."
                value={subtask.description}
                onChange={(e) => updateSubtask(index, "description", e.target.value)}
                className="h-8 text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <Label className="text-xs">Take From (Optional)</Label>
              <Input
                placeholder="Source location..."
                value={subtask.takeFrom || ""}
                onChange={(e) => updateSubtask(index, "takeFrom", e.target.value)}
                className="h-8 text-xs"
              />
            </div>
            <div>
              <Label className="text-xs">Ship To (Optional)</Label>
              <Input
                placeholder="Destination location..."
                value={subtask.shipTo || ""}
                onChange={(e) => updateSubtask(index, "shipTo", e.target.value)}
                className="h-8 text-xs"
              />
            </div>
          </div>

          <div className="mb-3">
            <Label className="text-xs">Required Professions</Label>
            <div className="grid grid-cols-4 gap-2 mt-1">
              {Object.entries(professionIcons).map(([profession, Icon]) => {
                const IconComponent = Icon as React.ComponentType<{ className?: string }>
                return (
                <div key={`${subtask.id}-${profession}`} className="flex items-center gap-1">
                  <input
                    type="checkbox"
                    id={`subtask-${subtask.id}-prof-${profession}`}
                    checked={subtask.professions?.includes(profession) || false}
                    onChange={(e) => {
                      const currentProfs = subtask.professions || []
                      const newProfs = e.target.checked
                        ? [...currentProfs, profession]
                        : currentProfs.filter((p: string) => p !== profession)
                      updateSubtask(index, "professions", newProfs)
                      
                      // Handle levels
                      if (e.target.checked) {
                        const currentLevels = subtask.levels || {}
                        updateSubtask(index, "levels", { ...currentLevels, [profession]: 50 })
                      } else {
                        const currentLevels = { ...(subtask.levels || {}) }
                        delete currentLevels[profession]
                        updateSubtask(index, "levels", currentLevels)
                      }
                    }}
                    className="rounded"
                  />
                  <IconComponent className="h-3 w-3" />
                  <span className="text-xs capitalize">{profession}</span>
                </div>
                )
              })}
            </div>
            
            {/* Level sliders for selected professions */}
            {subtask.professions?.length > 0 && (
              <div className="mt-2 space-y-2">
                {subtask.professions.map((profession: string) => {
                  const Icon = professionIcons[profession as keyof typeof professionIcons]
                  const IconComponent = Icon as React.ComponentType<{ className?: string }>
                  return (
                    <div key={`${subtask.id}-level-${profession}`} className="flex items-center gap-2">
                      <IconComponent className="h-3 w-3" />
                      <span className="text-xs capitalize w-20">{profession}</span>
                      <div className="flex-1">
                        <Slider
                          value={[subtask.levels?.[profession] || 50]}
                          onValueChange={(value) => {
                            const currentLevels = subtask.levels || {}
                            updateSubtask(index, "levels", { ...currentLevels, [profession]: value[0] })
                          }}
                          max={100}
                          step={1}
                          className="w-full"
                        />
                      </div>
                      <span className="text-xs w-8">{subtask.levels?.[profession] || 50}</span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Subtask Resources */}
          <div className="mt-3">
            <ResourceForm
              resources={subtask.resources || []}
              onAdd={() => addSubtaskResource(index)}
              onUpdate={(resourceIndex: number, field: string, value: any) => 
                updateSubtaskResource(index, resourceIndex, field, value)
              }
              onRemove={(resourceIndex: number) => 
                removeSubtaskResource(index, resourceIndex)
              }
              title="Subtask Resources"
            />
          </div>
        </div>
      ))}
    </div>
  </div>
)

export function CreateTaskDialog({
  isOpen,
  setIsOpen,
  editingTask,
  setEditingTask,
  userProfessions,
  onTaskCreated,
  taskType = 'guild'
}: CreateTaskDialogProps) {
  const [taskName, setTaskName] = useState(editingTask?.name || "")
  const [taskDescription, setTaskDescription] = useState(editingTask?.description || "")
  const [taskTakeFrom, setTaskTakeFrom] = useState(editingTask?.takeFrom || "")
  const [taskShipTo, setTaskShipTo] = useState(editingTask?.shipTo || "")
  const [selectedProfessions, setSelectedProfessions] = useState(editingTask?.professions || [])
  const [professionLevels, setProfessionLevels] = useState(editingTask?.levels || {})
  const [taskPriority, setTaskPriority] = useState(editingTask?.priority || "medium")
  const [newTaskDate, setNewTaskDate] = useState(new Date())
  
  // Функция для генерации уникальных ID
  const generateId = useCallback(() => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, [])
  
  const [taskResources, setTaskResources] = useState(() => {
    const resources = editingTask?.resources || []
    return resources.map((resource: any, index: number) => ({
      ...resource,
      id: resource.id || generateId()
    }))
  })
  
  const [subtasks, setSubtasks] = useState(() => {
    const subtasks = editingTask?.subtasks || []
    return subtasks.map((subtask: any, index: number) => ({
      ...subtask,
      id: subtask.id || generateId(),
      resources: (subtask.resources || []).map((resource: any) => ({
        ...resource,
        id: resource.id || generateId()
      }))
    }))
  })
  
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const { currentUser } = useUser()

  // Обновляем состояния при изменении editingTask
  useEffect(() => {
    if (editingTask) {
      setTaskName(editingTask.name || "")
      setTaskDescription(editingTask.description || "")
      setTaskTakeFrom(editingTask.takeFrom || "")
      setTaskShipTo(editingTask.shipTo || "")
      setSelectedProfessions(editingTask.professions || [])
      setProfessionLevels(editingTask.levels || {})
      setTaskPriority(editingTask.priority || "medium")
      
      if (editingTask.deadline) {
        setNewTaskDate(new Date(editingTask.deadline))
      }
      
      const resources = editingTask.resources || []
      setTaskResources(resources.map((resource: any) => ({
        ...resource,
        id: resource.id || generateId()
      })))
      
      const subtasks = editingTask.subtasks || []
      setSubtasks(subtasks.map((subtask: any) => ({
        ...subtask,
        id: subtask.id || generateId(),
        resources: (subtask.resources || []).map((resource: any) => ({
          ...resource,
          id: resource.id || generateId()
        }))
      })))
    } else {
      // Сброс для создания новой задачи
      setTaskName("")
      setTaskDescription("")
      setTaskTakeFrom("")
      setTaskShipTo("")
      setSelectedProfessions([])
      setProfessionLevels({})
      setTaskPriority("medium")
      setNewTaskDate(new Date())
      setTaskResources([])
      setSubtasks([])
    }
  }, [editingTask, generateId])

  const handleProfessionToggle = (profession: string) => {
    if (selectedProfessions.includes(profession)) {
      setSelectedProfessions(selectedProfessions.filter((p: string) => p !== profession))
      const newLevels = { ...professionLevels }
      delete newLevels[profession]
      setProfessionLevels(newLevels)
    } else {
      setSelectedProfessions([...selectedProfessions, profession])
      setProfessionLevels({ ...professionLevels, [profession]: 50 })
    }
  }

  const handleProfessionLevelChange = (profession: string, level: number) => {
    setProfessionLevels({ ...professionLevels, [profession]: level })
  }

  const addTaskResource = useCallback(() => {
    setTaskResources((prevResources: any[]) => [...prevResources, { 
      id: generateId(),
      name: "", 
      needed: 1, 
      gathered: 0, 
      unit: "", 
      contributors: {} 
    }])
  }, [generateId])

  const updateTaskResource = useCallback((index: number, field: string, value: any) => {
    setTaskResources((prevResources: any[]) => {
      const updated = [...prevResources]
      updated[index] = { ...updated[index], [field]: value }
      return updated
    })
  }, [])

  const removeTaskResource = useCallback((index: number) => {
    setTaskResources((prevResources: any[]) => prevResources.filter((_: any, i: number) => i !== index))
  }, [])

  const addSubtask = useCallback(() => {
    const newSubtask = {
      id: `subtask-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, // Стабильный уникальный ID
      name: "",
      description: "",
      professions: [],
      levels: {},
      resources: [],
      completed: false,
      assignedTo: [],
      dependencies: [],
      shipTo: "",
      takeFrom: "",
      subtasks: []
    }
    setSubtasks((prevSubtasks: any[]) => [...prevSubtasks, newSubtask])
  }, [])

  const updateSubtask = useCallback((index: number, field: string, value: any) => {
    setSubtasks((prevSubtasks: any[]) => {
      const updated = [...prevSubtasks]
      updated[index] = { ...updated[index], [field]: value }
      return updated
    })
  }, [])

  const removeSubtask = useCallback((index: number) => {
    setSubtasks((prevSubtasks: any[]) => prevSubtasks.filter((_: any, i: number) => i !== index))
  }, [])

  const addSubtaskResource = useCallback((subtaskIndex: number) => {
    setSubtasks((prevSubtasks: any[]) => {
      const updated = [...prevSubtasks]
      const currentResources = updated[subtaskIndex].resources || []
      updated[subtaskIndex].resources = [...currentResources, { 
        id: `resource-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, // Стабильный уникальный ID
        name: "", 
        needed: 1, 
        gathered: 0, 
        unit: "", 
        contributors: {} 
      }]
      return updated
    })
  }, [])

  const updateSubtaskResource = useCallback((subtaskIndex: number, resourceIndex: number, field: string, value: any) => {
    setSubtasks((prevSubtasks: any[]) => {
      const updated = [...prevSubtasks]
      updated[subtaskIndex].resources[resourceIndex] = { 
        ...updated[subtaskIndex].resources[resourceIndex], 
        [field]: value 
      }
      return updated
    })
  }, [])

  const removeSubtaskResource = useCallback((subtaskIndex: number, resourceIndex: number) => {
    setSubtasks((prevSubtasks: any[]) => {
      const updated = [...prevSubtasks]
      updated[subtaskIndex].resources = updated[subtaskIndex].resources.filter((_: any, i: number) => i !== resourceIndex)
      return updated
    })
  }, [])

  const handleSave = async () => {
    // Validation
    if (!taskName.trim()) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Task name is required"
      })
      return
    }

    if (selectedProfessions.length === 0) {
      toast({
        variant: "destructive", 
        title: "Validation Error",
        description: "At least one profession must be selected"
      })
      return
    }

    setIsLoading(true)
    try {
      const taskData = {
        name: taskName,
        description: taskDescription,
        professions: selectedProfessions,
        levels: professionLevels,
        deadline: format(newTaskDate, "yyyy-MM-dd"),
        status: editingTask?.status || "open",
        priority: taskPriority,
        resources: taskResources,
        assignedTo: editingTask?.assignedTo || [],
        createdBy: editingTask?.createdBy || currentUser?.name || "Unknown User",
        shipTo: taskShipTo,
        takeFrom: taskTakeFrom,
        subtasks: subtasks,
        taskType: taskType
      }

      if (editingTask) {
        const taskId = (editingTask as any)._id || (editingTask as any).id
        const response = await apiClient.updateTask(taskId, taskData)
        if (!response.success) {
          throw new Error(response.message || 'Failed to update task')
        }
        toast({
          title: "Success",
          description: "Task updated successfully"
        })
      } else {
        const response = await apiClient.createTask(taskData)
        if (!response.success) {
          throw new Error(response.message || 'Failed to create task')
        }
        toast({
          title: "Success", 
          description: "Task created successfully"
        })
      }

      setIsOpen(false)
      setEditingTask(null)
      if (onTaskCreated) {
        onTaskCreated()
      }
    } catch (error) {
      console.error('Error saving task:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to save task. Please try again.'
      })
    } finally {
      setIsLoading(false)
    }
  }



  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-4xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {editingTask ? "Edit Task" : `Create New ${taskType === 'guild' ? 'Guild' : 'Member'} Task`}
          </DialogTitle>
          <DialogDescription>
            {editingTask
              ? "Modify the existing task and its requirements"
              : `Create a new ${taskType === 'guild' ? 'guild' : 'member'} task with requirements and resources`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <Label htmlFor="task-name" className="text-sm font-medium">
                Task Name
              </Label>
              <Input
                id="task-name"
                placeholder="Enter a descriptive task name..."
                value={taskName}
                onChange={(e) => setTaskName(e.target.value)}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="task-description" className="text-sm font-medium">
                Description
              </Label>
              <Textarea
                id="task-description"
                placeholder="Provide a detailed description of the task..."
                value={taskDescription}
                onChange={(e) => setTaskDescription(e.target.value)}
                className="mt-1 h-20"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="take-from" className="text-sm font-medium">
                Take From (Optional)
              </Label>
              <Input
                id="take-from"
                placeholder="Source location..."
                value={taskTakeFrom}
                onChange={(e) => setTaskTakeFrom(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="ship-to" className="text-sm font-medium">
                Ship To (Optional)
              </Label>
              <Input
                id="ship-to"
                placeholder="Destination location..."
                value={taskShipTo}
                onChange={(e) => setTaskShipTo(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>

          <div>
            <Label className="text-sm font-medium mb-3 block">Required Professions</Label>
            <div className="grid grid-cols-3 gap-3 p-4 border rounded-lg bg-gray-50">
              {Object.entries(professionIcons).map(([profession, Icon]) => (
                <div key={profession} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id={`prof-${profession}`}
                      checked={selectedProfessions.includes(profession)}
                      onChange={() => handleProfessionToggle(profession)}
                      className="rounded"
                    />
                    <Icon className="h-4 w-4" />
                    <span className="capitalize text-sm">{profession}</span>
                  </div>
                  {selectedProfessions.includes(profession) && (
                    <div className="space-y-1 ml-6">
                      <Label className="text-xs">Level: {professionLevels[profession] || 50}</Label>
                      <Slider
                        value={[professionLevels[profession] || 50]}
                        onValueChange={(value) => handleProfessionLevelChange(profession, value[0])}
                        max={100}
                        step={1}
                        className="w-full"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
            {selectedProfessions.length > 0 && (
              <div className="mt-2 p-2 bg-blue-50 rounded text-sm">
                <strong>Selected:</strong>{" "}
                {selectedProfessions.map((prof: string) => `${prof} (${professionLevels[prof]})`).join(", ")}
              </div>
            )}
          </div>

          <div>
            <Label className="text-sm font-medium mb-3 block">Task Resources</Label>
            <div className="border rounded-lg p-4 bg-gray-50">
              <ResourceForm
                resources={taskResources}
                onAdd={addTaskResource}
                onUpdate={updateTaskResource}
                onRemove={removeTaskResource}
                title="Main Task Resources"
              />
            </div>
          </div>

          <div className="border rounded-lg p-4 bg-gray-50">
            <SubtaskForm
              subtasks={subtasks}
              professionIcons={professionIcons}
              addSubtask={addSubtask}
              updateSubtask={updateSubtask}
              removeSubtask={removeSubtask}
              addSubtaskResource={addSubtaskResource}
              updateSubtaskResource={updateSubtaskResource}
              removeSubtaskResource={removeSubtaskResource}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium">Deadline</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal mt-1 bg-transparent">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(newTaskDate, "PPP")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={newTaskDate} onSelect={setNewTaskDate} initialFocus />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <Label className="text-sm font-medium">Priority</Label>
              <Select value={taskPriority} onValueChange={setTaskPriority}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low Priority</SelectItem>
                  <SelectItem value="medium">Medium Priority</SelectItem>
                  <SelectItem value="high">High Priority</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t">
            <Button 
              className="flex-1" 
              onClick={handleSave} 
              disabled={!taskName.trim() || isLoading}
            >
              {isLoading ? 'Saving...' : (editingTask ? "Update Task" : "Create Task")}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setIsOpen(false)
                setEditingTask(null)
              }}
              disabled={isLoading}
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}