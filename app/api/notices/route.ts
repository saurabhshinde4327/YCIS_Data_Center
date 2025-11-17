import { NextRequest, NextResponse } from 'next/server'
import { db, initializeDatabase } from '@/lib/database'

// Initialize database on first load
initializeDatabase()

export async function GET() {
  try {
    const notices = await db.getNotices()
    return NextResponse.json(notices)
  } catch (error) {
    console.error('Error fetching notices:', error)
    return NextResponse.json(
      { error: 'Failed to fetch notices' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate required fields
    if (!body.title || !body.content) {
      return NextResponse.json(
        { error: 'Title and content are required' },
        { status: 400 }
      )
    }

    // Create new notice
    const newNotice = await db.createNotice({
      title: body.title,
      content: body.content,
      type: body.type || 'announcement',
      priority: body.priority || 'medium',
      status: body.status || 'active',
      expiresAt: body.expiresAt,
      isPinned: body.isPinned || false,
      author: body.author || 'Admin',
      tags: body.tags || []
    })
    
    return NextResponse.json(newNotice, { status: 201 })
  } catch (error) {
    console.error('Error creating notice:', error)
    return NextResponse.json(
      { error: 'Failed to create notice' },
      { status: 500 }
    )
  }
}
