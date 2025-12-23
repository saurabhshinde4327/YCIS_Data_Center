import { NextRequest, NextResponse } from 'next/server'
import { smsDb } from '@/lib/smsDatabase'
import { extractTokenFromHeader, verifyToken } from '@/lib/jwt'
import { sendSmsViaFast2SMS } from '@/lib/fast2sms'

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
    
    // Log message details for cost tracking
    const messageLength = fullMessage.length
    const estimatedSmsParts = Math.ceil(messageLength / 160)
    const estimatedCostPerMessage = estimatedSmsParts * 0.25
    console.log(`[SMS Send] Message Details:`)
    console.log(`[SMS Send] Total Length: ${messageLength} characters`)
    console.log(`[SMS Send] Estimated SMS Parts: ${estimatedSmsParts} part(s)`)
    console.log(`[SMS Send] Estimated Cost per Message: ₹${estimatedCostPerMessage.toFixed(2)}`)

    // Send SMS and log each one
    let sentCount = 0
    let failedCount = 0
    const failures: string[] = []
    let totalCost = 0
    let lastBalance: number | undefined = undefined

    for (const student of selectedStudents) {
      try {
        console.log(`[SMS Send] Processing student: ${student.name} (${student.contactNo})`)
        
        // Send SMS via Fast2SMS
        const messageId = await sendSmsViaFast2SMS(student.contactNo, fullMessage)
        
        // Log successful SMS send to database with message ID for tracking
        await smsDb.logSms(user.id, student.contactNo, fullMessage, 'sent', messageId)
        sentCount++
        
        console.log(`[SMS Send] ✅ SMS sent successfully via Fast2SMS`)
        console.log(`[SMS Send] Student: ${student.name}`)
        console.log(`[SMS Send] Phone: ${student.contactNo}`)
        console.log(`[SMS Send] Request ID: ${messageId}`)
        
        // Note: Fast2SMS cost is typically ₹0.25 per SMS for wallet balance ₹100-₹3,999
        // Cost may vary based on wallet balance tier
        // Check Fast2SMS dashboard for actual deduction
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

    // Calculate estimated cost (Fast2SMS pricing: ₹0.25 per SMS for wallet ₹100-₹3,999)
    // Actual cost may vary based on wallet balance tier
    const estimatedCostPerSMS = 0.25
    const estimatedTotalCost = sentCount * estimatedCostPerSMS
    
    console.log(`[SMS Send] Summary:`)
    console.log(`[SMS Send] Total Sent: ${sentCount} SMS`)
    console.log(`[SMS Send] Total Failed: ${failedCount} SMS`)
    if (sentCount > 0) {
      console.log(`[SMS Send] Estimated Cost: ₹${estimatedTotalCost.toFixed(2)} (₹${estimatedCostPerSMS} per SMS)`)
      console.log(`[SMS Send] Note: Actual cost may vary based on Fast2SMS wallet balance tier`)
      console.log(`[SMS Send] Check Fast2SMS dashboard for exact deduction amount`)
    }

    // Return response with results
    if (failedCount > 0) {
      return NextResponse.json({
        success: sentCount > 0,
        sentCount,
        failedCount,
        failures,
        estimatedCost: estimatedTotalCost,
        message: sentCount > 0 
          ? `SMS sent to ${sentCount} student(s), failed for ${failedCount} student(s). Estimated cost: ₹${estimatedTotalCost.toFixed(2)}`
          : `Failed to send SMS to all students`
      }, { status: sentCount > 0 ? 200 : 500 })
    }

      return NextResponse.json({
        success: true,
        sentCount,
        estimatedCost: estimatedTotalCost,
        message: `SMS sent successfully to ${sentCount} student(s) via Fast2SMS. Estimated cost: ₹${estimatedTotalCost.toFixed(2)} (₹${estimatedCostPerSMS} per SMS). Check Fast2SMS dashboard for actual deduction.`
      })
  } catch (error) {
    console.error('Failed to send SMS:', error)
    return NextResponse.json(
      { error: 'Failed to send SMS' },
      { status: 500 }
    )
  }
}

