"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { Trash2 } from "lucide-react"

interface StudentRow {
  id: string
  name: string
  contactNo: string
  className: string
  fileName?: string
  uploadedAt: string
}

export default function SmsStudentsPage() {
  const router = useRouter()
  const [students, setStudents] = useState<StudentRow[]>([])
  const [file, setFile] = useState<File | null>(null)
  const [name, setName] = useState("")
  const [contactNo, setContactNo] = useState("")
  const [className, setClassName] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    const token = localStorage.getItem("smsAuthToken")
    if (!token) {
      router.replace("/sms-admin")
      return
    }

    const verify = async () => {
      try {
        const res = await fetch("/api/auth/verify", {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (!res.ok) {
          localStorage.removeItem("smsAuthToken")
          router.replace("/sms-admin")
          return
        }

        await loadStudents(token)
      } catch (err) {
        console.error("Verify failed", err)
        router.replace("/sms-admin")
      } finally {
        setIsLoading(false)
      }
    }

    verify()
  }, [router])

  const loadStudents = async (token?: string) => {
    setError(null)
    try {
      const res = await fetch("/api/sms-admin/students", {
        headers: { Authorization: `Bearer ${token || localStorage.getItem("smsAuthToken")}` }
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || "Failed to load students")
      }
      const data = await res.json()
      setStudents(data.students || [])
    } catch (err: any) {
      setError(err.message || "Could not fetch students")
    }
  }

  const handleFileUpload = async () => {
    if (!file) {
      setError("Please select a CSV file first.")
      return
    }

    setIsSaving(true)
    setError(null)
    setStatus("Uploading...")

    try {
      const formData = new FormData()
      formData.append("file", file)

      const res = await fetch("/api/sms-admin/students", {
        method: "POST",
        headers: { Authorization: `Bearer ${localStorage.getItem("smsAuthToken")}` },
        body: formData
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || "Upload failed")
      }

      const data = await res.json()
      setStudents(data.students || [])
      setStatus(`Uploaded ${data.inserted} records.`)
      setFile(null)
    } catch (err: any) {
      setError(err.message || "Upload failed")
    } finally {
      setIsSaving(false)
      setTimeout(() => setStatus(null), 3000)
    }
  }

  const handleManualAdd = async () => {
    if (!name || !contactNo || !className) {
      setError("All fields are required for manual entry.")
      return
    }

    setIsSaving(true)
    setError(null)
    setStatus("Saving...")

    try {
      const res = await fetch("/api/sms-admin/students", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("smsAuthToken")}`
        },
        body: JSON.stringify({ name, contactNo, className })
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || "Save failed")
      }

      const data = await res.json()
      setStudents(data.students || [])
      setName("")
      setContactNo("")
      setClassName("")
      setStatus("Student added.")
    } catch (err: any) {
      setError(err.message || "Save failed")
    } finally {
      setIsSaving(false)
      setTimeout(() => setStatus(null), 2000)
    }
  }

  const handleDelete = async (studentId: string, studentName: string) => {
    if (!confirm(`Are you sure you want to delete ${studentName}? This action cannot be undone.`)) {
      return
    }

    setDeletingId(studentId)
    setError(null)

    try {
      const res = await fetch(`/api/sms-admin/students/${studentId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("smsAuthToken")}`
        }
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || "Failed to delete student")
      }

      setStatus("Student deleted successfully.")
      await loadStudents()
    } catch (err: any) {
      setError(err.message || "Failed to delete student")
    } finally {
      setDeletingId(null)
      setTimeout(() => setStatus(null), 3000)
    }
  }

  return (
    <div className="max-w-6xl mx-auto py-10 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-blue-900">Manage Students</h1>
        <p className="text-sm text-gray-600 mt-2">
          Upload student contacts for SMS campaigns. Accepted format: CSV with columns
          Name, ContactNo, Class.
        </p>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {status && (
        <Alert className="mb-4">
          <AlertDescription>{status}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Upload CSV</CardTitle>
            <CardDescription>Upload student list with Name, ContactNo, Class columns.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              type="file"
              accept=".csv,text/csv"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
            <Button onClick={handleFileUpload} disabled={isSaving || !file}>
              {isSaving ? "Uploading..." : "Upload File"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Manual Add</CardTitle>
            <CardDescription>Quickly add one student record.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input
              placeholder="Student Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <Input
              placeholder="Contact Number"
              value={contactNo}
              onChange={(e) => setContactNo(e.target.value)}
            />
            <Input
              placeholder="Class"
              value={className}
              onChange={(e) => setClassName(e.target.value)}
            />
            <Button onClick={handleManualAdd} disabled={isSaving}>
              {isSaving ? "Saving..." : "Add Student"}
            </Button>
          </CardContent>
        </Card>
      </div>

      <Separator className="my-8" />

      <Card>
        <CardHeader>
          <CardTitle>Uploaded Students</CardTitle>
          <CardDescription>Total: {students.length}</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Contact No</TableHead>
                <TableHead>Class</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Uploaded At</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!isLoading && students.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-gray-500">
                    No students uploaded yet.
                  </TableCell>
                </TableRow>
              )}
              {students.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="font-medium">{s.name}</TableCell>
                  <TableCell>{s.contactNo}</TableCell>
                  <TableCell>{s.className}</TableCell>
                  <TableCell>{s.fileName || "Manual"}</TableCell>
                  <TableCell>{new Date(s.uploadedAt).toLocaleString()}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(s.id, s.name)}
                      disabled={deletingId === s.id}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

