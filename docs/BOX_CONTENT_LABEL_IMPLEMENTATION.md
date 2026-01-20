# Box Content Label Implementation Plan

## Overview

This document describes how to migrate the Excel VBA macro for generating Box Content Labels into the web application.

## Current Excel Macro Behavior

The VBA macro:
1. Reads rows from the "outbound" Excel table
2. Opens a Word template (specified per row in BOXCONTENTTEMPLATE column)
3. Replaces placeholders (X1*, X2*, X3*, X4*) with data
4. Template has static "Settings" values (contract info)
5. Template has an items table (kit contents)
6. Exports page 1 as PDF to folder structure
7. Marks LABELGENERATED = "YES"

## Template Structure (from image)

```
┌─────────────────────────────────────────────────────────────────┐
│                    Box Contents Label                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Name of Contracting Authority    │  [Settings - HadeaConfig]  │
│  Delivery Address                 │  [X1* - Site address]      │
│  Name of Contractor               │  [Settings - HadeaConfig]  │
│  Number of Specific Contract      │  [Settings - HadeaConfig]  │
│  Date of Specific Contract        │  [Settings - HadeaConfig]  │
│  Date of Delivery (Expected)      │  [X2* - Ship date]         │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│  Item Description          │  Qty    │  Unit                   │
├────────────────────────────┼─────────┼─────────────────────────┤
│  [Kit Item 1 name]         │  [qty]  │  [unit]                 │
│  [Kit Item 2 name]         │  [qty]  │  [unit]                 │
│  ...                       │  ...    │  ...                    │
└─────────────────────────────────────────────────────────────────┘
```

## Data Mapping

| Template Field | Old Excel Column | New Database Field |
|----------------|------------------|-------------------|
| Name of Contracting Authority | Settings (static) | `HadeaConfig.contractingAuthorityName` |
| Name of Contractor | Settings (static) | `HadeaConfig.contractorName` |
| Number of Specific Contract | Settings (static) | `HadeaConfig.specificContractNumber` |
| Date of Specific Contract | Settings (static) | `HadeaConfig.specificContractDate` |
| Delivery Address (X1*) | DELIVERYADDRESS | `Site.deliveryAddress` or formatted |
| Date of Delivery (X2*) | EXPECTEDDELIVERYDATE | `Order.outboundShipDate` + transit days |
| Items Table | Word template | `Kit.items` → `KitItem` → `StockItem` |

## Proposed Database Schema Additions

### 1. Extend Kit Model (already partially done)

The Kit model already has template fields. We'll use them:

```prisma
model Kit {
  // ... existing fields ...
  boxContentTemplateOutbound String?  // Template name/config
  boxContentTemplateSample   String?  // Template name/config
  // ...
}
```

### 2. Add Template Configuration Model

For more flexibility, add a template configuration model:

```prisma
model LabelTemplate {
  id              String    @id @default(cuid())
  name            String    @unique
  type            LabelType // OUTBOUND_CONTENT, SAMPLE_CONTENT, SHIPPING
  description     String?

  // Layout configuration (JSON)
  layoutConfig    Json      // Stores field positions, styling, logo

  // Which fields to include
  includeContractInfo   Boolean @default(true)
  includeItemsTable     Boolean @default(true)
  includeBarcode        Boolean @default(false)

  // Linked kit (optional - can be default template)
  kitId           String?
  kit             Kit?      @relation(fields: [kitId], references: [id])

  isDefault       Boolean   @default(false)
  isActive        Boolean   @default(true)

  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
}

enum LabelType {
  OUTBOUND_CONTENT    // Box content label for outbound shipment
  SAMPLE_CONTENT      // Box content label for sample return
  SHIPPING_LABEL      // Carrier shipping label
  COMMERCIAL_INVOICE  // Customs invoice
  NON_ADR            // Non-ADR declaration
}
```

## Implementation Architecture

### Option A: Server-Side PDF Generation (Recommended)

