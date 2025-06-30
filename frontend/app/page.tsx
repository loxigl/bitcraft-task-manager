"use client"

import { useState, useEffect } from "react"
import { TaskDashboard } from "@/components/dashboard/task-dashboard"
import { UserProfile } from "@/components/profile/user-profile"
import { AdminPanel } from "@/components/admin/admin-panel"
import { CreateTaskDialog } from "@/components/tasks/create-task-dialog"
import { MobileNav } from "@/components/navigation/mobile-nav"
import { DesktopNav } from "@/components/navigation/desktop-nav"
import { MyTasks } from "@/components/tasks/my-tasks"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useApiTasks } from "@/hooks/use-api-tasks"
import { useUser } from "@/contexts/UserContext"
import { useProfessionManagement } from "@/hooks/use-profession-management"
import { AuthContainer } from "@/components/auth/auth-container"
import { createCompatibilityWrapper } from "@/lib/compatibility-adapter"
import { apiClient } from "@/lib/api-client"
import {
  Hammer,
  FlaskConical,
  Scissors,
  Pickaxe,
  Target,
  TreePine,
  Wheat,
  Fish,
  Leaf,
  Shield,
  Wrench,
  BookOpen,
} from "lucide-react"

// Updated profession icons
const professionIcons = {
  carpentry: Hammer,
  farming: Wheat,
  fishing: Fish,
  foraging: Leaf,
  forestry: TreePine,
  hunting: Target,
  leatherworking: Shield,
  masonry: Wrench,
  mining: Pickaxe,
  scholar: BookOpen,
  smithing: FlaskConical,
  tailoring: Scissors,
}

