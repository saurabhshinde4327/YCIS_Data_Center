import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/database'

// GET /api/intern-students/[id] - Get a single intern student
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const params = await Promise.resolve(context.params)
    const student = await db.getInternStudent(params.id)
    
    if (!student) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(student)
  } catch (error) {
    console.error('Error fetching intern student:', error)
    return NextResponse.json(
      { error: 'Failed to fetch intern student' },
      { status: 500 }
    )
  }
}

// PUT /api/intern-students/[id] - Update an intern student
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const params = await Promise.resolve(context.params)
    const body = await request.json()
    
    const { name, email, branch, passoutYear, performance } = body
    
    const updates: any = {}
    if (name !== undefined) updates.name = name
    if (email !== undefined) updates.email = email
    if (branch !== undefined) updates.branch = branch
    if (passoutYear !== undefined) updates.passoutYear = parseInt(passoutYear)
    if (performance !== undefined) updates.performance = performance
    
    const updatedStudent = await db.updateInternStudent(params.id, updates)
    
    if (!updatedStudent) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(updatedStudent)
  } catch (error: any) {
    console.error('Error updating intern student:', error)
    if (error.code === 'ER_DUP_ENTRY') {
      return NextResponse.json(
        { error: 'Student with this email already exists' },
        { status: 409 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to update intern student' },
      { status: 500 }
    )
  }
}

// DELETE /api/intern-students/[id] - Delete an intern student
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const params = await Promise.resolve(context.params)
    const deleted = await db.deleteInternStudent(params.id)
    
    if (!deleted) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({ success: true, message: 'Student deleted successfully' })
  } catch (error) {
    console.error('Error deleting intern student:', error)
    return NextResponse.json(
      { error: 'Failed to delete intern student' },
      { status: 500 }
    )
  }
}

