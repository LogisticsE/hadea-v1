# Azure App Service Deployment Guide

## Required Azure Configuration

After deploying, you **must** configure these settings in the Azure Portal:

### 1. Environment Variables (Application Settings)

Go to: **Azure Portal → Your App Service → Configuration → Application settings**

Add these required environment variables:

```
DATABASE_URL=your_postgresql_connection_string
NEXTAUTH_SECRET=your_secret_key_here
NEXTAUTH_URL=https://your-app-name.azurewebsites.net
REDIS_URL=your_redis_connection_string (optional)
STORAGE_TYPE=local
UPLOAD_DIR=./uploads
```

### 2. Startup Command

Go to: **Azure Portal → Your App Service → Configuration → General settings**

Set the **Startup Command** to:
```
npx prisma generate && node .next/standalone/server.js
```

Or if you prefer a simpler approach:
```
node .next/standalone/server.js
```
(But make sure Prisma Client is generated during deployment)

### 3. Node Version

Ensure Node.js version is set to **20.x**:
- Go to: **Configuration → General settings → Stack settings**
- Stack: **Node**
- Major version: **20**

### 4. Port Configuration

Azure automatically sets the `PORT` environment variable. The Next.js standalone server will use it automatically.

## Common Issues and Solutions

### Issue: "Application Error" or "502 Bad Gateway"

**Possible causes:**
1. **Missing environment variables** - Check Application Settings
2. **Prisma Client not generated** - Ensure startup command includes `npx prisma generate`
3. **Database connection failed** - Verify DATABASE_URL is correct
4. **Port binding issue** - Next.js standalone should handle this automatically

### Issue: "Cannot find module '@prisma/client'"

**Solution:** The startup command must generate Prisma Client:
```
npx prisma generate && node .next/standalone/server.js
```

### Issue: Database connection errors

**Solution:** 
- Verify DATABASE_URL format: `postgresql://user:password@host:port/database?schema=public`
- Ensure your Azure PostgreSQL allows connections from App Service
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
