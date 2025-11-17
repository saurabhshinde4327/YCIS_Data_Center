"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Server,
  Calendar,
  IndianRupee
} from "lucide-react"

interface ClientData {
  id: string
  name: string
  email: string
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

export default function ClientServicesPage() {
  const router = useRouter()
  const [client, setClient] = useState<ClientData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [projects, setProjects] = useState<Project[]>([])

  useEffect(() => {
    const clientData = sessionStorage.getItem("client")
    
    if (!clientData) {
      router.push("/client/signin")
      return
    }

    try {
      const parsedClient = JSON.parse(clientData)
      setClient(parsedClient)
      // Fetch projects for this client
      fetchProjects(parsedClient.email)
    } catch (error) {
      console.error("Error parsing client data:", error)
      router.push("/client/signin")
    } finally {
      setIsLoading(false)
    }
  }, [router])

  const fetchProjects = async (email: string) => {
    try {
      const response = await fetch('/api/projects')
      if (response.ok) {
        const data = await response.json()
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
    } catch (error) {
      console.error('Error fetching projects:', error)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount)
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

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-blue-900">Services</h1>
        <p className="text-gray-600 mt-2">View your assigned projects and services</p>
      </div>

      {/* Assigned Projects */}
      {projects.length > 0 ? (
        <Card className="border border-gray-200">
          <CardHeader className="border-b border-gray-200">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold text-gray-900">Active Services</CardTitle>
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                {projects.length} {projects.length === 1 ? 'Service' : 'Services'}
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
                        <p className="text-xs text-gray-500 mb-1">Amount (INR)</p>
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
      ) : (
        <Card className="border border-gray-200">
          <CardContent className="pt-12 pb-12 text-center">
            <div className="p-4 bg-gray-50 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
              <Server className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Services Assigned</h3>
            <p className="text-gray-600 mb-4">
              You don't have any services assigned to your account yet.
            </p>
            <p className="text-sm text-gray-500">
              Please contact the administrator at datacenter@ycis.ac.in or call +91 8668428513 to get services activated.
            </p>
          </CardContent>
        </Card>
      )}

    </div>
  )
}

