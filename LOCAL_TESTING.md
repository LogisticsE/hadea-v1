# Local Testing Guide

## Prerequisites

- **Node.js 20+** installed ([Download](https://nodejs.org/))
- **Docker Desktop** installed ([Download](https://www.docker.com/products/docker-desktop/))
- **Git** installed

## Step-by-Step Setup

### Step 1: Install Dependencies

Open terminal/PowerShell in the project directory:

```bash
npm install
```

### Step 2: Set Up Environment Variables

Create a `.env` file in the root directory:

```bash
# Copy the example (if it exists)
cp .env.example .env

# Or create it manually
```

Create/edit `.env` file with:

```env
# Database - Use Docker PostgreSQL (see Step 3)
DATABASE_URL="postgresql://postgres:password@localhost:5432/hadea?schema=public"

# Redis (optional for now)
REDIS_URL="redis://localhost:6379"

# File Storage
STORAGE_TYPE="local"
UPLOAD_DIR="./uploads"

# NextAuth (generate a random secret)
NEXTAUTH_SECRET="your-random-secret-key-here-change-this"
NEXTAUTH_URL="http://localhost:3000"

# Node Environment
NODE_ENV="development"
```

**To generate a random secret:**
```bash
# On Windows PowerShell:
[Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes((New-Guid).ToString()))

# On Mac/Linux:
openssl rand -base64 32
```

### Step 3: Start Database with Docker

Start PostgreSQL and Redis using Docker Compose:

```bash
docker-compose up -d postgres redis
```

This will:
- Start PostgreSQL on port 5432
- Start Redis on port 6379
- Create the database automatically

**Verify it's running:**
```bash
docker ps
```
You should see `hadea-postgres` and `hadea-redis` containers running.

### Step 4: Set Up Database Schema

Generate Prisma Client and create database tables:

```bash
# Generate Prisma Client
npm run db:generate

# Create database tables (migrations)
npm run db:migrate

# (Optional) Add sample data
npm run db:seed
```

### Step 5: Start Development Server

```bash
npm run dev
```

You should see:
```
▲ Next.js 14.1.0
- Local:        http://localhost:3000
✓ Ready in X seconds
```

### Step 6: Open in Browser

Open your browser and go to:
```
http://localhost:3000
```

## Testing the Application

### 1. Home Page
- Visit: `http://localhost:3000`
- Should show the EF-HaDEA landing page

### 2. Dashboard
- Visit: `http://localhost:3000/dashboard`
- Should show the dashboard with statistics

### 3. Test API Endpoints

**Health Check:**
```
http://localhost:3000/api/health
```
Should return: `{"status":"healthy","database":"connected"}`

**Debug Info:**
```
http://localhost:3000/api/debug
```
Shows environment information

### 4. Create Test Data

If you ran `npm run db:seed`, you should have:
- 5 sample sites
- 2 laboratories
- 9 stock items
- 2 kits
- 4 sample orders

You can now:
- View orders at `/orders`
- View sites at `/sites`
- View labs at `/labs`
- View kits at `/kits`
- View stock at `/stock`
- View calendar at `/calendar`

## Common Issues

### Issue: "Cannot connect to database"

**Solution:**
1. Check Docker is running: `docker ps`
2. Verify PostgreSQL container is up: `docker ps | grep postgres`
3. Check DATABASE_URL in `.env` matches Docker settings
4. Restart containers: `docker-compose restart postgres`

### Issue: "Port 3000 already in use"

**Solution:**
```bash
# Find what's using port 3000
# Windows:
netstat -ano | findstr :3000

# Mac/Linux:
lsof -i :3000

# Kill the process or change port in package.json
```

Or use a different port:
```bash
PORT=3001 npm run dev
```

### Issue: "Prisma Client not generated"

**Solution:**
```bash
npm run db:generate
```

### Issue: "Module not found" errors

**Solution:**
```bash
# Delete node_modules and reinstall
rm -rf node_modules
npm install
```

## Useful Commands

```bash
# Start development server
npm run dev

# Build for production (local test)
npm run build
npm start

# Database commands
npm run db:generate    # Generate Prisma Client
npm run db:migrate     # Run migrations
npm run db:seed        # Seed sample data
npm run db:studio      # Open Prisma Studio (database GUI)

# View database in browser
npm run db:studio
# Opens at http://localhost:5555

# Stop Docker containers
docker-compose down

# View logs
docker-compose logs postgres
docker-compose logs redis
```

## Testing Workflow

1. **Start services:**
   ```bash
   docker-compose up -d
   ```

2. **Set up database:**
   ```bash
   npm run db:generate
   npm run db:migrate
   npm run db:seed
   ```

3. **Start app:**
   ```bash
   npm run dev
   ```

4. **Test in browser:**
   - Open `http://localhost:3000`
   - Navigate through the app
   - Create test orders, sites, labs, etc.

5. **Stop when done:**
   ```bash
   # Stop the dev server: Ctrl+C
   # Stop Docker containers:
   docker-compose down
   ```

## Quick Test Checklist

- [ ] Dependencies installed (`npm install`)
- [ ] `.env` file created with DATABASE_URL
- [ ] Docker containers running (`docker ps`)
- [ ] Database schema created (`npm run db:migrate`)
- [ ] Sample data seeded (`npm run db:seed`)
- [ ] Dev server running (`npm run dev`)
- [ ] Can access `http://localhost:3000`
- [ ] Health endpoint works (`/api/health`)
- [ ] Can view dashboard
- [ ] Can create/view orders

## Next Steps

Once local testing works:
1. Test all features (create orders, sites, labs, etc.)
2. Verify data persists in database
3. Test the calendar view
4. Test stock management
5. Then deploy to Azure with confidence!
