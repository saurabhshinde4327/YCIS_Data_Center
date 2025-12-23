# Fast2SMS Cost Troubleshooting Guide

## Issue: ₹5 or ₹10 Deducted for 1 SMS (Expected ₹0.25)

If you see ₹5 or ₹10 deducted but only 1 message was sent, here are possible reasons:

### ⚠️ CRITICAL: ₹10 Deduction

**If ₹10 was deducted for 1 SMS, this is likely:**

1. **Quick SMS Feature** (₹5 per SMS) - If 2 messages were sent = ₹10
2. **Minimum Transaction Charge** - Fast2SMS may charge ₹10 minimum for certain account types
3. **API Activation Fee** - One-time fee when first using API
4. **Double Charge** - Message might have been sent twice (check logs)
5. **Wrong API Endpoint** - Using Quick SMS API instead of bulkV2 API

### 1. **Message Length - Multiple SMS Parts**

SMS messages are limited to **160 characters per part**. If your message is longer, it gets split:

| Message Length | SMS Parts | Cost |
|---------------|-----------|------|
| 1-160 chars | 1 part | ₹0.25 |
| 161-320 chars | 2 parts | ₹0.50 |
| 321-480 chars | 3 parts | ₹0.75 |
| 481-640 chars | 4 parts | ₹1.00 |
| ... | ... | ... |
| 1441-1600 chars | 10 parts | ₹2.50 |

**To check**: Look at your message length in the logs. If it's over 160 characters, it will be split.

### 2. **Minimum Transaction Charge**

Fast2SMS may have a **minimum transaction charge** of ₹5 or ₹10 for:
- First-time API usage
- Account activation
- Certain account types or wallet tiers

**Solution**: Check your Fast2SMS dashboard for transaction details. Contact support if this seems incorrect.

### 2a. **Quick SMS Feature (₹5 per SMS)**

Fast2SMS has a "Quick SMS" feature that costs **₹5 per message** (different from bulk SMS API).

**If ₹10 was deducted:**
- You might have sent 2 Quick SMS messages
- Or there's a minimum charge of ₹10

**Solution**: 
- Verify you're using the correct API endpoint: `https://www.fast2sms.com/dev/bulkV2`
- Check transaction history to see if 2 messages were sent
- Contact Fast2SMS support to clarify charges

### 3. **API Activation Fee**

Some SMS providers charge an **API activation fee** when you first use the API route.

**Solution**: Contact Fast2SMS support to clarify if there's an activation fee.

### 4. **Transaction Fee**

Fast2SMS might charge a **transaction fee** in addition to SMS cost.

**Solution**: Check Fast2SMS pricing page for transaction fees.

### 5. **Pricing Tier Issue**

Your wallet balance might be in a different pricing tier than expected.

**Solution**: Check your Fast2SMS wallet balance and verify pricing tier.

### 6. **Multiple Attempts**

If the SMS failed initially and was retried multiple times, each attempt may have been charged.

**Solution**: Check the logs for retry attempts or failed sends.

## How to Investigate

### Step 1: Check Application Logs

Look for these log entries when sending SMS:

```
[SMS] Message Length: XXX characters
[SMS] SMS Parts: X part(s)
[SMS] 💰 Actual Cost from Fast2SMS: ₹X.XX
[SMS] Full Fast2SMS Response: {...}
```

### Step 2: Check Fast2SMS Dashboard

1. Log in to https://www.fast2sms.com/
2. Go to **Reports** or **Transaction History**
3. Find the transaction for ₹5
4. Check:
   - Number of SMS sent
   - Cost per SMS
   - Transaction type (SMS, API fee, etc.)
   - Message length

### Step 3: Check Message Length

Count the characters in your message:
- **Title** + **Message** = Total characters
- If total > 160, it will be split into multiple SMS parts
- Each part costs ₹0.25

**Example**:
- Message: 800 characters
- SMS Parts: 800 ÷ 160 = 5 parts
- Cost: 5 × ₹0.25 = ₹1.25

### Step 4: Contact Fast2SMS Support

If the deduction doesn't match:
1. Screenshot your transaction history
2. Note the exact time of transaction
3. Contact Fast2SMS support: https://www.fast2sms.com/help/
4. Ask about:
   - Why ₹5 was deducted for 1 SMS
   - Minimum transaction charges
   - API activation fees
   - Transaction fees

## Prevention Tips

1. **Keep Messages Short**: Try to keep messages under 160 characters
2. **Check Before Sending**: Review message length before sending
3. **Monitor Balance**: Check Fast2SMS balance before and after sending
4. **Review Logs**: Check application logs for actual SMS parts and cost
5. **Test First**: Send a test SMS to verify cost before bulk sending

## Expected Costs

| Scenario | Expected Cost |
|----------|---------------|
| 1 SMS (≤160 chars) | ₹0.25 |
| 1 SMS (161-320 chars) | ₹0.50 |
| 1 SMS (321-480 chars) | ₹0.75 |
| 1 SMS (481-640 chars) | ₹1.00 |
| 1 SMS (641-800 chars) | ₹1.25 |
| 1 SMS (801-960 chars) | ₹1.50 |
| 1 SMS (961-1120 chars) | ₹1.75 |
| 1 SMS (1121-1280 chars) | ₹2.00 |
| 1 SMS (1281-1440 chars) | ₹2.25 |
| 1 SMS (1441-1600 chars) | ₹2.50 |

**Note**: If you see ₹5 deducted for a single message, it's likely:
- A minimum charge/activation fee
- A billing error (contact Fast2SMS)
- The message was much longer than expected

## Quick Check

Run this in your browser console or check logs:

```javascript
// Check your message length
const message = "Your message here";
const length = message.length;
const parts = Math.ceil(length / 160);
const cost = parts * 0.25;
console.log(`Length: ${length} chars, Parts: ${parts}, Cost: ₹${cost}`);
```

---

**If ₹5 was deducted for 1 SMS, please:**
1. Check message length in logs
2. Check Fast2SMS transaction history
3. Contact Fast2SMS support if it's incorrect

