import { NextRequest, NextResponse } from 'next/server'
import { smsDb } from '@/lib/smsDatabase'
import { extractTokenFromHeader, verifyToken } from '@/lib/jwt'

export const runtime = 'nodejs'

const ensureSmsAdmin = (request: NextRequest) => {
  const token = extractTokenFromHeader(request.headers.get('authorization'))
  if (!token) return null
  const user = verifyToken(token)
  if (!user || user.role !== 'sms_admin') return null
  return user
}

const parseCsv = (content: string, fileName?: string) => {
  const rows: Array<{ name: string; contactNo: string; className: string; fileName?: string }> = []
  const lines = content.split(/\r?\n/).map(l => l.trim()).filter(Boolean)

  for (const line of lines) {
    const parts = line.split(',').map(p => p.trim())
    if (parts.length < 3) continue
    const [name, contactNo, className] = parts
    if (!name || !contactNo || !className) continue
    rows.push({ name, contactNo, className, fileName })
  }

  return rows
}

export async function GET(request: NextRequest) {
  const user = ensureSmsAdmin(request)
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const students = await smsDb.getStudents()
  return NextResponse.json({ students })
}

export async function POST(request: NextRequest) {
  const user = ensureSmsAdmin(request)
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const contentType = request.headers.get('content-type') || ''

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData()
      const file = formData.get('file')
      if (!file || !(file instanceof File)) {
        return NextResponse.json({ error: 'File is required' }, { status: 400 })
      }

      const text = await file.text()
      const rows = parseCsv(text, file.name)
      if (!rows.length) {
        return NextResponse.json({ error: 'No valid rows found in file' }, { status: 400 })
      }

      const inserted = await smsDb.saveStudents(rows)
      const students = await smsDb.getStudents()
      return NextResponse.json({ success: true, inserted, students })
    }

    const body = await request.json()
    const { name, contactNo, className } = body || {}

    if (!name || !contactNo || !className) {
      return NextResponse.json(
        { error: 'name, contactNo and className are required' },
        { status: 400 }
      )
    }

    const inserted = await smsDb.saveStudents([
      { name, contactNo, className, fileName: 'manual-entry' }
    ])
    const students = await smsDb.getStudents()
    return NextResponse.json({ success: true, inserted, students })
  } catch (error) {
    console.error('Failed to save students:', error)
    return NextResponse.json({ error: 'Failed to save students' }, { status: 500 })
  }
}

