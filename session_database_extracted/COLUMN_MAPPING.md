# Excel to Database Column Mapping

This document provides complete mapping from Excel sheets to database tables.

---

## Sites Sheet → `sites` Table

| Excel Column | Database Column | Type | Notes |
|-------------|-----------------|------|-------|
| ID | `legacy_id` | VARCHAR(50) | Preserved for migration reference |
| Contact Name | `contact_name` | VARCHAR(255) | |
| Company or Name | `company_or_name` | VARCHAR(255) | **Primary identifier** |
| Country | `country` | VARCHAR(100) | |
| - | `country_code` | CHAR(2) | Lookup from countries table |
| Address 1 | `address_1` | VARCHAR(255) | |
| Address 2 | `address_2` | VARCHAR(255) | |
| Address 3 | `address_3` | VARCHAR(255) | |
| City | `city` | VARCHAR(100) | |
| State/Prov/Other | `state_province` | VARCHAR(100) | |
| Postal Code | `postal_code` | VARCHAR(20) | |
| Telephone | `telephone` | VARCHAR(50) | |
| Ext | `telephone_ext` | VARCHAR(20) | |
| Residential Ind | `residential_ind` | BOOLEAN | |
| Consignee Email | `consignee_email` | VARCHAR(255) | |
| PickUpTimeFrom | `pickup_time_from` | TIME | |
| PickUpTimeTo | `pickup_time_to` | TIME | |
| FromSiteName | `from_site_name` | VARCHAR(255) | Alternative name 1 |
| FromSite2 | `from_site_2` | VARCHAR(255) | Alternative name 2 |
| FromSite3 | `from_site_3` | VARCHAR(255) | Alternative name 3 |
| FromSite4 | `from_site_4` | VARCHAR(255) | Alternative name 4 |
| FromSite5 | `from_site_5` | VARCHAR(255) | Alternative name 5 |
| Delivery Address | `delivery_address` | TEXT | Full formatted address |
| Preferred Collection Location | `preferred_collection_location` | TEXT | |
| NOTES | `notes` | TEXT | |
| INTERNAL NOTES | `internal_notes` | TEXT | |
| ADDITIONAL NOTE | `additional_notes` | TEXT | |
| AREA | `region` | ENUM | Maps to: EU, Non-EU Europe, Non-Europe |
| Outbound via | `outbound_via` | ENUM | UPS, DHL, etc. |
| Sample via | `sample_via` | ENUM | UPS, DHL, etc. |
| - | `is_active` | BOOLEAN | New field, default TRUE |

---

## Labs Sheet → `labs` Table

| Excel Column | Database Column | Type | Notes |
|-------------|-----------------|------|-------|
| ID | `legacy_id` | VARCHAR(50) | Preserved for migration reference |
| Contact Name | `contact_name` | VARCHAR(255) | |
| Company or Name | `company_or_name` | VARCHAR(255) | **Primary identifier** |
| Country | `country` | VARCHAR(100) | |
| - | `country_code` | CHAR(2) | Lookup from countries table |
| Address 1 | `address_1` | VARCHAR(255) | |
| Address 2 | `address_2` | VARCHAR(255) | |
| Address 3 | `address_3` | VARCHAR(255) | |
| City | `city` | VARCHAR(100) | |
| State/Prov/Other | `state_province` | VARCHAR(100) | |
| Postal Code | `postal_code` | VARCHAR(20) | |
| Telephone | `telephone` | VARCHAR(50) | |
| Ext | `telephone_ext` | VARCHAR(20) | |
| Residential Ind | `residential_ind` | BOOLEAN | |
| Consignee Email | `consignee_email` | VARCHAR(255) | |
| Delivery Address | `delivery_address` | TEXT | Full formatted address |
| AREA | `region` | ENUM | Maps to: EU, Non-EU Europe, Non-Europe |
| Preferred Collection Location | `preferred_collection_location` | TEXT | |
| NOTES | `notes` | TEXT | |
| INTERNAL NOTES | `internal_notes` | TEXT | |
| - | `is_active` | BOOLEAN | New field, default TRUE |

---

## AREA Sheet → `shipping_scenarios` Table

| Excel Column | Database Column | Type | Notes |
|-------------|-----------------|------|-------|
| scenario | `scenario_number` | INTEGER | 1-9 |
| from | `region_from` | ENUM | EU, Non-EU Europe, Non-Europe |
| to | `region_to` | ENUM | EU, Non-EU Europe, Non-Europe |
| combi | `combi` | VARCHAR(50) | e.g., "EUEU", "EUNon-EU Europe" |
| Item No | `item_no` | INTEGER | Contract item number (89-97) |
| Description | `description` | TEXT | Contract item description |
| - | `requires_customs` | BOOLEAN | Derived: TRUE if regions differ in EU status |

