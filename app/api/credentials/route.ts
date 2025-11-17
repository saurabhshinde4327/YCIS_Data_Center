import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/database'

// GET /api/credentials - Get all credentials
export async function GET(request: NextRequest) {
  try {
    const credentials = await db.getCredentials()
    return NextResponse.json(credentials)
  } catch (error) {
    console.error('Error fetching credentials:', error)
    return NextResponse.json(
      { error: 'Failed to fetch credentials' },
      { status: 500 }
    )
  }
}

// POST /api/credentials - Create a new credential
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const { platformName, userId, password, notes } = body

    if (!platformName || !userId || !password) {
      return NextResponse.json(
        { error: 'Missing required fields: platformName, userId, and password are required' },
        { status: 400 }
      )
    }

    const newCredential = await db.createCredential({
      platformName,
      userId,
      password,
      notes: notes || ''
    })

    return NextResponse.json(newCredential, { status: 201 })
  } catch (error) {
    console.error('Error creating credential:', error)
    return NextResponse.json(
      { error: 'Failed to create credential' },
      { status: 500 }
    )
  }
}

