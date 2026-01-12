# Vercel Deployment Guide

## Quick Setup (5 minutes)

1. **Go to [vercel.com](https://vercel.com)**
   - Sign up with your GitHub account

2. **Import Project**
   - Click "Add New Project"
   - Select repository: `LogisticsE/hadea-v1`
   - Branch: `main`

3. **Configure Environment Variables** ⚠️ **CRITICAL**
   Click "Environment Variables" and add **BEFORE deploying**:
   
   ```
   DATABASE_URL=postgresql://Y2ZA%40etbnl.eurofins.com:MercuriusELB_GM22%21@hadea-db.postgres.database.azure.com:5432/postgres?sslmode=require
   NEXTAUTH_SECRET=k8X9mP2vL4nQ7wR3jY6tF0hB5cA1dE8gI
   NEXTAUTH_URL=https://your-app-name.vercel.app
   ```
   
   **IMPORTANT**: 
   - Add `DATABASE_URL` **FIRST** - it's required during build
   - Make sure to check "Production", "Preview", and "Development" for all variables
   - Vercel will give you the URL after first deployment - update `NEXTAUTH_URL` then

4. **Deploy**
   - Click "Deploy"
   - Wait 2-3 minutes
   - Done! ✅

## After First Deployment

1. Copy your Vercel URL (e.g., `https://hadea-v1.vercel.app`)
2. Go to **Settings** → **Environment Variables**
3. Update `NEXTAUTH_URL` to your actual Vercel URL
4. Redeploy (or it will auto-redeploy on next push)

## Automatic Deployments

- Every push to `main` branch = automatic deployment
- Preview deployments for pull requests
- Zero configuration needed

## Prisma Database

Your Azure PostgreSQL database will work perfectly with Vercel. Just make sure:
- Database firewall allows Vercel IPs (or use connection pooling)
- `DATABASE_URL` is set correctly in Vercel environment variables

## That's It!

No startup commands, no BUILD_ID issues, no Oryx problems. Vercel just works. 🎉