**Pre-populated data** (included in schema):
```
Scenario 1: EU → EU = Item 89
Scenario 2: EU → Non-EU Europe = Item 90
Scenario 3: Non-EU Europe → EU = Item 91
Scenario 4: Non-Europe → EU = Item 92
Scenario 5: Non-Europe → Non-Europe = Item 93
Scenario 6: Non-Europe → Non-EU Europe = Item 94
Scenario 7: Non-EU Europe → Non-Europe = Item 95
Scenario 8: EU → Non-Europe = Item 96
Scenario 9: Non-EU Europe → Non-EU Europe = Item 97
```

---

## Kits Sheet → `kit_types` Table

| Excel Column | Database Column | Type | Notes |
|-------------|-----------------|------|-------|
| Nr. | `legacy_nr` | INTEGER | Original kit number |
| Naam | `name` | VARCHAR(100) | Kit name |
| boxcontent-template | `box_content_template_outbound` | VARCHAR(255) | Template filename |
| doc | `template_path` | TEXT | Full path to template |
| - | `description` | TEXT | New field |
| - | `box_length_cm` | DECIMAL | New field - box dimensions |
| - | `box_width_cm` | DECIMAL | New field - box dimensions |
| - | `box_height_cm` | DECIMAL | New field - box dimensions |
| - | `box_weight_empty_grams` | DECIMAL | New field |
| - | `total_weight_grams` | DECIMAL | Auto-calculated from items |
| - | `is_urgent` | BOOLEAN | Derived from name containing "URGENT" |
| - | `is_active` | BOOLEAN | New field, default TRUE |

---

## Outbound Sheet → `orders` + `order_boxes` Tables

### Order Level (one row per unique order)

| Excel Column | Database Table.Column | Notes |
|-------------|----------------------|-------|
| ID | `orders.order_number` | Human-readable identifier |
| Type | `orders.outbound_type` | |
| Confirmed Sampling Date | `orders.confirmed_sampling_date` | |
| Shipping Date (SD-14) | `orders.outbound_shipping_date` | |
| ToSite-UPSName | `orders.site_id` → `sites` | FK lookup by name |
| ToSite-HaDEAName | (same FK, different name field) | |
| SHIP VIA | `orders.outbound_forwarder` | UPS/DHL enum |
| Notes | `orders.notes` | |
| - | `orders.shipping_scenario_id` | Auto-set from site/lab regions |
| - | `orders.status` | New field |

### Box Level (one row per physical box)

| Excel Column | Database Table.Column | Notes |
|-------------|----------------------|-------|
| Quantity | *Count of `order_boxes`* | No longer stored; derived |
| WAYBILLNUMBER | `order_boxes.outbound_waybill` | **Split** semicolon-separated values |
| Label created by | `order_boxes.outbound_label_created_by_name` | |
| Box picked by | `order_boxes.box_picked_by_name` | |
| Box checked by | `order_boxes.box_checked_by_name` | |
| LABELGENERATED | `order_boxes.box_content_generated_outbound` | |
| Notified Simona | `order_boxes.notified_simona` | |
| Exception | `order_boxes.exception` | |
| - | `order_boxes.box_number` | Sequential: 1, 2, 3... |
| - | `order_boxes.is_migrated_data` | TRUE for imported data |
| - | `order_boxes.waybill_match_verified` | FALSE for imported data |

### Formula Columns (no longer stored; computed via queries/views)

| Excel Column | Replacement |
|-------------|-------------|
| WEEKNUM | `EXTRACT(WEEK FROM outbound_shipping_date)` |
| YY-MM | `TO_CHAR(outbound_shipping_date, 'YY-MM')` |
| CONFIRMEDDATE | Not needed; DATE type handles formatting |
| CITY | `sites.city` via JOIN |
| COUNTRY | `sites.country` via JOIN |
| DELIVERYADDRESS | `sites.delivery_address` via JOIN |
| EXPECTEDDELIVERYDATE | Same as `outbound_shipping_date` |
| BOXCONTENTTEMPLATE | `kit_types.box_content_template_outbound` via JOIN |

---

## Sample Sheet → `orders` + `order_boxes` Tables

### Order Level (merged with outbound order)

