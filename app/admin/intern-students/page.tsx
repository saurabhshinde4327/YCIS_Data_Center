"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DataCenterLayout } from "@/components/datacenter-layout"
import { Plus, Search, GraduationCap, Download, Edit, Trash2, RefreshCw, FileText, MoreVertical } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface InternStudent {
  id: string
  name: string
  email: string
  branch: string
  passoutYear: number
  createdAt: string
  updatedAt: string
}

export default function InternStudentsPage() {
  const [students, setStudents] = useState<InternStudent[]>([])
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingStudent, setEditingStudent] = useState<InternStudent | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [experienceYearsDialogOpen, setExperienceYearsDialogOpen] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState<InternStudent | null>(null)
  const [experienceYears, setExperienceYears] = useState("")

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    branch: "",
    passoutYear: new Date().getFullYear().toString()
  })

  const loadStudents = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const res = await fetch("/api/intern-students", { cache: "no-store" })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || `Failed to fetch students (${res.status})`)
      }
      setStudents(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadStudents()
  }, [])

  const handleEdit = (student: InternStudent) => {
    setEditingStudent(student)
    setFormData({
      name: student.name,
      email: student.email,
      branch: student.branch,
      passoutYear: student.passoutYear.toString()
    })
    setIsAddDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this student?')) return

    try {
      const res = await fetch(`/api/intern-students/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete student')
      await loadStudents()
    } catch (err) {
      alert(`Failed to delete student: ${err instanceof Error ? err.message : 'Unknown error'}`)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.email || !formData.branch || !formData.passoutYear) {
      alert("Please fill in all required fields")
      return
    }

    setIsSubmitting(true)
    try {
      const url = editingStudent 
        ? `/api/intern-students/${editingStudent.id}` 
        : '/api/intern-students'
      const method = editingStudent ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          passoutYear: parseInt(formData.passoutYear)
        })
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || `Failed to ${editingStudent ? 'update' : 'create'} student`)
      }

      await loadStudents()
      setIsAddDialogOpen(false)
      setEditingStudent(null)
      setFormData({
        name: "",
        email: "",
        branch: "",
        passoutYear: new Date().getFullYear().toString()
      })
    } catch (err) {
      alert(`Failed to ${editingStudent ? 'update' : 'create'} student: ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDownloadLetter = async (student: InternStudent, letterType: 'offer' | 'completion' | 'experience', years?: number) => {
    try {
      const res = await fetch(`/api/intern-students/${student.id}/letters`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          letterType,
          experienceYears: years 
        })
      })

      if (!res.ok) throw new Error('Failed to generate letter')

      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${letterType}-letter-${student.name.replace(/\s+/g, '-')}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err) {
      alert(`Failed to download letter: ${err instanceof Error ? err.message : 'Unknown error'}`)
    }
  }

  const handleExperienceLetterClick = (student: InternStudent) => {
    setSelectedStudent(student)
    setExperienceYears("")
    setExperienceYearsDialogOpen(true)
  }

  const handleExperienceYearsSubmit = async () => {
    if (!selectedStudent) return
    
    const years = parseFloat(experienceYears)
    if (isNaN(years) || years <= 0) {
      alert('Please enter a valid number of years (greater than 0)')
      return
    }

    setExperienceYearsDialogOpen(false)
    await handleDownloadLetter(selectedStudent, 'experience', years)
    setSelectedStudent(null)
    setExperienceYears("")
  }

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.branch.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <DataCenterLayout 
            variant="header"
            title="Intern Students Management"
            subtitle="Manage intern students and generate certificates"
          />
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <Button 
            variant="outline" 
            onClick={loadStudents}
            disabled={isLoading}
            className="flex items-center space-x-2"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={(open) => {
            setIsAddDialogOpen(open)
            if (!open) {
              setEditingStudent(null)
              setFormData({
                name: "",
                email: "",
                branch: "",
              passoutYear: new Date().getFullYear().toString()
              })
            }
          }}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                <Plus className="h-4 w-4 mr-2" />
                <span>Add New Student</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="w-[95vw] max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogTitle>{editingStudent ? 'Edit Student' : 'Add New Student'}</DialogTitle>
              <DialogDescription>
                {editingStudent ? 'Update student information.' : 'Add a new intern student to the system.'}
              </DialogDescription>
              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="sm:text-right">Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="sm:col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
                  <Label htmlFor="email" className="sm:text-right">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="sm:col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
                  <Label htmlFor="branch" className="sm:text-right">Branch *</Label>
                  <Input
                    id="branch"
                    value={formData.branch}
                    onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                    className="sm:col-span-3"
                    placeholder="Enter branch or department"
                    required
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
                  <Label htmlFor="passoutYear" className="sm:text-right">Passout Year *</Label>
                  <Input
                    id="passoutYear"
                    type="number"
                    value={formData.passoutYear}
                    onChange={(e) => setFormData({ ...formData, passoutYear: e.target.value })}
                    className="sm:col-span-3"
                    min="2020"
                    max="2030"
                    required
                  />
                </div>
                <div className="flex justify-end space-x-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Saving...' : (editingStudent ? 'Update Student' : 'Add Student')}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by name, email, or branch..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Error */}
        {error && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <p className="text-red-800">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Loading */}
        {isLoading && (
          <div className="text-center py-16">
            <RefreshCw className="h-10 w-10 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading students...</p>
          </div>
        )}

        {/* Students Table */}
        {!isLoading && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                Intern Students ({filteredStudents.length})
              </CardTitle>
              <CardDescription>
                Manage intern students and generate certificates
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredStudents.length === 0 ? (
                <div className="text-center py-16">
                  <GraduationCap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No students found</p>
                  <p className="text-sm text-gray-500 mt-2">
                    {searchTerm ? 'Try adjusting your search' : 'Add your first intern student to get started'}
                  </p>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[200px]">Name</TableHead>
                        <TableHead className="w-[250px]">Email</TableHead>
                        <TableHead>Branch</TableHead>
                        <TableHead className="w-[120px]">Passout Year</TableHead>
                        <TableHead className="w-[180px]">Letters</TableHead>
                        <TableHead className="w-[120px] text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredStudents.map((student) => (
                        <TableRow key={student.id} className="hover:bg-gray-50">
                          <TableCell className="font-medium">
                            {student.name}
                          </TableCell>
                          <TableCell className="text-sm text-gray-600">
                            {student.email}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="font-normal">
                              {student.branch}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <span className="font-medium">{student.passoutYear}</span>
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm" className="h-8">
                                  <FileText className="h-4 w-4 mr-1" />
                                  Letters
                                  <MoreVertical className="h-3 w-3 ml-1" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleDownloadLetter(student, 'offer')}>
                                  <Download className="h-4 w-4 mr-2" />
                                  Offer Letter
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleDownloadLetter(student, 'completion')}>
                                  <Download className="h-4 w-4 mr-2" />
                                  Completion Letter
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleExperienceLetterClick(student)}>
                                  <Download className="h-4 w-4 mr-2" />
                                  Experience Letter
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEdit(student)}
                                className="h-8"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDelete(student.id)}
                                className="h-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4" />
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
        )}

        {/* Experience Years Dialog */}
        <Dialog open={experienceYearsDialogOpen} onOpenChange={setExperienceYearsDialogOpen}>
          <DialogContent>
            <DialogTitle>Enter Experience Years</DialogTitle>
            <DialogDescription>
              Please enter the number of years of experience for {selectedStudent?.name}
            </DialogDescription>
            <div className="space-y-4 mt-4">
              <div>
                <Label htmlFor="experienceYears">Years of Experience *</Label>
                <Input
                  id="experienceYears"
                  type="number"
                  step="0.1"
                  min="0.1"
                  value={experienceYears}
                  onChange={(e) => setExperienceYears(e.target.value)}
                  placeholder="e.g., 1.5, 2, 0.5"
                  className="mt-2"
                  required
                />
              </div>
              <div className="flex justify-end space-x-2 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setExperienceYearsDialogOpen(false)
                    setSelectedStudent(null)
                    setExperienceYears("")
                  }}
                >
                  Cancel
                </Button>
                <Button type="button" onClick={handleExperienceYearsSubmit}>
                  Generate Letter
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

