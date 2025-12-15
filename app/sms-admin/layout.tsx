"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  LayoutDashboard,
  UploadCloud,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  PhoneCall,
  Send
} from "lucide-react"

export default function SmsAdminLayout({
  children
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [isAuthChecking, setIsAuthChecking] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  const isLoginPage = pathname === "/sms-admin" && !pathname.includes("/sms-admin/")

  useEffect(() => {
    const savedPreference = localStorage.getItem("smsSidebarCollapsed")
    if (savedPreference !== null) {
      setSidebarCollapsed(savedPreference === "true")
    } else {
      setSidebarCollapsed(false)
      localStorage.setItem("smsSidebarCollapsed", "false")
    }
  }, [])

  const toggleSidebar = () => {
    const next = !sidebarCollapsed
    setSidebarCollapsed(next)
    localStorage.setItem("smsSidebarCollapsed", String(next))
  }

  useEffect(() => {
    if (isLoginPage) {
      setIsAuthChecking(false)
      setIsAuthenticated(true)
      return
    }

    const checkAuth = async () => {
      const token = localStorage.getItem("smsAuthToken")
      if (!token) {
        router.push("/sms-admin")
        return
      }

      try {
        const res = await fetch("/api/auth/verify", {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (!res.ok) {
          localStorage.removeItem("smsAuthToken")
          router.push("/sms-admin")
          return
        }
        const data = await res.json()
        if (data.user?.role !== "sms_admin") {
          localStorage.removeItem("smsAuthToken")
          router.push("/sms-admin")
          return
        }
        setIsAuthenticated(true)
      } catch (err) {
        console.error("SMS auth check failed", err)
        router.push("/sms-admin")
      } finally {
        setIsAuthChecking(false)
      }
    }

    checkAuth()
  }, [isLoginPage, router])

  const handleLogout = () => {
    localStorage.removeItem("smsAuthToken")
    router.push("/sms-admin")
  }

  if (isLoginPage) {
    return <>{children}</>
  }

  if (isAuthChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Verifying authentication...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  const navigationItems = [
    { title: "Dashboard", href: "/sms-admin/dashboard", icon: LayoutDashboard },
    { title: "Students", href: "/sms-admin/students", icon: UploadCloud },
    { title: "Send SMS", href: "/sms-admin/send", icon: Send }
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white shadow-md border-b border-gray-200 sticky top-0 z-50">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-10 h-10 bg-blue-900 rounded-lg flex items-center justify-center shadow-lg">
                <PhoneCall className="h-5 w-5 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
            </div>
            <div>
              <h1 className="text-lg font-bold text-blue-900">SMS Admin</h1>
              <p className="text-xs text-gray-600 font-medium">Support Portal</p>
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            className="text-gray-700 hover:bg-gray-100 p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>

        {mobileMenuOpen && (
          <div className="bg-white shadow-lg border-t border-gray-200">
            <nav className="p-4">
              <div className="space-y-2 mb-6">
                {navigationItems.map((item) => {
                  const Icon = item.icon
                  const isActive = pathname === item.href
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`
                        flex items-center px-4 py-3 text-base font-semibold rounded-lg transition-all duration-200
                        ${isActive ? "bg-blue-900 text-white shadow-lg" : "text-gray-700 hover:bg-gray-100 hover:text-blue-900"}
                      `}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {Icon && <Icon className="mr-4 h-5 w-5" />}
                      {item.title}
                    </Link>
                  )
                })}
              </div>

              <div className="border-t border-gray-200 pt-4">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="relative">
                    <div className="w-10 h-10 bg-blue-900 rounded-lg flex items-center justify-center shadow-lg">
                      <span className="text-white text-sm font-bold">S</span>
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">SMS Admin</p>
                    <p className="text-xs text-gray-600">Support</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  className="w-full border-gray-300 text-gray-700 hover:bg-red-50 hover:border-red-300 hover:text-red-600 transition-all duration-200"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </Button>
              </div>
            </nav>
          </div>
        )}
      </div>

      {/* Desktop Layout */}
      <div className="hidden lg:flex min-h-screen">
        <aside
          className={`
            bg-white shadow-xl border-r border-gray-200 flex flex-col h-screen sticky top-0 transition-all duration-300 ease-in-out
            ${sidebarCollapsed ? "w-24" : "w-72"}
          `}
        >
          <div className="p-6 border-b border-gray-200">
            <div className={`flex items-center ${sidebarCollapsed ? "justify-center" : "space-x-4"}`}>
              <div className="relative">
                <div className="w-12 h-12 bg-blue-900 rounded-lg flex items-center justify-center shadow-lg">
                  <PhoneCall className="h-6 w-6 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
              </div>
              {!sidebarCollapsed && (
                <div>
                  <h1 className="text-xl font-bold text-blue-900">SMS Admin</h1>
                  <p className="text-xs text-gray-600 font-medium">Support Portal</p>
                </div>
              )}
            </div>
          </div>

          <nav className="flex-1 px-4 py-6 overflow-y-auto">
            <div className="space-y-2">
              {navigationItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`
                      flex items-center text-sm font-semibold rounded-lg transition-all duration-300 relative group
                      ${sidebarCollapsed ? "px-3 py-4 justify-center" : "px-4 py-3"}
                      ${isActive ? "bg-blue-900 text-white shadow-lg" : "text-gray-700 hover:text-blue-900 hover:bg-gray-100"}
                    `}
                    title={sidebarCollapsed ? item.title : ""}
                  >
                    {Icon && <Icon className={`${sidebarCollapsed ? "h-7 w-7" : "h-5 w-5 mr-3"}`} />}
                    {!sidebarCollapsed && (
                      <>
                        {item.title}
                        {isActive && <div className="absolute right-2 w-2 h-2 bg-white rounded-full"></div>}
                      </>
                    )}
                    {sidebarCollapsed && (
                      <div className="absolute left-full ml-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 shadow-lg">
                        {item.title}
                      </div>
                    )}
                  </Link>
                )
              })}
            </div>
          </nav>

          <div className="p-4 border-t border-gray-200">
            {!sidebarCollapsed ? (
              <>
                <div className="flex items-center space-x-3 mb-4">
                  <div className="relative">
                    <div className="w-10 h-10 bg-blue-900 rounded-lg flex items-center justify-center shadow-lg">
                      <span className="text-white text-sm font-bold">S</span>
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">SMS Admin</p>
                    <p className="text-xs text-gray-600">Support</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  className="w-full border-gray-300 text-gray-700 hover:bg-red-50 hover:border-red-300 hover:text-red-600 transition-all duration-200"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </Button>
              </>
            ) : (
              <div className="flex flex-col items-center space-y-3">
                <div className="relative">
                  <div className="w-10 h-10 bg-blue-900 rounded-lg flex items-center justify-center shadow-lg">
                    <span className="text-white text-sm font-bold">S</span>
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  className="w-full border-gray-300 text-gray-700 hover:bg-red-50 hover:border-red-300 hover:text-red-600 transition-all duration-200 p-2"
                  title="Logout"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </aside>

        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between shadow-sm">
            <Button
              onClick={toggleSidebar}
              variant="outline"
              size="sm"
              className="bg-white hover:bg-gray-100 border-gray-300 text-gray-700"
              title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {sidebarCollapsed ? (
                <>
                  <ChevronRight className="h-4 w-4 mr-2" />
                  Show Menu
                </>
              ) : (
                <>
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Hide Menu
                </>
              )}
            </Button>
            <div className="text-sm text-gray-600">
              {pathname.split("/").pop()?.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()) || "Dashboard"}
            </div>
          </div>

          <main className="flex-1 overflow-y-auto p-8">
            <div className="max-w-7xl mx-auto">
              <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
                {children}
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* Mobile content */}
      <div className="lg:hidden">
        <main className="p-4">
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

