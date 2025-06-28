"use client"

import { Button } from "@/components/ui/button"
import { Home, ClipboardList, UserCircle } from "lucide-react"

interface MobileNavProps {
  currentView: string
  setCurrentView: (view: string) => void
}

export function MobileNav({ currentView, setCurrentView }: MobileNavProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-2 md:hidden">
      <div className="flex justify-around">
        <Button
          variant={currentView === "dashboard" ? "default" : "ghost"}
          size="sm"
          onClick={() => setCurrentView("dashboard")}
          className="flex flex-col items-center gap-1"
        >
          <Home className="h-4 w-4" />
          <span className="text-xs">Tasks</span>
        </Button>
        <Button
          variant={currentView === "my-tasks" ? "default" : "ghost"}
          size="sm"
          onClick={() => setCurrentView("my-tasks")}
          className="flex flex-col items-center gap-1"
        >
          <ClipboardList className="h-4 w-4" />
          <span className="text-xs">My Tasks</span>
        </Button>
        <Button
          variant={currentView === "profile" ? "default" : "ghost"}
          size="sm"
          onClick={() => setCurrentView("profile")}
          className="flex flex-col items-center gap-1"
        >
          <UserCircle className="h-4 w-4" />
          <span className="text-xs">Profile</span>
        </Button>
      </div>
    </div>
  )
}
