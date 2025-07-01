"use client"

import { useState, useCallback, useMemo, useEffect } from "react"
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
  ArrowRight,
  Save
} from "lucide-react"
import { professionIcons } from "@/lib/constants"
import { canDoSubtask, isUserAssigned, calculateResourceProgress } from "@/lib/utils/task-utils"
import { ResourceTracker } from "@/components/resources/resource-tracker"
import { SaveTemplateDialog } from "@/components/tasks/save-template-dialog"
import { useUser } from "@/contexts/UserContext"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"

interface SubtaskRendererProps {
  subtasks: any[]
  parentTask: any
  taskId: string | number
  userProfessions: any
  claimSubtask: (taskId: string | number, subtaskId: number | string) => void
  updateResourceContribution: (taskId: string | number, subtaskId: number | string | null, resourceName: string, quantity: number) => void
  showOnlyAvailable: boolean
  level?: number
  completeSubtask?: (taskId: string | number, subtaskId: number | string) => void
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
  const [expandedSubtasks, setExpandedSubtasks] = useState<Set<string>>(new Set())
  const [visibleResourceBlocks, setVisibleResourceBlocks] = useState<Set<string>>(new Set())
  const { currentUser } = useUser()
  const { toast } = useToast()
  const currentUserName = currentUser?.name || ""
  
  // Состояние для сохранения шаблона
  const [saveTemplateDialogOpen, setSaveTemplateDialogOpen] = useState(false)
  const [currentTemplateSubtaskId, setCurrentTemplateSubtaskId] = useState<string | null>(null)
  const [currentTemplateName, setCurrentTemplateName] = useState("")

  const toggleSubtaskExpansion = useCallback((subtaskKey: string) => {
    const newExpanded = new Set(expandedSubtasks)
    if (newExpanded.has(subtaskKey)) {
      newExpanded.delete(subtaskKey)
    } else {
      newExpanded.add(subtaskKey)
    }
    setExpandedSubtasks(newExpanded)
  }, [expandedSubtasks])
  
  // Функция для открытия диалога сохранения шаблона
  const openSaveTemplateDialog = (subtaskId: string, name?: string) => {
    setCurrentTemplateSubtaskId(subtaskId)
    setCurrentTemplateName(name || "")
    setSaveTemplateDialogOpen(true)
  }

  // Функция для переключения видимости блока с ресурсами
  const toggleResourceBlock = useCallback((subtaskId: string) => {
    setVisibleResourceBlocks((prevVisible: Set<string>) => {
      const newVisible = new Set(prevVisible)
      if (newVisible.has(subtaskId)) {
        newVisible.delete(subtaskId)
      } else {
        newVisible.add(subtaskId)
      }
      return newVisible
    })
  }, [])

  if (!subtasks) return null

  // Helper function to find subtask by ID recursively
  const findSubtaskById = (list: any[], id: number | string): any => {
    if (!list) return null
    for (const st of list) {
      if (String(st.id) === String(id)) return st
      const found = findSubtaskById(st.subtasks || [], id)
      if (found) return found
    }
    return null
  }
  
