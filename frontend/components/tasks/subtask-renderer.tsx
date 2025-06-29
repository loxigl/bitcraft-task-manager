"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  ChevronDown,
  ChevronRight,
  CheckCircle,
  Clock,
  Lock,
  Unlock,
  User,
  UserPlus,
  UserMinus,
  MapPin,
  Package,
} from "lucide-react"
import { professionIcons } from "@/lib/constants"
import { canDoSubtask, isUserAssigned, calculateResourceProgress } from "@/lib/utils/task-utils"
import { ResourceTracker } from "@/components/resources/resource-tracker"
import { useUser } from "@/contexts/UserContext"
import { cn } from "@/lib/utils"

interface SubtaskRendererProps {
  subtasks: any[]
  parentTask: any
  taskId: string | number
  userProfessions: any
  claimSubtask: (taskId: string | number, subtaskId: number) => void
  updateResourceContribution: (taskId: string | number, subtaskId: number | null, resourceName: string, quantity: number) => void
  showOnlyAvailable: boolean
  level?: number
  completeSubtask?: (taskId: string | number, subtaskId: number) => void
}

export function SubtaskRenderer({
  subtasks,
  parentTask,
  taskId,
  userProfessions,
  claimSubtask,
  updateResourceContribution,
  showOnlyAvailable,
  level = 0,
  completeSubtask,
}: SubtaskRendererProps) {
  const [expandedSubtasks, setExpandedSubtasks] = useState(new Set())
  const { currentUser } = useUser()
  const currentUserName = currentUser?.name || ""

  const toggleSubtaskExpansion = (subtaskKey: string) => {
    const newExpanded = new Set(expandedSubtasks)
    if (newExpanded.has(subtaskKey)) {
      newExpanded.delete(subtaskKey)
    } else {
      newExpanded.add(subtaskKey)
    }
    setExpandedSubtasks(newExpanded)
  }

  if (!subtasks) return null

  return (
    <>
      {subtasks.map((subtask) => {
        const canDo = canDoSubtask(subtask, parentTask, userProfessions)
        const subtaskKey = `${taskId}-${subtask.id}`
        const isExpanded = expandedSubtasks.has(subtaskKey)
        const hasNestedSubtasks = subtask.subtasks && subtask.subtasks.length > 0
        const indentClass = level > 0 ? `ml-${level * 4}` : ""
        const userAssigned = isUserAssigned(subtask.assignedTo, currentUserName)
        const hasAssignees = Array.isArray(subtask.assignedTo) ? subtask.assignedTo.length > 0 : !!subtask.assignedTo

        const dependencyInfo = subtask.dependencies.map((depId: number) => {
          const findDep = (list: any[]) =>
            list?.find((st: any) => st.id === depId) ||
            list?.flatMap((st: any) => st.subtasks || []).find((st: any) => st.id === depId)
          const dependency = findDep(parentTask.subtasks)
          return {
            id: depId,
            name: dependency?.name || `Subtask ${depId}`,
            completed: dependency?.completed || false,
          }
        })

        const hasUnmetDependencies = dependencyInfo.some((dep: any) => !dep.completed)
        const resourceProgress = calculateResourceProgress(subtask.resources)

        if (showOnlyAvailable && !canDo && !subtask.completed) {
          return null
        }

        return (
          <div key={subtask.id} className={cn("space-y-2", indentClass)}>
            <div
              className={cn(
                "flex items-center justify-between p-3 rounded-lg border transition-all hover:shadow-sm",
                subtask.completed
                  ? "bg-green-50 border-green-200"
                  : canDo
                    ? "bg-blue-50 border-blue-200"
                    : hasUnmetDependencies
                      ? "bg-orange-50 border-orange-200"
                      : "bg-gray-50 border-gray-200",
              )}
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleSubtaskExpansion(subtaskKey)}
                  className="h-6 w-6 p-0 shrink-0"
                >
                  {isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                </Button>

                <input
                  type="checkbox"
                  checked={subtask.completed}
                  onChange={async () => {
                    if (!completeSubtask) return
                    
                    try {
                      if (!subtask.completed && canDo) {
                        // Отмечаем как выполненную
                        await completeSubtask(taskId, subtask.id)
                      } else if (subtask.completed) {
                        // Отменяем выполнение - можно делать только если пользователь назначен
                        if (userAssigned) {
                          await completeSubtask(taskId, subtask.id) // API должно переключать статус
                        }
                      }
                    } catch (error) {
                      console.error('Error toggling subtask completion:', error)
                    }
                  }}
                  className="rounded shrink-0"
                  disabled={(!canDo && !subtask.completed && !userAssigned) || !completeSubtask}
                />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={cn(
                        "font-medium text-sm truncate",
                        subtask.completed ? "line-through text-gray-500" : "",
                      )}
                    >
                      {subtask.name}
                    </span>

                    {subtask.completed ? (
                      <Badge variant="outline" className="text-green-600 bg-green-50 text-xs shrink-0">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Done
                      </Badge>
                    ) : !canDo && hasUnmetDependencies ? (
                      <Badge variant="outline" className="text-orange-600 bg-orange-50 text-xs shrink-0">
                        <Clock className="h-3 w-3 mr-1" />
                        Waiting
                      </Badge>
                    ) : !canDo ? (
                      <Badge variant="outline" className="text-red-600 bg-red-50 text-xs shrink-0">
                        <Lock className="h-3 w-3 mr-1" />
                        Locked
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-green-600 bg-green-50 text-xs shrink-0">
                        <Unlock className="h-3 w-3 mr-1" />
                        Available
                      </Badge>
                    )}

                    {userAssigned && (
                      <Badge variant="outline" className="text-blue-600 bg-blue-50 text-xs shrink-0">
                        <User className="h-3 w-3 mr-1" />
                        You
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    {hasAssignees && (
                      <span className="truncate">
                        👤{" "}
                        {Array.isArray(subtask.assignedTo)
                          ? `${subtask.assignedTo.length} assigned`
                          : subtask.assignedTo}
                      </span>
                    )}

                    {subtask.resources && subtask.resources.length > 0 && (
                      <span className="flex items-center gap-1 shrink-0">📦 {resourceProgress}%</span>
                    )}

                    {subtask.dependencies.length > 0 && (
                      <span className="flex items-center gap-1 shrink-0">
                        🔗 {dependencyInfo.filter((dep: any) => dep.completed).length}/{dependencyInfo.length}
                      </span>
                    )}

                    {hasNestedSubtasks && <span className="shrink-0">📋 {subtask.subtasks.length} nested</span>}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <div className="hidden md:flex gap-1">
                  {subtask.professions.slice(0, 2).map((prof: string) => {
                    const Icon = professionIcons[prof as keyof typeof professionIcons]
                    const userLevel = userProfessions[prof]?.level || 0
                    const requiredLevel = subtask.levels[prof] || 0
                    const hasLevel = userLevel >= requiredLevel
                    if (!Icon) return null
                    return (
                      <div
                        key={prof}
                        className={cn(
                          "flex items-center gap-1 rounded px-1 py-0.5 text-xs",
                          hasLevel ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800",
                        )}
                      >
                        <Icon className="h-3 w-3" />
                        <span>{requiredLevel}</span>
                      </div>
                    )
                  })}
                  {subtask.professions.length > 2 && (
                    <div className="text-xs text-gray-500 px-1">+{subtask.professions.length - 2}</div>
                  )}
                </div>

                {canDo && !subtask.completed && (
                  <Button
                    variant={userAssigned ? "outline" : "default"}
                    size="sm"
                    onClick={() => claimSubtask(taskId, subtask.id)}
                    className="h-7 px-2 text-xs"
                  >
                    {userAssigned ? (
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
                )}
              </div>
            </div>

            {isExpanded && (
              <div className="ml-9 space-y-3 p-4 bg-white rounded-lg border border-gray-100">
                {subtask.description && (
                  <div>
                    <h6 className="text-xs font-medium text-gray-700 mb-1">Description</h6>
                    <p className="text-sm text-gray-600">{subtask.description}</p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(subtask.shipTo || subtask.takeFrom) && (
                    <div>
                      <h6 className="text-xs font-medium text-gray-700 mb-2">Logistics</h6>
                      <div className="space-y-1">
                        {subtask.takeFrom && (
                          <div className="flex items-center gap-2 text-sm">
                            <MapPin className="h-3 w-3 text-blue-500" />
                            <span className="text-gray-600">From: {subtask.takeFrom}</span>
                          </div>
                        )}
                        {subtask.shipTo && (
                          <div className="flex items-center gap-2 text-sm">
                            <Package className="h-3 w-3 text-green-500" />
                            <span className="text-gray-600">To: {subtask.shipTo}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {subtask.professions.length > 0 && (
                    <div>
                      <h6 className="text-xs font-medium text-gray-700 mb-2">Required Skills</h6>
                      <div className="flex flex-wrap gap-1">
                        {subtask.professions.map((prof: string) => {
                          const Icon = professionIcons[prof as keyof typeof professionIcons]
                          const userLevel = userProfessions[prof]?.level || 0
                          const requiredLevel = subtask.levels[prof] || 0
                          const hasLevel = userLevel >= requiredLevel
                          if (!Icon) return null
                          return (
                            <div
                              key={prof}
                              className={cn(
                                "flex items-center gap-1 rounded px-2 py-1 text-xs",
                                hasLevel ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800",
                              )}
                            >
                              <Icon className="h-3 w-3" />
                              <span className="capitalize">{prof}</span>
                              <span className="font-medium">{requiredLevel}</span>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {subtask.dependencies.length > 0 && (
                  <div>
                    <h6 className="text-xs font-medium text-gray-700 mb-2">Dependencies</h6>
                    <div className="flex flex-wrap gap-2">
                      {dependencyInfo.map((dep: any) => (
                        <div
                          key={dep.id}
                          className={cn(
                            "flex items-center gap-1 px-2 py-1 rounded text-xs",
                            dep.completed ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700",
                          )}
                        >
                          {dep.completed ? "✅" : "⏳"}
                          <span>{dep.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {hasAssignees && (
                  <div>
                    <h6 className="text-xs font-medium text-gray-700 mb-2">Assigned To</h6>
                    <div className="flex flex-wrap gap-1">
                      {(Array.isArray(subtask.assignedTo) ? subtask.assignedTo : [subtask.assignedTo]).map(
                        (assignee: string) => (
                          <Badge
                            key={assignee}
                            variant="outline"
                            className={cn(
                              "text-xs",
                              assignee === currentUserName ? "bg-blue-50 text-blue-700" : "bg-gray-50 text-gray-700",
                            )}
                          >
                            <User className="h-3 w-3 mr-1" />
                            {assignee}
                          </Badge>
                        ),
                      )}
                    </div>
                  </div>
                )}

                {subtask.resources && subtask.resources.length > 0 && (
                  <div>
                    <h6 className="text-xs font-medium text-gray-700 mb-2">Resources ({resourceProgress}% complete)</h6>
                    <ResourceTracker
                      resources={subtask.resources}
                      taskId={taskId}
                      subtaskId={subtask.id}
                      canEdit={userAssigned}
                      title=""
                      updateResourceContribution={updateResourceContribution}
                    />
                  </div>
                )}
              </div>
            )}

            {isExpanded && hasNestedSubtasks && (
              <div className="ml-6 space-y-2 border-l-2 border-gray-200 pl-4">
                <h6 className="text-xs font-medium text-gray-600 mb-2">Nested Subtasks</h6>
                <SubtaskRenderer
                  subtasks={subtask.subtasks}
                  parentTask={parentTask}
                  taskId={taskId}
                  userProfessions={userProfessions}
                  claimSubtask={claimSubtask}
                  updateResourceContribution={updateResourceContribution}
                  showOnlyAvailable={showOnlyAvailable}
                  level={level + 1}
                  completeSubtask={completeSubtask}
                />
              </div>
            )}
          </div>
        )
      })}
    </>
  )
}
