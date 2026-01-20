# Quick Start Guide for Claude Code

## Project Overview

You're building a **Kit Order Management System** to replace Excel-based tracking of consumable kit shipments. The system manages:
- **Outbound shipments**: Warehouse → Collection Sites
- **Sample shipments**: Collection Sites → Laboratories

## Key Files

| File | What It Contains |
|------|-----------------|
| `schema_v4.sql` | Complete PostgreSQL schema - run this to create the database |
| `PROJECT_HANDOFF.md` | Full project context, business logic, and requirements |
| `COLUMN_MAPPING.md` | How Excel columns map to database fields |
| `shipping_scenario_logic.md` | How the AREA/region system works |
| `items_kits_structure.md` | How the Bill of Materials (items/kits) works |

## Database Setup

```bash
# 1. Create database
createdb kit_order_management

# 2. Run schema (creates all tables, triggers, views, sample data)
psql -d kit_order_management -f schema_v4.sql
```

## Core Tables

```
orders              → Order-level info (site, lab, dates, forwarders)
order_boxes         → Box-level info (linked outbound + sample waybills)
sites               → Collection sites
labs                → Laboratories  
kit_types           → Kit configurations
kit_items           → Items in each kit (BOM)
items               → Individual components
shipping_scenarios  → AREA lookup (9 scenarios, items 89-97)
countries           → Country → Region mapping
```

## Key Automation

1. **Order numbers** auto-generate as "ORD-YYYY-NNNN"
2. **Shipping scenario** auto-determined from site/lab regions
3. **Default forwarders** inherited from site
4. **Kit weight** auto-calculated from components

## Critical Business Logic

### Waybill Pairing
Each `order_boxes` record contains BOTH:
- `outbound_waybill` (warehouse → site)
- `sample_waybill` (site → lab)

This solves the main pain point: knowing which waybills belong together.

### Region-Based Scenarios
Site region + Lab region → Shipping scenario → Contract Item Number

Example: Site in Netherlands (EU) + Lab in UK (Non-EU Europe) = Scenario 2, Item 90

### Migration Data Quality
Historical data has `waybill_match_verified = FALSE` because we don't know the actual pairing. New data will have `TRUE`.

## Recommended Tech Stack

- **Database**: PostgreSQL (schema provided)
- **Backend**: Python + FastAPI + SQLAlchemy
- **API Style**: REST

## Next Steps

1. Set up PostgreSQL and run schema
2. Create migration script for Excel data
3. Build API endpoints (CRUD for all entities)
4. Build UI for order management

## Questions to Clarify

- Authentication requirements?
- Email notifications needed?
- Label generation integration?
- Reporting requirements?
