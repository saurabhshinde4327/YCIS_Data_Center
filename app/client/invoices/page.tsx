"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { generateInvoicePDF } from '@/lib/pdfGenerator'
import { DataCenterLayout } from "@/components/datacenter-layout"
import { 
  FileText,
  Download,
  Eye,
  Calendar,
  DollarSign,
  CheckCircle,
  Clock
} from "lucide-react"

interface Invoice {
  id: string
  invoiceNumber: string
  clientName: string
  clientEmail: string
  clientAddress?: string
  issueDate: string
  dueDate: string
  totalAmount: number
  status: string
  items?: any[]
  subtotal?: number
  taxRate?: number
  taxAmount?: number
  notes?: string
}

export default function ClientInvoicesPage() {
  const router = useRouter()
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loadingInvoices, setLoadingInvoices] = useState(false)
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)
  const [showInvoiceDialog, setShowInvoiceDialog] = useState(false)

  const formatCurrency = (amount: number) => {
    return 'Rs ' + amount.toLocaleString('en-IN', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    })
  }

  useEffect(() => {
    const clientData = sessionStorage.getItem("client")
    
    if (!clientData) {
      router.push("/client/signin")
      return
    }

    try {
      const parsedClient = JSON.parse(clientData)
      fetchClientInvoices(parsedClient.email)
    } catch (error) {
      console.error("Error parsing client data:", error)
      router.push("/client/signin")
    }
  }, [router])

  const fetchClientInvoices = async (email: string) => {
    try {
      setLoadingInvoices(true)
      const response = await fetch(`/api/invoices/by-client?email=${encodeURIComponent(email)}`)
      
      if (response.ok) {
        const data = await response.json()
        setInvoices(data)
      }
    } catch (error) {
      console.error("Error fetching invoices:", error)
    } finally {
      setLoadingInvoices(false)
    }
  }

  const handleDownloadInvoice = (invoice: Invoice) => {
    try {
      generateInvoicePDF({
        invoiceNumber: invoice.invoiceNumber,
        clientName: invoice.clientName,
        clientEmail: invoice.clientEmail,
        clientAddress: invoice.clientAddress,
        issueDate: invoice.issueDate,
        dueDate: invoice.dueDate,
        status: invoice.status,
        items: invoice.items || [],
        subtotal: invoice.subtotal || 0,
        taxRate: invoice.taxRate || 0,
        taxAmount: invoice.taxAmount || 0,
        totalAmount: invoice.totalAmount,
        notes: invoice.notes
      })
    } catch (error) {
      console.error('Download error:', error)
      alert('Failed to download PDF. Please try again.')
    }
  }

  const handleViewInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice)
    setShowInvoiceDialog(true)
  }

  // Calculate summary statistics
  const totalAmount = invoices.reduce((sum, inv) => sum + inv.totalAmount, 0)
  const paidAmount = invoices.filter(inv => inv.status === 'Paid' || inv.status === 'paid').reduce((sum, inv) => sum + inv.totalAmount, 0)
  const pendingAmount = invoices.filter(inv => inv.status !== 'Paid' && inv.status !== 'paid').reduce((sum, inv) => sum + inv.totalAmount, 0)

  if (loadingInvoices) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading invoices...</p>
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
            title="My Invoices"
            subtitle="View and download your invoices"
          />
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-white border-0 shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Total Amount
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{formatCurrency(totalAmount)}</div>
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
                {invoices.filter(inv => inv.status === 'Paid' || inv.status === 'paid').length} paid
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
                {invoices.filter(inv => inv.status !== 'Paid' && inv.status !== 'paid').length} pending
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Invoices List */}
        <Card className="bg-white border-0 shadow-lg">
        <CardHeader className="border-b border-gray-200">
          <CardTitle className="text-lg font-semibold text-gray-900">All Invoices</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          {invoices.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">No Invoices Yet</h3>
              <p className="text-gray-600">
                You don't have any invoices at the moment.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {invoices.map((invoice) => (
                <div 
                  key={invoice.id} 
                  className="p-5 bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h4 className="font-semibold text-base text-gray-900">{invoice.invoiceNumber}</h4>
                        <Badge className={
                          invoice.status === 'Paid' || invoice.status === 'paid' 
                            ? 'bg-green-100 text-green-700 border-green-200' 
                            : invoice.status === 'Overdue' || invoice.status === 'overdue'
                            ? 'bg-red-100 text-red-700 border-red-200'
                            : 'bg-yellow-100 text-yellow-700 border-yellow-200'
                        }>
                          {invoice.status}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 border-t border-gray-100">
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Issue Date</p>
                          <p className="text-sm font-medium text-gray-900">
                            {new Date(invoice.issueDate).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-gray-500 mb-1">Due Date</p>
                          <p className="text-sm font-medium text-gray-900">
                            {new Date(invoice.dueDate).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-gray-500 mb-1">Amount (INR)</p>
                          <p className="text-base font-semibold text-gray-900">
                            {formatCurrency(invoice.totalAmount)}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleViewInvoice(invoice)}
                        variant="outline"
                        size="sm"
                        className="flex-1 sm:flex-none"
                      >
                        <Eye className="w-4 h-4 sm:mr-2" />
                        <span className="hidden sm:inline">View</span>
                      </Button>
                      <Button
                        onClick={() => handleDownloadInvoice(invoice)}
                        size="sm"
                        className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700"
                      >
                        <Download className="w-4 h-4 sm:mr-2" />
                        <span className="hidden sm:inline">Download</span>
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Invoice Details Dialog */}
      {selectedInvoice && (
        <Dialog open={showInvoiceDialog} onOpenChange={setShowInvoiceDialog}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-blue-900">
                <FileText className="w-5 h-5" />
                Invoice Details - {selectedInvoice.invoiceNumber}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-6 mt-4">
              {/* Invoice Header */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">{selectedInvoice.invoiceNumber}</h3>
                    <p className="text-sm text-gray-600 mt-1">YCIS Data & Technology Center</p>
                  </div>
                  <Badge className={
                    selectedInvoice.status === 'Paid' || selectedInvoice.status === 'paid' 
                      ? 'bg-green-100 text-green-700 border-green-200' 
                      : selectedInvoice.status === 'Overdue' || selectedInvoice.status === 'overdue'
                      ? 'bg-red-100 text-red-700 border-red-200'
                      : 'bg-yellow-100 text-yellow-700 border-yellow-200'
                  }>
                    {selectedInvoice.status}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Issue Date</p>
                    <p className="font-semibold text-gray-900">
                      {new Date(selectedInvoice.issueDate).toLocaleDateString('en-IN', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Due Date</p>
                    <p className="font-semibold text-gray-900">
                      {new Date(selectedInvoice.dueDate).toLocaleDateString('en-IN', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              </div>

              {/* Items */}
              {selectedInvoice.items && selectedInvoice.items.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Items:</h4>
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Description</th>
                          <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Qty</th>
                          <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Price (INR)</th>
                          <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Total (INR)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedInvoice.items.map((item: any, index: number) => (
                          <tr key={index} className="border-t border-gray-200">
                            <td className="py-3 px-4 text-sm text-gray-900">{item.description}</td>
                            <td className="py-3 px-4 text-sm text-center text-gray-900">{item.quantity}</td>
                            <td className="py-3 px-4 text-sm text-right text-gray-900">
                              {formatCurrency(item.unitPrice)}
                            </td>
                            <td className="py-3 px-4 text-sm text-right font-semibold text-gray-900">
                              {formatCurrency(item.totalPrice)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Totals */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal (INR):</span>
                    <span className="font-semibold text-gray-900">
                      {formatCurrency(selectedInvoice.subtotal || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tax ({selectedInvoice.taxRate || 0}%):</span>
                    <span className="font-semibold text-gray-900">
                      {formatCurrency(selectedInvoice.taxAmount || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between text-lg pt-2 border-t border-gray-300">
                    <span className="font-bold text-gray-900">Total Amount (INR):</span>
                    <span className="font-bold text-blue-900">
                      {formatCurrency(selectedInvoice.totalAmount)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {selectedInvoice.notes && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Notes:</h4>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-gray-700">{selectedInvoice.notes}</p>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <Button
                  onClick={() => handleDownloadInvoice(selectedInvoice)}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Invoice
                </Button>
                <Button
                  onClick={() => setShowInvoiceDialog(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Close
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

