"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { DataCenterLayout } from "@/components/datacenter-layout"
import { 
  Server, 
  Users, 
  Activity, 
  TrendingUp, 
  Plus,
  Eye,
  MoreHorizontal,
  Edit,
  Trash2,
  Calendar,
  DollarSign,
  RefreshCw,
  AlertCircle,
  Network,
  FileText
} from "lucide-react"
// Project interface for client-side use
interface Project {
  id: number
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

// Start with empty projects array
const initialProjects: Project[] = []

const statusColors = {
  Active: "bg-green-100 text-green-800",
  Maintenance: "bg-yellow-100 text-yellow-800",
  Inactive: "bg-red-100 text-red-800",
  Expired: "bg-gray-100 text-gray-800"
}

export default function AdminDashboard() {
  const router = useRouter()
  const [isAuthChecking, setIsAuthChecking] = useState(true)
  const [projects, setProjects] = useState<Project[]>(initialProjects)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [clientCount, setClientCount] = useState(0)
  const [totalPortsOpen, setTotalPortsOpen] = useState(0)
  const [totalInvoices, setTotalInvoices] = useState(0)
  const [newProject, setNewProject] = useState<Partial<Project>>({
    name: "",
    category: "",
    createdDate: "",
    renewDate: "",
    clientPay: false,
    amount: 0,
    status: "Active"
  })

  const totalProjects = projects.length
  const activeProjects = projects.filter(p => p.status === "Active").length
  const totalRevenue = projects.reduce((sum, p) => sum + p.amount, 0)

  // Load projects from API
  const loadProjects = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await fetch('/api/projects', { cache: 'no-store' })
      let data: any = null
      try {
        data = await response.json()
      } catch {}
      if (!response.ok) {
        throw new Error((data && data.error) || `Failed to fetch projects (${response.status})`)
      }
      if (data && data.success) {
        setProjects(data.projects)
      } else {
        throw new Error((data && data.error) || 'Failed to load projects')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load projects')
      console.error('Error loading projects:', err)
    } finally {
      setIsLoading(false)
    }
  }

  // Load clients count from API
  const loadClients = async () => {
    try {
      const response = await fetch('/api/clients')
      if (response.ok) {
        const data = await response.json()
        setClientCount(data.length)
      }
    } catch (err) {
      console.error('Error loading clients:', err)
    }
  }

  // Load ports data from API
  const loadPorts = async () => {
    try {
      const response = await fetch('/api/ports')
      if (response.ok) {
        const data = await response.json()
        // Filter out placeholder ports (port 0)
        const validPorts = data.filter((port: any) => port.portNumber !== 0)
        setTotalPortsOpen(validPorts.length)
      }
    } catch (err) {
      console.error('Error loading ports:', err)
    }
  }

  // Load invoices count from API
  const loadInvoices = async () => {
    try {
      const response = await fetch('/api/invoices')
      if (response.ok) {
        const data = await response.json()
        setTotalInvoices(data.length)
      }
    } catch (err) {
      console.error('Error loading invoices:', err)
    }
  }

