// Removed mockUser import - now using real user data

// Helper function to find a subtask by ID in nested structure
function findSubtaskById(subtasks: any[], id: number | string): any {
  if (!subtasks) return null
  
  for (const subtask of subtasks) {
    // Convert both to string for comparison to handle mixed types
    if (String(subtask.id) === String(id)) {
      return subtask
    }
    
    const found = findSubtaskById(subtask.subtasks || [], id)
    if (found) {
      return found
    }
  }
  
  return null
}

export function canDoSubtask(subtask: any, task: any, userProfessions: any) {
  // Check user's profession levels
  const hasRequiredLevels = subtask.professions.every((prof: string) => {
    const userLevel = userProfessions[prof]?.level || 0
    const requiredLevel = subtask.levels[prof] || 0
    return userLevel >= requiredLevel
  })

  // Check dependency completion (dependencies must be completed before this subtask can start)
  // If no dependencies, this returns true (empty array = no blocking dependencies)
  const dependenciesCompleted = !subtask.dependencies || subtask.dependencies.length === 0 || 
    subtask.dependencies.every((depId: number | string) => {
      const dependency = findSubtaskById(task.subtasks, depId)
      return dependency && dependency.completed
    })

  // Parent-child relationships don't block children - children can be done independently
  // Only dependencies and profession levels matter for availability

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

// Build hierarchical structure of subtasks based on subtaskOf relationships
export function buildSubtaskHierarchy(subtasks: any[]): any[] {
  if (!subtasks) return []

  const subtaskMap = new Map()
  const rootSubtasks: any[] = []

  // First pass: create map of all subtasks
  subtasks.forEach(subtask => {
    subtaskMap.set(subtask.id, { ...subtask, children: [] })
  })

  // Second pass: build hierarchy
  subtasks.forEach(subtask => {
    const subtaskWithChildren = subtaskMap.get(subtask.id)
    
    if (subtask.subtaskOf) {
      // This is a child subtask
      const parent = subtaskMap.get(subtask.subtaskOf)
      if (parent) {
        parent.children.push(subtaskWithChildren)
      } else {
        // Parent not found, treat as root
        rootSubtasks.push(subtaskWithChildren)
      }
    } else {
      // This is a root subtask
      rootSubtasks.push(subtaskWithChildren)
    }
  })

  return rootSubtasks
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

export function isUserAssigned(assignedTo: any, userName?: string) {
  if (!userName) return false
  return Array.isArray(assignedTo) ? assignedTo.includes(userName) : assignedTo === userName
}

export function getStatusColor(status: string) {
  switch (status) {
    case "open":
      return "bg-green-100 text-green-800 border-green-200"
    case "taken":
    case "in_progress":
    case "in progress":
      return "bg-blue-100 text-blue-800 border-blue-200"
    case "done":
    case "completed":
      return "bg-gray-100 text-gray-800 border-gray-200"
    default:
      return "bg-gray-100 text-gray-800 border-gray-200"
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
  // Если элемент помечен как завершенный, он 100% готов
  if (item.completed) {
    return 100
  }

  const resourceProgress = calculateResourceProgress(item.resources)

  if (item.subtasks && item.subtasks.length > 0) {
    const subtaskProgress =
      item.subtasks.reduce((sum: number, subtask: any) => {
        // Если сабтаск завершен, он даёт 100% независимо от ресурсов
        if (subtask.completed) {
          return sum + 100
        }
        return sum + calculateOverallProgress(subtask)
      }, 0) / item.subtasks.length

    // Если есть сабтаски, ресурсы и сабтаски имеют равный вес
    return Math.round(resourceProgress * 0.5 + subtaskProgress * 0.5)
  }

  return resourceProgress
}
