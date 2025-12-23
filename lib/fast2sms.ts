// Fast2SMS SMS Service Integration

const FAST2SMS_API_KEY = process.env.FAST2SMS_API_KEY
const FAST2SMS_SENDER_ID = process.env.FAST2SMS_SENDER_ID || 'YCIS-SATARA' // Sender ID (6 characters max for India)

const FAST2SMS_API_URL = 'https://www.fast2sms.com/dev/bulkV2'

/**
 * Format phone number for Fast2SMS (10-digit Indian number)
 * Fast2SMS expects 10-digit numbers without country code
 * @param phone - Phone number in any format
 * @returns 10-digit phone number
 */
export function formatPhoneNumber(phone: string): string {
  // Remove all non-digit characters
  let cleaned = phone.replace(/\D/g, '')
  
  // If phone starts with 91 (India country code), remove it
  if (cleaned.startsWith('91') && cleaned.length === 12) {
    cleaned = cleaned.substring(2)
  }
  
  // If phone doesn't start with country code and is 10 digits, use as is
  if (cleaned.length === 10) {
    return cleaned
  }
  
  // If phone is 11 digits and starts with 0, remove leading 0
  if (cleaned.length === 11 && cleaned.startsWith('0')) {
    return cleaned.substring(1)
  }
  
  // Return last 10 digits if longer
  if (cleaned.length > 10) {
    return cleaned.substring(cleaned.length - 10)
  }
  
  return cleaned
}

/**
 * Send SMS via Fast2SMS
 * @param phoneNumber - Phone number (will be formatted to 10 digits)
 * @param message - SMS message content
 * @returns Promise with request ID if successful
 */
