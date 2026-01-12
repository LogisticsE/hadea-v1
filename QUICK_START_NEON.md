# Quick Start: Neon.tech Setup (5 minutes)

## 1. Create Neon Database

1. Go to [neon.tech](https://neon.tech) → Sign up with GitHub
2. Click **"Create Project"**
3. Name: `hadea-orderentry`
4. Region: Choose closest (e.g., `eu-central-1`)
5. Click **"Create Project"**

## 2. Get Connection String

After creation, you'll see:
```
Connection string: postgresql://user:pass@ep-xxx.region.aws.neon.tech/dbname?sslmode=require
```

**IMPORTANT**: Click **"Pooled connection"** tab and copy that string (better for Vercel/serverless)

## 3. Update .env File

```env
DATABASE_URL="postgresql://user:pass@ep-xxx.region.aws.neon.tech/dbname?sslmode=require"
NEXTAUTH_SECRET="k8X9mP2vL4nQ7wR3jY6tF0hB5cA1dE8gI"
NEXTAUTH_URL="http://localhost:3000"
```

## 4. Run Migrations

```bash
# Generate Prisma Client
npm run db:generate

# Create and apply database schema
npm run db:migrate
```

This creates all tables in your Neon database.

## 5. Seed Database (Optional)

```bash
npm run db:seed
```

Adds sample data for testing.

## 6. Test Locally

```bash
npm run dev
```

Visit: http://localhost:3000

## 7. Update Vercel

1. Vercel Dashboard → Settings → Environment Variables
2. Update `DATABASE_URL` with your Neon connection string
3. Redeploy

## Done! ✅

Your database is now on Neon.tech and ready to use.

For detailed instructions, see [NEON_MIGRATION.md](./NEON_MIGRATION.md)
