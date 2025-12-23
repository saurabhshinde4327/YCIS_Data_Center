import { NextRequest, NextResponse } from 'next/server'
import { smsDb } from '@/lib/smsDatabase'
import { extractTokenFromHeader, verifyToken } from '@/lib/jwt'
import { sendWhatsAppViaAPI } from '@/lib/whatsapp-api'

export const runtime = 'nodejs'

function ensureSmsAdmin(request: NextRequest) {
  const token = extractTokenFromHeader(request.headers.get('authorization'))
  if (!token) return null
  const user = verifyToken(token)
  if (!user || user.role !== 'sms_admin') return null
  return user
}

export async function POST(request: NextRequest) {
  const user = ensureSmsAdmin(request)
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { title, message, studentIds } = body

    if (!title || !message || !studentIds || !Array.isArray(studentIds) || studentIds.length === 0) {
      return NextResponse.json(
        { error: 'Title, message, and at least one student ID are required' },
        { status: 400 }
      )
    }

    // Get all students to verify IDs and get contact numbers
    const allStudents = await smsDb.getStudents()
    const selectedStudents = allStudents.filter(s => studentIds.includes(s.id))

    if (selectedStudents.length === 0) {
      return NextResponse.json(
        { error: 'No valid students found' },
        { status: 400 }
      )
    }

    // Combine title and message for the WhatsApp
    const fullMessage = title ? `${title}\n\n${message}` : message

    // Send WhatsApp and log each one
    let sentCount = 0
    let failedCount = 0
    const failures: string[] = []

    for (const student of selectedStudents) {
      try {
        console.log(`[WhatsApp Send] Processing student: ${student.name} (${student.contactNo})`)
        
        // Send WhatsApp via WhatsApp Business API
        const messageId = await sendWhatsAppViaAPI(student.contactNo, fullMessage)
        
        // Log successful WhatsApp send to database with message ID for tracking
        await smsDb.logSms(user.id, student.contactNo, fullMessage, 'sent', messageId)
        sentCount++
        
        console.log(`[WhatsApp Send] ✅ WhatsApp sent successfully via WhatsApp Business API`)
        console.log(`[WhatsApp Send] Student: ${student.name}`)
        console.log(`[WhatsApp Send] Phone: ${student.contactNo}`)
        console.log(`[WhatsApp Send] Message ID: ${messageId}`)
      } catch (err: any) {
        console.error(`[WhatsApp Send] Failed to send WhatsApp to student ${student.name} (${student.id}):`, err)
        console.error(`[WhatsApp Send] Error details:`, {
          message: err.message,
          stack: err.stack
        })
        
        // Log failed WhatsApp attempt to database
        try {
          await smsDb.logSms(user.id, student.contactNo, fullMessage, 'failed')
        } catch (logErr) {
          console.error(`Failed to log WhatsApp failure for student ${student.id}:`, logErr)
        }
        
        failedCount++
        failures.push(`${student.name} (${student.contactNo}): ${err.message || 'Unknown error'}`)
      }
    }

    // Return response with results
    if (failedCount > 0) {
      return NextResponse.json({
        success: sentCount > 0,
        sentCount,
        failedCount,
        failures,
        message: sentCount > 0 
          ? `WhatsApp sent to ${sentCount} student(s), failed for ${failedCount} student(s)`
          : `Failed to send WhatsApp to all students`
      }, { status: sentCount > 0 ? 200 : 500 })
    }

    return NextResponse.json({
      success: true,
      sentCount,
      message: `WhatsApp sent successfully to ${sentCount} student(s) via WhatsApp Business API`
    })
  } catch (error) {
    console.error('Failed to send WhatsApp:', error)
    return NextResponse.json(
      { error: 'Failed to send WhatsApp' },
      { status: 500 }
    )
  }
}

