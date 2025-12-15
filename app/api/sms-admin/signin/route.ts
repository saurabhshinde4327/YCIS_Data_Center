import { NextRequest, NextResponse } from 'next/server'
import { smsDb } from '@/lib/smsDatabase'
import { signToken } from '@/lib/jwt'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { username, password } = body

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      )
    }

    const admin = await smsDb.getAdminByIdentifier(username)

    if (!admin || admin.password !== password || admin.active === false) {
      return NextResponse.json(
        { error: 'Invalid username or password' },
        { status: 401 }
      )
    }

    const token = signToken({
      id: admin.id,
      email: admin.email,
      name: admin.name,
      role: 'sms_admin'
    })

    return NextResponse.json({
      success: true,
      token,
      admin: {
        id: admin.id,
        username: admin.username,
        email: admin.email,
        name: admin.name,
        role: 'sms_admin'
      }
    })
  } catch (error) {
    console.error('SMS admin sign-in failed:', error)
    return NextResponse.json(
      { error: 'Failed to sign in' },
      { status: 500 }
    )
  }
}

