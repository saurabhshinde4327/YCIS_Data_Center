import { NextRequest, NextResponse } from 'next/server'
import { verifyToken, extractTokenFromHeader, signToken, isTokenExpired } from '@/lib/jwt'

// Force this route to use Node.js runtime instead of Edge runtime
export const runtime = 'nodejs'

/**
 * Refresh JWT token endpoint
 * Issues a new token if the current one is still valid but about to expire
 */
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    const token = extractTokenFromHeader(authHeader)

    if (!token) {
      return NextResponse.json(
        { error: 'No token provided' },
        { status: 401 }
      )
    }

    // Check if token is expired
    if (isTokenExpired(token)) {
      return NextResponse.json(
        { error: 'Token has expired. Please sign in again.' },
        { status: 401 }
      )
    }

    // Verify and decode current token
    const user = verifyToken(token)

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      )
    }

    // Generate new token with same data
    const newToken = signToken({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    })

    return NextResponse.json({
      success: true,
      token: newToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    })
  } catch (error) {
    console.error('Token refresh error:', error)
    return NextResponse.json(
      { error: 'Failed to refresh token' },
      { status: 500 }
    )
  }
}

