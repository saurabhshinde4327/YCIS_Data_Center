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
import { 
  Calendar, 
  Plus, 
  Clock, 
  Bell, 
  Edit, 
  Trash2, 
  ChevronLeft, 
  ChevronRight,
  AlertCircle,
  CheckCircle,
  Info
} from "lucide-react"

interface Reminder {
  id: string
  title: string
  description: string
  date: string
  time: string
  priority: 'low' | 'medium' | 'high'
  status: 'pending' | 'completed'
  type: 'meeting' | 'deadline' | 'reminder' | 'event'
}

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<string>("")
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null)
  const [newReminder, setNewReminder] = useState<Partial<Reminder>>({
    title: "",
    description: "",
    date: "",
    time: "",
    priority: "medium",
    type: "reminder"
  })

  // Database functions
  const fetchReminders = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/reminders')
      if (!response.ok) {
        throw new Error('Failed to fetch reminders')
      }
      const data = await response.json()
      setReminders(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      console.error('Error fetching reminders:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const createReminder = async (reminder: Omit<Reminder, 'id'>) => {
    try {
      const response = await fetch('/api/reminders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reminder),
      })
      
      if (!response.ok) {
        throw new Error('Failed to create reminder')
      }
      
      const newReminder = await response.json()
      setReminders(prev => [newReminder, ...prev])
      return newReminder
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create reminder')
      throw err
    }
  }

  const updateReminder = async (id: string, reminder: Partial<Reminder>) => {
    try {
      const response = await fetch(`/api/reminders/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reminder),
      })
      
      if (!response.ok) {
        throw new Error('Failed to update reminder')
      }
      
      const updatedReminder = await response.json()
      setReminders(prev => prev.map(r => r.id === id ? updatedReminder : r))
      return updatedReminder
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update reminder')
      throw err
    }
  }

  const deleteReminder = async (id: string) => {
    try {
      const response = await fetch(`/api/reminders/${id}`, {
        method: 'DELETE',
      })
      
      if (!response.ok) {
        throw new Error('Failed to delete reminder')
      }
      
      setReminders(prev => prev.filter(r => r.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete reminder')
      throw err
    }
  }

  // Load reminders on component mount
  React.useEffect(() => {
    fetchReminders()
  }, [])

  // Calendar navigation
  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate)
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1)
    } else {
      newDate.setMonth(newDate.getMonth() + 1)
    }
    setCurrentDate(newDate)
  }

  // Generate calendar days
  const generateCalendarDays = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startDate = new Date(firstDay)
    startDate.setDate(startDate.getDate() - firstDay.getDay())
    
    const days = []
    const current = new Date(startDate)
    
    for (let i = 0; i < 42; i++) {
      days.push(new Date(current))
      current.setDate(current.getDate() + 1)
    }
    
    return days
  }

  // Check if date has reminders
  const getDateReminders = (date: Date) => {
    const dateString = date.toISOString().split('T')[0]
    return reminders.filter(reminder => reminder.date === dateString)
  }

  // Get priority color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500'
      case 'medium': return 'bg-yellow-500'
      case 'low': return 'bg-green-500'
      default: return 'bg-gray-500'
    }
  }

  // Get reminder type color
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'meeting': return 'bg-blue-500'
      case 'deadline': return 'bg-red-600'
      case 'reminder': return 'bg-purple-500'
      case 'event': return 'bg-green-600'
      default: return 'bg-gray-500'
    }
  }

  // Get reminder type background color (lighter)
  const getTypeBgColor = (type: string) => {
    switch (type) {
      case 'meeting': return 'bg-blue-50 border-blue-200'
      case 'deadline': return 'bg-red-50 border-red-200'
      case 'reminder': return 'bg-purple-50 border-purple-200'
      case 'event': return 'bg-green-50 border-green-200'
      default: return 'bg-gray-50 border-gray-200'
    }
  }

  // Get type icon
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'meeting': return <Calendar className="h-3 w-3" />
      case 'deadline': return <AlertCircle className="h-3 w-3" />
      case 'reminder': return <Bell className="h-3 w-3" />
      case 'event': return <Info className="h-3 w-3" />
      default: return <Bell className="h-3 w-3" />
    }
  }

  // Add reminder
  const handleAddReminder = async () => {
    if (newReminder.title && newReminder.date && newReminder.time) {
      try {
        const reminderData = {
          title: newReminder.title!,
          description: newReminder.description || "",
          date: newReminder.date!,
          time: newReminder.time!,
          priority: newReminder.priority || "medium",
          status: "pending" as const,
          type: newReminder.type || "reminder"
        }
        
        await createReminder(reminderData)
        setNewReminder({
          title: "",
          description: "",
          date: "",
          time: "",
          priority: "medium",
          type: "reminder"
        })
        setIsAddDialogOpen(false)
      } catch (error) {
        console.error('Error adding reminder:', error)
      }
    }
  }

  // Edit reminder
  const handleEditReminder = async () => {
    if (editingReminder) {
      try {
        await updateReminder(editingReminder.id, editingReminder)
        setEditingReminder(null)
      } catch (error) {
        console.error('Error updating reminder:', error)
      }
    }
  }

  // Delete reminder
  const handleDeleteReminder = async (id: string) => {
    try {
      await deleteReminder(id)
    } catch (error) {
      console.error('Error deleting reminder:', error)
    }
  }

  // Toggle reminder status
  const toggleReminderStatus = async (id: string) => {
    const reminder = reminders.find(r => r.id === id)
    if (reminder) {
      try {
        await updateReminder(id, { status: reminder.status === 'pending' ? 'completed' : 'pending' })
      } catch (error) {
        console.error('Error toggling reminder status:', error)
      }
    }
  }

  // Get upcoming reminders (next 7 days)
  const getUpcomingReminders = () => {
    const today = new Date()
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
    
    return reminders
      .filter(reminder => {
        const reminderDate = new Date(reminder.date)
        return reminderDate >= today && reminderDate <= nextWeek && reminder.status === 'pending'
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 5)
  }

  const calendarDays = generateCalendarDays()
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ]
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-6">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-blue-900">
            Calendar & Reminders
          </h1>
          <p className="text-gray-600 mt-2 text-base sm:text-lg font-medium">
            Manage your schedule and important reminders
          </p>
          <div className="mt-3 w-16 sm:w-20 h-1 sm:h-1.5 bg-blue-500 rounded-full"></div>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-900 hover:bg-blue-800 text-white shadow-lg transition-all duration-200 transform hover:scale-105">
              <Plus className="h-4 w-4 mr-2" />
              Add Reminder
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Reminder</DialogTitle>
              <DialogDescription>
                Create a new reminder or event for your calendar.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={newReminder.title}
                  onChange={(e) => setNewReminder({...newReminder, title: e.target.value})}
                  placeholder="Enter reminder title"
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newReminder.description}
                  onChange={(e) => setNewReminder({...newReminder, description: e.target.value})}
                  placeholder="Enter reminder description"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={newReminder.date}
                    onChange={(e) => setNewReminder({...newReminder, date: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="time">Time</Label>
                  <Input
                    id="time"
                    type="time"
                    value={newReminder.time}
                    onChange={(e) => setNewReminder({...newReminder, time: e.target.value})}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="priority">Priority</Label>
                  <Select value={newReminder.priority} onValueChange={(value: any) => setNewReminder({...newReminder, priority: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="type">Type</Label>
                  <Select value={newReminder.type} onValueChange={(value: any) => setNewReminder({...newReminder, type: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="reminder">Reminder</SelectItem>
                      <SelectItem value="meeting">Meeting</SelectItem>
                      <SelectItem value="deadline">Deadline</SelectItem>
                      <SelectItem value="event">Event</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddReminder}>
                Add Reminder
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            {error}
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Calendar className="h-6 w-6 text-blue-900" />
                  <div>
                    <CardTitle className="text-blue-900">
                      {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                    </CardTitle>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" onClick={() => navigateMonth('prev')}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())}>
                    Today
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => navigateMonth('next')}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-0.5 sm:gap-1 mb-2">
                {dayNames.map(day => (
                  <div key={day} className="p-1 sm:p-2 text-center text-xs sm:text-sm font-semibold text-gray-600">
                    {day}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-0.5 sm:gap-1">
                {calendarDays.map((day, index) => {
                  const isCurrentMonth = day.getMonth() === currentDate.getMonth()
                  const isToday = day.toDateString() === new Date().toDateString()
                  const dayReminders = getDateReminders(day)
                  
                  return (
                    <div
                      key={index}
                      className={`
                        min-h-[60px] sm:min-h-[80px] p-0.5 sm:p-1 border border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors
                        ${isCurrentMonth ? 'bg-white' : 'bg-gray-50 text-gray-400'}
                        ${isToday ? 'bg-blue-100 border-blue-300' : ''}
                      `}
                      onClick={() => setSelectedDate(day.toISOString().split('T')[0])}
                    >
                      <div className="flex justify-between items-start mb-0.5 sm:mb-1">
                        <span className={`text-xs sm:text-sm ${isToday ? 'font-bold text-blue-900' : ''}`}>
                          {day.getDate()}
                        </span>
                        {dayReminders.length > 0 && (
                          <div className="flex flex-wrap gap-0.5 sm:gap-1">
                            {dayReminders.slice(0, 2).map(reminder => (
                              <div
                                key={reminder.id}
                                className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full ${getTypeColor(reminder.type)} border border-white shadow-sm`}
                                title={`${reminder.title} (${reminder.type} - ${reminder.priority})`}
                              />
                            ))}
                            {dayReminders.length > 2 && (
                              <div className="text-[10px] sm:text-xs text-gray-500 bg-white rounded-full px-0.5 sm:px-1 py-0 sm:py-0.5 border">
                                +{dayReminders.length - 2}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>

          {/* Sidebar */}
          <div className="space-y-4 sm:space-y-6">
          {/* Upcoming Reminders */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-blue-900">
                <Clock className="h-5 w-5 mr-2" />
                Upcoming Reminders
              </CardTitle>
              <CardDescription>Next 7 days</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {isLoading ? (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-900 mx-auto mb-2"></div>
                    <p className="text-sm text-gray-500">Loading reminders...</p>
                  </div>
                ) : getUpcomingReminders().length > 0 ? (
                  getUpcomingReminders().map(reminder => (
                    <div key={reminder.id} className={`flex items-start space-x-2 sm:space-x-3 p-2 sm:p-3 rounded-lg border ${getTypeBgColor(reminder.type)}`}>
                      <div className="flex items-center space-x-1 sm:space-x-2 mt-1">
                        <div className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full ${getTypeColor(reminder.type)}`}></div>
                        <div className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${getPriorityColor(reminder.priority)}`}></div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-1 sm:gap-2 mb-1">
                          <p className="text-xs sm:text-sm font-semibold text-gray-900 truncate">
                            {reminder.title}
                          </p>
                          <Badge variant="outline" className="text-[10px] sm:text-xs">
                            {reminder.type}
                          </Badge>
                        </div>
                        <p className="text-[10px] sm:text-xs text-gray-600">
                          {new Date(reminder.date).toLocaleDateString()} at {reminder.time}
                        </p>
                        <p className="text-[10px] sm:text-xs text-gray-500 truncate">
                          {reminder.description}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs sm:text-sm text-gray-500 text-center py-4">
                    No upcoming reminders
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Color Legend */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-blue-900">
                <Bell className="h-5 w-5 mr-2" />
                Color Legend
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-2">Reminder Types</h4>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                      <span className="text-xs text-gray-600">Meeting</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full bg-red-600"></div>
                      <span className="text-xs text-gray-600">Deadline</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                      <span className="text-xs text-gray-600">Reminder</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full bg-green-600"></div>
                      <span className="text-xs text-gray-600">Event</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-2">Priority Levels</h4>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 rounded-full bg-red-500"></div>
                      <span className="text-xs text-gray-600">High Priority</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                      <span className="text-xs text-gray-600">Medium Priority</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      <span className="text-xs text-gray-600">Low Priority</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Reminder Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-blue-900">
                <Bell className="h-5 w-5 mr-2" />
                Reminder Stats
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Reminders</span>
                  <Badge variant="secondary">{reminders.length}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Pending</span>
                  <Badge variant="destructive">
                    {reminders.filter(r => r.status === 'pending').length}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Completed</span>
                  <Badge variant="default">
                    {reminders.filter(r => r.status === 'completed').length}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">High Priority</span>
                  <Badge className="bg-red-500">
                    {reminders.filter(r => r.priority === 'high').length}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Selected Date Reminders */}
      {selectedDate && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-blue-900">
              <Calendar className="h-5 w-5 mr-2" />
              Reminders for {new Date(selectedDate).toLocaleDateString()}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {getDateReminders(new Date(selectedDate)).length > 0 ? (
                getDateReminders(new Date(selectedDate)).map(reminder => (
                  <div key={reminder.id} className={`flex items-center justify-between p-4 border rounded-lg ${getTypeBgColor(reminder.type)}`}>
                    <div className="flex items-start space-x-3 flex-1">
                      <div className="flex items-center space-x-2">
                        <div className={`w-4 h-4 rounded-full ${getTypeColor(reminder.type)} flex items-center justify-center`}>
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        </div>
                        <div className={`w-2 h-2 rounded-full ${getPriorityColor(reminder.priority)}`}></div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-semibold text-gray-900">{reminder.title}</h4>
                          <Badge variant={reminder.status === 'completed' ? 'default' : 'secondary'}>
                            {reminder.status}
                          </Badge>
                          <Badge className={`${getTypeColor(reminder.type)} text-white`}>
                            {reminder.type}
                          </Badge>
                          <Badge className={`${getPriorityColor(reminder.priority)} text-white`}>
                            {reminder.priority}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{reminder.description}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {reminder.time} - {reminder.type}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleReminderStatus(reminder.id)}
                      >
                        {reminder.status === 'completed' ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : (
                          <Clock className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingReminder(reminder)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteReminder(reminder.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 text-center py-8">
                  No reminders for this date
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Edit Reminder Dialog */}
      {editingReminder && (
        <Dialog open={!!editingReminder} onOpenChange={() => setEditingReminder(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Reminder</DialogTitle>
              <DialogDescription>
                Update the reminder details.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-title">Title</Label>
                <Input
                  id="edit-title"
                  value={editingReminder.title}
                  onChange={(e) => setEditingReminder({...editingReminder, title: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={editingReminder.description}
                  onChange={(e) => setEditingReminder({...editingReminder, description: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-date">Date</Label>
                  <Input
                    id="edit-date"
                    type="date"
                    value={editingReminder.date}
                    onChange={(e) => setEditingReminder({...editingReminder, date: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-time">Time</Label>
                  <Input
                    id="edit-time"
                    type="time"
                    value={editingReminder.time}
                    onChange={(e) => setEditingReminder({...editingReminder, time: e.target.value})}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-priority">Priority</Label>
                  <Select value={editingReminder.priority} onValueChange={(value: any) => setEditingReminder({...editingReminder, priority: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="edit-type">Type</Label>
                  <Select value={editingReminder.type} onValueChange={(value: any) => setEditingReminder({...editingReminder, type: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="reminder">Reminder</SelectItem>
                      <SelectItem value="meeting">Meeting</SelectItem>
                      <SelectItem value="deadline">Deadline</SelectItem>
                      <SelectItem value="event">Event</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingReminder(null)}>
                Cancel
              </Button>
              <Button onClick={handleEditReminder}>
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
