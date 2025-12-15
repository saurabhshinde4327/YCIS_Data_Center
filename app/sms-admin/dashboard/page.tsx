"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface AdminStats {
  smsCount: number
  createdAt: string
  name: string
  email: string
}

export default function SmsDashboardPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [adminStats, setAdminStats] = useState<AdminStats | null>(null)

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

        await loadAdminStats(token)
      } catch (err) {
        console.error("Verify failed", err)
        router.replace("/sms-admin")
      } finally {
        setIsLoading(false)
      }
    }

    verify()
  }, [router])

  const loadAdminStats = async (token?: string) => {
    try {
      const res = await fetch("/api/sms-admin/stats", {
        headers: { Authorization: `Bearer ${token || localStorage.getItem("smsAuthToken")}` }
      })
      if (res.ok) {
        const data = await res.json()
        if (data.success && data.stats) {
          setAdminStats(data.stats)
        }
      }
    } catch (err) {
      console.error("Failed to load admin stats:", err)
    }
  }

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto py-10 px-4">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto py-10 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-blue-900">Dashboard</h1>
        <p className="text-sm text-gray-600 mt-2">
          Overview of your SMS admin account statistics and information.
        </p>
      </div>

      {adminStats ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Admin Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Name</p>
                  <p className="font-medium text-lg">{adminStats.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium text-lg">{adminStats.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Account Created</p>
                  <p className="font-medium text-lg">
                    {new Date(adminStats.createdAt).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">SMS Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Total SMS Sent</p>
                  <p className="text-4xl font-bold text-blue-600 mt-2">
                    {adminStats.smsCount.toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card>
          <CardContent className="py-10">
            <p className="text-center text-gray-500">Failed to load admin statistics.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

