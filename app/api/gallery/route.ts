import { NextRequest, NextResponse } from 'next/server'
import { db, initializeDatabase } from '@/lib/database'

// Initialize database on first load
initializeDatabase()

export async function GET() {
  try {
    const images = await db.getGalleryImages()
    return NextResponse.json(images)
  } catch (error) {
    console.error('Error fetching gallery data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch gallery data' }, 
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, description, imageUrl, category, tags, uploadedBy } = body

    if (!title || !imageUrl || !category) {
      return NextResponse.json(
        { error: 'Missing required fields: title, imageUrl, or category' }, 
        { status: 400 }
      )
    }

    // Validate imageUrl is not too large (check length)
    if (imageUrl.length > 10000000) { // ~10MB limit
      return NextResponse.json(
        { error: 'Image data too large. Maximum size is 10MB' },
        { status: 400 }
      )
    }

    // Create new image entry
    const newImage = await db.createGalleryImage({
      title,
      description: description || '',
      imageUrl,
      category,
      tags: tags || [],
      isVisible: true,
      uploadedBy: uploadedBy || 'Admin',
      views: 0
    })

    return NextResponse.json(newImage, { status: 201 })
  } catch (error) {
    console.error('Error creating gallery image:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    const code = (error as any)?.code || 'UNKNOWN'
    const errno = (error as any)?.errno || 'N/A'
    
    return NextResponse.json(
      { 
        error: 'Failed to create gallery image',
        details: message,
        code: code,
        errno: errno
      }, 
      { status: 500 }
    )
  }
}

