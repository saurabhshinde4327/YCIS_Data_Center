"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Calendar,
  Package,
  HelpCircle,
  DollarSign,
  TrendingUp,
  Bell
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

export default function ClientDashboardPage() {
  const router = useRouter()
  const [client, setClient] = useState<ClientData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [totalInvoices, setTotalInvoices] = useState(0)
  const [totalAmount, setTotalAmount] = useState(0)
  const [ticketsCount, setTicketsCount] = useState(0)
  const [servicesCount, setServicesCount] = useState(1)

  useEffect(() => {
    const clientData = sessionStorage.getItem("client")
    
    if (!clientData) {
      router.push("/client/signin")
      return
    }

    try {
      const parsedClient = JSON.parse(clientData)
      setClient(parsedClient)
      
      // Fetch dashboard data
      fetchDashboardData(parsedClient.email)
    } catch (error) {
      console.error("Error parsing client data:", error)
      router.push("/client/signin")
    } finally {
      setIsLoading(false)
    }
  }, [router])

  const fetchDashboardData = async (email: string) => {
    try {
      // Fetch invoices
      const invoicesRes = await fetch(`/api/invoices/by-client?email=${encodeURIComponent(email)}`)
      if (invoicesRes.ok) {
        const invoices = await invoicesRes.json()
        setTotalInvoices(invoices.length)
        const total = invoices.reduce((sum: number, inv: any) => sum + (inv.totalAmount || 0), 0)
        setTotalAmount(total)
      }

      // Fetch tickets
      const ticketsRes = await fetch(`/api/tickets?clientEmail=${encodeURIComponent(email)}`)
      if (ticketsRes.ok) {
        const tickets = await ticketsRes.json()
        setTicketsCount(tickets.length)
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!client) {
    return null
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount)
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-blue-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome back, {client.name}! 👋</p>
      </div>

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Renewal Date */}
        <Card className="bg-gradient-to-br from-blue-600 to-blue-700 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-blue-100">Renewal Date</CardTitle>
              <Calendar className="h-8 w-8 text-blue-200" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {client.renewalDate 
                ? new Date(client.renewalDate).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })
                : 'Not Set'
              }
            </div>
            <p className="text-xs text-blue-200 mt-1">
              {client.renewalDate && new Date(client.renewalDate) > new Date()
                ? `${Math.ceil((new Date(client.renewalDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days remaining`
                : 'Please contact admin'
              }
            </p>
          </CardContent>
        </Card>

        {/* Total Services */}
        <Card className="bg-gradient-to-br from-green-600 to-green-700 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-green-100">Total Services</CardTitle>
              <Package className="h-8 w-8 text-green-200" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{servicesCount}</div>
            <p className="text-xs text-green-200 mt-1">
              {client.package ? client.package : 'Active packages'}
            </p>
          </CardContent>
        </Card>

        {/* Tickets Raised */}
        <Card className="bg-gradient-to-br from-purple-600 to-purple-700 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-purple-100">Tickets Raised</CardTitle>
              <HelpCircle className="h-8 w-8 text-purple-200" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{ticketsCount}</div>
            <p className="text-xs text-purple-200 mt-1">
              Support tickets created
            </p>
          </CardContent>
        </Card>

        {/* Total Amount */}
        <Card className="bg-gradient-to-br from-amber-600 to-amber-700 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-amber-100">Total Amount</CardTitle>
              <DollarSign className="h-8 w-8 text-amber-200" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalAmount)}</div>
            <p className="text-xs text-amber-200 mt-1">
              Total invoice amount
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Account Status & Project Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Account Overview */}
        <Card className="shadow-lg">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-lg">
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Account Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-600">Account Status</p>
                <p className="text-lg font-semibold text-gray-900 capitalize">{client.status}</p>
              </div>
              <Badge className={
                client.status === 'active' 
                  ? 'bg-green-100 text-green-800 border-green-300' 
                  : 'bg-gray-100 text-gray-800 border-gray-300'
              }>
                {client.status}
              </Badge>
            </div>

            {client.projectStatus && (
              <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-600">Project Status</p>
                  <p className="text-lg font-semibold text-gray-900 capitalize">
                    {client.projectStatus.replace('-', ' ')}
                  </p>
                </div>
                <Badge className="bg-purple-100 text-purple-800 border-purple-300">
                  {client.projectStatus}
                </Badge>
              </div>
            )}

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-600">Member Since</p>
                <p className="text-lg font-semibold text-gray-900">
                  {new Date(client.createdAt).toLocaleDateString('en-US', {
                    month: 'long',
                    year: 'numeric'
                  })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="shadow-lg">
          <CardHeader className="bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-t-lg">
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-2 h-2 mt-2 bg-blue-600 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Account Active</p>
                  <p className="text-xs text-gray-500">Your account is in good standing</p>
                </div>
              </div>

              {totalInvoices > 0 && (
                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-2 h-2 mt-2 bg-green-600 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{totalInvoices} Invoices Generated</p>
                    <p className="text-xs text-gray-500">Total: {formatCurrency(totalAmount)}</p>
                  </div>
                </div>
              )}

              {ticketsCount > 0 && (
                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-2 h-2 mt-2 bg-purple-600 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{ticketsCount} Support Tickets</p>
                    <p className="text-xs text-gray-500">View all your support requests</p>
                  </div>
                </div>
              )}

              {client.package && (
                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-2 h-2 mt-2 bg-amber-600 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Active Package</p>
                    <p className="text-xs text-gray-500">{client.package}</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

