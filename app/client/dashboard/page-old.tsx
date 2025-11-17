"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { generateInvoicePDF } from '@/lib/pdfGenerator'
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  Package, 
  FileText, 
  LogOut,
  Settings,
  CreditCard,
  Activity,
  Download,
  Eye,
  HelpCircle,
  Send,
  RefreshCw,
  CheckCircle2
} from "lucide-react"

interface ClientData {
  id: string
  name: string
  email: string
  phone?: string
  company?: string
  package?: string
  status: string
  projectStatus?: string
  renewalDate?: string
  createdAt: string
}

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

export default function ClientDashboardPage() {
  const router = useRouter()
  const [client, setClient] = useState<ClientData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loadingInvoices, setLoadingInvoices] = useState(false)
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)
  const [showInvoiceDialog, setShowInvoiceDialog] = useState(false)
  
  // Ticket state
  const [showTicketDialog, setShowTicketDialog] = useState(false)
  const [ticketSubject, setTicketSubject] = useState("")
  const [ticketDescription, setTicketDescription] = useState("")
  const [ticketCategory, setTicketCategory] = useState("general")
  const [ticketPriority, setTicketPriority] = useState("medium")
  const [submittingTicket, setSubmittingTicket] = useState(false)
  const [ticketSuccess, setTicketSuccess] = useState(false)
  const [ticketError, setTicketError] = useState("")

  useEffect(() => {
    // Check if client is logged in
    const clientData = sessionStorage.getItem("client")
    
    if (!clientData) {
      router.push("/client/signin")
      return
    }

    try {
      const parsedClient = JSON.parse(clientData)
      setClient(parsedClient)
      
      // Fetch client's invoices
      fetchClientInvoices(parsedClient.email)
    } catch (error) {
      console.error("Error parsing client data:", error)
      router.push("/client/signin")
    } finally {
      setIsLoading(false)
    }
  }, [router])

  const fetchClientInvoices = async (email: string) => {
    try {
      setLoadingInvoices(true)
      console.log('Fetching invoices for client:', email)
      
      const response = await fetch(`/api/invoices/by-client?email=${encodeURIComponent(email)}`)
      console.log('Response status:', response.status)
      
      if (response.ok) {
        const data = await response.json()
        console.log('Invoices received:', data.length, 'invoices')
        console.log('Invoice data:', data)
        setInvoices(data)
      } else {
        console.error('Failed to fetch invoices:', response.statusText)
      }
    } catch (error) {
      console.error("Error fetching invoices:", error)
    } finally {
      setLoadingInvoices(false)
    }
  }

  const handleLogout = () => {
    sessionStorage.removeItem("client")
    router.push("/client/signin")
  }

  const handleDownloadInvoice = (invoice: Invoice) => {
    try {
      console.log('Downloading invoice:', invoice.invoiceNumber)
      
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

  const handleDownloadInvoiceOLD = (invoice: Invoice) => {
    try {
      console.log('Starting PDF generation for invoice (OLD):', invoice)
      
      if (!invoice || !invoice.invoiceNumber) {
        alert('Invoice data is missing. Please try again.')
        return
      }
      
      const doc = new jsPDF()
      
      // Ensure all text values are strings
      const safeText = (value: any): string => {
        if (value === null || value === undefined) return ''
        return String(value)
      }
      
      // Helper function to center text
      const centerText = (text: string, y: number) => {
        try {
          const safeStr = safeText(text)
          if (!safeStr) return
          const textWidth = doc.getTextWidth(safeStr)
          const x = (210 - textWidth) / 2
          doc.text(safeStr, x, y)
        } catch (e) {
          console.error('Error in centerText:', e, text)
        }
      }
      
      // Helper function for right-aligned text
      const rightText = (text: string, x: number, y: number) => {
        try {
          const safeStr = safeText(text)
          if (!safeStr) return
          const textWidth = doc.getTextWidth(safeStr)
          doc.text(safeStr, x - textWidth, y)
        } catch (e) {
          console.error('Error in rightText:', e, text)
        }
      }
      
      // Safe text method wrapper
      const safeAddText = (text: string, x: number, y: number) => {
        try {
          const safeStr = safeText(text)
          if (!safeStr) return
          doc.text(safeStr, x, y)
        } catch (e) {
          console.error('Error adding text:', e, text)
        }
      }
      
      // Set colors
      const primaryColor = [37, 99, 235] // Blue-600
      const accentColor = [59, 130, 246] // Blue-500
      const darkColor = [15, 23, 42] // Gray-900
      const lightGray = [243, 244, 246] // Gray-100

      // Add border
      doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2])
      doc.setLineWidth(1)
      doc.rect(10, 10, 190, 277)

      // Company Logo/Header Section
      doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2])
      doc.rect(10, 10, 190, 35, 'F')
      
      // Company name
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(22)
      doc.setFont('helvetica', 'bold')
      centerText('YCIS DATA & TECHNOLOGY CENTER', 22)
      
      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      centerText('Yashavantrao Chavan Institute of Science', 30)
      centerText('Satara, Maharashtra, India', 36)

      // INVOICE Title
      let yPos = 55
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2])
      doc.setFontSize(24)
      doc.setFont('helvetica', 'bold')
      centerText('INVOICE', yPos)
      
      yPos += 15

      // Invoice Info Box
      doc.setDrawColor(200, 200, 200)
      doc.setLineWidth(0.5)
      doc.rect(20, yPos, 85, 25)
      doc.rect(105, yPos, 85, 25)
      
      // Left box - Invoice details
      doc.setTextColor(darkColor[0], darkColor[1], darkColor[2])
      doc.setFontSize(10)
      doc.setFont('helvetica', 'bold')
      safeAddText('Invoice Number:', 23, yPos + 7)
      doc.setFont('helvetica', 'normal')
      safeAddText(safeText(invoice.invoiceNumber), 23, yPos + 13)
      
      doc.setFont('helvetica', 'bold')
      safeAddText('Issue Date:', 23, yPos + 19)
      doc.setFont('helvetica', 'normal')
      safeAddText(new Date(invoice.issueDate).toLocaleDateString('en-IN'), 23, yPos + 25)

      // Right box - Status and Due Date
      doc.setFont('helvetica', 'bold')
      safeAddText('Status:', 108, yPos + 7)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(
        invoice.status === 'Paid' || invoice.status === 'paid' ? [34, 197, 94] : 
        invoice.status === 'Overdue' || invoice.status === 'overdue' ? [239, 68, 68] : 
        [234, 179, 8]
      )
      safeAddText(safeText(invoice.status).toUpperCase(), 108, yPos + 13)
      
      doc.setTextColor(darkColor[0], darkColor[1], darkColor[2])
      doc.setFont('helvetica', 'bold')
      safeAddText('Due Date:', 108, yPos + 19)
      doc.setFont('helvetica', 'normal')
      safeAddText(new Date(invoice.dueDate).toLocaleDateString('en-IN'), 108, yPos + 25)
      
      yPos += 35

      // Bill To Section with box
      doc.setFillColor(lightGray[0], lightGray[1], lightGray[2])
      doc.rect(20, yPos, 170, 25, 'F')
      doc.setDrawColor(200, 200, 200)
      doc.rect(20, yPos, 170, 25)
      
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2])
      doc.setFontSize(11)
      doc.setFont('helvetica', 'bold')
      safeAddText('BILL TO:', 23, yPos + 7)
      
      doc.setTextColor(darkColor[0], darkColor[1], darkColor[2])
      doc.setFontSize(12)
      doc.setFont('helvetica', 'bold')
      safeAddText(safeText(invoice.clientName), 23, yPos + 14)
      
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(9)
      safeAddText('Email: ' + safeText(invoice.clientEmail), 23, yPos + 20)
      
      yPos += 35
      
      // Items table section title
      doc.setFontSize(12)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2])
      doc.text('INVOICE ITEMS', 20, yPos)
      
      yPos += 8
      
      // Items table header with blue background
      doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2])
      doc.rect(20, yPos - 6, 170, 10, 'F')
      
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(10)
      doc.setFont('helvetica', 'bold')
      doc.text('S.No', 25, yPos)
      doc.text('Description', 40, yPos)
      doc.text('Qty', 125, yPos, { align: 'center' })
      doc.text('Rate (₹)', 150, yPos, { align: 'right' })
      doc.text('Amount (₹)', 183, yPos, { align: 'right' })
      
      yPos += 8
      
      // Items
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(9)
      doc.setTextColor(darkColor[0], darkColor[1], darkColor[2])
      
      if (invoice.items && invoice.items.length > 0) {
        invoice.items.forEach((item: any, index: number) => {
          // Check if we need a new page
          if (yPos > 240) {
            doc.addPage()
            yPos = 20
          }
          
          // Alternate row background
          if (index % 2 === 0) {
            doc.setFillColor(lightGray[0], lightGray[1], lightGray[2])
            doc.rect(20, yPos - 4, 170, 10, 'F')
          }
          
          // Serial number
          safeAddText((index + 1).toString(), 25, yPos)
          
          // Item description (wrap if too long)
          const itemDesc = safeText(item.description)
          const descLines = doc.splitTextToSize(itemDesc, 75)
          safeAddText(descLines[0] || '', 40, yPos)
          
          // Quantity, price, total
          safeAddText(safeText(item.quantity), 120, yPos)
          rightText(safeText(item.unitPrice.toLocaleString('en-IN')), 165, yPos)
          
          doc.setFont('helvetica', 'bold')
          rightText(safeText(item.totalPrice.toLocaleString('en-IN')), 188, yPos)
          doc.setFont('helvetica', 'normal')
          
          yPos += Math.max(8, 5 * descLines.length)
        })
      }
      
      // Bottom border for table
      doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2])
      doc.setLineWidth(0.5)
      doc.line(20, yPos, 190, yPos)
      
      yPos += 10
      
      // Totals section in a box
      const totalsBoxY = yPos
      doc.setDrawColor(200, 200, 200)
      doc.rect(120, totalsBoxY, 70, 30)
      
      doc.setTextColor(darkColor[0], darkColor[1], darkColor[2])
      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      
      // Subtotal
      yPos = totalsBoxY + 7
      safeAddText('Subtotal:', 123, yPos)
      const subtotalVal = Number(invoice.subtotal || 0)
      const subtotalStr = 'Rs ' + subtotalVal.toLocaleString('en-IN')
      rightText(subtotalStr, 188, yPos)
      
      // Tax
      yPos += 6
      const taxRate = Number(invoice.taxRate || 0)
      safeAddText('Tax (' + taxRate + '%):', 123, yPos)
      const taxVal = Number(invoice.taxAmount || 0)
      const taxStr = 'Rs ' + taxVal.toLocaleString('en-IN')
      rightText(taxStr, 188, yPos)
      
      // Divider line
      yPos += 4
      doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2])
      doc.setLineWidth(0.5)
      doc.line(123, yPos, 187, yPos)
      
      // Total (highlighted with blue background)
      yPos += 6
      doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2])
      doc.rect(120, yPos - 4, 70, 10, 'F')
      
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(12)
      doc.setTextColor(255, 255, 255)
      safeAddText('TOTAL AMOUNT:', 123, yPos)
      const totalVal = Number(invoice.totalAmount || 0)
      const totalStr = 'Rs ' + totalVal.toLocaleString('en-IN')
      rightText(totalStr, 188, yPos)
      
      yPos = totalsBoxY + 40
      
      // Notes section with box
      if (invoice.notes && safeText(invoice.notes)) {
        yPos += 10
        
        doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2])
        doc.setFontSize(11)
        doc.setFont('helvetica', 'bold')
        safeAddText('NOTES:', 20, yPos)
        
        yPos += 5
        
        doc.setFillColor(255, 251, 235) // Yellow tint
        doc.rect(20, yPos, 170, 20, 'F')
        doc.setDrawColor(234, 179, 8)
        doc.rect(20, yPos, 170, 20)
        
        doc.setTextColor(darkColor[0], darkColor[1], darkColor[2])
        doc.setFontSize(9)
        doc.setFont('helvetica', 'normal')
        
        safeAddText(safeText(invoice.notes), 23, yPos + 6)
        
        yPos += 25
      }
      
      // Terms & Conditions box
      yPos += 10
      if (yPos > 245) {
        doc.addPage()
        yPos = 30
      }
      
      doc.setFillColor(240, 249, 255) // Light blue
      doc.rect(20, yPos, 170, 15, 'F')
      doc.setDrawColor(accentColor[0], accentColor[1], accentColor[2])
      doc.rect(20, yPos, 170, 15)
      
      doc.setTextColor(accentColor[0], accentColor[1], accentColor[2])
      doc.setFontSize(9)
      doc.setFont('helvetica', 'bold')
      safeAddText('PAYMENT TERMS:', 23, yPos + 5)
      
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(darkColor[0], darkColor[1], darkColor[2])
      doc.setFontSize(8)
      safeAddText('Payment is due within 30 days. Late payments may incur additional charges.', 23, yPos + 10)
      
      // Footer section
      const pageHeight = doc.internal.pageSize.height
      
      // Signature section
      yPos = pageHeight - 50
      doc.setDrawColor(150, 150, 150)
      doc.line(20, yPos, 70, yPos)
      doc.line(140, yPos, 190, yPos)
      
      doc.setFontSize(9)
      doc.setTextColor(darkColor[0], darkColor[1], darkColor[2])
      safeAddText('Authorized Signature', 20, yPos + 5)
      safeAddText('Client Signature', 140, yPos + 5)
      
      // Footer with blue background
      doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2])
      doc.rect(10, pageHeight - 30, 190, 20, 'F')
      
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(9)
      doc.setFont('helvetica', 'bold')
      centerText('YCIS Data & Technology Center', pageHeight - 22)
      
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(8)
      centerText('Yashavantrao Chavan Institute of Science, Satara, Maharashtra', pageHeight - 17)
      centerText('Email: support@ycisdatacenter.com | Phone: +91 8668428513', pageHeight - 13)
      
      // Generated date (outside footer box)
      doc.setTextColor(100, 100, 100)
      doc.setFontSize(7)
      const genDateStr = 'Generated on: ' + new Date().toLocaleString('en-IN')
      centerText(genDateStr, pageHeight - 5)
      
      // Save PDF
      console.log('PDF generated successfully, downloading...')
      const filename = safeText(invoice.invoiceNumber) + '.pdf'
      doc.save(filename)
      
    } catch (error) {
      console.error('Error generating PDF:', error)
      console.error('Error details:', error)
      alert(`Failed to generate PDF: ${error instanceof Error ? error.message : 'Unknown error'}. Please check console for details.`)
    }
  }

  const handleViewInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice)
    setShowInvoiceDialog(true)
  }

  const handleSubmitTicket = async (e: React.FormEvent) => {
    e.preventDefault()
    setTicketError("")
    setTicketSuccess(false)
    setSubmittingTicket(true)

    try {
      const response = await fetch("/api/tickets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          clientId: client?.id,
          clientName: client?.name,
          clientEmail: client?.email,
          subject: ticketSubject,
          description: ticketDescription,
          category: ticketCategory,
          priority: ticketPriority,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to submit ticket")
      }

      setTicketSuccess(true)
      setTicketSubject("")
      setTicketDescription("")
      setTicketCategory("general")
      setTicketPriority("medium")
      
      setTimeout(() => {
        setShowTicketDialog(false)
        setTicketSuccess(false)
      }, 2000)
    } catch (error) {
      setTicketError("Failed to submit ticket. Please try again.")
    } finally {
      setSubmittingTicket(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!client) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      {/* Header */}
      <header className="bg-white border-b border-blue-200 shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/datacenter.png" alt="Logo" className="h-10 w-10 rounded-lg shadow-sm" />
            <div>
              <h1 className="text-xl font-bold text-blue-900">YCIS Data & Technology Center</h1>
              <p className="text-xs text-gray-600">Client Dashboard</p>
            </div>
          </div>
          <Button 
            onClick={handleLogout}
            variant="outline"
            className="flex items-center gap-2 text-red-600 border-red-300 hover:bg-red-50"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-blue-900 mb-2">
            Welcome back, {client.name}! 👋
          </h2>
          <p className="text-gray-600">Here's what's happening with your account</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-600 to-blue-700 text-white border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">Account Status</p>
                  <p className="text-2xl font-bold mt-1 capitalize">{client.status}</p>
                </div>
                <Activity className="h-10 w-10 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">Active Package</p>
                  <p className="text-2xl font-bold mt-1">{client.package || 'N/A'}</p>
                </div>
                <Package className="h-10 w-10 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-400 to-blue-500 text-white border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">Total Invoices</p>
                  <p className="text-2xl font-bold mt-1">{invoices.length}</p>
                </div>
                <FileText className="h-10 w-10 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-700 to-blue-800 text-white border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">Pending Payment</p>
                  <p className="text-2xl font-bold mt-1">
                    ₹{invoices
                      .filter(inv => inv.status !== 'Paid' && inv.status !== 'paid')
                      .reduce((sum, inv) => sum + inv.totalAmount, 0)
                      .toLocaleString('en-IN')}
                  </p>
                </div>
                <CreditCard className="h-10 w-10 text-blue-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Client Information */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <Card className="lg:col-span-1 shadow-lg border-0 border-blue-200">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-lg">
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Profile Information
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                <User className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-xs text-gray-600">Full Name</p>
                  <p className="font-semibold text-gray-900">{client.name}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                <Mail className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-xs text-gray-600">Email</p>
                  <p className="font-semibold text-gray-900 text-sm break-all">{client.email}</p>
                </div>
              </div>

              {client.phone && (
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                  <Phone className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-xs text-gray-600">Phone</p>
                    <p className="font-semibold text-gray-900">{client.phone}</p>
                  </div>
                </div>
              )}

              {client.company && (
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                  <Package className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-xs text-gray-600">Company</p>
                    <p className="font-semibold text-gray-900">{client.company}</p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Calendar className="h-5 w-5 text-gray-600" />
                <div>
                  <p className="text-xs text-gray-600">Member Since</p>
                  <p className="font-semibold text-gray-900">
                    {new Date(client.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>

              {client.projectStatus && (
                <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                  <Activity className="h-5 w-5 text-purple-600" />
                  <div>
                    <p className="text-xs text-gray-600">Project Status</p>
                    <p className="font-semibold text-gray-900 capitalize">{client.projectStatus.replace('-', ' ')}</p>
                  </div>
                </div>
              )}

              {client.renewalDate && (
                <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-lg">
                  <RefreshCw className="h-5 w-5 text-amber-600" />
                  <div>
                    <p className="text-xs text-gray-600">Renewal Date</p>
                    <p className="font-semibold text-gray-900">
                      {new Date(client.renewalDate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex gap-2 mt-4">
                <Button className="flex-1 bg-blue-600 hover:bg-blue-700">
                  <Settings className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
                <Button 
                  onClick={() => setShowTicketDialog(true)}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  <HelpCircle className="h-4 w-4 mr-2" />
                  Raise Ticket
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Services & Activity */}
          <div className="lg:col-span-2 space-y-6">
            {/* Active Services */}
            <Card className="shadow-lg border-0 border-blue-200">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Your Services
                </CardTitle>
                <CardDescription className="text-blue-100">
                  Your current hosting package details
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                {client.package ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                      <div>
                        <h4 className="font-semibold text-blue-900">{client.package}</h4>
                        <p className="text-sm text-gray-600 mt-1">Package: {client.package}</p>
                        {client.company && <p className="text-sm text-gray-600">Company: {client.company}</p>}
                      </div>
                      <Badge className="bg-green-100 text-green-800 border border-green-300">
                        {client.status === 'active' ? 'Active' : client.status}
                      </Badge>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No active package</p>
                    <p className="text-sm text-gray-500 mt-2">Contact admin for service activation</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Invoices Section */}
            <Card className="shadow-lg border-0 border-blue-200">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Your Invoices
                </CardTitle>
                <CardDescription className="text-blue-100">
                  View and manage your invoices
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                {loadingInvoices ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : invoices.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600">No invoices yet</p>
                    <p className="text-sm text-gray-500 mt-1">Invoices will appear here once created</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {invoices.slice(0, 5).map((invoice) => (
                      <div key={invoice.id} className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <h4 className="font-semibold text-blue-900">{invoice.invoiceNumber}</h4>
                            <p className="text-xs text-gray-600 mt-1">
                              Issued: {new Date(invoice.issueDate).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })}
                            </p>
                          </div>
                          <Badge className={
                            invoice.status === 'Paid' || invoice.status === 'paid' 
                              ? 'bg-green-100 text-green-800 border-green-300' 
                              : invoice.status === 'Overdue' || invoice.status === 'overdue'
                              ? 'bg-red-100 text-red-800 border-red-300'
                              : 'bg-yellow-100 text-yellow-800 border-yellow-300'
                          }>
                            {invoice.status}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between mt-3 pt-3 border-t border-blue-200">
                          <div>
                            <p className="text-xs text-gray-600">Amount</p>
                            <p className="text-lg font-bold text-blue-900">
                              ₹{invoice.totalAmount.toLocaleString('en-IN')}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-gray-600">Due Date</p>
                            <p className="text-sm font-medium text-gray-900">
                              {new Date(invoice.dueDate).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                              })}
                            </p>
                          </div>
                        </div>
                        
                        {/* Action Buttons */}
                        <div className="flex gap-2 mt-4 pt-3 border-t border-blue-200">
                          <Button
                            onClick={() => handleViewInvoice(invoice)}
                            variant="outline"
                            size="sm"
                            className="flex-1 border-blue-300 text-blue-700 hover:bg-blue-50"
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </Button>
                          <Button
                            onClick={() => handleDownloadInvoice(invoice)}
                            variant="default"
                            size="sm"
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Download
                          </Button>
                        </div>
                      </div>
                    ))}
                    
                    {invoices.length > 5 && (
                      <Button variant="outline" className="w-full mt-4">
                        View All {invoices.length} Invoices
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Ticket Dialog */}
      <Dialog open={showTicketDialog} onOpenChange={setShowTicketDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-blue-900">
              <HelpCircle className="w-5 h-5" />
              Raise a Support Ticket
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmitTicket} className="space-y-4 mt-4">
            {ticketSuccess && (
              <Alert className="bg-green-50 border-green-300">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  Ticket submitted successfully! We'll get back to you soon.
                </AlertDescription>
              </Alert>
            )}

            {ticketError && (
              <Alert variant="destructive">
                <AlertDescription>{ticketError}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="subject">Subject *</Label>
              <Input
                id="subject"
                value={ticketSubject}
                onChange={(e) => setTicketSubject(e.target.value)}
                placeholder="Brief description of your issue"
                required
                disabled={submittingTicket}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select value={ticketCategory} onValueChange={setTicketCategory} disabled={submittingTicket}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="technical">Technical Issue</SelectItem>
                    <SelectItem value="billing">Billing</SelectItem>
                    <SelectItem value="general">General Inquiry</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                    <SelectItem value="feature-request">Feature Request</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">Priority *</Label>
                <Select value={ticketPriority} onValueChange={setTicketPriority} disabled={submittingTicket}>
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

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={ticketDescription}
                onChange={(e) => setTicketDescription(e.target.value)}
                placeholder="Please provide detailed information about your issue or request"
                rows={6}
                required
                disabled={submittingTicket}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                className="flex-1 bg-blue-600 hover:bg-blue-700"
                disabled={submittingTicket}
              >
                {submittingTicket ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Submitting...</span>
                  </div>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Submit Ticket
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowTicketDialog(false)}
                disabled={submittingTicket}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

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
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-2xl font-bold text-blue-900">{selectedInvoice.invoiceNumber}</h3>
                    <p className="text-sm text-gray-600 mt-1">YCIS Data & Technology Center</p>
                  </div>
                  <Badge className={
                    selectedInvoice.status === 'Paid' || selectedInvoice.status === 'paid' 
                      ? 'bg-green-100 text-green-800 border-green-300' 
                      : selectedInvoice.status === 'Overdue' || selectedInvoice.status === 'overdue'
                      ? 'bg-red-100 text-red-800 border-red-300'
                      : 'bg-yellow-100 text-yellow-800 border-yellow-300'
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

              {/* Client Info */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Bill To:</h4>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <p className="font-semibold text-gray-900">{selectedInvoice.clientName}</p>
                  <p className="text-sm text-gray-600 mt-1">{selectedInvoice.clientEmail}</p>
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
                          <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Price</th>
                          <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedInvoice.items.map((item: any, index: number) => (
                          <tr key={index} className="border-t border-gray-200">
                            <td className="py-3 px-4 text-sm text-gray-900">{item.description}</td>
                            <td className="py-3 px-4 text-sm text-center text-gray-900">{item.quantity}</td>
                            <td className="py-3 px-4 text-sm text-right text-gray-900">
                              ₹{item.unitPrice.toLocaleString('en-IN')}
                            </td>
                            <td className="py-3 px-4 text-sm text-right font-semibold text-gray-900">
                              ₹{item.totalPrice.toLocaleString('en-IN')}
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
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="font-semibold text-gray-900">
                      ₹{(selectedInvoice.subtotal || 0).toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tax ({selectedInvoice.taxRate || 0}%):</span>
                    <span className="font-semibold text-gray-900">
                      ₹{(selectedInvoice.taxAmount || 0).toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="flex justify-between text-lg pt-2 border-t border-gray-300">
                    <span className="font-bold text-gray-900">Total Amount:</span>
                    <span className="font-bold text-blue-900">
                      ₹{selectedInvoice.totalAmount.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {selectedInvoice.notes && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Notes:</h4>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
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
  )
}

