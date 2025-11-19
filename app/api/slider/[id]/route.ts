import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/database'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { imageUrl, description, displayOrder, isActive } = body

    await db.updateSliderImage(params.id, {
      imageUrl,
      description,
      displayOrder,
      isActive
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating slider image:', error)
    return NextResponse.json(
      { error: 'Failed to update slider image' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const deleted = await db.deleteSliderImage(params.id)
    if (!deleted) {
      return NextResponse.json(
        { error: 'Slider image not found' },
        { status: 404 }
      )
    }
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting slider image:', error)
    return NextResponse.json(
      { error: 'Failed to delete slider image' },
      { status: 500 }
    )
  }
}

