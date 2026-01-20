# Prisma Schema Migration Plan

## Overview

This document outlines the incremental migration from the current Prisma schema to incorporate features from schema_v4.sql while preserving existing functionality.

## Migration Phases

### Phase 1: Reference Tables (Foundation)

#### 1.1 Add GeographicRegion Enum
```prisma
enum GeographicRegion {
  EU
  NON_EU_EUROPE    // Maps to 'Non-EU Europe'
  NON_EUROPE       // Maps to 'Non-Europe'
}
```

#### 1.2 Add Countries Table
- Primary key: `code` (ISO 2-letter)
- Contains 27 EU countries, 12 Non-EU Europe, 12+ Non-Europe
- Used for automatic region lookup

#### 1.3 Add ShippingScenario Table (AREA Logic)
- 9 fixed scenarios (item numbers 89-97)
- Links region_from → region_to combinations
- Includes `requiresCustoms` flag

---

### Phase 2: Extend Sites & Labs

#### 2.1 Sites - New Fields
| Field | Type | Purpose |
|-------|------|---------|
| `legacyId` | String? | Excel ID for migration |
| `region` | GeographicRegion? | Replaces isEU boolean |
| `companyOrName` | String | Alias for name |
| `fromSiteName` | String? | Alternative name 1 |
| `fromSite2-5` | String? | Alternative names 2-5 |
| `telephone` | String? | Phone number |
| `telephoneExt` | String? | Extension |
| `consigneeEmail` | String? | Delivery email |
| `residentialInd` | Boolean | Is residential address |
| `deliveryAddress` | String? | Full formatted address |
| `pickupTimeFrom` | String? | Pickup window start |
| `pickupTimeTo` | String? | Pickup window end |
| `preferredCollectionLocation` | String? | Collection notes |
| `outboundVia` | CarrierType? | Default outbound carrier |
| `sampleVia` | CarrierType? | Default sample carrier |
| `internalNotes` | String? | Internal notes |
| `additionalNotes` | String? | Additional notes |
| `countryId` | String? | FK to countries table |

#### 2.2 Labs - New Fields
| Field | Type | Purpose |
|-------|------|---------|
| `legacyId` | String? | Excel ID for migration |
| `region` | GeographicRegion? | Replaces isEU boolean |
| `companyOrName` | String | Alias for name |
| `telephone` | String? | Phone number |
| `telephoneExt` | String? | Extension |
| `consigneeEmail` | String? | Delivery email |
| `residentialInd` | Boolean | Is residential address |
| `deliveryAddress` | String? | Full formatted address |
| `preferredCollectionLocation` | String? | Collection notes |
| `internalNotes` | String? | Internal notes |
| `countryId` | String? | FK to countries table |

---

### Phase 3: Enhance Stock Items (Items)

#### 3.1 StockItem - New Fields for Customs
| Field | Type | Purpose |
|-------|------|---------|
| `category` | ItemCategory | tube, container, packaging, etc. |
| `hsCode` | String? | Harmonized System code |
| `countryOfOrigin` | String? | FK to countries |
| `customsDescription` | String? | Description for customs |
| `customsValueEur` | Float? | Declared customs value |
| `isDangerousGoods` | Boolean | Requires special handling |
| `unNumber` | String? | UN number if dangerous |
| `requiresColdChain` | Boolean | Temperature sensitive |
| `storageTempMinC` | Float? | Min storage temp |
| `storageTempMaxC` | Float? | Max storage temp |
| `supplierName` | String? | Supplier |
| `supplierItemCode` | String? | Supplier's SKU |
| `volumeMl` | Float? | Volume for tubes/containers |

#### 3.2 Add ItemCategory Enum
```prisma
enum ItemCategory {
  TUBE
  CONTAINER
  PACKAGING
  DOCUMENTATION
  LABEL
  ABSORBENT
  COOLING
  OTHER
}
```

---

### Phase 4: Kit Enhancements

#### 4.1 Kit - New Fields
| Field | Type | Purpose |
|-------|------|---------|
| `legacyNr` | Int? | Excel Nr. column |
| `boxLengthCm` | Float? | Box length |
| `boxWidthCm` | Float? | Box width |
| `boxHeightCm` | Float? | Box height |
| `boxWeightEmptyGrams` | Float? | Empty box weight |
| `boxContentTemplateOutbound` | String? | Template filename |
| `boxContentTemplateSample` | String? | Template filename |
| `templatePath` | String? | Full template path |
| `isUrgent` | Boolean | Urgent kit flag |
| `requiresCustomsDocs` | Boolean | Customs required |
| `requiresNonadr` | Boolean | Non-ADR required |

#### 4.2 KitItem - New Fields
| Field | Type | Purpose |
|-------|------|---------|
| `isRequired` | Boolean | Mandatory item? |
| `sortOrder` | Int | Display order |
| `notes` | String? | Special notes |

---

### Phase 5: Order Box System (Critical)

#### 5.1 Add BoxStatus Enum
```prisma
enum BoxStatus {
  PENDING
  PACKED
  SHIPPED_OUTBOUND
  AT_SITE
  SHIPPED_SAMPLE
  AT_LAB
  COMPLETED
  LOST
  DAMAGED
  RETURNED
}
```

#### 5.2 Add OrderBox Model
This is the **critical new table** that links outbound and sample waybills.

