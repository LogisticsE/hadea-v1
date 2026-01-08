# SKLMS - Sample Kit Logistics Management System

A comprehensive web application for managing laboratory sample kit shipments, from outbound delivery to sample return. Built with Next.js, TypeScript, and PostgreSQL.

## 🚀 Features

- **Order Management**: Create and manage orders with dual shipment workflows (outbound + sample return)
- **Site & Lab Management**: Manage sampling sites and destination laboratories with contacts
- **Kit Configuration**: Define reusable kit configurations with stock items
- **Stock Tracking**: Real-time inventory management with automatic allocation
- **Calendar Scheduling**: Visual calendar with smart date calculations (14-day outbound rule)
- **Document Generation**: Automated generation of labels, declarations, and invoices
- **Carrier Integration**: UPS and DHL API integration stubs for shipping
- **Proof of Delivery**: Automated POD retrieval and tracking
- **HaDEA Compliance**: Built-in compliance features for EU contracts

## 🛠️ Tech Stack

### Frontend
- **Next.js 14** with App Router
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **shadcn/ui** for UI components
- **TanStack Query** for server state
- **date-fns** for date manipulation

### Backend
- **Next.js API Routes** for REST API
- **Prisma** ORM with PostgreSQL
- **Redis** for caching and job queues
- **BullMQ** for background jobs
- **docx** for document generation

### Infrastructure
- **Docker & Docker Compose** for containerization
- **PostgreSQL 15** for database
- **Redis 7** for caching
- **MinIO** for S3-compatible object storage (optional)

## 📋 Prerequisites

- Node.js 20+ LTS
- Docker and Docker Compose
- npm or yarn

## 🏃 Quick Start

### 1. Clone the repository

```bash
git clone <repository-url>
cd sklms
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/sklms?schema=public"
REDIS_URL="redis://localhost:6379"
STORAGE_TYPE="local"
UPLOAD_DIR="./uploads"
NEXTAUTH_SECRET="your-secret-key-here"
```

### 4. Start services with Docker Compose

```bash
docker-compose up -d postgres redis
```

This starts PostgreSQL and Redis in the background.

### 5. Set up the database

```bash
# Generate Prisma Client
npm run db:generate

# Run database migrations
npm run db:migrate

# Seed the database with sample data
npm run db:seed
```

### 6. Start the development server

```bash
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000)

## 🐳 Docker Deployment

### Development

```bash
docker-compose up
```

This starts all services including the Next.js app in development mode with hot reloading.

### Production

```bash
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

## 📁 Project Structure

```
sklms/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── (dashboard)/        # Dashboard layout routes
│   │   │   ├── dashboard/      # Dashboard page
│   │   │   ├── orders/         # Orders management
│   │   │   ├── sites/          # Sites management
│   │   │   ├── labs/           # Labs management
│   │   │   ├── kits/           # Kits management
│   │   │   ├── stock/          # Stock management
│   │   │   ├── calendar/       # Calendar view
│   │   │   ├── tracking/       # Shipment tracking
│   │   │   └── settings/       # Settings
│   │   ├── api/                # API routes
│   │   │   ├── orders/
│   │   │   ├── sites/
│   │   │   ├── labs/
│   │   │   ├── kits/
│   │   │   ├── stock/
│   │   │   └── calendar/
│   │   └── page.tsx            # Landing page
│   ├── components/
│   │   ├── ui/                 # Base UI components
│   │   └── layout/             # Layout components
│   ├── lib/
│   │   ├── db/                 # Prisma client
│   │   ├── carriers/           # UPS/DHL integration
│   │   ├── documents/          # Document generation
│   │   ├── utils/              # Utility functions
│   │   └── constants/          # Constants and enums
│   └── styles/
│       └── globals.css
├── prisma/
│   ├── schema.prisma           # Database schema
│   └── seed.ts                 # Database seeding
├── docker-compose.yml
├── Dockerfile
├── package.json
└── README.md
```

## 🗄️ Database Schema

The system uses PostgreSQL with the following main entities:

- **Users**: System users with role-based access
- **Sites**: Sampling sites with contacts
- **Labs**: Destination laboratories with contacts
- **Kits**: Kit configurations with items
- **Stock Items**: Inventory items
- **Orders**: Sample kit orders
- **Shipments**: Outbound and sample shipments
- **Documents**: Generated documents (labels, declarations, invoices)
- **Tracking Events**: Carrier tracking events

## 🔑 Key Business Rules

1. **Outbound Scheduling**: Outbound shipments are scheduled 14 days before the sampling date
2. **Weekend Adjustment**: If the outbound date falls on a weekend, it moves to Monday
3. **Stock Deduction**: Kit items are deducted from stock when an order is approved
4. **Customs Documents**: Orders to non-EU destinations require packing lists and commercial invoices
5. **Non-ADR Declaration**: Requires the sample shipment waybill number

## 📚 API Documentation

### Orders API

- `GET /api/orders` - List orders
- `POST /api/orders` - Create order(s)
- `GET /api/orders/:id` - Get order details
- `PUT /api/orders/:id` - Update order
- `DELETE /api/orders/:id` - Cancel order
- `POST /api/orders/:id/approve` - Approve order

### Sites & Labs API

- `GET /api/sites` - List sites
- `POST /api/sites` - Create site
- `GET /api/sites/:id` - Get site details
- `PUT /api/sites/:id` - Update site

(Similar endpoints for labs, kits, and stock)

### Calendar API

- `GET /api/calendar?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD` - Get calendar data

## 🧪 Testing

```bash
# Run unit tests
npm test

# Run integration tests
npm run test:integration

# Run E2E tests
npm run test:e2e
```

## 🔧 Development Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run db:generate  # Generate Prisma Client
npm run db:push      # Push schema to database
npm run db:migrate   # Run migrations
npm run db:seed      # Seed database
npm run db:studio    # Open Prisma Studio
```

## 🚢 Production Deployment

1. Set environment variables for production
2. Build the Docker image: `docker build -t sklms:latest .`
3. Run with docker-compose or your orchestration tool
4. Run migrations: `docker exec sklms-app npx prisma migrate deploy`
5. (Optional) Seed initial data

## 📝 License

This project is proprietary software developed for HaDEA contract compliance.

## 👥 Team

Developed by the SKLMS Development Team

## 📞 Support

For support, please contact: support@sklms.com
