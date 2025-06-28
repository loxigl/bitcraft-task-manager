"use client"

import { useState } from "react"
import { mockUser } from "@/lib/mock-data"
import { isUserAssigned } from "@/lib/utils/task-utils"

export function useTaskManagement(initialTasks: any[]) {
  const [tasks, setTasks] = useState(initialTasks)

  const claimTask = (taskId: number) => {
    setTasks(
      tasks.map((task) => {
        if (task.id === taskId) {
          const newAssignedTo = Array.isArray(task.assignedTo) ? [...task.assignedTo] : []
          if (isUserAssigned(task.assignedTo)) {
            return {
              ...task,
              assignedTo: newAssignedTo.filter((name: string) => name !== mockUser.name),
              status:
                newAssignedTo.filter((name: string) => name !== mockUser.name).length === 0 ? "open" : task.status,
            }
          } else {
            return {
              ...task,
              assignedTo: [...newAssignedTo, mockUser.name],
              status: "taken",
            }
          }
        }
        return task
      }),
    )
  }

  const claimSubtask = (taskId: number, subtaskId: number, isNested = false, parentSubtaskId = null) => {
    setTasks(
      tasks.map((task) => {
        if (task.id === taskId) {
          const updateSubtasks = (subtasks: any[]): any[] => {
            return subtasks.map((subtask) => {
              if (subtask.id === subtaskId) {
                const newAssignedTo = Array.isArray(subtask.assignedTo) ? [...subtask.assignedTo] : []
                if (isUserAssigned(subtask.assignedTo)) {
                  return {
                    ...subtask,
                    assignedTo: newAssignedTo.filter((name: string) => name !== mockUser.name),
                  }
                } else {
                  return {
                    ...subtask,
                    assignedTo: [...newAssignedTo, mockUser.name],
                  }
                }
              }
              if (subtask.subtasks) {
                return {
                  ...subtask,
                  subtasks: updateSubtasks(subtask.subtasks),
                }
              }
              return subtask
            })
          }

          return {
            ...task,
            subtasks: updateSubtasks(task.subtasks),
          }
        }
        return task
      }),
    )
  }

  const deleteTask = (taskId: number) => {
    setTasks(tasks.filter((task) => task.id !== taskId))
  }

  const updateResourceContribution = (
    taskId: number,
    subtaskId: number | null,
    resourceName: string,
    quantity: number,
    isNested = false,
    parentSubtaskId = null,
  ) => {
    setTasks(
      tasks.map((task) => {
        if (task.id === taskId) {
          if (!subtaskId) {
            return {
              ...task,
              resources: task.resources.map((resource: any) => {
                if (resource.name === resourceName) {
                  const newContributors = { ...resource.contributors }
                  newContributors[mockUser.name] = quantity
                  const newGathered = Object.values(newContributors).reduce((sum: number, val: any) => sum + val, 0)
                  return {
                    ...resource,
                    contributors: newContributors,
                    gathered: Math.min(newGathered, resource.needed),
                  }
                }
                return resource
              }),
            }
          } else {
            const updateSubtasks = (subtasks: any[]): any[] => {
              return subtasks.map((subtask) => {
                if (subtask.id === subtaskId) {
                  return {
                    ...subtask,
                    resources: subtask.resources.map((resource: any) => {
                      if (resource.name === resourceName) {
                        const newContributors = { ...resource.contributors }
                        newContributors[mockUser.name] = quantity
                        const newGathered = Object.values(newContributors).reduce(
                          (sum: number, val: any) => sum + val,
                          0,
                        )
                        return {
                          ...resource,
                          contributors: newContributors,
                          gathered: Math.min(newGathered, resource.needed),
                        }
                      }
                      return resource
                    }),
                  }
                }
                if (subtask.subtasks) {
                  return {
                    ...subtask,
                    subtasks: updateSubtasks(subtask.subtasks),
                  }
                }
                return subtask
              })
            }

            return {
              ...task,
              subtasks: updateSubtasks(task.subtasks),
            }
          }
        }
        return task
      }),
    )
  }

  return {
    tasks,
    setTasks,
    claimTask,
    claimSubtask,
    deleteTask,
    updateResourceContribution,
  }
}
