import { NextRequest, NextResponse } from 'next/server'
import sharp from 'sharp'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/svg+xml']
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only images are allowed (JPG, PNG, WebP, SVG)' },
        { status: 400 }
      )
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 5MB' },
        { status: 400 }
      )
    }

    // Convert image to buffer
    const bytes = await file.arrayBuffer()
    let buffer = Buffer.from(bytes)
    let finalMimeType = file.type

    // Compress and optimize image (skip SVG)
    if (file.type !== 'image/svg+xml') {
      try {
        // Resize if too large and convert to WebP for better compression
        const image = sharp(buffer)
        const metadata = await image.metadata()
        
        // Resize if width or height exceeds 1920px
        let resizeOptions: any = {}
        if (metadata.width && metadata.width > 1920) {
          resizeOptions.width = 1920
        }
        if (metadata.height && metadata.height > 1920) {
          resizeOptions.height = 1920
        }

        // Convert to WebP with quality optimization
        const processedImage = image
          .resize(Object.keys(resizeOptions).length > 0 ? resizeOptions : undefined)
          .webp({ quality: 85, effort: 6 })

        buffer = await processedImage.toBuffer()
        finalMimeType = 'image/webp'
      } catch (sharpError) {
        console.warn('Image compression failed, using original:', sharpError)
        // Fall back to original buffer if compression fails
      }
    }
    
    // Create data URL with proper MIME type
    const base64 = buffer.toString('base64')
    const dataUrl = `data:${finalMimeType};base64,${base64}`

    // Check if compressed size is reasonable (under 8MB base64)
    if (dataUrl.length > 8 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'Image too large after processing. Try a smaller image or lower resolution.' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      url: dataUrl,
      filename: file.name,
      type: finalMimeType,
      originalSize: file.size,
      compressedSize: buffer.length,
      compressionRatio: ((1 - buffer.length / file.size) * 100).toFixed(1) + '%'
    })
  } catch (error) {
    console.error('Error uploading file:', error)
    return NextResponse.json(
      { error: 'Failed to upload file', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

