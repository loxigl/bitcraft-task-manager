"use client"

import { Button } from "@/components/ui/button"
import { Sword } from "lucide-react"

interface DesktopNavProps {
  currentView: string
  setCurrentView: (view: string) => void
  isAdmin?: boolean
}

export function DesktopNav({ currentView, setCurrentView, isAdmin = false }: DesktopNavProps) {
  return (
    <div className="hidden lg:block fixed top-0 left-0 w-64 h-full bg-white border-r border-gray-200 z-40">
      <div className="p-6">
        <div className="flex items-center gap-2 mb-8">
          <Sword className="h-6 w-6 text-blue-600" />
          <span className="text-xl font-bold">BitCraft Guild</span>
        </div>
        
        <nav className="space-y-2">
          <Button 
            variant={currentView === "dashboard" ? "default" : "ghost"} 
            onClick={() => setCurrentView("dashboard")}
            className="w-full justify-start"
          >
            Task Board
          </Button>
          
          <Button 
            variant={currentView === "my-tasks" ? "default" : "ghost"} 
            onClick={() => setCurrentView("my-tasks")}
            className="w-full justify-start"
          >
            My Tasks
          </Button>
          
          <Button 
            variant={currentView === "profile" ? "default" : "ghost"} 
            onClick={() => setCurrentView("profile")}
            className="w-full justify-start"
          >
            My Profile
          </Button>
          
          {isAdmin && (
            <Button 
              variant={currentView === "admin" ? "default" : "ghost"} 
              onClick={() => setCurrentView("admin")}
              className="w-full justify-start"
            >
              Admin Panel
            </Button>
          )}
        </nav>
      </div>
    </div>
  )
}