export async function sendSmsViaFast2SMS(phoneNumber: string, message: string): Promise<string> {
  // Check if Fast2SMS API key is configured
  if (!FAST2SMS_API_KEY) {
    throw new Error(
      'Fast2SMS is not configured. Please set FAST2SMS_API_KEY environment variable. ' +
      'See ENV_VARIABLES_SETUP.txt for configuration details.'
    )
  }

  try {
    // Format phone number to 10-digit format
    const formattedPhone = formatPhoneNumber(phoneNumber)
    
    // Validate phone number length
    if (formattedPhone.length !== 10) {
      throw new Error(`Invalid phone number format: ${phoneNumber}. Expected 10-digit Indian number.`)
    }
    
    console.log(`[SMS] Provider: Fast2SMS`)
    console.log(`[SMS] Sender ID: ${FAST2SMS_SENDER_ID}`)
    console.log(`[SMS] Attempting to send SMS to ${formattedPhone} (original: ${phoneNumber})`)
    console.log(`[SMS] Message Length: ${message.length} characters`)
    
    // Fast2SMS has a message length limit (typically 160 characters per SMS)
    // For longer messages, it will be split into multiple SMS
    // Each SMS part costs ₹0.25 (for wallet ₹100-₹3,999)
    const estimatedSmsParts = Math.ceil(message.length / 160)
    const estimatedCost = estimatedSmsParts * 0.25
    
    if (message.length > 160) {
      console.warn(`[SMS] ⚠️ Message will be split into ${estimatedSmsParts} SMS part(s)`)
      console.warn(`[SMS] ⚠️ Estimated cost: ₹${estimatedCost.toFixed(2)} (₹0.25 per SMS part)`)
    } else {
      console.log(`[SMS] Message fits in 1 SMS part (estimated cost: ₹0.25)`)
    }
    
    if (message.length > 1000) {
      console.warn(`[SMS] ⚠️ Message length (${message.length}) exceeds recommended limit. May be split into multiple SMS.`)
    }
    
    // Prepare request payload for Fast2SMS bulkV2 API
    // Fast2SMS expects: message, language, route, numbers, and sender_id (optional)
    // Route options:
    // - 'q' = Quick route (promotional) - Standard pricing ₹0.25 per SMS
    // - 't' = Transactional route - May have different pricing
    // WARNING: Do NOT confuse 'q' route with "Quick SMS" feature (₹5 per SMS)
    // We use bulkV2 API with route 'q' which should be standard promotional pricing
    const payload: any = {
      message: message,
      language: 'english',
      route: 'q', // 'q' for promotional route (NOT Quick SMS feature)
      numbers: formattedPhone
    }
    
    console.log(`[SMS] API Endpoint: ${FAST2SMS_API_URL}`)
    console.log(`[SMS] Route: 'q' (Promotional, NOT Quick SMS feature)`)
    console.log(`[SMS] Expected Cost: ₹0.25 per SMS part (for wallet ₹100-₹3,999)`)
    
    // Add sender ID if configured (must be registered in Fast2SMS DLT portal)
    if (FAST2SMS_SENDER_ID) {
      payload.sender_id = FAST2SMS_SENDER_ID
    }
    
    // Make API request to Fast2SMS
    const response = await fetch(FAST2SMS_API_URL, {
      method: 'POST',
      headers: {
        'authorization': FAST2SMS_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })
    
    const responseData = await response.json()
    
    console.log(`[SMS] Fast2SMS Response:`, responseData)
    
    // Fast2SMS may return 200 OK but with error status_code in response body
    // Check for error status codes (999, 400, 401, 402, etc.)
    if (responseData.status_code && responseData.status_code !== 200) {
      const errorMsg = responseData.message || 'Unknown error from Fast2SMS'
      const statusCode = responseData.status_code
      
      // Provide specific error messages based on status code
      if (statusCode === 999) {
        throw new Error(
          `Fast2SMS Account Requirement: ${errorMsg}. ` +
          `Please complete a transaction of at least 100 INR in your Fast2SMS account to use the API route. ` +
          `Visit https://www.fast2sms.com/ to recharge your account.`
        )
      }
      
      if (statusCode === 401) {
        throw new Error(
          `Fast2SMS Authentication Failed: ${errorMsg}. ` +
          `Please check your FAST2SMS_API_KEY environment variable.`
        )
      }
      
      if (statusCode === 402) {
        throw new Error(
          `Fast2SMS Account Balance Insufficient: ${errorMsg}. ` +
          `Please recharge your Fast2SMS account at https://www.fast2sms.com/`
        )
      }
      
      throw new Error(`Fast2SMS Error (Status ${statusCode}): ${errorMsg}`)
    }
    
    // Check HTTP response status
    if (!response.ok) {
      const errorMsg = responseData.message || response.statusText || 'Unknown error from Fast2SMS'
      throw new Error(`Fast2SMS API error: ${response.status} - ${errorMsg}`)
    }
    
    // Fast2SMS returns success status in response (legacy check)
    if (responseData.return === false) {
      const errorMsg = responseData.message || 'Unknown error from Fast2SMS'
      throw new Error(`Failed to send SMS: ${errorMsg}`)
    }
    
    // Extract request ID from response
    const requestId = responseData.request_id || responseData.message_id || `fast2sms-${Date.now()}`
    
    // Extract cost information if available
    const cost = responseData.cost || responseData.price || responseData.amount
    const balance = responseData.balance || responseData.wallet_balance
    const smsCount = responseData.sms_count || responseData.count || responseData.sms_parts || 1
    
    // Calculate actual SMS parts based on message length
    const actualSmsParts = Math.ceil(message.length / 160)
    
    // Log success with detailed cost information
    console.log(`[SMS] ✅ SMS sent successfully via Fast2SMS`)
    console.log(`[SMS] Request ID: ${requestId}`)
    console.log(`[SMS] Phone: ${formattedPhone}`)
    console.log(`[SMS] Message Length: ${message.length} characters`)
    console.log(`[SMS] Message Preview: ${message.substring(0, 50)}...`)
    
    // Log SMS parts information
    console.log(`[SMS] SMS Parts: ${smsCount} part(s) (message split into ${actualSmsParts} part(s) if > 160 chars)`)
    
    // Log cost information
    if (cost !== undefined && cost !== null) {
      console.log(`[SMS] 💰 Actual Cost from Fast2SMS API Response: ₹${cost}`)
      const expectedCost = 0.25 * smsCount
      
      if (cost > expectedCost * 1.5) {
        console.error(`[SMS] ❌ CRITICAL: Cost is MUCH higher than expected!`)
        console.error(`[SMS] ❌ Expected: ₹${expectedCost.toFixed(2)} for ${smsCount} SMS part(s)`)
        console.error(`[SMS] ❌ Actual: ₹${cost}`)
        console.error(`[SMS] ❌ Difference: ₹${(cost - expectedCost).toFixed(2)}`)
        console.error(`[SMS] ❌ Possible reasons:`)
        console.error(`[SMS] ❌   1. Using wrong API endpoint (Quick SMS feature instead of bulkV2)`)
        console.error(`[SMS] ❌   2. Minimum transaction charge (₹5 or ₹10)`)
        console.error(`[SMS] ❌   3. API activation fee`)
        console.error(`[SMS] ❌   4. Transaction fee`)
        console.error(`[SMS] ❌   5. Different pricing tier`)
        console.error(`[SMS] ❌ ACTION REQUIRED: Check Fast2SMS dashboard and contact support if incorrect`)
      } else if (cost > expectedCost) {
        console.warn(`[SMS] ⚠️ Cost is higher than expected (₹${cost} for ${smsCount} SMS part(s))`)
        console.warn(`[SMS] ⚠️ Expected: ₹${expectedCost.toFixed(2)}, Actual: ₹${cost}`)
        console.warn(`[SMS] ⚠️ This might be due to: minimum charge, transaction fee, or different pricing tier`)
      } else {
        console.log(`[SMS] ✅ Cost matches expected: ₹${cost} for ${smsCount} SMS part(s)`)
      }
    } else {
      // Estimate cost if not provided by API
      const estimatedCost = actualSmsParts * 0.25
      console.log(`[SMS] 💰 Estimated Cost: ₹${estimatedCost.toFixed(2)} (₹0.25 per SMS part)`)
      console.log(`[SMS] ⚠️ Cost not provided by API - Check Fast2SMS dashboard for actual deduction`)
      console.log(`[SMS] ⚠️ If you see ₹5 or ₹10 deducted, there may be a minimum charge or fee`)
    }
    
    if (balance !== undefined && balance !== null) {
      console.log(`[SMS] 💳 Remaining Balance: ₹${balance}`)
    }
    
    // Log full response for debugging
    console.log(`[SMS] Full Fast2SMS Response:`, JSON.stringify(responseData, null, 2))
    
    return requestId
  } catch (error: any) {
    console.error('[SMS] Fast2SMS Error Details:', {
      Message: error.message,
      Error: error
    })
    
    // Provide more specific error messages
    if (error.message?.includes('not configured')) {
      throw error
    }
    
    if (error.message?.includes('Invalid phone number')) {
      throw error
    }
    
    // Network errors
    if (error.message?.includes('fetch') || error.message?.includes('network')) {
      throw new Error(
        'Network error while sending SMS. Please check your internet connection and try again.'
      )
    }
    
    // API errors
    if (error.message?.includes('401') || error.message?.includes('Unauthorized')) {
      throw new Error(
        'Fast2SMS authentication failed. Please check your FAST2SMS_API_KEY environment variable.'
      )
    }
    
    if (error.message?.includes('402') || error.message?.includes('Payment')) {
      throw new Error(
        'Fast2SMS account balance insufficient. Please recharge your Fast2SMS account.'
      )
    }
    
    // Generic error with more details
    throw new Error(
      `Failed to send SMS via Fast2SMS: ${error.message || 'Unknown error'}. ` +
      `Check your Fast2SMS account status and API key configuration.`
    )
  }
}

/**
 * Send SMS to multiple recipients
 * @param phoneNumbers - Array of phone numbers
 * @param message - SMS message content
 * @returns Promise with results array
 */
export async function sendBulkSmsViaFast2SMS(
  phoneNumbers: string[],
  message: string
): Promise<Array<{ phoneNumber: string; success: boolean; messageId?: string; error?: string }>> {
  const results = []
  
  // Send SMS to each phone number
  for (const phoneNumber of phoneNumbers) {
    try {
      const messageId = await sendSmsViaFast2SMS(phoneNumber, message)
      results.push({
        phoneNumber,
        success: true,
        messageId,
      })
      
      // Add small delay to avoid rate limiting (Fast2SMS may have rate limits)
      await new Promise(resolve => setTimeout(resolve, 200))
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

