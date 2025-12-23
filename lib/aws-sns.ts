import { SNSClient, PublishCommand, GetSMSAttributesCommand } from '@aws-sdk/client-sns'

// Check if AWS credentials are configured
const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID
const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY
// AWS Region: ap-south-1 = Asia Pacific (Mumbai)
const AWS_REGION = process.env.AWS_REGION || 'ap-south-1' // Asia Mumbai region
// Sender ID: Displayed as the sender on receiving devices (also configured in AWS Console)
const AWS_SNS_SENDER_ID = process.env.AWS_SNS_SENDER_ID || 'YCIS-SATARA'

// Initialize AWS SNS Client only if credentials are provided
const snsClient = AWS_ACCESS_KEY_ID && AWS_SECRET_ACCESS_KEY
  ? new SNSClient({
      region: AWS_REGION,
      credentials: {
        accessKeyId: AWS_ACCESS_KEY_ID,
        secretAccessKey: AWS_SECRET_ACCESS_KEY,
      },
    })
  : null

/**
 * Get AWS SNS SMS attributes (spending limits, etc.)
 * Note: Sandbox mode status is not available via API, only via console
 */
export async function getSmsAttributes(): Promise<Record<string, string> | null> {
  if (!snsClient) {
    return null
  }

  try {
    const command = new GetSMSAttributesCommand({})
    const response = await snsClient.send(command)
    return response.attributes || null
  } catch (error: any) {
    console.error('[SMS] Failed to get SMS attributes:', error)
    return null
  }
}

/**
 * Format phone number to E.164 format required by AWS SNS
 * E.164 format: +[country code][number]
 * Example: +919876543210 (India)
 */
export function formatPhoneNumber(phone: string): string {
  // Remove all non-digit characters
  let cleaned = phone.replace(/\D/g, '')
  
  // If phone doesn't start with country code, assume Indian number (91)
  if (!cleaned.startsWith('91') && cleaned.length === 10) {
    cleaned = '91' + cleaned
  }
  
  // Ensure it starts with +
  return '+' + cleaned
}

/**
 * Send SMS via AWS SNS
 * @param phoneNumber - Phone number in E.164 format
 * @param message - SMS message content
 * @returns Promise with message ID if successful
 */
