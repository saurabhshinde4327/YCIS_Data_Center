import { NextRequest, NextResponse } from 'next/server'
import { smsDb } from '@/lib/smsDatabase'

export const runtime = 'nodejs'

// Fast2SMS webhook support (if available)
// Note: Fast2SMS webhook format may differ from Twilio
// Check Fast2SMS documentation for webhook setup

/**
 * Handle SMS delivery status update from Fast2SMS
 * Note: Fast2SMS webhook format may vary - adjust based on Fast2SMS documentation
 */
async function handleDeliveryStatus(params: Record<string, string>): Promise<void> {
  try {
    // Fast2SMS may use different parameter names
    // Common fields: request_id, status, message_id, etc.
    const messageId = params.request_id || params.message_id || params.id
    const messageStatus = params.status || params.delivery_status // delivered, sent, failed, etc.
    const errorCode = params.error_code
    const errorMessage = params.error_message || params.error
    
    console.log(`[SMS Webhook] Delivery status for ${messageId}:`, {
      status: messageStatus,
      errorCode,
      errorMessage,
      allParams: params
    })
    
    // Update SMS log with delivery status
    if (messageId) {
      const statusMap: Record<string, string> = {
        'delivered': 'delivered',
        'sent': 'sent',
        'failed': 'failed',
        'undelivered': 'failed',
        'queued': 'sent',
        'sending': 'sent',
        'success': 'sent',
        'pending': 'sent'
      }
      
      const dbStatus = statusMap[messageStatus?.toLowerCase() || ''] || 'unknown'
      
      await smsDb.updateSmsDeliveryStatus(
        messageId,
        dbStatus,
        errorMessage || undefined
      )
    }
  } catch (error) {
    console.error('Error handling delivery status:', error)
  }
}

/**
 * Handle incoming SMS message from Fast2SMS
 * Note: Fast2SMS webhook format may vary - adjust based on Fast2SMS documentation
 */
async function handleIncomingSMS(params: Record<string, string>): Promise<void> {
  try {
    // Fast2SMS may use different parameter names
    const fromNumber = params.from || params.sender || params.phone
    const toNumber = params.to || params.receiver || params.number
    const messageBody = params.message || params.text || params.body
    const messageId = params.request_id || params.message_id || params.id
    
    console.log('Incoming SMS received:', {
      from: fromNumber,
      to: toNumber,
      message: messageBody,
      messageId,
      allParams: params
    })
    
    // Store incoming SMS in database
    if (fromNumber && messageBody) {
      await smsDb.logIncomingSms(
        fromNumber,
        toNumber || '',
        messageBody,
        undefined, // keyword may not be available
        messageId
      )
    }
  } catch (error) {
    console.error('Error handling incoming SMS:', error)
  }
}

/**
 * Process Fast2SMS webhook
 * Note: Adjust webhook parameter detection based on Fast2SMS documentation
 */
async function processFast2SMSWebhook(params: Record<string, string>): Promise<void> {
  // Check if this is a delivery status update
  // Fast2SMS may use different field names - adjust as needed
  if (params.status || params.delivery_status || params.request_id) {
    await handleDeliveryStatus(params)
    return
  }
  
  // Check if this is an incoming SMS
  // Fast2SMS may use different field names - adjust as needed
  if ((params.from || params.sender) && (params.message || params.text || params.body)) {
    await handleIncomingSMS(params)
    return
  }
  
  // Generic webhook - log for debugging
  console.log('Received Fast2SMS webhook:', params)
}

export async function POST(request: NextRequest) {
  try {
    // Fast2SMS may send webhooks as JSON or form data
    // Try to parse as JSON first, fallback to form data
    let params: Record<string, string> = {}
    
    const contentType = request.headers.get('content-type') || ''
    
    if (contentType.includes('application/json')) {
      // JSON payload
      params = await request.json()
    } else {
      // Form data payload
      const formData = await request.formData()
      for (const [key, value] of formData.entries()) {
        params[key] = value.toString()
      }
    }
    
    // Process the webhook
    await processFast2SMSWebhook(params)
    
    // Return success response
    return NextResponse.json({ status: 'received' })
  } catch (error) {
    console.error('Error processing Fast2SMS webhook:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET endpoint for webhook verification
export async function GET(request: NextRequest) {
  return NextResponse.json({ status: 'ok' })
}
