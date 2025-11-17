import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/database'

// GET /api/chat/clients - Get list of clients with chat messages
export async function GET() {
  try {
    const clients = await db.getChatClients()
    return NextResponse.json(clients)
  } catch (error) {
    console.error('Error fetching chat clients:', error)
    return NextResponse.json(
      { error: 'Failed to fetch chat clients' },
      { status: 500 }
    )
  }
}

