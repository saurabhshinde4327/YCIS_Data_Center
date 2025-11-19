import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/database'

export async function GET() {
  try {
    const images = await db.getSliderImages()
    return NextResponse.json(images)
  } catch (error) {
    console.error('Error fetching slider images:', error)
    return NextResponse.json(
      { error: 'Failed to fetch slider images' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { imageUrl, description, displayOrder } = body

    if (!imageUrl) {
      return NextResponse.json(
        { error: 'Image URL is required' },
        { status: 400 }
      )
    }

    const result = await db.createSliderImage({
      imageUrl,
      description: description || '',
      displayOrder: displayOrder || 0
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error creating slider image:', error)
    return NextResponse.json(
      { error: 'Failed to create slider image' },
      { status: 500 }
    )
  }
}

