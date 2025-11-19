import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/database'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const dataset = await db.getDataset(params.id)
    
    if (!dataset) {
      return NextResponse.json(
        { error: 'Dataset not found' },
        { status: 404 }
      )
    }

    // Increment views
    await db.incrementDatasetViews(params.id)

    return NextResponse.json(dataset)
  } catch (error) {
    console.error('Error fetching dataset:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dataset' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const deleted = await db.deleteDataset(params.id)
    
    if (!deleted) {
      return NextResponse.json(
        { error: 'Dataset not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting dataset:', error)
    return NextResponse.json(
      { error: 'Failed to delete dataset' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const updated = await db.updateDataset(params.id, body)
    
    if (!updated) {
      return NextResponse.json(
        { error: 'Dataset not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Error updating dataset:', error)
    return NextResponse.json(
      { error: 'Failed to update dataset' },
      { status: 500 }
    )
  }
}

