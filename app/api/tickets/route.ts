import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/database'

// GET /api/tickets - Get all tickets or filter by client email
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const clientEmail = searchParams.get('clientEmail')

    if (clientEmail) {
      const tickets = await db.getTicketsByClientEmail(clientEmail)
      return NextResponse.json(tickets)
    }

    const tickets = await db.getTickets()
    return NextResponse.json(tickets)
  } catch (error) {
    console.error('Error fetching tickets:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tickets' },
      { status: 500 }
    )
  }
}

// POST /api/tickets - Create a new ticket
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const { clientId, clientName, clientEmail, subject, description, category, priority } = body

    if (!clientId || !clientName || !clientEmail || !subject || !description) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const newTicket = await db.createTicket({
      clientId,
      clientName,
      clientEmail,
      subject,
      description,
      category: category || 'general',
      priority: priority || 'medium',
      status: 'open'
    })

    return NextResponse.json(newTicket, { status: 201 })
  } catch (error) {
    console.error('Error creating ticket:', error)
    return NextResponse.json(
      { error: 'Failed to create ticket' },
      { status: 500 }
    )
  }
}

