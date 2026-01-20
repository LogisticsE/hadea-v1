# Kit Order Management System - Project Handoff Document

## Executive Summary

This document summarizes the database architecture design for migrating a consumable kit order management system from Excel to a relational database. The system manages recurring orders of sampling kits that are shipped from a warehouse to collection sites, and then from sites to laboratories.

---

## Business Context

### Current Process (Excel-based)
1. **Warehouse** packs consumable kits in advance
2. Kits are shipped **outbound** from warehouse → site
3. **Site** receives boxes, uses consumables to take samples
4. Site ships the **sample** boxes → lab

### Current Pain Points
- Two separate Excel sheets (outbound & sample) with no link between waybill numbers
- Outbound sheet uses quantity > 1 with semicolon-separated waybill numbers
- Sample sheet always has quantity = 1
- No visibility on which outbound waybill corresponds to which sample waybill
- Difficult to track individual boxes or handle exceptions (e.g., lost boxes)

### Solution
A relational database with a **two-level hierarchy**:
- **Order Level**: General information (site, lab, dates, forwarders)
- **Box Level**: Individual box information with linked outbound + sample waybills

---

## Source Data Structure (Excel)

### Sheets in the Current Excel System

#### 1. Outbound Sheet
Tracks warehouse → site shipments.

| Column | Description |
|--------|-------------|
| ID | Unique identifier |
| Type | Type of outbound shipment |
| Quantity | Number of boxes (can be > 1) |
| Confirmed Sampling Date | Date when sample is taken by site |
| Shipping Date (SD-14) | Date boxes leave warehouse |
| WEEKNUM | Week number (formula) |
| YY-MM | Year-Month (formula) |
| ToSite-UPSName | Receiving site name (UPS format) |
| ToSite-HaDEAName | Receiving site name (HaDEA format) |
| SHIP VIA | Forwarder (UPS/DHL) |
| Box picked by | Employee who picked the box |
| Box checked by | Employee who checked the box |
| Label created by | Employee who created the label |
| WAYBILLNUMBER | Waybill number(s) - semicolon separated if qty > 1 |
| LABELGENERATED | Box content label generated flag |
| Notified Simona | Contact notified flag |
| Exception | Exception notes |
| Notes | General notes |
| + several formula columns | CONFIRMEDDATE, CITY, COUNTRY, etc. |

#### 2. Sample Sheet
Tracks site → lab shipments.

| Column | Description |
|--------|-------------|
| ID | Unique identifier |
| Type | Type of sample shipment |
| Quantity | Always 1 |
| Confirmed Sampling Date | Date when sample is taken |
| Confirmed Pick-up Date | Date boxes picked up at site |
| WEEKNUM | Week number (formula) |
| YY-MM | Year-Month (formula) |
| FromSite-UPS | Sending site name |
| FromSiteName, FromSite2, FromSite3 | Alternative site names |
| ToLab | Receiving laboratory |
| SHIP VIA | Forwarder (UPS/DHL) |
| Label created by | Employee who created the label |
| WAYBILLNUMBER | Waybill number |
| Collection booked by | Employee who booked collection |
| COLLECTIONID | Collection ID |
| Barcode Sequence | Barcode sequence of tubes |
| NONADRGENERATED | Non-ADR document generated flag |
| BOXCONTENTGENERATED | Box content label generated flag |
| Notified Simona | Contact notified flag |
| Exception | Exception notes |
| Notes | General notes |
| + formula columns | item no., item description, combi, etc. |

#### 3. Sites Sheet
Reference data for collection sites.

| Column | Description |
|--------|-------------|
| ID | Unique identifier |
| Contact Name | Contact person |
| Company or Name | Primary name |
| Country | Country name |
| Address 1, 2, 3 | Address lines |
| City | City |
| State/Prov/Other | State or province |
| Postal Code | Postal code |
| Telephone, Ext | Phone number |
| Residential Ind | Residential indicator |
| Consignee Email | Email address |
| PickUpTimeFrom, PickUpTimeTo | Pickup time window |
| FromSiteName, FromSite2-5 | Alternative names |
| Delivery Address | Full formatted address |
| Preferred Collection Location | Collection location notes |
| NOTES, INTERNAL NOTES, ADDITIONAL NOTE | Various notes |
| AREA | Region code (EU, Non-EU Europe, Non-Europe) |
| Outbound via | Default outbound forwarder |
| Sample via | Default sample forwarder |

