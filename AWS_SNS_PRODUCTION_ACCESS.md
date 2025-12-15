# How to Request AWS SNS Production Access

## Problem: SMS Only Works for Your Phone Number (8668428513)

If SMS only works for your phone number but not for others, your AWS account is in **Sandbox Mode**.

In Sandbox Mode:
- ✅ SMS can only be sent to **verified phone numbers**
- ❌ SMS **cannot** be sent to unverified numbers
- This is a security feature for new AWS accounts

## Solution: Request Production Access

Follow these steps to enable sending SMS to any phone number:

### Step 1: Go to AWS SNS Console

1. Log in to your AWS account: https://console.aws.amazon.com/
2. Navigate to **Simple Notification Service (SNS)**: https://console.aws.amazon.com/sns/
3. Make sure you're in the correct region: **Asia Pacific (Mumbai) - ap-south-1**

### Step 2: Navigate to Account Preferences

**IMPORTANT**: The "Request production access" button is NOT on the main SMS page. You need to go to Preferences:

1. On the **Text messaging (SMS)** page, look for **"Text messaging preferences"** section
2. Click the **"Edit preferences"** button (or **"Edit"** link)
3. **OR** look for **"Account preferences"** in the left sidebar under Text messaging (SMS)
4. **OR** scroll down to find **"Text messaging preferences"** section and click **"Edit"**

### Step 3: Find the Production Access Request

Once in Preferences/Account preferences:

1. Look for a section showing **"SMS Sandbox"** or **"Sandbox mode"**
2. You should see: **"This account is in the SMS sandbox"**
3. Look for a button/link that says:
   - **"Request production access"** OR
   - **"Exit SMS Sandbox"** OR
   - **"Request to exit sandbox"** OR
   - **"Request SMS production access"**

**⚠️ If the button is NOT visible** (which is common):
- The production access request must be done via **AWS Support**
- See **AWS_SNS_REQUEST_VIA_SUPPORT.md** for detailed instructions
- Go to: AWS Support Center → Create case → Request SMS production access

### Step 4: Fill Out the Request Form

You'll need to provide:

1. **Use case description**:
   ```
   We are sending SMS notifications to students and parents for a school data center system.
   Messages include important announcements, reminders, and updates.
   ```

2. **Message types**:
   - Select: **Transactional** (for notifications and alerts)
   - Optionally: **Promotional** (if you plan to send marketing messages)

3. **Expected monthly volume**:
   - Estimate how many SMS you'll send per month
   - Example: "500-1000 messages per month"

4. **Website URL** (if applicable):
   - Your website URL or application URL

5. **Sample messages**:
   ```
   Example 1: "Dear Parent, Your child's attendance report is available. Please check the portal."
   Example 2: "Important: School will be closed tomorrow due to holiday."
   Example 3: "Reminder: Parent-teacher meeting scheduled for tomorrow at 3 PM."
   ```

6. **Compliance**:
   - Confirm you'll comply with AWS SMS policies
   - Confirm you have consent to send SMS to recipients

### Step 5: Submit and Wait

1. Review all information
2. Click **Submit** or **Request access**
3. **Wait for approval**: Usually takes **24-48 hours**
4. You'll receive an email notification when approved

### Step 6: Verify Production Access

After approval:

1. Go back to **AWS SNS Console** → **Text messaging (SNS)** → **Account preferences**
2. Check that **Sandbox mode** is now **Disabled** or shows **Production access**
3. You can now send SMS to any phone number!

## Alternative: Verify Phone Numbers (Temporary Solution)

If you need to test immediately while waiting for production access:

1. Go to **AWS SNS Console** → **Text messaging (SMS)** → **Phone numbers**
2. Click **"Add phone number"**
3. Enter the phone number (e.g., `+919876543210`)
4. AWS will send an OTP to verify
5. Enter the OTP to verify the number
6. Now SMS will work for this verified number

**Note**: This is only for testing. For production, you need production access.

## Important Notes

### Spending Limits

Even after production access, ensure spending limits are set:

1. Go to **Account preferences**
2. Set **Account spending limit** (e.g., $50/month)
3. Set **Per-message spending limit** if needed
4. **Important**: Limits must be > $0, otherwise SMS won't be sent

### Message Types

- **Transactional**: For important notifications (attendance, alerts, etc.)
- **Promotional**: For marketing messages (requires opt-in)

### Compliance

- Always get consent before sending SMS
- Include opt-out instructions in messages
- Follow local SMS regulations (DND registry in India)

## Quick Checklist

- [ ] Logged into AWS Console
- [ ] Navigated to SNS → Text messaging → Account preferences
- [ ] Clicked "Request production access"
- [ ] Filled out the form with use case details
- [ ] Submitted the request
- [ ] Waiting for approval (24-48 hours)
- [ ] Verified production access is enabled
- [ ] Set spending limits (> $0)
- [ ] Tested sending SMS to unverified number

## Need Help?

- AWS SNS Documentation: https://docs.aws.amazon.com/sns/
- AWS Support: https://console.aws.amazon.com/support/
- Check CloudWatch logs for detailed error messages

## Current Status

**Your Phone Number**: `+918668428513` (verified, works)
**Other Numbers**: Not verified, won't work until production access is granted

**Action Required**: Request production access following the steps above.

