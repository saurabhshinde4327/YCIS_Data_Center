# Production Deployment Setup Guide

## ⚠️ CRITICAL: Admin Panel Not Working?

If your admin panel is not opening after deployment, it's likely because **environment variables are not set** in production.

## Required Environment Variables

### 1. JWT_SECRET (CRITICAL)
```bash
JWT_SECRET=your-very-long-random-secret-key-here
```

**How to generate a secure JWT_SECRET:**
```bash
# Option 1: Using OpenSSL
openssl rand -base64 32

# Option 2: Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Option 3: Online generator (use a trusted source)
# Visit: https://randomkeygen.com/
```

### 2. Database Configuration
```bash
DB_HOST=91.108.105.168
DB_PORT=3306
DB_USER=root
DB_PASSWORD=Saurabh@2000
DB_NAME=ycis_datacenter
DB_CONN_LIMIT=10
```

### 3. Email Service (Optional)
```bash
RESEND_API_KEY=re_your_api_key_here
CONTACT_TO_EMAIL=datacenter@ycis.ac.in
CONTACT_FROM_EMAIL=contact@ycis.ac.in
```

---

## Platform-Specific Setup

### 🔷 Vercel Deployment

1. **Go to your Vercel Project Dashboard**
   - Navigate to: https://vercel.com/dashboard
   - Select your project

2. **Add Environment Variables**
   - Go to: `Settings` → `Environment Variables`
   - Click `Add New`

3. **Add each variable:**
   ```
   Key: JWT_SECRET
   Value: [Your generated secret key]
   Environment: Production
   ```

4. **Add database variables:**
   ```
   Key: DB_HOST
   Value: 91.108.105.168
   
   Key: DB_PORT
   Value: 3306
   
   Key: DB_USER
   Value: root
   
   Key: DB_PASSWORD
   Value: Saurabh@2000
   
   Key: DB_NAME
   Value: ycis_datacenter
   
   Key: DB_CONN_LIMIT
   Value: 10
   ```

5. **Redeploy**
   - Go to `Deployments` tab
   - Click on the three dots on the latest deployment
   - Select `Redeploy`
   - ✅ Or push a new commit to trigger automatic deployment

---

### 🔷 Netlify Deployment

1. **Go to Site Settings**
   - Navigate to: `Site settings` → `Build & deploy` → `Environment`

2. **Add Environment Variables**
   - Click `Edit variables`
   - Add each variable with its value

3. **Redeploy**
   - Go to `Deploys`
   - Click `Trigger deploy` → `Deploy site`

---

### 🔷 Railway Deployment

1. **Go to Project Variables**
   - Select your project
   - Go to `Variables` tab

2. **Add Environment Variables**
   - Click `+ New Variable`
   - Add each variable

3. **Automatic Redeployment**
   - Railway will automatically redeploy after adding variables

---

### 🔷 Other Platforms (Render, DigitalOcean, etc.)

1. Find the **Environment Variables** section in your platform's dashboard
2. Add all required variables
3. Redeploy the application

---

## Testing After Setup

### 1. Check if Admin Panel Loads
```
https://your-domain.com/admin
```

### 2. Try to Login
- **Email:** `shindesaurabh0321@gmail.com`
- **Password:** `Saurabh@2000`

### 3. Check Browser Console
- Open Developer Tools (F12)
- Go to Console tab
- Look for any error messages

### 4. Common Issues

#### Issue: "Failed to sign in" error
**Solution:** JWT_SECRET is not set or incorrect
- Generate a new JWT_SECRET
- Add it to environment variables
- Redeploy

#### Issue: Database connection error
**Solution:** Database credentials are incorrect or database is not accessible
- Verify DB_HOST, DB_USER, DB_PASSWORD, DB_NAME
- Check if database server allows connections from your hosting IP
- Verify MySQL server is running

#### Issue: 500 Internal Server Error
**Solution:** Check server logs
- In Vercel: Go to `Functions` tab → Click on a function → View logs
- In Netlify: Go to `Functions` → View function logs
- Look for specific error messages

---

## Security Checklist

- [ ] JWT_SECRET is at least 32 characters long
- [ ] JWT_SECRET is different from development
- [ ] Database password is strong
- [ ] Database allows connections only from your hosting IPs
- [ ] Admin credentials are secure
- [ ] HTTPS is enabled on your domain

---

## Admin Credentials

**Admin Email:** `shindesaurabh0321@gmail.com`  
**Admin Password:** `Saurabh@2000`

⚠️ **IMPORTANT:** Change these credentials in production by updating:
- `app/admin/page.tsx` (lines 20-21)
- `app/api/admin/signin/route.ts` (lines 5-6)

---

## Quick Deploy Checklist

```bash
✅ JWT_SECRET environment variable set
✅ Database credentials configured
✅ Application redeployed after setting variables
✅ Admin login page accessible at /admin
✅ Can successfully log in to admin panel
✅ Database connection working
```

---

## Need Help?

If the admin panel still doesn't work after following this guide:

1. **Check Deployment Logs**
   - Look for build errors or runtime errors

2. **Check Browser Console**
   - Open DevTools (F12) → Console
   - Look for JavaScript errors or failed API calls

3. **Test API Endpoints**
   - Try: `https://your-domain.com/api/admin/signin`
   - Should return 400 (bad request) not 404 or 500

4. **Verify Database Connection**
   - Ensure your database server is running
   - Check if your hosting platform can reach the database IP

---

## Emergency Fix

If you need to get the admin panel working immediately:

1. Set this **temporary** JWT_SECRET:
   ```
   JWT_SECRET=ycis-datacenter-temporary-secret-key-please-change-in-production-2024
   ```

2. Redeploy

3. **Remember to change it to a secure random string later!**

---

**Last Updated:** November 2025  
**Version:** 1.0

