import { NextRequest, NextResponse } from 'next/server'
import { db, initializeDatabase } from '@/lib/database'

initializeDatabase() // Ensure DB is initialized

export async function GET() {
  try {
    const bills = await db.getBills()
    return NextResponse.json(bills)
  } catch (error) {
    console.error('Error fetching bills:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    const code = (error as any)?.code || 'UNKNOWN'
    return NextResponse.json(
      { error: `Failed to fetch bills: ${message} (Code: ${code})` },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check if request contains FormData (for image uploads)
    const contentType = request.headers.get('content-type') || ''
    let body: any
    let imageUrl: string | undefined
    let imageName: string | undefined

    if (contentType.includes('multipart/form-data')) {
      // Handle FormData (with image)
      const formData = await request.formData()
      
      body = {
        description: formData.get('description') as string,
        amount: parseFloat(formData.get('amount') as string),
        date: formData.get('date') as string,
        category: formData.get('category') as string,
        vendor: formData.get('vendor') as string,
        status: formData.get('status') as string,
        notes: formData.get('notes') as string
      }

      // Handle image file if present
      const imageFile = formData.get('image') as File | null
      if (imageFile && imageFile.size > 0) {
        try {
          imageName = formData.get('imageName') as string || imageFile.name
          
          // Convert image to base64 data URL for storage
          const bytes = await imageFile.arrayBuffer()
          const buffer = Buffer.from(bytes)
          const base64 = buffer.toString('base64')
          const mimeType = imageFile.type || 'image/jpeg'
          imageUrl = `data:${mimeType};base64,${base64}`
          
          console.log('Image uploaded:', imageName, 'Size:', imageFile.size, 'bytes')
        } catch (uploadError) {
          console.error('Error processing image:', uploadError)
          // Continue without image if upload fails
        }
      }
    } else {
      // Handle JSON
      body = await request.json()
      imageUrl = body.imageUrl
      imageName = body.imageName
    }
    
    // Validate required fields
    if (!body.description || !body.date || !body.vendor) {
      return NextResponse.json(
        { error: 'Description, date, and vendor are required' },
        { status: 400 }
      )
    }

    // Validate amount is a positive number
    if (isNaN(body.amount) || body.amount <= 0) {
      return NextResponse.json(
        { error: 'Amount must be a positive number' },
        { status: 400 }
      )
    }

    const newBill = await db.createBill({
      description: body.description,
      amount: body.amount,
      date: body.date,
      imageUrl: imageUrl,
      imageName: imageName,
      category: body.category || 'other',
      vendor: body.vendor,
      status: body.status || 'pending',
      notes: body.notes || ''
    })
    
    return NextResponse.json(newBill, { status: 201 })
  } catch (error) {
    console.error('Error creating bill:', error)
    return NextResponse.json(
      { error: 'Failed to create bill' },
      { status: 500 }
    )
  }
}
