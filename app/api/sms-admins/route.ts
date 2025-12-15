import { NextRequest, NextResponse } from 'next/server'
import { extractTokenFromHeader, verifyToken } from '@/lib/jwt'
import { smsDb } from '@/lib/smsDatabase'

export const runtime = 'nodejs'

const requireAdmin = (request: NextRequest) => {
  const token = extractTokenFromHeader(request.headers.get('authorization'))
  if (!token) return null
  const user = verifyToken(token)
  if (!user || user.role !== 'admin') return null
  return user
}

export async function GET(request: NextRequest) {
  const user = requireAdmin(request)
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const admins = await smsDb.listAdmins()
  return NextResponse.json({ admins })
}

export async function POST(request: NextRequest) {
  const user = requireAdmin(request)
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { username, email, password, name, active } = body || {}

    if (!username || !email || !password || !name) {
      return NextResponse.json(
        { error: 'username, email, password and name are required' },
        { status: 400 }
      )
    }

    // Ensure unique username/email
    const existing = await smsDb.getAdminByIdentifier(username) || await smsDb.getAdminByIdentifier(email)
    if (existing) {
      return NextResponse.json({ error: 'User already exists' }, { status: 409 })
    }

    const created = await smsDb.createAdmin({ username, email, password, name, active })
    const admins = await smsDb.listAdmins()
    return NextResponse.json({ success: true, admin: created, admins })
  } catch (error) {
    console.error('Failed to create SMS admin:', error)
    return NextResponse.json({ error: 'Failed to create admin' }, { status: 500 })
  }
}

