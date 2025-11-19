import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/database'

export async function GET() {
  try {
    const description = await db.getDataCenterDescription()
    return NextResponse.json(description)
  } catch (error) {
    console.error('Error fetching data center description:', error)
    return NextResponse.json(
      { error: 'Failed to fetch description' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, description } = body

    if (!title || !description) {
      return NextResponse.json(
        { error: 'Title and description are required' },
        { status: 400 }
      )
    }

    const result = await db.saveDataCenterDescription({
      title,
      description
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error saving data center description:', error)
    return NextResponse.json(
      { error: 'Failed to save description' },
      { status: 500 }
    )
  }
}

