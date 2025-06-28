"use client"

import { useState } from "react"
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

interface CreateTaskDialogProps {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  editingTask: any
  setEditingTask: (task: any) => void
  tasks: any[]
  setTasks: (tasks: any[]) => void
  userProfessions: any
}

export function CreateTaskDialog({
  isOpen,
  setIsOpen,
  editingTask,
  setEditingTask,
  tasks,
  setTasks,
  userProfessions,
}: CreateTaskDialogProps) {
  const [taskName, setTaskName] = useState(editingTask?.name || "")
  const [taskDescription, setTaskDescription] = useState(editingTask?.description || "")
  const [taskTakeFrom, setTaskTakeFrom] = useState(editingTask?.takeFrom || "")
  const [taskShipTo, setTaskShipTo] = useState(editingTask?.shipTo || "")
  const [selectedProfessions, setSelectedProfessions] = useState(editingTask?.professions || [])
  const [professionLevels, setProfessionLevels] = useState(editingTask?.levels || {})
  const [taskPriority, setTaskPriority] = useState(editingTask?.priority || "medium")
  const [newTaskDate, setNewTaskDate] = useState(new Date())
  const [taskResources, setTaskResources] = useState(editingTask?.resources || [])

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

  const addTaskResource = () => {
    setTaskResources([...taskResources, { name: "", needed: 1, gathered: 0, unit: "", contributors: {} }])
  }

  const updateTaskResource = (index: number, field: string, value: any) => {
    const updated = [...taskResources]
    updated[index] = { ...updated[index], [field]: value }
    setTaskResources(updated)
  }

  const removeTaskResource = (index: number) => {
    setTaskResources(taskResources.filter((_: any, i: number) => i !== index))
  }

  const handleSave = () => {
    const newTask = {
      id: editingTask?.id || Date.now(),
      name: taskName,
      description: taskDescription,
      professions: selectedProfessions,
      levels: professionLevels,
      deadline: format(newTaskDate, "yyyy-MM-dd"),
      status: editingTask?.status || "open",
      priority: taskPriority,
      resources: taskResources,
      assignedTo: editingTask?.assignedTo || [],
      createdBy: editingTask?.createdBy || "Current User",
      shipTo: taskShipTo,
      takeFrom: taskTakeFrom,
      subtasks: editingTask?.subtasks || [],
    }

    if (editingTask) {
      setTasks(tasks.map((task) => (task.id === editingTask.id ? newTask : task)))
    } else {
      setTasks([...tasks, newTask])
    }

    setIsOpen(false)
    setEditingTask(null)
  }

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
            <div key={index} className="border rounded p-3 bg-gray-50">
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
              {resource.name && (
                <div className="text-xs text-gray-600 bg-white p-1 rounded">
                  <strong>Preview:</strong> {resource.name} ({resource.needed} {resource.unit})
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-4xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">{editingTask ? "Edit Task" : "Create New Task"}</DialogTitle>
          <DialogDescription>
            {editingTask
              ? "Modify the existing task and its requirements"
              : "Create a new task with requirements and resources"}
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
            <Button className="flex-1" onClick={handleSave} disabled={!taskName.trim()}>
              {editingTask ? "Update Task" : "Create Task"}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setIsOpen(false)
                setEditingTask(null)
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
