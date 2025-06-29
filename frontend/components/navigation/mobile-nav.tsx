"use client"

import { Button } from "@/components/ui/button"
import { Home, User, List, Settings } from "lucide-react"

interface MobileNavProps {
  currentView: string
  setCurrentView: (view: string) => void
  isAdmin?: boolean
}

export function MobileNav({ currentView, setCurrentView, isAdmin = false }: MobileNavProps) {
  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-50">
      <div className="flex justify-around">
        <Button
          variant={currentView === "dashboard" ? "default" : "ghost"}
          size="sm"
          onClick={() => setCurrentView("dashboard")}
          className="flex flex-col gap-1 h-auto py-2"
        >
          <Home className="h-4 w-4" />
          <span className="text-xs">Tasks</span>
        </Button>
        
        <Button
          variant={currentView === "my-tasks" ? "default" : "ghost"}
          size="sm"
          onClick={() => setCurrentView("my-tasks")}
          className="flex flex-col gap-1 h-auto py-2"
        >
          <List className="h-4 w-4" />
          <span className="text-xs">My Tasks</span>
        </Button>
        
        <Button
          variant={currentView === "profile" ? "default" : "ghost"}
          size="sm"
          onClick={() => setCurrentView("profile")}
          className="flex flex-col gap-1 h-auto py-2"
        >
          <User className="h-4 w-4" />
          <span className="text-xs">Profile</span>
        </Button>
        
        {isAdmin && (
          <Button
            variant={currentView === "admin" ? "default" : "ghost"}
            size="sm"
            onClick={() => setCurrentView("admin")}
            className="flex flex-col gap-1 h-auto py-2"
          >
            <Settings className="h-4 w-4" />
            <span className="text-xs">Admin</span>
          </Button>
        )}
      </div>
    </div>
  )
}