  // Вспомогательная функция для построения иерархии и сортировки
  const buildHierarchyAndSort = (subtasks: any[]): any[] => {
    // Separate top-level subtasks and nested ones
    const topLevelSubtasks = subtasks.filter(subtask => !subtask.subtaskOf || subtask.subtaskOf === "main")
    const nestedSubtasks = subtasks.filter(subtask => subtask.subtaskOf && subtask.subtaskOf !== "main")
    
    // Build hierarchical structure
    const buildHierarchy = (parentSubtasks: any[]): any[] => {
      return parentSubtasks.map(subtask => {
        const children = nestedSubtasks.filter(child => String(child.subtaskOf) === String(subtask.id))
        return {
          ...subtask,
          children: children.length > 0 ? buildHierarchy(children) : []
        }
      })
    }

    const hierarchy = buildHierarchy(topLevelSubtasks)

    // Sort function - dependencies first, then available, then waiting, then locked, completed last
    const sortByAvailability = (subtasks: any[]): any[] => {
      return subtasks.sort((a, b) => {
        const aCanDo = canDoSubtask(a, parentTask, userProfessions)
        const bCanDo = canDoSubtask(b, parentTask, userProfessions)
        
        // Helper to get dependency status
        const getHasUnmetDependencies = (subtask: any) => {
          if (!subtask.dependencies || subtask.dependencies.length === 0) return false
          const dependencyInfo = subtask.dependencies.map((depId: number | string) => {
            const dependency = findSubtaskById(parentTask.subtasks, depId)
            return dependency?.completed || false
          })
          return dependencyInfo.some((completed: boolean) => !completed)
        }
        
        // Helper to check if subtask is a dependency for other subtasks
        const isDependencyFor = (subtask: any) => {
          return subtasks.some(other => 
            other.dependencies && other.dependencies.includes(subtask.id)
          )
        }
        
        const aHasUnmetDependencies = getHasUnmetDependencies(a)
        const bHasUnmetDependencies = getHasUnmetDependencies(b)
        const aIsDependency = isDependencyFor(a)
        const bIsDependency = isDependencyFor(b)
        
        // Completed tasks go to bottom
        if (a.completed !== b.completed) {
          return a.completed ? 1 : -1
        }
        
        // Dependencies for other tasks go first
        if (aIsDependency !== bIsDependency) {
          return aIsDependency ? -1 : 1
        }
        
        // Available tasks go next
        if (aCanDo !== bCanDo) {
          return bCanDo ? 1 : -1
        }
        
        // Among unavailable, waiting tasks go before locked
        if (!aCanDo && !bCanDo) {
          if (aHasUnmetDependencies !== bHasUnmetDependencies) {
            return aHasUnmetDependencies ? -1 : 1 // waiting first, then locked
          }
        }
        
        return 0
      }).map(subtask => ({
        ...subtask,
        children: sortByAvailability(subtask.children || [])
      }))
    }

    return sortByAvailability(hierarchy)
  }

  // Function to build hierarchical structure and sort by availability (memoized)
  const buildAndSortSubtasks = useMemo(() => (subtasks: any[]): any[] => {
    if (!subtasks) return []
    
    // Отдельная обработка для фильтра showOnlyAvailable
    if (showOnlyAvailable) {
      // Функция для сбора всех доступных подзадач на любом уровне вложенности в плоский список
      const getAllAvailableSubtasks = (tasks: any[]): any[] => {
        if (!tasks || tasks.length === 0) return []
        
        const availableSubtasks: any[] = []
        
        // Рекурсивно обходим все подзадачи
        const processSubtasks = (subtasks: any[]) => {
          if (!subtasks || subtasks.length === 0) return
          
          subtasks.forEach(subtask => {
            // Проверяем доступность подзадачи
            const canDo = canDoSubtask(subtask, parentTask, userProfessions)
            const isCompleted = subtask.completed
            
            // Если подзадача доступна или завершена - добавляем её в список
            if (canDo || isCompleted) {
              // Создаем копию подзадачи, сохраняя оригинальные связи
              const subtaskCopy = {
                ...subtask,
                originalHierarchyInfo: {
                  subtaskOf: subtask.subtaskOf,
                  id: subtask.id,
                  name: subtask.name
                },
                // Преобразуем все подзадачи в "корневые" для плоской структуры
                subtaskOf: "main"
              }
              availableSubtasks.push(subtaskCopy)
            }
            
            // Проверяем вложенные подзадачи
            if (subtask.subtasks && subtask.subtasks.length > 0) {
              processSubtasks(subtask.subtasks)
            }
          })
        }
        
        processSubtasks(tasks)
        return availableSubtasks
      }
      
      // Получаем плоский список всех доступных подзадач
      const allAvailableSubtasks = getAllAvailableSubtasks(subtasks)
      
      // Возвращаем список как есть, без создания дополнительной иерархии
      return allAvailableSubtasks.sort((a, b) => {
        // Сортируем по имени для удобства
        if (a.name < b.name) return -1
        if (a.name > b.name) return 1
        return 0
      })
    }
    
    // Если фильтр не включен, используем стандартную логику
    return buildHierarchyAndSort(subtasks)
  }, [parentTask, userProfessions, showOnlyAvailable])
  
