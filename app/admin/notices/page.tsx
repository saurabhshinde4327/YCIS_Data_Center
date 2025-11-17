"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { DataCenterLayout } from "@/components/datacenter-layout"
import { 
  Bell, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Pin, 
  Clock, 
  AlertTriangle,
  Info,
  CheckCircle,
  XCircle,
  Calendar,
  Filter,
  Search,
  AlertCircle as AlertCircleIcon
} from "lucide-react"

interface Notice {
  id: string
  title: string
  content: string
  type: 'announcement' | 'maintenance' | 'urgent' | 'update' | 'reminder'
  priority: 'low' | 'medium' | 'high' | 'critical'
  status: 'active' | 'expired' | 'draft'
  createdAt: string
  expiresAt?: string
  isPinned: boolean
  author: string
  tags: string[]
}

export default function NoticesPage() {
  const [notices, setNotices] = useState<Notice[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState<string>("all")
  const [filterPriority, setFilterPriority] = useState<string>("all")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingNotice, setEditingNotice] = useState<Notice | null>(null)
  const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null)
  const [newNotice, setNewNotice] = useState<Partial<Notice>>({
    title: "",
    content: "",
    type: "announcement",
    priority: "medium",
    status: "active",
    isPinned: false,
    author: "Admin",
    tags: []
  })

  // Database functions
  const fetchNotices = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/notices')
      if (!response.ok) {
        throw new Error('Failed to fetch notices')
      }
      const data = await response.json()
      setNotices(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      console.error('Error fetching notices:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const createNotice = async (notice: Omit<Notice, 'id' | 'createdAt'>) => {
    try {
      const response = await fetch('/api/notices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(notice),
      })
      
      if (!response.ok) {
        throw new Error('Failed to create notice')
      }
      
      const newNotice = await response.json()
      setNotices(prev => [newNotice, ...prev])
      return newNotice
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create notice')
      throw err
    }
  }

  const updateNotice = async (id: string, notice: Partial<Notice>) => {
    try {
      const response = await fetch(`/api/notices/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(notice),
      })
      
      if (!response.ok) {
        throw new Error('Failed to update notice')
      }
      
      const updatedNotice = await response.json()
      setNotices(prev => prev.map(n => n.id === id ? updatedNotice : n))
      return updatedNotice
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update notice')
      throw err
    }
  }

  const deleteNotice = async (id: string) => {
    try {
      const response = await fetch(`/api/notices/${id}`, {
        method: 'DELETE',
      })
      
      if (!response.ok) {
        throw new Error('Failed to delete notice')
      }
      
      setNotices(prev => prev.filter(n => n.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete notice')
      throw err
    }
  }

  // Load notices on component mount
  React.useEffect(() => {
    fetchNotices()
  }, [])

  // Filter notices
  const filteredNotices = notices.filter(notice => {
    const matchesSearch = notice.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notice.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notice.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesType = filterType === "all" || notice.type === filterType
    const matchesPriority = filterPriority === "all" || notice.priority === filterPriority
    
    return matchesSearch && matchesType && matchesPriority
  })

  // Sort notices (pinned first, then by priority, then by date)
  const sortedNotices = filteredNotices.sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1
    if (!a.isPinned && b.isPinned) return 1
    
    const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 }
    const aPriority = priorityOrder[a.priority as keyof typeof priorityOrder]
    const bPriority = priorityOrder[b.priority as keyof typeof priorityOrder]
    
    if (aPriority !== bPriority) return bPriority - aPriority
    
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })

  // Get priority color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-600'
      case 'high': return 'bg-orange-500'
      case 'medium': return 'bg-yellow-500'
      case 'low': return 'bg-green-500'
      default: return 'bg-gray-500'
    }
  }

  // Get type icon
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'announcement': return <Bell className="h-4 w-4" />
      case 'maintenance': return <AlertTriangle className="h-4 w-4" />
      case 'urgent': return <XCircle className="h-4 w-4" />
      case 'update': return <CheckCircle className="h-4 w-4" />
      case 'reminder': return <Clock className="h-4 w-4" />
      default: return <Info className="h-4 w-4" />
    }
  }

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'expired': return 'bg-red-100 text-red-800'
      case 'draft': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  // Add notice
  const handleAddNotice = async () => {
    if (newNotice.title && newNotice.content) {
      try {
        const noticeData = {
          title: newNotice.title!,
          content: newNotice.content!,
          type: newNotice.type || "announcement",
          priority: newNotice.priority || "medium",
          status: newNotice.status || "active",
          expiresAt: newNotice.expiresAt,
          isPinned: newNotice.isPinned || false,
          author: newNotice.author || "Admin",
          tags: newNotice.tags || []
        }
        
        await createNotice(noticeData)
        setNewNotice({
          title: "",
          content: "",
          type: "announcement",
          priority: "medium",
          status: "active",
          isPinned: false,
          author: "Admin",
          tags: []
        })
        setIsAddDialogOpen(false)
        setSuccessMessage("Notice created successfully!")
        setTimeout(() => setSuccessMessage(null), 3000)
      } catch (error) {
        console.error('Error adding notice:', error)
      }
    }
  }

  // Edit notice
  const handleEditNotice = async () => {
    if (editingNotice) {
      try {
        await updateNotice(editingNotice.id, editingNotice)
        setEditingNotice(null)
        setSuccessMessage("Notice updated successfully!")
        setTimeout(() => setSuccessMessage(null), 3000)
      } catch (error) {
        console.error('Error updating notice:', error)
      }
    }
  }

  // Delete notice
  const handleDeleteNotice = async (id: string) => {
    try {
      await deleteNotice(id)
    } catch (error) {
      console.error('Error deleting notice:', error)
    }
  }

  // Toggle pin status
  const togglePinStatus = async (id: string) => {
    const notice = notices.find(n => n.id === id)
    if (notice) {
      try {
        await updateNotice(id, { isPinned: !notice.isPinned })
      } catch (error) {
        console.error('Error toggling pin status:', error)
      }
    }
  }

  // Get statistics
  const getStats = () => {
    return {
      total: notices.length,
      active: notices.filter(n => n.status === 'active').length,
      pinned: notices.filter(n => n.isPinned).length,
      critical: notices.filter(n => n.priority === 'critical').length
    }
  }

  const stats = getStats()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <DataCenterLayout 
            variant="header"
            title="Notices & Announcements"
            subtitle="Stay updated with important notices and system announcements"
          />
        </div>

        <div className="flex justify-end mb-6">
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg">
              <Plus className="h-4 w-4 mr-2" />
              Add Notice
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Notice</DialogTitle>
              <DialogDescription>
                Add a new notice or announcement for the team.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="notice-title">Title</Label>
                <Input
                  id="notice-title"
                  value={newNotice.title}
                  onChange={(e) => setNewNotice({...newNotice, title: e.target.value})}
                  placeholder="Enter notice title"
                />
              </div>
              <div>
                <Label htmlFor="notice-content">Content</Label>
                <Textarea
                  id="notice-content"
                  value={newNotice.content}
                  onChange={(e) => setNewNotice({...newNotice, content: e.target.value})}
                  placeholder="Enter notice content"
                  rows={6}
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="notice-type">Type</Label>
                  <Select value={newNotice.type} onValueChange={(value: any) => setNewNotice({...newNotice, type: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="announcement">Announcement</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                      <SelectItem value="update">Update</SelectItem>
                      <SelectItem value="reminder">Reminder</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="notice-priority">Priority</Label>
                  <Select value={newNotice.priority} onValueChange={(value: any) => setNewNotice({...newNotice, priority: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddNotice}>
                Create Notice
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert className="mb-6 border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            {error}
          </AlertDescription>
        </Alert>
      )}

      {/* Success Alert */}
      {successMessage && (
        <Alert className="mb-6 border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            {successMessage}
          </AlertDescription>
        </Alert>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="bg-white border-gray-200 shadow-lg">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Notices</p>
                <p className="text-2xl font-bold text-blue-900">{stats.total}</p>
              </div>
              <Bell className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white border-gray-200 shadow-lg">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active</p>
                <p className="text-2xl font-bold text-green-600">{stats.active}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white border-gray-200 shadow-lg">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pinned</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pinned}</p>
              </div>
              <Pin className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white border-gray-200 shadow-lg">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Critical</p>
                <p className="text-2xl font-bold text-red-600">{stats.critical}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="mb-6">
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search notices..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="announcement">Announcement</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                  <SelectItem value="update">Update</SelectItem>
                  <SelectItem value="reminder">Reminder</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterPriority} onValueChange={setFilterPriority}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notices List */}
      <div className="space-y-4">
        {isLoading ? (
          <Card>
            <CardContent className="p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900 mx-auto mb-4"></div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Loading Notices</h3>
              <p className="text-gray-600">Please wait while we fetch the notices...</p>
            </CardContent>
          </Card>
        ) : sortedNotices.length > 0 ? (
          sortedNotices.map(notice => (
            <Card key={notice.id} className={`transition-all duration-200 hover:shadow-lg ${notice.isPinned ? 'border-l-4 border-l-blue-500 bg-blue-50' : ''}`}>
              <CardContent className="p-3 sm:p-4 md:p-6">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:space-x-3 flex-1 space-y-2 sm:space-y-0">
                    <div className="flex items-center space-x-2">
                      {notice.isPinned && <Pin className="h-4 w-4 text-blue-500" />}
                      {getTypeIcon(notice.type)}
                      <div className={`w-3 h-3 rounded-full ${getPriorityColor(notice.priority)}`}></div>
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900">{notice.title}</h3>
                        <Badge className={getPriorityColor(notice.priority) + " text-xs"}>
                          {notice.priority}
                        </Badge>
                        <Badge variant="outline" className={getStatusColor(notice.status) + " text-xs"}>
                          {notice.status}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {notice.type}
                        </Badge>
                      </div>
                      <p className="text-gray-600 mb-3 line-clamp-2">
                        {notice.content}
                      </p>
                      <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-500">
                        <span>By: {notice.author}</span>
                        <span className="hidden sm:inline">•</span>
                        <span>{new Date(notice.createdAt).toLocaleDateString()}</span>
                      </div>
                      {notice.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {notice.tags.map(tag => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 mt-2 sm:mt-0 sm:ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedNotice(notice)}
                      className="flex-shrink-0"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => togglePinStatus(notice.id)}
                      className="flex-shrink-0"
                    >
                      <Pin className={`h-4 w-4 ${notice.isPinned ? 'text-blue-500' : ''}`} />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingNotice(notice)}
                      className="flex-shrink-0"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteNotice(notice.id)}
                      className="flex-shrink-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No notices found</h3>
              <p className="text-gray-600">No notices match your current filters.</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Notice Detail Dialog */}
      {selectedNotice && (
        <Dialog open={!!selectedNotice} onOpenChange={() => setSelectedNotice(null)}>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                {getTypeIcon(selectedNotice.type)}
                <span>{selectedNotice.title}</span>
              </DialogTitle>
              <DialogDescription>
                <div className="flex items-center space-x-4 mt-2">
                  <Badge className={getPriorityColor(selectedNotice.priority)}>
                    {selectedNotice.priority}
                  </Badge>
                  <Badge variant="outline" className={getStatusColor(selectedNotice.status)}>
                    {selectedNotice.status}
                  </Badge>
                  <Badge variant="secondary">
                    {selectedNotice.type}
                  </Badge>
                </div>
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Content</h4>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-700 whitespace-pre-wrap">{selectedNotice.content}</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-semibold text-gray-900">Author:</span>
                  <span className="ml-2 text-gray-600">{selectedNotice.author}</span>
                </div>
                <div>
                  <span className="font-semibold text-gray-900">Created:</span>
                  <span className="ml-2 text-gray-600">{new Date(selectedNotice.createdAt).toLocaleDateString()}</span>
                </div>
                <div>
                  <span className="font-semibold text-gray-900">Pinned:</span>
                  <span className="ml-2 text-gray-600">{selectedNotice.isPinned ? 'Yes' : 'No'}</span>
                </div>
              </div>
              {selectedNotice.tags.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Tags</h4>
                  <div className="flex flex-wrap gap-1">
                    {selectedNotice.tags.map(tag => (
                      <Badge key={tag} variant="outline">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectedNotice(null)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Edit Notice Dialog */}
      {editingNotice && (
        <Dialog open={!!editingNotice} onOpenChange={() => setEditingNotice(null)}>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Notice</DialogTitle>
              <DialogDescription>
                Update the notice details.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-notice-title">Title</Label>
                <Input
                  id="edit-notice-title"
                  value={editingNotice.title}
                  onChange={(e) => setEditingNotice({...editingNotice, title: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="edit-notice-content">Content</Label>
                <Textarea
                  id="edit-notice-content"
                  value={editingNotice.content}
                  onChange={(e) => setEditingNotice({...editingNotice, content: e.target.value})}
                  rows={6}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-notice-type">Type</Label>
                  <Select value={editingNotice.type} onValueChange={(value: any) => setEditingNotice({...editingNotice, type: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="announcement">Announcement</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                      <SelectItem value="update">Update</SelectItem>
                      <SelectItem value="reminder">Reminder</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="edit-notice-priority">Priority</Label>
                  <Select value={editingNotice.priority} onValueChange={(value: any) => setEditingNotice({...editingNotice, priority: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingNotice(null)}>
                Cancel
              </Button>
              <Button onClick={handleEditNotice}>
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      </div>
    </div>
  )
}
