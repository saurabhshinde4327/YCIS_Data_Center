import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/database'

// GET /api/showcase-projects - Get all or active showcase projects
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const activeOnly = searchParams.get('active') === 'true'

    const projects = activeOnly 
      ? await db.getActiveShowcaseProjects()
      : await db.getShowcaseProjects()

    return NextResponse.json(projects)
  } catch (error) {
    console.error('Error fetching showcase projects:', error)
    return NextResponse.json(
      { error: 'Failed to fetch showcase projects' },
      { status: 500 }
    )
  }
}

// POST /api/showcase-projects - Create a new showcase project
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const { name, description, projectImage, url, category, isActive } = body

    if (!name || !description || !category) {
      return NextResponse.json(
        { error: 'Missing required fields: name, description, category' },
        { status: 400 }
      )
    }

    const newProject = await db.createShowcaseProject({
      name,
      description,
      logo: '', // Default empty logo
      projectImage: projectImage || '',
      url: url || '',
      category,
      isActive: isActive !== undefined ? isActive : true
    })

    return NextResponse.json(newProject, { status: 201 })
  } catch (error) {
    console.error('Error creating showcase project:', error)
    return NextResponse.json(
      { error: 'Failed to create showcase project' },
      { status: 500 }
    )
  }
}