```
┌─────────────────────────────────────────────────────────────────┐
│                        Frontend (React)                         │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │  Template       │  │  Kit Config     │  │  Generate       │ │
│  │  Designer UI    │  │  (select        │  │  Button         │ │
│  │  (future)       │  │   template)     │  │  (per box)      │ │
│  └────────┬────────┘  └────────┬────────┘  └────────┬────────┘ │
└───────────┼────────────────────┼────────────────────┼──────────┘
            │                    │                    │
            ▼                    ▼                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                      API Routes (Next.js)                       │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │ POST            │  │ PUT             │  │ POST            │ │
│  │ /api/templates  │  │ /api/kits/:id   │  │ /api/boxes/:id  │ │
│  │                 │  │   /template     │  │   /generate-    │ │
│  │                 │  │                 │  │   label         │ │
│  └────────┬────────┘  └────────┬────────┘  └────────┬────────┘ │
└───────────┼────────────────────┼────────────────────┼──────────┘
            │                    │                    │
            ▼                    ▼                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                  Document Generation Service                     │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │  1. Fetch HadeaConfig (contract info)                       ││
│  │  2. Fetch Order + Site (addresses, dates)                   ││
│  │  3. Fetch Kit + Items (BOM table)                           ││
│  │  4. Merge with template layout                              ││
│  │  5. Generate PDF (using pdf-lib or puppeteer)               ││
│  │  6. Save to storage + BoxDocument table                     ││
│  │  7. Update OrderBox.boxContentGeneratedOutbound = true      ││
│  └─────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
```

### Tech Stack for PDF Generation

| Library | Pros | Cons |
|---------|------|------|
| **pdf-lib** (recommended) | Pure JS, no dependencies, fast | Need to position elements manually |
| **@react-pdf/renderer** | React components, easy styling | Heavier, client-side focused |
| **puppeteer** | Pixel-perfect HTML to PDF | Requires Chrome, heavier |
| **pdfmake** | Declarative JSON, tables support | Learning curve |

**Recommendation:** Use `pdf-lib` for simple labels, or `pdfmake` for complex tables.

## API Design

### 1. Generate Box Content Label

```typescript
// POST /api/boxes/:boxId/generate-label
// Request body:
{
  "labelType": "OUTBOUND_CONTENT"  // or "SAMPLE_CONTENT"
}

// Response:
{
  "success": true,
  "document": {
    "id": "doc_abc123",
    "fileName": "outbound_content_MUC-001_2026-01-20_1Z999AA.pdf",
    "filePath": "/documents/2026/01/...",
    "downloadUrl": "/api/documents/doc_abc123/download"
  }
}
```

### 2. Bulk Generate Labels

```typescript
// POST /api/orders/:orderId/generate-labels
// Request body:
{
  "labelType": "OUTBOUND_CONTENT",
  "boxIds": ["box1", "box2", "box3"]  // optional, defaults to all boxes
}

// Response:
{
  "success": true,
  "generated": 3,
  "documents": [...]
}
```

## Document Generation Service

```typescript
// src/lib/services/document-generator.ts

import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

interface BoxContentLabelData {
  // Contract info (from HadeaConfig)
  contractingAuthorityName: string;
  contractorName: string;
  specificContractNumber: string;
  specificContractDate: Date;

  // Delivery info (from Site + Order)
  deliveryAddress: string;
  expectedDeliveryDate: Date;

  // Items (from Kit BOM)
  items: Array<{
    name: string;
    quantity: number;
    unit: string;
  }>;

  // Box info
  boxNumber: number;
  waybillNumber: string;
}

export async function generateBoxContentLabel(
  data: BoxContentLabelData
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595.28, 841.89]); // A4
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const { width, height } = page.getSize();
  let y = height - 50;

  // Title
  page.drawText('Box Contents Label', {
    x: 50,
    y,
    size: 18,
    font: boldFont,
  });
  y -= 40;

  // Contract info table
  const fields = [
    ['Name of Contracting Authority', data.contractingAuthorityName],
    ['Delivery Address', data.deliveryAddress],
    ['Name of Contractor', data.contractorName],
    ['Number of Specific Contract', data.specificContractNumber],
    ['Date of Specific Contract', formatDate(data.specificContractDate)],
    ['Date of Delivery (Expected)', formatDate(data.expectedDeliveryDate)],
  ];

  for (const [label, value] of fields) {
    page.drawText(label, { x: 50, y, size: 10, font });
    page.drawText(value, { x: 250, y, size: 10, font });
    y -= 25;
  }

  y -= 20;

  // Items table header
  page.drawText('Item Description', { x: 50, y, size: 10, font: boldFont });
  page.drawText('Qty', { x: 350, y, size: 10, font: boldFont });
  page.drawText('Unit', { x: 420, y, size: 10, font: boldFont });
  y -= 20;

  // Items table rows
  for (const item of data.items) {
    page.drawText(item.name, { x: 50, y, size: 10, font });
    page.drawText(String(item.quantity), { x: 350, y, size: 10, font });
    page.drawText(item.unit, { x: 420, y, size: 10, font });
    y -= 18;
  }

  return pdfDoc.save();
}
```

