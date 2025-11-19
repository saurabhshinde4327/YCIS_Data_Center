import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/database'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const dataset = await db.getDataset(params.id)
    
    if (!dataset) {
      return NextResponse.json(
        { error: 'Dataset not found' },
        { status: 404 }
      )
    }

    // Check if dataset is public
    if (!dataset.isPublic) {
      return NextResponse.json(
        { error: 'Dataset is not publicly available' },
        { status: 403 }
      )
    }

    // Increment downloads
    await db.incrementDatasetDownloads(params.id)

    // Return the file data URL
    return NextResponse.json({
      fileUrl: dataset.fileUrl,
      fileName: dataset.fileName,
      fileType: dataset.fileType
    })
  } catch (error) {
    console.error('Error downloading dataset:', error)
    return NextResponse.json(
      { error: 'Failed to download dataset' },
      { status: 500 }
    )
  }
}

