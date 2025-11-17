import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/database'

// GET /api/showcase-projects/[id] - Get a specific showcase project
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const project = await db.getShowcaseProject(params.id)

    if (!project) {
      return NextResponse.json(
        { error: 'Showcase project not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(project)
  } catch (error) {
    console.error('Error fetching showcase project:', error)
    return NextResponse.json(
      { error: 'Failed to fetch showcase project' },
      { status: 500 }
    )
  }
}

// PUT /api/showcase-projects/[id] - Update a showcase project
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()

    const updatedProject = await db.updateShowcaseProject(params.id, body)

    if (!updatedProject) {
      return NextResponse.json(
        { error: 'Showcase project not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(updatedProject)
  } catch (error) {
    console.error('Error updating showcase project:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { 
        error: 'Failed to update showcase project',
        details: errorMessage
      },
      { status: 500 }
    )
  }
}

// DELETE /api/showcase-projects/[id] - Delete a showcase project
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const success = await db.deleteShowcaseProject(params.id)

    if (!success) {
      return NextResponse.json(
        { error: 'Showcase project not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting showcase project:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { 
        error: 'Failed to delete showcase project',
        details: errorMessage
      },
      { status: 500 }
    )
  }
}

