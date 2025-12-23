# Fast2SMS Pricing Information

## Understanding SMS Costs

### Standard Pricing Tiers

Fast2SMS pricing depends on your wallet balance:

| Wallet Balance Range | Cost Per SMS |
|---------------------|--------------|
| ₹100 - ₹3,999 | ₹0.25 per SMS |
| ₹4,000 - ₹7,999 | ₹0.21 per SMS |
| ₹8,000 - ₹14,999 | ₹0.18 per SMS |
| ₹15,000+ | ₹0.15 per SMS |

### Cost Calculation Example

If you see:
- **Deducted**: ₹5.00
- **Shown**: ₹0.25 per SMS

**Calculation**: ₹5.00 ÷ ₹0.25 = **20 SMS sent**

This means 20 SMS messages were successfully sent, and each cost ₹0.25.

### Why You Might See Different Costs

1. **Multiple SMS**: If you sent SMS to multiple students, the total cost accumulates
   - Example: 20 students × ₹0.25 = ₹5.00

2. **Long Messages**: Messages longer than 160 characters are split into multiple SMS
   - Example: A 320-character message = 2 SMS = ₹0.50

3. **Pricing Tier**: Your wallet balance determines the per-SMS rate
   - Lower balance = Higher per-SMS cost
   - Higher balance = Lower per-SMS cost

4. **Route Type**: 
   - Promotional route ('q') = ₹0.25 per SMS
   - Transactional route ('t') = May have different pricing

### How to Check Actual Cost

1. **Fast2SMS Dashboard**:
   - Log in to https://www.fast2sms.com/
   - Go to "Reports" or "Transaction History"
   - Check individual SMS costs and total deductions

2. **Application Logs**:
   - Check the console logs when sending SMS
   - Look for `[SMS] Cost:` entries
   - Summary shows estimated total cost

3. **Database Logs**:
   - Check the SMS logs in your database
   - Count successful sends to calculate total

### Current Application Settings

- **Route**: 'q' (Promotional)
- **Estimated Cost**: ₹0.25 per SMS (for wallet ₹100-₹3,999)
- **Sender ID**: YCIS-SATARA

### Tips to Reduce Costs

1. **Recharge Higher Amounts**: Higher wallet balance = lower per-SMS cost
2. **Use Transactional Route**: If applicable, use route 't' for transactional messages
3. **Optimize Message Length**: Keep messages under 160 characters to avoid multiple SMS charges
4. **Batch Sending**: Send during off-peak hours if Fast2SMS offers discounts

### Need Help?

- **Fast2SMS Support**: https://www.fast2sms.com/help/
- **Check Transaction History**: Fast2SMS Dashboard → Reports
- **Contact Support**: If deductions don't match expected costs

---

**Note**: The application shows estimated costs. Always check your Fast2SMS dashboard for actual deductions and transaction details.

