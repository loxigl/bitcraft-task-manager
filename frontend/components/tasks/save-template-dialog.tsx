"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { apiClient } from "@/lib/api-client"
import { useUser } from "@/contexts/UserContext"
import { useToast } from "@/hooks/use-toast"
import { Save } from "lucide-react"

interface SaveTemplateDialogProps {
  isOpen: boolean
  onClose: () => void
  taskId: number
  subtaskId?: string
  defaultName?: string
  onSuccess?: () => void
}

export function SaveTemplateDialog({
  isOpen,
  onClose,
  taskId,
  subtaskId,
  defaultName = "",
  onSuccess
}: SaveTemplateDialogProps) {
  const [templateName, setTemplateName] = useState(defaultName)
  const [isLoading, setIsLoading] = useState(false)
  const { currentUser } = useUser()
  const { toast } = useToast()

  const handleSaveTemplate = async () => {
    if (!templateName.trim()) {
      toast({
        variant: "destructive",
        title: "Template name required",
        description: "Please enter a name for your template."
      })
      return
    }

    setIsLoading(true)
    try {
      const response = await apiClient.createTemplate({
        name: templateName,
        taskId,
        subtaskId,
        userName: currentUser?.name || "Unknown"
      })

      if (response.success) {
        toast({
          title: "Template saved",
          description: "Your template has been saved successfully."
        })
        onClose()
        if (onSuccess) {
          onSuccess()
        }
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: response.message || "Failed to save template."
        })
      }
    } catch (error) {
      console.error("Error saving template:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred. Please try again."
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Save as Template</DialogTitle>
          <DialogDescription>
            Create a template that you can reuse for future tasks.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="template-name" className="text-right">
              Template Name
            </Label>
            <Input
              id="template-name"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              placeholder="Enter template name..."
              className="col-span-3"
              autoFocus
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button 
            onClick={handleSaveTemplate} 
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            {isLoading ? "Saving..." : "Save Template"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 