# WhatsApp Business API Setup Guide
## Send WhatsApp Messages Directly (Like Amazon)

This guide will help you set up WhatsApp Business API to send messages directly via API, just like Amazon does.

## Overview

**WhatsApp Business API** allows you to send WhatsApp messages programmatically without opening WhatsApp manually. Messages are delivered directly to recipients' WhatsApp, similar to how Amazon sends order updates and notifications.

## Prerequisites

1. **Meta Business Account** (Facebook Business Account)
2. **Business Verification** (required by Meta)
3. **Phone Number** (can use Meta's test number initially)

## Step-by-Step Setup

### Step 1: Create Meta Developer Account

1. Go to: https://developers.facebook.com/
2. Click **"Get Started"** or **"Log In"**
3. Create a developer account (free)

### Step 2: Create a Business App

1. In Meta Developer Console, click **"Create App"**
2. Select **"Business"** as app type
3. Fill in app details:
   - App Name: "YCIS Data Center WhatsApp"
   - App Contact Email: your email
   - Business Account: Select or create one
4. Click **"Create App"**

### Step 3: Add WhatsApp Product

1. In your app dashboard, find **"WhatsApp"** product
2. Click **"Set Up"**
3. Follow the setup wizard

### Step 4: Get Phone Number ID

1. Go to **WhatsApp** → **API Setup**
2. You'll see **"Phone number ID"** - copy this value
3. This is your `WHATSAPP_PHONE_NUMBER_ID`

### Step 5: Generate Access Token

1. In **WhatsApp** → **API Setup**
2. Under **"Temporary access token"**, click **"Generate Token"**
3. For production, create a **System User** and generate permanent token:
   - Go to **Business Settings** → **Users** → **System Users**
   - Create new system user
   - Assign WhatsApp permissions
   - Generate permanent token

### Step 6: Configure Environment Variables

Add to your `.env.local` file:

```env
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id_here
WHATSAPP_ACCESS_TOKEN=your_access_token_here
WHATSAPP_BUSINESS_ACCOUNT_ID=your_business_account_id_here  # Optional
WHATSAPP_API_VERSION=v21.0  # Optional
```

### Step 7: Test WhatsApp Sending

1. Restart your dev server: `npm run dev`
2. Go to SMS Admin Dashboard
3. Select a student and send WhatsApp message
4. Check if message is delivered directly (no need to open WhatsApp)

## Important Notes

### Business Verification

- **Required** for production use
- Meta requires business verification for WhatsApp Business API
- Process can take a few days to weeks
- Without verification, you can only send to test numbers

### Phone Number

- Initially, Meta provides a **test phone number**
- For production, you need to:
  - Verify your business
  - Request a dedicated WhatsApp Business number
  - Or use your existing phone number (must be verified)

### Message Templates

- For **first-time messages**, you must use **approved templates**
- Templates must be submitted and approved by WhatsApp
- After user replies, you can send free-form messages for 24 hours

### Rate Limits

- WhatsApp has rate limits to prevent spam
- Free tier: Limited messages per day
- Business tier: Higher limits based on your plan

## Testing

### Test Phone Numbers

Meta provides test phone numbers you can use during development:
- Check **WhatsApp** → **API Setup** → **"To"** field
- Add test numbers to send test messages

### Test Message

```javascript
// Example API call
POST https://graph.facebook.com/v21.0/{PHONE_NUMBER_ID}/messages
Headers:
  Authorization: Bearer {ACCESS_TOKEN}
  Content-Type: application/json

Body:
{
  "messaging_product": "whatsapp",
  "to": "+919876543210",
  "type": "text",
  "text": {
    "body": "Hello! This is a test message."
  }
}
```

## Troubleshooting

### Error: "Authentication failed"
- Check `WHATSAPP_ACCESS_TOKEN` is correct
- Token may be expired (temporary tokens expire)
- Generate new token or use permanent token

### Error: "Phone number not opted in"
- User must opt-in to receive WhatsApp messages
- Can only send to users who have opted in
- For first message, use approved template

### Error: "Invalid phone number"
- Phone number must be in E.164 format: +919876543210
- Must be a valid WhatsApp number
- User must have WhatsApp installed

### Messages Not Delivering
- Check business verification status
- Verify phone number is approved
- Check rate limits
- Review Meta Business Manager for restrictions

## Cost

- **WhatsApp Business API** has pricing based on:
  - Message type (conversation vs. template)
  - Message category
  - Your business tier
- Check Meta's pricing page for current rates
- Generally cheaper than SMS for high volume

## Benefits Over WhatsApp Web Links

✅ **Direct Delivery**: Messages sent automatically via API  
✅ **No Manual Action**: No need to open WhatsApp  
✅ **Delivery Tracking**: Know when messages are delivered  
✅ **Professional**: Business-grade messaging  
✅ **Scalable**: Send to thousands of recipients  
✅ **Templates**: Use approved message templates  
✅ **Media Support**: Send images, documents, etc.  

## Support

- **Meta Developer Docs**: https://developers.facebook.com/docs/whatsapp
- **WhatsApp Business API**: https://www.whatsapp.com/business/api
- **Meta Support**: https://developers.facebook.com/support/

---

**Once configured, WhatsApp messages will be sent directly via API, just like Amazon sends order updates!**

