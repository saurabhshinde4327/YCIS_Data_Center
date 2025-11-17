"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ClientWhatsApp } from "@/components/client-whatsapp"
import { 
  LayoutDashboard, 
  LogOut,
  Menu,
  X,
  FileText,
  Package,
  HelpCircle,
  Settings,
  CreditCard
} from "lucide-react"

const navigationItems = [
  {
    title: "Dashboard",
    href: "/client/dashboard",
    icon: LayoutDashboard
  },
  {
    title: "Services",
    href: "/client/services",
    icon: Package
  },
  {
    title: "Invoices",
    href: "/client/invoices",
    icon: FileText
  },
  {
    title: "Online Payment",
    href: "/client/payments",
    icon: CreditCard
  },
  {
    title: "Raise Ticket",
    href: "/client/tickets",
    icon: HelpCircle
  },
  {
    title: "Settings",
    href: "/client/settings",
    icon: Settings
  }
]

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [clientName, setClientName] = useState("Client")
  const [isAuthChecking, setIsAuthChecking] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  // Check if this is the login page
  const isLoginPage = pathname === '/client/signin'

  // Check authentication for all non-login pages
  useEffect(() => {
    if (isLoginPage) {
      setIsAuthChecking(false)
      setIsAuthenticated(true)
      return
    }

    let isMounted = true

    const checkAuth = async () => {
      const token = localStorage.getItem('authToken')
      const clientData = sessionStorage.getItem("client")
      
      if (!token || !clientData) {
        if (isMounted) {
          router.push('/client/signin')
        }
        return
      }

      try {
        const response = await fetch('/api/auth/verify', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        if (!response.ok) {
          // Token invalid or expired
          if (isMounted) {
            localStorage.removeItem('authToken')
            sessionStorage.removeItem('client')
            router.push('/client/signin')
          }
          return
        }

        const data = await response.json()
        
        // Check if user has client role
        if (data.user?.role !== 'client') {
          if (isMounted) {
            router.push('/client/signin')
          }
          return
        }

        // Authentication successful, set client name
        try {
          const client = JSON.parse(clientData)
          if (isMounted) {
            setClientName(client.name || "Client")
            setIsAuthenticated(true)
          }
        } catch (error) {
          console.error("Error parsing client data:", error)
          if (isMounted) {
            router.push('/client/signin')
          }
        }
      } catch (error) {
        console.error('Auth check error:', error)
        if (isMounted) {
          router.push('/client/signin')
        }
      } finally {
        if (isMounted) {
          setIsAuthChecking(false)
        }
      }
    }

    checkAuth()

    return () => {
      isMounted = false
    }
  }, [pathname, isLoginPage, router])

  const handleLogout = () => {
    // Clear JWT token and session data
    localStorage.removeItem('authToken')
    sessionStorage.removeItem("client")
    router.push("/client/signin")
  }

  // If it's the login page, render without layout
  if (isLoginPage) {
    return <>{children}</>
  }

  // Show loading while checking authentication
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

  // If not authenticated, don't render anything (will redirect)
  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white shadow-md border-b border-gray-200 sticky top-0 z-50">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-10 h-10 relative overflow-hidden rounded-lg shadow-lg">
                <Image 
                  src="/datacenter.png" 
                  alt="YCIS Data Center Logo" 
                  width={40}
                  height={40}
                  className="w-full h-full object-contain"
                  style={{ filter: 'none' }}
                />
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
            </div>
            <div>
              <h1 className="text-lg font-bold text-blue-900">
                YCIS Client Portal
              </h1>
              <p className="text-xs text-gray-600 font-medium">Data Center</p>
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

        {/* Mobile Navigation Menu */}
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
                        ${isActive 
                          ? 'bg-blue-900 text-white shadow-lg' 
                          : 'text-gray-700 hover:bg-gray-100 hover:text-blue-900'
                        }
                      `}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Icon className="mr-4 h-5 w-5" />
                      {item.title}
                    </Link>
                  )
                })}
              </div>
              
              {/* Mobile User Section */}
              <div className="border-t border-gray-200 pt-4">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="relative">
                    <div className="w-10 h-10 bg-blue-900 rounded-lg flex items-center justify-center shadow-lg">
                      <span className="text-white text-sm font-bold">{clientName.charAt(0).toUpperCase()}</span>
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">Welcome, {clientName}</p>
                    <p className="text-xs text-gray-600">Client Account</p>
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
        {/* Left Sidebar Navigation */}
        <aside className="w-72 bg-white shadow-xl border-r border-gray-200 flex flex-col h-screen sticky top-0">
          {/* Logo and Title */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-12 h-12 relative overflow-hidden rounded-lg shadow-lg">
                <Image 
                  src="/datacenter.png" 
                  alt="YCIS Data Center Logo" 
                  width={48}
                  height={48}
                  className="w-full h-full object-contain"
                  style={{ filter: 'none' }}
                />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
              </div>
              <div>
                <h1 className="text-xl font-bold text-blue-900">
                  Client Portal
                </h1>
                <p className="text-xs text-gray-600 font-medium">YCIS Data Center</p>
              </div>
            </div>
          </div>

          {/* Navigation Menu */}
          <nav className="flex-1 px-4 py-6">
            <div className="space-y-2">
              {navigationItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`
                      flex items-center px-4 py-3 text-sm font-semibold rounded-lg transition-all duration-300 relative group
                      ${isActive 
                        ? 'bg-blue-900 text-white shadow-lg' 
                        : 'text-gray-700 hover:text-blue-900 hover:bg-gray-100'
                      }
                    `}
                  >
                    <Icon className="mr-3 h-5 w-5" />
                    {item.title}
                    {isActive && (
                      <div className="absolute right-2 w-2 h-2 bg-white rounded-full"></div>
                    )}
                  </Link>
                )
              })}
            </div>
          </nav>

          {/* User Info and Logout */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center space-x-3 mb-4">
              <div className="relative">
                <div className="w-10 h-10 bg-blue-900 rounded-lg flex items-center justify-center shadow-lg">
                  <span className="text-white text-sm font-bold">{clientName.charAt(0).toUpperCase()}</span>
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800 truncate max-w-[150px]">
                  {clientName}
                </p>
                <p className="text-xs text-gray-600">Client Account</p>
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
        </aside>

        {/* Main content area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Main content */}
          <main className="flex-1 overflow-y-auto bg-gray-50">
            {children}
          </main>
        </div>
      </div>

      {/* Mobile Main Content */}
      <div className="lg:hidden bg-gray-50 min-h-screen">
        <main>
          {children}
        </main>
      </div>

      {/* WhatsApp Chat Widget */}
      <ClientWhatsApp />
    </div>
  )
}

