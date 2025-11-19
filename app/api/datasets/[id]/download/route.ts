import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/database'

async function handleDownload(
  request: NextRequest,
  params: { id: string },
  userInfo?: { name?: string; email?: string; contactNo?: string }
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

    // Save user information to database if provided
    if (userInfo && userInfo.name && userInfo.email && userInfo.contactNo) {
      try {
        await db.saveDatasetDownloadLog(params.id, {
          name: userInfo.name,
          email: userInfo.email,
          contactNo: userInfo.contactNo
        })
      } catch (error) {
        console.error('Error saving download log:', error)
        // Continue with download even if log save fails
      }
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

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return handleDownload(request, params)
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const userInfo = {
      name: body.name,
      email: body.email,
      contactNo: body.contactNo
    }
    return handleDownload(request, params, userInfo)
  } catch (error) {
    // If JSON parsing fails, proceed without user info
    return handleDownload(request, params)
  }
}

