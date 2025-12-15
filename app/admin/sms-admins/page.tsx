"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Switch } from "@/components/ui/switch"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface SmsAdminRow {
  id: string
  username: string
  email: string
  name: string
  active: boolean
  createdAt: string
}

export default function SmsAdminsPage() {
  const [admins, setAdmins] = useState<SmsAdminRow[]>([])
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    loadAdmins()
  }, [])

  const authHeader = () => {
    const token = localStorage.getItem("authToken")
    return token ? { Authorization: `Bearer ${token}` } : {}
  }

  const loadAdmins = async () => {
    setError(null)
    try {
      const res = await fetch("/api/sms-admins", { headers: { ...authHeader() } })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || "Failed to load admins")
      }
      const data = await res.json()
      setAdmins(data.admins || [])
    } catch (err: any) {
      setError(err.message || "Failed to load admins")
    }
  }

  const handleCreate = async () => {
    if (!username || !email || !password || !name) {
      setError("All fields are required")
      return
    }
    setIsLoading(true)
    setError(null)
    setStatus("Creating admin...")
    try {
      const res = await fetch("/api/sms-admins", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...authHeader()
        },
        body: JSON.stringify({ username, email, password, name, active: true })
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(data.error || "Create failed")
      }
      setAdmins(data.admins || [])
      setUsername("")
      setEmail("")
      setPassword("")
      setName("")
      setStatus("Admin created")
      setTimeout(() => setStatus(null), 2000)
    } catch (err: any) {
      setError(err.message || "Create failed")
    } finally {
      setIsLoading(false)
    }
  }

  const handleToggle = async (id: string, active: boolean) => {
    setError(null)
    try {
      const res = await fetch(`/api/sms-admins/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...authHeader()
        },
        body: JSON.stringify({ active })
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(data.error || "Update failed")
      }
      setAdmins(data.admins || [])
    } catch (err: any) {
      setError(err.message || "Update failed")
    }
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-blue-900">SMS Admins</h2>
          <p className="text-sm text-gray-600">Create and manage SMS admin users.</p>
        </div>
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

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Create SMS Admin</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Input placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
          <Input placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <Input placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <Input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
          <div className="md:col-span-2 lg:col-span-4">
            <Button onClick={handleCreate} disabled={isLoading}>
              {isLoading ? "Creating..." : "Create Admin"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Admins</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Username</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Active</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {admins.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-sm text-gray-500">
                    No admins found.
                  </TableCell>
                </TableRow>
              )}
              {admins.map((a) => (
                <TableRow key={a.id}>
                  <TableCell className="font-medium">{a.username}</TableCell>
                  <TableCell>{a.email}</TableCell>
                  <TableCell>{a.name}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Switch checked={a.active} onCheckedChange={(checked) => handleToggle(a.id, checked)} />
                      <span className="text-sm text-gray-600">{a.active ? "Active" : "Inactive"}</span>
                    </div>
                  </TableCell>
                  <TableCell>{new Date(a.createdAt).toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

