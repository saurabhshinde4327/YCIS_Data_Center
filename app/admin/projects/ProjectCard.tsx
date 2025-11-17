import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Edit, Trash2, Calendar, DollarSign, Check, X } from "lucide-react"
import { Project } from "./page"

interface ProjectCardProps {
  project: Project
  onUpdated: () => void
  onEdit: () => void
}

const statusColors = {
  Active: "bg-green-100 text-green-800",
  Maintenance: "bg-yellow-100 text-yellow-800",
  Inactive: "bg-red-100 text-red-800",
  Expired: "bg-gray-100 text-gray-800"
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString()
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}

export default function ProjectCard({ project, onUpdated, onEdit }: ProjectCardProps) {
  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this project?")) {
      try {
        const response = await fetch(`/api/projects/${id}`, {
          method: 'DELETE',
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to delete project')
        }

        onUpdated()
      } catch (err) {
        alert(`Failed to delete project: ${err instanceof Error ? err.message : 'Unknown error'}`)
      }
    }
  }

  const handleTogglePayment = async (id: number, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/projects/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clientPay: !currentStatus
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update payment status')
      }

      const result = await response.json()
      if (result.success) {
        onUpdated()
      } else {
        throw new Error(result.error || 'Failed to update payment status')
      }
    } catch (err) {
      alert(`Failed to update payment status: ${err instanceof Error ? err.message : 'Unknown error'}`)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <CardTitle className="text-lg">{project.name}</CardTitle>
          <Badge className={statusColors[project.status as keyof typeof statusColors]}>
            {project.status}
          </Badge>
        </div>
        <CardDescription>
          <Badge variant="outline" className="mb-2">{project.category}</Badge>
          <div className="text-sm text-gray-600 mt-1">
            Created: {formatDate(project.createdDate)}
          </div>
        </CardDescription>
      </CardHeader>
      <CardContent>
                  <div className="space-y-2 mb-4">
                    {((project as any).clientEmails && Array.isArray((project as any).clientEmails) && (project as any).clientEmails.length > 0) || (project.clientEmail && project.clientEmail !== '') ? (
                      <div className="flex flex-col text-sm mb-2">
                        <span className="text-gray-600 mb-1">Assigned Clients:</span>
                        <div className="flex flex-wrap gap-1">
                          {((project as any).clientEmails && Array.isArray((project as any).clientEmails) && (project as any).clientEmails.length > 0) ? (
                            (project as any).clientEmails.map((email: string, idx: number) => (
                              <Badge key={idx} variant="outline" className="text-xs font-medium text-blue-600">
                                {email}
                              </Badge>
                            ))
                          ) : (
                            <Badge variant="outline" className="text-xs font-medium text-blue-600">
                              {project.clientEmail}
                            </Badge>
                          )}
                        </div>
                      </div>
                    ) : null}
                    <div className="flex justify-between text-sm">
                      <span>Renewal Date:</span>
                      <span className="font-medium">{formatDate(project.renewDate)}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span>Client Pay:</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs">{project.clientPay ? "Yes" : "No"}</span>
                        <Switch
                          checked={project.clientPay}
                          onCheckedChange={() => project.id && handleTogglePayment(project.id, project.clientPay)}
                        />
                      </div>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Amount:</span>
                      <span className="font-medium">{formatCurrency(project.amount)}</span>
                    </div>
                  </div>
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onEdit}
            className="flex-1"
          >
            <Edit className="h-4 w-4 mr-1" />
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => project.id && handleDelete(project.id)}
            className="text-red-600 hover:text-red-700 flex-1 sm:flex-none"
          >
            <Trash2 className="h-4 w-4 mr-1 sm:mr-0" />
            <span className="sm:hidden">Delete</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
