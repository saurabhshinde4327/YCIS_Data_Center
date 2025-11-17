import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/database'

// GET /api/chat - Get chat messages (optionally filtered by clientEmail)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const clientEmail = searchParams.get('clientEmail')

    const messages = await db.getChatMessages(clientEmail || undefined)
    return NextResponse.json(messages)
  } catch (error) {
    console.error('Error fetching chat messages:', error)
    return NextResponse.json(
      { error: 'Failed to fetch chat messages' },
      { status: 500 }
    )
  }
}

// POST /api/chat - Create a new chat message
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const { clientId, clientName, clientEmail, message, sender, senderName } = body

    if (!clientId || !clientName || !clientEmail || !message || !sender) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const newMessage = await db.createChatMessage({
      clientId,
      clientName,
      clientEmail,
      message,
      sender: sender as 'client' | 'admin',
      senderName: senderName || undefined,
      isRead: false
    })

    return NextResponse.json(newMessage, { status: 201 })
  } catch (error) {
    console.error('Error creating chat message:', error)
    return NextResponse.json(
      { error: 'Failed to create chat message' },
      { status: 500 }
    )
  }
}