  // Render individual subtask with its children
  const renderSubtask = (subtask: any, depth: number = 0): JSX.Element | null => {
    const canDo = canDoSubtask(subtask, parentTask, userProfessions)
    const subtaskKey = `${taskId}-${subtask.id}`
    const isExpanded = expandedSubtasks.has(subtaskKey)
    
    // При использовании showOnlyAvailable у нас плоская структура
    const hasChildren = showOnlyAvailable 
      ? false // В плоской структуре нет вложенности
      : (subtask.children && subtask.children.length > 0)
      
    const userAssigned = isUserAssigned(subtask.assignedTo, currentUserName)
    const hasAssignees = Array.isArray(subtask.assignedTo) ? subtask.assignedTo.length > 0 : !!subtask.assignedTo

    const dependencyInfo = subtask.dependencies.map((depId: number | string) => {
      const dependency = findSubtaskById(parentTask.subtasks, depId)
      return {
        id: depId,
        name: dependency?.name || `Subtask ${depId}`,
        completed: dependency?.completed || false,
      }
    })

    const hasUnmetDependencies = dependencyInfo.some((dep: any) => !dep.completed)
    const resourceProgress = calculateResourceProgress(subtask.resources)

    const resourceBlockKey = `resource-${subtask.id}`
    const isResourceBlockVisible = visibleResourceBlocks.has(resourceBlockKey)

    // При фильтрации showOnlyAvailable мы уже отфильтровали недоступные подзадачи
    // А в обычном режиме используем стандартную логику
    if (!showOnlyAvailable && !canDo && !subtask.completed && !hasChildren) {
      return null
    }

    // При фильтрации showOnlyAvailable показываем информацию об иерархии
    let hierarchyInfoElement = null
    if (showOnlyAvailable && subtask.originalHierarchyInfo) {
      const origInfo = subtask.originalHierarchyInfo
      if (origInfo.subtaskOf && origInfo.subtaskOf !== "main") {
        // Находим родителя в оригинальной структуре
        const parentSubtask = findSubtaskById(parentTask.subtasks, origInfo.subtaskOf)
        if (parentSubtask) {
          hierarchyInfoElement = (
            <div className="text-xs text-gray-500 mb-1">
              <span className="text-blue-500">⤴️ Parent subtask:</span> {parentSubtask.name}
            </div>
          )
        }
      }
    }

    const indentStyle = { 
      paddingLeft: showOnlyAvailable ? '0px' : `${depth * 24}px` 
    }

    return (
      <div key={subtask.id} className="space-y-1">
        <div
          style={indentStyle}
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
            {!showOnlyAvailable && subtask.subtaskOf && subtask.subtaskOf !== "main" && (
              <div className="flex items-center text-blue-400">
                <ArrowRight className="h-3 w-3" />
              </div>
            )}

            {!showOnlyAvailable && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleSubtaskExpansion(subtaskKey)}
                className="h-6 w-6 p-0 shrink-0"
              >
                {isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
              </Button>
            )}

            <input
              type="checkbox"
              checked={subtask.completed}
              onChange={async () => {
                if (!completeSubtask) return
                
                try {
                  // Если задача не завершена - проверяем можно ли её выполнить
                  if (!subtask.completed) {
                    if (canDo || userAssigned) {
                      await completeSubtask(taskId, subtask.id)
                    }
                  } else {
                    // Если задача завершена - позволяем её расcomplete
                    // (особенно полезно для админов и назначенных пользователей)
                    await completeSubtask(taskId, subtask.id)
                  }
                } catch (error) {
                  console.error('Error toggling subtask completion:', error)
                }
              }}
              className="rounded shrink-0"
              disabled={!completeSubtask || (!canDo && !userAssigned && !subtask.completed)}
            />

            <div className="flex-1 min-w-0">
              {hierarchyInfoElement}
              
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
                    <span className={cn(
                      "font-medium",
                      hasUnmetDependencies ? "text-orange-600" : "text-green-600"
                    )}>
                      🔗 {dependencyInfo.filter((dep: any) => dep.completed).length}/{dependencyInfo.length}
                    </span>
                    {hasUnmetDependencies && (
                      <span className="text-orange-600 font-medium text-xs">
                        → waits for: {dependencyInfo.filter((dep: any) => !dep.completed).map((dep: any) => dep.name).join(", ")}
                      </span>
                    )}
                  </span>
                )}

                {hasChildren && <span className="shrink-0">📋 {subtask.children.length} nested</span>}
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

            {/* Кнопка для сохранения подзадачи как шаблона */}
            <Button
              size="sm"
              variant="ghost"
              className="h-7 w-7 p-0 text-purple-600 hover:text-purple-700"
              onClick={() => openSaveTemplateDialog(subtask.id, subtask.name)}
              title="Save as template"
            >
              <Save className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {/* При включенном фильтре showOnlyAvailable показываем ресурсы прямо в карточке подзадачи */}
        {showOnlyAvailable && subtask.resources && subtask.resources.length > 0 && (
          <div className="mt-2">
            {/* Кнопка для разворачивания/сворачивания блока с ресурсами */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => toggleResourceBlock(resourceBlockKey)}
              className="w-full flex items-center justify-between py-2 px-3 text-sm text-gray-700 hover:bg-gray-50 rounded-lg border border-gray-100"
            >
              <div className="flex items-center gap-2">
                <Package className="h-3 w-3 text-blue-500" />
                <span>Resources ({resourceProgress}% complete)</span>
              </div>
              {isResourceBlockVisible ? (
                <ChevronDown className="h-3 w-3" />
              ) : (
                <ChevronRight className="h-3 w-3" />
              )}
            </Button>
            
            {/* Содержимое блока с ресурсами */}
            {isResourceBlockVisible && (
              <div className="p-3 bg-white rounded-b-lg border border-t-0 border-gray-100">
                <div className="flex justify-end mb-2">
                  {userAssigned && (
                    <Badge variant="outline" className="text-blue-600 bg-blue-50 text-xs">
                      You can contribute
                    </Badge>
                  )}
                </div>
                <ResourceTracker
                  resources={subtask.resources}
                  taskId={taskId}
                  subtaskId={subtask.id}
                  canEdit={userAssigned}
                  title=""
                  updateResourceContribution={updateResourceContribution}
                  onCompleteSubtask={completeSubtask}
                />
              </div>
            )}
          </div>
        )}

        {/* При включенном фильтре не отображаем раскрываемые блоки */}
        {!showOnlyAvailable && isExpanded && (
          <div style={{ paddingLeft: `${(depth + 1) * 24}px` }} className="space-y-3 p-4 bg-white rounded-lg border border-gray-100 ml-9">
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
                <div className="space-y-1">
                  {dependencyInfo.map((dep: any) => (
                    <div
                      key={dep.id}
                      className={cn(
                        "flex items-center gap-2 px-3 py-2 rounded-lg border text-sm",
                        dep.completed 
                          ? "bg-green-50 border-green-200 text-green-700" 
                          : "bg-orange-50 border-orange-200 text-orange-700",
                      )}
                    >
                      {dep.completed ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <Clock className="h-4 w-4 text-orange-600" />
                      )}
                      <span className="font-medium">
                        {dep.completed ? "✓ Completed:" : "⏳ Waiting for:"}
                      </span>
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

            {hasChildren && (
              <div className="space-y-2 border-l-2 border-gray-200 pl-4">
                <h6 className="text-xs font-medium text-gray-600 mb-2">Nested Subtasks</h6>
                <div className="space-y-1">
                  {subtask.children.map((child: any) => renderSubtask(child, depth + 1))}
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
                  onCompleteSubtask={completeSubtask}
                />
              </div>
            )}
          </div>
        )}
      </div>
    )
  }

  // Render all top-level subtasks
  const sortedAndStructuredSubtasks = buildAndSortSubtasks(subtasks)
  return (
    <div className="space-y-2 pb-3">
      {sortedAndStructuredSubtasks.map(subtask => renderSubtask(subtask))}
      
      {/* Диалог сохранения шаблона */}
      <SaveTemplateDialog 
        isOpen={saveTemplateDialogOpen}
        onClose={() => setSaveTemplateDialogOpen(false)}
        taskId={Number(taskId)}
        subtaskId={currentTemplateSubtaskId!}
        defaultName={currentTemplateName}
        onSuccess={() => {
          toast({
            title: "Subtask template saved",
            description: "Your subtask template has been saved successfully"
          })
        }}
      />
    </div>
  )
}
