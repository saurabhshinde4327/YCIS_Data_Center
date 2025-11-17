"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Plus, Search, FileText, Eye, Edit, Trash2, Download, Send, AlertCircle, DollarSign, Clock, CheckCircle } from "lucide-react"
import { Invoice } from "@/lib/database"
import InvoiceForm from "./InvoiceForm"
import InvoicePDF from "./InvoicePDF"
import { DataCenterLayout } from "@/components/datacenter-layout"

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [isPDFView, setIsPDFView] = useState(false)

  // Fetch invoices
  const fetchInvoices = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/invoices", { cache: "no-store" })
      let data: any = null
      try { data = await response.json() } catch {}
      if (!response.ok) {
        throw new Error((data && data.error) || `Failed to fetch invoices (${response.status})`)
      }
      setInvoices(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchInvoices()
  }, [])

  // Handle invoice creation/update
  const handleInvoiceSubmit = async (invoiceData: Partial<Invoice>) => {
    try {
      const url = isEditMode && selectedInvoice ? `/api/invoices/${selectedInvoice.id}` : "/api/invoices"
      const method = isEditMode ? "PUT" : "POST"
      
      console.log('Submitting invoice:', invoiceData)
      
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(invoiceData),
      })

      // Get the response data
      let responseData: any = null
      try {
        responseData = await response.json()
      } catch (e) {
        console.error('Failed to parse response:', e)
      }

      console.log('API Response:', { status: response.status, data: responseData })

      if (!response.ok) {
        // Show detailed error message
        const errorMsg = responseData?.details 
          ? `Failed to save invoice: ${responseData.details} (Code: ${responseData.code || 'N/A'})`
          : responseData?.error || "Failed to save invoice"
        throw new Error(errorMsg)
      }

      await fetchInvoices()
      setIsFormOpen(false)
      setSelectedInvoice(null)
      setIsEditMode(false)
    } catch (err) {
      console.error('Invoice submission error:', err)
      setError(err instanceof Error ? err.message : "An error occurred")
    }
  }

  // Handle invoice deletion
  const handleDeleteInvoice = async (id: number) => {
    if (!confirm("Are you sure you want to delete this invoice?")) return

    try {
      const response = await fetch(`/api/invoices/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete invoice")
      }

      await fetchInvoices()
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    }
  }

  // Handle edit invoice
  const handleEditInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice)
    setIsEditMode(true)
    setIsFormOpen(true)
  }

  // Handle view PDF
  const handleViewPDF = (invoice: Invoice) => {
    setSelectedInvoice(invoice)
    setIsPDFView(true)
  }

  // Handle create new invoice
  const handleCreateInvoice = () => {
    setSelectedInvoice(null)
    setIsEditMode(false)
    setIsFormOpen(true)
  }

  // Filter and sort invoices in ascending order by invoice number
  const filteredInvoices = invoices
    .filter(invoice => {
      const matchesSearch = invoice.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = statusFilter === "all" || invoice.status === statusFilter
      return matchesSearch && matchesStatus
    })
    .sort((a, b) => {
      // Extract numeric part from invoice number (e.g., "DC0001" -> 1)
      const numA = parseInt(a.invoiceNumber.replace(/\D/g, '')) || 0
      const numB = parseInt(b.invoiceNumber.replace(/\D/g, '')) || 0
      return numA - numB
    })

  // Get status badge variant
  const getStatusBadgeVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case "paid": return "default"
      case "sent": return "secondary"
      case "draft": return "outline"
      case "overdue": return "destructive"
      default: return "outline"
    }
  }

  // Format currency
  const formatCurrency = (amount: number) => {
    return 'Rs ' + amount.toLocaleString('en-IN', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    })
  }

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  // Calculate summary statistics (from all invoices, not just filtered)
  const totalRevenue = invoices.reduce((sum, inv) => sum + inv.totalAmount, 0)
  const paidAmount = invoices.filter(inv => inv.status.toLowerCase() === 'paid').reduce((sum, inv) => sum + inv.totalAmount, 0)
  const pendingAmount = invoices.filter(inv => inv.status.toLowerCase() !== 'paid').reduce((sum, inv) => sum + inv.totalAmount, 0)

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-sm text-gray-600">Loading invoices...</p>
          </div>
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
            title="Invoice Management"
            subtitle="Create and manage client invoices"
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
                Total Revenue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{formatCurrency(totalRevenue)}</div>
              <p className="text-xs text-gray-500 mt-1">{invoices.length} invoices</p>
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
                {invoices.filter(inv => inv.status.toLowerCase() === 'paid').length} paid invoices
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
                {invoices.filter(inv => inv.status.toLowerCase() !== 'paid').length} pending invoices
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Actions and Create Button */}
        <div className="flex justify-between items-center mb-6">
          <div></div>
          <Button onClick={handleCreateInvoice} className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg">
            <Plus className="h-4 w-4 mr-2" />
            Create Invoice
          </Button>
        </div>

        {/* Filters */}
        <Card className="bg-white border-0 shadow-lg mb-6">
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search by client name or invoice number..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Invoices Table */}
        <Card className="bg-white border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">Invoices ({filteredInvoices.length})</CardTitle>
            <CardDescription className="text-sm">
              Manage your invoices and track their status
            </CardDescription>
          </CardHeader>
        <CardContent>
          {filteredInvoices.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-base sm:text-lg font-semibold">No invoices found</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {searchTerm || statusFilter !== "all" 
                  ? "Try adjusting your search or filter criteria"
                  : "Get started by creating your first invoice"
                }
              </p>
              {!searchTerm && statusFilter === "all" && (
                <Button onClick={handleCreateInvoice} className="bg-blue-600 hover:bg-blue-700 text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Invoice
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto -mx-6 sm:mx-0">
              <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs sm:text-sm">Invoice #</TableHead>
                  <TableHead className="text-xs sm:text-sm">Client</TableHead>
                  <TableHead className="hidden md:table-cell text-xs sm:text-sm">Issue Date</TableHead>
                  <TableHead className="hidden lg:table-cell text-xs sm:text-sm">Due Date</TableHead>
                  <TableHead className="text-xs sm:text-sm">Amount</TableHead>
                  <TableHead className="text-xs sm:text-sm">Status</TableHead>
                  <TableHead className="text-right text-xs sm:text-sm">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-medium text-xs sm:text-sm">
                      {invoice.invoiceNumber}
                    </TableCell>
                    <TableCell className="text-xs sm:text-sm">
                      <div>
                        <div className="font-medium">{invoice.clientName}</div>
                        {invoice.clientEmail && (
                          <div className="text-xs text-muted-foreground hidden sm:block">
                            {invoice.clientEmail}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-xs sm:text-sm">{formatDate(invoice.issueDate)}</TableCell>
                    <TableCell className="hidden lg:table-cell text-xs sm:text-sm">{formatDate(invoice.dueDate)}</TableCell>
                    <TableCell className="font-medium text-xs sm:text-sm">
                      {formatCurrency(invoice.totalAmount)}
                    </TableCell>
                    <TableCell className="text-xs sm:text-sm">
                      <Badge variant={getStatusBadgeVariant(invoice.status)} className="text-xs">
                        {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1 sm:gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewPDF(invoice)}
                          className="h-8 w-8 p-0 sm:h-9 sm:w-9"
                        >
                          <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditInvoice(invoice)}
                          className="h-8 w-8 p-0 sm:h-9 sm:w-9"
                        >
                          <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteInvoice(Number(invoice.id))}
                          className="h-8 w-8 p-0 sm:h-9 sm:w-9"
                        >
                          <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
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

      {/* Invoice Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isEditMode ? "Edit Invoice" : "Create New Invoice"}
            </DialogTitle>
            <DialogDescription>
              {isEditMode 
                ? "Update the invoice details below."
                : "Fill in the invoice details below to create a new invoice."
              }
            </DialogDescription>
          </DialogHeader>
          <InvoiceForm
            invoice={selectedInvoice}
            onSubmit={handleInvoiceSubmit}
            onCancel={() => {
              setIsFormOpen(false)
              setSelectedInvoice(null)
              setIsEditMode(false)
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Invoice Details Dialog */}
      {selectedInvoice && !isFormOpen && (
        <Dialog open={!!selectedInvoice} onOpenChange={() => setSelectedInvoice(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Invoice Details</DialogTitle>
              <DialogDescription>
                Invoice #{selectedInvoice.invoiceNumber}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6">
              {/* Invoice Header */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-2">Bill To:</h3>
                  <div className="text-sm">
                    <div className="font-medium">{selectedInvoice.clientName}</div>
                    {selectedInvoice.clientEmail && (
                      <div>{selectedInvoice.clientEmail}</div>
                    )}
                    {selectedInvoice.clientPhone && (
                      <div>{selectedInvoice.clientPhone}</div>
                    )}
                    {selectedInvoice.clientAddress && (
                      <div className="whitespace-pre-line">{selectedInvoice.clientAddress}</div>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm text-muted-foreground">Issue Date:</span>
                      <div>{formatDate(selectedInvoice.issueDate)}</div>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Due Date:</span>
                      <div>{formatDate(selectedInvoice.dueDate)}</div>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Status:</span>
                      <div>
                        <Badge variant={getStatusBadgeVariant(selectedInvoice.status)}>
                          {selectedInvoice.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Invoice Items */}
              {selectedInvoice.items && selectedInvoice.items.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-4">Items</h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Description</TableHead>
                        <TableHead className="text-right">Quantity</TableHead>
                        <TableHead className="text-right">Unit Price</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedInvoice.items.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>{item.description}</TableCell>
                          <TableCell className="text-right">{item.quantity}</TableCell>
                          <TableCell className="text-right">{formatCurrency(item.unitPrice)}</TableCell>
                          <TableCell className="text-right">{formatCurrency(item.totalPrice)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}

              {/* Invoice Totals */}
              <div className="border-t pt-4">
                <div className="flex justify-end">
                  <div className="w-64 space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>{formatCurrency(selectedInvoice.subtotal)}</span>
                    </div>
                    {selectedInvoice.taxRate > 0 && (
                      <div className="flex justify-between">
                        <span>Tax ({selectedInvoice.taxRate}%):</span>
                        <span>{formatCurrency(selectedInvoice.taxAmount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-semibold text-lg border-t pt-2">
                      <span>Total:</span>
                      <span>{formatCurrency(selectedInvoice.totalAmount)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {selectedInvoice.notes && (
                <div>
                  <h3 className="font-semibold mb-2">Notes</h3>
                  <p className="text-sm text-muted-foreground whitespace-pre-line">
                    {selectedInvoice.notes}
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => setSelectedInvoice(null)}
                >
                  Close
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleEditInvoice(selectedInvoice)}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button>
                  <Send className="h-4 w-4 mr-2" />
                  Send Invoice
                </Button>
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* PDF View Dialog */}
      {selectedInvoice && isPDFView && (
        <Dialog open={isPDFView} onOpenChange={setIsPDFView}>
          <DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Invoice Preview</DialogTitle>
              <DialogDescription>
                Invoice #{selectedInvoice.invoiceNumber}
              </DialogDescription>
            </DialogHeader>
            <InvoicePDF 
              invoice={selectedInvoice} 
              onClose={() => {
                setIsPDFView(false)
                setSelectedInvoice(null)
              }}
            />
          </DialogContent>
        </Dialog>
      )}
      </div>
    </div>
  )
}