#### 4. Labs Sheet
Reference data for laboratories.

| Column | Description |
|--------|-------------|
| ID | Unique identifier |
| Contact Name | Contact person |
| Company or Name | Primary name |
| Country | Country name |
| Address 1, 2, 3 | Address lines |
| City | City |
| State/Prov/Other | State or province |
| Postal Code | Postal code |
| Telephone, Ext | Phone number |
| Residential Ind | Residential indicator |
| Consignee Email | Email address |
| Delivery Address | Full formatted address |
| AREA | Region code |
| Preferred Collection Location | Collection location notes |
| NOTES, INTERNAL NOTES | Notes fields |

#### 5. AREA Sheet (Shipping Scenarios)
Fixed lookup table for contract item numbers based on geographic regions.

| Scenario | From | To | Combi | Item No | Description |
|----------|------|-----|-------|---------|-------------|
| 1 | EU | EU | EUEU | 89 | Scenario 1 description |
| 2 | EU | Non-EU Europe | EUNon-EU Europe | 90 | Scenario 2 description |
| 3 | Non-EU Europe | EU | Non-EU EuropeEU | 91 | Scenario 3 description |
| 4 | Non-Europe | EU | Non-EuropeEU | 92 | Scenario 4 description |
| 5 | Non-Europe | Non-Europe | Non-EuropeNon-Europe | 93 | Scenario 5 description |
| 6 | Non-Europe | Non-EU Europe | Non-EuropeNon-EU Europe | 94 | Scenario 6 description |
| 7 | Non-EU Europe | Non-Europe | Non-EU EuropeNon-Europe | 95 | Scenario 7 description |
| 8 | EU | Non-Europe | EUNon-Europe | 96 | Scenario 8 description |
| 9 | Non-EU Europe | Non-EU Europe | Non-EU EuropeNon-EU Europe | 97 | Scenario 9 description |

#### 6. Kits Sheet
Kit type definitions with template references.

| Column | Description |
|--------|-------------|
| Nr. | Kit number (1, 2, 3...) |
| Naam | Kit name (e.g., "outbound-kit 1") |
| boxcontent-template | Template filename |
| doc | Full path to template |

---

## Database Design

### Design Principles

1. **Two-Level Hierarchy**: Orders contain general info; Order_Boxes contain per-box details
2. **Linked Waybills**: Each box record has BOTH outbound and sample waybill numbers
3. **Normalized Reference Data**: Sites, Labs, Kit Types, Items in separate tables
4. **Automatic Lookups**: Shipping scenario auto-determined from site/lab regions
5. **Bill of Materials**: Items and Kit compositions properly structured
6. **Data Quality Tracking**: Migrated data flagged for verification

### Entity Relationship Overview

```
┌─────────────┐     ┌─────────────┐     ┌───────────────────┐
│  countries  │────▶│   sites     │     │ shipping_scenarios│
└─────────────┘     └──────┬──────┘     └─────────┬─────────┘
                           │                      │
┌─────────────┐     ┌──────┴──────┐              │
│  countries  │────▶│    labs     │              │
└─────────────┘     └──────┬──────┘              │
                           │                      │
┌─────────────┐            │                      │
│    items    │            ▼                      ▼
└──────┬──────┘     ┌─────────────┐       ┌──────────────┐
       │            │   orders    │◀──────│ (auto-lookup)│
       ▼            └──────┬──────┘       └──────────────┘
┌─────────────┐            │
│  kit_items  │            │
└──────┬──────┘            ▼
       │            ┌─────────────┐
       ▼            │ order_boxes │
┌─────────────┐     └──────┬──────┘
│  kit_types  │            │
└─────────────┘            ▼
                    ┌─────────────┐
                    │ box_images  │
                    │box_documents│
                    └─────────────┘
```

### Tables Summary

