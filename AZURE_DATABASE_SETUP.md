# Azure PostgreSQL Database Setup Guide

## Why You Need a Database

The EF-HaDEA application requires a PostgreSQL database to store:
- Orders, Sites, Labs, Kits
- Stock items and movements
- Shipments and tracking
- Documents and user data

**Without a database, the application cannot start.**

## Option 1: Create Azure Database for PostgreSQL (Recommended)

### Step 1: Create PostgreSQL Database

1. Go to **Azure Portal** → Click **+ Create a resource**
2. Search for: **Azure Database for PostgreSQL**
3. Click **Create**
4. Choose **Flexible Server** (recommended for cost-effectiveness)
5. Fill in the details:
   - **Subscription**: Your subscription
   - **Resource group**: Same as your App Service (or create new)
   - **Server name**: `hadea-postgres` (must be globally unique)
   - **Region**: Same region as your App Service
   - **PostgreSQL version**: 15
   - **Workload type**: Development
   - **Compute + storage**: Burstable, B1ms (cheapest option for dev)
   - **Administrator username**: `postgresadmin` (or your choice)
   - **Password**: Create a strong password (save this!)
6. Click **Review + create** → **Create**
7. Wait 5-10 minutes for deployment

### Step 2: Configure Firewall Rules

1. Go to your PostgreSQL server in Azure Portal
2. Click **Networking** (left menu)
3. Under **Firewall rules**:
   - Click **+ Add current client IP address** (for your local access)
   - **IMPORTANT**: Check **Allow public access from Azure services and resources within Azure**
4. Click **Save**

### Step 3: Get Connection String

1. Go to your PostgreSQL server → **Connection strings** (left menu)
2. Copy the **PostgreSQL** connection string
3. It will look like:
   ```
   postgresql://postgresadmin:YOUR_PASSWORD@hadea-postgres.postgres.database.azure.com:5432/postgres?sslmode=require
   ```
4. Replace `YOUR_PASSWORD` with the password you created
5. Replace `postgres` (last part) with your database name (or keep `postgres`)

### Step 4: Set DATABASE_URL in App Service

1. Go to your App Service (`hadea-orderentry`)
2. **Configuration** → **Application settings**
3. Find or add: **DATABASE_URL**
4. Paste your connection string
5. **IMPORTANT**: Add `?sslmode=require` at the end if not present
6. Click **Save**
7. **Restart** your App Service

### Step 5: Run Database Migrations

You need to create the database tables. You have two options:

#### Option A: Using Azure Cloud Shell (Recommended)

1. In Azure Portal, click the **Cloud Shell** icon (top bar: `>_`)
2. Select **Bash**
3. Run these commands:

```bash
# Install Prisma CLI
npm install -g prisma

# Clone your repo (or upload files)
git clone https://github.com/LogisticsE/hadea-v1.git
cd hadea-v1

# Set DATABASE_URL (replace with your actual connection string)
export DATABASE_URL="postgresql://postgresadmin:PASSWORD@hadea-postgres.postgres.database.azure.com:5432/postgres?sslmode=require"

# Install dependencies
npm install

# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate deploy

# (Optional) Seed the database
npx prisma db seed
```

#### Option B: Run Locally

1. On your local machine, set up the project:
```bash
git clone https://github.com/LogisticsE/hadea-v1.git
cd hadea-v1
npm install
```

2. Create `.env` file:
```env
DATABASE_URL="postgresql://postgresadmin:PASSWORD@hadea-postgres.postgres.database.azure.com:5432/postgres?sslmode=require"
```

3. Run migrations:
```bash
npx prisma generate
npx prisma migrate deploy
npx prisma db seed
```

## Option 2: Use Azure SQL Database (Alternative)

If you prefer SQL Server instead of PostgreSQL:

1. You'll need to change the Prisma schema from `postgresql` to `sqlserver`
2. Update connection string format
3. This requires code changes - not recommended unless you have a specific reason

## Verify Database Connection

After setting up:

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

## Cost Considerations

- **Azure Database for PostgreSQL Flexible Server (B1ms)**: ~$12-15/month
- **For development/testing**: Consider using a free tier or smaller instance
- **Alternative**: Use a local PostgreSQL and connect via VPN/tunnel (not recommended for production)

## Troubleshooting

### "Connection refused" or "Timeout"
- Check firewall rules (must allow Azure services)
- Verify connection string is correct
- Ensure SSL is enabled (`?sslmode=require`)

### "Database does not exist"
- Create a database in your PostgreSQL server:
  ```sql
  CREATE DATABASE hadea;
  ```
- Update connection string to use `hadea` instead of `postgres`

### "Authentication failed"
- Verify username and password are correct
- Check if password has special characters that need URL encoding

## Quick Checklist

- [ ] PostgreSQL server created in Azure
- [ ] Firewall rules configured (allow Azure services)
- [ ] Connection string obtained
- [ ] DATABASE_URL set in App Service Configuration
- [ ] App Service restarted
- [ ] Database migrations run (`prisma migrate deploy`)
- [ ] Database seeded (optional, `prisma db seed`)
- [ ] Health endpoint tested (`/api/health`)

## Next Steps After Database Setup

1. The application should now start successfully
2. You can access it at: `https://hadea-orderentry.azurewebsites.net`
3. Start creating sites, labs, kits, and orders!
