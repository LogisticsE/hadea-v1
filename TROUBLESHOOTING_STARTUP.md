# Troubleshooting Azure Application Startup Errors

## Quick Diagnostic Steps

### 1. Check Log Stream in Azure Portal

Go to: **Azure Portal → App Service → Log stream**

Look for:
- ✅ `npm run db:generate` completing successfully
- ✅ `npm start` starting
- ✅ Next.js server starting on port 8080 (or PORT env var)
- ❌ Any error messages

### 2. Test Diagnostic Endpoints

After deployment, try these URLs:

- **Startup Check**: `https://hadea-orderentry.azurewebsites.net/api/startup`
  - Shows environment variables (without exposing secrets)
  - Shows Prisma connection status
  - Shows Node.js version

- **Health Check**: `https://hadea-orderentry.azurewebsites.net/api/health`
  - Tests database connection
  - Returns health status

### 3. Common Issues and Fixes

#### Issue: "Container did not start within expected time limit"

**Possible Causes:**
1. **Prisma generation taking too long**
   - Solution: Already fixed - Prisma generates during build, not startup
   
2. **Database connection timeout during startup**
   - Solution: Prisma client is lazy-loaded, shouldn't connect at startup
   - Check: `/api/startup` endpoint to see if DATABASE_URL is set

3. **Missing environment variables**
   - Solution: Verify all required env vars in Azure Portal
   - Required: `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `NODE_ENV`

4. **Port binding issue**
   - Solution: Next.js automatically uses `PORT` env var (Azure sets this to 8080)
   - Check: `/api/startup` shows PORT value

5. **Node modules not installed**
   - Solution: `scm-do-build-during-deployment: true` should handle this
   - Check logs for `npm install` completion

#### Issue: "Application Error" or blank page

**Possible Causes:**
1. **Prisma Client not generated**
   - Check logs for: `npm run db:generate` success
   - Verify: `node_modules/.prisma/client` exists in deployment

2. **Database connection string incorrect**
   - Check: `/api/startup` endpoint
   - Verify: DATABASE_URL format is correct (URL-encoded)
   - Format: `postgresql://USERNAME:PASSWORD@HOST:PORT/DATABASE?sslmode=require`

3. **Missing build output**
   - Check: `.next` directory exists in deployment
   - Verify: Build completed successfully in GitHub Actions

### 4. Manual Verification Steps

#### Step 1: Check Environment Variables

In Azure Portal → Configuration → Application settings, verify:

```
DATABASE_URL=postgresql://... (should be set)
NEXTAUTH_SECRET=... (should be set)
NEXTAUTH_URL=https://hadea-orderentry.azurewebsites.net
NODE_ENV=production
PORT=8080 (automatically set by Azure)
```

#### Step 2: Check Startup Command

In Azure Portal → Configuration → General settings:

```
Startup Command: npm run db:generate && npm start
```

#### Step 3: Check Logs

Look for these in the log stream:

```
✓ npm run db:generate completed
✓ npm start
✓ Ready on http://localhost:8080
```

#### Step 4: Test Endpoints

1. Try: `https://hadea-orderentry.azurewebsites.net/api/startup`
   - Should return JSON with environment info
   - Check if DATABASE_URL is "set" (not "not set")

2. Try: `https://hadea-orderentry.azurewebsites.net/api/health`
   - Should return health status
   - If database error, check connection string

3. Try: `https://hadea-orderentry.azurewebsites.net`
   - Should show landing page or dashboard

### 5. If Still Not Working

1. **Check GitHub Actions build logs**
   - Verify build completed successfully
   - Check for any warnings about Prisma

2. **Check Azure deployment logs**
   - Go to: Deployment Center → Logs
   - Look for deployment errors

3. **Restart App Service**
   - Sometimes a restart fixes transient issues
   - Azure Portal → Overview → Restart

4. **Check App Service Plan**
   - Free/Shared plans have limitations
   - Consider upgrading if needed

### 6. Enable Detailed Logging

Add to Application Settings:

```
NODE_ENV=production
DEBUG=*
```

This will show more detailed logs (remove after troubleshooting).