| Table | Purpose |
|-------|---------|
| `countries` | Country → Region mapping (EU, Non-EU Europe, Non-Europe) |
| `shipping_scenarios` | The 9 AREA scenarios with Item No and descriptions |
| `sites` | Collection sites with all address and contact info |
| `labs` | Laboratories with all address and contact info |
| `items` | Individual components (tubes, packaging, labels, etc.) |
| `kit_types` | Kit configurations with dimensions and templates |
| `kit_items` | Bill of Materials - links items to kits with quantities |
| `users` | System users/employees |
| `shipping_accounts` | Forwarder account information |
| `orders` | Order-level information |
| `order_boxes` | Box-level information with linked waybills |
| `box_images` | Images attached to boxes |
| `box_documents` | Generated documents per box |
| `audit_log` | Change tracking for compliance |

### Key Automation (Triggers)

1. **Order Number Generation**: Auto-generates "ORD-YYYY-NNNN" format
2. **Shipping Scenario Lookup**: Auto-determines scenario from site/lab regions
3. **Default Forwarders**: Inherits from site if not specified
4. **Region Assignment**: Auto-sets region from country code
5. **Kit Weight Calculation**: Auto-calculates total weight from components
6. **Updated Timestamps**: Auto-updates `updated_at` on all tables

### Data Migration Strategy

For historical data where outbound and sample waybills cannot be verified:
- Random matching of waybills within the same order
- `is_migrated_data = TRUE` flag
- `waybill_match_verified = FALSE` flag
- Ability to verify later using photos and update the flag

---

## Files Included

| File | Description |
|------|-------------|
| `schema_v4.sql` | Complete PostgreSQL schema with all tables, triggers, views |
| `column_mapping.md` | Detailed mapping from Excel columns to database fields |
| `shipping_scenario_logic.md` | Explanation of AREA/scenario auto-lookup |
| `items_kits_structure.md` | Explanation of Bill of Materials structure |
| `PROJECT_HANDOFF.md` | This document |

---

## Next Steps for Implementation

### 1. Database Setup
```bash
# Create PostgreSQL database
createdb kit_order_management

# Run schema
psql -d kit_order_management -f schema_v4.sql
```

### 2. Data Migration (Priority Order)
1. Countries (already in schema)
2. Shipping Scenarios (already in schema)
3. Sites (from Sites Excel sheet)
4. Labs (from Labs Excel sheet)
5. Items (manual entry or from inventory list)
6. Kit Types (from Kits Excel sheet)
7. Kit Items (define contents for each kit)
8. Orders + Order Boxes (from Outbound + Sample sheets)

### 3. API Development
Recommended endpoints:
- `GET/POST/PUT/DELETE /api/sites`
- `GET/POST/PUT/DELETE /api/labs`
- `GET/POST/PUT/DELETE /api/items`
- `GET/POST/PUT/DELETE /api/kit-types`
- `GET/POST/PUT/DELETE /api/orders`
- `GET/POST/PUT/DELETE /api/orders/{id}/boxes`
- `GET /api/shipping-scenarios`
- `GET /api/boxes/search?waybill=xxx` (search by either waybill)

### 4. User Interface
Key screens needed:
- Order list with filters (status, date range, site, lab)
- Order detail with box grid
- Box detail with waybill pair and status
- Sites/Labs management
- Kit configuration (items + BOM)
- Verification queue (unverified migrated data)

---

## Technical Recommendations

### Database
- **PostgreSQL** (chosen for robust JSON support, triggers, and views)
- Consider adding full-text search indexes for waybill lookups

### Backend
- **Python + FastAPI** recommended
- SQLAlchemy for ORM
- Alembic for migrations
- Pydantic for validation

### Frontend
- React with TypeScript
- Or integrate with existing interface

### File Storage
- Store images/documents in object storage (S3, MinIO, or local filesystem)
- Keep only paths in database

---

## Questions for Future Development

1. **Authentication**: Do you need user login with roles/permissions?
2. **Notifications**: Should the system send email notifications (e.g., to Simona)?
3. **Label Generation**: Should the system generate box content labels, or integrate with existing macro?
4. **Reporting**: What reports/exports are needed?
5. **Integration**: Any integration with UPS/DHL APIs for waybill creation?

---

## Glossary

| Term | Definition |
|------|------------|
| Outbound | Shipment from warehouse to collection site |
| Sample | Shipment from collection site to laboratory |
| Waybill | Tracking number from shipping carrier |
| Kit | Pre-packed box of consumables for sampling |
| AREA | Geographic region combination for contract pricing |
| Non-ADR | Document for non-dangerous goods shipment |
| Simona | Contact person who receives notifications |
