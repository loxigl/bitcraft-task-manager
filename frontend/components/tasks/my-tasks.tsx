import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { getStatusColor, isUserAssigned } from "@/lib/utils/task-utils"
import { cn } from "@/lib/utils"

interface MyTasksProps {
  tasks: any[]
  mockUser: any
}

export function MyTasks({ tasks, mockUser }: MyTasksProps) {
  const userTasks = tasks.filter((task) => isUserAssigned(task.assignedTo))

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">My Tasks</h1>
      <div className="space-y-3">
        {userTasks.map((task) => (
          <Card key={task.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">{task.name}</h3>
                  <p className="text-sm text-gray-500">Due {format(new Date(task.deadline), "MMM dd")}</p>
                </div>
                <Badge className={cn("text-white", getStatusColor(task.status))}>{task.status}</Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
