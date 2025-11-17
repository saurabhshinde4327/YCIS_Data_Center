import { NextRequest, NextResponse } from 'next/server'
import { clientDB, initializeClientDatabase } from '@/lib/clientDatabase'

// Ensure database is initialized
initializeClientDatabase()

export async function GET() {
  try {
    const clients = await clientDB.getAllClientsWithPassword()
    return NextResponse.json(clients)
  } catch (error) {
    console.error('Error fetching clients:', error)
    return NextResponse.json(
      { error: 'Failed to fetch clients' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate required fields
    if (!body.name || !body.email || !body.password) {
      return NextResponse.json(
        { error: 'Name, email, and password are required' },
        { status: 400 }
      )
    }

    // Check if email already exists
    const existingClient = await clientDB.getClientByEmail(body.email)
    if (existingClient) {
      return NextResponse.json(
        { error: 'Email already exists' },
        { status: 400 }
      )
    }

    const newClient = await clientDB.createClient({
      name: body.name,
      email: body.email,
      password: body.password,
      phone: body.phone || '',
      company: body.company || '',
      package: body.package || '',
      status: body.status || 'active'
    })
    
    return NextResponse.json(newClient, { status: 201 })
  } catch (error) {
    console.error('Error creating client:', error)
    return NextResponse.json(
      { error: 'Failed to create client' },
      { status: 500 }
    )
  }
}

