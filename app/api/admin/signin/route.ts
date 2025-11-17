import { NextRequest, NextResponse } from 'next/server'
import { signToken } from '@/lib/jwt'

// Force this route to use Node.js runtime instead of Edge runtime
export const runtime = 'nodejs'

// Admin credentials - in production, these should be in a secure database with hashed passwords
const ADMIN_EMAIL = "shindesaurabh0321@gmail.com"
const ADMIN_PASSWORD = "Saurabh@2000"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    console.log('Admin login attempt:', { email, passwordLength: password?.length })

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Validate admin credentials
    if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Generate JWT token
    const token = signToken({
      id: 'admin-1',
      email: ADMIN_EMAIL,
      name: 'Administrator',
      role: 'admin'
    })

    console.log('Admin login successful')

    // Return token and admin data
    return NextResponse.json({
      success: true,
      token,
      admin: {
        id: 'admin-1',
        email: ADMIN_EMAIL,
        name: 'Administrator',
        role: 'admin'
      }
    })
  } catch (error) {
    console.error('Error signing in admin:', error)
    return NextResponse.json(
      { error: 'Failed to sign in' },
      { status: 500 }
    )
  }
}

