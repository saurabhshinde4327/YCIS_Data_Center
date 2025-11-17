import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/database'

// GET /api/credentials/[id] - Get a single credential
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const credential = await db.getCredential(params.id)
    
    if (!credential) {
      return NextResponse.json(
        { error: 'Credential not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(credential)
  } catch (error) {
    console.error('Error fetching credential:', error)
    return NextResponse.json(
      { error: 'Failed to fetch credential' },
      { status: 500 }
    )
  }
}

// PATCH /api/credentials/[id] - Update a credential
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    
    const updatedCredential = await db.updateCredential(params.id, body)
    
    if (!updatedCredential) {
      return NextResponse.json(
        { error: 'Credential not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(updatedCredential)
  } catch (error) {
    console.error('Error updating credential:', error)
    return NextResponse.json(
      { error: 'Failed to update credential' },
      { status: 500 }
    )
  }
}

// DELETE /api/credentials/[id] - Delete a credential
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const success = await db.deleteCredential(params.id)
    
    if (!success) {
      return NextResponse.json(
        { error: 'Credential not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting credential:', error)
    return NextResponse.json(
      { error: 'Failed to delete credential' },
      { status: 500 }
    )
  }
}

