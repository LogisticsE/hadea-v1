# Technical Specification Document
## Sample Kit Logistics Management System (SKLMS)

**Version:** 1.0  
**Date:** January 8, 2026  
**Status:** Development Specification  
**Prepared for:** Development Team Handover

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Project Overview](#2-project-overview)
3. [System Architecture](#3-system-architecture)
4. [Technology Stack](#4-technology-stack)
5. [Database Design](#5-database-design)
6. [API Design](#6-api-design)
7. [Frontend Design](#7-frontend-design)
8. [Core Features & Modules](#8-core-features--modules)
9. [Document Generation System](#9-document-generation-system)
10. [Background Processes & Automation](#10-background-processes--automation)
11. [External API Integrations](#11-external-api-integrations)
12. [Security Requirements](#12-security-requirements)
13. [Deployment Strategy](#13-deployment-strategy)
14. [Testing Strategy](#14-testing-strategy)
15. [Appendices](#15-appendices)

---

## 1. Executive Summary

### 1.1 Purpose
This document provides comprehensive technical specifications for the development of a Sample Kit Logistics Management System (SKLMS). The system manages the complete lifecycle of laboratory sample kits, including outbound shipments to sampling sites and return sample shipments to laboratories.

### 1.2 Business Context
The system serves organizations that coordinate regular sampling activities across multiple sites (tied to HaDEA contracts). Sites receive sample kits (outbound shipments) prior to their scheduled sampling dates, perform sampling, and return completed samples to designated laboratories (sample shipments). The system handles scheduling, document generation, carrier integration (UPS/DHL), and comprehensive tracking.

### 1.3 Key Objectives
- Centralized order management for dual-shipment workflows (outbound + sample)
- Automated document generation (labels, declarations, invoices)
- Integration with UPS and DHL shipping APIs
- Calendar-based scheduling with smart date calculations
- Comprehensive tracking and proof of delivery management
- Stock/inventory management for kit components
- HaDEA compliance and documentation

### 1.4 Document Scope
This specification covers:
- Complete database schema design
- REST API endpoint specifications
- Frontend component architecture
- Document generation templates and logic
- Carrier API integration patterns
- Background job processing
- Deployment and infrastructure

---

## 2. Project Overview

### 2.1 System Scope

| Area | Description |
|------|-------------|
| Order Management | Create, schedule, and manage orders with dual shipment streams |
| Site Management | Manage sampling sites, contacts, and site-specific data |
| Lab Management | Manage destination laboratories, contacts, and receiving capabilities |
| Kit Management | Define kit configurations, components, dimensions, and weights |
| Stock Management | Track warehouse inventory, auto-decrement on shipments |
| Document Generation | Auto-generate shipping labels, content labels, declarations, invoices |
| Carrier Integration | UPS and DHL API integration for label creation and tracking |
| Calendar/Scheduling | Visual calendar interface with workload indicators |
| Dashboard | Overview of daily operations, workload, and key metrics |
| Reference Data | Configuration for document templates, carrier settings |

### 2.2 User Roles

| Role | Permissions |
|------|-------------|
| Administrator | Full system access, settings, reference data management |
| Operations Manager | Order creation, site/lab management, calendar management |
| Warehouse Operator | Order processing, label printing, stock updates |
| Viewer | Read-only access to orders, tracking, reports |

### 2.3 Core Business Workflow

```
[Sampling Plan Created]
         ↓
[Outbound Shipment Scheduled - 14 days before sampling]
    (If weekend → Monday)
         ↓
[Outbound Documents Generated]
    - Box Content Label (Outbound)
    - Shipping Label (UPS/DHL)
    - Non-ADR Declaration (requires sample waybill number)
         ↓
[Outbound Kit Shipped via UPS/DHL]
         ↓
[Kit Delivered to Site - POD Retrieved]
         ↓
[Sampling Performed at Site]
         ↓
[Sample Shipment Prepared]
    - Box Content Label (Sample)
    - Shipping Label (UPS/DHL)
    - For Non-EU: Packing List, Commercial Invoice
         ↓
[Sample Kit Shipped to Lab via UPS/DHL]
         ↓
[Sample Delivered to Lab - POD Retrieved]
         ↓
[Order Completed]
```

### 2.4 Key Business Rules

1. **Outbound Scheduling**: Outbound shipments are scheduled 14 calendar days before the sampling date
2. **Weekend Adjustment**: If the calculated outbound date falls on Saturday or Sunday, it moves to the following Monday
3. **No Weekend Shipments**: Outbound shipments never occur on Saturday or Sunday
4. **Customs Documents**: Orders to non-EU destinations require Packing List and Commercial Invoice
5. **Non-ADR Declaration**: Requires the waybill number of the sample shipment (generated when preparing outbound)
6. **Stock Deduction**: Kit items are deducted from stock when order is approved
7. **POD Retrieval**: System automatically retrieves Proof of Delivery from carrier APIs

---

## 3. System Architecture

### 3.1 High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           CLIENT LAYER                                   │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │                      Next.js Frontend (React)                      │  │
│  │  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────────┐  │  │
│  │  │ Dashboard  │ │  Calendar  │ │   Orders   │ │ Sites/Labs/Kits│  │  │
│  │  └────────────┘ └────────────┘ └────────────┘ └────────────────┘  │  │
│  │  ┌────────────┐ ┌────────────┐ ┌────────────┐                     │  │
│  │  │   Stock    │ │  Tracking  │ │  Settings  │                     │  │
│  │  └────────────┘ └────────────┘ └────────────┘                     │  │
│  └───────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ HTTPS / REST API
                                    ↓
┌─────────────────────────────────────────────────────────────────────────┐
│                            API LAYER                                     │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │                     Next.js API Routes                             │  │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐│  │
│  │  │ /orders  │ │ /sites   │ │  /labs   │ │  /kits   │ │ /stock   ││  │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘│  │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐             │  │
│  │  │/documents│ │/carriers │ │/calendar │ │/dashboard│             │  │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘             │  │
│  └───────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                    ┌───────────────┼───────────────┐
                    ↓               ↓               ↓
┌─────────────────────────┐ ┌─────────────┐ ┌─────────────────────────────┐
│     SERVICE LAYER       │ │  EXTERNAL   │ │      BACKGROUND JOBS        │
│  ┌───────────────────┐  │ │    APIs     │ │  ┌───────────────────────┐  │
│  │ Document Generator│  │ │ ┌─────────┐ │ │  │   Job Queue (BullMQ)  │  │
│  │ (docx-js/pdf-lib) │  │ │ │   UPS   │ │ │  │  - POD Retrieval      │  │
│  ├───────────────────┤  │ │ │   API   │ │ │  │  - Status Sync        │  │
│  │ Business Logic    │  │ │ ├─────────┤ │ │  │  - Notifications      │  │
│  │ Services          │  │ │ │   DHL   │ │ │  │  - Stock Alerts       │  │
│  ├───────────────────┤  │ │ │   API   │ │ │  └───────────────────────┘  │
│  │ Date Calculator   │  │ │ ├─────────┤ │ │                             │
│  │ Stock Manager     │  │ │ │ PowerBI │ │ │                             │
│  └───────────────────┘  │ │ │(Optional│ │ │                             │
│                         │ │ └─────────┘ │ │                             │
└─────────────────────────┘ └─────────────┘ └─────────────────────────────┘
                                    │
                                    ↓
┌─────────────────────────────────────────────────────────────────────────┐
│                           DATA LAYER                                     │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │                      PostgreSQL Database                           │  │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────────┐  │  │
│  │  │ Orders  │ │  Sites  │ │  Labs   │ │  Kits   │ │    Stock    │  │  │
│  │  └─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────────┘  │  │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────────┐  │  │
│  │  │Shipments│ │Documents│ │Contacts │ │Settings │ │CarrierConfig│  │  │
│  │  └─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────────┘  │  │
│  └───────────────────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │                File Storage (S3 / MinIO / Local)                   │  │
│  │         Documents, Labels, PODs, Images, Templates                 │  │
│  └───────────────────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │                         Redis Cache                                │  │
│  │              Sessions, Job Queues, Cached Data                     │  │
│  └───────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
```

### 3.2 Directory Structure

```
sklms/
├── src/
│   ├── app/                              # Next.js 14+ App Router
│   │   ├── (auth)/                       # Authentication routes
│   │   │   ├── login/page.tsx
│   │   │   └── layout.tsx
│   │   ├── (dashboard)/                  # Protected dashboard routes
│   │   │   ├── layout.tsx                # Dashboard layout with sidebar
│   │   │   ├── page.tsx                  # Dashboard home
│   │   │   ├── orders/
│   │   │   │   ├── page.tsx              # Orders list
│   │   │   │   ├── new/page.tsx          # New order wizard
│   │   │   │   └── [id]/
│   │   │   │       ├── page.tsx          # Order detail
│   │   │   │       └── edit/page.tsx
│   │   │   ├── calendar/page.tsx
│   │   │   ├── tracking/page.tsx
│   │   │   ├── sites/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── new/page.tsx
│   │   │   │   └── [id]/page.tsx         # Site dossier
│   │   │   ├── labs/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── new/page.tsx
│   │   │   │   └── [id]/page.tsx         # Lab dossier
│   │   │   ├── kits/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── new/page.tsx
│   │   │   │   └── [id]/page.tsx
│   │   │   ├── stock/page.tsx
│   │   │   ├── settings/
│   │   │   │   ├── page.tsx
│   │   │   │   └── hadea/page.tsx
│   │   │   └── reference-data/
│   │   │       ├── page.tsx
│   │   │       ├── non-adr-declaration/page.tsx
│   │   │       ├── box-content-label/page.tsx
│   │   │       ├── sample-content-label/page.tsx
│   │   │       └── carrier-config/
│   │   │           ├── ups/page.tsx
│   │   │           └── dhl/page.tsx
│   │   ├── api/                          # API Routes
│   │   │   ├── auth/[...nextauth]/route.ts
│   │   │   ├── orders/
│   │   │   │   ├── route.ts              # GET (list), POST (create)
│   │   │   │   ├── [id]/route.ts         # GET, PUT, DELETE
│   │   │   │   ├── [id]/approve/route.ts
│   │   │   │   ├── [id]/documents/route.ts
│   │   │   │   └── batch-approve/route.ts
│   │   │   ├── sites/
│   │   │   │   ├── route.ts
│   │   │   │   └── [id]/
│   │   │   │       ├── route.ts
│   │   │   │       └── contacts/route.ts
│   │   │   ├── labs/
│   │   │   │   ├── route.ts
│   │   │   │   └── [id]/
│   │   │   │       ├── route.ts
│   │   │   │       └── contacts/route.ts
│   │   │   ├── kits/
│   │   │   │   ├── route.ts
│   │   │   │   └── [id]/
│   │   │   │       ├── route.ts
│   │   │   │       └── items/route.ts
│   │   │   ├── stock/
│   │   │   │   ├── route.ts
│   │   │   │   └── [id]/
│   │   │   │       ├── route.ts
│   │   │   │       ├── adjust/route.ts
│   │   │   │       └── movements/route.ts
│   │   │   ├── documents/
│   │   │   │   ├── generate/route.ts
│   │   │   │   └── [id]/route.ts
│   │   │   ├── carriers/
│   │   │   │   ├── ups/
│   │   │   │   │   ├── ship/route.ts
│   │   │   │   │   ├── track/[trackingNumber]/route.ts
│   │   │   │   │   └── pod/[trackingNumber]/route.ts
│   │   │   │   └── dhl/
│   │   │   │       ├── ship/route.ts
│   │   │   │       ├── track/[trackingNumber]/route.ts
│   │   │   │       └── pod/[trackingNumber]/route.ts
│   │   │   ├── calendar/route.ts
│   │   │   ├── dashboard/route.ts
│   │   │   └── settings/
│   │   │       ├── route.ts
│   │   │       ├── hadea/route.ts
│   │   │       └── carrier-config/route.ts
│   │   └── layout.tsx
│   ├── components/
│   │   ├── ui/                           # Base UI components (shadcn/ui)
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── select.tsx
│   │   │   ├── modal.tsx
│   │   │   ├── table.tsx
│   │   │   ├── card.tsx
│   │   │   ├── calendar.tsx
│   │   │   ├── date-picker.tsx
│   │   │   ├── toast.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── tabs.tsx
│   │   │   ├── dropdown-menu.tsx
│   │   │   └── ...
│   │   ├── layout/
│   │   │   ├── sidebar.tsx
│   │   │   ├── header.tsx
│   │   │   ├── page-header.tsx
│   │   │   └── page-wrapper.tsx
│   │   ├── orders/
│   │   │   ├── order-wizard/
│   │   │   │   ├── index.tsx
│   │   │   │   ├── step-site-kit.tsx
│   │   │   │   ├── step-configuration.tsx
│   │   │   │   ├── step-schedule.tsx
│   │   │   │   └── step-review.tsx
│   │   │   ├── order-list.tsx
│   │   │   ├── order-detail.tsx
│   │   │   ├── order-card.tsx
│   │   │   └── shipment-timeline.tsx
│   │   ├── calendar/
│   │   │   ├── calendar-view.tsx
│   │   │   ├── day-detail.tsx
│   │   │   └── workload-indicator.tsx
│   │   ├── sites/
│   │   │   ├── site-list.tsx
│   │   │   ├── site-form.tsx
│   │   │   ├── site-dossier.tsx
│   │   │   └── contact-manager.tsx
│   │   ├── labs/
│   │   │   ├── lab-list.tsx
│   │   │   ├── lab-form.tsx
│   │   │   ├── lab-dossier.tsx
│   │   │   └── contact-manager.tsx
│   │   ├── kits/
│   │   │   ├── kit-list.tsx
│   │   │   ├── kit-form.tsx
│   │   │   └── kit-items-table.tsx
│   │   ├── stock/
│   │   │   ├── stock-list.tsx
│   │   │   ├── stock-form.tsx
│   │   │   └── stock-movements.tsx
│   │   └── dashboard/
│   │       ├── stats-cards.tsx
│   │       ├── today-workload.tsx
│   │       ├── alerts-panel.tsx
│   │       └── recent-activity.tsx
│   ├── lib/
│   │   ├── db/
│   │   │   ├── index.ts                  # Prisma client instance
│   │   │   └── migrations/
│   │   ├── services/
│   │   │   ├── order.service.ts
│   │   │   ├── site.service.ts
│   │   │   ├── lab.service.ts
│   │   │   ├── kit.service.ts
│   │   │   ├── stock.service.ts
│   │   │   ├── document.service.ts
│   │   │   ├── shipment.service.ts
│   │   │   └── scheduler.service.ts
│   │   ├── carriers/
│   │   │   ├── ups/
│   │   │   │   ├── client.ts
│   │   │   │   ├── shipment.ts
│   │   │   │   ├── tracking.ts
│   │   │   │   └── pod.ts
│   │   │   └── dhl/
│   │   │       ├── client.ts
│   │   │       ├── shipment.ts
│   │   │       ├── tracking.ts
│   │   │       └── pod.ts
│   │   ├── documents/
│   │   │   ├── generators/
│   │   │   │   ├── box-content-label-outbound.ts
│   │   │   │   ├── box-content-label-sample.ts
│   │   │   │   ├── non-adr-declaration.ts
│   │   │   │   ├── packing-list.ts
│   │   │   │   └── commercial-invoice.ts
│   │   │   └── templates/
│   │   │       └── ... (template configurations)
│   │   ├── utils/
│   │   │   ├── date-utils.ts
│   │   │   ├── file-storage.ts
│   │   │   ├── validation.ts
│   │   │   └── order-number.ts
│   │   ├── hooks/
│   │   │   ├── use-orders.ts
│   │   │   ├── use-sites.ts
│   │   │   ├── use-labs.ts
│   │   │   ├── use-kits.ts
│   │   │   ├── use-stock.ts
│   │   │   └── use-calendar.ts
│   │   └── constants/
│   │       ├── order-status.ts
│   │       ├── shipment-status.ts
│   │       └── document-types.ts
│   ├── types/
│   │   ├── order.ts
│   │   ├── site.ts
│   │   ├── lab.ts
│   │   ├── kit.ts
│   │   ├── stock.ts
│   │   ├── shipment.ts
│   │   ├── document.ts
│   │   └── api.ts
│   └── styles/
│       └── globals.css
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
├── jobs/                                 # Background job handlers
│   ├── index.ts
│   ├── pod-retrieval.job.ts
│   ├── status-sync.job.ts
│   ├── stock-alert.job.ts
│   └── notification.job.ts
├── templates/                            # Document templates
│   ├── box-content-label-outbound.docx
│   ├── box-content-label-sample.docx
│   └── non-adr-declaration.docx
├── public/
│   └── assets/
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── docker-compose.yml
├── Dockerfile
├── package.json
├── tsconfig.json
├── tailwind.config.js
├── .env.example
└── README.md
```

---

## 4. Technology Stack

### 4.1 Frontend Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 14.x | React framework with App Router |
| React | 18.x | UI library |
| TypeScript | 5.x | Type safety |
| Tailwind CSS | 3.x | Utility-first styling |
| shadcn/ui | Latest | Pre-built UI components |
| TanStack Query | 5.x | Server state management |
| Zustand | 4.x | Client state management |
| React Hook Form | 7.x | Form handling |
| Zod | 3.x | Schema validation |
| date-fns | 3.x | Date manipulation |
| Lucide React | Latest | Icon library |
| react-big-calendar | Latest | Calendar component |
| recharts | 2.x | Charts and visualizations |

### 4.2 Backend Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js API Routes | 14.x | REST API endpoints |
| Node.js | 20.x LTS | Runtime environment |
| Prisma | 5.x | Database ORM |
| PostgreSQL | 15.x | Primary database |
| Redis | 7.x | Caching & job queues |
| BullMQ | 4.x | Background job processing |
| docx | 8.x | Word document generation |
| pdf-lib | 1.x | PDF creation/manipulation |
| Sharp | Latest | Image processing |
| NextAuth.js | 4.x | Authentication |

### 4.3 Infrastructure

| Technology | Purpose |
|------------|---------|
| Docker | Containerization |
| Docker Compose | Local development orchestration |
| MinIO / S3 | Object storage for files |
| Nginx | Reverse proxy (production) |
| PM2 | Process management |

### 4.4 Development Tools

| Tool | Purpose |
|------|---------|
| ESLint | Code linting |
| Prettier | Code formatting |
| Jest | Unit testing |
| Playwright | E2E testing |
| Husky | Git hooks |

---

## 5. Database Design

### 5.1 Entity Relationship Overview

```
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│     SITES       │       │     ORDERS      │       │      LABS       │
├─────────────────┤       ├─────────────────┤       ├─────────────────┤
│ id (PK)         │◄──────│ site_id (FK)    │──────►│ id (PK)         │
│ name            │       │ lab_id (FK)     │       │ name            │
│ code            │       │ kit_id (FK)     │       │ code            │
│ address_*       │       │ quantity        │       │ address_*       │
│ country_code    │       │ status          │       │ country_code    │
│ is_eu           │       │ sampling_date   │       │ is_eu           │
└────────┬────────┘       │ outbound_*      │       └────────┬────────┘
         │                │ sample_*        │                │
         │                └────────┬────────┘                │
         │                         │                         │
         ▼                         ▼                         ▼
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│ SITE_CONTACTS   │       │   SHIPMENTS     │       │  LAB_CONTACTS   │
├─────────────────┤       ├─────────────────┤       ├─────────────────┤
│ id (PK)         │       │ id (PK)         │       │ id (PK)         │
│ site_id (FK)    │       │ order_id (FK)   │       │ lab_id (FK)     │
│ name, email     │       │ type            │       │ name, email     │
│ phone           │       │ carrier         │       │ phone           │
│ is_primary      │       │ tracking_number │       │ is_primary      │
└─────────────────┘       │ status          │       └─────────────────┘
                          │ pod_retrieved   │
                          └────────┬────────┘
                                   │
                                   ▼
                          ┌─────────────────┐
                          │    DOCUMENTS    │
                          ├─────────────────┤
                          │ id (PK)         │
                          │ order_id (FK)   │
                          │ shipment_id (FK)│
                          │ type            │
                          │ file_path       │
                          └─────────────────┘

┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│      KITS       │◄──────│   KIT_ITEMS     │──────►│  STOCK_ITEMS    │
├─────────────────┤       ├─────────────────┤       ├─────────────────┤
│ id (PK)         │       │ id (PK)         │       │ id (PK)         │
│ name, code      │       │ kit_id (FK)     │       │ name, sku       │
│ dimensions      │       │ stock_item_id   │       │ quantity        │
│ weight          │       │ quantity        │       │ unit_price      │
└─────────────────┘       └─────────────────┘       │ dimensions      │
                                                    └────────┬────────┘
                                                             │
                                                             ▼
                                                    ┌─────────────────┐
                                                    │ STOCK_MOVEMENTS │
                                                    ├─────────────────┤
                                                    │ id (PK)         │
                                                    │ stock_item_id   │
                                                    │ order_id (FK)   │
                                                    │ quantity_change │
                                                    │ movement_type   │
                                                    └─────────────────┘
```

### 5.2 Complete Prisma Schema

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ═══════════════════════════════════════════════════════════════════
// ENUMS
// ═══════════════════════════════════════════════════════════════════

enum OrderStatus {
  DRAFT                    // Initial state, not yet approved
  PENDING_APPROVAL         // Submitted for approval
  APPROVED                 // Approved, ready for processing
  OUTBOUND_PREPARING       // Preparing outbound shipment
  OUTBOUND_SHIPPED         // Outbound kit shipped
  OUTBOUND_DELIVERED       // Outbound kit delivered to site
  SAMPLING_IN_PROGRESS     // Site is performing sampling
  SAMPLE_PREPARING         // Preparing sample shipment
  SAMPLE_SHIPPED           // Sample shipped to lab
  SAMPLE_DELIVERED         // Sample delivered to lab
  COMPLETED                // Order fully completed
  CANCELLED                // Order cancelled
}

enum ShipmentType {
  OUTBOUND                 // Kit going to site
  SAMPLE                   // Sample going to lab
}

enum ShipmentStatus {
  PENDING                  // Not yet processed
  LABEL_CREATED            // Shipping label generated
  PICKED_UP                // Picked up by carrier
  IN_TRANSIT               // In transit
  OUT_FOR_DELIVERY         // Out for delivery
  DELIVERED                // Delivered
  EXCEPTION                // Delivery exception
  CANCELLED                // Shipment cancelled
}

enum CarrierType {
  UPS
  DHL
}

enum DocumentType {
  BOX_CONTENT_LABEL_OUTBOUND
  BOX_CONTENT_LABEL_SAMPLE
  NON_ADR_DECLARATION
  SHIPPING_LABEL_OUTBOUND
  SHIPPING_LABEL_SAMPLE
  PACKING_LIST
  COMMERCIAL_INVOICE
  PROOF_OF_DELIVERY_OUTBOUND
  PROOF_OF_DELIVERY_SAMPLE
}

enum StockMovementType {
  ADJUSTMENT               // Manual adjustment
  ORDER_ALLOCATION         // Deducted for order
  ORDER_CANCELLATION       // Returned from cancelled order
  RECEIPT                  // Stock received
  MANUAL_DECREASE          // Manual decrease
  MANUAL_INCREASE          // Manual increase
}

enum UserRole {
  ADMIN
  OPERATIONS_MANAGER
  WAREHOUSE_OPERATOR
  VIEWER
}

// ═══════════════════════════════════════════════════════════════════
// USERS & AUTHENTICATION
// ═══════════════════════════════════════════════════════════════════

model User {
  id            String    @id @default(cuid())
  email         String    @unique
  name          String
  passwordHash  String    @map("password_hash")
  role          UserRole  @default(VIEWER)
  isActive      Boolean   @default(true) @map("is_active")
  createdAt     DateTime  @default(now()) @map("created_at")
  updatedAt     DateTime  @updatedAt @map("updated_at")
  
  // Relations
  approvedOrders   Order[]         @relation("ApprovedBy")
  stockMovements   StockMovement[]
  
  @@map("users")
}

// ═══════════════════════════════════════════════════════════════════
// SITES
// ═══════════════════════════════════════════════════════════════════

model Site {
  id            String    @id @default(cuid())
  name          String
  code          String    @unique    // e.g., "MUC-001"
  
  // Address
  addressLine1  String    @map("address_line1")
  addressLine2  String?   @map("address_line2")
  city          String
  stateProvince String?   @map("state_province")
  postalCode    String    @map("postal_code")
  countryCode   String    @map("country_code")   // ISO 3166-1 alpha-2 (e.g., "DE")
  countryName   String    @map("country_name")   // e.g., "Germany"
  
  // Classification
  isEU          Boolean   @default(true) @map("is_eu")
  isActive      Boolean   @default(true) @map("is_active")
  notes         String?   @db.Text
  
  // Timestamps
  createdAt     DateTime  @default(now()) @map("created_at")
  updatedAt     DateTime  @updatedAt @map("updated_at")
  
  // Relations
  contacts      SiteContact[]
  orders        Order[]
  
  @@index([code])
  @@index([countryCode])
  @@index([isActive])
  @@map("sites")
}

model SiteContact {
  id          String    @id @default(cuid())
  siteId      String    @map("site_id")
  name        String
  email       String
  phone       String?
  department  String?
  isPrimary   Boolean   @default(false) @map("is_primary")
  isActive    Boolean   @default(true) @map("is_active")
  createdAt   DateTime  @default(now()) @map("created_at")
  updatedAt   DateTime  @updatedAt @map("updated_at")
  
  // Relations
  site        Site      @relation(fields: [siteId], references: [id], onDelete: Cascade)
  orders      Order[]   @relation("SiteContactOrders")
  
  @@index([siteId])
  @@map("site_contacts")
}

// ═══════════════════════════════════════════════════════════════════
// LABORATORIES
// ═══════════════════════════════════════════════════════════════════

model Lab {
  id            String    @id @default(cuid())
  name          String
  code          String    @unique    // e.g., "LAB-CENTRAL"
  
  // Address
  addressLine1  String    @map("address_line1")
  addressLine2  String?   @map("address_line2")
  city          String
  stateProvince String?   @map("state_province")
  postalCode    String    @map("postal_code")
  countryCode   String    @map("country_code")
  countryName   String    @map("country_name")
  
  // Classification
  isEU          Boolean   @default(true) @map("is_eu")
  isActive      Boolean   @default(true) @map("is_active")
  notes         String?   @db.Text
  
  // Timestamps
  createdAt     DateTime  @default(now()) @map("created_at")
  updatedAt     DateTime  @updatedAt @map("updated_at")
  
  // Relations
  contacts      LabContact[]
  orders        Order[]
  
  @@index([code])
  @@index([isActive])
  @@map("labs")
}

model LabContact {
  id          String    @id @default(cuid())
  labId       String    @map("lab_id")
  name        String
  email       String
  phone       String?
  department  String?
  isPrimary   Boolean   @default(false) @map("is_primary")
  isActive    Boolean   @default(true) @map("is_active")
  createdAt   DateTime  @default(now()) @map("created_at")
  updatedAt   DateTime  @updatedAt @map("updated_at")
  
  // Relations
  lab         Lab       @relation(fields: [labId], references: [id], onDelete: Cascade)
  orders      Order[]   @relation("LabContactOrders")
  
  @@index([labId])
  @@map("lab_contacts")
}

// ═══════════════════════════════════════════════════════════════════
// KITS & STOCK
// ═══════════════════════════════════════════════════════════════════

model Kit {
  id            String    @id @default(cuid())
  name          String                          // e.g., "Standard Sampling Kit"
  code          String    @unique               // e.g., "KIT-STD-001"
  description   String?   @db.Text
  
  // Dimensions (for shipping)
  totalWeight   Float     @map("total_weight")  // in kg
  length        Float                           // in cm
  width         Float                           // in cm
  height        Float                           // in cm
  
  // Status
  isActive      Boolean   @default(true) @map("is_active")
  
  // Timestamps
  createdAt     DateTime  @default(now()) @map("created_at")
  updatedAt     DateTime  @updatedAt @map("updated_at")
  
  // Relations
  items         KitItem[]
  orders        Order[]
  
  @@index([code])
  @@index([isActive])
  @@map("kits")
}

model StockItem {
  id              String    @id @default(cuid())
  name            String                              // e.g., "Sampling Tube 10ml"
  sku             String    @unique                   // e.g., "TUBE-10ML-001"
  description     String?   @db.Text
  
  // Inventory
  quantity        Int       @default(0)               // Current stock level
  minStockLevel   Int       @default(0) @map("min_stock_level")
  
  // Pricing (for commercial invoice)
  unitPrice       Float     @map("unit_price")        // Price per unit
  currency        String    @default("EUR")
  
  // Physical properties
  unitWeight      Float     @map("unit_weight")       // Weight per unit in kg
  length          Float?                              // in cm
  width           Float?                              // in cm
  height          Float?                              // in cm
  
  // Status
  isActive        Boolean   @default(true) @map("is_active")
  
  // Timestamps
  createdAt       DateTime  @default(now()) @map("created_at")
  updatedAt       DateTime  @updatedAt @map("updated_at")
  
  // Relations
  kitItems        KitItem[]
  movements       StockMovement[]
  
  @@index([sku])
  @@index([quantity, minStockLevel])
  @@map("stock_items")
}

model KitItem {
  id            String    @id @default(cuid())
  kitId         String    @map("kit_id")
  stockItemId   String    @map("stock_item_id")
  quantity      Int       @default(1)           // Quantity of this item in the kit
  createdAt     DateTime  @default(now()) @map("created_at")
  
  // Relations
  kit           Kit       @relation(fields: [kitId], references: [id], onDelete: Cascade)
  stockItem     StockItem @relation(fields: [stockItemId], references: [id])
  
  @@unique([kitId, stockItemId])
  @@map("kit_items")
}

model StockMovement {
  id              String            @id @default(cuid())
  stockItemId     String            @map("stock_item_id")
  orderId         String?           @map("order_id")
  quantityChange  Int               @map("quantity_change")  // Positive or negative
  movementType    StockMovementType @map("movement_type")
  notes           String?           @db.Text
  
  // Audit
  createdAt       DateTime          @default(now()) @map("created_at")
  createdById     String?           @map("created_by_id")
  
  // Relations
  stockItem       StockItem         @relation(fields: [stockItemId], references: [id])
  order           Order?            @relation(fields: [orderId], references: [id])
  createdBy       User?             @relation(fields: [createdById], references: [id])
  
  @@index([stockItemId])
  @@index([orderId])
  @@index([createdAt])
  @@map("stock_movements")
}

// ═══════════════════════════════════════════════════════════════════
// ORDERS
// ═══════════════════════════════════════════════════════════════════

model Order {
  id                String        @id @default(cuid())
  orderNumber       String        @unique @map("order_number")  // e.g., "ORD-2026-0108-001"
  
  // References
  siteId            String        @map("site_id")
  labId             String        @map("lab_id")
  kitId             String        @map("kit_id")
  siteContactId     String        @map("site_contact_id")
  labContactId      String        @map("lab_contact_id")
  
  // Order details
  quantity          Int           @default(1)                   // Number of kits
  status            OrderStatus   @default(DRAFT)
  
  // Key dates
  samplingDate      DateTime      @map("sampling_date")         // When sampling occurs
  outboundShipDate  DateTime      @map("outbound_ship_date")    // Calculated: sampling - 14 days
  
  // Carrier selection
  outboundCarrier   CarrierType   @map("outbound_carrier")
  sampleCarrier     CarrierType   @map("sample_carrier")
  
  // Customs
  requiresCustomsDocs Boolean     @default(false) @map("requires_customs_docs")
  
  // Approval
  approvedAt        DateTime?     @map("approved_at")
  approvedById      String?       @map("approved_by_id")
  
  // Notes
  notes             String?       @db.Text
  
  // Timestamps
  createdAt         DateTime      @default(now()) @map("created_at")
  updatedAt         DateTime      @updatedAt @map("updated_at")
  
  // Relations
  site              Site          @relation(fields: [siteId], references: [id])
  lab               Lab           @relation(fields: [labId], references: [id])
  kit               Kit           @relation(fields: [kitId], references: [id])
  siteContact       SiteContact   @relation("SiteContactOrders", fields: [siteContactId], references: [id])
  labContact        LabContact    @relation("LabContactOrders", fields: [labContactId], references: [id])
  approvedBy        User?         @relation("ApprovedBy", fields: [approvedById], references: [id])
  
  shipments         Shipment[]
  documents         Document[]
  stockMovements    StockMovement[]
  
  @@index([status])
  @@index([samplingDate])
  @@index([outboundShipDate])
  @@index([siteId])
  @@index([labId])
  @@index([createdAt])
  @@map("orders")
}

// ═══════════════════════════════════════════════════════════════════
// SHIPMENTS
// ═══════════════════════════════════════════════════════════════════

model Shipment {
  id                    String          @id @default(cuid())
  orderId               String          @map("order_id")
  type                  ShipmentType                          // OUTBOUND or SAMPLE
  carrier               CarrierType
  status                ShipmentStatus  @default(PENDING)
  
  // Tracking
  trackingNumber        String?         @map("tracking_number")
  waybillNumber         String?         @map("waybill_number")  // For Non-ADR declaration
  
  // Dates
  scheduledShipDate     DateTime        @map("scheduled_ship_date")
  expectedDeliveryDate  DateTime?       @map("expected_delivery_date")
  actualShipDate        DateTime?       @map("actual_ship_date")
  actualDeliveryDate    DateTime?       @map("actual_delivery_date")
  
  // Proof of Delivery
  podRetrieved          Boolean         @default(false) @map("pod_retrieved")
  podRetrievedAt        DateTime?       @map("pod_retrieved_at")
  podSignedBy           String?         @map("pod_signed_by")
  
  // Carrier response data
  carrierResponseJson   Json?           @map("carrier_response_json")
  
  // Timestamps
  createdAt             DateTime        @default(now()) @map("created_at")
  updatedAt             DateTime        @updatedAt @map("updated_at")
  
  // Relations
  order                 Order           @relation(fields: [orderId], references: [id], onDelete: Cascade)
  documents             Document[]
  trackingEvents        TrackingEvent[]
  
  @@unique([orderId, type])
  @@index([trackingNumber])
  @@index([status])
  @@index([scheduledShipDate])
  @@map("shipments")
}

model TrackingEvent {
  id                String    @id @default(cuid())
  shipmentId        String    @map("shipment_id")
  eventCode         String    @map("event_code")
  eventDescription  String    @map("event_description")
  location          String?
  eventDate         DateTime  @map("event_date")
  rawData           Json?     @map("raw_data")
  createdAt         DateTime  @default(now()) @map("created_at")
  
  // Relations
  shipment          Shipment  @relation(fields: [shipmentId], references: [id], onDelete: Cascade)
  
  @@index([shipmentId])
  @@index([eventDate])
  @@map("tracking_events")
}

// ═══════════════════════════════════════════════════════════════════
// DOCUMENTS
// ═══════════════════════════════════════════════════════════════════

model Document {
  id            String        @id @default(cuid())
  orderId       String        @map("order_id")
  shipmentId    String?       @map("shipment_id")
  type          DocumentType
  fileName      String        @map("file_name")
  filePath      String        @map("file_path")   // S3 key or local path
  fileType      String        @map("file_type")   // MIME type
  fileSize      Int           @map("file_size")   // bytes
  generatedAt   DateTime      @default(now()) @map("generated_at")
  
  // Relations
  order         Order         @relation(fields: [orderId], references: [id], onDelete: Cascade)
  shipment      Shipment?     @relation(fields: [shipmentId], references: [id])
  
  @@index([orderId])
  @@index([orderId, type])
  @@map("documents")
}

// ═══════════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════════

model Setting {
  id        String    @id @default(cuid())
  key       String    @unique
  value     String    @db.Text
  category  String    @default("general")
  createdAt DateTime  @default(now()) @map("created_at")
  updatedAt DateTime  @updatedAt @map("updated_at")
  
  @@index([category])
  @@map("settings")
}

model CarrierConfig {
  id            String        @id @default(cuid())
  carrier       CarrierType
  shipmentType  ShipmentType  @map("shipment_type")
  configJson    Json          @map("config_json")
  isActive      Boolean       @default(true) @map("is_active")
  createdAt     DateTime      @default(now()) @map("created_at")
  updatedAt     DateTime      @updatedAt @map("updated_at")
  
  @@unique([carrier, shipmentType])
  @@map("carrier_configs")
}

model DocumentTemplate {
  id            String        @id @default(cuid())
  name          String
  type          DocumentType
  filePath      String        @map("file_path")
  configJson    Json?         @map("config_json")   // Field mappings
  isActive      Boolean       @default(true) @map("is_active")
  createdAt     DateTime      @default(now()) @map("created_at")
  updatedAt     DateTime      @updatedAt @map("updated_at")
  
  @@index([type])
  @@map("document_templates")
}

// HaDEA specific configuration
model HadeaConfig {
  id                        String    @id @default(cuid())
  contractingAuthorityName  String    @map("contracting_authority_name")
  contractorName            String    @map("contractor_name")
  specificContractNumber    String    @map("specific_contract_number")
  specificContractDate      DateTime  @map("specific_contract_date")
  shippingAddress           String?   @map("shipping_address") @db.Text
  isActive                  Boolean   @default(true) @map("is_active")
  createdAt                 DateTime  @default(now()) @map("created_at")
  updatedAt                 DateTime  @updatedAt @map("updated_at")
  
  @@map("hadea_configs")
}
```

### 5.3 Key Database Indexes

```sql
-- Performance indexes (in addition to Prisma defaults)

-- Orders: Common query patterns
CREATE INDEX idx_orders_status_date ON orders(status, sampling_date);
CREATE INDEX idx_orders_outbound_date ON orders(outbound_ship_date) WHERE status IN ('APPROVED', 'OUTBOUND_PREPARING');

-- Shipments: Tracking lookups
CREATE INDEX idx_shipments_tracking ON shipments(tracking_number) WHERE tracking_number IS NOT NULL;
CREATE INDEX idx_shipments_pending_pod ON shipments(pod_retrieved, actual_delivery_date) 
  WHERE pod_retrieved = false AND actual_delivery_date IS NOT NULL;

-- Stock: Low stock alerts
CREATE INDEX idx_stock_low_level ON stock_items(quantity, min_stock_level) 
  WHERE is_active = true AND quantity <= min_stock_level;

-- Full-text search indexes
CREATE INDEX idx_sites_search ON sites USING gin(to_tsvector('english', name || ' ' || code || ' ' || city));
CREATE INDEX idx_labs_search ON labs USING gin(to_tsvector('english', name || ' ' || code || ' ' || city));
```

---

## 6. API Design

### 6.1 API Conventions

| Aspect | Convention |
|--------|------------|
| Base URL | `/api` |
| Format | JSON request/response bodies |
| Authentication | Bearer token in Authorization header |
| Pagination | `?page=1&limit=20` (default limit: 20, max: 100) |
| Sorting | `?sortBy=field&sortOrder=asc|desc` |
| Errors | `{ error: { code: string, message: string, details?: object } }` |

### 6.2 HTTP Status Codes

| Code | Usage |
|------|-------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request / Validation Error |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 409 | Conflict (duplicate, etc.) |
| 500 | Internal Server Error |

### 6.3 Orders API

```typescript
// ═══════════════════════════════════════════════════════════════════
// LIST ORDERS
// ═══════════════════════════════════════════════════════════════════
// GET /api/orders

// Query Parameters
interface ListOrdersQuery {
  page?: number;                    // Default: 1
  limit?: number;                   // Default: 20, Max: 100
  status?: OrderStatus | OrderStatus[];
  siteId?: string;
  labId?: string;
  dateFrom?: string;                // ISO date
  dateTo?: string;                  // ISO date
  search?: string;                  // Search order number
  sortBy?: 'samplingDate' | 'createdAt' | 'orderNumber';
  sortOrder?: 'asc' | 'desc';
}

// Response
interface ListOrdersResponse {
  data: Order[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ═══════════════════════════════════════════════════════════════════
// GET ORDER DETAIL
// ═══════════════════════════════════════════════════════════════════
// GET /api/orders/:id

interface OrderDetailResponse {
  data: Order & {
    site: Site;
    lab: Lab;
    kit: Kit & { items: (KitItem & { stockItem: StockItem })[] };
    siteContact: SiteContact;
    labContact: LabContact;
    shipments: (Shipment & { trackingEvents: TrackingEvent[] })[];
    documents: Document[];
  };
}

// ═══════════════════════════════════════════════════════════════════
// CREATE ORDER(S)
// ═══════════════════════════════════════════════════════════════════
// POST /api/orders

interface CreateOrderRequest {
  siteId: string;
  labId: string;
  kitId: string;
  quantity: number;
  outboundCarrier: 'UPS' | 'DHL';
  sampleCarrier: 'UPS' | 'DHL';
  siteContactId: string;
  labContactId: string;
  samplingDates: string[];          // ISO date strings - supports batch creation
  notes?: string;
}

interface CreateOrderResponse {
  data: Order[];
  message: string;
}

// ═══════════════════════════════════════════════════════════════════
// UPDATE ORDER
// ═══════════════════════════════════════════════════════════════════
// PUT /api/orders/:id

interface UpdateOrderRequest {
  samplingDate?: string;            // Only if status allows
  outboundCarrier?: 'UPS' | 'DHL';
  sampleCarrier?: 'UPS' | 'DHL';
  siteContactId?: string;
  labContactId?: string;
  notes?: string;
}

// ═══════════════════════════════════════════════════════════════════
// DELETE ORDER
// ═══════════════════════════════════════════════════════════════════
// DELETE /api/orders/:id
// Soft delete - sets status to CANCELLED

// ═══════════════════════════════════════════════════════════════════
// APPROVE ORDER
// ═══════════════════════════════════════════════════════════════════
// POST /api/orders/:id/approve

interface ApproveOrderResponse {
  data: Order;
  stockDeducted: { itemId: string; quantity: number }[];
  message: string;
}

// ═══════════════════════════════════════════════════════════════════
// BATCH APPROVE
// ═══════════════════════════════════════════════════════════════════
// POST /api/orders/batch-approve

interface BatchApproveRequest {
  orderIds: string[];
}

interface BatchApproveResponse {
  approved: number;
  failed: { orderId: string; error: string }[];
}

// ═══════════════════════════════════════════════════════════════════
// GENERATE DOCUMENT
// ═══════════════════════════════════════════════════════════════════
// POST /api/orders/:id/documents/generate

interface GenerateDocumentRequest {
  type: DocumentType;
}

interface GenerateDocumentResponse {
  data: Document;
}
```

### 6.4 Sites API

```typescript
// GET /api/sites                    - List sites
// GET /api/sites/:id                - Get site detail (dossier view)
// POST /api/sites                   - Create site
// PUT /api/sites/:id                - Update site
// DELETE /api/sites/:id             - Deactivate site

// GET /api/sites/:id/contacts       - List site contacts
// POST /api/sites/:id/contacts      - Add contact
// PUT /api/sites/:id/contacts/:cid  - Update contact
// DELETE /api/sites/:id/contacts/:cid - Remove contact

interface CreateSiteRequest {
  name: string;
  code: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  stateProvince?: string;
  postalCode: string;
  countryCode: string;          // ISO 3166-1 alpha-2
  countryName: string;
  isEU?: boolean;
  notes?: string;
}

interface SiteDossierResponse {
  data: Site & {
    contacts: SiteContact[];
    statistics: {
      totalOrders: number;
      ordersThisYear: number;
      avgOrdersPerMonth: number;
    };
    upcomingOrders: Order[];    // Next 10 upcoming
    recentOrders: Order[];      // Last 10 completed
  };
}

interface CreateContactRequest {
  name: string;
  email: string;
  phone?: string;
  department?: string;
  isPrimary?: boolean;
}
```

### 6.5 Labs API

```typescript
// Same structure as Sites API
// GET /api/labs
// GET /api/labs/:id
// POST /api/labs
// PUT /api/labs/:id
// DELETE /api/labs/:id
// GET /api/labs/:id/contacts
// POST /api/labs/:id/contacts
// PUT /api/labs/:id/contacts/:cid
// DELETE /api/labs/:id/contacts/:cid
```

### 6.6 Kits API

```typescript
// GET /api/kits                     - List kits
// GET /api/kits/:id                 - Get kit with items
// POST /api/kits                    - Create kit
// PUT /api/kits/:id                 - Update kit
// DELETE /api/kits/:id              - Deactivate kit

// POST /api/kits/:id/items          - Add item to kit
// PUT /api/kits/:id/items/:itemId   - Update item quantity
// DELETE /api/kits/:id/items/:itemId - Remove item from kit

interface CreateKitRequest {
  name: string;
  code: string;
  description?: string;
  totalWeight: number;          // kg
  length: number;               // cm
  width: number;                // cm
  height: number;               // cm
  items: {
    stockItemId: string;
    quantity: number;
  }[];
}

interface KitDetailResponse {
  data: Kit & {
    items: (KitItem & {
      stockItem: StockItem;
    })[];
    totalValue: number;         // Sum of item prices * quantities
    usedInOrders: number;       // Count of orders using this kit
  };
}
```

### 6.7 Stock API

```typescript
// GET /api/stock                    - List stock items
// GET /api/stock/:id                - Get stock item with movements
// POST /api/stock                   - Create stock item
// PUT /api/stock/:id                - Update stock item
// DELETE /api/stock/:id             - Deactivate stock item

// POST /api/stock/:id/adjust        - Manual stock adjustment
// GET /api/stock/:id/movements      - Get movement history

interface ListStockQuery {
  search?: string;
  lowStock?: boolean;           // Filter items below minStockLevel
  isActive?: boolean;
  page?: number;
  limit?: number;
}

interface CreateStockItemRequest {
  name: string;
  sku: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  unitWeight: number;
  length?: number;
  width?: number;
  height?: number;
  minStockLevel?: number;
}

interface AdjustStockRequest {
  quantityChange: number;       // Positive or negative
  notes?: string;
}

interface StockDetailResponse {
  data: StockItem & {
    movements: StockMovement[]; // Last 50
    usedInKits: Kit[];
  };
}
```

### 6.8 Calendar API

```typescript
// GET /api/calendar
// Returns calendar data for specified date range

interface CalendarQuery {
  startDate: string;            // ISO date
  endDate: string;              // ISO date
  siteId?: string;
  labId?: string;
  type?: 'outbound' | 'sampling' | 'all';
}

interface CalendarResponse {
  data: {
    date: string;               // ISO date
    outboundCount: number;
    samplingCount: number;
    orders: {
      id: string;
      orderNumber: string;
      type: 'outbound' | 'sampling';
      siteName: string;
      labName: string;
      status: OrderStatus;
      kitName: string;
      quantity: number;
    }[];
  }[];
}

// GET /api/calendar/workload
// Returns workload indicators for date range

interface WorkloadResponse {
  data: {
    date: string;
    workloadLevel: 'low' | 'medium' | 'high';
    totalShipments: number;
  }[];
}
```

### 6.9 Dashboard API

```typescript
// GET /api/dashboard

interface DashboardResponse {
  data: {
    yesterday: {
      outboundShipped: number;
      samplesDelivered: number;
      ordersCompleted: number;
    };
    today: {
      outboundToShip: OrderSummary[];
      expectedDeliveries: OrderSummary[];
      pendingApprovals: number;
    };
    tomorrow: {
      outboundScheduled: number;
      samplingScheduled: number;
    };
    alerts: Alert[];
    recentActivity: ActivityItem[];
  };
}

interface Alert {
  type: 'low_stock' | 'overdue' | 'exception' | 'pending_pod';
  severity: 'warning' | 'error';
  message: string;
  entityId: string;
  entityType: 'stock' | 'order' | 'shipment';
  createdAt: string;
}
```

### 6.10 Carriers API

```typescript
// ═══════════════════════════════════════════════════════════════════
// UPS API
// ═══════════════════════════════════════════════════════════════════

// POST /api/carriers/ups/ship
// Create UPS shipment and get label

interface CreateShipmentRequest {
  shipmentId: string;           // Internal shipment ID
}

interface CreateShipmentResponse {
  data: {
    trackingNumber: string;
    waybillNumber: string;
    labelBase64: string;        // PNG or PDF
    labelFormat: 'PNG' | 'PDF';
    expectedDelivery: string;   // ISO date
    carrierResponse: object;    // Raw API response
  };
}

// GET /api/carriers/ups/track/:trackingNumber
// Get tracking info

interface TrackingResponse {
  data: {
    status: ShipmentStatus;
    statusDescription: string;
    estimatedDelivery: string;
    events: {
      date: string;
      time: string;
      location: string;
      description: string;
      code: string;
    }[];
  };
}

// GET /api/carriers/ups/pod/:trackingNumber
// Get Proof of Delivery

interface PODResponse {
  data: {
    available: boolean;
    podBase64?: string;         // PDF
    signedBy?: string;
    deliveredAt?: string;       // ISO datetime
    deliveryLocation?: string;
  };
}

// ═══════════════════════════════════════════════════════════════════
// DHL API (same structure)
// ═══════════════════════════════════════════════════════════════════
// POST /api/carriers/dhl/ship
// GET /api/carriers/dhl/track/:trackingNumber
// GET /api/carriers/dhl/pod/:trackingNumber
```

### 6.11 Documents API

```typescript
// GET /api/documents/:id
// Download document file
// Returns: File stream with Content-Type header

// POST /api/documents/generate
interface GenerateDocRequest {
  orderId: string;
  type: DocumentType;
}

// POST /api/documents/generate-batch
interface GenerateBatchRequest {
  orderId: string;
  types: DocumentType[];
}

// DELETE /api/documents/:id
// Delete document and file
```

### 6.12 Settings API

```typescript
// GET /api/settings
// GET /api/settings?category=general

// PUT /api/settings
interface UpdateSettingsRequest {
  settings: { key: string; value: string }[];
}

// GET /api/settings/hadea
// PUT /api/settings/hadea
interface HadeaConfigRequest {
  contractingAuthorityName: string;
  contractorName: string;
  specificContractNumber: string;
  specificContractDate: string;
  shippingAddress?: string;
}

// GET /api/settings/carrier-config
// GET /api/settings/carrier-config?carrier=UPS&shipmentType=OUTBOUND
// PUT /api/settings/carrier-config/:id

// GET /api/settings/document-templates
// PUT /api/settings/document-templates/:id
// Upload new template file via FormData
```

---

#### 7.4.5 Site/Lab Dossier View

```
┌──────────────────────────────────────────────────────────────────────┐
│  ◀ Sites  /  Munich Center                          [Edit]  [⋮]     │
├──────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌─────────────────────────────────────────────────────────────────┐ │
│  │  SITE INFORMATION                                                │ │
│  │  ───────────────────────────────────────────────────────────    │ │
│  │  Name:         Munich Center                                     │ │
│  │  Code:         MUC-001                                           │ │
│  │  Address:      Hauptstraße 123                                   │ │
│  │                80331 Munich, Germany                             │ │
│  │  Region:       EU                                                │ │
│  │  Status:       ● Active                                          │ │
│  └─────────────────────────────────────────────────────────────────┘ │
│                                                                       │
│  ┌─────────────────────────────────────────────────────────────────┐ │
│  │  CONTACTS                                      [+ Add Contact]   │ │
│  │  ───────────────────────────────────────────────────────────    │ │
│  │  ┌───────────────────────────────────────────────────────────┐  │ │
│  │  │ 👤 Dr. Hans Mueller (Primary)                    [Edit]   │  │ │
│  │  │    📧 hans.mueller@site.de  📞 +49 89 1234567            │  │ │
│  │  │    Department: Research                                   │  │ │
│  │  └───────────────────────────────────────────────────────────┘  │ │
│  │  ┌───────────────────────────────────────────────────────────┐  │ │
│  │  │ 👤 Anna Schmidt                                  [Edit]   │  │ │
│  │  │    📧 anna.schmidt@site.de  📞 +49 89 1234568            │  │ │
│  │  │    Department: Logistics                                  │  │ │
│  │  └───────────────────────────────────────────────────────────┘  │ │
│  └─────────────────────────────────────────────────────────────────┘ │
│                                                                       │
│  ┌─────────────────────────────────────────────────────────────────┐ │
│  │  ORDER HISTORY                                                   │ │
│  │  ───────────────────────────────────────────────────────────    │ │
│  │                                                                  │ │
│  │  Statistics                                                      │ │
│  │  ┌───────────┐ ┌───────────┐ ┌───────────┐                     │ │
│  │  │    48     │ │    12     │ │    4.0    │                     │ │
│  │  │   Total   │ │This Year  │ │ Avg/Month │                     │ │
│  │  └───────────┘ └───────────┘ └───────────┘                     │ │
│  │                                                                  │ │
│  │  Upcoming Orders                                                 │ │
│  │  ┌──────────────────────────────────────────────────────────┐   │ │
│  │  │ Order #      │ Sampling   │ Kit          │ Status        │   │ │
│  │  ├──────────────┼────────────┼──────────────┼───────────────┤   │ │
│  │  │ ORD-...-001  │ Jan 21     │ Standard x2  │ ● Approved    │   │ │
│  │  │ ORD-...-002  │ Jan 23     │ Standard x2  │ ● Approved    │   │ │
│  │  │ ORD-...-003  │ Feb 4      │ Extended x1  │ ○ Draft       │   │ │
│  │  └──────────────────────────────────────────────────────────┘   │ │
│  │                                          [View All Orders →]     │ │
│  └─────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────┘
```

### 7.5 Component Library (shadcn/ui based)

```typescript
// UI Components to implement/customize from shadcn/ui

// Layout Components
- Sidebar              // Collapsible navigation sidebar
- PageHeader           // Page title, breadcrumbs, action buttons
- PageWrapper          // Consistent page container with padding
- Card                 // Content card with header/body/footer slots

// Form Components  
- Input                // Text input with label, error state
- Select               // Single select dropdown
- MultiSelect          // Multi-selection with tags
- DatePicker           // Single date picker
- DateRangePicker      // Date range selection
- RadioGroup           // Radio button group
- Checkbox             // Checkbox with label
- Switch               // Toggle switch
- Textarea             // Multi-line text input
- FileUpload           // Drag-drop file upload
- Combobox             // Searchable select (for sites, labs)

// Data Display
- Table                // Data table with sorting, selection
- DataTable            // Advanced table with filtering, pagination
- Badge                // Status badges with colors
- Avatar               // User/entity avatars
- StatCard             // Statistics display card
- Timeline             // Activity/event timeline
- EmptyState           // Placeholder for empty lists

// Feedback
- Toast                // Toast notifications
- Alert                // Alert/warning messages
- Progress             // Progress bars
- Spinner              // Loading spinner
- Skeleton             // Loading skeleton placeholders

// Navigation
- Tabs                 // Tab navigation
- Breadcrumb           // Breadcrumb navigation
- Pagination           // Page navigation
- Stepper              // Multi-step wizard indicator

// Specialized Components (custom)
- OrderCard            // Order summary card
- ShipmentTimeline     // Shipment status with events
- CalendarDay          // Calendar day cell with indicators
- ContactCard          // Contact information display
- KitItemsEditor       // Kit items management table
- StockLevelIndicator  // Visual stock level display
```

### 7.6 State Management

```typescript
// src/lib/stores/order-wizard.store.ts
// Using Zustand for client state

import { create } from 'zustand';

interface OrderWizardState {
  step: 1 | 2 | 3 | 4;
  data: {
    siteId: string | null;
    kitId: string | null;
    quantity: number;
    outboundCarrier: 'UPS' | 'DHL' | null;
    labId: string | null;
    sampleCarrier: 'UPS' | 'DHL' | null;
    siteContactId: string | null;
    labContactId: string | null;
    samplingDates: Date[];
    notes: string;
  };
  // Actions
  setStep: (step: 1 | 2 | 3 | 4) => void;
  updateData: (data: Partial<OrderWizardState['data']>) => void;
  addSamplingDate: (date: Date) => void;
  removeSamplingDate: (date: Date) => void;
  reset: () => void;
}

// src/lib/hooks/use-orders.ts
// Using TanStack Query for server state

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export function useOrders(filters?: OrderFilters) {
  return useQuery({
    queryKey: ['orders', filters],
    queryFn: () => fetchOrders(filters),
  });
}

export function useOrder(id: string) {
  return useQuery({
    queryKey: ['orders', id],
    queryFn: () => fetchOrder(id),
    enabled: !!id,
  });
}

export function useCreateOrders() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createOrders,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['calendar'] });
    },
  });
}
```

---

## 8. Core Features & Modules

### 8.1 Order Management Module

#### 8.1.1 Order Creation Flow

```typescript
// src/lib/services/order.service.ts

interface CreateOrdersInput {
  siteId: string;
  labId: string;
  kitId: string;
  quantity: number;
  outboundCarrier: CarrierType;
  sampleCarrier: CarrierType;
  siteContactId: string;
  labContactId: string;
  samplingDates: Date[];
  notes?: string;
}

async function createOrders(input: CreateOrdersInput): Promise<Order[]> {
  const orders: Order[] = [];
  
  // Validate site, lab, kit exist and are active
  const [site, lab, kit] = await Promise.all([
    prisma.site.findUnique({ where: { id: input.siteId } }),
    prisma.lab.findUnique({ where: { id: input.labId } }),
    prisma.kit.findUnique({ where: { id: input.kitId }, include: { items: true } }),
  ]);
  
  if (!site || !lab || !kit) {
    throw new Error('Invalid site, lab, or kit');
  }
  
  // Check if customs documents needed
  const requiresCustomsDocs = !site.isEU || !lab.isEU;
  
  // Create order for each sampling date
  for (const samplingDate of input.samplingDates) {
    // Calculate outbound ship date (14 days before, adjusted for weekends)
    const outboundShipDate = calculateOutboundDate(samplingDate);
    
    // Generate order number
    const orderNumber = await generateOrderNumber(outboundShipDate);
    
    const order = await prisma.order.create({
      data: {
        orderNumber,
        siteId: input.siteId,
        labId: input.labId,
        kitId: input.kitId,
        quantity: input.quantity,
        outboundCarrier: input.outboundCarrier,
        sampleCarrier: input.sampleCarrier,
        siteContactId: input.siteContactId,
        labContactId: input.labContactId,
        samplingDate,
        outboundShipDate,
        requiresCustomsDocs,
        status: 'DRAFT',
        notes: input.notes,
      },
    });
    
    // Create shipment records
    await prisma.shipment.createMany({
      data: [
        {
          orderId: order.id,
          type: 'OUTBOUND',
          carrier: input.outboundCarrier,
          status: 'PENDING',
          scheduledShipDate: outboundShipDate,
        },
        {
          orderId: order.id,
          type: 'SAMPLE',
          carrier: input.sampleCarrier,
          status: 'PENDING',
          scheduledShipDate: samplingDate, // Ships on sampling date
        },
      ],
    });
    
    orders.push(order);
  }
  
  return orders;
}

// Date calculation utility
function calculateOutboundDate(samplingDate: Date): Date {
  // Subtract 14 days
  let outboundDate = subDays(samplingDate, 14);
  
  // If Saturday, move to Monday
  if (isSaturday(outboundDate)) {
    outboundDate = addDays(outboundDate, 2);
  }
  // If Sunday, move to Monday
  else if (isSunday(outboundDate)) {
    outboundDate = addDays(outboundDate, 1);
  }
  
  return outboundDate;
}

// Order number generation
async function generateOrderNumber(date: Date): Promise<string> {
  const dateStr = format(date, 'yyyyMMdd');
  const prefix = `ORD-${format(date, 'yyyy')}-${dateStr}`;
  
  // Count existing orders for this date
  const count = await prisma.order.count({
    where: {
      orderNumber: { startsWith: prefix },
    },
  });
  
  const sequence = String(count + 1).padStart(3, '0');
  return `${prefix}-${sequence}`;
}
```

#### 8.1.2 Order Approval & Stock Deduction

```typescript
async function approveOrder(
  orderId: string, 
  userId: string
): Promise<{ order: Order; stockDeducted: StockMovement[] }> {
  return prisma.$transaction(async (tx) => {
    // Get order with kit items
    const order = await tx.order.findUnique({
      where: { id: orderId },
      include: {
        kit: {
          include: {
            items: {
              include: { stockItem: true },
            },
          },
        },
      },
    });
    
    if (!order) throw new Error('Order not found');
    if (order.status !== 'DRAFT' && order.status !== 'PENDING_APPROVAL') {
      throw new Error('Order cannot be approved in current status');
    }
    
    const stockMovements: StockMovement[] = [];
    
    // Deduct stock for each kit item × quantity
    for (const kitItem of order.kit.items) {
      const totalDeduction = kitItem.quantity * order.quantity;
      
      // Check stock availability
      if (kitItem.stockItem.quantity < totalDeduction) {
        throw new Error(
          `Insufficient stock for ${kitItem.stockItem.name}. ` +
          `Required: ${totalDeduction}, Available: ${kitItem.stockItem.quantity}`
        );
      }
      
      // Deduct stock
      await tx.stockItem.update({
        where: { id: kitItem.stockItemId },
        data: { quantity: { decrement: totalDeduction } },
      });
      
      // Record movement
      const movement = await tx.stockMovement.create({
        data: {
          stockItemId: kitItem.stockItemId,
          orderId: order.id,
          quantityChange: -totalDeduction,
          movementType: 'ORDER_ALLOCATION',
          createdById: userId,
          notes: `Allocated for order ${order.orderNumber}`,
        },
      });
      
      stockMovements.push(movement);
    }
    
    // Update order status
    const updatedOrder = await tx.order.update({
      where: { id: orderId },
      data: {
        status: 'APPROVED',
        approvedAt: new Date(),
        approvedById: userId,
      },
    });
    
    return { order: updatedOrder, stockDeducted: stockMovements };
  });
}
```

### 8.2 Calendar Module

```typescript
// src/lib/services/calendar.service.ts

interface CalendarEntry {
  date: string;
  outboundCount: number;
  samplingCount: number;
  orders: {
    id: string;
    orderNumber: string;
    type: 'outbound' | 'sampling';
    siteName: string;
    labName: string;
    status: OrderStatus;
    kitName: string;
    quantity: number;
  }[];
}

async function getCalendarData(
  startDate: Date,
  endDate: Date,
  filters?: { siteId?: string; labId?: string }
): Promise<CalendarEntry[]> {
  // Get all orders in date range
  const orders = await prisma.order.findMany({
    where: {
      AND: [
        {
          OR: [
            { outboundShipDate: { gte: startDate, lte: endDate } },
            { samplingDate: { gte: startDate, lte: endDate } },
          ],
        },
        filters?.siteId ? { siteId: filters.siteId } : {},
        filters?.labId ? { labId: filters.labId } : {},
        { status: { not: 'CANCELLED' } },
      ],
    },
    include: {
      site: true,
      lab: true,
      kit: true,
    },
  });
  
  // Group by date
  const dateMap = new Map<string, CalendarEntry>();
  
  // Initialize all dates in range
  let currentDate = startDate;
  while (currentDate <= endDate) {
    const dateStr = format(currentDate, 'yyyy-MM-dd');
    dateMap.set(dateStr, {
      date: dateStr,
      outboundCount: 0,
      samplingCount: 0,
      orders: [],
    });
    currentDate = addDays(currentDate, 1);
  }
  
  // Populate with orders
  for (const order of orders) {
    // Outbound entry
    const outboundDateStr = format(order.outboundShipDate, 'yyyy-MM-dd');
    if (dateMap.has(outboundDateStr)) {
      const entry = dateMap.get(outboundDateStr)!;
      entry.outboundCount++;
      entry.orders.push({
        id: order.id,
        orderNumber: order.orderNumber,
        type: 'outbound',
        siteName: order.site.name,
        labName: order.lab.name,
        status: order.status,
        kitName: order.kit.name,
        quantity: order.quantity,
      });
    }
    
    // Sampling entry
    const samplingDateStr = format(order.samplingDate, 'yyyy-MM-dd');
    if (dateMap.has(samplingDateStr)) {
      const entry = dateMap.get(samplingDateStr)!;
      entry.samplingCount++;
      entry.orders.push({
        id: order.id,
        orderNumber: order.orderNumber,
        type: 'sampling',
        siteName: order.site.name,
        labName: order.lab.name,
        status: order.status,
        kitName: order.kit.name,
        quantity: order.quantity,
      });
    }
  }
  
  return Array.from(dateMap.values());
}
```

---

## 9. Document Generation System

### 9.1 Document Types Overview

| Document | When Generated | Required Data |
|----------|----------------|---------------|
| Box Content Label (Outbound) | With order creation | HaDEA config, site address, kit items |
| Box Content Label (Sample) | With order creation | HaDEA config, lab address, kit items |
| Non-ADR Declaration | When preparing outbound | Sample shipment waybill number |
| Shipping Label (Outbound) | When preparing outbound | Carrier API |
| Shipping Label (Sample) | When preparing sample | Carrier API |
| Packing List | For non-EU shipments | Kit items, prices |
| Commercial Invoice | For non-EU shipments | Kit items, prices, addresses |
| Proof of Delivery | Retrieved from carrier | Carrier API after delivery |

### 9.2 Box Content Label Generator

Based on the analyzed templates, the Box Content Labels have this structure:

```typescript
// src/lib/documents/generators/box-content-label.ts

import { 
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  WidthType, AlignmentType, BorderStyle, VerticalAlign 
} from 'docx';

interface BoxContentLabelData {
  // Header info (from HaDEA config)
  contractingAuthorityName: string;
  contractorName: string;
  specificContractNumber: string;
  specificContractDate: Date;
  
  // Addresses
  shippingAddress?: string;     // For sample label (from warehouse/HaDEA)
  deliveryAddress: string;      // Site for outbound, Lab for sample
  
  // Delivery info
  expectedDeliveryDate: Date;
  
  // Items
  items: {
    itemNo?: string;            // For sample label
    description: string;
    quantity: number;
    unit?: string;              // For outbound label
  }[];
}

async function generateBoxContentLabelOutbound(
  orderId: string
): Promise<Buffer> {
  // Fetch order with related data
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      site: true,
      kit: { include: { items: { include: { stockItem: true } } } },
    },
  });
  
  // Fetch HaDEA config
  const hadeaConfig = await prisma.hadeaConfig.findFirst({
    where: { isActive: true },
  });
  
  if (!order || !hadeaConfig) {
    throw new Error('Order or HaDEA config not found');
  }
  
  // Build delivery address string
  const deliveryAddress = [
    order.site.name,
    order.site.addressLine1,
    order.site.addressLine2,
    `${order.site.postalCode} ${order.site.city}`,
    order.site.countryName,
  ].filter(Boolean).join('\n');
  
  // Build items list
  const items = order.kit.items.map(item => ({
    description: item.stockItem.name,
    quantity: item.quantity * order.quantity,
    unit: 'pcs',
  }));
  
  // Generate document
  const doc = createBoxContentLabelDocument({
    type: 'outbound',
    contractingAuthorityName: hadeaConfig.contractingAuthorityName,
    contractorName: hadeaConfig.contractorName,
    specificContractNumber: hadeaConfig.specificContractNumber,
    specificContractDate: hadeaConfig.specificContractDate,
    deliveryAddress,
    expectedDeliveryDate: order.outboundShipDate,
    items,
  });
  
  return Packer.toBuffer(doc);
}

function createBoxContentLabelDocument(data: {
  type: 'outbound' | 'sample';
  contractingAuthorityName: string;
  contractorName: string;
  specificContractNumber: string;
  specificContractDate: Date;
  shippingAddress?: string;
  deliveryAddress: string;
  expectedDeliveryDate: Date;
  items: { itemNo?: string; description: string; quantity: number; unit?: string }[];
}): Document {
  const border = { style: BorderStyle.SINGLE, size: 1, color: '000000' };
  const borders = { top: border, bottom: border, left: border, right: border };
  
  // Header table rows
  const headerRows = [
    createLabelRow('Name of Contracting Authority', data.contractingAuthorityName),
  ];
  
  // Add shipping address for sample label
  if (data.type === 'sample' && data.shippingAddress) {
    headerRows.push(createLabelRow('Shipping Address', data.shippingAddress));
  }
  
  headerRows.push(
    createLabelRow('Delivery Address', data.deliveryAddress),
    createLabelRow('Name of Contractor', data.contractorName),
    createLabelRow('Number of Specific Contract', data.specificContractNumber),
    createLabelRow('Date of Specific Contract', format(data.specificContractDate, 'dd/MM/yyyy')),
    createLabelRow('Date of Delivery (Expected)', format(data.expectedDeliveryDate, 'dd/MM/yyyy')),
  );
  
  // Items table
  const itemsHeader = data.type === 'sample'
    ? ['Item No.', 'Item Description', 'Qty']
    : ['Item Description', 'Qty', 'Unit'];
  
  const itemRows = data.items.map(item => {
    if (data.type === 'sample') {
      return createItemRowSample(item.itemNo || '', item.description, item.quantity);
    } else {
      return createItemRowOutbound(item.description, item.quantity, item.unit || '');
    }
  });
  
  return new Document({
    sections: [{
      properties: {
        page: {
          size: { width: 5670, height: 11907 },  // Label size from template
          margin: { top: 0, right: 0, bottom: 0, left: 0 },
        },
      },
      children: [
        // Title
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 200, after: 200 },
          children: [
            new TextRun({
              text: 'Box Contents Label',
              bold: true,
              font: 'Arial',
              size: 24,
            }),
          ],
        }),
        // Header table
        new Table({
          width: { size: 4819, type: WidthType.DXA },
          rows: headerRows,
        }),
        // Spacing
        new Paragraph({ spacing: { before: 200 } }),
        // Items table header
        new Table({
          width: { size: 4957, type: WidthType.DXA },
          rows: [
            createItemsHeaderRow(itemsHeader),
            ...itemRows,
          ],
        }),
      ],
    }],
  });
}

// Helper functions for creating table rows
function createLabelRow(label: string, value: string): TableRow {
  return new TableRow({
    children: [
      new TableCell({
        width: { size: 2244, type: WidthType.DXA },
        verticalAlign: VerticalAlign.CENTER,
        children: [
          new Paragraph({
            children: [
              new TextRun({ text: label, bold: true, font: 'Arial', size: 16 }),
            ],
          }),
        ],
      }),
      new TableCell({
        width: { size: 2575, type: WidthType.DXA },
        verticalAlign: VerticalAlign.CENTER,
        children: [
          new Paragraph({
            children: [
              new TextRun({ text: value, font: 'Arial', size: 16 }),
            ],
          }),
        ],
      }),
    ],
  });
}
```

### 9.3 Non-ADR Declaration Generator

```typescript
// src/lib/documents/generators/non-adr-declaration.ts

interface NonAdrDeclarationData {
  orderNumber: string;
  siteAddress: string;
  labAddress: string;
  sampleWaybillNumber: string;  // Required - from sample shipment
  kitDescription: string;
  declaredValue: number;
  declarationDate: Date;
}

async function generateNonAdrDeclaration(orderId: string): Promise<Buffer> {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      site: true,
      lab: true,
      kit: true,
      shipments: {
        where: { type: 'SAMPLE' },
      },
    },
  });
  
  if (!order) throw new Error('Order not found');
  
  const sampleShipment = order.shipments[0];
  if (!sampleShipment?.waybillNumber) {
    throw new Error('Sample shipment waybill number required for Non-ADR declaration');
  }
  
  // Generate document using template
  // (Implementation depends on specific Non-ADR declaration format)
  
  return generateNonAdrDocument({
    orderNumber: order.orderNumber,
    siteAddress: formatAddress(order.site),
    labAddress: formatAddress(order.lab),
    sampleWaybillNumber: sampleShipment.waybillNumber,
    kitDescription: order.kit.description || order.kit.name,
    declaredValue: 0, // Or calculate from kit items
    declarationDate: new Date(),
  });
}
```

### 9.4 Document Service

```typescript
// src/lib/services/document.service.ts

import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const BUCKET_NAME = process.env.S3_BUCKET_NAME!;

async function generateAndStoreDocument(
  orderId: string,
  type: DocumentType
): Promise<Document> {
  let buffer: Buffer;
  let fileName: string;
  let fileType: string;
  
  // Generate document based on type
  switch (type) {
    case 'BOX_CONTENT_LABEL_OUTBOUND':
      buffer = await generateBoxContentLabelOutbound(orderId);
      fileName = `box-content-label-outbound-${orderId}.docx`;
      fileType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      break;
      
    case 'BOX_CONTENT_LABEL_SAMPLE':
      buffer = await generateBoxContentLabelSample(orderId);
      fileName = `box-content-label-sample-${orderId}.docx`;
      fileType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      break;
      
    case 'NON_ADR_DECLARATION':
      buffer = await generateNonAdrDeclaration(orderId);
      fileName = `non-adr-declaration-${orderId}.docx`;
      fileType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      break;
      
    // ... other document types
      
    default:
      throw new Error(`Unknown document type: ${type}`);
  }
  
  // Upload to S3
  const filePath = `documents/${orderId}/${fileName}`;
  
  await s3Client.send(new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: filePath,
    Body: buffer,
    ContentType: fileType,
  }));
  
  // Store document record
  const document = await prisma.document.create({
    data: {
      orderId,
      type,
      fileName,
      filePath,
      fileType,
      fileSize: buffer.length,
    },
  });
  
  return document;
}

async function getDocumentBuffer(documentId: string): Promise<Buffer> {
  const document = await prisma.document.findUnique({
    where: { id: documentId },
  });
  
  if (!document) throw new Error('Document not found');
  
  const response = await s3Client.send(new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: document.filePath,
  }));
  
  return Buffer.from(await response.Body!.transformToByteArray());
}
```

---

## 10. Background Processes & Automation

### 10.1 Job Queue Setup

```typescript
// src/lib/jobs/queue.ts

import { Queue, Worker, Job } from 'bullmq';
import Redis from 'ioredis';

const connection = new Redis(process.env.REDIS_URL!);

// Define queues
export const podRetrievalQueue = new Queue('pod-retrieval', { connection });
export const statusSyncQueue = new Queue('status-sync', { connection });
export const notificationQueue = new Queue('notifications', { connection });
export const stockAlertQueue = new Queue('stock-alerts', { connection });

// Schedule recurring jobs
export async function setupRecurringJobs() {
  // POD retrieval every hour
  await podRetrievalQueue.add(
    'retrieve-pending-pods',
    {},
    { repeat: { every: 60 * 60 * 1000 } }  // Every hour
  );
  
  // Status sync every 30 minutes
  await statusSyncQueue.add(
    'sync-shipment-status',
    {},
    { repeat: { every: 30 * 60 * 1000 } }  // Every 30 minutes
  );
  
  // Stock alerts daily at 8am
  await stockAlertQueue.add(
    'check-stock-levels',
    {},
    { repeat: { cron: '0 8 * * *' } }  // Daily at 8am
  );
}
```

### 10.2 POD Retrieval Job

```typescript
// src/lib/jobs/pod-retrieval.job.ts

import { Worker, Job } from 'bullmq';

const podRetrievalWorker = new Worker(
  'pod-retrieval',
  async (job: Job) => {
    console.log('Starting POD retrieval job');
    
    // Find shipments that are delivered but POD not yet retrieved
    const shipmentsNeedingPod = await prisma.shipment.findMany({
      where: {
        status: 'DELIVERED',
        podRetrieved: false,
        actualDeliveryDate: { not: null },
      },
      include: { order: true },
    });
    
    console.log(`Found ${shipmentsNeedingPod.length} shipments needing POD`);
    
    for (const shipment of shipmentsNeedingPod) {
      try {
        let podResult;
        
        // Retrieve POD from carrier
        if (shipment.carrier === 'UPS') {
          podResult = await upsClient.getProofOfDelivery(shipment.trackingNumber!);
        } else {
          podResult = await dhlClient.getProofOfDelivery(shipment.trackingNumber!);
        }
        
        if (podResult.available) {
          // Store POD document
          const document = await storeDocument({
            orderId: shipment.orderId,
            shipmentId: shipment.id,
            type: shipment.type === 'OUTBOUND' 
              ? 'PROOF_OF_DELIVERY_OUTBOUND' 
              : 'PROOF_OF_DELIVERY_SAMPLE',
            buffer: Buffer.from(podResult.podBase64!, 'base64'),
            fileName: `pod-${shipment.trackingNumber}.pdf`,
            fileType: 'application/pdf',
          });
          
          // Update shipment
          await prisma.shipment.update({
            where: { id: shipment.id },
            data: {
              podRetrieved: true,
              podRetrievedAt: new Date(),
              podSignedBy: podResult.signedBy,
            },
          });
          
          console.log(`POD retrieved for shipment ${shipment.id}`);
        }
      } catch (error) {
        console.error(`Failed to retrieve POD for shipment ${shipment.id}:`, error);
      }
    }
    
    return { processed: shipmentsNeedingPod.length };
  },
  { connection }
);
```

### 10.3 Status Sync Job

```typescript
// src/lib/jobs/status-sync.job.ts

const statusSyncWorker = new Worker(
  'status-sync',
  async (job: Job) => {
    console.log('Starting shipment status sync');
    
    // Find active shipments (not delivered or cancelled)
    const activeShipments = await prisma.shipment.findMany({
      where: {
        status: {
          in: ['LABEL_CREATED', 'PICKED_UP', 'IN_TRANSIT', 'OUT_FOR_DELIVERY'],
        },
        trackingNumber: { not: null },
      },
    });
    
    for (const shipment of activeShipments) {
      try {
        let trackingInfo;
        
        if (shipment.carrier === 'UPS') {
          trackingInfo = await upsClient.getTracking(shipment.trackingNumber!);
        } else {
          trackingInfo = await dhlClient.getTracking(shipment.trackingNumber!);
        }
        
        // Map carrier status to our status
        const newStatus = mapCarrierStatus(shipment.carrier, trackingInfo.status);
        
        // Update shipment if status changed
        if (newStatus !== shipment.status) {
          await prisma.shipment.update({
            where: { id: shipment.id },
            data: {
              status: newStatus,
              expectedDeliveryDate: trackingInfo.estimatedDelivery 
                ? new Date(trackingInfo.estimatedDelivery) 
                : undefined,
              actualDeliveryDate: newStatus === 'DELIVERED' 
                ? new Date() 
                : undefined,
            },
          });
          
          // Update order status if needed
          await updateOrderStatusFromShipment(shipment.orderId, shipment.type, newStatus);
        }
        
        // Store new tracking events
        for (const event of trackingInfo.events) {
          await prisma.trackingEvent.upsert({
            where: {
              shipmentId_eventCode_eventDate: {
                shipmentId: shipment.id,
                eventCode: event.code,
                eventDate: new Date(event.date),
              },
            },
            create: {
              shipmentId: shipment.id,
              eventCode: event.code,
              eventDescription: event.description,
              location: event.location,
              eventDate: new Date(event.date),
              rawData: event,
            },
            update: {},
          });
        }
      } catch (error) {
        console.error(`Failed to sync status for shipment ${shipment.id}:`, error);
      }
    }
    
    return { synced: activeShipments.length };
  },
  { connection }
);

// Helper to update order status based on shipment status
async function updateOrderStatusFromShipment(
  orderId: string,
  shipmentType: ShipmentType,
  shipmentStatus: ShipmentStatus
) {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) return;
  
  let newOrderStatus: OrderStatus | null = null;
  
  if (shipmentType === 'OUTBOUND') {
    switch (shipmentStatus) {
      case 'PICKED_UP':
      case 'IN_TRANSIT':
        newOrderStatus = 'OUTBOUND_SHIPPED';
        break;
      case 'DELIVERED':
        newOrderStatus = 'OUTBOUND_DELIVERED';
        break;
    }
  } else if (shipmentType === 'SAMPLE') {
    switch (shipmentStatus) {
      case 'PICKED_UP':
      case 'IN_TRANSIT':
        newOrderStatus = 'SAMPLE_SHIPPED';
        break;
      case 'DELIVERED':
        newOrderStatus = 'SAMPLE_DELIVERED';
        // Also mark as completed
        newOrderStatus = 'COMPLETED';
        break;
    }
  }
  
  if (newOrderStatus && newOrderStatus !== order.status) {
    await prisma.order.update({
      where: { id: orderId },
      data: { status: newOrderStatus },
    });
  }
}
```

---

## 11. External API Integrations

### 11.1 UPS API Integration

```typescript
// src/lib/carriers/ups/client.ts

import axios, { AxiosInstance } from 'axios';

interface UPSConfig {
  clientId: string;
  clientSecret: string;
  accountNumber: string;
  environment: 'sandbox' | 'production';
}

class UPSClient {
  private client: AxiosInstance;
  private accessToken: string | null = null;
  private tokenExpiry: Date | null = null;
  
  constructor(private config: UPSConfig) {
    const baseURL = config.environment === 'production'
      ? 'https://onlinetools.ups.com/api'
      : 'https://wwwcie.ups.com/api';
      
    this.client = axios.create({ baseURL });
  }
  
  private async getAccessToken(): Promise<string> {
    if (this.accessToken && this.tokenExpiry && this.tokenExpiry > new Date()) {
      return this.accessToken;
    }
    
    const response = await axios.post(
      `${this.client.defaults.baseURL}/security/v1/oauth/token`,
      'grant_type=client_credentials',
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        auth: {
          username: this.config.clientId,
          password: this.config.clientSecret,
        },
      }
    );
    
    this.accessToken = response.data.access_token;
    this.tokenExpiry = new Date(Date.now() + (response.data.expires_in - 60) * 1000);
    
    return this.accessToken;
  }
  
  async createShipment(params: {
    shipperAddress: Address;
    shipToAddress: Address;
    packages: Package[];
    serviceCode: string;
  }): Promise<{
    trackingNumber: string;
    labelImage: string;
    labelFormat: string;
  }> {
    const token = await this.getAccessToken();
    
    const response = await this.client.post(
      '/shipments/v2403/ship',
      {
        ShipmentRequest: {
          Shipment: {
            Shipper: {
              Name: params.shipperAddress.name,
              Address: {
                AddressLine: [params.shipperAddress.line1, params.shipperAddress.line2].filter(Boolean),
                City: params.shipperAddress.city,
                StateProvinceCode: params.shipperAddress.state,
                PostalCode: params.shipperAddress.postalCode,
                CountryCode: params.shipperAddress.countryCode,
              },
              ShipperNumber: this.config.accountNumber,
            },
            ShipTo: {
              Name: params.shipToAddress.name,
              Address: {
                AddressLine: [params.shipToAddress.line1, params.shipToAddress.line2].filter(Boolean),
                City: params.shipToAddress.city,
                StateProvinceCode: params.shipToAddress.state,
                PostalCode: params.shipToAddress.postalCode,
                CountryCode: params.shipToAddress.countryCode,
              },
            },
            Service: {
              Code: params.serviceCode,
            },
            Package: params.packages.map(pkg => ({
              Packaging: { Code: '02' },  // Customer Packaging
              Dimensions: {
                UnitOfMeasurement: { Code: 'CM' },
                Length: String(pkg.length),
                Width: String(pkg.width),
                Height: String(pkg.height),
              },
              PackageWeight: {
                UnitOfMeasurement: { Code: 'KGS' },
                Weight: String(pkg.weight),
              },
            })),
          },
          LabelSpecification: {
            LabelImageFormat: { Code: 'PNG' },
            LabelStockSize: { Height: '6', Width: '4' },
          },
        },
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );
    
    const result = response.data.ShipmentResponse.ShipmentResults;
    
    return {
      trackingNumber: result.PackageResults[0].TrackingNumber,
      labelImage: result.PackageResults[0].ShippingLabel.GraphicImage,
      labelFormat: 'PNG',
    };
  }
  
  async getTracking(trackingNumber: string): Promise<TrackingInfo> {
    const token = await this.getAccessToken();
    
    const response = await this.client.get(
      `/track/v1/details/${trackingNumber}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    
    const shipment = response.data.trackResponse.shipment[0];
    const pkg = shipment.package[0];
    
    return {
      status: mapUPSStatus(pkg.currentStatus.code),
      statusDescription: pkg.currentStatus.description,
      estimatedDelivery: pkg.deliveryDate?.[0]?.date,
      events: pkg.activity.map((act: any) => ({
        date: act.date,
        time: act.time,
        location: act.location?.address?.city,
        description: act.status.description,
        code: act.status.code,
      })),
    };
  }
  
  async getProofOfDelivery(trackingNumber: string): Promise<PODResult> {
    const token = await this.getAccessToken();
    
    try {
      const response = await this.client.get(
        `/paperless-documents/v1/shipments/${trackingNumber}/documents/POD`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: 'arraybuffer',
        }
      );
      
      return {
        available: true,
        podBase64: Buffer.from(response.data).toString('base64'),
        signedBy: response.headers['x-ups-signedby'],
        deliveredAt: response.headers['x-ups-deliverydate'],
      };
    } catch (error) {
      return { available: false };
    }
  }
}

export const upsClient = new UPSClient({
  clientId: process.env.UPS_CLIENT_ID!,
  clientSecret: process.env.UPS_CLIENT_SECRET!,
  accountNumber: process.env.UPS_ACCOUNT_NUMBER!,
  environment: process.env.NODE_ENV === 'production' ? 'production' : 'sandbox',
});
```

### 11.2 DHL API Integration

```typescript
// src/lib/carriers/dhl/client.ts

class DHLClient {
  private client: AxiosInstance;
  
  constructor(private config: DHLConfig) {
    const baseURL = config.environment === 'production'
      ? 'https://api-eu.dhl.com'
      : 'https://api-sandbox.dhl.com';
      
    this.client = axios.create({
      baseURL,
      headers: {
        'DHL-API-Key': config.apiKey,
      },
    });
  }
  
  async createShipment(params: ShipmentParams): Promise<ShipmentResult> {
    const response = await this.client.post('/express/shipping/v2/shipments', {
      productCode: params.serviceCode,
      accounts: [{
        typeCode: 'shipper',
        number: this.config.accountNumber,
      }],
      customerDetails: {
        shipperDetails: formatDHLAddress(params.shipperAddress),
        receiverDetails: formatDHLAddress(params.shipToAddress),
      },
      content: {
        packages: params.packages.map(pkg => ({
          weight: pkg.weight,
          dimensions: {
            length: pkg.length,
            width: pkg.width,
            height: pkg.height,
          },
        })),
        declaredValue: params.declaredValue,
        declaredValueCurrency: 'EUR',
      },
      outputImageProperties: {
        imageOptions: [{
          typeCode: 'label',
          templateName: 'ECOM26_A6_002',
        }],
      },
    });
    
    const result = response.data;
    
    return {
      trackingNumber: result.shipmentTrackingNumber,
      waybillNumber: result.packages[0]?.waybillNumber,
      labelImage: result.documents[0]?.content,
      labelFormat: 'PDF',
    };
  }
  
  async getTracking(trackingNumber: string): Promise<TrackingInfo> {
    const response = await this.client.get(
      `/track/shipments?trackingNumber=${trackingNumber}`
    );
    
    const shipment = response.data.shipments[0];
    
    return {
      status: mapDHLStatus(shipment.status.statusCode),
      statusDescription: shipment.status.description,
      estimatedDelivery: shipment.estimatedDeliveryDate,
      events: shipment.events.map((event: any) => ({
        date: event.timestamp,
        location: event.location?.address?.addressLocality,
        description: event.description,
        code: event.typeCode,
      })),
    };
  }
  
  async getProofOfDelivery(trackingNumber: string): Promise<PODResult> {
    try {
      const response = await this.client.get(
        `/track/proof-of-delivery/${trackingNumber}`,
        { responseType: 'arraybuffer' }
      );
      
      return {
        available: true,
        podBase64: Buffer.from(response.data).toString('base64'),
      };
    } catch {
      return { available: false };
    }
  }
}

export const dhlClient = new DHLClient({
  apiKey: process.env.DHL_API_KEY!,
  accountNumber: process.env.DHL_ACCOUNT_NUMBER!,
  environment: process.env.NODE_ENV === 'production' ? 'production' : 'sandbox',
});
```

---

## 12. Security Requirements

### 12.1 Authentication & Authorization

```typescript
// Use NextAuth.js with credentials provider

// src/app/api/auth/[...nextauth]/route.ts
import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { compare } from 'bcryptjs';

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });
        
        if (!user || !user.isActive) return null;
        
        const isValid = await compare(credentials.password, user.passwordHash);
        if (!isValid) return null;
        
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.userId = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role;
        session.user.id = token.userId;
      }
      return session;
    },
  },
  session: {
    strategy: 'jwt',
    maxAge: 8 * 60 * 60, // 8 hours
  },
});

export { handler as GET, handler as POST };
```

### 12.2 Role-Based Access Control

```typescript
// src/lib/auth/permissions.ts

type Permission = 
  | 'orders:read' | 'orders:create' | 'orders:update' | 'orders:delete' | 'orders:approve'
  | 'sites:read' | 'sites:create' | 'sites:update' | 'sites:delete'
  | 'labs:read' | 'labs:create' | 'labs:update' | 'labs:delete'
  | 'kits:read' | 'kits:create' | 'kits:update' | 'kits:delete'
  | 'stock:read' | 'stock:create' | 'stock:update' | 'stock:adjust'
  | 'settings:read' | 'settings:update'
  | 'users:read' | 'users:create' | 'users:update' | 'users:delete';

const rolePermissions: Record<UserRole, Permission[]> = {
  ADMIN: [
    'orders:read', 'orders:create', 'orders:update', 'orders:delete', 'orders:approve',
    'sites:read', 'sites:create', 'sites:update', 'sites:delete',
    'labs:read', 'labs:create', 'labs:update', 'labs:delete',
    'kits:read', 'kits:create', 'kits:update', 'kits:delete',
    'stock:read', 'stock:create', 'stock:update', 'stock:adjust',
    'settings:read', 'settings:update',
    'users:read', 'users:create', 'users:update', 'users:delete',
  ],
  OPERATIONS_MANAGER: [
    'orders:read', 'orders:create', 'orders:update', 'orders:approve',
    'sites:read', 'sites:create', 'sites:update',
    'labs:read', 'labs:create', 'labs:update',
    'kits:read', 'kits:create', 'kits:update',
    'stock:read', 'stock:adjust',
    'settings:read',
  ],
  WAREHOUSE_OPERATOR: [
    'orders:read', 'orders:update',
    'sites:read',
    'labs:read',
    'kits:read',
    'stock:read', 'stock:adjust',
  ],
  VIEWER: [
    'orders:read',
    'sites:read',
    'labs:read',
    'kits:read',
    'stock:read',
  ],
};

export function hasPermission(role: UserRole, permission: Permission): boolean {
  return rolePermissions[role]?.includes(permission) ?? false;
}

// Middleware for API routes
export function requirePermission(permission: Permission) {
  return async (req: NextRequest) => {
    const session = await getServerSession();
    
    if (!session?.user) {
      return NextResponse.json({ error: { code: 'UNAUTHORIZED' } }, { status: 401 });
    }
    
    if (!hasPermission(session.user.role, permission)) {
      return NextResponse.json({ error: { code: 'FORBIDDEN' } }, { status: 403 });
    }
    
    return null; // Continue to handler
  };
}
```

### 12.3 Security Best Practices

| Area | Implementation |
|------|----------------|
| Password Storage | bcrypt with cost factor 12 |
| Session | JWT with 8-hour expiry, HTTP-only cookies |
| API Authentication | Bearer tokens |
| Input Validation | Zod schemas for all inputs |
| SQL Injection | Prisma ORM (parameterized queries) |
| XSS | React's built-in escaping, CSP headers |
| CSRF | SameSite cookies, CSRF tokens for forms |
| File Upload | Type validation, size limits, virus scanning |
| Rate Limiting | Redis-based rate limiting on auth endpoints |
| Audit Logging | Log all write operations with user ID |

---

## 13. Deployment Strategy

### 13.1 Docker Configuration

```dockerfile
# Dockerfile
FROM node:20-alpine AS base

# Dependencies stage
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# Builder stage
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
RUN npm run build

# Runner stage
FROM base AS runner
WORKDIR /app
ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma

USER nextjs
EXPOSE 3000
ENV PORT 3000

CMD ["node", "server.js"]
```

### 13.2 Docker Compose (Development)

```yaml
# docker-compose.yml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://postgres:postgres@db:5432/sklms
      - REDIS_URL=redis://redis:6379
      - NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
      - NEXTAUTH_URL=http://localhost:3000
    depends_on:
      - db
      - redis
    volumes:
      - ./uploads:/app/uploads

  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=postgres
      - POSTGRES_DB=sklms
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  minio:
    image: minio/minio
    ports:
      - "9000:9000"
      - "9001:9001"
    environment:
      - MINIO_ROOT_USER=minioadmin
      - MINIO_ROOT_PASSWORD=minioadmin
    volumes:
      - minio_data:/data
    command: server /data --console-address ":9001"

  worker:
    build: .
    command: ["node", "jobs/worker.js"]
    environment:
      - DATABASE_URL=postgresql://postgres:postgres@db:5432/sklms
      - REDIS_URL=redis://redis:6379
    depends_on:
      - db
      - redis

volumes:
  postgres_data:
  redis_data:
  minio_data:
```

### 13.3 Environment Variables

```bash
# .env.example

# Database
DATABASE_URL="postgresql://user:password@localhost:5432/sklms"

# Redis
REDIS_URL="redis://localhost:6379"

# NextAuth
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"

# File Storage (S3/MinIO)
S3_ENDPOINT="http://localhost:9000"
S3_BUCKET_NAME="sklms-documents"
AWS_ACCESS_KEY_ID="minioadmin"
AWS_SECRET_ACCESS_KEY="minioadmin"
AWS_REGION="us-east-1"

# UPS API
UPS_CLIENT_ID=""
UPS_CLIENT_SECRET=""
UPS_ACCOUNT_NUMBER=""

# DHL API
DHL_API_KEY=""
DHL_ACCOUNT_NUMBER=""

# Application
NODE_ENV="development"
```

---

## 14. Testing Strategy

### 14.1 Testing Layers

| Layer | Tool | Coverage Target |
|-------|------|-----------------|
| Unit Tests | Jest | 80% for services |
| Integration Tests | Jest + Supertest | All API endpoints |
| E2E Tests | Playwright | Critical user flows |
| Component Tests | React Testing Library | Key UI components |

### 14.2 Example Tests

```typescript
// tests/unit/services/order.service.test.ts

describe('OrderService', () => {
  describe('calculateOutboundDate', () => {
    it('should return date 14 days before sampling', () => {
      const samplingDate = new Date('2026-01-21');
      const result = calculateOutboundDate(samplingDate);
      expect(result).toEqual(new Date('2026-01-07'));
    });
    
    it('should move Saturday to Monday', () => {
      const samplingDate = new Date('2026-01-25'); // 14 days before = Sat Jan 11
      const result = calculateOutboundDate(samplingDate);
      expect(result).toEqual(new Date('2026-01-13')); // Monday
    });
    
    it('should move Sunday to Monday', () => {
      const samplingDate = new Date('2026-01-26'); // 14 days before = Sun Jan 12
      const result = calculateOutboundDate(samplingDate);
      expect(result).toEqual(new Date('2026-01-13')); // Monday
    });
  });
  
  describe('approveOrder', () => {
    it('should deduct stock on approval', async () => {
      // Setup
      const order = await createTestOrder();
      const initialStock = await getStockQuantity(order.kit.items[0].stockItemId);
      
      // Execute
      await approveOrder(order.id, testUserId);
      
      // Verify
      const finalStock = await getStockQuantity(order.kit.items[0].stockItemId);
      expect(finalStock).toBe(initialStock - order.kit.items[0].quantity * order.quantity);
    });
    
    it('should throw error if insufficient stock', async () => {
      const order = await createTestOrderWithHighQuantity();
      
      await expect(approveOrder(order.id, testUserId))
        .rejects.toThrow('Insufficient stock');
    });
  });
});

// tests/e2e/order-creation.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Order Creation Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'password');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/');
  });
  
  test('should create order through wizard', async ({ page }) => {
    // Navigate to new order
    await page.click('text=New Order');
    await expect(page).toHaveURL('/orders/new');
    
    // Step 1: Site & Kit
    await page.click('[data-testid="site-select"]');
    await page.click('text=Munich Center');
    await page.click('[data-testid="kit-select"]');
    await page.click('text=Standard Kit');
    await page.fill('[data-testid="quantity-input"]', '2');
    await page.click('[data-testid="carrier-dhl"]');
    await page.click('[data-testid="lab-select"]');
    await page.click('text=Central Lab');
    await page.click('button:has-text("Next")');
    
    // Step 2: Contacts
    await page.click('[data-testid="site-contact-select"]');
    await page.click('text=Dr. Hans Mueller');
    await page.click('[data-testid="lab-contact-select"]');
    await page.click('text=Lab Reception');
    await page.click('button:has-text("Next")');
    
    // Step 3: Schedule
    await page.click('[data-testid="calendar-day-21"]');
    await page.click('[data-testid="calendar-day-23"]');
    await page.click('button:has-text("Next")');
    
    // Step 4: Review & Approve
    await expect(page.locator('text=Total Orders: 2')).toBeVisible();
    await page.click('button:has-text("Approve & Create")');
    
    // Verify success
    await expect(page.locator('text=Orders created successfully')).toBeVisible();
    await expect(page).toHaveURL('/orders');
  });
});
```

---

## 15. Appendices

### 15.1 Order Status Workflow Diagram

```
                    ┌─────────┐
                    │  DRAFT  │
                    └────┬────┘
                         │ Submit
                         ▼
               ┌─────────────────────┐
               │ PENDING_APPROVAL    │
               └──────────┬──────────┘
                          │ Approve
                          ▼
                   ┌─────────────┐
                   │  APPROVED   │
                   └──────┬──────┘
                          │ Prepare Outbound
                          ▼
              ┌───────────────────────┐
              │ OUTBOUND_PREPARING    │
              └───────────┬───────────┘
                          │ Ship
                          ▼
              ┌───────────────────────┐
              │   OUTBOUND_SHIPPED    │
              └───────────┬───────────┘
                          │ Delivered
                          ▼
              ┌───────────────────────┐
              │  OUTBOUND_DELIVERED   │
              └───────────┬───────────┘
                          │ Sampling starts
                          ▼
              ┌───────────────────────┐
              │ SAMPLING_IN_PROGRESS  │
              └───────────┬───────────┘
                          │ Prepare Sample
                          ▼
              ┌───────────────────────┐
              │   SAMPLE_PREPARING    │
              └───────────┬───────────┘
                          │ Ship
                          ▼
              ┌───────────────────────┐
              │    SAMPLE_SHIPPED     │
              └───────────┬───────────┘
                          │ Delivered
                          ▼
              ┌───────────────────────┐
              │   SAMPLE_DELIVERED    │
              └───────────┬───────────┘
                          │ Auto-complete
                          ▼
                   ┌─────────────┐
                   │  COMPLETED  │
                   └─────────────┘

    * CANCELLED can occur from any state before COMPLETED
```

### 15.2 Box Content Label Template Structure

Based on the analyzed templates:

**Outbound Label Fields:**
| Field | Source |
|-------|--------|
| Name of Contracting Authority | HaDEA Config |
| Delivery Address | Site Address |
| Name of Contractor | HaDEA Config |
| Number of Specific Contract | HaDEA Config |
| Date of Specific Contract | HaDEA Config |
| Date of Delivery (Expected) | Order.outboundShipDate |
| Item Description | StockItem.name |
| Qty | KitItem.quantity × Order.quantity |
| Unit | "pcs" |

**Sample Label Fields:**
| Field | Source |
|-------|--------|
| Name of Contracting Authority | HaDEA Config |
| Shipping Address | HaDEA Config (warehouse) |
| Delivery Address | Lab Address |
| Name of Contractor | HaDEA Config |
| Number of Specific Contract | HaDEA Config |
| Date of Specific Contract | HaDEA Config |
| Date of Delivery (Expected) | Order.samplingDate |
| Item No. | Sequential |
| Item Description | StockItem.name |
| Qty | KitItem.quantity × Order.quantity |

### 15.3 Glossary

| Term | Definition |
|------|------------|
| Order | A complete transaction including outbound and sample shipments |
| Outbound Shipment | Delivery of sample kits from warehouse to site |
| Sample Shipment | Return of completed samples from site to lab |
| Site | Location where sampling is performed |
| Lab | Laboratory that receives and analyzes samples |
| Kit | Pre-configured package of items needed for sampling |
| Sampling Date | Date when sampling occurs at the site |
| POD | Proof of Delivery - document confirming delivery |
| Non-ADR Declaration | Declaration for non-dangerous goods transport |
| HaDEA | Health and Digital Executive Agency (EU body) |
| Waybill | Transport document issued by carrier |

### 15.4 Document Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | Jan 8, 2026 | Claude AI | Initial specification document |

---

**End of Technical Specification Document**
