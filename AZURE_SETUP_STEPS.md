# Azure Setup Steps - Complete Guide

## Current Status
✅ PostgreSQL database created ($19/month)
⏳ Database deploying...
⏳ Firewall rules need to be configured
⏳ App Service needs DATABASE_URL
⏳ Schema needs to be migrated

## Step-by-Step Setup (In Order)

### Step 1: Configure Firewall Rules (CRITICAL!)

**Why:** Without firewall rules, your App Service cannot connect to the database.

1. Go to your PostgreSQL server in Azure Portal
2. Click **Networking** (left menu)
3. Under **Firewall rules**:
   - ✅ **IMPORTANT**: Check **"Allow public access from Azure services and resources within Azure"**
     - This allows your App Service to connect
   - (Optional) Click **"+ Add current client IP address"** if you want to connect from your local machine
4. Click **Save**
5. Wait for the rule to be applied

**Without this step, your app will NOT be able to connect!**

### Step 2: Get Connection String

1. Go to your PostgreSQL server → **Connection strings** (left menu)
2. Find the **PostgreSQL** connection string
3. It will look like:
   ```
   postgresql://postgresadmin:YOUR_PASSWORD@hadea-db.postgres.database.azure.com:5432/postgres?sslmode=require
   ```
4. **Copy this entire string**
5. **Replace `YOUR_PASSWORD`** with the actual password you set when creating the database
6. **Important**: Make sure `?sslmode=require` is at the end (required for Azure)

### Step 3: Set DATABASE_URL in App Service

1. Go to your App Service (`hadea-orderentry`) in Azure Portal
2. Click **Configuration** (left menu)
3. Click **Application settings** tab
4. Click **+ New application setting**
5. Add:
   - **Name**: `DATABASE_URL`
   - **Value**: Paste your connection string (with password replaced)
6. Click **OK**
7. Click **Save** at the top
8. When prompted "Save changes to web app configuration?", click **Continue**
9. **Restart** your App Service (Overview → Restart)

### Step 4: Verify Other Environment Variables

While in **Configuration → Application settings**, verify these are set:

- ✅ `DATABASE_URL` (just added)
- ✅ `NEXTAUTH_SECRET` (should be a random string)
- ✅ `NEXTAUTH_URL` (should be `https://hadea-orderentry.azurewebsites.net`)
- ✅ `NODE_ENV` (should be `production`)

If any are missing, add them now.

### Step 5: Run Database Migrations

You need to create the database tables. You have two options:

#### Option A: Using Azure Cloud Shell (Recommended)

1. In Azure Portal, click the **Cloud Shell** icon (top bar: `>_`)
2. Select **Bash** (not PowerShell)
3. Run these commands:

```bash
# Clone your repository
git clone https://github.com/LogisticsE/hadea-v1.git
cd hadea-v1

# Install Node.js and npm (if not already installed)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install dependencies
npm install

# Set DATABASE_URL (replace with your actual connection string)
export DATABASE_URL="postgresql://postgresadmin:YOUR_PASSWORD@hadea-db.postgres.database.azure.com:5432/postgres?sslmode=require"

# Generate Prisma Client
npx prisma generate

# Run migrations (creates all tables)
npx prisma migrate deploy

# (Optional) Seed with sample data
npx prisma db seed
```

#### Option B: Run Locally (Easier)

1. On your local machine, open terminal in the project directory
2. Create/update `.env` file with your Azure database connection string:
   ```env
   DATABASE_URL="postgresql://postgresadmin:YOUR_PASSWORD@hadea-db.postgres.database.azure.com:5432/postgres?sslmode=require"
   ```
3. Run:
   ```bash
   npm install
   npx prisma generate
   npx prisma migrate deploy
   npx prisma db seed  # Optional: adds sample data
   ```

**Note:** For Option B, you need to add your local IP to the firewall rules first (Step 1).

### Step 6: Verify Connection

1. Test the health endpoint:
   ```
   https://hadea-orderentry.azurewebsites.net/api/health
   ```
   Should return: `{"status":"healthy","database":"connected"}`

2. Test the debug endpoint:
   ```
   https://hadea-orderentry.azurewebsites.net/api/debug
   ```
   Should show `DATABASE_URL: ***SET***`

3. Try accessing the app:
   ```
   https://hadea-orderentry.azurewebsites.net
   ```

## Complete Checklist

- [ ] Step 1: Firewall rules configured (allow Azure services)
- [ ] Step 2: Connection string obtained
- [ ] Step 3: DATABASE_URL set in App Service
- [ ] Step 4: Other environment variables verified
- [ ] Step 5: Database migrations run (`prisma migrate deploy`)
- [ ] Step 6: Database seeded (optional, `prisma db seed`)
- [ ] Step 7: App Service restarted
- [ ] Step 8: Health endpoint tested
- [ ] Step 9: Application accessible

## Troubleshooting

### "Connection refused" or "Timeout"
- ✅ Check firewall rules (Step 1) - must allow Azure services
- ✅ Verify connection string is correct
- ✅ Ensure `?sslmode=require` is in connection string
- ✅ Check database server is fully deployed (not still deploying)

### "Database does not exist"
- The connection string uses `postgres` database by default
- This is fine - Prisma will create tables in the `public` schema
- If you want a separate database, create it first:
  ```sql
  CREATE DATABASE sklms;
  ```
  Then update connection string to use `sklms` instead of `postgres`

### "Authentication failed"
- Verify username and password are correct
- Check if password has special characters that need URL encoding
- Try resetting the password in Azure Portal if needed

### App still shows errors
- Check **Log stream** in App Service for specific errors
- Verify all environment variables are set
- Ensure app was restarted after setting DATABASE_URL

## Next Steps After Setup

Once everything is working:
1. ✅ Application should load at your Azure URL
2. ✅ You can create sites, labs, kits, and orders
3. ✅ All data will be stored in your PostgreSQL database
4. ✅ You can view data using Prisma Studio locally:
   ```bash
   npx prisma studio
   ```

## Quick Reference: Connection String Format

```
postgresql://USERNAME:PASSWORD@SERVER.postgres.database.azure.com:5432/DATABASE?sslmode=require
```

Example:
```
postgresql://postgresadmin:MyPassword123@hadea-db.postgres.database.azure.com:5432/postgres?sslmode=require
```

**Important Notes:**
- Replace `USERNAME` with your admin username
- Replace `PASSWORD` with your actual password
- Replace `SERVER` with your server name (hadea-db)
- Keep `?sslmode=require` at the end (required for Azure)
