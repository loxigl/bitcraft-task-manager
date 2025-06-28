"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Trophy, CheckCircle } from "lucide-react"
import { format } from "date-fns"
import { professionIcons } from "@/lib/constants"
import { isUserAssigned, getStatusColor } from "@/lib/utils/task-utils"
import { cn } from "@/lib/utils"

interface UserProfileProps {
  mockUser: any
  userProfessions: any
  editingProfessions: boolean
  setEditingProfessions: (editing: boolean) => void
  updateProfessionLevel: (profession: string, level: number) => void
  tasks: any[]
}

export function UserProfile({
  mockUser,
  userProfessions,
  editingProfessions,
  setEditingProfessions,
  updateProfessionLevel,
  tasks,
}: UserProfileProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Avatar className="h-20 w-20">
          <AvatarImage src={mockUser.avatar || "/placeholder.svg"} />
          <AvatarFallback>LM</AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-3xl font-bold">{mockUser.name}</h1>
          <p className="text-gray-600">
            Level {mockUser.level} • {mockUser.guild}
          </p>
          <div className="flex items-center gap-4 mt-2">
            <div className="flex items-center gap-1">
              <Trophy className="h-4 w-4 text-yellow-500" />
              <span className="text-sm">{mockUser.reputation} Reputation</span>
            </div>
            <div className="flex items-center gap-1">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm">{mockUser.completedTasks} Tasks Completed</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Profession Levels</CardTitle>
            <CardDescription>Your crafting expertise across different professions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-gray-600">Click levels to edit</span>
              <Button variant="outline" size="sm" onClick={() => setEditingProfessions(!editingProfessions)}>
                {editingProfessions ? "Save Changes" : "Edit Levels"}
              </Button>
            </div>
            {Object.entries(userProfessions).map(([profession, data]: [string, any]) => {
              const Icon = professionIcons[profession]
              const percentage = (data.level / 100) * 100
              return (
                <div key={profession} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4" />
                      <span className="capitalize font-medium">{profession}</span>
                    </div>
                    {editingProfessions ? (
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          min="1"
                          max="100"
                          value={data.level}
                          onChange={(e) => updateProfessionLevel(profession, Number.parseInt(e.target.value) || 1)}
                          className="w-16 h-8 text-center"
                        />
                        <span className="text-sm">/ 100</span>
                      </div>
                    ) : (
                      <span className="text-sm font-medium">Level {data.level}</span>
                    )}
                  </div>
                  <Progress value={percentage} className="h-2" />
                  <div className="text-xs text-gray-500 text-right">{percentage.toFixed(0)}% of max level</div>
                </div>
              )
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Current Assignments</CardTitle>
            <CardDescription>Tasks and subtasks you're currently working on</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {tasks
                .filter((task) => isUserAssigned(task.assignedTo))
                .map((task) => (
                  <div key={task.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium">{task.name}</div>
                      <div className="text-sm text-gray-500">Due {format(new Date(task.deadline), "MMM dd")}</div>
                    </div>
                    <Badge className={cn("text-white", getStatusColor(task.status))}>{task.status}</Badge>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <div className="font-medium">Completed "Enchanted Robes"</div>
                <div className="text-sm text-gray-500">2 hours ago</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
              <Trophy className="h-5 w-5 text-blue-500" />
              <div>
                <div className="font-medium">Claimed subtask "Prepare Forestry Tools"</div>
                <div className="text-sm text-gray-500">1 day ago</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
