"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface AuthGuardProps {
  children: React.ReactNode
  requiredRole: 'admin' | 'client'
  redirectTo?: string
}

export function AuthGuard({ children, requiredRole, redirectTo }: AuthGuardProps) {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('authToken')
      
      if (!token) {
        const redirect = redirectTo || (requiredRole === 'admin' ? '/admin' : '/client/signin')
        router.push(redirect)
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
          localStorage.removeItem('authToken')
          sessionStorage.removeItem(requiredRole)
          const redirect = redirectTo || (requiredRole === 'admin' ? '/admin' : '/client/signin')
          router.push(redirect)
          return
        }

        const data = await response.json()
        
        // Check if user has required role
        if (data.user?.role !== requiredRole) {
          const redirect = redirectTo || (requiredRole === 'admin' ? '/admin' : '/client/signin')
          router.push(redirect)
          return
        }

        // Authentication successful
        setIsAuthenticated(true)
      } catch (error) {
        console.error('Auth check error:', error)
        const redirect = redirectTo || (requiredRole === 'admin' ? '/admin' : '/client/signin')
        router.push(redirect)
      } finally {
        setIsChecking(false)
      }
    }

    checkAuth()
  }, [router, requiredRole, redirectTo])

  if (isChecking) {
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

  return <>{children}</>
}