## UI Components Needed

### 1. Kit Template Configuration (in Kit edit page)

```tsx
// In /kits/[id]/edit page - add template section

<Card>
  <CardHeader>
    <CardTitle>Box Content Label Template</CardTitle>
    <CardDescription>
      Configure what appears on the box content label for this kit
    </CardDescription>
  </CardHeader>
  <CardContent>
    <div className="space-y-4">
      <div>
        <Label>Include Items Table</Label>
        <Switch checked={includeItemsTable} />
      </div>
      <div>
        <Label>Include Contract Info</Label>
        <Switch checked={includeContractInfo} />
      </div>
      <div>
        <Label>Custom Header Text (optional)</Label>
        <Input placeholder="Box Contents Label" />
      </div>
    </div>
  </CardContent>
</Card>
```

### 2. Generate Label Button (in Order/Box detail page)

```tsx
<Button
  onClick={() => generateLabel(boxId, 'OUTBOUND_CONTENT')}
  disabled={box.boxContentGeneratedOutbound}
>
  {box.boxContentGeneratedOutbound
    ? 'Label Generated'
    : 'Generate Outbound Content Label'}
</Button>
```

### 3. Settings Page (HadeaConfig)

Already exists - ensure these fields are editable:
- Contracting Authority Name
- Contractor Name
- Specific Contract Number
- Specific Contract Date

## Migration from Excel

### Phase 1: Basic Generation
1. Implement PDF generation service
2. Use default template (no customization)
3. Generate labels on-demand from UI

### Phase 2: Template Customization
1. Add LabelTemplate model
2. Build template configuration UI
3. Link templates to kits

### Phase 3: Bulk Operations
1. Bulk generate for all boxes in an order
2. Batch download as ZIP
3. Auto-generate on status change (optional)

## File Structure

```
src/
├── lib/
│   └── services/
│       ├── document-generator.ts      # PDF generation logic
│       ├── label-templates/
│       │   ├── box-content-outbound.ts
│       │   ├── box-content-sample.ts
│       │   └── index.ts
│       └── storage.ts                  # File storage service
├── app/
│   └── api/
│       ├── boxes/
│       │   └── [boxId]/
│       │       └── generate-label/
│       │           └── route.ts        # POST endpoint
│       ├── orders/
│       │   └── [orderId]/
│       │       └── generate-labels/
│       │           └── route.ts        # Bulk endpoint
│       └── documents/
│           └── [documentId]/
│               └── download/
│                   └── route.ts        # Download endpoint
└── components/
    └── documents/
        ├── GenerateLabelButton.tsx
        └── DocumentList.tsx
```

## Next Steps

1. **Add pdf-lib dependency** - `npm install pdf-lib`
2. **Create document generator service** - Basic PDF generation
3. **Add API endpoint** - `/api/boxes/[boxId]/generate-label`
4. **Add UI button** - In order detail / box list
5. **Test with sample data**
6. **Iterate on template design**

## Questions to Resolve

1. **Storage location**: Local filesystem or cloud (Azure Blob, S3)?
2. **Template customization**: How much flexibility needed per kit?
3. **Approval workflow**: Should labels require approval before printing?
4. **Versioning**: Keep history of generated labels?
