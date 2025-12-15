"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"

interface StudentRow {
  id: string
  name: string
  contactNo: string
  className: string
  fileName?: string
  uploadedAt: string
}

export default function SendSmsPage() {
  const router = useRouter()
  const [students, setStudents] = useState<StudentRow[]>([])
  const [selectedStudents, setSelectedStudents] = useState<Set<string>>(new Set())
  const [title, setTitle] = useState("")
  const [message, setMessage] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)

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

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedStudents(new Set(students.map(s => s.id)))
    } else {
      setSelectedStudents(new Set())
    }
  }

  const handleStudentToggle = (studentId: string, checked: boolean) => {
    const newSelected = new Set(selectedStudents)
    if (checked) {
      newSelected.add(studentId)
    } else {
      newSelected.delete(studentId)
    }
    setSelectedStudents(newSelected)
  }

  const handleSendSms = async () => {
    if (!title.trim()) {
      setError("Please enter a title for the SMS.")
      return
    }

    if (!message.trim()) {
      setError("Please enter a message.")
      return
    }

    if (selectedStudents.size === 0) {
      setError("Please select at least one student.")
      return
    }

    setIsSending(true)
    setError(null)
    setStatus("Sending SMS...")

    try {
      const res = await fetch("/api/sms-admin/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("smsAuthToken")}`
        },
        body: JSON.stringify({
          title: title.trim(),
          message: message.trim(),
          studentIds: Array.from(selectedStudents)
        })
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || "Failed to send SMS")
      }

      const data = await res.json()
      setStatus(`Successfully sent SMS to ${data.sentCount} student(s).`)
      setTitle("")
      setMessage("")
      setSelectedStudents(new Set())
    } catch (err: any) {
      setError(err.message || "Failed to send SMS")
    } finally {
      setIsSending(false)
      setTimeout(() => setStatus(null), 5000)
    }
  }

  const allSelected = students.length > 0 && selectedStudents.size === students.length
  const someSelected = selectedStudents.size > 0 && selectedStudents.size < students.length

  return (
    <div className="max-w-6xl mx-auto py-10 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-blue-900">Send SMS</h1>
        <p className="text-sm text-gray-600 mt-2">
          Send SMS messages to selected students. Select students individually or select all.
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left side - SMS Form */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>SMS Details</CardTitle>
              <CardDescription>Enter the title and message for your SMS.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  placeholder="Enter SMS title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  disabled={isSending}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  placeholder="Enter your message here..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={8}
                  disabled={isSending}
                  className="resize-none"
                />
                <p className="text-xs text-gray-500">
                  {message.length} characters
                </p>
              </div>
              <Button
                onClick={handleSendSms}
                disabled={isSending || !title.trim() || !message.trim() || selectedStudents.size === 0}
                className="w-full"
                size="lg"
              >
                {isSending ? "Sending..." : `Send SMS to ${selectedStudents.size} Student(s)`}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Right side - Student Selection */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Select Students</CardTitle>
              <CardDescription>
                {selectedStudents.size} of {students.length} selected
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Select All Checkbox */}
                <div className="flex items-center space-x-2 pb-3 border-b">
                  <Checkbox
                    id="select-all"
                    checked={allSelected}
                    onCheckedChange={handleSelectAll}
                    disabled={isLoading || students.length === 0}
                  />
                  <Label
                    htmlFor="select-all"
                    className="text-sm font-medium cursor-pointer"
                  >
                    Select All Students
                  </Label>
                </div>

                {/* Students List */}
                <ScrollArea className="h-[500px] pr-4">
                  {isLoading ? (
                    <div className="text-center text-gray-500 py-8">
                      Loading students...
                    </div>
                  ) : students.length === 0 ? (
                    <div className="text-center text-gray-500 py-8">
                      No students available. Add students first.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {students.map((student) => (
                        <div
                          key={student.id}
                          className="flex items-start space-x-3 p-2 rounded hover:bg-gray-50"
                        >
                          <Checkbox
                            id={`student-${student.id}`}
                            checked={selectedStudents.has(student.id)}
                            onCheckedChange={(checked) =>
                              handleStudentToggle(student.id, checked as boolean)
                            }
                            disabled={isSending}
                          />
                          <Label
                            htmlFor={`student-${student.id}`}
                            className="flex-1 cursor-pointer"
                          >
                            <div className="font-medium text-sm">{student.name}</div>
                            <div className="text-xs text-gray-500">
                              {student.contactNo} • {student.className}
                            </div>
                          </Label>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

