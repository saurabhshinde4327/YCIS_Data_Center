import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/database'

// POST /api/chat/read - Mark messages as read for a client
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { clientEmail } = body

    if (!clientEmail) {
      return NextResponse.json(
        { error: 'Missing clientEmail' },
        { status: 400 }
      )
    }

    await db.markMessagesAsRead(clientEmail)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error marking messages as read:', error)
    return NextResponse.json(
      { error: 'Failed to mark messages as read' },
      { status: 500 }
    )
  }
}