export default function GuildCraftingDashboard() {
  const [currentView, setCurrentView] = useState("dashboard")
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
  const [taskType, setTaskType] = useState<'guild' | 'member'>('guild')
  const [activeTaskTab, setActiveTaskTab] = useState('guild')
  
  // Use API hooks with correct interface
  const { 
    tasks: allTasks, 
    loading: tasksLoading, 
    error: tasksError, 
    loadTasks,
    claimTask: apiClaimTask,
    claimSubtask: apiClaimSubtask,
    createTask: apiCreateTask,
    deleteTask: apiDeleteTask,
    updateResourceContribution: apiUpdateResource,
    completeSubtask: apiCompleteSubtask,
    refreshTask,
    updateTaskStatus: apiUpdateTaskStatus,
    softRefresh
  } = useApiTasks()
  
  const { currentUser, loading: userLoading, isLoggedIn } = useUser()
  const { 
    userProfessions, 
    updateProfessionLevel, 
    editingProfessions, 
    setEditingProfessions, 
    saveChanges,
    cancelChanges,
    hasChanges,
    isSaving
  } = useProfessionManagement(currentUser?.professions || {})

  // Load tasks when user is logged in
  useEffect(() => {
    if (currentUser) {
      loadTasks()
    }
  }, [currentUser])

  // Auto-refresh tasks every 30 seconds
  useEffect(() => {
    if (currentUser) {
      const interval = setInterval(() => {
        loadTasks()
      }, 30000) // 30 seconds
      
      return () => clearInterval(interval)
    }
  }, [currentUser, loadTasks])

  // Filter tasks by type instead of mock division
  const guildTasks = (allTasks || []).filter(task => task.taskType === 'guild')
  const memberTasks = (allTasks || []).filter(task => task.taskType === 'member')

  // No longer need mockUser - using real currentUser everywhere

  // Real admin check based on user role
  const isAdmin = currentUser?.role === 'admin' || currentUser?.role === 'guild_leader'

  const handleCreateTask = (type: 'guild' | 'member') => {
    setTaskType(type)
    setEditingTask(null)
    setIsCreateTaskOpen(true)
  }

  const handleTaskCreated = () => {
    loadTasks() // Reload tasks after creation
  }

  // Wrapper functions for task management with correct signatures
  const claimTask = async (taskId: number | string) => {
    const taskIdStr = typeof taskId === 'string' ? taskId : taskId.toString()
    // apiClaimTask уже обновляет локальное состояние - никаких дополнительных перезагрузок не нужно
    await apiClaimTask(taskIdStr)
  }

  const claimSubtask = async (taskId: number | string, subtaskId: number | string) => {
    const taskIdStr = typeof taskId === 'string' ? taskId : taskId.toString()
    const subtaskIdStr = typeof subtaskId === 'string' ? subtaskId : subtaskId.toString()
    // apiClaimSubtask уже обновляет локальное состояние - никаких дополнительных перезагрузок не нужно
    await apiClaimSubtask(taskIdStr, subtaskIdStr)
  }

  const updateResourceContribution = (
    taskId: number | string, 
    subtaskId: number | string | null, 
    resourceName: string, 
    quantity: number
  ) => {
    const taskIdStr = typeof taskId === 'string' ? taskId : taskId.toString()
    const subtaskIdStr = subtaskId ? (typeof subtaskId === 'string' ? subtaskId : subtaskId.toString()) : undefined
    apiUpdateResource(taskIdStr, resourceName, quantity, undefined, subtaskIdStr)
  }

  const completeSubtask = async (taskId: number | string, subtaskId: number | string) => {
    const taskIdStr = typeof taskId === 'string' ? taskId : taskId.toString()
    const subtaskIdStr = typeof subtaskId === 'string' ? subtaskId : subtaskId.toString()
    // apiCompleteSubtask уже обновляет локальное состояние - никаких дополнительных перезагрузок не нужно
    await apiCompleteSubtask(taskIdStr, subtaskIdStr)
  }

  const deleteTask = (taskId: number | string) => {
    const taskIdStr = typeof taskId === 'string' ? taskId : taskId.toString()
    apiDeleteTask(taskIdStr)
  }

  if (!currentUser) {
    return <AuthContainer />
  }

  const renderContent = () => {
    switch (currentView) {
      case "profile":
          return (
          <UserProfile
            user={currentUser}
            userProfessions={userProfessions}
            editingProfessions={editingProfessions}
            setEditingProfessions={setEditingProfessions}
            updateProfessionLevel={updateProfessionLevel}
            saveChanges={saveChanges}
            cancelChanges={cancelChanges}
            hasChanges={hasChanges}
            isSaving={isSaving}
            tasks={allTasks || []}
          />
        )
      case "admin":
        if (!isAdmin) {
          return (
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
              <p className="text-gray-600">You don't have permission to access the admin panel.</p>
            </div>
          )
        }
        return (
          <AdminPanel 
            tasks={allTasks || []} 
            setCurrentView={setCurrentView}
            setEditingTask={setEditingTask}
            setIsCreateTaskOpen={setIsCreateTaskOpen}
            deleteTask={deleteTask}
            claimSubtask={claimSubtask}
            updateResourceContribution={updateResourceContribution}
            completeSubtask={completeSubtask}
            updateTaskStatus={apiUpdateTaskStatus}
            userProfessions={userProfessions}
            refreshTasks={softRefresh}
          />
        )
      case "my-tasks":
        return (
          <MyTasks
            tasks={allTasks || []}
            userProfessions={userProfessions}
            updateResourceContribution={updateResourceContribution}
            claimSubtask={claimSubtask}
            onTaskUpdate={() => {
              // Локальное состояние уже обновляется в API функциях
              // Дополнительные обновления не нужны
            }}
            completeSubtask={completeSubtask}
            onEditTask={(task) => {
              setEditingTask(task)
              setIsCreateTaskOpen(true)
            }}
            updateTaskStatus={apiUpdateTaskStatus}
            refreshTasks={softRefresh}
          />
        )
      default:
        return (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">BitCraft Guild Task Board</h1>
                <p className="text-gray-600">Manage and track crafting tasks for your guild</p>
              </div>
              <div className="flex gap-2">
                {isAdmin && (
                  <button
                    onClick={() => setCurrentView("admin")}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Admin Panel
                  </button>
                )}
              </div>
            </div>

            <Tabs value={activeTaskTab} onValueChange={setActiveTaskTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="guild">Guild Tasks</TabsTrigger>
                <TabsTrigger value="member">Member Tasks</TabsTrigger>
              </TabsList>
              
              <TabsContent value="guild" className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-bold">Guild Tasks</h2>
                    <p className="text-gray-600">Tasks created by guild leadership for specific members</p>
                  </div>
                  {isAdmin && (
                    <button
                      onClick={() => handleCreateTask('guild')}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Create Guild Task
                    </button>
                  )}
                </div>
                <TaskDashboard
                  tasks={guildTasks}
                  userProfessions={userProfessions}
                  claimTask={claimTask}
                  claimSubtask={claimSubtask}
                  updateResourceContribution={updateResourceContribution}
                  setCurrentView={setCurrentView}
                  setIsCreateTaskOpen={() => handleCreateTask('guild')}
                  onTaskUpdate={() => {
                    // Локальное состояние уже обновляется в API функциях
                  }}
                  completeSubtask={completeSubtask}
                  refreshTasks={softRefresh}
                />
              </TabsContent>
              
              <TabsContent value="member" className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-bold">Member Tasks</h2>
                    <p className="text-gray-600">Tasks created by any guild member</p>
                  </div>
                  <button
                    onClick={() => handleCreateTask('member')}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Create Member Task
                  </button>
                </div>
                <TaskDashboard
                  tasks={memberTasks}
                  userProfessions={userProfessions}
                  claimTask={claimTask}
                  claimSubtask={claimSubtask}
                  updateResourceContribution={updateResourceContribution}
                  setCurrentView={setCurrentView}
                  setIsCreateTaskOpen={() => handleCreateTask('member')}
                  onTaskUpdate={() => {
                    // Локальное состояние уже обновляется в API функциях
                  }}
                  completeSubtask={completeSubtask}
                  refreshTasks={softRefresh}
                />
              </TabsContent>
            </Tabs>
          </div>
        )
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="lg:hidden">
        <MobileNav 
          currentView={currentView} 
          setCurrentView={setCurrentView}
          isAdmin={isAdmin}
        />
      </div>

      <div className="hidden lg:block">
        <DesktopNav 
          currentView={currentView} 
          setCurrentView={setCurrentView}
          isAdmin={isAdmin}
        />
      </div>

      <main className="lg:pl-64 pt-16 lg:pt-0">
        <div className="p-6">
          {tasksLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading tasks...</p>
            </div>
          ) : tasksError ? (
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold text-red-600 mb-4">Error Loading Tasks</h2>
              <p className="text-gray-600 mb-4">{tasksError}</p>
              <button
                onClick={loadTasks}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Retry
              </button>
            </div>
          ) : (
            renderContent()
          )}
        </div>
      </main>

        <CreateTaskDialog
          isOpen={isCreateTaskOpen}
          setIsOpen={setIsCreateTaskOpen}
          editingTask={editingTask}
          setEditingTask={setEditingTask}
          userProfessions={userProfessions}
        onTaskCreated={handleTaskCreated}
        taskType={taskType}
        />
    </div>
  )
}
