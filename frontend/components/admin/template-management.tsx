"use client"

import React, { useState, useEffect, Fragment } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { BookTemplate, Search, ChevronDown, ChevronRight, Trash2, Eye, Package, Calendar, User } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { apiClient } from "@/lib/api-client"
import { useToast } from "@/hooks/use-toast"

interface TemplateManagementProps {
  refreshTemplates?: () => void
}

export function TemplateManagement({ refreshTemplates }: TemplateManagementProps) {
  const [templates, setTemplates] = useState<any[]>([])
  const [expandedTemplates, setExpandedTemplates] = useState(new Set())
  const [isLoading, setIsLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [previewTemplate, setPreviewTemplate] = useState<any>(null)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  
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
    fetchTemplates()
  }, [])

  const handleSearch = () => {
    fetchTemplates()
  }

  const toggleExpanded = (templateId: string) => {
    const newExpanded = new Set(expandedTemplates)
    if (newExpanded.has(templateId)) {
      newExpanded.delete(templateId)
    } else {
      newExpanded.add(templateId)
    }
    setExpandedTemplates(newExpanded)
  }

  const handleDelete = async (templateId: string) => {
    if (!confirm("Are you sure you want to delete this template? This action cannot be undone.")) {
      return
    }

    try {
      const response = await apiClient.deleteTemplate(templateId)
      if (response.success) {
        toast({
          title: "Template deleted",
          description: "Template has been deleted successfully"
        })
        fetchTemplates()
        if (refreshTemplates) {
          refreshTemplates()
        }
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: response.message || "Failed to delete template"
        })
      }
    } catch (error) {
      console.error("Error deleting template:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred while deleting the template"
      })
    }
  }

  const openPreview = (template: any) => {
    setPreviewTemplate(template)
    setIsPreviewOpen(true)
  }

  // Рекурсивная функция для отображения подзадач
  const renderSubtasks = (subtasks: any[], depth: number = 0) => {
    if (!subtasks || subtasks.length === 0) return null
    
    // Построение иерархии подзадач
    const buildHierarchy = (subtasks: any[]) => {
      const idToSubtask = new Map()
      const rootSubtasks = []
      
      // Сначала создаем карту ID -> подзадача
      subtasks.forEach(subtask => {
        idToSubtask.set(subtask.id, { ...subtask, children: [] })
      })
      
      // Затем строим иерархию
      subtasks.forEach(subtask => {
        const processedSubtask = idToSubtask.get(subtask.id)
        
        if (subtask.subtaskOf && idToSubtask.has(subtask.subtaskOf)) {
          const parent = idToSubtask.get(subtask.subtaskOf)
          parent.children.push(processedSubtask)
        } else {
          rootSubtasks.push(processedSubtask)
        }
      })
      
      return rootSubtasks
    }
    
    const hierarchicalSubtasks = buildHierarchy(subtasks)
    
    const renderSubtaskItem = (subtask: any, depth: number = 0) => {
      const hasChildren = subtask.children && subtask.children.length > 0
      
      return (
        <div key={subtask.id} className="mb-2">
          <div 
            className="flex items-start p-2 rounded border border-gray-200 bg-gray-50"
            style={{ marginLeft: `${depth * 20}px` }}
          >
            <div className="flex-1">
              <div className="font-medium">{subtask.name}</div>
              {subtask.description && (
                <div className="text-sm text-gray-600">{subtask.description}</div>
              )}
              
              {subtask.professions && subtask.professions.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1">
                  {subtask.professions.map((prof: string) => (
                    <Badge key={prof} variant="outline" className="text-xs">
                      {prof} (Lv.{subtask.levels?.[prof] || 0})
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          {hasChildren && (
            <div className="ml-6 pl-2 border-l border-gray-200">
              {subtask.children.map((child: any) => renderSubtaskItem(child, depth + 1))}
            </div>
          )}
        </div>
      )
    }
    
    return (
      <div className="space-y-2">
        {hierarchicalSubtasks.map(subtask => renderSubtaskItem(subtask, depth))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Template Management</CardTitle>
            <CardDescription>Manage task templates for your guild</CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <Input
              placeholder="Search templates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-64"
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
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center p-8">
              <p>Loading templates...</p>
            </div>
          ) : templates.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-gray-500">
              <BookTemplate className="h-12 w-12 mb-2 opacity-50" />
              <p>No templates found</p>
              <p className="text-sm">Templates created by users will appear here</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Template</TableHead>
                  <TableHead>Created By</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead>Subtasks</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {templates.map((template) => {
                  const isExpanded = expandedTemplates.has(template.id)
                  
                  return (
                    <Fragment key={template.id}>
                      <TableRow>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleExpanded(template.id)}
                              className="h-6 w-6 p-0"
                            >
                              {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                            </Button>
                            <div>
                              <div>{template.name}</div>
                              {template.description && (
                                <div className="text-xs text-gray-500 line-clamp-1">
                                  {template.description}
                                </div>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3 text-gray-500" />
                            <span>{template.createdBy}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3 text-gray-500" />
                            <span>{template.createdAt ? format(new Date(template.createdAt), "MMM dd, yyyy") : "Unknown"}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {template.subtasks?.length || 0} subtasks
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="capitalize">
                            {template.taskType || "member"} task
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openPreview(template)}
                              title="Preview template"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(template.id)}
                              className="text-red-600 hover:text-red-700"
                              title="Delete template"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                      {isExpanded && (
                        <TableRow>
                          <TableCell colSpan={6} className="p-0">
                            <div className="p-4 bg-gray-50 border-t">
                              <div className="space-y-4">
                                {template.description && (
                                  <div>
                                    <h4 className="text-sm font-medium">Description</h4>
                                    <p className="text-sm text-gray-600 mt-1">{template.description}</p>
                                  </div>
                                )}
                                
                                {template.professions && template.professions.length > 0 && (
                                  <div>
                                    <h4 className="text-sm font-medium">Required Professions</h4>
                                    <div className="flex flex-wrap gap-1 mt-1">
                                      {template.professions.map((prof: string) => (
                                        <Badge key={prof} variant="outline">
                                          {prof} (Lv.{template.levels?.[prof] || 0})
                                        </Badge>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                
                                {template.resources && template.resources.length > 0 && (
                                  <div>
                                    <h4 className="text-sm font-medium">Resources</h4>
                                    <div className="mt-1 space-y-1">
                                      {template.resources.map((resource: any, index: number) => (
                                        <div key={index} className="flex items-center gap-2 text-sm">
                                          <Package className="h-3 w-3 text-gray-500" />
                                          <span>{resource.name}</span>
                                          <span className="text-gray-500">
                                            ({resource.needed} {resource.unit})
                                          </span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                
                                {template.subtasks && template.subtasks.length > 0 && (
                                  <div>
                                    <h4 className="text-sm font-medium">Subtasks</h4>
                                    <div className="mt-2">
                                      {renderSubtasks(template.subtasks)}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </Fragment>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      
      {/* Диалог предпросмотра шаблона */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Template Preview: {previewTemplate?.name}</DialogTitle>
            <DialogDescription>
              Created by {previewTemplate?.createdBy} on {previewTemplate?.createdAt ? format(new Date(previewTemplate.createdAt), "MMM dd, yyyy") : "Unknown date"}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {previewTemplate?.description && (
              <div>
                <h4 className="font-medium">Description</h4>
                <p className="text-gray-600 mt-1">{previewTemplate.description}</p>
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium">Task Type</h4>
                <Badge variant="secondary" className="mt-1 capitalize">
                  {previewTemplate?.taskType || "member"} task
                </Badge>
              </div>
              
              <div>
                <h4 className="font-medium">Priority</h4>
                <Badge variant="outline" className="mt-1">
                  {previewTemplate?.priority || "medium"}
                </Badge>
              </div>
            </div>
            
            {previewTemplate?.professions && previewTemplate.professions.length > 0 && (
              <div>
                <h4 className="font-medium">Required Professions</h4>
                <div className="flex flex-wrap gap-2 mt-1">
                  {previewTemplate.professions.map((prof: string) => (
                    <Badge key={prof} variant="outline">
                      {prof} (Lv.{previewTemplate.levels?.[prof] || 0})
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            
            {previewTemplate?.resources && previewTemplate.resources.length > 0 && (
              <div>
                <h4 className="font-medium">Resources</h4>
                <div className="mt-2 space-y-2">
                  {previewTemplate.resources.map((resource: any, index: number) => (
                    <div key={index} className="flex items-center gap-2 p-2 border rounded-md">
                      <Package className="h-4 w-4 text-gray-500" />
                      <div>
                        <div className="font-medium">{resource.name}</div>
                        <div className="text-sm text-gray-500">
                          {resource.needed} {resource.unit}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {previewTemplate?.subtasks && previewTemplate.subtasks.length > 0 && (
              <div>
                <h4 className="font-medium">Subtasks Structure</h4>
                <div className="mt-2 border rounded-md p-3 bg-gray-50">
                  {renderSubtasks(previewTemplate.subtasks)}
                </div>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPreviewOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 