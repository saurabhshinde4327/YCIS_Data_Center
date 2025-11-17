"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { 
  Calendar, 
  Package, 
  HelpCircle,
  IndianRupee,
  TrendingUp,
  CheckCircle,
  AlertTriangle,
  Clock,
  Server,
  FileText,
  TicketIcon
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

interface Project {
  id: number
  name: string
  category: string
  createdDate: string
  renewDate: string
  clientEmail?: string
  clientPay: boolean
  amount: number
  status: "Active" | "Inactive" | "Maintenance" | "Expired"
  users?: number
  uptime?: string
}

export default function ClientDashboardPage() {
  const router = useRouter()
  const [client, setClient] = useState<ClientData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [projects, setProjects] = useState<Project[]>([])
  const [showRenewalPopup, setShowRenewalPopup] = useState(false)
  const [daysRemaining, setDaysRemaining] = useState<number>(0)
  const [totalInvoices, setTotalInvoices] = useState(0)
  const [ticketsRaised, setTicketsRaised] = useState(0)
  const [ticketsResolved, setTicketsResolved] = useState(0)

  useEffect(() => {
    let isMounted = true

    const checkAuth = async () => {
      // Skip auth check since layout already handles it
      const clientData = sessionStorage.getItem("client")
      
      if (!clientData) {
        if (isMounted) {
          router.push("/client/signin")
        }
        return
      }

      try {
        const parsedClient = JSON.parse(clientData)
        if (isMounted) {
          setClient(parsedClient)
          // Fetch dashboard data
          fetchDashboardData(parsedClient.email)
        }
      } catch (error) {
        console.error("Error parsing client data:", error)
        if (isMounted) {
          router.push("/client/signin")
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    checkAuth()

    return () => {
      isMounted = false
    }
  }, [])

  // Calculate days remaining and show popup if needed
  useEffect(() => {
    if (client?.renewalDate) {
      const today = new Date()
      const renewalDate = new Date(client.renewalDate)
      const diffTime = renewalDate.getTime() - today.getTime()
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      
      setDaysRemaining(diffDays > 0 ? diffDays : 0)
      
      // Show popup if less than 30 days remaining and not already shown today
      if (diffDays > 0 && diffDays <= 30) {
        const lastShown = localStorage.getItem(`renewalPopup_${client.id}`)
        const todayStr = new Date().toDateString()
        
        if (lastShown !== todayStr) {
          setShowRenewalPopup(true)
          localStorage.setItem(`renewalPopup_${client.id}`, todayStr)
        }
      }
    }
  }, [client])

  const fetchDashboardData = async (email: string) => {
    try {
      // Fetch projects
      const projectsRes = await fetch('/api/projects')
      if (projectsRes.ok) {
        const data = await projectsRes.json()
        if (data.success && data.projects) {
          // Filter projects by client email (check both clientEmail and clientEmails array)
          const clientProjects = data.projects.filter((p: Project) => {
            const hasClientEmail = p.clientEmail === email
            const hasInClientEmails = (p as any).clientEmails && Array.isArray((p as any).clientEmails) 
              ? (p as any).clientEmails.includes(email)
              : false
            return hasClientEmail || hasInClientEmails
          })
          setProjects(clientProjects)
        }
      }

      // Fetch invoices
      const invoicesRes = await fetch(`/api/invoices/by-client?email=${encodeURIComponent(email)}`)
      if (invoicesRes.ok) {
        const invoices = await invoicesRes.json()
        setTotalInvoices(invoices.length)
      }

      // Fetch tickets
      const ticketsRes = await fetch(`/api/tickets?clientEmail=${encodeURIComponent(email)}`)
      if (ticketsRes.ok) {
        const tickets = await ticketsRes.json()
        setTicketsRaised(tickets.length)
        const resolvedCount = tickets.filter((t: any) => t.status === 'resolved' || t.status === 'closed').length
        setTicketsResolved(resolvedCount)
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

  const getProgressColor = () => {
    if (daysRemaining > 90) return 'bg-green-500'
    if (daysRemaining > 30) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  const getProgressPercentage = () => {
    return (daysRemaining / 365) * 100
  }

  return (
    <div className="p-6 space-y-6">
      {/* Renewal Reminder Popup */}
      <Dialog open={showRenewalPopup} onOpenChange={setShowRenewalPopup}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-amber-700">
              <AlertTriangle className="h-6 w-6" />
              Subscription Renewal Reminder
            </DialogTitle>
            <DialogDescription>
              Your subscription is expiring soon
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="bg-amber-50 border-2 border-amber-200 rounded-lg p-4">
              <div className="text-center mb-4">
                <p className="text-sm text-gray-700 mb-2">Days Remaining</p>
                <p className="text-5xl font-bold text-amber-700">{daysRemaining}</p>
                <p className="text-xs text-gray-600 mt-1">out of 365 days</p>
              </div>
              <Progress value={getProgressPercentage()} className="h-3" />
            </div>
            
            <Alert className="border-amber-200 bg-amber-50">
              <Clock className="h-4 w-4 text-amber-700" />
              <AlertDescription className="text-amber-900">
                <strong>Important:</strong> Your subscription will expire on{' '}
                <strong>
                  {new Date(client.renewalDate!).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </strong>
                . Please renew before the deadline to avoid service interruption.
              </AlertDescription>
            </Alert>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-2">How to Renew:</h4>
              <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
                <li>Contact: +91 8668428513</li>
                <li>Email: datacenter@ycis.ac.in</li>
                <li>Or raise a support ticket</li>
              </ul>
            </div>

            <Button 
              onClick={() => setShowRenewalPopup(false)} 
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              I Understand
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Page Header */}
      <div className="flex items-center justify-between">
            <div>
        <h1 className="text-3xl font-bold text-blue-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">Welcome back, {client.name}</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">Account ID</p>
          <p className="text-lg font-semibold text-gray-900">{client.id}</p>
        </div>
      </div>

      {/* Subscription Alert Banner */}
      {client.renewalDate && daysRemaining > 0 && daysRemaining <= 30 && (
        <Alert className="border-amber-300 bg-amber-50">
          <AlertTriangle className="h-5 w-5 text-amber-700" />
          <AlertDescription className="text-amber-900">
            <strong>Renewal Required:</strong> Your subscription expires in <strong>{daysRemaining} days</strong>. 
            Please renew to continue your services.
          </AlertDescription>
        </Alert>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Total Invoices */}
        <Card className="bg-white border-0 shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600">Total Invoices</CardTitle>
              <div className="p-2 bg-blue-600 rounded-lg shadow-lg">
                <FileText className="h-4 w-4 text-white" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{totalInvoices}</div>
            <p className="text-xs text-gray-500 mt-1">All invoices</p>
          </CardContent>
        </Card>

        {/* Tickets Raised */}
        <Card className="bg-white border-0 shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600">Tickets Raised</CardTitle>
              <div className="p-2 bg-orange-600 rounded-lg shadow-lg">
                <TicketIcon className="h-4 w-4 text-white" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{ticketsRaised}</div>
            <p className="text-xs text-gray-500 mt-1">Total support tickets</p>
          </CardContent>
        </Card>

        {/* Tickets Resolved */}
        <Card className="bg-white border-0 shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600">Tickets Resolved</CardTitle>
              <div className="p-2 bg-green-600 rounded-lg shadow-lg">
                <CheckCircle className="h-4 w-4 text-white" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{ticketsResolved}</div>
            <p className="text-xs text-gray-500 mt-1">Successfully closed</p>
          </CardContent>
        </Card>

        {/* Total Services */}
        <Card className="bg-white border-0 shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600">Total Services</CardTitle>
              <div className="p-2 bg-purple-600 rounded-lg shadow-lg">
                <Server className="h-4 w-4 text-white" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{projects.length}</div>
            <p className="text-xs text-gray-500 mt-1">Active services</p>
          </CardContent>
        </Card>
      </div>

      {/* Services Summary from Projects */}
      {projects.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Active Services Count */}
          <Card className="border border-gray-200 hover:border-blue-300 transition-colors">
          <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-gray-600">Active Services</CardTitle>
                <div className="p-2 bg-blue-50 rounded-lg">
                  <Server className="h-5 w-5 text-blue-600" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{projects.length}</div>
              <p className="text-sm text-gray-500 mt-1">
                {projects.length === 1 ? 'Service' : 'Services'} active
            </p>
            </CardContent>
          </Card>

          {/* Next Renewal from Projects */}
          <Card className="border border-gray-200 hover:border-amber-300 transition-colors">
          <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-gray-600">Next Renewal</CardTitle>
                <div className="p-2 bg-amber-50 rounded-lg">
                  <Calendar className="h-5 w-5 text-amber-600" />
                </div>
                </div>
          </CardHeader>
          <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {(() => {
                  const nextRenewal = projects.reduce((earliest, project) => {
                    const projectDate = new Date(project.renewDate)
                    const earliestDate = new Date(earliest)
                    return projectDate < earliestDate ? project.renewDate : earliest
                  }, projects[0].renewDate)
                  return new Date(nextRenewal).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })
                })()}
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Earliest renewal date
            </p>
            </CardContent>
          </Card>

          {/* Total Billing from Projects */}
          <Card className="border border-gray-200 hover:border-green-300 transition-colors">
          <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-gray-600">Total Billing</CardTitle>
                <div className="p-2 bg-green-50 rounded-lg">
                  <IndianRupee className="h-5 w-5 text-green-600" />
                </div>
                </div>
          </CardHeader>
          <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {formatCurrency(projects.reduce((sum, p) => sum + p.amount, 0))}
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Combined services cost (INR)
            </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Subscription Status */}
      {client.renewalDate && (
        <Card className="border border-gray-200">
          <CardHeader className="border-b border-gray-200">
              <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold text-gray-900">Subscription Status</CardTitle>
              <Badge className={
                daysRemaining > 90 
                  ? 'bg-green-100 text-green-700 border-green-200'
                  : daysRemaining > 30
                  ? 'bg-yellow-100 text-yellow-700 border-yellow-200'
                  : 'bg-red-100 text-red-700 border-red-200'
              }>
                {daysRemaining > 90 ? 'Active' : daysRemaining > 30 ? 'Renewing Soon' : 'Action Required'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {/* Days Counter */}
              <div className="text-center pb-6 border-b border-gray-100">
                <p className="text-sm text-gray-500 mb-3">Days Remaining</p>
                <div className="flex items-center justify-center gap-4 mb-4">
                  <div className="relative">
                    <svg className="w-32 h-32 transform -rotate-90">
                      {/* Background Circle */}
                      <circle
                        cx="64"
                        cy="64"
                        r="56"
                        stroke="#e5e7eb"
                        strokeWidth="8"
                        fill="none"
                      />
                      {/* Progress Circle */}
                      <circle
                        cx="64"
                        cy="64"
                        r="56"
                        stroke={daysRemaining > 90 ? '#22c55e' : daysRemaining > 30 ? '#eab308' : '#ef4444'}
                        strokeWidth="8"
                        fill="none"
                        strokeDasharray={`${2 * Math.PI * 56}`}
                        strokeDashoffset={`${2 * Math.PI * 56 * (1 - getProgressPercentage() / 100)}`}
                        strokeLinecap="round"
                        className="transition-all duration-500"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <p className="text-3xl font-bold text-gray-900">{daysRemaining}</p>
                        <p className="text-xs text-gray-500">days</p>
                      </div>
                    </div>
                  </div>
                </div>
                <Progress value={getProgressPercentage()} className="h-2" />
                <p className="text-xs text-gray-500 mt-2">{Math.round(getProgressPercentage())}% of subscription remaining</p>
              </div>

              {/* Subscription Details */}
              <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Subscription Start</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {new Date(client.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Renewal Date</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {new Date(client.renewalDate).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </p>
                </div>
              </div>

              {/* Renewal Action */}
              {daysRemaining <= 30 && (
                <div className="pt-4">
                  <Button 
                    className="w-full bg-amber-600 hover:bg-amber-700 text-white"
                    onClick={() => router.push('/client/tickets')}
                  >
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Renew Now
                  </Button>
                </div>
              )}
            </div>
            </CardContent>
          </Card>
      )}

      {/* Account Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Account Information */}
        <Card className="border border-gray-200">
          <CardHeader className="border-b border-gray-200">
            <CardTitle className="text-lg font-semibold text-gray-900">Account Information</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div className="flex-1">
                <p className="text-sm text-gray-500">Status</p>
                <p className="text-base font-medium text-gray-900 capitalize mt-1">{client.status}</p>
              </div>
              <Badge className={
                client.status === 'active' 
                  ? 'bg-green-100 text-green-700 border-green-200' 
                  : 'bg-gray-100 text-gray-700 border-gray-200'
              }>
                {client.status}
              </Badge>
              </div>

            {client.projectStatus && (
              <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                <div className="flex-1">
                  <p className="text-sm text-gray-500">Project Phase</p>
                  <p className="text-base font-medium text-gray-900 capitalize mt-1">
                    {client.projectStatus.replace('-', ' ')}
                  </p>
                </div>
                <Badge className="bg-blue-100 text-blue-700 border-blue-200">
                  {client.projectStatus}
                </Badge>
                </div>
              )}

            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div className="flex-1">
                <p className="text-sm text-gray-500">Client Since</p>
                <p className="text-base font-medium text-gray-900 mt-1">
                    {new Date(client.createdAt).toLocaleDateString('en-US', {
                      month: 'long',
                    year: 'numeric'
                    })}
                  </p>
                </div>
              </div>

            {client.company && (
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm text-gray-500">Company</p>
                  <p className="text-base font-medium text-gray-900 mt-1">{client.company}</p>
                </div>
              </div>
            )}
            </CardContent>
          </Card>

        {/* Quick Summary */}
        <Card className="border border-gray-200">
          <CardHeader className="border-b border-gray-200">
            <CardTitle className="text-lg font-semibold text-gray-900">Account Summary</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
              <div className="flex items-center gap-4 pb-4 border-b border-gray-100">
                <div className="flex-shrink-0 w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">Status: Active</p>
                  <p className="text-xs text-gray-500 mt-0.5">Account operating normally</p>
                </div>
              </div>

              {projects.length > 0 && (
                <div className="flex items-center gap-4 pb-4 border-b border-gray-100">
                  <div className="flex-shrink-0 w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                    <Server className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{projects.length} Service{projects.length !== 1 ? 's' : ''}</p>
                    <p className="text-xs text-gray-500 mt-0.5">Active projects assigned</p>
                  </div>
                </div>
              )}

              {client.package && (
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center">
                    <Package className="h-5 w-5 text-amber-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">Current Plan</p>
                    <p className="text-xs text-gray-500 mt-0.5">{client.package}</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Projects */}
      {projects.length > 0 && (
        <Card className="border border-gray-200">
          <CardHeader className="border-b border-gray-200">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold text-gray-900">Active Projects</CardTitle>
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                {projects.length} {projects.length === 1 ? 'Project' : 'Projects'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {projects.map((project) => (
                <div key={project.id} className="p-5 bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
                  <div className="mb-4">
                    <h3 className="font-semibold text-gray-900 text-base mb-2">{project.name}</h3>
                    <p className="text-sm text-gray-600">{project.category}</p>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-4 border-t border-gray-100">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Start Date</p>
                      <p className="text-sm font-medium text-gray-900">
                        {new Date(project.createdDate).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                    {project.amount > 0 && (
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Cost (INR)</p>
                        <p className="text-sm font-medium text-gray-900">{formatCurrency(project.amount)}</p>
                      </div>
                    )}
                    {project.uptime && (
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Uptime</p>
                        <p className="text-sm font-medium text-green-600">{project.uptime}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

