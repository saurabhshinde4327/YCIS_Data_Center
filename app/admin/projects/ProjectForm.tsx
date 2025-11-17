import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Checkbox } from "@/components/ui/checkbox"
import { DialogDescription, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Project } from "./page"

interface Client {
  id: string
  name: string
  email: string
}

interface ProjectFormProps {
  categories: string[]
  project?: Project | null
  onClose: () => void
  onSuccess: () => void
}

export default function ProjectForm({ categories, project, onClose, onSuccess }: ProjectFormProps) {
  const [formData, setFormData] = useState<Partial<Project>>({
    name: "",
    category: "",
    createdDate: "",
    renewDate: "",
    clientEmail: "none",
    clientEmails: [],
    clientPay: false,
    amount: 0,
    status: "Active"
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [clients, setClients] = useState<Client[]>([])
  const [loadingClients, setLoadingClients] = useState(true)
  const [selectedClientEmails, setSelectedClientEmails] = useState<string[]>([])

  // Fetch clients on mount
  useEffect(() => {
    const fetchClients = async () => {
      try {
        const response = await fetch('/api/clients')
        if (response.ok) {
          const data = await response.json()
          // Ensure data is an array
          if (Array.isArray(data)) {
            setClients(data)
          } else {
            console.error('Clients data is not an array:', data)
            setClients([])
          }
        } else {
          console.error('Failed to fetch clients:', response.status)
          setClients([])
        }
      } catch (error) {
        console.error('Error fetching clients:', error)
        setClients([])
      } finally {
        setLoadingClients(false)
      }
    }
    fetchClients()
  }, [])

  // Initialize form data when editing
  useEffect(() => {
    if (project) {
      const clientEmails = (project as any).clientEmails && Array.isArray((project as any).clientEmails) 
        ? (project as any).clientEmails 
        : (project.clientEmail && project.clientEmail !== '' ? [project.clientEmail] : [])
      
      setFormData({
        name: project.name,
        category: project.category,
        createdDate: project.createdDate,
        renewDate: project.renewDate,
        clientEmail: project.clientEmail && project.clientEmail !== '' ? project.clientEmail : "none",
        clientEmails: clientEmails,
        clientPay: project.clientPay,
        amount: project.amount,
        status: project.status
      })
      setSelectedClientEmails(clientEmails)
    }
  }, [project])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name || !formData.category || !formData.createdDate || !formData.renewDate) {
      alert("Please fill in all required fields (Name, Category, Created Date, Renew Date)")
      return
    }

    setIsSubmitting(true)

    try {
      const url = project?.id ? `/api/projects/${project.id}` : '/api/projects'
      const method = project?.id ? 'PUT' : 'POST'

      // Prepare data - convert "none" to empty string for clientEmail
      // Use selectedClientEmails if available, otherwise fallback to clientEmail
      const clientEmailsToSubmit = selectedClientEmails.length > 0 
        ? selectedClientEmails 
        : (formData.clientEmail && formData.clientEmail !== 'none' ? [formData.clientEmail] : [])
      
      const submitData = {
        ...formData,
        clientEmail: formData.clientEmail === 'none' ? '' : formData.clientEmail,
        clientEmails: clientEmailsToSubmit
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `Failed to ${project?.id ? 'update' : 'create'} project`)
      }

      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || `Failed to ${project?.id ? 'update' : 'create'} project`)
      }

      onSuccess()
      onClose()
    } catch (err) {
      console.error('Submit error:', err)
      alert(`Failed to ${project?.id ? 'update' : 'create'} project: ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: keyof Project, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  return (
    <>
      <DialogTitle>{project ? 'Edit Project' : 'Add New Project'}</DialogTitle>
      <DialogDescription>
        {project ? 'Update the project details.' : 'Create a new project with all the required details.'}
      </DialogDescription>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
          <Label htmlFor="name" className="sm:text-right">
            Project Name *
          </Label>
          <Input
            id="name"
            value={formData.name || ''}
            onChange={(e) => handleInputChange('name', e.target.value)}
            className="sm:col-span-3"
            placeholder="Enter project name"
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
          <Label htmlFor="category" className="sm:text-right">
            Category *
          </Label>
          <Select
            value={formData.category || ''}
            onValueChange={(value) => handleInputChange('category', value)}
          >
            <SelectTrigger className="sm:col-span-3">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>{category}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 items-start gap-4">
          <Label htmlFor="clientEmails" className="sm:text-right pt-2">
            Assign to Clients
          </Label>
          <div className="sm:col-span-3 space-y-2">
            {loadingClients ? (
              <div className="text-sm text-gray-500">Loading clients...</div>
            ) : clients.length > 0 ? (
              <ScrollArea className="h-48 w-full rounded-md border p-4">
                <div className="space-y-3">
                  {clients.map((client) => (
                    <div key={client.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`client-${client.id}`}
                        checked={selectedClientEmails.includes(client.email)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedClientEmails([...selectedClientEmails, client.email])
                          } else {
                            setSelectedClientEmails(selectedClientEmails.filter(email => email !== client.email))
                          }
                        }}
                      />
                      <Label
                        htmlFor={`client-${client.id}`}
                        className="text-sm font-normal cursor-pointer flex-1"
                      >
                        {client.name} ({client.email})
                      </Label>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <div className="text-sm text-gray-500 p-4 border rounded-md">
                No clients available
              </div>
            )}
            {selectedClientEmails.length > 0 && (
              <div className="text-xs text-gray-600 mt-2">
                {selectedClientEmails.length} client{selectedClientEmails.length > 1 ? 's' : ''} selected
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
          <Label htmlFor="createdDate" className="sm:text-right">
            Created Date *
          </Label>
          <Input
            id="createdDate"
            type="date"
            value={formData.createdDate || ''}
            onChange={(e) => handleInputChange('createdDate', e.target.value)}
            className="sm:col-span-3"
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
          <Label htmlFor="renewDate" className="sm:text-right">
            Renew Date *
          </Label>
          <Input
            id="renewDate"
            type="date"
            value={formData.renewDate || ''}
            onChange={(e) => handleInputChange('renewDate', e.target.value)}
            className="sm:col-span-3"
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
          <Label htmlFor="amount" className="sm:text-right">
            Amount
          </Label>
          <Input
            id="amount"
            type="number"
            value={formData.amount || ''}
            onChange={(e) => handleInputChange('amount', Number(e.target.value))}
            className="sm:col-span-3"
            placeholder="Enter amount"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
          <Label htmlFor="status" className="sm:text-right">
            Status
          </Label>
          <Select
            value={formData.status || 'Active'}
            onValueChange={(value: any) => handleInputChange('status', value)}
          >
            <SelectTrigger className="sm:col-span-3">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Inactive">Inactive</SelectItem>
              <SelectItem value="Maintenance">Maintenance</SelectItem>
              <SelectItem value="Expired">Expired</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
          <Label htmlFor="clientPay" className="sm:text-right">
            Client Pay
          </Label>
          <div className="sm:col-span-3 flex items-center space-x-2">
            <Switch
              id="clientPay"
              checked={formData.clientPay || false}
              onCheckedChange={(checked) => handleInputChange('clientPay', checked)}
            />
            <Label htmlFor="clientPay" className="text-sm">
              {formData.clientPay ? "Yes" : "No"}
            </Label>
          </div>
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : (project ? 'Update Project' : 'Add Project')}
          </Button>
        </div>
      </form>
    </>
  )
}