| Excel Column | Database Table.Column | Notes |
|-------------|----------------------|-------|
| ID | *Match to existing order* | Same order as outbound |
| Type | `orders.sample_type` | |
| Confirmed Sampling Date | `orders.confirmed_sampling_date` | Should match outbound |
| Confirmed Pick-up Date | `orders.confirmed_pickup_date` | |
| FromSite-UPS | `orders.site_id` | Should match outbound |
| ToLab | `orders.lab_id` → `labs` | FK lookup by name |
| SHIP VIA | `orders.sample_forwarder` | |
| Collection booked by | `orders.collection_booked_by_name` | |
| COLLECTIONID | `orders.collection_id` | |

### Box Level (merged with outbound box)

| Excel Column | Database Table.Column | Notes |
|-------------|----------------------|-------|
| WAYBILLNUMBER | `order_boxes.sample_waybill` | **Linked to outbound box** |
| Label created by | `order_boxes.sample_label_created_by_name` | |
| Barcode Sequence | `order_boxes.barcode_sequence` | |
| NONADRGENERATED | `order_boxes.nonadr_generated` | |
| BOXCONTENTGENERATED | `order_boxes.box_content_generated_sample` | |
| Notified Simona | `order_boxes.notified_simona` | May already be set from outbound |
| Exception | `order_boxes.exception` | Append to existing if present |

### Formula Columns (computed via queries/views)

| Excel Column | Replacement |
|-------------|-------------|
| WEEKNUM | `EXTRACT(WEEK FROM confirmed_pickup_date)` |
| YY-MM | `TO_CHAR(confirmed_pickup_date, 'YY-MM')` |
| WEEKNUM-KIT | Computed from `outbound_shipping_date` |
| shippingadres | `sites.delivery_address` via JOIN |
| deliveryadres | `labs.delivery_address` via JOIN |
| item no. | `shipping_scenarios.item_no` via JOIN |
| item description | `shipping_scenarios.description` via JOIN |
| combi | `shipping_scenarios.combi` via JOIN |
| CITY | `sites.city` via JOIN |
| COUNTRY | `sites.country` via JOIN |

---

## Migration: Linking Outbound and Sample Data

### The Challenge
- Outbound: `ID=ORD-001, Qty=3, WAYBILLNUMBER="1Z111;1Z222;1Z333"`
- Sample: 3 rows for ORD-001 with waybills "9876543210", "9876543211", "9876543212"
- **No existing link** between outbound waybill 1Z111 and sample waybill 9876543210

### The Solution
1. Split outbound waybills by semicolon → create 3 `order_boxes` records
2. Match sample rows to same order by ID + sampling date
3. Assign sample waybills to boxes **randomly** (order unknown)
4. Flag records: `is_migrated_data=TRUE`, `waybill_match_verified=FALSE`
5. Allow manual verification later using photos

### Migration SQL Pattern
```sql
-- For migrated data
INSERT INTO order_boxes (
    order_id, 
    box_number, 
    outbound_waybill, 
    sample_waybill,
    is_migrated_data,
    waybill_match_verified
) VALUES (
    'order-uuid',
    1,
    '1Z111',           -- From split outbound
    '9876543210',      -- Randomly assigned from sample
    TRUE,              -- Migrated
    FALSE              -- Unverified pairing
);
```

---

## New Fields Not in Excel

These fields are added to improve the system:

| Field | Table | Purpose |
|-------|-------|---------|
| UUID `id` | All | Database primary keys |
| `legacy_id` / `legacy_nr` | sites, labs, kit_types | Preserve Excel IDs |
| `country_code` | sites, labs | Links to countries table for region lookup |
| `region` | sites, labs | EU / Non-EU Europe / Non-Europe |
| `status` | orders, order_boxes | Track shipment lifecycle |
| `shipping_scenario_id` | orders | Auto-set FK to scenarios table |
| `is_active` | Reference tables | Soft delete capability |
| `created_at` | All | Audit timestamp |
| `updated_at` | All | Audit timestamp |
| `is_migrated_data` | order_boxes | TRUE for imported records |
| `waybill_match_verified` | order_boxes | FALSE if pairing unverified |
| `verification_notes` | order_boxes | Notes about verification |
| `verified_by`, `verified_at` | order_boxes | Who/when verified |
| Items table | New | Bill of Materials for kits |
| `kit_items` table | New | Links items to kits |
| `box_dimensions` | kit_types | Length, width, height |
| `total_weight_grams` | kit_types | Auto-calculated |
