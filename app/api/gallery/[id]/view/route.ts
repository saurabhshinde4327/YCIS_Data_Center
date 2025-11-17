import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/database'

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const image = await db.getGalleryImage(params.id)

    if (!image) {
      return NextResponse.json({ error: 'Image not found' }, { status: 404 })
    }

    // Increment view count
    const newViews = (image.views || 0) + 1
    await db.updateGalleryImage(params.id, { views: newViews })

    return NextResponse.json({ views: newViews })
  } catch (error) {
    console.error('Error incrementing view count:', error)
    return NextResponse.json(
      { error: 'Failed to increment view count' }, 
      { status: 500 }
    )
  }
}

