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
import { CalendarIcon, Plus, X, Package, BookTemplate } from "lucide-react"
import { format } from "date-fns"
import { professionIcons } from "@/lib/constants"
import { apiClient } from "@/lib/api-client"
import { useToast } from "@/hooks/use-toast"
import { useUser } from "@/contexts/UserContext"
import { TemplateSelectorDialog } from "./template-selector-dialog"

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
      <div className="space-y-3">
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
  getAvailableSubtasks: (currentIndex: number) => any[]
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
  getAvailableSubtasks,
}) => {
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false)
  const { toast } = useToast()
  
  // Обработчик для добавления подзадачи из шаблона
  const handleSelectTemplate = (template: any) => {
    // Закрываем диалог
    setIsTemplateDialogOpen(false)
    
    if (!template) {
      toast({
        variant: "destructive",
        title: "Invalid template",
        description: "Selected template is invalid"
      })
      return
    }
    
    // Создаем карту новых ID для всех подзадач
    const idMap = new Map();
    
    // Найдем корневую подзадачу (которая не имеет родителя)
    const rootSubtask = template.subtasks?.find((s: any) => !s.subtaskOf) || null;
    
    if (!rootSubtask && template.subtasks?.length > 0) {
      toast({
        variant: "destructive",
        title: "Invalid template structure",
        description: "Template doesn't have a root subtask"
      });
      return;
    }
    
    // Если шаблон не содержит подзадач, создаем одну подзадачу из самого шаблона
    if (!template.subtasks || template.subtasks.length === 0) {
      // Генерируем новый ID для подзадачи
      const newSubtaskId = `subtask-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      
      const newSubtask = {
        id: newSubtaskId,
        name: template.name || "",
        description: template.description || "",
        professions: template.professions || [],
        levels: template.levels || {},
        dependencies: [],
        subtaskOf: null,
        resources: (template.resources || []).map((resource: any) => ({
          id: `resource-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          name: resource.name || "",
          needed: resource.needed || 1,
          unit: resource.unit || "",
          gathered: 0,
          contributors: {}
        })),
        shipTo: template.shipTo || "",
        takeFrom: template.takeFrom || "",
        completed: false,
        assignedTo: [],
        subtasks: []
      };
      
      // Добавляем подзадачу
      addSubtask(newSubtask);
      
      toast({
        title: "Subtask added",
        description: "Subtask from template added successfully"
      });
      
      return;
    }
    
    // Для всех подзадач генерируем новые ID
    template.subtasks.forEach((subtask: any) => {
      const newId = `subtask-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      idMap.set(subtask.id, newId);
    });
    
    // Создаем подзадачи с обновленными ID и ссылками
    const processedSubtasks = template.subtasks.map((subtask: any) => {
      const newId = idMap.get(subtask.id);
      let newSubtaskOf = null;
      
      // Если это не корневая подзадача, обновляем ссылку на родителя
      if (subtask.subtaskOf) {
        newSubtaskOf = idMap.get(subtask.subtaskOf);
      }
      
      // Обновляем зависимости, если они есть
      const newDependencies = (subtask.dependencies || [])
        .map((depId: string) => idMap.get(depId))
        .filter(Boolean);
      
      return {
        ...subtask,
        id: newId,
        subtaskOf: newSubtaskOf,
        dependencies: newDependencies,
        completed: false,
        assignedTo: [],
        resources: (subtask.resources || []).map((resource: any) => ({
          id: `resource-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          name: resource.name || "",
          needed: resource.needed || 1,
          unit: resource.unit || "",
          gathered: 0,
          contributors: {}
        }))
      };
    });
    
    // Добавляем все подзадачи
    processedSubtasks.forEach(subtask => {
      addSubtask(subtask);
    });
    
    toast({
      title: "Subtasks added",
      description: `${processedSubtasks.length} subtasks from template added successfully`
    });
  }
  
  // Функция для добавления подзадачи с данными
  const addSubtaskWithData = (subtaskData?: any) => {
    if (subtaskData) {
      addSubtask(subtaskData)
    } else {
      addSubtask()
    }
  }
  
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <Label className="text-sm font-medium">Subtasks</Label>
        <div className="flex gap-2">
          <Button 
            type="button" 
            variant="outline" 
            size="sm" 
            onClick={() => setIsTemplateDialogOpen(true)}
            className="flex items-center gap-1"
          >
            <BookTemplate className="h-3 w-3" />
            Add from Template
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={() => addSubtaskWithData()}>
            <Plus className="h-3 w-3 mr-1" />
            Add Subtask
          </Button>
        </div>
      </div>

      <div className="space-y-4">
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

            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <Label className="text-xs">Depends On (Must be completed first)</Label>
                <Select 
                  value={subtask.dependencies?.[0]?.toString() || ""} 
                  onValueChange={(value) => {
                    if (value === "" || value === "none") {
                      updateSubtask(index, "dependencies", [])
                    } else {
                      // Find the subtask by ID string and get its actual ID
                      const selectedSubtask = getAvailableSubtasks(index).find(st => st.id === value)
                      if (selectedSubtask) {
                        updateSubtask(index, "dependencies", [selectedSubtask.id])
                      }
                    }
                  }}
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="Select dependency..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No dependency</SelectItem>
                    {getAvailableSubtasks(index).map((st) => (
                      <SelectItem key={st.id} value={st.id}>
                        {st.name || `Subtask ${st.index + 1}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Subtask Of (Parent)</Label>
                <Select 
                  value={subtask.subtaskOf?.toString() || "null"} 
                  onValueChange={(value) => {
                    if (value === "null" || value === "") {
                      updateSubtask(index, "subtaskOf", null)
                    } else {
                      // Find the selected parent subtask
                      const selectedParent = getAvailableSubtasks(index).find(st => st.id === value)
                      if (selectedParent) {
                        updateSubtask(index, "subtaskOf", selectedParent.id)
                      }
                    }
                  }}
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="Main Task" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="null">Main Task</SelectItem>
                    {getAvailableSubtasks(index).map((st) => (
                      <SelectItem key={st.id} value={st.id}>
                        {st.name || `Subtask ${st.index + 1}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
      
      {/* Диалог выбора шаблона */}
      <TemplateSelectorDialog
        isOpen={isTemplateDialogOpen}
        onClose={() => setIsTemplateDialogOpen(false)}
        onSelectTemplate={handleSelectTemplate}
        onCreateNew={() => setIsTemplateDialogOpen(false)}
      />
    </div>
  )
}

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
  
  // Состояние для работы с шаблонами
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false)
  
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

  // Обработчик для открытия диалога выбора шаблона
  const handleDialogOpen = () => {
    if (editingTask) {
      // Если редактируем задачу, просто открываем диалог
      return
    }
    
    // Если создаем новую задачу, показываем диалог выбора шаблона
    setIsTemplateDialogOpen(true)
  }

  useEffect(() => {
    // Открываем диалог выбора шаблона при первом открытии
    if (isOpen && !editingTask) {
      handleDialogOpen()
    }
  }, [isOpen, editingTask])

  // Обработчик для выбора шаблона
  const handleSelectTemplate = (template: any) => {
    setTaskName(template.name || "")
    setTaskDescription(template.description || "")
    setTaskTakeFrom(template.takeFrom || "")
    setTaskShipTo(template.shipTo || "")
    setSelectedProfessions(template.professions || [])
    setProfessionLevels(template.levels || {})
    setTaskPriority(template.priority || "medium")
    
    // Обработка ресурсов из шаблона
    const templateResources = template.resources?.map((resource: any) => ({
      ...resource,
      id: generateId(),
      gathered: 0,
      contributors: {}
    })) || []
    setTaskResources(templateResources)
    
    // Обработка подзадач из шаблона
    const templateSubtasks = template.subtasks?.map((subtask: any) => {
      // Рекурсивная функция для обработки вложенных подзадач
      const processSubtask = (st: any): any => {
        return {
          ...st,
          id: st.id || generateId(),
          completed: false,
          assignedTo: [],
          resources: (st.resources || []).map((res: any) => ({
            ...res,
            id: generateId(),
            gathered: 0,
            contributors: {}
          })),
          subtasks: (st.subtasks || []).map(processSubtask)
        }
      }
      
      return processSubtask(subtask)
    }) || []
    setSubtasks(templateSubtasks)
    
    // Закрываем диалог выбора шаблона
    setIsTemplateDialogOpen(false)
  }

  // Get available subtasks for dependency and parent selection
  const getAvailableSubtasks = useCallback((currentIndex: number) => {
    return subtasks
      .map((subtask, index) => ({ ...subtask, index }))
      .filter((_, index) => index !== currentIndex) // Don't include current subtask
      .filter(st => st.name && st.name.trim() !== "") // Only show subtasks with names
  }, [subtasks])

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
        dependencies: subtask.dependencies || [],
        subtaskOf: subtask.subtaskOf || null,
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

  const addSubtask = useCallback((customSubtask?: any) => {
    const newSubtask = customSubtask || {
      id: `subtask-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, // Стабильный уникальный ID
      name: "",
      description: "",
      professions: [],
      levels: {},
      resources: [],
      completed: false,
      assignedTo: [],
      dependencies: [],
      subtaskOf: null,
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
      if (!updated[subtaskIndex]) {
        return prevSubtasks
      }
      
      const currentResources = updated[subtaskIndex].resources || []
      const newResource = { 
        id: `resource-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, 
        name: "", 
        needed: 1, 
        gathered: 0, 
        unit: "", 
        contributors: {} 
      }
      
      updated[subtaskIndex] = {
        ...updated[subtaskIndex],
        resources: [...currentResources, newResource]
      }
      
      return updated
    })
  }, [])

  const updateSubtaskResource = useCallback((subtaskIndex: number, resourceIndex: number, field: string, value: any) => {
    setSubtasks((prevSubtasks: any[]) => {
      const updated = [...prevSubtasks]
      if (!updated[subtaskIndex] || !updated[subtaskIndex].resources || !updated[subtaskIndex].resources[resourceIndex]) {
        return prevSubtasks
      }
      
      updated[subtaskIndex] = {
        ...updated[subtaskIndex],
        resources: updated[subtaskIndex].resources.map((resource: any, index: number) => 
          index === resourceIndex ? { ...resource, [field]: value } : resource
        )
      }
      
      return updated
    })
  }, [])

  const removeSubtaskResource = useCallback((subtaskIndex: number, resourceIndex: number) => {
    setSubtasks((prevSubtasks: any[]) => {
      const updated = [...prevSubtasks]
      if (!updated[subtaskIndex] || !updated[subtaskIndex].resources) {
        return prevSubtasks
      }
      
      updated[subtaskIndex] = {
        ...updated[subtaskIndex],
        resources: updated[subtaskIndex].resources.filter((_: any, i: number) => i !== resourceIndex)
      }
      
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
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center gap-2">
              {editingTask ? (
                "Edit Task" 
              ) : (
                <>
                  <span>Create New {taskType === 'guild' ? 'Guild' : 'Member'} Task</span>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="ml-2 flex items-center gap-1"
                    onClick={() => setIsTemplateDialogOpen(true)}
                  >
                    <BookTemplate className="h-4 w-4" />
                    <span>Use Template</span>
                  </Button>
                </>
              )}
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
                getAvailableSubtasks={getAvailableSubtasks}
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
      
      {/* Диалог выбора шаблона */}
      <TemplateSelectorDialog
        isOpen={isTemplateDialogOpen}
        onClose={() => setIsTemplateDialogOpen(false)}
        onSelectTemplate={handleSelectTemplate}
        onCreateNew={() => setIsTemplateDialogOpen(false)}
      />
    </>
  )
}