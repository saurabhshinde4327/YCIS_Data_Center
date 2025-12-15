import { NextRequest, NextResponse } from 'next/server'
import { smsDb } from '@/lib/smsDatabase'
import { extractTokenFromHeader, verifyToken } from '@/lib/jwt'
import { sendSmsViaSNS } from '@/lib/aws-sns'

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

    // Combine title and message for the SMS
    const fullMessage = title ? `${title}\n\n${message}` : message

    // Send SMS and log each one
    let sentCount = 0
    let failedCount = 0
    const failures: string[] = []

    for (const student of selectedStudents) {
      try {
        console.log(`[SMS Send] Processing student: ${student.name} (${student.contactNo})`)
        
        // Send SMS via AWS SNS
        const messageId = await sendSmsViaSNS(student.contactNo, fullMessage)
        
        // Log successful SMS send to database with message ID for tracking
        await smsDb.logSms(user.id, student.contactNo, fullMessage, 'sent', messageId)
        sentCount++
        
        console.log(`[SMS Send] Successfully sent SMS to ${student.name} (${student.contactNo}): ${messageId}`)
        
        // Warn if sending to a number other than the verified one
        if (student.contactNo !== '8668428513') {
          console.warn(`[SMS Send] ⚠️  WARNING: SMS sent to ${student.contactNo} but may not be received!`)
          console.warn(`[SMS Send] ⚠️  Your AWS account is likely in SANDBOX MODE.`)
          console.warn(`[SMS Send] ⚠️  Sandbox mode only allows SMS to verified numbers.`)
          console.warn(`[SMS Send] ⚠️  To send to any number, request production access:`)
          console.warn(`[SMS Send] ⚠️  See AWS_SNS_PRODUCTION_ACCESS.md for step-by-step instructions`)
        }
        
        console.log(`[SMS Send] Note: If SMS is not received, check:`)
        console.log(`  - Sandbox mode status (most common issue)`)
        console.log(`  - Spending limits (must be > $0)`)
        console.log(`  - Phone number format: Should be +918668428513 for Indian numbers`)
      } catch (err: any) {
        console.error(`[SMS Send] Failed to send SMS to student ${student.name} (${student.id}):`, err)
        console.error(`[SMS Send] Error details:`, {
          message: err.message,
          stack: err.stack
        })
        
        // Log failed SMS attempt to database
        try {
          await smsDb.logSms(user.id, student.contactNo, fullMessage, 'failed')
        } catch (logErr) {
          console.error(`Failed to log SMS failure for student ${student.id}:`, logErr)
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
          ? `SMS sent to ${sentCount} student(s), failed for ${failedCount} student(s)`
          : `Failed to send SMS to all students`
      }, { status: sentCount > 0 ? 200 : 500 })
    }

    return NextResponse.json({
      success: true,
      sentCount,
      message: `SMS sent successfully to ${sentCount} student(s)`
    })
  } catch (error) {
    console.error('Failed to send SMS:', error)
    return NextResponse.json(
      { error: 'Failed to send SMS' },
      { status: 500 }
    )
  }
}

