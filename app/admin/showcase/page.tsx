"use client"

import React, { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import {
  Plus,
  Edit,
  Trash2,
  RefreshCw,
  Rocket,
  ExternalLink,
  Upload,
  X,
  Image as ImageIcon,
  CheckCircle,
  Briefcase
} from "lucide-react"

interface ShowcaseProject {
  id: string
  name: string
  description: string
  logo: string
  projectImage?: string
  url?: string
  category: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export default function ShowcaseProjectsPage() {
  const [projects, setProjects] = useState<ShowcaseProject[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showDialog, setShowDialog] = useState(false)
  const [editingProject, setEditingProject] = useState<ShowcaseProject | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    projectImage: "",
    url: "",
    category: "",
    isActive: true
  })
  const [uploading, setUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [uploadedImagePreview, setUploadedImagePreview] = useState("")
  const [uploadProgress, setUploadProgress] = useState("")
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  useEffect(() => {
    loadProjects()
  }, [])

  const loadProjects = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/showcase-projects')
      if (response.ok) {
        const data = await response.json()
        setProjects(data)
      } else {
        toast.error('Failed to load projects')
      }
    } catch (error) {
      console.error('Error loading projects:', error)
      toast.error('Failed to load projects')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const url = editingProject
        ? `/api/showcase-projects/${editingProject.id}`
        : '/api/showcase-projects'
      
      const method = editingProject ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        toast.success(editingProject ? '✅ Project updated successfully!' : '✅ Project created successfully!')
        await loadProjects()
        handleCloseDialog()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to save project')
      }
    } catch (error) {
      console.error('Error saving project:', error)
      toast.error('Failed to save project')
    }
  }

  const handleEdit = (project: ShowcaseProject) => {
    setEditingProject(project)
    setFormData({
      name: project.name,
      description: project.description,
      projectImage: project.projectImage || '',
      url: project.url || '',
      category: project.category,
      isActive: project.isActive
    })
    setUploadedImagePreview(project.projectImage || '')
    setShowDialog(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return

    try {
      const response = await fetch(`/api/showcase-projects/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast.success('Project deleted successfully')
        await loadProjects()
      } else {
        const error = await response.json()
        const errorMessage = error.error || error.details || 'Failed to delete project'
        toast.error(errorMessage)
        console.error('Delete error:', error)
      }
    } catch (error) {
      console.error('Error deleting project:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete project'
      toast.error(errorMessage)
    }
  }

  const handleCloseDialog = () => {
    setShowDialog(false)
    setEditingProject(null)
    setFormData({
      name: "",
      description: "",
      projectImage: "",
      url: "",
      category: "",
      isActive: true
    })
    setUploadedImagePreview("")
  }

  const handleFileUpload = async (file: File) => {
    if (!file) return

    // Validate file size
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      toast.error('File too large. Maximum size is 5MB.')
      return
    }

    try {
      setUploading(true)
      setUploadProgress('Preparing image...')
      
      const formData = new FormData()
      formData.append('file', file)

      setUploadProgress('Uploading & compressing...')
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      if (response.ok) {
        setUploadProgress('Processing...')
        const data = await response.json()
        setFormData(prev => ({ ...prev, projectImage: data.url }))
        setUploadedImagePreview(data.url)
        setUploadProgress('Upload complete!')
        
        // Show compression info if available
        if (data.compressionRatio) {
          toast.success(`Image uploaded and compressed by ${data.compressionRatio}!`)
        }
        
        setTimeout(() => setUploadProgress(''), 1000)
      } else {
        const error = await response.json()
        toast.error(error.error || 'Upload failed')
        setUploadProgress('')
      }
    } catch (error) {
      console.error('Upload error:', error)
      toast.error('Failed to upload image')
      setUploadProgress('')
    } finally {
      setUploading(false)
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0])
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0])
    }
  }

  const removeUploadedImage = () => {
    setFormData(prev => ({ ...prev, projectImage: "" }))
    setUploadedImagePreview("")
    // Clear the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-900 rounded-xl shadow-lg">
            <Briefcase className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-blue-900">Showcase Projects</h1>
            <p className="text-gray-600 mt-2">Manage projects displayed on the website</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={loadProjects}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            onClick={() => setShowDialog(true)}
            className="bg-blue-900 hover:bg-blue-800"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Project
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Projects</p>
                <p className="text-2xl font-bold text-gray-900">{projects.length}</p>
              </div>
              <Rocket className="h-10 w-10 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Projects</p>
                <p className="text-2xl font-bold text-green-600">
                  {projects.filter(p => p.isActive).length}
                </p>
              </div>
              <Rocket className="h-10 w-10 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Inactive Projects</p>
                <p className="text-2xl font-bold text-gray-600">
                  {projects.filter(p => !p.isActive).length}
                </p>
              </div>
              <Rocket className="h-10 w-10 text-gray-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Projects Grid */}
      {isLoading ? (
        <div className="text-center py-12">
          <RefreshCw className="h-12 w-12 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading projects...</p>
        </div>
      ) : projects.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Rocket className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">No Showcase Projects</h3>
            <p className="text-gray-600 mb-6">Add your first project to display on the website</p>
            <Button onClick={() => setShowDialog(true)} className="bg-blue-900 hover:bg-blue-800">
              <Plus className="h-4 w-4 mr-2" />
              Add First Project
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <Card key={project.id} className="overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{project.name}</CardTitle>
                    <p className="text-sm text-blue-100 mt-1">{project.category}</p>
                  </div>
                  <Badge className={project.isActive ? 'bg-green-500' : 'bg-gray-500'}>
                    {project.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                {project.projectImage ? (
                  <div className="relative">
                    <img 
                      src={project.projectImage} 
                      alt={project.name}
                      className="w-full h-40 object-cover rounded-lg"
                    />
                    {project.logo && project.logo !== '' && (
                      <div className="absolute top-2 left-2 bg-white rounded-lg p-2 shadow-md">
                        <img 
                          src={project.logo} 
                          alt={`${project.name} logo`}
                          className="h-12 w-12 object-contain"
                        />
                      </div>
                    )}
                  </div>
                ) : project.logo && project.logo !== '' ? (
                  <div className="flex justify-center">
                    <img 
                      src={project.logo} 
                      alt={project.name}
                      className="h-24 w-auto object-contain"
                    />
                  </div>
                ) : (
                  <div className="flex justify-center items-center h-24 bg-gray-100 rounded-lg">
                    <p className="text-gray-400 text-sm">No Image</p>
                  </div>
                )}
                
                <p className="text-sm text-gray-600 line-clamp-3">{project.description}</p>
                
                {project.url && (
                  <a
                    href={project.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
                  >
                    Visit Project <ExternalLink className="h-3 w-3" />
                  </a>
                )}

                <div className="flex gap-2 pt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(project)}
                    className="flex-1"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(project.id)}
                    className="flex-1 text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>
              {editingProject ? 'Edit Project' : 'Add New Project'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
            <div className="flex-1 overflow-y-auto pr-2 space-y-4 max-h-[calc(90vh-180px)]">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Project Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Library Management System"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Input
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="e.g., Web Application"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of the project"
                rows={3}
                required
              />
            </div>


            <div className="space-y-2">
              <Label>Project Screenshot/Photo (optional)</Label>
              
              {/* Drag and Drop Area */}
              {!formData.projectImage && !uploadedImagePreview ? (
                <div
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
                    dragActive 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-300 hover:border-blue-400 bg-gray-50'
                  }`}
                >
                  {uploading ? (
                    <div className="flex flex-col items-center gap-2">
                      <RefreshCw className="h-8 w-8 text-blue-600 animate-spin" />
                      <p className="text-xs text-gray-600">{uploadProgress || 'Uploading...'}</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <Upload className="h-8 w-8 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-1">
                          Drag and drop your image here
                        </p>
                        <p className="text-xs text-gray-500 mb-2">
                          or click to browse (PNG, JPG, WebP, SVG - Max 5MB)
                        </p>
                      </div>
                      <input
                        type="file"
                        id="file-upload"
                        className="hidden"
                        accept="image/*"
                        onChange={handleFileInput}
                        disabled={uploading}
                      />
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => document.getElementById('file-upload')?.click()}
                        disabled={uploading}
                        className="text-xs px-3 py-1"
                      >
                        <ImageIcon className="h-3 w-3 mr-1" />
                        Choose File
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                /* Preview uploaded image */
                <div className="relative border-2 border-green-300 rounded-lg overflow-hidden bg-gray-50">
                  <img
                    src={formData.projectImage || uploadedImagePreview}
                    alt="Preview"
                    className="w-full h-32 object-cover"
                  />
                  <div className="absolute top-2 right-2 flex gap-2">
                    <div className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                      <CheckCircle className="h-3 w-3" />
                      Uploaded
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      variant="destructive"
                      onClick={removeUploadedImage}
                      className="h-6 w-6 p-0"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="p-2 bg-white border-t border-gray-200">
                    <p className="text-xs text-gray-600 truncate">
                      {formData.projectImage}
                    </p>
                  </div>
                </div>
              )}

              <p className="text-xs text-gray-500">
                Recommended: 800x600px or 16:9 ratio. Max 5MB.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="url">Project URL (optional)</Label>
              <Input
                id="url"
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                placeholder="https://project-url.com"
              />
              <p className="text-xs text-gray-500">
                Website or demo link for the project (will show bookmark button)
              </p>
            </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                />
                <Label htmlFor="isActive">
                  Display on website (Active)
                </Label>
              </div>
            </div>

            {/* Fixed Footer Buttons */}
            <div className="flex-shrink-0 flex gap-3 pt-4 mt-4 border-t border-gray-200 bg-white">
              <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700">
                {editingProject ? 'Update Project' : 'Create Project'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleCloseDialog}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

