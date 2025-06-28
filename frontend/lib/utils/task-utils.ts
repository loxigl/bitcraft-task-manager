import { mockUser } from "@/lib/mock-data"

export function canDoSubtask(subtask: any, task: any, userProfessions: any) {
  // Check user's profession levels
  const hasRequiredLevels = subtask.professions.every((prof: string) => {
    const userLevel = userProfessions[prof]?.level || 0
    const requiredLevel = subtask.levels[prof] || 0
    return userLevel >= requiredLevel
  })

  // Check dependency completion
  const dependenciesCompleted = subtask.dependencies.every((depId: number) => {
    const findDep = (list: any[]) =>
      list?.find((st) => st.id === depId) || list?.flatMap((st) => st.subtasks || []).find((st) => st.id === depId)
    const dependency = findDep(task.subtasks)
    return dependency && dependency.completed
  })

  return hasRequiredLevels && dependenciesCompleted
}

export function canDoAnySubtask(subtasks: any[], parentTask: any, userProfessions: any): boolean {
  if (!subtasks) return false

  return subtasks.some((subtask) => {
    const canDoThis = canDoSubtask(subtask, parentTask, userProfessions)
    const canDoNested = canDoAnySubtask(subtask.subtasks, parentTask, userProfessions)
    return canDoThis || canDoNested
  })
}

export function getAllAvailableSubtasks(subtasks: any[], parentTask: any, userProfessions: any, level = 0): any[] {
  if (!subtasks) return []

  const available: any[] = []
  subtasks.forEach((subtask) => {
    const canDo = canDoSubtask(subtask, parentTask, userProfessions)
    if (canDo && !subtask.completed) {
      available.push({ ...subtask, level })
    }
    const nestedAvailable = getAllAvailableSubtasks(subtask.subtasks, parentTask, userProfessions, level + 1)
    available.push(...nestedAvailable)
  })

  return available
}

export function canClaimTask(task: any, userProfessions: any) {
  return task.professions.every((prof: string) => {
    const userLevel = userProfessions[prof]?.level || 0
    const requiredLevel = task.levels[prof] || 0
    return userLevel >= requiredLevel
  })
}

export function isUserAssigned(assignedTo: any) {
  return Array.isArray(assignedTo) ? assignedTo.includes(mockUser.name) : assignedTo === mockUser.name
}

export function getStatusColor(status: string) {
  switch (status) {
    case "open":
      return "bg-green-500"
    case "taken":
      return "bg-yellow-500"
    case "done":
      return "bg-gray-500"
    default:
      return "bg-gray-500"
  }
}

export function getPriorityColor(priority: string) {
  switch (priority) {
    case "high":
      return "text-red-600 bg-red-50"
    case "medium":
      return "text-yellow-600 bg-yellow-50"
    case "low":
      return "text-green-600 bg-green-50"
    default:
      return "text-gray-600 bg-gray-50"
  }
}

export function calculateResourceProgress(resources: any[]) {
  if (!resources || resources.length === 0) return 100

  const totalNeeded = resources.reduce((sum, resource) => sum + resource.needed, 0)
  const totalGathered = resources.reduce((sum, resource) => sum + resource.gathered, 0)

  return totalNeeded > 0 ? Math.round((totalGathered / totalNeeded) * 100) : 100
}

export function calculateOverallProgress(item: any): number {
  const resourceProgress = calculateResourceProgress(item.resources)

  if (item.subtasks && item.subtasks.length > 0) {
    const subtaskProgress =
      item.subtasks.reduce((sum: number, subtask: any) => {
        return sum + calculateOverallProgress(subtask)
      }, 0) / item.subtasks.length

    return Math.round(resourceProgress * 0.6 + subtaskProgress * 0.4)
  }

  return resourceProgress
}
