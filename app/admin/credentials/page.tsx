"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { DataCenterLayout } from "@/components/datacenter-layout"
import { 
  Key, 
  Search, 
  Plus,
  Eye,
  EyeOff,
  Edit,
  Trash2,
  Copy,
  Check,
  Shield
} from "lucide-react"

interface Credential {
  id: string
  platformName: string
  userId: string
  password: string
  notes?: string
  createdAt: string
  updatedAt: string
}

export default function AdminCredentialsPage() {
  const [credentials, setCredentials] = useState<Credential[]>([])
  const [filteredCredentials, setFilteredCredentials] = useState<Credential[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCredential, setSelectedCredential] = useState<Credential | null>(null)
  const [showDetailsDialog, setShowDetailsDialog] = useState(false)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [deletingCredential, setDeletingCredential] = useState(false)
  const [savingCredential, setSavingCredential] = useState(false)
  const [visiblePasswords, setVisiblePasswords] = useState<Set<string>>(new Set())
  const [copiedId, setCopiedId] = useState<string | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    platformName: '',
    userId: '',
    password: '',
    notes: ''
  })

  useEffect(() => {
    fetchCredentials()
  }, [])

  useEffect(() => {
    filterCredentialsData()
  }, [credentials, searchTerm])

  const fetchCredentials = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/credentials')
      if (response.ok) {
        const data = await response.json()
        setCredentials(data)
      }
    } catch (error) {
      console.error('Error fetching credentials:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterCredentialsData = () => {
    let filtered = [...credentials]

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(cred =>
        cred.platformName.toLowerCase().includes(term) ||
        cred.userId.toLowerCase().includes(term) ||
        (cred.notes && cred.notes.toLowerCase().includes(term))
      )
    }

    setFilteredCredentials(filtered)
  }

  const resetForm = () => {
    setFormData({
      platformName: '',
      userId: '',
      password: '',
      notes: ''
    })
  }

  const handleAddCredential = async () => {
    if (!formData.platformName || !formData.userId || !formData.password) {
      alert('Please fill in all required fields (Platform Name, User ID, Password)')
      return
    }

    try {
      setSavingCredential(true)
      const response = await fetch('/api/credentials', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        await fetchCredentials()
        setShowAddDialog(false)
        resetForm()
      } else {
        const error = await response.json()
        alert(`Failed to create credential: ${error.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error creating credential:', error)
      alert('Failed to create credential. Please try again.')
    } finally {
      setSavingCredential(false)
    }
  }

  const handleEditCredential = async () => {
    if (!selectedCredential) return
    
    if (!formData.platformName || !formData.userId || !formData.password) {
      alert('Please fill in all required fields')
      return
    }

    try {
      setSavingCredential(true)
      const response = await fetch(`/api/credentials/${selectedCredential.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        await fetchCredentials()
        setShowEditDialog(false)
        setSelectedCredential(null)
        resetForm()
      } else {
        const error = await response.json()
        alert(`Failed to update credential: ${error.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error updating credential:', error)
      alert('Failed to update credential. Please try again.')
    } finally {
      setSavingCredential(false)
    }
  }

  const handleViewCredential = (credential: Credential) => {
    setSelectedCredential(credential)
    setShowDetailsDialog(true)
  }

  const handleOpenEditDialog = (credential: Credential) => {
    setSelectedCredential(credential)
    setFormData({
      platformName: credential.platformName,
      userId: credential.userId,
      password: credential.password,
      notes: credential.notes || ''
    })
    setShowEditDialog(true)
  }

  const handleDeleteCredential = async (credentialId: string) => {
    if (!confirm('Are you sure you want to delete this credential? This action cannot be undone.')) {
      return
    }

    try {
      setDeletingCredential(true)
      const response = await fetch(`/api/credentials/${credentialId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        await fetchCredentials()
        setShowDetailsDialog(false)
        setSelectedCredential(null)
      } else {
        alert('Failed to delete credential. Please try again.')
      }
    } catch (error) {
      console.error('Error deleting credential:', error)
      alert('Failed to delete credential. Please try again.')
    } finally {
      setDeletingCredential(false)
    }
  }

  const togglePasswordVisibility = (credentialId: string) => {
    setVisiblePasswords(prev => {
      const newSet = new Set(prev)
      if (newSet.has(credentialId)) {
        newSet.delete(credentialId)
      } else {
        newSet.add(credentialId)
      }
      return newSet
    })
  }

  const handleCopyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
      alert('Failed to copy to clipboard')
    }
  }

  const maskPassword = (password: string) => {
    return '•'.repeat(Math.min(password.length, 12))
  }

  const credentialStats = {
    total: credentials.length,
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
            title="Credentials Management"
            subtitle="Securely store and manage service credentials"
          />
        </div>

        {/* Add Credential Button */}
        <div className="mb-6">
          <Button onClick={() => setShowAddDialog(true)} className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg">
            <Plus className="h-4 w-4 mr-2" />
            Add New Credential
          </Button>
        </div>

        {/* Stats Card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-white border-0 shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <Key className="w-4 h-4" />
                Total Credentials
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{credentialStats.total}</div>
              <p className="text-xs text-gray-500 mt-1">Stored securely</p>
            </CardContent>
          </Card>

          <Card className="bg-white border-0 shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <Shield className="w-4 h-4 text-green-600" />
                Security Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">Protected</div>
              <p className="text-xs text-gray-500 mt-1">Admin access only</p>
            </CardContent>
          </Card>

          <Card className="bg-white border-0 shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <Eye className="w-4 h-4 text-blue-600" />
                Quick Access
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">Enabled</div>
              <p className="text-xs text-gray-500 mt-1">View & copy anytime</p>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Card className="bg-white border-0 shadow-lg mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Key className="w-5 h-5" />
                All Credentials
              </CardTitle>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search credentials..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {filteredCredentials.length === 0 ? (
              <div className="text-center py-12">
                <Key className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No credentials found</p>
                {searchTerm && (
                  <p className="text-sm text-gray-500 mt-2">Try adjusting your search</p>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto -mx-4 sm:mx-0">
                <table className="w-full min-w-[600px]">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-semibold text-gray-700 text-xs sm:text-sm">Platform Name</th>
                      <th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-semibold text-gray-700 text-xs sm:text-sm">User ID</th>
                      <th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-semibold text-gray-700 text-xs sm:text-sm">Password</th>
                      <th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-semibold text-gray-700 text-xs sm:text-sm">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCredentials.map((credential) => (
                      <tr 
                        key={credential.id} 
                        className="border-b hover:bg-gray-50 transition-colors"
                      >
                        <td className="py-2 sm:py-3 px-2 sm:px-4">
                          <div className="flex items-center gap-1 sm:gap-2">
                            <Shield className="h-3 w-3 sm:h-4 sm:w-4 text-blue-500 flex-shrink-0" />
                            <span className="font-medium text-xs sm:text-sm truncate">{credential.platformName}</span>
                          </div>
                        </td>
                        <td className="py-2 sm:py-3 px-2 sm:px-4">
                          <div className="flex items-center gap-1 sm:gap-2 min-w-0">
                            <span className="font-mono text-xs sm:text-sm text-gray-700 truncate max-w-[100px] sm:max-w-none">{credential.userId}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleCopyToClipboard(credential.userId, `userId-${credential.id}`)}
                              className="h-5 w-5 sm:h-6 sm:w-6 p-0 flex-shrink-0"
                              title="Copy User ID"
                            >
                              {copiedId === `userId-${credential.id}` ? (
                                <Check className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-green-600" />
                              ) : (
                                <Copy className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-gray-400" />
                              )}
                            </Button>
                          </div>
                        </td>
                        <td className="py-2 sm:py-3 px-2 sm:px-4">
                          <div className="flex items-center gap-1 sm:gap-2">
                            <span className="font-mono text-xs sm:text-sm">
                              {visiblePasswords.has(credential.id) ? credential.password : maskPassword(credential.password)}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => togglePasswordVisibility(credential.id)}
                              className="h-5 w-5 sm:h-6 sm:w-6 p-0 flex-shrink-0"
                              title={visiblePasswords.has(credential.id) ? "Hide password" : "Show password"}
                            >
                              {visiblePasswords.has(credential.id) ? (
                                <EyeOff className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-gray-400" />
                              ) : (
                                <Eye className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-gray-400" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleCopyToClipboard(credential.password, `password-${credential.id}`)}
                              className="h-5 w-5 sm:h-6 sm:w-6 p-0 flex-shrink-0"
                              title="Copy Password"
                            >
                              {copiedId === `password-${credential.id}` ? (
                                <Check className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-green-600" />
                              ) : (
                                <Copy className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-gray-400" />
                              )}
                            </Button>
                          </div>
                        </td>
                        <td className="py-2 sm:py-3 px-2 sm:px-4">
                          <div className="flex gap-1 sm:gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleViewCredential(credential)}
                              title="View Details"
                              className="p-1 sm:p-2 h-7 w-7 sm:h-8 sm:w-8"
                            >
                              <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleOpenEditDialog(credential)}
                              title="Edit"
                              className="p-1 sm:p-2 h-7 w-7 sm:h-8 sm:w-8"
                            >
                              <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDeleteCredential(credential.id)}
                              title="Delete"
                              className="p-1 sm:p-2 h-7 w-7 sm:h-8 sm:w-8"
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

        {/* Add Credential Dialog */}
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogContent className="w-[95vw] max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Add New Credential
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 mt-4">
              <div>
                <Label htmlFor="platformName">Platform Name *</Label>
                <Input
                  id="platformName"
                  placeholder="e.g., AWS, GitHub, Azure"
                  value={formData.platformName}
                  onChange={(e) => setFormData({ ...formData, platformName: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="userId">User ID / Username *</Label>
                <Input
                  id="userId"
                  placeholder="e.g., admin@example.com"
                  value={formData.userId}
                  onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="password">Password *</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Additional information about this credential..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setShowAddDialog(false)
                resetForm()
              }}>
                Cancel
              </Button>
              <Button 
                onClick={handleAddCredential}
                disabled={savingCredential}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {savingCredential ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Saving...</span>
                  </div>
                ) : (
                  'Add Credential'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Credential Dialog */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="w-[95vw] max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Edit className="h-5 w-5" />
                Edit Credential
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 mt-4">
              <div>
                <Label htmlFor="edit-platformName">Platform Name *</Label>
                <Input
                  id="edit-platformName"
                  placeholder="e.g., AWS, GitHub, Azure"
                  value={formData.platformName}
                  onChange={(e) => setFormData({ ...formData, platformName: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="edit-userId">User ID / Username *</Label>
                <Input
                  id="edit-userId"
                  placeholder="e.g., admin@example.com"
                  value={formData.userId}
                  onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="edit-password">Password *</Label>
                <Input
                  id="edit-password"
                  type="password"
                  placeholder="Enter password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="edit-notes">Notes (Optional)</Label>
                <Textarea
                  id="edit-notes"
                  placeholder="Additional information about this credential..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setShowEditDialog(false)
                setSelectedCredential(null)
                resetForm()
              }}>
                Cancel
              </Button>
              <Button 
                onClick={handleEditCredential}
                disabled={savingCredential}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {savingCredential ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Saving...</span>
                  </div>
                ) : (
                  'Save Changes'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* View Details Dialog */}
        {selectedCredential && (
          <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
            <DialogContent className="w-[95vw] max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Key className="h-5 w-5" />
                  Credential Details
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4 sm:space-y-6 mt-4">
                {/* Actions */}
                <div className="flex flex-wrap items-center justify-end gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setShowDetailsDialog(false)
                      handleOpenEditDialog(selectedCredential)
                    }}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDeleteCredential(selectedCredential.id)}
                    disabled={deletingCredential}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    {deletingCredential ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Deleting...</span>
                      </div>
                    ) : (
                      <>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </>
                    )}
                  </Button>
                </div>

                {/* Details Grid */}
                <div className="space-y-3 sm:space-y-4">
                  <div className="p-3 sm:p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-xs sm:text-sm text-gray-600 mb-1">Platform Name</p>
                    <p className="font-semibold text-gray-900 text-sm sm:text-base break-words">{selectedCredential.platformName}</p>
                  </div>

                  <div className="p-3 sm:p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex flex-wrap items-center justify-between mb-1 gap-2">
                      <p className="text-xs sm:text-sm text-gray-600">User ID / Username</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopyToClipboard(selectedCredential.userId, 'detail-userId')}
                        className="h-6 px-2 text-xs"
                      >
                        {copiedId === 'detail-userId' ? (
                          <Check className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-green-600 mr-1" />
                        ) : (
                          <Copy className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-1" />
                        )}
                        <span className="text-xs">Copy</span>
                      </Button>
                    </div>
                    <p className="font-mono font-medium text-gray-900 text-xs sm:text-sm break-all">{selectedCredential.userId}</p>
                  </div>

                  <div className="p-3 sm:p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex flex-wrap items-center justify-between mb-1 gap-2">
                      <p className="text-xs sm:text-sm text-gray-600">Password</p>
                      <div className="flex gap-1 sm:gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => togglePasswordVisibility(selectedCredential.id)}
                          className="h-6 px-1.5 sm:px-2 text-xs"
                        >
                          {visiblePasswords.has(selectedCredential.id) ? (
                            <>
                              <EyeOff className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-0.5 sm:mr-1" />
                              <span className="text-xs hidden sm:inline">Hide</span>
                            </>
                          ) : (
                            <>
                              <Eye className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-0.5 sm:mr-1" />
                              <span className="text-xs hidden sm:inline">Show</span>
                            </>
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopyToClipboard(selectedCredential.password, 'detail-password')}
                          className="h-6 px-1.5 sm:px-2 text-xs"
                        >
                          {copiedId === 'detail-password' ? (
                            <Check className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-green-600 mr-0.5 sm:mr-1" />
                          ) : (
                            <Copy className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-0.5 sm:mr-1" />
                          )}
                          <span className="text-xs">Copy</span>
                        </Button>
                      </div>
                    </div>
                    <p className="font-mono font-medium text-gray-900 text-xs sm:text-sm break-all">
                      {visiblePasswords.has(selectedCredential.id) 
                        ? selectedCredential.password 
                        : maskPassword(selectedCredential.password)}
                    </p>
                  </div>

                  {selectedCredential.notes && (
                    <div className="p-3 sm:p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <p className="text-xs sm:text-sm text-gray-600 mb-2">Notes</p>
                      <p className="text-gray-900 whitespace-pre-wrap text-xs sm:text-sm break-words">{selectedCredential.notes}</p>
                    </div>
                  )}
                </div>

                {/* Timestamps */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-sm">
                  <div>
                    <p className="text-gray-600 mb-1 text-xs sm:text-sm">Created At</p>
                    <p className="font-medium text-gray-900 text-xs sm:text-sm">
                      {new Date(selectedCredential.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 mb-1 text-xs sm:text-sm">Last Updated</p>
                    <p className="font-medium text-gray-900 text-xs sm:text-sm">
                      {new Date(selectedCredential.updatedAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  )
}

