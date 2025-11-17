"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { Plus, Search, Folder, RefreshCw, Server } from "lucide-react"
import ProjectCard from "./ProjectCard"
import ProjectForm from "./ProjectForm"

// Project interface
export interface Project {
  id?: number
  name: string
  category: string
  createdDate: string
  renewDate: string
  clientPay: boolean
  amount: number
  status: "Active" | "Inactive" | "Maintenance" | "Expired"
  users?: number
  uptime?: string
}

const categories = [
  "Web Hosting",
  "VPS Hosting",
  "Database Hosting",
  "Domain & Email",
  "Cloud Services",
  "Development",
  "Maintenance",
  "Other"
]

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>("All")
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadProjects = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const res = await fetch("/api/projects", { cache: "no-store" })
      let data: any = null
      try {
        data = await res.json()
      } catch {}
      if (!res.ok) {
        throw new Error((data && data.error) || `Failed to fetch projects (${res.status})`)
      }
      if (data && data.success) setProjects(data.projects)
      else throw new Error((data && data.error) || "Failed to load projects")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { loadProjects() }, [])

  // Filter projects
  const filteredProjects = projects.filter(project => {
    const matchesCategory = selectedCategory === "All" || project.category === selectedCategory
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          project.category.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const uniqueCategories = ["All", ...Array.from(new Set(projects.map(p => p.category)))]

  return (
    <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
      {/* Sidebar */}
      <div className="w-full lg:w-64 bg-white rounded-lg shadow-sm p-4 h-fit">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
          <Folder className="h-5 w-5 mr-2" /> Categories
        </h3>
        <div className="grid grid-cols-2 lg:grid-cols-1 gap-2 lg:space-y-2 lg:gap-0">
          {uniqueCategories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                selectedCategory === category
                  ? "bg-blue-100 text-blue-700 font-medium"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <span className="truncate">{category}</span>
              {category !== "All" && (
                <span className="ml-2 text-xs text-gray-400">
                  ({projects.filter(p => p.category === category).length})
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Projects</h1>
            <p className="text-gray-600 mt-1 text-sm sm:text-base">
              {selectedCategory === "All"
                ? `All projects (${projects.length})`
                : `${selectedCategory} projects (${filteredProjects.length})`}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={loadProjects}
              disabled={isLoading}
              className="flex items-center space-x-2"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">Refresh</span>
            </Button>

            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center space-x-2 w-full sm:w-auto">
                  <Plus className="h-4 w-4" />
                  <span className="hidden sm:inline">Add New Project</span>
                  <span className="sm:hidden">Add Project</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="w-[95vw] max-w-[425px] max-h-[90vh] overflow-y-auto">
                <ProjectForm
                  categories={categories}
                  onClose={() => setIsAddDialogOpen(false)}
                  onSuccess={loadProjects}
                />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <div className="mt-2 text-sm text-red-700">{error}</div>
                <div className="mt-4">
                  <Button variant="outline" size="sm" onClick={loadProjects}>Retry</Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Loading */}
        {isLoading && (
          <div className="text-center py-8">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2" />
            <p className="text-gray-500">Loading projects...</p>
          </div>
        )}

        {/* Search */}
        <div className="flex items-center space-x-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search projects..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Projects Grid */}
        {filteredProjects.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <Server className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm ? "No projects found" : "No projects in this category"}
            </h3>
            <p className="text-gray-500 mb-4">
              {searchTerm ? `No projects match "${searchTerm}"` : `No projects found in ${selectedCategory} category`}
            </p>
            {!searchTerm && (
              <Button onClick={() => setIsAddDialogOpen(true)}>Add Your First Project</Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {filteredProjects.map(project => (
              <ProjectCard
                key={project.id}
                project={project}
                onUpdated={loadProjects}
                onEdit={() => setEditingProject(project)}
              />
            ))}
          </div>
        )}

        {/* Edit Project Dialog */}
        {editingProject && (
          <Dialog open={!!editingProject} onOpenChange={() => setEditingProject(null)}>
            <DialogContent className="w-[95vw] max-w-[425px] max-h-[90vh] overflow-y-auto">
              <ProjectForm
                categories={categories}
                project={editingProject}
                onClose={() => setEditingProject(null)}
                onSuccess={loadProjects}
              />
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  )
}
