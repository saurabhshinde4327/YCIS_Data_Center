// WhatsApp Business API Integration (Meta/Facebook)
// Similar to how Amazon sends WhatsApp messages directly

const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID
const WHATSAPP_ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN
const WHATSAPP_BUSINESS_ACCOUNT_ID = process.env.WHATSAPP_BUSINESS_ACCOUNT_ID
const WHATSAPP_API_VERSION = process.env.WHATSAPP_API_VERSION || 'v21.0'

const WHATSAPP_API_URL = `https://graph.facebook.com/${WHATSAPP_API_VERSION}/${WHATSAPP_PHONE_NUMBER_ID}/messages`

/**
 * Format phone number for WhatsApp Business API (E.164 format)
 * @param phone - Phone number in any format
 * @returns E.164 formatted phone number (e.g., +919876543210)
 */
export function formatPhoneForWhatsApp(phone: string): string {
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
 * Send WhatsApp message via WhatsApp Business API (Meta)
 * Similar to how Amazon sends WhatsApp messages
 * @param phoneNumber - Phone number in E.164 format
 * @param message - WhatsApp message content
 * @returns Promise with message ID if successful
 */
export async function sendWhatsAppViaAPI(phoneNumber: string, message: string): Promise<string> {
  // Check if WhatsApp Business API is configured
  if (!WHATSAPP_PHONE_NUMBER_ID || !WHATSAPP_ACCESS_TOKEN) {
    throw new Error(
      'WhatsApp Business API is not configured. Please set WHATSAPP_PHONE_NUMBER_ID and WHATSAPP_ACCESS_TOKEN environment variables. ' +
      'See ENV_VARIABLES_SETUP.txt for configuration details.'
    )
  }

  try {
    // Format phone number to E.164 format
    const formattedPhone = formatPhoneForWhatsApp(phoneNumber)
    
    console.log(`[WhatsApp] Provider: WhatsApp Business API (Meta)`)
    console.log(`[WhatsApp] Phone Number ID: ${WHATSAPP_PHONE_NUMBER_ID}`)
    console.log(`[WhatsApp] Attempting to send WhatsApp to ${formattedPhone} (original: ${phoneNumber})`)
    console.log(`[WhatsApp] Message Length: ${message.length} characters`)
    
    // WhatsApp Business API message payload
    // Using text message format (can be extended to support templates, media, etc.)
    const payload = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: formattedPhone,
      type: 'text',
      text: {
        preview_url: false, // Set to true if you want link previews
        body: message
      }
    }
    
    // Make API request to WhatsApp Business API
    const response = await fetch(WHATSAPP_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })
    
    const responseData = await response.json()
    
    console.log(`[WhatsApp] WhatsApp Business API Response:`, responseData)
    
    // Check if request was successful
    if (!response.ok) {
      const errorMsg = responseData.error?.message || response.statusText || 'Unknown error from WhatsApp API'
      const errorCode = responseData.error?.code
      const errorType = responseData.error?.type
      
      console.error(`[WhatsApp] API Error:`, {
        code: errorCode,
        type: errorType,
        message: errorMsg,
        fullError: responseData.error
      })
      
      // Provide specific error messages
      if (errorCode === 190) {
        throw new Error(
          'WhatsApp API authentication failed. Please check your WHATSAPP_ACCESS_TOKEN. ' +
          'Token may be expired or invalid.'
        )
      }
      
      if (errorCode === 131047) {
        throw new Error(
          `The phone number ${formattedPhone} has not opted in to receive WhatsApp messages. ` +
          `Users must opt-in before receiving messages.`
        )
      }
      
      if (errorCode === 131026) {
        throw new Error(
          `The phone number ${formattedPhone} is not a valid WhatsApp number. ` +
          `Please verify the phone number is correct and has WhatsApp installed.`
        )
      }
      
      if (errorCode === 100) {
        throw new Error(
          'Invalid parameter. Please check phone number format and message content.'
        )
      }
      
      throw new Error(`WhatsApp API error (${errorCode || response.status}): ${errorMsg}`)
    }
    
    // Extract message ID from response
    const messageId = responseData.messages?.[0]?.id
    
    if (!messageId) {
      throw new Error('Failed to send WhatsApp: No message ID returned from WhatsApp API')
    }
    
    // Log success
    console.log(`[WhatsApp] ✅ WhatsApp sent successfully via WhatsApp Business API`)
    console.log(`[WhatsApp] Message ID: ${messageId}`)
    console.log(`[WhatsApp] Phone: ${formattedPhone}`)
    console.log(`[WhatsApp] Message: ${message.substring(0, 50)}...`)
    console.log(`[WhatsApp] Status: ${responseData.messages?.[0]?.message_status || 'sent'}`)
    
    return messageId
  } catch (error: any) {
    console.error('[WhatsApp] WhatsApp Business API Error Details:', {
      Message: error.message,
      Error: error
    })
    
    // Provide more specific error messages
    if (error.message?.includes('not configured')) {
      throw error
    }
    
    // Network errors
    if (error.message?.includes('fetch') || error.message?.includes('network')) {
      throw new Error(
        'Network error while sending WhatsApp. Please check your internet connection and try again.'
      )
    }
    
    // Generic error with more details
    throw new Error(
      `Failed to send WhatsApp via WhatsApp Business API: ${error.message || 'Unknown error'}. ` +
      `Check your WhatsApp Business API configuration and credentials.`
    )
  }
}

/**
 * Send WhatsApp to multiple recipients
 * @param phoneNumbers - Array of phone numbers
 * @param message - WhatsApp message content
 * @returns Promise with results array
 */
export async function sendBulkWhatsAppViaAPI(
  phoneNumbers: string[],
  message: string
): Promise<Array<{ phoneNumber: string; success: boolean; messageId?: string; error?: string }>> {
  const results = []
  
  // Send WhatsApp to each phone number
  for (const phoneNumber of phoneNumbers) {
    try {
      const messageId = await sendWhatsAppViaAPI(phoneNumber, message)
      results.push({
        phoneNumber,
        success: true,
        messageId,
      })
      
      // Add delay to avoid rate limiting (WhatsApp has rate limits)
      await new Promise(resolve => setTimeout(resolve, 1000)) // 1 second delay between messages
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

