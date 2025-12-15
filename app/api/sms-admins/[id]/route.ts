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

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const user = requireAdmin(request)
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = params
  try {
    const body = await request.json()
    const { active } = body || {}
    if (active === undefined) {
      return NextResponse.json({ error: 'active flag required' }, { status: 400 })
    }
    await smsDb.setAdminActive(id, Boolean(active))
    const admins = await smsDb.listAdmins()
    return NextResponse.json({ success: true, admins })
  } catch (error) {
    console.error('Failed to update SMS admin status:', error)
    return NextResponse.json({ error: 'Failed to update admin' }, { status: 500 })
  }
}

