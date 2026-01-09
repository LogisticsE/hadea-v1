# Quick Start - Run Locally in 5 Minutes

## Prerequisites Check

Make sure you have:
- ✅ Node.js 20+ installed (`node --version`)
- ✅ Docker Desktop running
- ✅ Git installed

## Quick Start Commands

Run these commands in order:

```bash
# 1. Install dependencies
npm install

# 2. Start database (PostgreSQL + Redis)
docker-compose up -d postgres redis

# 3. Wait 10 seconds for database to be ready, then set up database
npm run db:generate
npm run db:migrate
npm run db:seed

# 4. Start the app
npm run dev
```

**That's it!** Open http://localhost:3000 in your browser.

## What Each Command Does

1. **`npm install`** - Installs all Node.js packages
2. **`docker-compose up -d postgres redis`** - Starts PostgreSQL and Redis in Docker
3. **`npm run db:generate`** - Generates Prisma database client
4. **`npm run db:migrate`** - Creates all database tables
5. **`npm run db:seed`** - Adds sample data (sites, labs, kits, orders)
6. **`npm run dev`** - Starts the Next.js development server

## Verify It's Working

1. Open browser: http://localhost:3000
2. You should see the SKLMS landing page
3. Click "Go to Dashboard"
4. You should see the dashboard with sample data

## Troubleshooting

**Database connection error?**
```bash
# Check if Docker containers are running
docker ps

# Restart containers
docker-compose restart postgres
```

**Port 3000 already in use?**
```bash
# Use a different port
PORT=3001 npm run dev
```

**Module not found?**
```bash
# Reinstall dependencies
rm -rf node_modules
npm install
```

## Stop the Application

```bash
# Stop dev server: Press Ctrl+C

# Stop Docker containers
docker-compose down
```

## Next Steps

- Create your first order
- Add new sites and labs
- Configure kits
- Manage stock inventory
