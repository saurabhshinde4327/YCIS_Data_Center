import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/database'

// GET /api/intern-students - Get all intern students
export async function GET() {
  try {
    const students = await db.getInternStudents()
    return NextResponse.json(students)
  } catch (error) {
    console.error('Error fetching intern students:', error)
    return NextResponse.json(
      { error: 'Failed to fetch intern students' },
      { status: 500 }
    )
  }
}

// POST /api/intern-students - Create a new intern student
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const { name, email, branch, passoutYear, performance } = body

    if (!name || !email || !branch || !passoutYear) {
      return NextResponse.json(
        { error: 'Missing required fields: name, email, branch, passoutYear' },
        { status: 400 }
      )
    }

    const newStudent = await db.createInternStudent({
      name,
      email,
      branch,
      passoutYear: parseInt(passoutYear),
      performance: performance || undefined
    })

    return NextResponse.json(newStudent, { status: 201 })
  } catch (error: any) {
    console.error('Error creating intern student:', error)
    if (error.code === 'ER_DUP_ENTRY') {
      return NextResponse.json(
        { error: 'Student with this email already exists' },
        { status: 409 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to create intern student' },
      { status: 500 }
    )
  }
}

