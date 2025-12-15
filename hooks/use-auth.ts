import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { JWTPayload } from '@/lib/jwt'

interface AuthState {
  user: JWTPayload | null
  token: string | null
  isLoading: boolean
  isAuthenticated: boolean
}

export function useAuth(requiredRole?: 'admin' | 'client' | 'sms_admin') {
  const router = useRouter()
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    token: null,
    isLoading: true,
    isAuthenticated: false
  })

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('authToken')
      
      if (!token) {
        setAuthState({
          user: null,
          token: null,
          isLoading: false,
          isAuthenticated: false
        })
        return
      }

      // Verify token with backend
      const response = await fetch('/api/auth/verify', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        
        // Check role if required
        if (requiredRole && data.user.role !== requiredRole) {
          logout()
          return
        }

        setAuthState({
          user: data.user,
          token,
          isLoading: false,
          isAuthenticated: true
        })
      } else {
        // Token invalid or expired
        logout()
      }
    } catch (error) {
      console.error('Auth check error:', error)
      logout()
    }
  }

  const refreshToken = async () => {
    try {
      const token = localStorage.getItem('authToken')
      
      if (!token) {
        return false
      }

      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        localStorage.setItem('authToken', data.token)
        
        setAuthState(prev => ({
          ...prev,
          token: data.token,
          user: data.user
        }))
        
        return true
      }
      
      return false
    } catch (error) {
      console.error('Token refresh error:', error)
      return false
    }
  }

  const logout = () => {
    localStorage.removeItem('authToken')
    sessionStorage.removeItem('admin')
    sessionStorage.removeItem('client')
    
    setAuthState({
      user: null,
      token: null,
      isLoading: false,
      isAuthenticated: false
    })

    // Redirect based on role
    if (requiredRole === 'admin') {
      router.push('/admin')
    } else if (requiredRole === 'client') {
      router.push('/client/signin')
    } else {
      router.push('/')
    }
  }

  const getAuthHeaders = () => {
    const token = authState.token || localStorage.getItem('authToken')
    
    if (!token) {
      return {}
    }

    return {
      'Authorization': `Bearer ${token}`
    }
  }

  return {
    user: authState.user,
    token: authState.token,
    isLoading: authState.isLoading,
    isAuthenticated: authState.isAuthenticated,
    refreshToken,
    logout,
    getAuthHeaders,
    checkAuth
  }
}

