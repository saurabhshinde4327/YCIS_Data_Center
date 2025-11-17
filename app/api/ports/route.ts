import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/database'

// GET /api/ports - Get all ports
export async function GET(request: NextRequest) {
  try {
    const ports = await db.getPorts()
    return NextResponse.json(ports)
  } catch (error) {
    console.error('Error fetching ports:', error)
    return NextResponse.json(
      { error: 'Failed to fetch ports' },
      { status: 500 }
    )
  }
}

// POST /api/ports - Create a new port
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const { vmName, portNumber, status, privateIp, reason } = body

    if (!vmName || portNumber === undefined || portNumber === null || !status || !privateIp || !reason) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate port number (allow 0 for VM initialization placeholder)
    if (typeof portNumber !== 'number' || portNumber < 0 || portNumber > 65535) {
      return NextResponse.json(
        { error: 'Invalid port number. Must be between 0 and 65535' },
        { status: 400 }
      )
    }

    // Validate status
    if (status !== 'used' && status !== 'not-used') {
      return NextResponse.json(
        { error: 'Invalid status. Must be "used" or "not-used"' },
        { status: 400 }
      )
    }

    const newPort = await db.createPort({
      vmName,
      portNumber: Number(portNumber),
      status,
      privateIp,
      reason
    })

    return NextResponse.json(newPort, { status: 201 })
  } catch (error) {
    console.error('Error creating port:', error)
    return NextResponse.json(
      { error: 'Failed to create port' },
      { status: 500 }
    )
  }
}