| Field | Type | Purpose |
|-------|------|---------|
| `id` | String | Primary key |
| `orderId` | String | FK to Order |
| `boxNumber` | Int | Box sequence (1, 2, 3...) |
| **Outbound Fields** | | |
| `outboundWaybill` | String? | Outbound tracking number |
| `outboundLabelCreatedById` | String? | Who created label |
| `outboundLabelCreatedAt` | DateTime? | When label created |
| `boxContentGeneratedOutbound` | Boolean | Label generated flag |
| **Sample Fields** | | |
| `sampleWaybill` | String? | Sample tracking number |
| `sampleLabelCreatedById` | String? | Who created label |
| `sampleLabelCreatedAt` | DateTime? | When label created |
| `boxContentGeneratedSample` | Boolean | Label generated flag |
| `nonadrGenerated` | Boolean | Non-ADR doc generated |
| **Contents** | | |
| `barcodeSequence` | String? | e.g., "12345-12350" |
| `barcodeStart` | String? | First barcode |
| `barcodeEnd` | String? | Last barcode |
| `barcodeCount` | Int? | Number of barcodes |
| `barcodeDetails` | Json? | Detailed barcode info |
| **Warehouse Ops** | | |
| `boxPickedById` | String? | Who picked the box |
| `boxPickedAt` | DateTime? | When picked |
| `boxCheckedById` | String? | Who checked |
| `boxCheckedAt` | DateTime? | When checked |
| **Status** | | |
| `status` | BoxStatus | Current status |
| `exception` | String? | Exception notes |
| **Migration Flags** | | |
| `isMigratedData` | Boolean | From Excel import |
| `waybillMatchVerified` | Boolean | Pairing verified |
| `verificationNotes` | String? | Verification details |
| `verifiedById` | String? | Who verified |
| `verifiedAt` | DateTime? | When verified |

---

### Phase 6: Order Updates

#### 6.1 Order - New Fields
| Field | Type | Purpose |
|-------|------|---------|
| `shippingScenarioId` | String? | FK to ShippingScenario |
| `sampleType` | String? | Type of sample |
| `outboundType` | String? | Type of outbound |
| `confirmedSamplingDate` | DateTime? | Confirmed date |
| `confirmedPickupDate` | DateTime? | Confirmed pickup |
| `outboundShippingDate` | DateTime? | Outbound ship date |
| `collectionBookedById` | String? | Who booked collection |
| `collectionId` | String? | Carrier collection ID |

#### 6.2 Order - New Relations
- `shippingScenario` → ShippingScenario
- `orderBoxes` → OrderBox[]

---

### Phase 7: Supporting Tables

#### 7.1 ShippingAccount Model
| Field | Type | Purpose |
|-------|------|---------|
| `id` | String | Primary key |
| `carrier` | CarrierType | UPS, DHL, etc. |
| `accountNumber` | String | Carrier account # |
| `accountName` | String? | Display name |
| `description` | String? | Notes |
| `isDefault` | Boolean | Default account |
| `isActive` | Boolean | Active flag |

#### 7.2 AuditLog Model
| Field | Type | Purpose |
|-------|------|---------|
| `id` | String | Primary key |
| `entityType` | String | Table name |
| `entityId` | String | Record ID |
| `action` | AuditAction | CREATE/UPDATE/DELETE |
| `changedFields` | Json? | Which fields changed |
| `oldValues` | Json? | Previous values |
| `newValues` | Json? | New values |
| `changedById` | String? | User who changed |
| `changedAt` | DateTime | When changed |
| `ipAddress` | String? | Client IP |
| `userAgent` | String? | Browser/client |

#### 7.3 BoxImage & BoxDocument Models
For storing images/documents linked to specific boxes.

---

## Data Migration Strategy

### Step 1: Schema Migration
1. Run `prisma migrate dev` with new schema
2. All new fields are optional to preserve existing data
3. Seed reference data (countries, shipping scenarios)

### Step 2: Data Backfill
1. Set `region` on Sites/Labs based on `countryCode` lookup
2. Keep `isEU` for backwards compatibility initially
3. Generate `companyOrName` from existing `name` field

### Step 3: Excel Import
1. Import Sites sheet → update existing or create new
2. Import Labs sheet → update existing or create new
3. Import Outbound + Sample → create Orders + OrderBoxes
4. Mark imported records with `isMigratedData=true`

### Step 4: Verification Queue
1. Build UI to review migrated OrderBoxes
2. Verify waybill pairings
3. Mark verified records with `waybillMatchVerified=true`

---

## Backwards Compatibility

### Preserved Fields
- `isEU` kept on Sites/Labs (computed from region)
- Existing StockItem fields unchanged
- Existing Order fields unchanged
- Existing Shipment model unchanged

### API Compatibility
- Existing endpoints continue to work
- New fields added to responses
- Old field names aliased where needed

---

## Files to Modify

1. `prisma/schema.prisma` - Add new models and fields
2. `prisma/seed.ts` - Add countries and shipping scenarios seed data
3. `src/lib/countries.ts` - Country/region utility functions
4. `src/app/api/*/route.ts` - Update API handlers for new fields

---

## Estimated Changes

| Component | Files | Complexity |
|-----------|-------|------------|
| Schema | 1 | Medium |
| Seed Data | 1 | Low |
| Site API | 3 | Low |
| Lab API | 3 | Low |
| Order API | 3 | Medium |
| New OrderBox API | 3 | High |
| UI Components | 5-10 | Medium |

---

## Next Steps

1. ✅ Create this migration plan
2. 🔄 Implement schema changes in `schema.prisma`
3. Add seed data for countries and shipping scenarios
4. Run migration
5. Update API routes
6. Build Excel import functionality
