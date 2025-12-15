import { NextRequest, NextResponse } from 'next/server'
import { verifyToken, extractTokenFromHeader } from '@/lib/jwt'
import { smsDb } from '@/lib/smsDatabase'

export const runtime = 'nodejs'

function ensureSmsAdmin(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  const token = extractTokenFromHeader(authHeader)
  if (!token) return null
  const user = verifyToken(token)
  if (!user || user.role !== 'sms_admin') return null
  return user
}

export async function GET(request: NextRequest) {
  const user = ensureSmsAdmin(request)
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const admin = await smsDb.getAdminById(user.id)
    if (!admin) {
      return NextResponse.json({ error: 'Admin not found' }, { status: 404 })
    }

    const smsCount = await smsDb.getSmsCountByAdmin(user.id)

    return NextResponse.json({
      success: true,
      stats: {
        smsCount,
        createdAt: admin.createdAt,
        name: admin.name,
        email: admin.email
      }
    })
  } catch (error) {
    console.error('Failed to get admin stats:', error)
    return NextResponse.json({ error: 'Failed to get stats' }, { status: 500 })
  }
}

