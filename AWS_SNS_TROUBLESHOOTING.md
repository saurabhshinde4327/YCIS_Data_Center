# AWS SNS SMS Troubleshooting Guide

## Issue: SMS Sent Successfully But Not Received

If you see "SMS sent successfully" in the logs but the recipient doesn't receive the SMS, check the following:

### 1. AWS SNS Sandbox Mode (Most Common Issue)

**Problem**: New AWS accounts start in "Sandbox Mode" which only allows sending SMS to verified phone numbers.

**Solution**:
1. Go to AWS SNS Console: https://console.aws.amazon.com/sns/
2. Navigate to **Text messaging (SMS)** → **Account preferences**
3. Check if **Sandbox mode** is enabled
4. If enabled, you have two options:
   - **Option A**: Request production access (recommended for production)
     - Click "Request production access"
     - Fill out the form with your use case
     - Wait for AWS approval (usually 24-48 hours)
   - **Option B**: Verify the phone number in sandbox mode
     - Go to **Text messaging (SMS)** → **Phone numbers**
     - Click "Add phone number"
     - Enter the phone number and verify it via OTP

### 2. Spending Limits

**Problem**: AWS SNS spending limits might be set to $0, preventing SMS delivery.

**Solution**:
1. Go to AWS SNS Console: https://console.aws.amazon.com/sns/
2. Navigate to **Text messaging (SMS)** → **Account preferences**
3. Check **Account spending limit** and **Per-message spending limit**
4. Set appropriate limits (e.g., $10/month for testing)
5. Ensure limits are not set to $0

### 3. Phone Number Format

**Problem**: Phone number might not be in correct E.164 format.

**Current Format**: The system automatically formats Indian numbers:
- Input: `8668428513`
- Formatted: `+918668428513`

**Verify**: Check the logs to confirm the formatted number is correct.

### 4. Account Verification

**Problem**: AWS account might not be fully verified.

**Solution**:
1. Ensure your AWS account is fully verified
2. Complete any pending verification steps in AWS Console
3. Check for any account-level restrictions

### 5. IAM Permissions

**Problem**: IAM user might not have sufficient permissions.

**Required Permissions**:
- `sns:Publish`
- `sns:GetSMSAttributes` (optional, for checking settings)

**Solution**:
1. Go to AWS IAM Console
2. Check your IAM user/role permissions
3. Ensure `sns:Publish` permission is granted

### 6. Region Configuration

**Problem**: Wrong AWS region might be configured.

**Current Setting**: `ap-south-1` (Mumbai, India)

**Verify**: Check your `.env.local` file:
```
AWS_REGION=ap-south-1
```

### 7. Check AWS CloudWatch Logs

**Solution**: Check AWS CloudWatch for detailed error logs:
1. Go to AWS CloudWatch Console
2. Navigate to **Logs** → **Log groups**
3. Look for SNS-related logs
4. Check for any delivery failures or errors

### 8. Test with AWS Console

**Solution**: Test SMS sending directly from AWS Console:
1. Go to AWS SNS Console
2. Navigate to **Text messaging (SMS)** → **Publish text message**
3. Enter the phone number: `+918668428513`
4. Enter a test message
5. Click "Publish message"
6. Check if SMS is received

If SMS works from AWS Console but not from your application:
- Check IAM permissions
- Verify environment variables
- Check application logs for errors

### 9. Carrier/Network Issues

**Problem**: Some carriers might block SMS or have delivery delays.

**Solution**:
- Try sending to a different phone number
- Check if the recipient's phone is on a different network
- Wait a few minutes (some carriers have delays)

### 10. Message Content Issues

**Problem**: Message content might trigger spam filters.

**Solution**:
- Try sending a simple test message first
- Avoid spam trigger words
- Ensure message doesn't contain URLs or special characters that might be blocked

## Quick Diagnostic Steps

1. **Check Sandbox Mode**: Most common issue
   ```
   AWS Console → SNS → Text messaging → Account preferences → Sandbox mode
   ```

2. **Check Spending Limits**: Must be > $0
   ```
   AWS Console → SNS → Text messaging → Account preferences → Spending limits
   ```

3. **Verify Phone Number Format**: Check logs
   ```
   Look for: [SMS] Attempting to send SMS to +918668428513
   ```

4. **Test from AWS Console**: Isolate the issue
   ```
   AWS Console → SNS → Text messaging → Publish text message
   ```

5. **Check CloudWatch Logs**: Detailed error information
   ```
   AWS Console → CloudWatch → Logs
   ```

## Expected Behavior

When SMS is sent successfully, you should see:
```
[SMS] Attempting to send SMS to +918668428513 (original: 8668428513)
[SMS] AWS SNS Response: { MessageId: '...', ... }
[SMS] Successfully sent SMS to +918668428513, MessageId: ...
```

If SMS is not received but logs show success:
- **99% chance**: Sandbox mode is enabled and phone number is not verified
- **1% chance**: Spending limits, carrier issues, or network delays

## Getting Help

If none of the above solutions work:
1. Check AWS SNS documentation: https://docs.aws.amazon.com/sns/
2. Check AWS Support Center for account-specific issues
3. Review CloudWatch logs for detailed error messages
4. Verify all environment variables are set correctly

