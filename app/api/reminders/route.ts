import { NextRequest, NextResponse } from 'next/server'
import { db, initializeDatabase } from '@/lib/database'

// Initialize database on first load
initializeDatabase()

export async function GET() {
  try {
    const reminders = await db.getReminders()
    return NextResponse.json(reminders)
  } catch (error) {
    console.error('Error fetching reminders:', error)
    return NextResponse.json(
      { error: 'Failed to fetch reminders' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate required fields
    if (!body.title || !body.date || !body.time) {
      return NextResponse.json(
        { error: 'Title, date, and time are required' },
        { status: 400 }
      )
    }

    // Create new reminder
    const newReminder = await db.createReminder({
      title: body.title,
      description: body.description || "",
      date: body.date,
      time: body.time,
      priority: body.priority || 'medium',
      status: body.status || 'pending',
      type: body.type || 'reminder'
    })
    
    return NextResponse.json(newReminder, { status: 201 })
  } catch (error) {
    console.error('Error creating reminder:', error)
    return NextResponse.json(
      { error: 'Failed to create reminder' },
      { status: 500 }
    )
  }
}
