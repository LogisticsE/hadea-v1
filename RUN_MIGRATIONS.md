# Run Database Migrations - Quick Guide

## Step 1: Run Migrations Locally (Easiest Method)

### Prerequisites
- Your local machine has the project code
- You have Node.js installed
- Your local IP is added to PostgreSQL firewall (or you're using a VPN)

### Steps

1. **Open terminal in your project directory:**
   ```bash
   cd c:\hadea-orderentry
   ```

2. **Update .env file with your Azure database:**
   Create or edit `.env` file:
   ```env
   DATABASE_URL="postgresql://postgresadmin:YOUR_PASSWORD@hadea-db.postgres.database.azure.com:5432/postgres?sslmode=require"
   ```
   (Replace `YOUR_PASSWORD` with your actual password)

3. **Add your IP to firewall (if not already done):**
   - Go to PostgreSQL server → Networking
   - Click "+ Add current client IP address"
   - Save

4. **Run migrations:**
   ```bash
   npm install
   npx prisma generate
   npx prisma migrate deploy
   ```

5. **Optional: Add sample data:**
   ```bash
   npx prisma db seed
   ```

## Step 2: Verify Migrations Worked

After running migrations, you should see:
- ✅ All tables created successfully
- ✅ No errors

## Step 3: Restart App Service

1. Go to Azure Portal → Your App Service
2. Click **Overview** → **Restart**
3. Wait 1-2 minutes for restart

## Step 4: Test the Application

1. **Health check:**
   ```
   https://hadea-orderentry.azurewebsites.net/api/health
   ```
   Should return: `{"status":"healthy","database":"connected"}`

2. **Main application:**
   ```
   https://hadea-orderentry.azurewebsites.net
   ```
   Should load the EF-HaDEA application!

## Alternative: Run Migrations via Azure Cloud Shell

If you can't run locally:

1. Azure Portal → Click **Cloud Shell** icon (top bar: `>_`)
2. Select **Bash**
3. Run:
   ```bash
   git clone https://github.com/LogisticsE/hadea-v1.git
   cd hadea-v1
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt-get install -y nodejs
   npm install
   export DATABASE_URL="postgresql://postgresadmin:YOUR_PASSWORD@hadea-db.postgres.database.azure.com:5432/postgres?sslmode=require"
   npx prisma generate
   npx prisma migrate deploy
   npx prisma db seed
   ```

## Troubleshooting

**"Connection refused" when running locally?**
- Add your IP to firewall rules in Azure Portal
- Or use Cloud Shell method instead

**"Migration failed"?**
- Check DATABASE_URL is correct
- Verify firewall allows your IP
- Check database server is fully deployed

**"Prisma Client not found"?**
- Run `npx prisma generate` first
