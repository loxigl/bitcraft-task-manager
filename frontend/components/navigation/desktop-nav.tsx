"use client"

import { Button } from "@/components/ui/button"
import { Sword } from "lucide-react"

interface DesktopNavProps {
  currentView: string
  setCurrentView: (view: string) => void
}

export function DesktopNav({ currentView, setCurrentView }: DesktopNavProps) {
  return (
    <div className="hidden md:flex items-center justify-between mb-6 p-4 bg-white rounded-lg shadow-sm">
      <div className="flex items-center gap-2">
        <Sword className="h-6 w-6 text-blue-600" />
        <span className="text-xl font-bold">BitCraft</span>
      </div>
      <div className="flex gap-2">
        <Button variant={currentView === "dashboard" ? "default" : "ghost"} onClick={() => setCurrentView("dashboard")}>
          Task Board
        </Button>
        <Button variant={currentView === "profile" ? "default" : "ghost"} onClick={() => setCurrentView("profile")}>
          My Profile
        </Button>
      </div>
    </div>
  )
}
