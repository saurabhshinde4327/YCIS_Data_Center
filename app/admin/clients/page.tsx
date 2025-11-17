"use client"

import React, { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DataCenterLayout } from "@/components/datacenter-layout"
import { 
  Plus, 
  Edit, 
  Trash2, 
  User, 
  Mail,
  Phone,
  Building2,
  AlertCircle,
  CheckCircle,
  XCircle,
  Key,
  Package,
  Eye,
  EyeOff,
  Copy,
  Edit2
} from "lucide-react"

interface Client {
  id: string
  name: string
  email: string
  password: string
  phone?: string
  company?: string
  package?: string
  status: string
  projectStatus?: string
  renewalDate?: string
  createdAt: string
  updatedAt: string
}

export default function ClientsManagementPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingClient, setEditingClient] = useState<Client | null>(null)
  const [showPasswords, setShowPasswords] = useState<{ [key: string]: boolean }>({})
  const [editingPassword, setEditingPassword] = useState<{ client: Client; newPassword: string } | null>(null)
  
  const [newClient, setNewClient] = useState<Partial<Client>>({
    name: "",
    email: "",
    password: "",
    phone: "",
    company: "",
    package: "",
    status: "active",
    projectStatus: "planning",
    renewalDate: ""
  })

  // Load clients on component mount
  useEffect(() => {
    fetchClients()
  }, [])

  const fetchClients = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/clients')
      if (!response.ok) {
        throw new Error('Failed to fetch clients')
      }
      const data = await response.json()
      setClients(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      console.error('Error fetching clients:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const createClient = async (client: Partial<Client>) => {
    try {
      const response = await fetch('/api/clients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(client),
      })
      
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to create client')
      }
      
      const newClient = await response.json()
      setClients(prev => [newClient, ...prev])
      return newClient
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create client')
      throw err
    }
  }

  const updateClient = async (id: string, client: Partial<Client>) => {
    try {
      const response = await fetch(`/api/clients/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(client),
      })
      
      if (!response.ok) {
        throw new Error('Failed to update client')
      }
      
      const updatedClient = await response.json()
      setClients(prev => prev.map(c => c.id === id ? updatedClient : c))
      return updatedClient
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update client')
      throw err
    }
  }

  const deleteClient = async (id: string) => {
    try {
      const response = await fetch(`/api/clients/${id}`, {
        method: 'DELETE',
      })
      
      if (!response.ok) {
        throw new Error('Failed to delete client')
      }
      
      setClients(prev => prev.filter(c => c.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete client')
      throw err
    }
  }

  const handleAddClient = async () => {
    try {
      if (!newClient.name || !newClient.email || !newClient.password) {
        setError('Please fill in all required fields (Name, Email, Password)')
        return
      }

      await createClient(newClient)

      // Reset form
      setNewClient({
        name: "",
        email: "",
        password: "",
        phone: "",
        company: "",
        package: "",
        status: "active"
      })
      setIsAddDialogOpen(false)
      setError(null)
    } catch (err) {
      console.error('Error adding client:', err)
    }
  }

  const handleEditClient = async () => {
    if (!editingClient) return
    
    try {
      await updateClient(editingClient.id, editingClient)
      setEditingClient(null)
      setError(null)
    } catch (err) {
      console.error('Error updating client:', err)
    }
  }

  const handleDeleteClient = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this client?')) {
      try {
        await deleteClient(id)
        setError(null)
      } catch (err) {
        console.error('Error deleting client:', err)
      }
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return 'bg-green-100 text-green-800 border-green-300'
      case 'inactive': return 'bg-gray-100 text-gray-800 border-gray-300'
      case 'suspended': return 'bg-red-100 text-red-800 border-red-300'
      default: return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return <CheckCircle className="w-4 h-4" />
      case 'inactive': return <XCircle className="w-4 h-4" />
      case 'suspended': return <AlertCircle className="w-4 h-4" />
      default: return <XCircle className="w-4 h-4" />
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const togglePasswordVisibility = (clientId: string) => {
    setShowPasswords(prev => ({
      ...prev,
      [clientId]: !prev[clientId]
    }))
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    alert('Copied to clipboard!')
  }

  const handleQuickPasswordEdit = async () => {
    if (!editingPassword) return
    
    try {
      await updateClient(editingPassword.client.id, {
        password: editingPassword.newPassword
      })
      setEditingPassword(null)
      setError(null)
    } catch (err) {
      console.error('Error updating password:', err)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <DataCenterLayout 
            variant="header"
            title="Client Management"
            subtitle="Manage client accounts and credentials"
          />
        </div>

        {/* Error Alert */}
        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-white border-0 shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <User className="w-4 h-4" />
                Total Clients
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{clients.length}</div>
              <p className="text-xs text-gray-500 mt-1">Registered accounts</p>
            </CardContent>
          </Card>

          <Card className="bg-white border-0 shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                Active Clients
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {clients.filter(c => c.status === 'active').length}
              </div>
              <p className="text-xs text-gray-500 mt-1">Active accounts</p>
            </CardContent>
          </Card>

          <Card className="bg-white border-0 shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <XCircle className="w-4 h-4 text-red-600" />
                Inactive/Suspended
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {clients.filter(c => c.status !== 'active').length}
              </div>
              <p className="text-xs text-gray-500 mt-1">Inactive accounts</p>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg">
                <Plus className="w-4 h-4 mr-2" />
                Add New Client
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Client</DialogTitle>
                <DialogDescription>
                  Create a new client account with login credentials
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {/* Name */}
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      value={newClient.name}
                      onChange={(e) => setNewClient(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="John Doe"
                      required
                    />
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={newClient.email}
                      onChange={(e) => setNewClient(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="client@example.com"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Password */}
                  <div className="space-y-2">
                    <Label htmlFor="password">Password *</Label>
                    <Input
                      id="password"
                      type="text"
                      value={newClient.password}
                      onChange={(e) => setNewClient(prev => ({ ...prev, password: e.target.value }))}
                      placeholder="Enter password"
                      required
                    />
                  </div>

                  {/* Phone */}
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={newClient.phone}
                      onChange={(e) => setNewClient(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="+91 XXXXXXXXXX"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Company */}
                  <div className="space-y-2">
                    <Label htmlFor="company">Company</Label>
                    <Input
                      id="company"
                      value={newClient.company}
                      onChange={(e) => setNewClient(prev => ({ ...prev, company: e.target.value }))}
                      placeholder="Company Name"
                    />
                  </div>

                  {/* Package */}
                  <div className="space-y-2">
                    <Label htmlFor="package">Package</Label>
                    <Input
                      id="package"
                      value={newClient.package}
                      onChange={(e) => setNewClient(prev => ({ ...prev, package: e.target.value }))}
                      placeholder="Web Hosting - Premium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Project Status */}
                  <div className="space-y-2">
                    <Label htmlFor="projectStatus">Project Status</Label>
                    <Select
                      value={newClient.projectStatus || "planning"}
                      onValueChange={(value) => setNewClient(prev => ({ ...prev, projectStatus: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select project status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="planning">Planning</SelectItem>
                        <SelectItem value="in-progress">In Progress</SelectItem>
                        <SelectItem value="deployed">Deployed</SelectItem>
                        <SelectItem value="maintenance">Maintenance</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Renewal Date */}
                  <div className="space-y-2">
                    <Label htmlFor="renewalDate">Renewal Date</Label>
                    <Input
                      id="renewalDate"
                      type="date"
                      value={newClient.renewalDate}
                      onChange={(e) => setNewClient(prev => ({ ...prev, renewalDate: e.target.value }))}
                      placeholder="Service renewal date"
                    />
                  </div>
                </div>

                {/* Status */}
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={newClient.status} onValueChange={(value) => setNewClient(prev => ({ ...prev, status: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="suspended">Suspended</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-4">
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddClient} className="bg-blue-600 hover:bg-blue-700">
                    Create Client
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Clients Table */}
        <Card className="bg-white border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              All Clients
            </CardTitle>
            <CardDescription>
              Manage all client accounts and credentials
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : clients.length === 0 ? (
              <div className="text-center py-12">
                <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No clients found</h3>
                <p className="text-gray-500 mb-4">Get started by adding your first client</p>
                <Button onClick={() => setIsAddDialogOpen(true)} className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Add First Client
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Password</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Company</TableHead>
                      <TableHead>Package</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {clients.map((client) => (
                      <TableRow key={client.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-blue-600" />
                            {client.name}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4 text-gray-400" />
                            {client.email}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">
                          <div className="flex items-center gap-2">
                            <Key className="w-4 h-4 text-gray-400 flex-shrink-0" />
                            <code className="bg-gray-100 px-2 py-1 rounded text-xs font-mono min-w-[80px]">
                              {showPasswords[client.id] ? client.password : '••••••••'}
                            </code>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => togglePasswordVisibility(client.id)}
                                className="text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded"
                                title={showPasswords[client.id] ? 'Hide password' : 'Show password'}
                              >
                                {showPasswords[client.id] ? (
                                  <EyeOff className="w-4 h-4" />
                                ) : (
                                  <Eye className="w-4 h-4" />
                                )}
                              </button>
                              <button
                                onClick={() => copyToClipboard(client.password)}
                                className="text-gray-400 hover:text-blue-600 transition-colors p-1 hover:bg-blue-50 rounded"
                                title="Copy password"
                              >
                                <Copy className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setEditingPassword({ client, newPassword: client.password })}
                                className="text-gray-400 hover:text-green-600 transition-colors p-1 hover:bg-green-50 rounded"
                                title="Edit password"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">
                          {client.phone || '-'}
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">
                          {client.company || '-'}
                        </TableCell>
                        <TableCell className="text-sm">
                          {client.package ? (
                            <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                              {client.package}
                            </Badge>
                          ) : '-'}
                        </TableCell>
                        <TableCell>
                          <Badge className={`${getStatusColor(client.status)} flex items-center gap-1 w-fit border`}>
                            {getStatusIcon(client.status)}
                            {client.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">
                          {formatDate(client.createdAt)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setEditingClient(client)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteClient(client.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Password Edit Dialog */}
        {editingPassword && (
          <Dialog open={!!editingPassword} onOpenChange={() => setEditingPassword(null)}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Key className="w-5 h-5 text-blue-600" />
                  Edit Password
                </DialogTitle>
                <DialogDescription>
                  Update password for {editingPassword.client.name}
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <User className="w-4 h-4 text-blue-600" />
                    <span className="font-semibold text-gray-900">{editingPassword.client.name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Mail className="w-4 h-4" />
                    <span>{editingPassword.client.email}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="new-password" className="text-sm font-medium">
                    New Password *
                  </Label>
                  <div className="relative">
                    <Input
                      id="new-password"
                      type="text"
                      value={editingPassword.newPassword}
                      onChange={(e) => setEditingPassword(prev => 
                        prev ? { ...prev, newPassword: e.target.value } : null
                      )}
                      placeholder="Enter new password"
                      className="pr-10 font-mono"
                      autoFocus
                    />
                    <button
                      onClick={() => copyToClipboard(editingPassword.newPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-blue-600"
                      title="Copy password"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-xs text-gray-500">
                    Make sure to share this password with the client
                  </p>
                </div>

                {/* Quick Password Suggestions */}
                <div className="space-y-2">
                  <Label className="text-xs text-gray-600">Quick suggestions:</Label>
                  <div className="flex flex-wrap gap-2">
                    {['Pass123!', 'Client@2024', 'Secure#456', 'Demo@123'].map((pass) => (
                      <Button
                        key={pass}
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingPassword(prev => 
                          prev ? { ...prev, newPassword: pass } : null
                        )}
                        className="text-xs"
                      >
                        {pass}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t">
                  <Button variant="outline" onClick={() => setEditingPassword(null)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleQuickPasswordEdit} 
                    className="bg-blue-600 hover:bg-blue-700"
                    disabled={!editingPassword.newPassword}
                  >
                    <Key className="w-4 h-4 mr-2" />
                    Update Password
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* Edit Client Dialog */}
        {editingClient && (
          <Dialog open={!!editingClient} onOpenChange={() => setEditingClient(null)}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Edit Client</DialogTitle>
                <DialogDescription>
                  Update client information and credentials
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Full Name</Label>
                    <Input
                      value={editingClient.name}
                      onChange={(e) => setEditingClient(prev => prev ? ({ ...prev, name: e.target.value }) : null)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input
                      type="email"
                      value={editingClient.email}
                      onChange={(e) => setEditingClient(prev => prev ? ({ ...prev, email: e.target.value }) : null)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Password</Label>
                  <Input
                    type="text"
                    value={editingClient.password}
                    onChange={(e) => setEditingClient(prev => prev ? ({ ...prev, password: e.target.value }) : null)}
                    placeholder="Enter new password"
                  />
                  <p className="text-xs text-gray-500">Leave blank to keep current password</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Phone</Label>
                    <Input
                      value={editingClient.phone || ''}
                      onChange={(e) => setEditingClient(prev => prev ? ({ ...prev, phone: e.target.value }) : null)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Company</Label>
                    <Input
                      value={editingClient.company || ''}
                      onChange={(e) => setEditingClient(prev => prev ? ({ ...prev, company: e.target.value }) : null)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Package</Label>
                    <Input
                      value={editingClient.package || ''}
                      onChange={(e) => setEditingClient(prev => prev ? ({ ...prev, package: e.target.value }) : null)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select 
                      value={editingClient.status} 
                      onValueChange={(value) => setEditingClient(prev => prev ? ({ ...prev, status: value }) : null)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                        <SelectItem value="suspended">Suspended</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Project Status</Label>
                    <Select 
                      value={editingClient.projectStatus || "planning"} 
                      onValueChange={(value) => setEditingClient(prev => prev ? ({ ...prev, projectStatus: value }) : null)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="planning">Planning</SelectItem>
                        <SelectItem value="in-progress">In Progress</SelectItem>
                        <SelectItem value="deployed">Deployed</SelectItem>
                        <SelectItem value="maintenance">Maintenance</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Renewal Date</Label>
                    <Input
                      type="date"
                      value={editingClient.renewalDate || ''}
                      onChange={(e) => setEditingClient(prev => prev ? ({ ...prev, renewalDate: e.target.value }) : null)}
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <Button variant="outline" onClick={() => setEditingClient(null)}>
                    Cancel
                  </Button>
                  <Button onClick={handleEditClient} className="bg-blue-600 hover:bg-blue-700">
                    Save Changes
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  )
}

