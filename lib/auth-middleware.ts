import { NextRequest, NextResponse } from 'next/server'
import { verifyToken, extractTokenFromHeader, JWTPayload } from './jwt'

export interface AuthenticatedRequest extends NextRequest {
  user?: JWTPayload
}

/**
 * Middleware to verify JWT token from request headers
 * Returns user data if valid, or error response if invalid
 */
export async function authMiddleware(
  request: NextRequest,
  requiredRole?: 'admin' | 'client'
): Promise<{ user: JWTPayload } | NextResponse> {
  try {
    // Extract token from Authorization header
    const authHeader = request.headers.get('authorization')
    const token = extractTokenFromHeader(authHeader)

    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required. No token provided.' },
        { status: 401 }
      )
    }

    // Verify token
    const user = verifyToken(token)

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      )
    }

    // Check role if required
    if (requiredRole && user.role !== requiredRole) {
      return NextResponse.json(
        { error: 'Access denied. Insufficient permissions.' },
        { status: 403 }
      )
    }

    return { user }
  } catch (error) {
    console.error('Auth middleware error:', error)
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 401 }
    )
  }
}

/**
 * Helper function to get user from token in client components
 */
export function getUserFromToken(token: string | null): JWTPayload | null {
  if (!token) return null
  return verifyToken(token)
}

/**
 * Helper to check if user is authenticated (client-side)
 */
export function isAuthenticated(): boolean {
  if (typeof window === 'undefined') return false
  
  const token = localStorage.getItem('authToken')
  if (!token) return false
  
  const user = verifyToken(token)
  return user !== null
}

/**
 * Helper to get current user (client-side)
 */
export function getCurrentUser(): JWTPayload | null {
  if (typeof window === 'undefined') return null
  
  const token = localStorage.getItem('authToken')
  if (!token) return null
  
  return verifyToken(token)
}

/**
 * Helper to check if user has specific role (client-side)
 */
export function hasRole(role: 'admin' | 'client'): boolean {
  const user = getCurrentUser()
  return user?.role === role
}

