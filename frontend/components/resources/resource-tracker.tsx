"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { calculateResourceProgress } from "@/lib/utils/task-utils"
import { useUser } from "@/contexts/UserContext"
import { cn } from "@/lib/utils"

interface ResourceTrackerProps {
  resources: any[]
  taskId: string | number
  subtaskId?: number | string | null
  canEdit?: boolean
  title?: string
  updateResourceContribution: (taskId: string | number, subtaskId: number | string | null, resourceName: string, quantity: number) => void
  onCompleteTask?: (taskId: string | number) => void
  onCompleteSubtask?: (taskId: string | number, subtaskId: number | string) => void
}

export function ResourceTracker({
  resources,
  taskId,
  subtaskId = null,
  canEdit = false,
  title = "Resources",
  updateResourceContribution,
  onCompleteTask,
  onCompleteSubtask,
}: ResourceTrackerProps) {
  const [editingResource, setEditingResource] = useState<string | null>(null)
  const [newQuantity, setNewQuantity] = useState(0)
  const { currentUser } = useUser()

  const handleUpdateResource = (resourceName: string) => {
    if (newQuantity >= 0) {
      updateResourceContribution(taskId, subtaskId, resourceName, newQuantity)
      setEditingResource(null)
      setNewQuantity(0)
    }
  }

  if (!resources || resources.length === 0) return null

  const overallProgress = calculateResourceProgress(resources)
  const currentUserName = currentUser?.name || "Unknown User"

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h5 className="font-medium text-sm">{title}</h5>
        <Badge
          variant="outline"
          className={cn(
            "text-xs",
            overallProgress === 100
              ? "bg-green-50 text-green-700"
              : overallProgress >= 50
                ? "bg-yellow-50 text-yellow-700"
                : "bg-red-50 text-red-700",
          )}
        >
          {overallProgress}% Complete
        </Badge>
      </div>

      {overallProgress === 100 && canEdit && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-green-700">
              <span className="text-sm font-medium">🎉 All resources completed!</span>
              <span className="text-xs">Ready to mark as done?</span>
            </div>
            <Button
              size="sm"
              onClick={() => {
                if (subtaskId && onCompleteSubtask) {
                  onCompleteSubtask(taskId, subtaskId)
                } else if (!subtaskId && onCompleteTask) {
                  onCompleteTask(taskId)
                }
              }}
              className="h-7 px-3 text-xs bg-green-600 hover:bg-green-700"
            >
              Mark Complete
            </Button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {resources.map((resource, index) => {
          const progress = resource.needed > 0 ? (resource.gathered / resource.needed) * 100 : 100
          const userContribution = resource.contributors[currentUserName] || 0
          const isEditing = editingResource === resource.name

          return (
            <div key={index} className="border rounded-lg p-3 bg-gray-50">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">{resource.name}</span>
                  <Badge variant="secondary" className="text-xs">
                    {resource.gathered}/{resource.needed} {resource.unit}
                  </Badge>
                  {userContribution > 0 && (
                    <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">
                      You: {userContribution}
                    </Badge>
                  )}
                </div>
                {canEdit && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditingResource(resource.name)
                      setNewQuantity(userContribution)
                    }}
                    className="h-6 px-2 text-xs"
                  >
                    Update
                  </Button>
                )}
              </div>

              <Progress value={progress} className="h-2 mb-2" />

              {Object.keys(resource.contributors).length > 0 && (
                <div className="text-xs text-gray-600">
                  <span className="font-medium">Contributors: </span>
                  {Object.entries(resource.contributors).map(([contributor, amount], idx) => (
                    <span
                      key={contributor}
                      className={cn(contributor === currentUserName && "font-semibold text-blue-600")}
                    >
                      {contributor} ({amount as number}){idx < Object.entries(resource.contributors).length - 1 && ", "}
                    </span>
                  ))}
                </div>
              )}

              {isEditing && (
                <div className="mt-2 p-2 border rounded bg-white">
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min="0"
                      max={resource.needed}
                      value={newQuantity}
                      onChange={(e) => setNewQuantity(Number.parseInt(e.target.value) || 0)}
                      className="w-20 h-6 text-xs"
                      placeholder="0"
                    />
                    <span className="text-xs text-gray-500">
                      / {resource.needed} {resource.unit}
                    </span>
                    <Button size="sm" onClick={() => handleUpdateResource(resource.name)} className="h-6 px-2 text-xs">
                      Save
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingResource(null)}
                      className="h-6 px-2 text-xs"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