export async function sendSmsViaSNS(phoneNumber: string, message: string): Promise<string> {
  // Check if AWS SNS client is initialized (credentials configured)
  if (!snsClient) {
    throw new Error(
      'AWS SNS is not configured. Please set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY environment variables. ' +
      'See ENV_VARIABLES_SETUP.txt for configuration details.'
    )
  }

  try {
    // Format phone number to E.164 format
    const formattedPhone = formatPhoneNumber(phoneNumber)
    
    console.log(`[SMS] Region: ${AWS_REGION} (Asia Pacific - Mumbai)`)
    console.log(`[SMS] Sender ID: ${AWS_SNS_SENDER_ID}`)
    console.log(`[SMS] Attempting to send SMS to ${formattedPhone} (original: ${phoneNumber})`)
    
    // Check SMS attributes (spending limits, etc.)
    const attributes = await getSmsAttributes()
    if (attributes) {
      const monthlySpendLimit = attributes.MonthlySpendLimit
      const defaultSMSType = attributes.DefaultSMSType
      console.log(`[SMS] Account Attributes:`, {
        MonthlySpendLimit: monthlySpendLimit || 'Not set',
        DefaultSMSType: defaultSMSType || 'Not set'
      })
      
      // Warn if spending limit might be an issue
      if (monthlySpendLimit === '0' || monthlySpendLimit === '0.00') {
        console.error(`[SMS] ❌ CRITICAL: Monthly spending limit is set to $0!`)
        console.error(`[SMS] ❌ SMS will NOT be delivered with $0 spending limit.`)
        console.error(`[SMS] ❌ Fix: AWS Console → SNS → Text messaging → Preferences → Set spending limit > $0`)
        // Don't throw error, but log it clearly
      }
    }
    
    // AWS SNS has a message length limit of 1600 characters
    if (message.length > 1600) {
      throw new Error('Message exceeds maximum length of 1600 characters')
    }
    
    const command = new PublishCommand({
      PhoneNumber: formattedPhone,
      Message: message,
      MessageAttributes: {
        'AWS.SNS.SMS.SMSType': {
          DataType: 'String',
          StringValue: 'Transactional', // or 'Promotional'
        },
      },
    })
    
    const response = await snsClient.send(command)
    
    console.log(`[SMS] AWS SNS Response:`, {
      MessageId: response.MessageId,
      ResponseMetadata: response.$metadata,
      StatusCode: response.$metadata?.httpStatusCode
    })
    
    if (!response.MessageId) {
      throw new Error('Failed to send SMS: No message ID returned from AWS SNS')
    }
    
    // Check HTTP status code
    if (response.$metadata?.httpStatusCode !== 200) {
      throw new Error(
        `AWS SNS returned status ${response.$metadata?.httpStatusCode}. SMS may not have been sent.`
      )
    }
    
    // Log the formatted phone number for debugging
    console.log(`[SMS] ✅ SMS request accepted by AWS SNS`)
    console.log(`[SMS] MessageId: ${response.MessageId}`)
    console.log(`[SMS] Phone: ${formattedPhone}`)
    console.log(`[SMS] Sender ID: ${AWS_SNS_SENDER_ID}`)
    
    // Important warnings about delivery
    console.error(`[SMS] ⚠️  ⚠️  ⚠️  CRITICAL DELIVERY WARNING ⚠️  ⚠️  ⚠️`)
    console.error(`[SMS] ⚠️  AWS SNS accepted the request, but SMS may NOT be delivered if:`)
    console.error(`[SMS] ⚠️  1. SANDBOX MODE: Account is in sandbox (check AWS Console)`)
    console.error(`[SMS] ⚠️     → SMS only delivers to VERIFIED numbers in sandbox mode`)
    console.error(`[SMS] ⚠️     → Number ${formattedPhone} must be verified in AWS Console`)
    console.error(`[SMS] ⚠️  2. SPENDING LIMITS: Must be > $0 (currently: ${attributes?.MonthlySpendLimit || 'unknown'})`)
    console.error(`[SMS] ⚠️  3. PRODUCTION ACCESS: Request via AWS Support if in sandbox`)
    console.error(`[SMS] ⚠️  Check: AWS Console → SNS → Text messaging → Account preferences`)
    console.error(`[SMS] ⚠️  If SMS not received, it's likely SANDBOX MODE or SPENDING LIMIT = $0`)
    
    // Return message ID but with clear warning
    return response.MessageId
  } catch (error: any) {
    console.error('[SMS] AWS SNS Error Details:', {
      Code: error.Code,
      Message: error.message,
      StatusCode: error.$metadata?.httpStatusCode,
      RequestId: error.$metadata?.requestId,
      Error: error
    })
    
    // Provide more specific error messages
    if (error.Code === 'InvalidClientTokenId' || error.Code === 'SignatureDoesNotMatch') {
      throw new Error(
        'AWS credentials are invalid. Please check your AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY environment variables.'
      )
    }
    
    if (error.Code === 'AuthorizationError') {
      throw new Error(
        'AWS authorization failed. Please ensure your IAM user/role has SNS publish permissions.'
      )
    }
    
    // Check for sandbox mode or spending limit issues
    if (error.Code === 'OptedOutException') {
      throw new Error(
        `The phone number ${phoneNumber} has opted out of receiving SMS messages.`
      )
    }
    
    // Check for sandbox mode restrictions (phone number not verified)
    if (error.Code === 'InvalidParameter' || error.message?.includes('Invalid parameter')) {
      // Check if it's a sandbox mode issue
      if (error.message?.includes('sandbox') || error.message?.toLowerCase().includes('verified')) {
        throw new Error(
          `SMS cannot be sent to ${phoneNumber}. Your AWS account is in SANDBOX MODE. ` +
          `Only verified phone numbers can receive SMS. ` +
          `To send to any number, request production access: ` +
          `AWS Console → SNS → Text messaging → Account preferences → Request production access`
        )
      }
      throw new Error(
        `Invalid phone number format: ${phoneNumber}. Please verify the phone number is correct.`
      )
    }
    
    // Check for sandbox mode errors (common error codes)
    if (error.message?.toLowerCase().includes('sandbox') || 
        error.message?.toLowerCase().includes('not verified') ||
        error.message?.toLowerCase().includes('phone number is not verified')) {
      throw new Error(
        `SMS cannot be sent to ${phoneNumber}. Your AWS account is in SANDBOX MODE. ` +
        `Only verified phone numbers can receive SMS. ` +
        `Solution: Request production access at AWS SNS Console → Text messaging → Account preferences`
      )
    }
    
    if (error.Code === 'Throttling' || error.message?.includes('throttl')) {
      throw new Error(
        'SMS sending rate limit exceeded. Please wait a moment and try again.'
      )
    }
    
    // Generic error with more details
    throw new Error(
      `Failed to send SMS via AWS SNS: ${error.message || error.Code || 'Unknown error'}. ` +
      `Check AWS SNS console for account status, spending limits, and sandbox mode settings.`
    )
  }
}

/**
 * Send SMS to multiple recipients
 * @param phoneNumbers - Array of phone numbers
 * @param message - SMS message content
 * @returns Promise with results array
 */
export async function sendBulkSmsViaSNS(
  phoneNumbers: string[],
  message: string
): Promise<Array<{ phoneNumber: string; success: boolean; messageId?: string; error?: string }>> {
  const results = []
  
  // Send SMS to each phone number (AWS SNS handles one at a time for SMS)
  for (const phoneNumber of phoneNumbers) {
    try {
      const messageId = await sendSmsViaSNS(phoneNumber, message)
      results.push({
        phoneNumber,
        success: true,
        messageId,
      })
      
      // Add small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100))
    } catch (error: any) {
      results.push({
        phoneNumber,
        success: false,
        error: error.message || 'Unknown error',
      })
    }
  }
  
  return results
}

