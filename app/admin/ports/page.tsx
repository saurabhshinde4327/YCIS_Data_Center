"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { DataCenterLayout } from "@/components/datacenter-layout"
import { 
  Network, 
  Search, 
  Plus,
  Server,
  CheckCircle2,
  XCircle,
  Edit,
  Trash2,
  Cable,
  ArrowLeft,
  Eye,
  ChevronRight
} from "lucide-react"

interface Port {
  id: string
  vmName: string
  portNumber: number
  status: 'used' | 'not-used'
  privateIp: string
  reason: string
  createdAt: string
  updatedAt: string
}

interface VM {
  name: string
  totalPorts: number
  usedPorts: number
  availablePorts: number
  privateIp?: string
  description?: string
}

export default function AdminPortsPage() {
  const [ports, setPorts] = useState<Port[]>([])
  const [vms, setVms] = useState<VM[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedVM, setSelectedVM] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [showAddVMDialog, setShowAddVMDialog] = useState(false)
  const [showAddPortDialog, setShowAddPortDialog] = useState(false)
  const [showEditPortDialog, setShowEditPortDialog] = useState(false)
  const [showPortDetailsDialog, setShowPortDetailsDialog] = useState(false)
  const [selectedPort, setSelectedPort] = useState<Port | null>(null)
  const [saving, setSaving] = useState(false)

  // Form state for VM
  const [vmFormData, setVmFormData] = useState({
    name: '',
    privateIp: '',
    description: ''
  })

  // Form state for Port
  const [portFormData, setPortFormData] = useState({
    portNumber: '',
    status: 'not-used' as 'used' | 'not-used',
    privateIp: '',
    reason: ''
  })

  useEffect(() => {
    fetchPorts()
  }, [])

  useEffect(() => {
    // Group ports by VM
    const vmMap = new Map<string, VM>()
    
    ports.forEach(port => {
      if (!vmMap.has(port.vmName)) {
        vmMap.set(port.vmName, {
          name: port.vmName,
          totalPorts: 0,
          usedPorts: 0,
          availablePorts: 0,
          privateIp: port.privateIp.split(':')[0] || port.privateIp
        })
      }
      
      const vm = vmMap.get(port.vmName)!
      vm.totalPorts++
      if (port.status === 'used') {
        vm.usedPorts++
      } else {
        vm.availablePorts++
      }
    })
    
    setVms(Array.from(vmMap.values()).sort((a, b) => a.name.localeCompare(b.name)))
  }, [ports])

  const fetchPorts = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/ports')
      if (response.ok) {
        const data = await response.json()
        setPorts(data)
      }
    } catch (error) {
      console.error('Error fetching ports:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddVM = async () => {
    if (!vmFormData.name) {
      alert('Please enter VM name')
      return
    }

    // Check if VM already exists
    if (vms.some(vm => vm.name.toLowerCase() === vmFormData.name.toLowerCase())) {
      alert('A VM with this name already exists')
      return
    }

    // Create a placeholder port for the new VM
    try {
      setSaving(true)
      const response = await fetch('/api/ports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vmName: vmFormData.name,
          portNumber: 0, // Placeholder
          status: 'not-used',
          privateIp: vmFormData.privateIp || '0.0.0.0',
          reason: vmFormData.description || 'Initial VM setup'
        })
      })

      if (response.ok) {
        await fetchPorts()
        setShowAddVMDialog(false)
        setVmFormData({ name: '', privateIp: '', description: '' })
        alert(`VM "${vmFormData.name}" created successfully! Click on it to add ports.`)
      } else {
        const errorData = await response.json().catch(() => ({}))
        const errorMessage = errorData.error || 'Failed to create VM. Please try again.'
        alert(errorMessage)
      }
    } catch (error) {
      console.error('Error creating VM:', error)
      alert('Failed to create VM. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleAddPort = async () => {
    if (!selectedVM) return
    
    if (!portFormData.portNumber || !portFormData.privateIp || !portFormData.reason) {
      alert('Please fill in all required fields')
      return
    }

    try {
      setSaving(true)
      const response = await fetch('/api/ports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vmName: selectedVM,
          portNumber: parseInt(portFormData.portNumber),
          status: portFormData.status,
          privateIp: portFormData.privateIp,
          reason: portFormData.reason
        })
      })

      if (response.ok) {
        await fetchPorts()
        setShowAddPortDialog(false)
        setPortFormData({
          portNumber: '',
          status: 'not-used',
          privateIp: '',
          reason: ''
        })
      } else {
        const error = await response.json()
        alert(`Failed to create port: ${error.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error creating port:', error)
      alert('Failed to create port. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleEditPort = async () => {
    if (!selectedPort) return
    
    if (!portFormData.portNumber || !portFormData.privateIp || !portFormData.reason) {
      alert('Please fill in all required fields')
      return
    }

    try {
      setSaving(true)
      const response = await fetch(`/api/ports/${selectedPort.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vmName: selectedVM,
          portNumber: parseInt(portFormData.portNumber),
          status: portFormData.status,
          privateIp: portFormData.privateIp,
          reason: portFormData.reason
        })
      })

      if (response.ok) {
        await fetchPorts()
        setShowEditPortDialog(false)
        setSelectedPort(null)
        setPortFormData({
          portNumber: '',
          status: 'not-used',
          privateIp: '',
          reason: ''
        })
      } else {
        alert('Failed to update port. Please try again.')
      }
    } catch (error) {
      console.error('Error updating port:', error)
      alert('Failed to update port. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleDeletePort = async (portId: string): Promise<void> => {
    if (!confirm('Are you sure you want to delete this port?')) return

    try {
      const response = await fetch(`/api/ports/${portId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        await fetchPorts()
        setShowPortDetailsDialog(false)
        setSelectedPort(null)
      } else {
        alert('Failed to delete port. Please try again.')
      }
    } catch (error) {
      console.error('Error deleting port:', error)
      alert('Failed to delete port. Please try again.')
    }
  }

  const handleDeleteVM = async (vmName: string) => {
    if (!confirm(`Are you sure you want to delete VM "${vmName}" and all its ports?`)) return

    try {
      const vmPorts = ports.filter(p => p.vmName === vmName)
      
      // Delete all ports for this VM
      for (const port of vmPorts) {
        await fetch(`/api/ports/${port.id}`, { method: 'DELETE' })
      }
      
      await fetchPorts()
      if (selectedVM === vmName) {
        setSelectedVM(null)
      }
    } catch (error) {
      console.error('Error deleting VM:', error)
      alert('Failed to delete VM. Please try again.')
    }
  }

  const handleViewPort = (port: Port) => {
    setSelectedPort(port)
    setShowPortDetailsDialog(true)
  }

  const handleOpenEditDialog = (port: Port) => {
    setSelectedPort(port)
    setPortFormData({
      portNumber: port.portNumber.toString(),
      status: port.status,
      privateIp: port.privateIp,
      reason: port.reason
    })
    setShowEditPortDialog(true)
  }

  const getStatusColor = (status: string) => {
    return status === 'used' 
      ? 'bg-green-100 text-green-800 border-green-300'
      : 'bg-gray-100 text-gray-800 border-gray-300'
  }

  const getVMPorts = (vmName: string) => {
    return ports.filter(p => p.vmName === vmName && p.portNumber !== 0)
  }

  const filteredVMs = vms.filter(vm => 
    !searchTerm || vm.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

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
            title="VM & Ports Management"
            subtitle={selectedVM ? `Managing ports for ${selectedVM}` : "Manage Virtual Machines and their ports"}
          />
        </div>

        {/* View Selection */}
        {!selectedVM ? (
          // VM List View
          <>
            {/* Add VM Button */}
            <div className="mb-6 flex gap-4 items-center">
              <Button 
                onClick={() => setShowAddVMDialog(true)} 
                className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
              >
            <Plus className="h-4 w-4 mr-2" />
                Add New VM
          </Button>
              
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search VMs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
        </div>

            {/* VM Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-white border-0 shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                    <Server className="w-4 h-4" />
                    Total VMs
              </CardTitle>
            </CardHeader>
            <CardContent>
                  <div className="text-2xl font-bold text-gray-900">{vms.length}</div>
                  <p className="text-xs text-gray-500 mt-1">Virtual machines</p>
            </CardContent>
          </Card>

          <Card className="bg-white border-0 shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                    <Network className="w-4 h-4 text-blue-600" />
                    Total Ports
              </CardTitle>
            </CardHeader>
            <CardContent>
                  <div className="text-2xl font-bold text-blue-600">
                    {ports.filter(p => p.portNumber !== 0).length}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Across all VMs</p>
            </CardContent>
          </Card>

          <Card className="bg-white border-0 shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    Used Ports
              </CardTitle>
            </CardHeader>
            <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {ports.filter(p => p.status === 'used' && p.portNumber !== 0).length}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Currently active</p>
            </CardContent>
          </Card>
        </div>

            {/* VM Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredVMs.length === 0 ? (
                <div className="col-span-full text-center py-12">
                  <Server className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">No VMs found</p>
                  <Button onClick={() => setShowAddVMDialog(true)} className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First VM
                  </Button>
                </div>
              ) : (
                filteredVMs.map((vm) => (
                  <Card key={vm.name} className="bg-white border-0 shadow-lg hover:shadow-xl transition-shadow cursor-pointer group">
          <CardHeader>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <Server className="h-5 w-5 text-blue-600 flex-shrink-0" />
                          <CardTitle className="text-base sm:text-lg break-words overflow-wrap-anywhere">{vm.name}</CardTitle>
              </div>
                        <Button
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeleteVM(vm.name)
                          }}
                          className="opacity-0 group-hover:opacity-100 transition-opacity bg-red-600 hover:bg-red-700 text-white"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
            </div>
                      {vm.privateIp && vm.privateIp !== '0.0.0.0' && (
                        <CardDescription className="font-mono text-xs">
                          {vm.privateIp}
                        </CardDescription>
                      )}
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Total Ports</span>
                          <Badge variant="outline" className="font-semibold">
                            {vm.totalPorts > 0 ? vm.totalPorts - 1 : 0}
                          </Badge>
          </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Used</span>
                          <Badge className="bg-green-100 text-green-800">
                            {vm.usedPorts}
                          </Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Available</span>
                          <Badge className="bg-gray-100 text-gray-800">
                            {vm.availablePorts}
                          </Badge>
                        </div>
                        <Button
                          className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white"
                          onClick={() => setSelectedVM(vm.name)}
                        >
                          Manage Ports
                          <ChevronRight className="h-4 w-4 ml-2" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </>
        ) : (
          // Port Management View for Selected VM
          <>
            {/* Back Button */}
            <div className="mb-6 flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center">
              <Button
                onClick={() => setSelectedVM(null)}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to VMs
              </Button>
              
              <Button
                onClick={() => setShowAddPortDialog(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Port
              </Button>

              <div className="text-base sm:text-lg font-semibold text-gray-700 flex items-center gap-2 min-w-0 flex-1 sm:flex-initial">
                <Server className="h-5 w-5 flex-shrink-0" />
                <span className="truncate">{selectedVM}</span>
              </div>
            </div>

            {/* Port Stats for Selected VM */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <Card className="bg-white border-0 shadow">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Total Ports</CardTitle>
        </CardHeader>
        <CardContent>
                  <div className="text-2xl font-bold text-gray-900">
                    {getVMPorts(selectedVM).length}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white border-0 shadow">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Used Ports</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {getVMPorts(selectedVM).filter(p => p.status === 'used').length}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white border-0 shadow">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Available Ports</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-600">
                    {getVMPorts(selectedVM).filter(p => p.status === 'not-used').length}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Ports Table */}
            <Card className="bg-white border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Cable className="w-5 h-5" />
                  Ports for {selectedVM}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {getVMPorts(selectedVM).length === 0 ? (
                  <div className="text-center py-12">
                    <Network className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">No ports configured yet</p>
                    <Button 
                      onClick={() => setShowAddPortDialog(true)}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add First Port
                    </Button>
                  </div>
          ) : (
            <div className="overflow-x-auto -mx-4 sm:mx-0">
              <table className="w-full min-w-[600px]">
                <thead>
                  <tr className="border-b">
                          <th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-semibold text-gray-700 text-xs sm:text-sm">Port Number</th>
                          <th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-semibold text-gray-700 text-xs sm:text-sm">Private IP</th>
                    <th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-semibold text-gray-700 text-xs sm:text-sm">Status</th>
                    <th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-semibold text-gray-700 text-xs sm:text-sm hidden md:table-cell">Reason</th>
                    <th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-semibold text-gray-700 text-xs sm:text-sm">Actions</th>
                  </tr>
                </thead>
                <tbody>
                        {getVMPorts(selectedVM).map((port) => (
                          <tr key={port.id} className="border-b hover:bg-gray-50">
                      <td className="py-2 sm:py-3 px-2 sm:px-4">
                        <div className="flex items-center gap-1 sm:gap-2">
                          <Cable className="h-3 w-3 sm:h-4 sm:w-4 text-blue-500 flex-shrink-0" />
                                <span className="font-mono font-semibold text-blue-600 text-xs sm:text-sm">
                                  {port.portNumber}
                                </span>
                        </div>
                      </td>
                      <td className="py-2 sm:py-3 px-2 sm:px-4">
                              <span className="font-mono text-xs sm:text-sm text-gray-700">
                                {port.privateIp}
                              </span>
                      </td>
                      <td className="py-2 sm:py-3 px-2 sm:px-4">
                        <Badge className={`${getStatusColor(port.status)} text-xs`}>
                          {port.status === 'used' ? 'Used' : 'Not Used'}
                        </Badge>
                      </td>
                      <td className="py-2 sm:py-3 px-2 sm:px-4 hidden md:table-cell">
                              <span className="text-xs sm:text-sm text-gray-600 line-clamp-1">
                                {port.reason}
                              </span>
                      </td>
                            <td className="py-2 sm:py-3 px-2 sm:px-4">
                              <div className="flex gap-1 sm:gap-2">
                                <Button
                                  size="sm"
                                  className="bg-blue-600 hover:bg-blue-700 text-white p-1 sm:p-2 h-7 w-7 sm:h-8 sm:w-8"
                                  onClick={() => handleViewPort(port)}
                                >
                                  <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  className="bg-blue-600 hover:bg-blue-700 text-white p-1 sm:p-2 h-7 w-7 sm:h-8 sm:w-8"
                                  onClick={() => handleOpenEditDialog(port)}
                                >
                                  <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  className="bg-red-600 hover:bg-red-700 text-white p-1 sm:p-2 h-7 w-7 sm:h-8 sm:w-8"
                                  onClick={() => handleDeletePort(port.id)}
                                >
                                  <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                                </Button>
                              </div>
                            </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
          </>
        )}

        {/* Add VM Dialog */}
        <Dialog open={showAddVMDialog} onOpenChange={setShowAddVMDialog}>
          <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
                Add New Virtual Machine
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div>
              <Label htmlFor="vmName">VM Name *</Label>
              <Input
                id="vmName"
                placeholder="e.g., Web-Server-01"
                  value={vmFormData.name}
                  onChange={(e) => setVmFormData({ ...vmFormData, name: e.target.value })}
              />
            </div>

              <div>
                <Label htmlFor="vmPrivateIp">Private IP (Optional)</Label>
                <Input
                  id="vmPrivateIp"
                  placeholder="e.g., 192.168.1.100"
                  value={vmFormData.privateIp}
                  onChange={(e) => setVmFormData({ ...vmFormData, privateIp: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="vmDescription">Description (Optional)</Label>
                <Textarea
                  id="vmDescription"
                  placeholder="Brief description of this VM..."
                  value={vmFormData.description}
                  onChange={(e) => setVmFormData({ ...vmFormData, description: e.target.value })}
                  rows={3}
                />
              </div>
            </div>

            <DialogFooter>
              <Button 
                onClick={() => {
                  setShowAddVMDialog(false)
                  setVmFormData({ name: '', privateIp: '', description: '' })
                }}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleAddVM}
                disabled={saving}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {saving ? 'Creating...' : 'Add VM'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Add Port Dialog */}
        <Dialog open={showAddPortDialog} onOpenChange={setShowAddPortDialog}>
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Add Port to {selectedVM}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="portNumber">Port Number *</Label>
                <Input
                  id="portNumber"
                  type="number"
                  placeholder="e.g., 8080"
                  min="1"
                  max="65535"
                    value={portFormData.portNumber}
                    onChange={(e) => setPortFormData({ ...portFormData, portNumber: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="privateIp">Private IP *</Label>
                <Input
                  id="privateIp"
                  placeholder="e.g., 192.168.1.100"
                    value={portFormData.privateIp}
                    onChange={(e) => setPortFormData({ ...portFormData, privateIp: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="status">Status *</Label>
              <select
                id="status"
                  value={portFormData.status}
                  onChange={(e) => setPortFormData({ ...portFormData, status: e.target.value as 'used' | 'not-used' })}
                className="w-full border rounded-md px-3 py-2 text-sm"
              >
                <option value="not-used">Not Used</option>
                <option value="used">Used</option>
              </select>
            </div>

            <div>
              <Label htmlFor="reason">Reason for Opening Port *</Label>
              <Textarea
                id="reason"
                placeholder="Describe the purpose of this port..."
                  value={portFormData.reason}
                  onChange={(e) => setPortFormData({ ...portFormData, reason: e.target.value })}
                rows={3}
              />
            </div>
          </div>

            <DialogFooter>
              <Button 
                onClick={() => {
                  setShowAddPortDialog(false)
                  setPortFormData({ portNumber: '', status: 'not-used', privateIp: '', reason: '' })
                }}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleAddPort}
                disabled={saving}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {saving ? 'Adding...' : 'Add Port'}
              </Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Port Dialog */}
        <Dialog open={showEditPortDialog} onOpenChange={setShowEditPortDialog}>
          <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5" />
              Edit Port
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-portNumber">Port Number *</Label>
                <Input
                  id="edit-portNumber"
                  type="number"
                  placeholder="e.g., 8080"
                  min="1"
                  max="65535"
                    value={portFormData.portNumber}
                    onChange={(e) => setPortFormData({ ...portFormData, portNumber: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="edit-privateIp">Private IP *</Label>
                <Input
                  id="edit-privateIp"
                  placeholder="e.g., 192.168.1.100"
                    value={portFormData.privateIp}
                    onChange={(e) => setPortFormData({ ...portFormData, privateIp: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="edit-status">Status *</Label>
              <select
                id="edit-status"
                  value={portFormData.status}
                  onChange={(e) => setPortFormData({ ...portFormData, status: e.target.value as 'used' | 'not-used' })}
                className="w-full border rounded-md px-3 py-2 text-sm"
              >
                <option value="not-used">Not Used</option>
                <option value="used">Used</option>
              </select>
            </div>

            <div>
              <Label htmlFor="edit-reason">Reason for Opening Port *</Label>
              <Textarea
                id="edit-reason"
                placeholder="Describe the purpose of this port..."
                  value={portFormData.reason}
                  onChange={(e) => setPortFormData({ ...portFormData, reason: e.target.value })}
                rows={3}
              />
            </div>
          </div>

            <DialogFooter>
              <Button 
                onClick={() => {
                  setShowEditPortDialog(false)
                  setSelectedPort(null)
                  setPortFormData({ portNumber: '', status: 'not-used', privateIp: '', reason: '' })
                }}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleEditPort}
                disabled={saving}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Port Details Dialog */}
      {selectedPort && (
          <Dialog open={showPortDetailsDialog} onOpenChange={setShowPortDetailsDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Network className="h-5 w-5" />
                Port Details
              </DialogTitle>
            </DialogHeader>

              <div className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm text-gray-600 mb-1">VM Name</p>
                  <div className="flex items-center gap-2">
                    <Server className="h-5 w-5 text-blue-600" />
                    <p className="font-semibold text-gray-900">{selectedPort.vmName}</p>
                  </div>
                </div>

                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm text-gray-600 mb-1">Port Number</p>
                  <div className="flex items-center gap-2">
                    <Cable className="h-5 w-5 text-blue-600" />
                      <p className="font-mono font-semibold text-blue-600 text-lg">
                        {selectedPort.portNumber}
                      </p>
                  </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-sm text-gray-600 mb-1">Private IP</p>
                  <p className="font-mono font-medium text-gray-900">{selectedPort.privateIp}</p>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-sm text-gray-600 mb-1">Status</p>
                  <Badge className={getStatusColor(selectedPort.status)}>
                    {selectedPort.status === 'used' ? 'Used' : 'Not Used'}
                  </Badge>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-2">Reason for Opening Port</p>
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-gray-900 whitespace-pre-wrap">{selectedPort.reason}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600 mb-1">Created At</p>
                  <p className="font-medium text-gray-900">
                    {new Date(selectedPort.createdAt).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 mb-1">Last Updated</p>
                  <p className="font-medium text-gray-900">
                    {new Date(selectedPort.updatedAt).toLocaleString()}
                  </p>
                </div>
              </div>

                <div className="flex justify-end gap-2 pt-4 border-t">
                  <Button
                    onClick={() => {
                      setShowPortDetailsDialog(false)
                      handleOpenEditDialog(selectedPort)
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button
                    onClick={() => handleDeletePort(selectedPort.id)}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
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
