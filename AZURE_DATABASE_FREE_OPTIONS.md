# Free/Low-Cost Azure Database Options

## ⚠️ Important: You Need PostgreSQL, NOT SQL Server!

The EF-HaDEA application uses **PostgreSQL**, not SQL Server. Azure SQL Database is expensive, but PostgreSQL has free/low-cost options.

## Option 1: Azure Database for PostgreSQL - Flexible Server (FREE Tier Available!)

### Free Tier (Best for Development/Testing)

1. Go to **Azure Portal** → **Create a resource**
2. Search for: **Azure Database for PostgreSQL**
3. Click **Create**
4. Select **Flexible Server** (NOT Single Server - that's being retired)
5. In the **Basics** tab:
   - **Compute + storage**: Click "Configure server"
   - Select **Burstable** tier
   - Choose **B1ms** (1 vCore, 2GB RAM) - **This is FREE for 12 months!**
   - Storage: 32GB (minimum, ~$3/month for storage)
6. Complete the setup

**Cost:** 
- **FREE for 12 months** (Azure Free Account)
- After 12 months: ~$12-15/month for B1ms
- Storage: ~$3/month for 32GB

### Low-Cost Option (If Free Tier Not Available)

If you don't have Azure Free Account benefits:
- **B1ms Burstable**: ~$12-15/month
- **B1s Burstable**: ~$6-8/month (smaller, slower)

## Option 2: Azure Cosmos DB for PostgreSQL (Free Tier)

1. Go to **Azure Portal** → **Create a resource**
2. Search for: **Azure Cosmos DB**
3. Click **Create**
4. Select **Azure Cosmos DB for PostgreSQL**
5. Choose **Free Tier** (if available in your region)

**Cost:** FREE (with limitations)

## Option 3: Use Local PostgreSQL + Azure VPN (Advanced)

Run PostgreSQL locally and connect via VPN - **FREE** but complex setup.

## Recommended: Azure Database for PostgreSQL Flexible Server (B1ms)

### Step-by-Step Setup

1. **Create Resource:**
   - Portal → Create a resource
   - Search: "Azure Database for PostgreSQL"
   - Click **Create** → **Flexible Server**

2. **Basics Tab:**
   - **Subscription**: Your subscription
   - **Resource group**: Same as your App Service (or create new)
   - **Server name**: `hadea-postgres` (must be unique)
   - **Region**: Same as your App Service (important for performance)
   - **PostgreSQL version**: 15
   - **Workload type**: Development

3. **Compute + Storage:**
   - Click **Configure server**
   - **Compute tier**: Burstable
   - **Compute size**: **B1ms** (1 vCore, 2GB RAM)
   - **Storage**: 32GB (minimum)
   - Click **OK**

4. **Authentication:**
   - **Administrator username**: `postgresadmin` (or your choice)
   - **Password**: Create a strong password (SAVE THIS!)
   - **Confirm password**: Same password

5. **Networking Tab:**
   - **Connectivity method**: Public access
   - **Firewall rules**: 
     - ✅ Check **"Allow public access from Azure services and resources within Azure"**
     - Click **+ Add current client IP address** (for your local access)

6. **Review + Create:**
   - Review settings
   - Click **Create**
   - Wait 5-10 minutes

### Cost Breakdown

**With Azure Free Account (First 12 months):**
- Compute (B1ms): **FREE**
- Storage (32GB): ~$3/month
- **Total: ~$3/month**

**After 12 months (or without Free Account):**
- Compute (B1ms): ~$12-15/month
- Storage (32GB): ~$3/month
- **Total: ~$15-18/month**

**Even cheaper option (B1s):**
- Compute (B1s): ~$6-8/month
- Storage (32GB): ~$3/month
- **Total: ~$9-11/month**

## Why PostgreSQL, Not SQL Server?

- Your app uses **Prisma with PostgreSQL**
- Azure SQL Database (SQL Server) costs 10-20x more
- PostgreSQL has free/low-cost tiers
- PostgreSQL is open-source and widely used

## Cost Comparison

| Database | Monthly Cost | Notes |
|----------|-------------|-------|
| Azure SQL Database | €600+ | Enterprise tier, overkill |
| Azure SQL Database Basic | €4-5 | Still SQL Server, not compatible |
| **PostgreSQL B1ms** | **€3-15** | **Recommended** |
| PostgreSQL B1s | €9-11 | Smaller option |
| Cosmos DB PostgreSQL | FREE | If available |

## Getting Azure Free Account Benefits

If you're seeing high prices, you might not have Azure Free Account:

1. Check if you have Free Account: Portal → Subscriptions → Check benefits
2. Sign up for Free Account: https://azure.microsoft.com/free/
3. Free Account includes:
   - $200 credit for 30 days
   - 12 months free services (including B1ms PostgreSQL)
   - Always free services

## Quick Setup Checklist

- [ ] Create **Azure Database for PostgreSQL** (NOT SQL Server)
- [ ] Choose **Flexible Server**
- [ ] Select **B1ms Burstable** tier
- [ ] Set **32GB storage** (minimum)
- [ ] Enable **"Allow Azure services"** in firewall
- [ ] Save admin password securely
- [ ] Get connection string
- [ ] Set DATABASE_URL in App Service
- [ ] Run migrations

## Alternative: Use Existing Free Database Services

If Azure is too expensive, consider:

1. **Supabase** (PostgreSQL): Free tier available
2. **Neon** (PostgreSQL): Free tier available
3. **Railway** (PostgreSQL): Free tier available
4. **Render** (PostgreSQL): Free tier available

Then just update DATABASE_URL in Azure App Service to point to these external databases.

## Next Steps

1. Create PostgreSQL database (B1ms tier)
2. Get connection string
3. Set DATABASE_URL in App Service Configuration
4. Run migrations
5. Test the application

The key is: **PostgreSQL, not SQL Server!** And use the **Burstable B1ms** tier for the best free/low-cost option.
