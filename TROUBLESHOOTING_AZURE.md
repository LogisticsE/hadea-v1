# Azure App Service Troubleshooting Guide

## Quick Diagnostic Steps

### 1. Check Application Logs

**In Azure Portal:**
1. Go to your App Service → **Log stream** (left menu)
2. Look for errors when the app starts
3. Common errors to look for:
   - "Cannot find module"
   - "Database connection failed"
   - "Port already in use"
   - "Prisma Client not generated"

### 2. Test Health Endpoint

After deployment, try accessing:
```
https://your-app-name.azurewebsites.net/api/health
```

This will tell you:
- If the app is running
- If database connection works
- Current environment status

### 3. Test Debug Endpoint

Access:
```
https://your-app-name.azurewebsites.net/api/debug
```

This shows:
- Node.js version
- Environment variables (masked)
- Current working directory
- Platform information

## Common Issues and Solutions

### Issue 1: "Application Error" or Blank Page

**Possible Causes:**
1. **Missing Environment Variables**
   - Go to: Configuration → Application settings
   - Required variables:
     - `DATABASE_URL`
     - `NEXTAUTH_SECRET`
     - `NEXTAUTH_URL` (should be your Azure URL)
     - `NODE_ENV=production`

2. **Wrong Startup Command**
   - Go to: Configuration → General settings
   - Startup command should be:
     ```
     cd .next/standalone && npx prisma generate && node server.js
     ```
   - Or if that doesn't work:
     ```
     npx prisma generate && node .next/standalone/server.js
     ```

3. **Prisma Client Not Generated**
   - Check logs for "Cannot find module '@prisma/client'"
   - Solution: Ensure startup command includes `npx prisma generate`

### Issue 2: Database Connection Errors

**Symptoms:**
- Health endpoint returns "database: disconnected"
- Logs show connection timeout or authentication errors

**Solutions:**
1. Verify `DATABASE_URL` format:
   ```
   postgresql://user:password@host:port/database?schema=public&sslmode=require
   ```
2. Check Azure PostgreSQL firewall:
   - Allow Azure services: **Yes**
   - Add your App Service outbound IP to allowed list
3. Ensure SSL is enabled (add `?sslmode=require` to connection string)

### Issue 3: Port Binding Issues

**Symptoms:**
- App starts but immediately crashes
- Logs show "EADDRINUSE" or port errors

**Solution:**
- Next.js standalone mode automatically uses `process.env.PORT`
- Azure sets this automatically - no action needed
- If issues persist, check if another process is using the port

### Issue 4: Missing Files in Standalone Output

**Symptoms:**
- "Cannot find module" errors
- Static files not loading

**Solution:**
- Ensure `next.config.js` has `output: 'standalone'`
- Check that `.next/standalone` directory exists after build
- Verify all dependencies are in `package.json` (not just devDependencies)

## Step-by-Step Fix

### Step 1: Verify Configuration in Azure Portal

1. **Application Settings:**
   ```
   DATABASE_URL = your_postgresql_connection_string
   NEXTAUTH_SECRET = a_random_secret_string
   NEXTAUTH_URL = https://hadea-orderentry.azurewebsites.net
   NODE_ENV = production
   ```

2. **General Settings:**
   - Stack: **Node**
   - Major version: **20**
   - Startup command: `cd .next/standalone && npx prisma generate && node server.js`

### Step 2: Check Logs

1. Go to **Log stream**
2. Restart the app (Overview → Restart)
3. Watch for errors in the first 30 seconds

### Step 3: Test Endpoints

1. Try: `https://your-app.azurewebsites.net/api/debug`
   - Should return JSON with environment info
   - If this works, the app is running but might have other issues

2. Try: `https://your-app.azurewebsites.net/api/health`
   - Should return `{"status":"healthy","database":"connected"}`
   - If database is disconnected, check DATABASE_URL

### Step 4: Alternative Startup Commands

If the default startup command doesn't work, try these in order:

**Option 1:**
```
npx prisma generate && node .next/standalone/server.js
```

**Option 2:**
```
cd .next/standalone && npm install && npx prisma generate && node server.js
```

**Option 3:**
```
npm run start
```
(But this requires the full build, not standalone)

## Getting More Information

### Enable Detailed Logging

In Azure Portal → Configuration → Application settings, add:
```
NODE_ENV=production
DEBUG=*
```

### Check Application Insights

If Application Insights is enabled:
1. Go to **Application Insights** in Azure Portal
2. Check **Live Metrics** for real-time errors
3. Check **Logs** for detailed error traces

### Use Azure Cloud Shell

1. Go to Azure Portal → Cloud Shell (top bar)
2. Connect to your App Service:
   ```bash
   az webapp log tail --name hadea-orderentry --resource-group your-resource-group
   ```

## Still Not Working?

1. **Check the exact error** in Log stream
2. **Verify all environment variables** are set correctly
3. **Test the health endpoint** to see what's failing
4. **Check database connectivity** separately
5. **Verify Prisma Client** is generated (check for `node_modules/.prisma` in logs)

## Quick Test Commands

After setting up, test these URLs:
- `https://your-app.azurewebsites.net` - Main app
- `https://your-app.azurewebsites.net/api/health` - Health check
- `https://your-app.azurewebsites.net/api/debug` - Debug info
