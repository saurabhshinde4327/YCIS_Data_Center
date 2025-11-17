import { NextRequest, NextResponse } from 'next/server'
import { clientDB, initializeClientDatabase } from '@/lib/clientDatabase'
import { signToken } from '@/lib/jwt'

// Force this route to use Node.js runtime instead of Edge runtime
export const runtime = 'nodejs'

// Ensure database is initialized
initializeClientDatabase()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body
    
    console.log('Login attempt:', { email, passwordLength: password?.length })

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Find client by email
    const client = await clientDB.getClientByEmail(email)
    
    console.log('Client found:', client ? 'Yes' : 'No')

    if (!client) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Verify password (simple comparison - in production use bcrypt)
    console.log('Password check:', { 
      provided: password, 
      stored: client.password, 
      match: client.password === password 
    })
    
    if (client.password !== password) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Check if account is active
    console.log('Account status:', client.status)
    
    if (client.status !== 'active') {
      return NextResponse.json(
        { error: 'Your account is not active. Please contact support.' },
        { status: 403 }
      )
    }

    // Return client data (excluding password)
    const { password: _, ...clientData } = client

    // Generate JWT token
    const token = signToken({
      id: client.id,
      email: client.email,
      name: client.name,
      role: 'client'
    })

    console.log('Client login successful')

    return NextResponse.json({
      success: true,
      token,
      client: clientData
    })
  } catch (error) {
    console.error('Error signing in client:', error)
    return NextResponse.json(
      { error: 'Failed to sign in' },
      { status: 500 }
    )
  }
}

