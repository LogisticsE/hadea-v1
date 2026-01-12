# Migration to Neon.tech - Complete Guide

## What is Neon.tech?

Neon is a serverless PostgreSQL database that's perfect for Next.js applications. It offers:
- **Free tier** with 0.5GB storage
- **Automatic scaling**
- **Branching** (like Git for databases)
- **No server management**
- **Works perfectly with Prisma**

## Step 1: Create Neon Database

1. **Sign up at [neon.tech](https://neon.tech)**
   - Use GitHub to sign up (easiest)
   - Free tier is perfect for testing

2. **Create a new project**
   - Click "Create Project"
   - Name: `hadea-orderentry` (or any name)
   - Region: Choose closest to you (e.g., `eu-central-1` for Europe)
   - PostgreSQL version: `15` or `16` (both work)

3. **Get your connection string**
   - After project creation, you'll see a connection string like:
   ```
   postgresql://username:password@ep-xxx-xxx.region.aws.neon.tech/dbname?sslmode=require
   ```
   - **Copy this immediately** - you'll need it!

## Step 2: Update Environment Variables

### For Local Development (.env file):

```env
DATABASE_URL="postgresql://username:password@ep-xxx-xxx.region.aws.neon.tech/dbname?sslmode=require"
NEXTAUTH_SECRET="k8X9mP2vL4nQ7wR3jY6tF0hB5cA1dE8gI"
NEXTAUTH_URL="http://localhost:3000"
```

### For Vercel:

1. Go to **Vercel Dashboard** → Your Project → **Settings** → **Environment Variables**
2. Update `DATABASE_URL` with your Neon connection string
3. Make sure it's enabled for **Production**, **Preview**, and **Development**

## Step 3: Run Database Migrations

### Option A: Using Prisma Migrate (Recommended)

```bash
# Generate Prisma Client
npm run db:generate

# Create and apply migration
npm run db:migrate

# This will:
# 1. Create a migration file in prisma/migrations/
# 2. Apply it to your Neon database
# 3. Generate Prisma Client
```

### Option B: Using Prisma Push (Quick for testing)

```bash
# This pushes schema directly without creating migration files
npm run db:push
```

**Note**: `db:push` is faster for development but `db:migrate` is better for production.

## Step 4: Seed the Database (Optional)

```bash
# Add sample data
npm run db:seed
```

This will populate your database with:
- Sample sites
- Sample labs
- Sample kits
- Sample stock items
- Sample orders

## Step 5: Verify Connection

### Using Prisma Studio:

```bash
npm run db:studio
```

This opens a visual database browser at `http://localhost:5555`

### Using a test query:

Create a test file or use the API:

```bash
# Start dev server
npm run dev

# Visit http://localhost:3000/api/health
# Should return: {"status":"healthy","database":"connected"}
```

## Step 6: Update Vercel Deployment

1. **Update Vercel Environment Variables**:
   - Go to Vercel → Settings → Environment Variables
   - Update `DATABASE_URL` with your Neon connection string
   - Save

2. **Redeploy**:
   - Go to Deployments
   - Click "Redeploy" on latest deployment
   - Or push a new commit to trigger auto-deploy

## Neon Connection String Format

Neon connection strings look like:
```
postgresql://[user]:[password]@[hostname]/[database]?sslmode=require
```

Example:
```
postgresql://neondb_owner:npg_xxx@ep-cool-darkness-123456.eu-central-1.aws.neon.tech/neondb?sslmode=require
```

## Important Notes

### Connection Pooling

Neon supports connection pooling. For serverless (Vercel), use the **pooled connection string**:

1. In Neon dashboard, go to **Connection Details**
2. Select **Pooled connection** (not Direct connection)
3. Copy that connection string
4. Use it in your `DATABASE_URL`

### Branching (Advanced)

Neon supports database branching (like Git):
- Create branches for testing
- Merge branches
- Perfect for development workflows

### Free Tier Limits

- **Storage**: 0.5 GB
- **Compute**: 0.25 vCPU
- **Perfect for development and small apps**

## Troubleshooting

### "Connection refused" or "Timeout"

- Check your connection string is correct
- Make sure you're using the **pooled connection** for Vercel
- Verify SSL mode: `?sslmode=require`

### "Schema not found"

- Run migrations: `npm run db:migrate`
- Or push schema: `npm run db:push`

### "Prisma Client not generated"

```bash
npm run db:generate
```

## Migration from Azure PostgreSQL

If you have data in Azure PostgreSQL:

1. **Export data** (if needed):
   ```bash
   pg_dump -h hadea-db.postgres.database.azure.com -U username -d postgres > backup.sql
   ```

2. **Import to Neon**:
   ```bash
   psql "your-neon-connection-string" < backup.sql
   ```

3. **Update connection strings** everywhere

## Next Steps

1. ✅ Create Neon database
2. ✅ Update `DATABASE_URL` in `.env` and Vercel
3. ✅ Run migrations: `npm run db:migrate`
4. ✅ Seed database: `npm run db:seed` (optional)
5. ✅ Test locally: `npm run dev`
6. ✅ Deploy to Vercel

That's it! Your app is now running on Neon.tech 🎉
