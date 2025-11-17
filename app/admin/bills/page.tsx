"use client"

import React, { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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
  Eye, 
  Upload, 
  FileText, 
  Calendar, 
  DollarSign,
  Building2,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
  Download
} from "lucide-react"
import { Bill } from '@/lib/database'

export default function BillsPage() {
  const [bills, setBills] = useState<Bill[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingBill, setEditingBill] = useState<Bill | null>(null)
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [selectedMonth, setSelectedMonth] = useState<string>('all')
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString())
  
  const [newBill, setNewBill] = useState<Partial<Bill>>({
    description: "",
    amount: 0,
    date: new Date().toISOString().split('T')[0],
    category: "other",
    vendor: "",
    status: "pending",
    notes: ""
  })

  // Load bills on component mount
  useEffect(() => {
    fetchBills()
  }, [])

  // Database functions
  const fetchBills = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/bills')
      if (!response.ok) {
        throw new Error('Failed to fetch bills')
      }
      const data = await response.json()
      setBills(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      console.error('Error fetching bills:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const createBill = async (bill: Omit<Bill, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const formData = new FormData()
      formData.append('description', bill.description)
      formData.append('amount', bill.amount.toString())
      formData.append('date', bill.date)
      formData.append('category', bill.category)
      formData.append('vendor', bill.vendor)
      formData.append('status', bill.status)
      if (bill.notes) formData.append('notes', bill.notes)
      
      if (selectedImage) {
        formData.append('image', selectedImage)
        formData.append('imageName', selectedImage.name)
      }

      const response = await fetch('/api/bills', {
        method: 'POST',
        body: formData,
      })
      
      if (!response.ok) {
        throw new Error('Failed to create bill')
      }
      
      const newBill = await response.json()
      setBills(prev => [newBill, ...prev])
      return newBill
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create bill')
      throw err
    }
  }

  const updateBill = async (id: string, bill: Partial<Bill>) => {
    try {
      const response = await fetch(`/api/bills/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bill),
      })
      
      if (!response.ok) {
        throw new Error('Failed to update bill')
      }
      
      const updatedBill = await response.json()
      setBills(prev => prev.map(b => b.id === id ? updatedBill : b))
      return updatedBill
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update bill')
      throw err
    }
  }

  const deleteBill = async (id: string) => {
    try {
      const response = await fetch(`/api/bills/${id}`, {
        method: 'DELETE',
      })
      
      if (!response.ok) {
        throw new Error('Failed to delete bill')
      }
      
      setBills(prev => prev.filter(b => b.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete bill')
      throw err
    }
  }

  // Event handlers
  const handleAddBill = async () => {
    try {
      const amount = newBill.amount ?? 0
      
      if (!newBill.description || !newBill.vendor || amount <= 0) {
        setError('Please fill in all required fields')
        return
      }

      await createBill({
        description: newBill.description,
        amount: amount,
        date: newBill.date || new Date().toISOString().split('T')[0],
        category: newBill.category || 'other',
        vendor: newBill.vendor,
        status: newBill.status || 'pending',
        notes: newBill.notes
      })

      // Reset form
      setNewBill({
        description: "",
        amount: 0,
        date: new Date().toISOString().split('T')[0],
        category: "other",
        vendor: "",
        status: "pending",
        notes: ""
      })
      setSelectedImage(null)
      setImagePreview(null)
      setIsAddDialogOpen(false)
    } catch (err) {
      console.error('Error adding bill:', err)
    }
  }

  const handleEditBill = async (bill: Bill) => {
    try {
      await updateBill(bill.id, bill)
      setEditingBill(null)
    } catch (err) {
      console.error('Error updating bill:', err)
    }
  }

  const handleDeleteBill = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this bill?')) {
      try {
        await deleteBill(id)
      } catch (err) {
        // Error already set in state by deleteBill function
        // Only show additional alert if it's a network error
        const errorMessage = err instanceof Error ? err.message : 'Failed to delete bill'
        console.warn('Delete bill failed:', errorMessage)
        alert(`⚠️ Could not delete bill: ${errorMessage}\n\nPlease check your connection and try again.`)
      }
    }
  }

  const handleViewBill = (bill: Bill) => {
    // Check which image property exists
    const imageUrl = bill.imageUrl || bill.imagePath
    
    if (!imageUrl) {
      alert('No bill image available to view')
      console.warn('Bill has no image URL:', bill.id)
      return
    }

    // Check if it's a valid base64 data URL
    const isValidBase64 = imageUrl.startsWith('data:image/') && imageUrl.includes('base64')
    
    // If not base64, it's invalid (all valid images should be base64 now)
    if (!isValidBase64) {
      console.warn('Invalid image URL detected (not base64):', imageUrl.substring(0, 100))
      alert('⚠️ This bill image is not available.\n\nThis bill was created with an old placeholder image path that no longer exists.\n\nTo fix this:\n1. Click Edit on this bill\n2. Re-upload the bill image\n3. Click Save\n\nOr delete this bill and create a new one with the correct image.')
      return
    }

    try {
      console.log('Opening bill image...')
      
      const newWindow = window.open('', '_blank')
      if (newWindow) {
        newWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>${bill.description} - ${bill.vendor}</title>
              <style>
                body { 
                  margin: 0; 
                  padding: 20px; 
                  background: #f0f0f0; 
                  display: flex; 
                  flex-direction: column;
                  align-items: center; 
                  justify-content: center;
                  min-height: 100vh;
                }
                img { 
                  max-width: 100%; 
                  max-height: 90vh; 
                  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                  background: white;
                  padding: 10px;
                }
                .info {
                  background: white;
                  padding: 15px;
                  margin-bottom: 20px;
                  border-radius: 8px;
                  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                  max-width: 600px;
                  width: 100%;
                }
                h2 { margin: 0 0 10px 0; color: #333; }
                p { margin: 5px 0; color: #666; }
              </style>
            </head>
            <body>
              <div class="info">
                <h2>${bill.description}</h2>
                <p><strong>Vendor:</strong> ${bill.vendor}</p>
                <p><strong>Amount:</strong> ${formatCurrency(bill.amount)}</p>
                <p><strong>Date:</strong> ${formatDate(bill.date)}</p>
                ${bill.notes ? `<p><strong>Notes:</strong> ${bill.notes}</p>` : ''}
              </div>
              <img src="${imageUrl}" alt="${bill.description}" />
            </body>
          </html>
        `)
        newWindow.document.close()
      } else {
        alert('Popup blocked. Please allow popups for this site.')
      }
    } catch (error) {
      console.warn('View bill failed:', error instanceof Error ? error.message : 'Unknown error')
      alert('❌ Failed to open bill.\n\n💡 This bill may have an invalid image.\n\nTo fix:\n1. Edit this bill\n2. Re-upload the image\n3. Save changes')
    }
  }

  const handleDownloadBill = async (bill: Bill) => {
    // Check which image property exists
    const imageUrl = bill.imageUrl || bill.imagePath
    
    if (!imageUrl) {
      alert('No bill image available for download')
      console.warn('Bill has no image URL:', bill.id)
      return
    }

    // Check if it's a valid base64 data URL
    const isValidBase64 = imageUrl.startsWith('data:image/') && imageUrl.includes('base64')
    
    // If not base64, it's invalid (all valid images should be base64 now)
    if (!isValidBase64) {
      console.warn('Invalid image URL detected (not base64):', imageUrl.substring(0, 100))
      alert('⚠️ This bill image is not available.\n\nThis bill was created with an old placeholder image path that no longer exists.\n\nTo fix this:\n1. Click Edit on this bill\n2. Re-upload the bill image\n3. Click Save\n\nOr delete this bill and create a new one with the correct image.')
      return
    }

    try {
      console.log('Downloading bill...')
      
      // Extract mime type and base64 data
      const matches = imageUrl.match(/^data:([^;]+);base64,(.+)$/)
      if (!matches) {
        console.warn('Invalid base64 format')
        alert('⚠️ This bill image has an invalid format.\n\nPlease edit and re-upload the image.')
        return
      }
      
      const mimeType = matches[1]
      const base64Data = matches[2]
      
      // Convert base64 to blob
      const byteCharacters = atob(base64Data)
      const byteNumbers = new Array(byteCharacters.length)
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i)
      }
      const byteArray = new Uint8Array(byteNumbers)
      const blob = new Blob([byteArray], { type: mimeType })
      
      // Create a download link
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      
      // Generate filename - determine extension from mime type
      let extension = 'jpg'
      if (blob.type.includes('png')) extension = 'png'
      else if (blob.type.includes('webp')) extension = 'webp'
      else if (blob.type.includes('gif')) extension = 'gif'
      
      const fileName = bill.imageName || `bill_${bill.vendor.replace(/\s+/g, '_')}_${bill.date}.${extension}`
      link.download = fileName
      
      // Trigger download
      document.body.appendChild(link)
      link.click()
      
      // Cleanup
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      
      console.log('Download completed:', fileName)
    } catch (error) {
      // Use console.warn instead of console.error for expected errors
      console.warn('Download failed:', error instanceof Error ? error.message : 'Unknown error')
      alert(`❌ Failed to download bill\n\n💡 This bill has an invalid image.\n\nTo fix:\n1. Edit this bill\n2. Re-upload the image\n3. Save changes`)
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedImage(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800'
      case 'approved': return 'bg-blue-100 text-blue-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'rejected': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid': return <CheckCircle className="w-4 h-4" />
      case 'approved': return <CheckCircle className="w-4 h-4" />
      case 'pending': return <Clock className="w-4 h-4" />
      case 'rejected': return <XCircle className="w-4 h-4" />
      default: return <Clock className="w-4 h-4" />
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'office': return 'bg-blue-50 text-blue-700 border-blue-200'
      case 'utilities': return 'bg-green-50 text-green-700 border-green-200'
      case 'equipment': return 'bg-purple-50 text-purple-700 border-purple-200'
      case 'maintenance': return 'bg-orange-50 text-orange-700 border-orange-200'
      case 'travel': return 'bg-pink-50 text-pink-700 border-pink-200'
      default: return 'bg-gray-50 text-gray-700 border-gray-200'
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  // Filter bills by month and year
  const filteredBills = bills.filter(bill => {
    const billDate = new Date(bill.date)
    const billMonth = billDate.getMonth() + 1 // 1-12
    const billYear = billDate.getFullYear()

    const monthMatch = selectedMonth === 'all' || billMonth === parseInt(selectedMonth)
    const yearMatch = selectedYear === 'all' || billYear === parseInt(selectedYear)

    return monthMatch && yearMatch
  })

  // Calculate totals based on filtered bills
  const totalAmount = filteredBills.reduce((sum, bill) => sum + bill.amount, 0)
  const paidAmount = filteredBills.filter(bill => bill.status === 'paid').reduce((sum, bill) => sum + bill.amount, 0)
  const pendingAmount = filteredBills.filter(bill => bill.status === 'pending').reduce((sum, bill) => sum + bill.amount, 0)

  // Get available years - automatically generate range
  const getAvailableYears = () => {
    const years = new Set<number>()
    const currentYear = new Date().getFullYear()
    
    // Add bills years if any exist
    bills.forEach(bill => {
      const year = new Date(bill.date).getFullYear()
      years.add(year)
    })
    
    // Automatically add years from 5 years ago to 2 years in future
    for (let i = -5; i <= 2; i++) {
      years.add(currentYear + i)
    }
    
    return Array.from(years).sort((a, b) => b - a)
  }

  const availableYears = getAvailableYears()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <DataCenterLayout 
            variant="header"
            title="Expense Bills Management"
            subtitle="Track and manage all your business expenses"
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
                <DollarSign className="w-4 h-4" />
                Total Expenses
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{formatCurrency(totalAmount)}</div>
              <p className="text-xs text-gray-500 mt-1">{filteredBills.length} bills</p>
            </CardContent>
          </Card>

          <Card className="bg-white border-0 shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                Paid Amount
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{formatCurrency(paidAmount)}</div>
              <p className="text-xs text-gray-500 mt-1">
                {filteredBills.filter(bill => bill.status === 'paid').length} paid bills
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white border-0 shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <Clock className="w-4 h-4 text-yellow-600" />
                Pending Amount
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{formatCurrency(pendingAmount)}</div>
              <p className="text-xs text-gray-500 mt-1">
                {filteredBills.filter(bill => bill.status === 'pending').length} pending bills
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Actions and Filters */}
        <div className="flex flex-col lg:flex-row gap-4 mb-6 items-start lg:items-center justify-between">
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg">
                <Plus className="w-4 h-4 mr-2" />
                Add New Bill
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Expense Bill</DialogTitle>
                <DialogDescription>
                  Create a new expense bill record with image upload
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-6">
                {/* Image Upload */}
                <div className="space-y-2">
                  <Label htmlFor="image">Bill Image (Optional)</Label>
                  <div className="flex items-center gap-4">
                    <Input
                      id="image"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="flex-1"
                    />
                    {imagePreview && (
                      <img 
                        src={imagePreview} 
                        alt="Preview" 
                        className="w-20 h-20 object-cover rounded-lg border"
                      />
                    )}
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Input
                    id="description"
                    value={newBill.description}
                    onChange={(e) => setNewBill(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Enter bill description"
                    required
                  />
                </div>

                {/* Amount */}
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount *</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    min="0"
                    value={newBill.amount || ''}
                    onChange={(e) => setNewBill(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                    placeholder="0.00"
                    required
                  />
                </div>

                {/* Date */}
                <div className="space-y-2">
                  <Label htmlFor="date">Date *</Label>
                  <Input
                    id="date"
                    type="date"
                    value={newBill.date}
                    onChange={(e) => setNewBill(prev => ({ ...prev, date: e.target.value }))}
                    required
                  />
                </div>

                {/* Category */}
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select value={newBill.category} onValueChange={(value) => setNewBill(prev => ({ ...prev, category: value as any }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="office">Office</SelectItem>
                      <SelectItem value="utilities">Utilities</SelectItem>
                      <SelectItem value="equipment">Equipment</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                      <SelectItem value="travel">Travel</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Vendor */}
                <div className="space-y-2">
                  <Label htmlFor="vendor">Vendor *</Label>
                  <Input
                    id="vendor"
                    value={newBill.vendor}
                    onChange={(e) => setNewBill(prev => ({ ...prev, vendor: e.target.value }))}
                    placeholder="Enter vendor name"
                    required
                  />
                </div>

                {/* Status */}
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={newBill.status} onValueChange={(value) => setNewBill(prev => ({ ...prev, status: value as any }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Notes */}
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={newBill.notes}
                    onChange={(e) => setNewBill(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Additional notes (optional)"
                    rows={3}
                  />
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-4">
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddBill} className="bg-blue-600 hover:bg-blue-700">
                    Add Bill
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Filter Section */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <Label htmlFor="filter-month" className="text-sm font-medium whitespace-nowrap">
                Filter by:
              </Label>
            </div>
            
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="w-[140px] bg-white shadow-sm">
                <SelectValue placeholder="Select month" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Months</SelectItem>
                <SelectItem value="1">January</SelectItem>
                <SelectItem value="2">February</SelectItem>
                <SelectItem value="3">March</SelectItem>
                <SelectItem value="4">April</SelectItem>
                <SelectItem value="5">May</SelectItem>
                <SelectItem value="6">June</SelectItem>
                <SelectItem value="7">July</SelectItem>
                <SelectItem value="8">August</SelectItem>
                <SelectItem value="9">September</SelectItem>
                <SelectItem value="10">October</SelectItem>
                <SelectItem value="11">November</SelectItem>
                <SelectItem value="12">December</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="w-[120px] bg-white shadow-sm">
                <SelectValue placeholder="Select year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Years</SelectItem>
                {availableYears.map(year => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {(selectedMonth !== 'all' || selectedYear !== 'all') && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  setSelectedMonth('all')
                  setSelectedYear(new Date().getFullYear().toString())
                }}
                className="text-gray-600 hover:text-gray-900"
              >
                <XCircle className="w-4 h-4 mr-1" />
                Clear Filters
              </Button>
            )}
          </div>
        </div>

        {/* Edit Bill Dialog */}
        {editingBill && (
          <Dialog open={!!editingBill} onOpenChange={(open) => !open && setEditingBill(null)}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Edit Bill</DialogTitle>
                <DialogDescription>
                  Update bill information
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="edit-description">Description *</Label>
                  <Input
                    id="edit-description"
                    value={editingBill.description}
                    onChange={(e) => setEditingBill({ ...editingBill, description: e.target.value })}
                    placeholder="Enter bill description"
                  />
                </div>

                {/* Amount */}
                <div className="space-y-2">
                  <Label htmlFor="edit-amount">Amount *</Label>
                  <Input
                    id="edit-amount"
                    type="number"
                    step="0.01"
                    min="0"
                    value={editingBill.amount}
                    onChange={(e) => setEditingBill({ ...editingBill, amount: parseFloat(e.target.value) || 0 })}
                    placeholder="0.00"
                  />
                </div>

                {/* Date */}
                <div className="space-y-2">
                  <Label htmlFor="edit-date">Date *</Label>
                  <Input
                    id="edit-date"
                    type="date"
                    value={editingBill.date}
                    onChange={(e) => setEditingBill({ ...editingBill, date: e.target.value })}
                  />
                </div>

                {/* Category */}
                <div className="space-y-2">
                  <Label htmlFor="edit-category">Category</Label>
                  <Select 
                    value={editingBill.category} 
                    onValueChange={(value) => setEditingBill({ ...editingBill, category: value as any })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="office">Office</SelectItem>
                      <SelectItem value="utilities">Utilities</SelectItem>
                      <SelectItem value="equipment">Equipment</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                      <SelectItem value="travel">Travel</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Vendor */}
                <div className="space-y-2">
                  <Label htmlFor="edit-vendor">Vendor *</Label>
                  <Input
                    id="edit-vendor"
                    value={editingBill.vendor}
                    onChange={(e) => setEditingBill({ ...editingBill, vendor: e.target.value })}
                    placeholder="Enter vendor name"
                  />
                </div>

                {/* Status */}
                <div className="space-y-2">
                  <Label htmlFor="edit-status">Status</Label>
                  <Select 
                    value={editingBill.status} 
                    onValueChange={(value) => setEditingBill({ ...editingBill, status: value as any })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Notes */}
                <div className="space-y-2">
                  <Label htmlFor="edit-notes">Notes</Label>
                  <Textarea
                    id="edit-notes"
                    value={editingBill.notes || ''}
                    onChange={(e) => setEditingBill({ ...editingBill, notes: e.target.value })}
                    placeholder="Additional notes (optional)"
                    rows={3}
                  />
                </div>

                {/* Current Image Info */}
                {editingBill.imageUrl && (
                  <div className="space-y-2">
                    <Label>Current Image</Label>
                    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded border">
                      {editingBill.imageUrl.startsWith('data:image/') ? (
                        <>
                          <FileText className="w-4 h-4 text-green-600" />
                          <span className="text-sm text-gray-700">
                            {editingBill.imageName || 'Bill image attached'} ✓
                          </span>
                        </>
                      ) : (
                        <>
                          <AlertCircle className="w-4 h-4 text-yellow-600" />
                          <span className="text-sm text-gray-700">
                            Old image (needs re-upload)
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-4">
                  <Button variant="outline" onClick={() => setEditingBill(null)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={() => handleEditBill(editingBill)} 
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Save Changes
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* Bills Table */}
        <Card className="bg-white border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Expense Bills
            </CardTitle>
            <CardDescription>
              Manage all your expense bills and receipts
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : bills.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No bills found</h3>
                <p className="text-gray-500 mb-4">Get started by adding your first expense bill</p>
                <Button onClick={() => setIsAddDialogOpen(true)} className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Add First Bill
                </Button>
              </div>
            ) : filteredBills.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No bills found for selected period</h3>
                <p className="text-gray-500 mb-4">Try changing the month or year filter</p>
                <Button 
                  variant="outline"
                  onClick={() => {
                    setSelectedMonth('all')
                    setSelectedYear(new Date().getFullYear().toString())
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Description</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Vendor</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredBills.map((bill) => (
                      <TableRow key={bill.id}>
                        <TableCell className="font-medium">
                          <div className="max-w-xs">
                            <p className="truncate">{bill.description}</p>
                            {bill.imageName && (
                              <p className="text-xs text-gray-500 mt-1">
                                📎 {bill.imageName}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="font-semibold">
                          {formatCurrency(bill.amount)}
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">
                          {formatDate(bill.date)}
                        </TableCell>
                        <TableCell>
                          <Badge className={`${getCategoryColor(bill.category)} border`}>
                            {bill.category}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">
                          {bill.vendor}
                        </TableCell>
                        <TableCell>
                          <Badge className={`${getStatusColor(bill.status)} flex items-center gap-1 w-fit`}>
                            {getStatusIcon(bill.status)}
                            {bill.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {(bill.imagePath || bill.imageUrl) && (
                              <>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleViewBill(bill)}
                                  className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                  title="View Bill in New Tab"
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDownloadBill(bill)}
                                  className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                  title="Download Bill"
                                >
                                  <Download className="w-4 h-4" />
                                </Button>
                              </>
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setEditingBill(bill)}
                              title="Edit Bill"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteBill(bill.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              title="Delete Bill"
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
      </div>
    </div>
  )
}
