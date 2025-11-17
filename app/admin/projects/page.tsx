"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { Plus, Search, Folder, RefreshCw, Server } from "lucide-react"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import { DataCenterLayout } from "@/components/datacenter-layout"
import ProjectCard from "./ProjectCard"
import ProjectForm from "./ProjectForm"

// Project interface
export interface Project {
  id?: number
  name: string
  category: string
  createdDate: string
  renewDate: string
  clientEmail?: string
  clientEmails?: string[] // Array of client emails for multiple clients
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

  const handleEdit = (project: Project) => {
    setEditingProject(project)
    setIsAddDialogOpen(true)
  }

  // Filter projects
  const filteredProjects = projects.filter(project => {
    const matchesCategory = selectedCategory === "All" || project.category === selectedCategory
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          project.category.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const uniqueCategories = ["All", ...Array.from(new Set(projects.map(p => p.category)))]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <DataCenterLayout 
            variant="header"
            title="Projects Management"
            subtitle="Manage and organize your data center projects"
          />
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <Button 
            variant="outline" 
            onClick={loadProjects}
            disabled={isLoading}
            className="flex items-center space-x-2 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg">
                <Plus className="h-4 w-4 mr-2" />
                <span>Add New Project</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="w-[95vw] max-w-2xl max-h-[90vh] overflow-y-auto">
              <ProjectForm 
                categories={categories}
                project={editingProject}
                onClose={() => {
                  setIsAddDialogOpen(false)
                  setEditingProject(null)
                }}
                onSuccess={loadProjects}
              />
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar */}
          <div className="w-full lg:w-80 bg-white rounded-lg shadow-lg border-0 p-8 h-fit">
          <h3 className="font-bold text-gray-800 mb-8 flex items-center text-xl">
            <Folder className="h-7 w-7 mr-4 text-blue-900" /> Categories
          </h3>
          <div className="grid grid-cols-2 lg:grid-cols-1 gap-4">
            {uniqueCategories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`w-full text-left px-5 py-4 rounded-lg text-sm transition-all duration-300 ${
                  selectedCategory === category
                    ? "bg-blue-900 text-white font-bold shadow-lg transform scale-105"
                    : "text-gray-700 hover:bg-gray-100 hover:text-blue-900 border border-gray-200 hover:border-gray-300 font-semibold"
                }`}
              >
                <span className="truncate block text-lg">{category}</span>
                {category !== "All" && (
                  <span className="text-xs opacity-75 mt-1 block">
                    ({projects.filter(p => p.category === category).length} projects)
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

          {/* Main Content */}
          <div className="flex-1 space-y-8">
            {/* Project Stats */}
            <div className="bg-white rounded-lg shadow-lg border-0 p-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">
                {selectedCategory === "All"
                  ? `All Projects (${projects.length})`
                  : `${selectedCategory} Projects (${filteredProjects.length})`}
              </h2>
              <p className="text-gray-600 mt-2 text-lg">
                {selectedCategory === "All"
                  ? "Viewing all your data center projects"
                  : `Filtered by ${selectedCategory.toLowerCase()} category`}
              </p>
            </div>
            <div className="flex items-center space-x-6">
              <div className="text-right">
                <div className="text-3xl font-bold text-blue-900">{filteredProjects.length}</div>
                <div className="text-sm text-gray-600 font-semibold">Active Projects</div>
              </div>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border-2 border-red-200 rounded-lg p-8 shadow-lg">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <Server className="h-6 w-6 text-red-600" />
                </div>
              </div>
              <div className="ml-6 flex-1">
                <h3 className="text-xl font-bold text-red-800">Error Loading Projects</h3>
                <div className="mt-3 text-red-700">{error}</div>
                <div className="mt-6">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={loadProjects}
                    className="border-red-200 text-red-700 hover:bg-red-50 hover:border-red-300 px-6 py-2 font-semibold"
                  >Retry</Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Loading */}
        {isLoading && (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-6">
              <RefreshCw className="h-10 w-10 animate-spin text-blue-900" />
            </div>
            <p className="text-gray-600 font-semibold text-lg">Loading projects...</p>
            <p className="text-gray-500 text-sm mt-2">Please wait while we fetch your data</p>
          </div>
        )}

        {/* Search */}
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-8">
          <div className="flex items-center space-x-8">
            <div className="relative flex-1 max-w-lg">
              <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 text-blue-900 h-6 w-6" />
              <Input
                placeholder="Search projects by name or category..."
                className="pl-14 h-14 border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-lg text-lg"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="bg-blue-100 px-6 py-3 rounded-lg">
              <span className="text-gray-800 font-bold text-lg">
                Showing {filteredProjects.length} of {projects.length} projects
              </span>
            </div>
          </div>
        </div>

        {/* Projects Grid/Slider */}
        {filteredProjects.length === 0 ? (
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-16 text-center">
            <div className="w-24 h-24 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-8">
              <Server className="h-12 w-12 text-blue-900" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-4">
              {searchTerm ? "No projects found" : "No projects in this category"}
            </h3>
            <p className="text-gray-600 mb-8 text-lg">
              {searchTerm ? `No projects match "${searchTerm}"` : `No projects found in ${selectedCategory} category`}
            </p>
            {!searchTerm && (
              <Button 
                onClick={() => setIsAddDialogOpen(true)}
                className="bg-blue-900 hover:bg-blue-800 text-white shadow-lg px-8 py-4 text-lg font-semibold rounded-lg transition-all duration-200 transform hover:scale-105"
              >Add Your First Project</Button>
            )}
          </div>
        ) : (
          <>
            {/* Mobile Slider View */}
            <div className="block sm:hidden">
              <Carousel 
                opts={{
                  align: "start",
                  loop: true,
                }}
                className="w-full"
              >
                <CarouselContent>
                  {filteredProjects.map(project => (
                    <CarouselItem key={project.id}>
                      <div className="p-1">
                        <ProjectCard
                          project={project}
                          onUpdated={loadProjects}
                          onEdit={() => handleEdit(project)}
                        />
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="left-2" />
                <CarouselNext className="right-2" />
              </Carousel>
            </div>

            {/* Desktop Grid View */}
            <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredProjects.map(project => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onUpdated={loadProjects}
                  onEdit={() => handleEdit(project)}
                />
              ))}
            </div>
          </>
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
      </div>
    </div>
  )
}