import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/database'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const downloadLogs = await db.getDatasetDownloadLogs(params.id)
    return NextResponse.json(downloadLogs)
  } catch (error) {
    console.error('Error fetching download logs:', error)
    return NextResponse.json(
      { error: 'Failed to fetch download logs' },
      { status: 500 }
    )
  }
}

