# Azure App Service Deployment Guide

## Deployment Architecture

This application uses **Next.js Standalone Mode** for deployment. The standalone build:
- Bundles everything needed (including minimal node_modules) into a self-contained package
- Requires NO dependency installation at runtime
- Uses a simple `node server.js` startup command
- Is small (~50MB) and deploys reliably

## Required Azure Configuration

### 1. Environment Variables (Application Settings)

Go to: **Azure Portal → Your App Service → Configuration → Application settings**

Add these required environment variables:

```
DATABASE_URL=postgresql://username:password@host:5432/database?sslmode=require
NEXTAUTH_SECRET=your_secret_key_here
NEXTAUTH_URL=https://your-app-name.azurewebsites.net
```

### 2. Startup Command

Go to: **Azure Portal → Your App Service → Configuration → General settings**

Set the **Startup Command** to:
```
node server.js
```

**Important**: This is the ONLY startup command needed. The standalone build includes everything.

### 3. Node Version

Ensure Node.js version is set to **20.x** or **22.x**:
- Go to: **Configuration → General settings → Stack settings**
- Stack: **Node**
- Major version: **20** or **22**

### 4. Port Configuration

Azure automatically sets the `PORT` environment variable. The Next.js standalone server uses it automatically.

## How the Deployment Works

1. GitHub Actions builds the app with `output: 'standalone'` in `next.config.js`
2. This creates `.next/standalone/` containing:
   - `server.js` - the application entry point
   - `node_modules/` - minimal dependencies needed to run
   - `.next/` - compiled application
3. We copy `public/` and `.next/static/` into the standalone folder
4. Only the standalone folder is deployed (small, self-contained)
5. Azure runs `node server.js` - no npm install, no npx, just Node.js

## Common Issues and Solutions

### Issue: "Application Error" or "502 Bad Gateway"

**Check:**
1. Startup command is exactly `node server.js`
2. DATABASE_URL environment variable is set correctly
3. Database firewall allows Azure services

### Issue: Old deployment cached

**Solution:**
1. Go to App Service → Deployment Center → Logs
2. Check the latest deployment succeeded
3. Restart the App Service
4. If still failing, try Stop → Start (not just Restart)

### Issue: "next: not found" or "npm: not found"

**This means the startup command is wrong.** Change it to:
```
node server.js
```

The standalone build doesn't need npm or npx at runtime.
- Check firewall rules in Azure PostgreSQL

## Verifying Deployment

1. Check **Log stream** in Azure Portal for errors
2. Check **Application Insights** (if enabled) for detailed logs
3. Test the health endpoint: `https://your-app.azurewebsites.net/api/health`

## Next Steps

1. Set up Azure PostgreSQL database
2. Run migrations: `npx prisma migrate deploy` (via Azure Cloud Shell or locally)
3. Seed database if needed: `npx prisma db seed`
4. Configure custom domain (optional)
5. Set up SSL certificate (automatic with Azure)
