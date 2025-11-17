"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { DataCenterLayout } from "@/components/datacenter-layout"
import { 
  TicketIcon, 
  Search, 
  Filter, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  MessageSquare,
  User,
  Mail,
  Calendar,
  Tag,
  AlertTriangle,
  Trash2
} from "lucide-react"

interface Ticket {
  id: string
  clientId: string
  clientName: string
  clientEmail: string
  subject: string
  description: string
  category: string
  priority: string
  status: string
  createdAt: string
  updatedAt: string
  resolvedAt?: string
  resolvedBy?: string
}

export default function AdminTicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [filteredTickets, setFilteredTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)
  const [showDetailsDialog, setShowDetailsDialog] = useState(false)
  const [resolvingTicket, setResolvingTicket] = useState(false)
  const [deletingTicket, setDeletingTicket] = useState(false)

  useEffect(() => {
    fetchTickets()
  }, [])

  useEffect(() => {
    filterTicketsData()
  }, [tickets, searchTerm, filterStatus])

  const fetchTickets = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/tickets')
      if (response.ok) {
        const data = await response.json()
        setTickets(data)
      }
    } catch (error) {
      console.error('Error fetching tickets:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterTicketsData = () => {
    let filtered = [...tickets]

    // Filter by status
    if (filterStatus !== "all") {
      filtered = filtered.filter(ticket => ticket.status === filterStatus)
    }

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(ticket =>
        ticket.subject.toLowerCase().includes(term) ||
        ticket.clientName.toLowerCase().includes(term) ||
        ticket.clientEmail.toLowerCase().includes(term) ||
        ticket.description.toLowerCase().includes(term)
      )
    }

    setFilteredTickets(filtered)
  }

  const handleViewTicket = (ticket: Ticket) => {
    setSelectedTicket(ticket)
    setShowDetailsDialog(true)
  }

  const handleResolveTicket = async (ticketId: string) => {
    try {
      setResolvingTicket(true)
      const response = await fetch(`/api/tickets/${ticketId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'resolved',
          resolvedBy: 'Admin'
        })
      })

      if (response.ok) {
        await fetchTickets()
        if (selectedTicket?.id === ticketId) {
          const updatedTicket = await response.json()
          setSelectedTicket(updatedTicket)
        }
      }
    } catch (error) {
      console.error('Error resolving ticket:', error)
    } finally {
      setResolvingTicket(false)
    }
  }

  const handleUpdateStatus = async (ticketId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/tickets/${ticketId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus })
      })

      if (response.ok) {
        await fetchTickets()
        if (selectedTicket?.id === ticketId) {
          const updatedTicket = await response.json()
          setSelectedTicket(updatedTicket)
        }
      }
    } catch (error) {
      console.error('Error updating ticket:', error)
    }
  }

  const handleDeleteTicket = async (ticketId: string) => {
    if (!confirm('Are you sure you want to delete this ticket? This action cannot be undone.')) {
      return
    }

    try {
      setDeletingTicket(true)
      const response = await fetch(`/api/tickets/${ticketId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        await fetchTickets()
        setShowDetailsDialog(false)
        setSelectedTicket(null)
      } else {
        alert('Failed to delete ticket. Please try again.')
      }
    } catch (error) {
      console.error('Error deleting ticket:', error)
      alert('Failed to delete ticket. Please try again.')
    } finally {
      setDeletingTicket(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-blue-100 text-blue-800 border-blue-300'
      case 'in-progress':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      case 'resolved':
        return 'bg-green-100 text-green-800 border-green-300'
      case 'closed':
        return 'bg-gray-100 text-gray-800 border-gray-300'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low':
        return 'bg-gray-100 text-gray-800 border-gray-300'
      case 'medium':
        return 'bg-blue-100 text-blue-800 border-blue-300'
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-300'
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-300'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'technical':
        return <AlertCircle className="h-4 w-4" />
      case 'billing':
        return <Tag className="h-4 w-4" />
      case 'urgent':
        return <AlertTriangle className="h-4 w-4" />
      default:
        return <MessageSquare className="h-4 w-4" />
    }
  }

  const ticketStats = {
    total: tickets.length,
    open: tickets.filter(t => t.status === 'open').length,
    inProgress: tickets.filter(t => t.status === 'in-progress').length,
    resolved: tickets.filter(t => t.status === 'resolved').length,
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
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
            title="Support Tickets Management"
            subtitle="Manage and resolve client support tickets efficiently"
          />
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white border-0 shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <TicketIcon className="w-4 h-4" />
                Total Tickets
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{ticketStats.total}</div>
              <p className="text-xs text-gray-500 mt-1">All support requests</p>
            </CardContent>
          </Card>

          <Card className="bg-white border-0 shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-600" />
                Open Tickets
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{ticketStats.open}</div>
              <p className="text-xs text-gray-500 mt-1">Awaiting response</p>
            </CardContent>
          </Card>

          <Card className="bg-white border-0 shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-yellow-600" />
                In Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{ticketStats.inProgress}</div>
              <p className="text-xs text-gray-500 mt-1">Being addressed</p>
            </CardContent>
          </Card>

          <Card className="bg-white border-0 shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                Resolved
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{ticketStats.resolved}</div>
              <p className="text-xs text-gray-500 mt-1">Successfully closed</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="bg-white border-0 shadow-lg">
          <CardHeader>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-0">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <TicketIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                All Tickets
              </CardTitle>
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1 sm:flex-initial">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search tickets..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full sm:w-64"
                />
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="border rounded-md px-3 py-2 text-sm w-full sm:w-auto"
              >
                <option value="all">All Status</option>
                <option value="open">Open</option>
                <option value="in-progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredTickets.length === 0 ? (
            <div className="text-center py-12">
              <TicketIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No tickets found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredTickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className="p-3 sm:p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer bg-white"
                  onClick={() => handleViewTicket(ticket)}
                >
                  <div className="flex flex-col sm:flex-row items-start justify-between mb-2 gap-2">
                    <div className="flex-1 w-full sm:w-auto">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <h3 className="font-semibold text-gray-900 text-sm sm:text-base break-words">{ticket.subject}</h3>
                        <Badge className={`${getStatusColor(ticket.status)} text-xs`}>
                          {ticket.status.replace('-', ' ')}
                        </Badge>
                        <Badge className={`${getPriorityColor(ticket.priority)} text-xs`}>
                          {ticket.priority}
                        </Badge>
                      </div>
                      <p className="text-xs sm:text-sm text-gray-600 line-clamp-2 mb-2">
                        {ticket.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3 flex-shrink-0" />
                      <span className="truncate">{ticket.clientName}</span>
                    </div>
                    <div className="flex items-center gap-1 min-w-0">
                      <Mail className="h-3 w-3 flex-shrink-0" />
                      <span className="truncate">{ticket.clientEmail}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {getCategoryIcon(ticket.category)}
                      <span className="capitalize">{ticket.category}</span>
                    </div>
                    <div className="flex items-center gap-1 whitespace-nowrap">
                      <Calendar className="h-3 w-3 flex-shrink-0" />
                      <span>{new Date(ticket.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Ticket Details Dialog */}
      {selectedTicket && (
        <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
          <DialogContent className="w-[95vw] max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <TicketIcon className="h-5 w-5" />
                Ticket Details
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 sm:space-y-6 mt-4">
              {/* Status and Actions */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-lg gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge className={`${getStatusColor(selectedTicket.status)} text-xs`}>
                    {selectedTicket.status.replace('-', ' ')}
                  </Badge>
                  <Badge className={`${getPriorityColor(selectedTicket.priority)} text-xs`}>
                    {selectedTicket.priority} priority
                  </Badge>
                </div>
                <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                  {selectedTicket.status === 'open' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleUpdateStatus(selectedTicket.id, 'in-progress')}
                      className="w-full sm:w-auto text-xs sm:text-sm"
                    >
                      Mark In Progress
                    </Button>
                  )}
                  {(selectedTicket.status === 'open' || selectedTicket.status === 'in-progress') && (
                    <Button
                      size="sm"
                      onClick={() => handleResolveTicket(selectedTicket.id)}
                      disabled={resolvingTicket}
                      className="bg-green-600 hover:bg-green-700 w-full sm:w-auto text-xs sm:text-sm"
                    >
                      {resolvingTicket ? (
                        <div className="flex items-center gap-2">
                          <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-white"></div>
                          <span>Resolving...</span>
                        </div>
                      ) : (
                        <>
                          <CheckCircle2 className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                          Mark Resolved
                        </>
                      )}
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDeleteTicket(selectedTicket.id)}
                    disabled={deletingTicket}
                    className="bg-red-600 hover:bg-red-700 w-full sm:w-auto text-xs sm:text-sm"
                  >
                    {deletingTicket ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-white"></div>
                        <span>Deleting...</span>
                      </div>
                    ) : (
                      <>
                        <Trash2 className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                        Delete
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* Subject */}
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 break-words">{selectedTicket.subject}</h3>
              </div>

              {/* Client Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 p-3 sm:p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div>
                  <p className="text-xs sm:text-sm text-gray-600 mb-1">Client Name</p>
                  <p className="font-semibold text-gray-900 text-sm sm:text-base break-words">{selectedTicket.clientName}</p>
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-gray-600 mb-1">Client Email</p>
                  <p className="font-semibold text-gray-900 text-sm sm:text-base break-all">{selectedTicket.clientEmail}</p>
                </div>
              </div>

              {/* Ticket Details */}
              <div className="space-y-3 sm:space-y-4">
                <div>
                  <p className="text-xs sm:text-sm text-gray-600 mb-2">Category</p>
                  <div className="flex items-center gap-2">
                    {getCategoryIcon(selectedTicket.category)}
                    <span className="capitalize font-medium text-sm sm:text-base">{selectedTicket.category}</span>
                  </div>
                </div>

                <div>
                  <p className="text-xs sm:text-sm text-gray-600 mb-2">Description</p>
                  <div className="p-3 sm:p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-gray-900 whitespace-pre-wrap text-xs sm:text-sm break-words">{selectedTicket.description}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <p className="text-xs sm:text-sm text-gray-600 mb-1">Created At</p>
                    <p className="font-medium text-gray-900 text-xs sm:text-sm">
                      {new Date(selectedTicket.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-gray-600 mb-1">Last Updated</p>
                    <p className="font-medium text-gray-900 text-xs sm:text-sm">
                      {new Date(selectedTicket.updatedAt).toLocaleString()}
                    </p>
                  </div>
                </div>

                {selectedTicket.resolvedAt && (
                  <div className="p-3 sm:p-4 bg-green-50 rounded-lg border border-green-200">
                    <p className="text-xs sm:text-sm text-green-600 mb-1">Resolved At</p>
                    <p className="font-medium text-green-900 text-xs sm:text-sm">
                      {new Date(selectedTicket.resolvedAt).toLocaleString()}
                    </p>
                    {selectedTicket.resolvedBy && (
                      <p className="text-xs sm:text-sm text-green-700 mt-1">
                        Resolved by: {selectedTicket.resolvedBy}
                      </p>
                    )}
                  </div>
                )}
              </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  )
}

