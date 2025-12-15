# Request AWS SNS Production Access via Support

## Current Situation

You've checked:
- ✅ Text messaging (SMS) main page - No production button
- ✅ Text messaging preferences - No production button
- ✅ Account spend limit is set to $1/month (good!)

The "Request production access" button is not visible in the AWS Console UI.

## Solution: Request via AWS Support

Since the button is not visible, request production access through AWS Support:

### Method 1: AWS Support Center (Recommended)

1. **Go to AWS Support Center**:
   - Direct link: https://console.aws.amazon.com/support/home?region=ap-south-1
   - Or: AWS Console → Support → Support Center

2. **Create a Support Case**:
   - Click **"Create case"** or **"Open a support case"**
   - Select **"Service limit increase"** or **"General guidance"**

3. **Fill out the form**:

   **Subject**: Request SMS Production Access for SNS

   **Description**:
   ```
   I need to request production access for AWS SNS SMS service to send text messages 
   to unverified phone numbers. Currently, my account is in SMS Sandbox mode and I 
   can only send SMS to verified numbers.

   Use Case:
   We are a school data center system sending SMS notifications to students and 
   parents. Messages include:
   - Important announcements and reminders
   - Attendance notifications
   - Event updates
   - System alerts

   Message Type: Transactional
   Expected Volume: 500-1000 messages per month
   Region: Asia Pacific (Mumbai) - ap-south-1
   Account Spend Limit: Currently set to $1/month

   Sample Messages:
   - "Dear Parent, Your child's attendance report is available. Please check the portal."
   - "Important: School will be closed tomorrow due to holiday."
   - "Reminder: Parent-teacher meeting scheduled for tomorrow at 3 PM."

   I have verified my phone numbers in sandbox mode and tested the service. 
   I am ready to move to production access.

   Please approve production access for my AWS account.
   ```

   **Service**: Simple Notification Service (SNS)
   **Limit Type**: SMS Production Access
   **Region**: Asia Pacific (Mumbai)
   **New Limit Value**: Production access (unlimited verified numbers)

4. **Submit the case**
5. **Wait for response**: Usually 24-48 hours

### Method 2: AWS CLI (If You Have CLI Access)

If you have AWS CLI configured, try:

```bash
# Check current SMS attributes
aws sns get-sms-attributes --region ap-south-1

# Request production access via API (if available)
aws sns request-sms-production-access --region ap-south-1
```

### Method 3: Contact AWS Support via Chat/Phone

1. Go to: https://console.aws.amazon.com/support/
2. Click **"Contact us"**
3. Choose **Chat** or **Phone**
4. Tell them: "I need to request SMS production access for SNS. The request button is not visible in my console."

### Method 4: Check Account Permissions

The button might not be visible if you don't have the right permissions:

1. Ensure you're logged in as:
   - **Root account** OR
   - **IAM user with full SNS permissions** OR
   - **IAM user with Support access**

2. Check IAM permissions:
   - `sns:*` (full SNS access)
   - `support:*` (support case creation)

### Method 5: Check Different AWS Console View

Sometimes the UI varies:

1. Try **different browser** (Chrome, Firefox, Edge)
2. Try **incognito/private mode**
3. Try **mobile view** (sometimes shows different options)
4. Check if there's a **"Request"** tab or section in the left sidebar

## What to Include in Support Request

Make sure your support request includes:

1. ✅ **Clear request**: "Request SMS production access"
2. ✅ **Use case**: School notifications to students/parents
3. ✅ **Message type**: Transactional
4. ✅ **Volume estimate**: 500-1000/month
5. ✅ **Region**: ap-south-1 (Mumbai)
6. ✅ **Sample messages**: Show compliance
7. ✅ **Current status**: Sandbox mode, 2 verified numbers

## Current Settings (Good!)

Your current settings are correct:
- ✅ **Default message type**: Transactional ✓
- ✅ **Account spend limit**: $1/month ✓ (not $0)
- ✅ **Region**: ap-south-1 (Mumbai) ✓
- ✅ **Verified numbers**: 2 numbers ✓

## After Requesting via Support

1. **Save your preferences** (click "Save changes" on the preferences page)
2. **Wait for AWS response** (24-48 hours)
3. **Check email** for approval notification
4. **Verify in console**:
   - Go back to Text messaging (SMS) → Account preferences
   - Sandbox status should change to "Production access"
   - You'll be able to send SMS to any number

## Quick Action Steps

1. ✅ **Go to**: https://console.aws.amazon.com/support/home
2. ✅ **Click**: "Create case" or "Open a support case"
3. ✅ **Select**: "Service limit increase" or "General guidance"
4. ✅ **Subject**: "Request SMS Production Access for SNS"
5. ✅ **Paste the description** from above
6. ✅ **Submit** and wait 24-48 hours

## Why This Happens

Sometimes AWS hides the production access button and requires:
- Support case for verification
- Account review process
- Compliance checks

This is normal - many AWS accounts need to request via support.

## Alternative: Continue Using Sandbox

While waiting for production access:

1. **Verify more phone numbers** in sandbox mode
2. **Test your system** with verified numbers
3. **Prepare for production** by ensuring all features work

## Need Help?

- AWS Support: https://console.aws.amazon.com/support/
- SNS Documentation: https://docs.aws.amazon.com/sns/
- SNS FAQs: https://aws.amazon.com/sns/faqs/

---

**Next Step**: Create a support case using Method 1 above. This is the most reliable way to get production access.

