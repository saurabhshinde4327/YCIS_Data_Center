"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Plus, Trash2, Calculator } from "lucide-react"
import { Invoice, InvoiceItem } from "@/lib/database"

interface InvoiceFormProps {
  invoice?: Invoice | null
  onSubmit: (invoice: Partial<Invoice>) => void
  onCancel: () => void
}

export default function InvoiceForm({ invoice, onSubmit, onCancel }: InvoiceFormProps) {
  const [formData, setFormData] = useState({
    invoiceNumber: "",
    clientName: "",
    clientEmail: "",
    clientAddress: "",
    clientPhone: "",
    issueDate: "",
    dueDate: "",
    renewalDate: "",
    taxRate: 0,
    status: "Draft" as "Draft" | "Sent" | "Paid" | "Overdue" | "Cancelled",
    notes: ""
  })

  const [items, setItems] = useState<InvoiceItem[]>([])
  const [newItem, setNewItem] = useState({
    description: "",
    quantity: 1,
    unitPrice: 0
  })
  const [error, setError] = useState("")
  const [isGeneratingNumber, setIsGeneratingNumber] = useState(false)
  const [clients, setClients] = useState<any[]>([])
  const [loadingClients, setLoadingClients] = useState(false)

  // Fetch clients for dropdown
  useEffect(() => {
    const fetchClients = async () => {
      try {
        setLoadingClients(true)
        const response = await fetch('/api/clients')
        if (response.ok) {
          const data = await response.json()
          setClients(data)
        }
      } catch (err) {
        console.error('Failed to fetch clients:', err)
      } finally {
        setLoadingClients(false)
      }
    }
    fetchClients()
  }, [])

  // Initialize form data
  useEffect(() => {
    if (invoice) {
      setFormData({
        invoiceNumber: invoice.invoiceNumber,
        clientName: invoice.clientName,
        clientEmail: invoice.clientEmail || "",
        clientAddress: invoice.clientAddress || "",
        clientPhone: invoice.clientPhone || "",
        issueDate: invoice.issueDate,
        dueDate: invoice.dueDate,
        renewalDate: invoice.renewalDate || "",
        taxRate: invoice.taxRate,
        status: invoice.status,
        notes: invoice.notes || ""
      })
      setItems(invoice.items || [])
    } else {
      // Set default dates for new invoice
      const today = new Date().toISOString().split('T')[0]
      const dueDate = new Date()
      dueDate.setDate(dueDate.getDate() + 30)
      const dueDateString = dueDate.toISOString().split('T')[0]
      
      setFormData(prev => ({
        ...prev,
        issueDate: today,
        dueDate: dueDateString
      }))
    }
  }, [invoice])

  // Generate invoice number
  const generateInvoiceNumber = async () => {
    try {
      setIsGeneratingNumber(true)
      const response = await fetch("/api/invoices/generate-number")
      if (response.ok) {
        const data = await response.json()
        setFormData(prev => ({ ...prev, invoiceNumber: data.invoiceNumber }))
      }
    } catch (err) {
      setError("Failed to generate invoice number")
    } finally {
      setIsGeneratingNumber(false)
    }
  }

  // Add new item
  const addItem = () => {
    if (!newItem.description.trim()) {
      setError("Item description is required")
      return
    }

    const totalPrice = newItem.quantity * newItem.unitPrice
    const item: InvoiceItem = {
      description: newItem.description,
      quantity: newItem.quantity,
      unitPrice: newItem.unitPrice,
      totalPrice
    }

    setItems(prev => [...prev, item])
    setNewItem({ description: "", quantity: 1, unitPrice: 0 })
    setError("")
  }

  // Remove item
  const removeItem = (index: number) => {
    setItems(prev => prev.filter((_, i) => i !== index))
  }

  // Calculate totals
  const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0)
  const taxAmount = subtotal * (formData.taxRate / 100)
  const totalAmount = subtotal + taxAmount

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    // Validation
    if (!formData.invoiceNumber.trim()) {
      setError("Invoice number is required")
      return
    }
    if (!formData.clientEmail.trim()) {
      setError("Please select a client from the dropdown")
      return
    }
    if (!formData.clientName.trim()) {
      setError("Client name is required")
      return
    }
    if (!formData.issueDate) {
      setError("Issue date is required")
      return
    }
    if (!formData.dueDate) {
      setError("Due date is required")
      return
    }
    if (items.length === 0) {
      setError("At least one item is required")
      return
    }

    const invoiceData: Partial<Invoice> = {
      ...formData,
      subtotal,
      taxAmount,
      totalAmount,
      items
    }

    onSubmit(invoiceData)
  }

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Invoice Header */}
      <Card>
        <CardHeader>
          <CardTitle>Invoice Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="invoiceNumber">Invoice Number *</Label>
              <div className="flex gap-2">
                <Input
                  id="invoiceNumber"
                  value={formData.invoiceNumber}
                  onChange={(e) => setFormData(prev => ({ ...prev, invoiceNumber: e.target.value }))}
                  placeholder="INV-2024-0001"
                  required
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={generateInvoiceNumber}
                  disabled={isGeneratingNumber}
                >
                  {isGeneratingNumber ? "Generating..." : "Generate"}
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value: any) => setFormData(prev => ({ ...prev, status: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Draft">Draft</SelectItem>
                  <SelectItem value="Sent">Sent</SelectItem>
                  <SelectItem value="Paid">Paid</SelectItem>
                  <SelectItem value="Overdue">Overdue</SelectItem>
                  <SelectItem value="Cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="issueDate">Issue Date *</Label>
              <Input
                id="issueDate"
                type="date"
                value={formData.issueDate}
                onChange={(e) => setFormData(prev => ({ ...prev, issueDate: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dueDate">Due Date *</Label>
              <Input
                id="dueDate"
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="renewalDate">Renewal Date</Label>
              <Input
                id="renewalDate"
                type="date"
                value={formData.renewalDate}
                onChange={(e) => setFormData(prev => ({ ...prev, renewalDate: e.target.value }))}
                placeholder="Optional service renewal date"
              />
              <p className="text-xs text-gray-500">Service renewal date (optional)</p>
            </div>
            <div></div>
          </div>
        </CardContent>
      </Card>

      {/* Client Information */}
      <Card>
        <CardHeader>
          <CardTitle>Client Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="clientEmail">Select Client *</Label>
            <Select
              value={formData.clientEmail}
              onValueChange={(value) => {
                const selectedClient = clients.find(c => c.email === value)
                setFormData(prev => ({ 
                  ...prev, 
                  clientEmail: value,
                  clientName: selectedClient?.name || prev.clientName,
                  clientPhone: selectedClient?.phone || prev.clientPhone,
                  clientAddress: selectedClient?.company || prev.clientAddress
                }))
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder={loadingClients ? "Loading clients..." : "Select a client email"} />
              </SelectTrigger>
              <SelectContent>
                {clients.length === 0 ? (
                  <SelectItem value="none" disabled>No clients available</SelectItem>
                ) : (
                  clients.map((client) => (
                    <SelectItem key={client.id} value={client.email}>
                      {client.name} ({client.email})
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500">
              Client information will be auto-filled
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="clientName">Client Name *</Label>
              <Input
                id="clientName"
                value={formData.clientName}
                onChange={(e) => setFormData(prev => ({ ...prev, clientName: e.target.value }))}
                placeholder="Auto-filled from client selection"
                required
                readOnly
                className="bg-gray-50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="clientEmailDisplay">Client Email</Label>
              <Input
                id="clientEmailDisplay"
                type="email"
                value={formData.clientEmail}
                placeholder="Auto-filled from client selection"
                readOnly
                className="bg-gray-50"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="clientPhone">Client Phone</Label>
            <Input
              id="clientPhone"
              value={formData.clientPhone}
              onChange={(e) => setFormData(prev => ({ ...prev, clientPhone: e.target.value }))}
              placeholder="+1 (555) 123-4567"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="clientAddress">Client Address</Label>
            <Textarea
              id="clientAddress"
              value={formData.clientAddress}
              onChange={(e) => setFormData(prev => ({ ...prev, clientAddress: e.target.value }))}
              placeholder="123 Main St, City, State 12345"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Invoice Items */}
      <Card>
        <CardHeader>
          <CardTitle>Invoice Items</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Add New Item */}
          <div className="grid grid-cols-4 gap-4">
            <div className="col-span-2">
              <Label htmlFor="itemDescription">Description</Label>
              <Input
                id="itemDescription"
                value={newItem.description}
                onChange={(e) => setNewItem(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Service or product description"
              />
            </div>
            <div>
              <Label htmlFor="itemQuantity">Quantity</Label>
              <Input
                id="itemQuantity"
                type="number"
                min="1"
                value={newItem.quantity}
                onChange={(e) => setNewItem(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}
              />
            </div>
            <div>
              <Label htmlFor="itemUnitPrice">Unit Price</Label>
              <Input
                id="itemUnitPrice"
                type="number"
                step="0.01"
                min="0"
                value={newItem.unitPrice}
                onChange={(e) => setNewItem(prev => ({ ...prev, unitPrice: parseFloat(e.target.value) || 0 }))}
              />
            </div>
          </div>

          <Button
            type="button"
            onClick={addItem}
            disabled={!newItem.description.trim()}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Item
          </Button>

          {/* Items Table */}
          {items.length > 0 && (
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Quantity</TableHead>
                    <TableHead className="text-right">Unit Price</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>{item.description}</TableCell>
                      <TableCell className="text-right">{item.quantity}</TableCell>
                      <TableCell className="text-right">{formatCurrency(item.unitPrice)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(item.totalPrice)}</TableCell>
                      <TableCell>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeItem(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tax and Totals */}
      <Card>
        <CardHeader>
          <CardTitle>Tax & Totals</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="taxRate">Tax Rate (%)</Label>
            <Input
              id="taxRate"
              type="number"
              step="0.01"
              min="0"
              max="100"
              value={formData.taxRate}
              onChange={(e) => setFormData(prev => ({ ...prev, taxRate: parseFloat(e.target.value) || 0 }))}
              placeholder="0.00"
            />
          </div>

          <div className="border-t pt-4">
            <div className="flex justify-end">
              <div className="w-64 space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                {formData.taxRate > 0 && (
                  <div className="flex justify-between">
                    <span>Tax ({formData.taxRate}%):</span>
                    <span>{formatCurrency(taxAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between font-semibold text-lg border-t pt-2">
                  <span>Total:</span>
                  <span>{formatCurrency(totalAmount)}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notes */}
      <Card>
        <CardHeader>
          <CardTitle>Additional Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Any additional notes or terms..."
              rows={4}
            />
          </div>
        </CardContent>
      </Card>

      {/* Form Actions */}
      <div className="flex justify-end gap-4 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          <Calculator className="h-4 w-4 mr-2" />
          {invoice ? "Update Invoice" : "Create Invoice"}
        </Button>
      </div>
    </form>
  )
}

