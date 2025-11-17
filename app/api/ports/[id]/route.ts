import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/database'

// GET /api/ports/[id] - Get a single port
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const port = await db.getPort(params.id)
    
    if (!port) {
      return NextResponse.json(
        { error: 'Port not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(port)
  } catch (error) {
    console.error('Error fetching port:', error)
    return NextResponse.json(
      { error: 'Failed to fetch port' },
      { status: 500 }
    )
  }
}

// PATCH /api/ports/[id] - Update a port
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    
    // Validate port number if provided
    if (body.portNumber !== undefined) {
      if (typeof body.portNumber !== 'number' || body.portNumber < 1 || body.portNumber > 65535) {
        return NextResponse.json(
          { error: 'Invalid port number. Must be between 1 and 65535' },
          { status: 400 }
        )
      }
    }

    // Validate status if provided
    if (body.status !== undefined) {
      if (body.status !== 'used' && body.status !== 'not-used') {
        return NextResponse.json(
          { error: 'Invalid status. Must be "used" or "not-used"' },
          { status: 400 }
        )
      }
    }

    const updatedPort = await db.updatePort(params.id, body)
    
    if (!updatedPort) {
      return NextResponse.json(
        { error: 'Port not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(updatedPort)
  } catch (error) {
    console.error('Error updating port:', error)
    return NextResponse.json(
      { error: 'Failed to update port' },
      { status: 500 }
    )
  }
}

// DELETE /api/ports/[id] - Delete a port
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const success = await db.deletePort(params.id)
    
    if (!success) {
      return NextResponse.json(
        { error: 'Port not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting port:', error)
    return NextResponse.json(
      { error: 'Failed to delete port' },
      { status: 500 }
    )
  }
}