  // Check authentication on mount
  useEffect(() => {
    let isMounted = true

    const checkAuth = async () => {
      const token = localStorage.getItem('authToken')
      
      if (!token) {
        if (isMounted) {
          router.push('/admin')
        }
        return
      }

      // Verify token with backend
      try {
        const response = await fetch('/api/auth/verify', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        if (!response.ok) {
          // Token invalid or expired
          if (isMounted) {
            localStorage.removeItem('authToken')
            sessionStorage.removeItem('admin')
            router.push('/admin')
          }
          return
        }

        const data = await response.json()
        
        // Check if user has admin role
        if (data.user?.role !== 'admin') {
          if (isMounted) {
            router.push('/admin')
          }
          return
        }

        // Authentication successful
        if (isMounted) {
          setIsAuthChecking(false)
        }
      } catch (error) {
        console.error('Auth check error:', error)
        if (isMounted) {
          router.push('/admin')
        }
      }
    }

    checkAuth()

    return () => {
      isMounted = false
    }
  }, [])

  // Load projects, clients, ports, and invoices on component mount
  useEffect(() => {
    if (!isAuthChecking) {
      loadProjects()
      loadClients()
      loadPorts()
      loadInvoices()
    }
  }, [isAuthChecking])

  const handleAddProject = async () => {
    if (!newProject.name || !newProject.category || !newProject.createdDate || !newProject.renewDate) {
      alert("Please fill in all required fields (Name, Category, Created Date, Renew Date)")
      return
    }

    try {
      const projectData = {
        name: newProject.name!,
        category: newProject.category!,
        createdDate: newProject.createdDate!,
        renewDate: newProject.renewDate!,
        clientPay: newProject.clientPay || false,
        amount: newProject.amount || 0,
        status: newProject.status || "Active" as const,
        users: 0,
        uptime: "99.9%"
      }

      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(projectData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create project')
      }

      await loadProjects() // Reload projects from API

      setNewProject({
        name: "",
        category: "",
        createdDate: "",
        renewDate: "",
        clientPay: false,
        amount: 0,
        status: "Active"
      })
      setIsAddDialogOpen(false)
    } catch (err) {
      alert(`Failed to create project: ${err instanceof Error ? err.message : 'Unknown error'}`)
    }
  }

  const handleEditProject = (project: Project) => {
    setEditingProject(project)
  }

  const handleUpdateProject = async () => {
    if (!editingProject || !editingProject.id) return

    try {
      const response = await fetch(`/api/projects/${editingProject.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editingProject),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update project')
      }

      await loadProjects() // Reload projects from API
      setEditingProject(null)
    } catch (err) {
      alert(`Failed to update project: ${err instanceof Error ? err.message : 'Unknown error'}`)
    }
  }

  const handleDeleteProject = async (id: number) => {
    if (confirm("Are you sure you want to delete this project?")) {
      try {
        const response = await fetch(`/api/projects/${id}`, {
          method: 'DELETE',
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to delete project')
        }

        await loadProjects() // Reload projects from API
      } catch (err) {
        alert(`Failed to delete project: ${err instanceof Error ? err.message : 'Unknown error'}`)
      }
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  // Show loading while checking authentication
  if (isAuthChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verifying authentication...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <DataCenterLayout 
            variant="header"
            title="Dashboard"
            subtitle="Welcome to YCIS Data Center Admin Panel"
          />
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6">
          <Button 
            variant="outline" 
            onClick={() => {
              loadProjects()
              loadClients()
              loadPorts()
              loadInvoices()
            }}
            disabled={isLoading}
            className="border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg">
              <Plus className="h-4 w-4 mr-2" />
              Add New Project
            </Button>
          </DialogTrigger>
          <DialogContent className="w-[95vw] max-w-[425px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Project</DialogTitle>
              <DialogDescription>
                Create a new project with all the required details.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="sm:text-right">
                  Project Name *
                </Label>
                <Input
                  id="name"
                  value={newProject.name}
                  onChange={(e) => setNewProject({...newProject, name: e.target.value})}
                  className="sm:col-span-3"
                  placeholder="Enter project name"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
                <Label htmlFor="category" className="sm:text-right">
                  Category *
                </Label>
                <Select value={newProject.category} onValueChange={(value) => setNewProject({...newProject, category: value})}>
                  <SelectTrigger className="sm:col-span-3">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Web Hosting">Web Hosting</SelectItem>
                    <SelectItem value="VPS Hosting">VPS Hosting</SelectItem>
                    <SelectItem value="Database Hosting">Database Hosting</SelectItem>
                    <SelectItem value="Domain & Email">Domain & Email</SelectItem>
                    <SelectItem value="Cloud Services">Cloud Services</SelectItem>
                    <SelectItem value="Development">Development</SelectItem>
                    <SelectItem value="Maintenance">Maintenance</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
                <Label htmlFor="createdDate" className="sm:text-right">
                  Created Date *
                </Label>
                <Input
                  id="createdDate"
                  type="date"
                  value={newProject.createdDate}
                  onChange={(e) => setNewProject({...newProject, createdDate: e.target.value})}
                  className="sm:col-span-3"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
                <Label htmlFor="renewDate" className="sm:text-right">
                  Renew Date *
                </Label>
                <Input
                  id="renewDate"
                  type="date"
                  value={newProject.renewDate}
                  onChange={(e) => setNewProject({...newProject, renewDate: e.target.value})}
                  className="sm:col-span-3"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
                <Label htmlFor="amount" className="sm:text-right">
                  Amount
                </Label>
                <Input
                  id="amount"
                  type="number"
                  value={newProject.amount}
                  onChange={(e) => setNewProject({...newProject, amount: Number(e.target.value)})}
                  className="sm:col-span-3"
                  placeholder="Enter amount"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
                <Label htmlFor="status" className="sm:text-right">
                  Status
                </Label>
                <Select value={newProject.status} onValueChange={(value: any) => setNewProject({...newProject, status: value})}>
                  <SelectTrigger className="sm:col-span-3">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                    <SelectItem value="Maintenance">Maintenance</SelectItem>
                    <SelectItem value="Expired">Expired</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
                <Label htmlFor="clientPay" className="sm:text-right">
                  Client Pay
                </Label>
                <div className="sm:col-span-3 flex items-center space-x-2">
                  <Switch
                    id="clientPay"
                    checked={newProject.clientPay}
                    onCheckedChange={(checked) => setNewProject({...newProject, clientPay: checked})}
                  />
                  <Label htmlFor="clientPay" className="text-sm">
                    {newProject.clientPay ? "Yes" : "No"}
                  </Label>
                </div>
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddProject}>
                Add Project
              </Button>
            </div>
          </DialogContent>
        </Dialog>
        </div>

        {/* Error Display */}
        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              <strong>Error:</strong> {error}
              <Button 
                variant="outline" 
                size="sm" 
                onClick={loadProjects}
                className="ml-2"
              >
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-8">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2" />
            <p className="text-gray-500">Loading projects from database...</p>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <Card className="bg-white border-0 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4">
            <CardTitle className="text-xs sm:text-sm font-bold text-gray-800">Total Projects</CardTitle>
            <div className="p-2 bg-blue-900 rounded-lg shadow-lg">
              <Server className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-xl sm:text-2xl font-bold text-blue-900">{totalProjects}</div>
            <p className="text-xs text-gray-600 mt-1 font-medium">
              +{activeProjects} active projects
            </p>
          </CardContent>
        </Card>

          <Card className="bg-white border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4">
              <CardTitle className="text-xs sm:text-sm font-bold text-gray-800">Total Clients</CardTitle>
              <div className="p-2 bg-green-600 rounded-lg shadow-lg">
                <Users className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="text-xl sm:text-2xl font-bold text-green-600">{clientCount.toLocaleString()}</div>
              <p className="text-xs text-gray-600 mt-1 font-medium">
                Registered clients
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4">
              <CardTitle className="text-xs sm:text-sm font-bold text-gray-800">Total Revenue</CardTitle>
              <div className="p-2 bg-yellow-600 rounded-lg shadow-lg">
                <TrendingUp className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="text-xl sm:text-2xl font-bold text-yellow-600">{formatCurrency(totalRevenue)}</div>
              <p className="text-xs text-gray-600 mt-1 font-medium">
                +10% from last month
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4">
              <CardTitle className="text-xs sm:text-sm font-bold text-gray-800">Total Ports Open</CardTitle>
              <div className="p-2 bg-purple-600 rounded-lg shadow-lg">
                <Network className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="text-xl sm:text-2xl font-bold text-purple-600">{totalPortsOpen}</div>
              <p className="text-xs text-gray-600 mt-1 font-medium">
                Open ports across VMs
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4">
              <CardTitle className="text-xs sm:text-sm font-bold text-gray-800">Total Invoices</CardTitle>
              <div className="p-2 bg-orange-600 rounded-lg shadow-lg">
                <FileText className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="text-xl sm:text-2xl font-bold text-orange-600">{totalInvoices}</div>
              <p className="text-xs text-gray-600 mt-1 font-medium">
                Total invoices created
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Projects Table */}
        <Card className="bg-white border-0 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-slate-700 via-slate-800 to-slate-900 text-white rounded-t-xl p-4">
          <CardTitle className="text-lg font-bold">All Projects</CardTitle>
          <CardDescription className="text-slate-300 text-sm">Manage and view all your projects with complete details</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-slate-100 to-slate-200">
                <tr className="border-b border-slate-300">
                  <th className="text-left py-3 px-4 font-bold text-slate-800 text-sm">Project Name</th>
                  <th className="text-left py-3 px-4 font-bold text-slate-800 text-sm">Category</th>
                  <th className="text-left py-3 px-4 font-bold text-slate-800 text-sm">Created Date</th>
                  <th className="text-left py-3 px-4 font-bold text-slate-800 text-sm">Renew Date</th>
                  <th className="text-left py-3 px-4 font-bold text-slate-800 text-sm">Client Pay</th>
                  <th className="text-left py-3 px-4 font-bold text-slate-800 text-sm">Amount</th>
                  <th className="text-left py-3 px-4 font-bold text-slate-800 text-sm">Status</th>
                  <th className="text-left py-3 px-4 font-bold text-slate-800 text-sm">Actions</th>
                </tr>
              </thead>
              <tbody>
                {projects.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 px-6 text-center">
                      <div className="flex flex-col items-center space-y-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl flex items-center justify-center shadow-lg">
                          <Server className="h-8 w-8 text-indigo-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-slate-800">No projects yet</h3>
                          <p className="text-slate-600 text-sm mt-1">Get started by adding your first project</p>
                        </div>
                        <Button 
                          onClick={() => setIsAddDialogOpen(true)}
                          className="flex items-center space-x-2 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 text-white shadow-xl px-6 py-2 text-sm font-semibold rounded-xl transition-all duration-200 transform hover:scale-105"
                        >
                          <Plus className="h-4 w-4" />
                          <span>Add Your First Project</span>
                        </Button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  projects.map((project, index) => (
                    <tr key={project.id} className={`border-b border-slate-200 hover:bg-gradient-to-r hover:from-slate-50 hover:to-white transition-all duration-200 ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}`}>
                      <td className="py-3 px-4 font-bold text-slate-800 text-sm">{project.name}</td>
                      <td className="py-3 px-4">
                        <Badge variant="outline" className="border-indigo-200 text-indigo-800 bg-indigo-50 px-2 py-1 text-xs font-semibold">{project.category}</Badge>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-indigo-500" />
                          <span className="text-slate-800 font-medium text-xs">{formatDate(project.createdDate)}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-indigo-500" />
                          <span className="text-slate-800 font-medium text-xs">{formatDate(project.renewDate)}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge 
                          className={`px-2 py-1 text-xs font-semibold ${project.clientPay 
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-200' 
                            : 'bg-slate-100 text-slate-800 border-slate-200'
                          }`}
                        >
                          {project.clientPay ? "Yes" : "No"}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          <DollarSign className="h-4 w-4 text-emerald-500" />
                          <span className="font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent text-sm">{formatCurrency(project.amount)}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge className={`px-2 py-1 text-xs font-semibold ${statusColors[project.status as keyof typeof statusColors]} border-0 shadow-lg`}>
                          {project.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleEditProject(project)}
                            className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-100 p-2 rounded-lg transition-all duration-200 h-8 w-8"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => project.id && handleDeleteProject(project.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-100 p-2 rounded-lg transition-all duration-200 h-8 w-8"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Edit Project Dialog */}
      <Dialog open={!!editingProject} onOpenChange={() => setEditingProject(null)}>
        <DialogContent className="w-[95vw] max-w-[425px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Project</DialogTitle>
            <DialogDescription>
              Update the project details.
            </DialogDescription>
          </DialogHeader>
          {editingProject && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-name" className="text-right">
                  Project Name *
                </Label>
                <Input
                  id="edit-name"
                  value={editingProject.name}
                  onChange={(e) => setEditingProject({...editingProject, name: e.target.value})}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-category" className="text-right">
                  Category *
                </Label>
                <Select value={editingProject.category} onValueChange={(value) => setEditingProject({...editingProject, category: value})}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Web Hosting">Web Hosting</SelectItem>
                    <SelectItem value="VPS Hosting">VPS Hosting</SelectItem>
                    <SelectItem value="Database Hosting">Database Hosting</SelectItem>
                    <SelectItem value="Domain & Email">Domain & Email</SelectItem>
                    <SelectItem value="Cloud Services">Cloud Services</SelectItem>
                    <SelectItem value="Development">Development</SelectItem>
                    <SelectItem value="Maintenance">Maintenance</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-createdDate" className="text-right">
                  Created Date *
                </Label>
                <Input
                  id="edit-createdDate"
                  type="date"
                  value={editingProject.createdDate}
                  onChange={(e) => setEditingProject({...editingProject, createdDate: e.target.value})}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-renewDate" className="text-right">
                  Renew Date *
                </Label>
                <Input
                  id="edit-renewDate"
                  type="date"
                  value={editingProject.renewDate}
                  onChange={(e) => setEditingProject({...editingProject, renewDate: e.target.value})}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-amount" className="text-right">
                  Amount
                </Label>
                <Input
                  id="edit-amount"
                  type="number"
                  value={editingProject.amount}
                  onChange={(e) => setEditingProject({...editingProject, amount: Number(e.target.value)})}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-status" className="text-right">
                  Status
                </Label>
                <Select value={editingProject.status} onValueChange={(value: any) => setEditingProject({...editingProject, status: value})}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                    <SelectItem value="Maintenance">Maintenance</SelectItem>
                    <SelectItem value="Expired">Expired</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-clientPay" className="text-right">
                  Client Pay
                </Label>
                <div className="col-span-3 flex items-center space-x-2">
                  <Switch
                    id="edit-clientPay"
                    checked={editingProject.clientPay}
                    onCheckedChange={(checked) => setEditingProject({...editingProject, clientPay: checked})}
                  />
                  <Label htmlFor="edit-clientPay" className="text-sm">
                    {editingProject.clientPay ? "Yes" : "No"}
                  </Label>
                </div>
              </div>
            </div>
          )}
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setEditingProject(null)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateProject}>
              Update Project
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      </div>
    </div>
  )
}
