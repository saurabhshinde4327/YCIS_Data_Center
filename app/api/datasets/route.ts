import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/database'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const publicOnly = searchParams.get('public') === 'true'
    
    const datasets = await db.getDatasets(publicOnly)
    return NextResponse.json(datasets)
  } catch (error) {
    console.error('Error fetching datasets:', error)
    return NextResponse.json(
      { error: 'Failed to fetch datasets' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type') || ''
    let body: any
    let fileUrl: string | undefined
    let fileName: string | undefined
    let fileSize: number | undefined
    let fileType: string | undefined

    if (contentType.includes('multipart/form-data')) {
      // Handle FormData (with file upload)
      const formData = await request.formData()
      
      body = {
        title: formData.get('title') as string,
        description: formData.get('description') as string,
        category: formData.get('category') as string,
        tags: formData.get('tags') ? JSON.parse(formData.get('tags') as string) : [],
        isPublic: formData.get('isPublic') === 'true',
        uploadedBy: formData.get('uploadedBy') as string || 'Admin'
      }

      // Handle file if present
      const file = formData.get('file') as File | null
      if (file && file.size > 0) {
        try {
          fileName = file.name
          fileSize = file.size
          fileType = file.type || 'application/octet-stream'
          
          // Convert file to base64 data URL for storage
          const bytes = await file.arrayBuffer()
          const buffer = Buffer.from(bytes)
          const base64 = buffer.toString('base64')
          fileUrl = `data:${fileType};base64,${base64}`
          
          console.log('Dataset file uploaded:', fileName, 'Size:', fileSize, 'bytes')
        } catch (uploadError) {
          console.error('Error processing file:', uploadError)
          return NextResponse.json(
            { error: 'Failed to process uploaded file' },
            { status: 400 }
          )
        }
      }
    } else {
      // Handle JSON
      body = await request.json()
      fileUrl = body.fileUrl
      fileName = body.fileName
      fileSize = body.fileSize
      fileType = body.fileType
    }
    
    // Validate required fields
    if (!body.title || !body.description || !fileUrl || !fileName || !fileSize || !fileType || !body.category) {
      return NextResponse.json(
        { error: 'Missing required fields: title, description, file, and category are required' },
        { status: 400 }
      )
    }

    // Validate file size (max 50MB for datasets)
    const maxSize = 50 * 1024 * 1024 // 50MB
    if (fileSize > maxSize) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 50MB' },
        { status: 400 }
      )
    }

    const newDataset = await db.createDataset({
      title: body.title,
      description: body.description,
      fileUrl,
      fileName,
      fileSize,
      fileType,
      category: body.category,
      tags: body.tags || [],
      isPublic: body.isPublic !== false, // Default to true
      uploadedBy: body.uploadedBy || 'Admin'
    })
    
    return NextResponse.json(newDataset, { status: 201 })
  } catch (error) {
    console.error('Error creating dataset:', error)
    return NextResponse.json(
      { error: 'Failed to create dataset', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

