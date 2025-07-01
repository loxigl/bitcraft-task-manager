"use client"

import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { apiClient } from "@/lib/api-client"
import { useToast } from "@/hooks/use-toast"
import { Search, BookTemplate, X, Calendar, Package, AlertCircle } from "lucide-react"
import { format } from "date-fns"

interface TemplateSelectorDialogProps {
  isOpen: boolean
  onClose: () => void
  onSelectTemplate: (template: any) => void
  onCreateNew: () => void
}

export function TemplateSelectorDialog({
  isOpen,
  onClose,
  onSelectTemplate,
  onCreateNew
}: TemplateSelectorDialogProps) {
  const [templates, setTemplates] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null)
  const { toast } = useToast()

  const fetchTemplates = async () => {
    setIsLoading(true)
    try {
      const response = await apiClient.getAllTemplates(searchTerm)
      if (response.success) {
        setTemplates(response.data)
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: response.message || "Failed to load templates"
        })
      }
    } catch (error) {
      console.error("Error fetching templates:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred while fetching templates"
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (isOpen) {
      fetchTemplates()
    } else {
      setSearchTerm("")
      setSelectedTemplateId(null)
    }
  }, [isOpen])

  const handleSearch = () => {
    fetchTemplates()
  }

  const handleSelectTemplate = () => {
    if (!selectedTemplateId) {
      toast({
        variant: "destructive", 
        title: "No template selected",
        description: "Please select a template or create a new task"
      })
      return
    }

    const selectedTemplate = templates.find(t => t.id === selectedTemplateId)
    if (selectedTemplate) {
      onSelectTemplate(selectedTemplate)
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Select Template or Create New Task</DialogTitle>
          <DialogDescription>
            Choose from existing templates or create a task from scratch.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center space-x-2 my-4">
          <Input
            placeholder="Search templates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1"
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
          <Button
            variant="outline"
            onClick={handleSearch}
            disabled={isLoading}
          >
            <Search className="h-4 w-4" />
          </Button>
        </div>

        <ScrollArea className="h-[400px] border rounded-md p-2">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-sm text-gray-500">Loading templates...</p>
            </div>
          ) : templates.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-2 text-gray-500">
              <AlertCircle className="h-8 w-8" />
              <p>No templates found</p>
              <Button variant="outline" onClick={onCreateNew} className="mt-2">
                Create New Task Instead
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {templates.map((template) => (
                <div
                  key={template.id}
                  className={`p-3 border rounded-lg cursor-pointer transition-all ${
                    selectedTemplateId === template.id
                      ? "border-blue-500 bg-blue-50"
                      : "hover:border-gray-300"
                  }`}
                  onClick={() => setSelectedTemplateId(template.id)}
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">{template.name}</h3>
                    <div className="flex items-center gap-2 text-gray-500 text-xs">
                      <BookTemplate className="h-3 w-3" />
                      {template.createdBy}
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                    {template.description || "No description"}
                  </p>
                  
                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {template.createdAt ? format(new Date(template.createdAt), "MMM d, yyyy") : "Unknown date"}
                    </div>
                    <div className="flex items-center gap-1">
                      <Package className="h-3 w-3" />
                      {template.subtasks?.length || 0} subtasks
                    </div>
                    <div className="capitalize">
                      {template.taskType || "member"} task
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={onCreateNew}
            className="flex items-center gap-2"
          >
            <X className="h-4 w-4" />
            Create New Task
          </Button>
          <Button
            onClick={handleSelectTemplate}
            disabled={!selectedTemplateId || isLoading}
            className="flex items-center gap-2"
          >
            <BookTemplate className="h-4 w-4" />
            Use Selected Template
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 