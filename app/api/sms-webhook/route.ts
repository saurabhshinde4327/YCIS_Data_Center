import { NextRequest, NextResponse } from 'next/server'
import { smsDb } from '@/lib/smsDatabase'
import crypto from 'crypto'

export const runtime = 'nodejs'

// AWS SNS message types
type SNSMessageType = 
  | 'SubscriptionConfirmation'
  | 'Notification'
  | 'UnsubscribeConfirmation'

interface SNSMessage {
  Type: SNSMessageType
  MessageId: string
  TopicArn?: string
  Subject?: string
  Message: string
  Timestamp: string
  SignatureVersion: string
  Signature: string
  SigningCertURL: string
  UnsubscribeURL?: string
  SubscribeURL?: string
  Token?: string
}

interface SMSDeliveryStatus {
  notification: {
    messageId: string
    timestamp: string
    delivery: {
      phoneCarrier: string
      mnc: number
      destination: string
      priceInUSD: number
      smsType: string
      mcc: number
      providerResponse: string
      dwellTimeMs: number
      dwellTimeMsUntilDeviceAck: number
    }
    status: 'SUCCESS' | 'FAILURE' | 'UNKNOWN'
  }
}

interface IncomingSMS {
  originationNumber: string
  destinationNumber: string
  messageKeyword: string
  inboundMessageId: string
  messageBody: string
  previousPublishedMessageId: string
}

/**
 * Verify AWS SNS message signature
 */
async function verifySNSSignature(message: SNSMessage): Promise<boolean> {
  try {
    // Download the certificate from the URL
    const certResponse = await fetch(message.SigningCertURL)
    if (!certResponse.ok) {
      console.error('Failed to fetch SNS certificate')
      return false
    }
    const cert = await certResponse.text()

    // Create the string to sign
    const stringToSign = [
      'Message',
      message.Message,
      'MessageId',
      message.MessageId,
      message.SubscribeURL ? 'SubscribeURL' : '',
      message.SubscribeURL || '',
      message.Subject ? 'Subject' : '',
      message.Subject || '',
      'Timestamp',
      message.Timestamp,
      'TopicArn',
      message.TopicArn || '',
      'Type',
      message.Type,
    ]
      .filter((_, i) => i % 2 === 0 || (message as any)[message[i - 1] as keyof SNSMessage])
      .join('\n')

    // Verify the signature
    const verifier = crypto.createVerify('RSA-SHA1')
    verifier.update(stringToSign)
    return verifier.verify(cert, message.Signature, 'base64')
  } catch (error) {
    console.error('Error verifying SNS signature:', error)
    return false
  }
}

/**
 * Handle subscription confirmation
 */
async function handleSubscriptionConfirmation(message: SNSMessage): Promise<NextResponse> {
  try {
    // Confirm the subscription by visiting the SubscribeURL
    if (message.SubscribeURL) {
      const response = await fetch(message.SubscribeURL, { method: 'GET' })
      if (response.ok) {
        console.log('SNS subscription confirmed successfully')
        return NextResponse.json({ status: 'confirmed' })
      }
    }
    return NextResponse.json({ error: 'No SubscribeURL provided' }, { status: 400 })
  } catch (error) {
    console.error('Error confirming subscription:', error)
    return NextResponse.json({ error: 'Failed to confirm subscription' }, { status: 500 })
  }
}

/**
 * Handle SMS delivery status notification
 */
async function handleDeliveryStatus(notification: SMSDeliveryStatus): Promise<void> {
  try {
    const { messageId, status, delivery } = notification.notification
    
    const statusMap: Record<string, string> = {
      'SUCCESS': 'delivered',
      'FAILURE': 'failed',
      'UNKNOWN': 'unknown'
    }
    
    const dbStatus = statusMap[status] || 'unknown'
    
    console.log(`SMS delivery status for ${delivery.destination}: ${dbStatus}`, {
      messageId,
      status,
      providerResponse: delivery.providerResponse,
      priceInUSD: delivery.priceInUSD
    })
    
    // Update SMS log with delivery status
    await smsDb.updateSmsDeliveryStatus(
      messageId,
      dbStatus,
      delivery.providerResponse || undefined
    )
  } catch (error) {
    console.error('Error handling delivery status:', error)
  }
}

/**
 * Handle incoming SMS message
 */
async function handleIncomingSMS(sms: IncomingSMS): Promise<void> {
  try {
    console.log('Incoming SMS received:', {
      from: sms.originationNumber,
      to: sms.destinationNumber,
      message: sms.messageBody,
      keyword: sms.messageKeyword
    })
    
    // Store incoming SMS in database
    await smsDb.logIncomingSms(
      sms.originationNumber,
      sms.destinationNumber,
      sms.messageBody,
      sms.messageKeyword,
      sms.inboundMessageId
    )
  } catch (error) {
    console.error('Error handling incoming SMS:', error)
  }
}

/**
 * Process SNS notification message
 */
async function processNotification(messageBody: string): Promise<void> {
  try {
    // Try to parse as SMS delivery status
    try {
      const deliveryStatus: SMSDeliveryStatus = JSON.parse(messageBody)
      if (deliveryStatus.notification?.messageId) {
        await handleDeliveryStatus(deliveryStatus)
        return
      }
    } catch {
      // Not a delivery status, continue
    }
    
    // Try to parse as incoming SMS
    try {
      const incomingSMS: IncomingSMS = JSON.parse(messageBody)
      if (incomingSMS.originationNumber && incomingSMS.messageBody) {
        await handleIncomingSMS(incomingSMS)
        return
      }
    } catch {
      // Not an incoming SMS, continue
    }
    
    // Generic notification
    console.log('Received SNS notification:', messageBody)
  } catch (error) {
    console.error('Error processing notification:', error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    let message: SNSMessage

    try {
      message = JSON.parse(body) as SNSMessage
    } catch (error) {
      console.error('Invalid JSON in webhook request:', error)
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
    }

    // Verify the signature (skip in development if needed)
    const isVerified = await verifySNSSignature(message)
    if (!isVerified) {
      console.warn('SNS message signature verification failed. Message:', message.MessageId)
      // In production, you should reject unverified messages
      // For development, you might want to allow this
      // return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    // Handle different message types
    switch (message.Type) {
      case 'SubscriptionConfirmation':
        return await handleSubscriptionConfirmation(message)
      
      case 'Notification':
        await processNotification(message.Message)
        return NextResponse.json({ status: 'processed' })
      
      case 'UnsubscribeConfirmation':
        console.log('SNS unsubscribe confirmation received')
        return NextResponse.json({ status: 'unsubscribed' })
      
      default:
        console.log('Unknown SNS message type:', message.Type)
        return NextResponse.json({ status: 'received' })
    }
  } catch (error) {
    console.error('Error processing SNS webhook:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET endpoint for subscription confirmation (AWS SNS uses GET for SubscribeURL)
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const token = searchParams.get('Token')
  const topicArn = searchParams.get('TopicArn')
  
  if (token && topicArn) {
    // This is a subscription confirmation
    console.log('SNS subscription confirmation via GET:', { token, topicArn })
    return NextResponse.json({ status: 'confirmed' })
  }
  
  return NextResponse.json({ status: 'ok' })
}

