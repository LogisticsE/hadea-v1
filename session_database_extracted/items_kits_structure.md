# Items & Kits Structure (Bill of Materials)

## Overview

The system now has a proper Bill of Materials (BOM) structure where:
- **Items** are individual components (tubes, packaging, labels, etc.)
- **Kit Types** define different kit configurations with dimensions
- **Kit Items** links items to kits with quantities

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              ITEMS TABLE                                    │
│                    (Master list of all components)                          │
├─────────────────────────────────────────────────────────────────────────────┤
│ TUBE-10ML-001  │ 10ml Sample Tube        │ 15g   │ tube        │           │
│ TUBE-5ML-001   │ 5ml Sample Tube         │ 10g   │ tube        │           │
│ ABS-PAD-001    │ Absorbent Pad           │ 5g    │ absorbent   │           │
│ BAG-BIO-001    │ Biohazard Bag           │ 8g    │ packaging   │           │
│ BOX-SEC-001    │ Secondary Container     │ 150g  │ container   │           │
│ ICE-GEL-001    │ Gel Ice Pack            │ 200g  │ cooling     │           │
│ DOC-INST-001   │ Sampling Instructions   │ 10g   │ documentation│          │
│ LBL-BAR-001    │ Barcode Label Set       │ 2g    │ label       │           │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ Many-to-Many
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                            KIT_ITEMS TABLE                                  │
│                    (Links items to kits with quantities)                    │
├─────────────────────────────────────────────────────────────────────────────┤
│ kit_type_id    │ item_id        │ quantity │ sort_order │ is_required      │
│ (outbound-1)   │ TUBE-10ML-001  │ 4        │ 1          │ TRUE             │
│ (outbound-1)   │ ABS-PAD-001    │ 2        │ 2          │ TRUE             │
│ (outbound-1)   │ BAG-BIO-001    │ 1        │ 3          │ TRUE             │
│ (outbound-2)   │ TUBE-10ML-001  │ 8        │ 1          │ TRUE             │
│ (outbound-2)   │ TUBE-5ML-001   │ 4        │ 2          │ TRUE             │
│ ...            │ ...            │ ...      │ ...        │ ...              │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ Many-to-One
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           KIT_TYPES TABLE                                   │
│                    (Kit configurations with dimensions)                     │
├─────────────────────────────────────────────────────────────────────────────┤
│ Nr │ Name                │ Box Size (L×W×H)  │ Template                     │
│ 1  │ outbound-kit 1      │ 30×20×15 cm       │ boxcontentlabel_...1.docx    │
│ 2  │ outbound-kit 2      │ 35×25×20 cm       │ boxcontentlabel_...2.docx    │
│ 3  │ outbound-kit1 URGENT│ 30×20×15 cm       │ boxcontentlabel_...1.docx    │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Items Table Details

The `items` table stores all individual components with their properties:

| Field | Description | Example |
|-------|-------------|---------|
| `item_code` | Unique SKU/code | "TUBE-10ML-001" |
| `name` | Human-readable name | "10ml Sample Tube" |
| `description` | Detailed description | "Sterile 10ml sample collection tube..." |
| `category` | Type of item | tube, container, packaging, label, etc. |
| `weight_grams` | Weight in grams | 15 |
| `length_cm` | Length in cm | 12 |
| `width_cm` | Width in cm | 2 |
| `height_cm` | Height in cm | 2 |
| `volume_ml` | Volume (for tubes) | 10 |
| `supplier` | Supplier name | "Medical Supplies Inc." |
| `supplier_item_code` | Supplier's code | "MS-TUBE-10" |
| `hs_code` | Customs code | "3926.90" |
| `country_of_origin` | Manufacturing country | "DE" |
| `customs_value_eur` | Value for customs | 0.50 |
| `is_dangerous_goods` | Dangerous goods flag | FALSE |
| `requires_cold_chain` | Cold chain needed | FALSE |

---

## Kit Types Table Details

The `kit_types` table defines different kit configurations:

| Field | Description | Example |
|-------|-------------|---------|
| `legacy_nr` | Original Excel Nr. | 1 |
| `name` | Kit name | "outbound-kit 1" |
| `description` | Kit description | "Standard outbound kit..." |
| `box_length_cm` | Outer box length | 30 |
| `box_width_cm` | Outer box width | 20 |
| `box_height_cm` | Outer box height | 15 |
| `box_weight_empty_grams` | Empty box weight | 200 |
| `total_weight_grams` | **Auto-calculated** total | 450 |
| `box_content_template_outbound` | Template filename | "boxcontentlabel_template_outbound1.docx" |
| `template_path` | Full path to templates | "V:\ETNL007\..." |
| `is_urgent` | Urgent handling flag | FALSE |

---

## How It Works Together

### Example: "outbound-kit 1" Contents

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  KIT: outbound-kit 1                                                        │
│  Box dimensions: 30 × 20 × 15 cm                                            │
│  Template: boxcontentlabel_template_outbound1.docx                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  CONTENTS:                                                                  │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ Qty │ Item                    │ Weight Each │ Line Weight           │   │
│  ├─────┼─────────────────────────┼─────────────┼───────────────────────│   │
│  │  1  │ Secondary Container     │ 150g        │ 150g                  │   │
│  │  1  │ Biohazard Bag           │   8g        │   8g                  │   │
│  │  4  │ 10ml Sample Tubes       │  15g        │  60g                  │   │
│  │  2  │ Absorbent Pads          │   5g        │  10g                  │   │
│  │  1  │ Barcode Label Set       │   2g        │   2g                  │   │
│  │  1  │ Sampling Instructions   │  10g        │  10g                  │   │
│  ├─────┴─────────────────────────┴─────────────┼───────────────────────│   │
│  │                               Items subtotal │ 240g                  │   │
│  │                           Empty box weight   │ 200g                  │   │
│  │                           ═══════════════════╪═══════════════════════│   │
│  │                           TOTAL WEIGHT       │ 440g                  │   │
│  └──────────────────────────────────────────────┴───────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Auto-Calculated Weight

When you add/remove items from a kit, a database trigger automatically recalculates the total weight:

```sql
-- This happens automatically via trigger
total_weight = box_weight_empty + SUM(item.weight × quantity)
```

---

## Using Kits in Orders

When creating an order, you select a kit type:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  NEW ORDER                                                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Kit Type: [ outbound-kit 1          ▼ ]                                    │
│                                                                             │
│  Site:     [ Amsterdam Clinical Site ▼ ]                                    │
│                                                                             │
│  Lab:      [ Central Lab Brussels    ▼ ]                                    │
│                                                                             │
│  Sampling Date: [ 2025-02-15 ]                                              │
│                                                                             │
│  Number of Boxes: [ 3 ]                                                     │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

        │
        │ System automatically:
        │ ✓ Links kit_type_id to order
        │ ✓ Looks up shipping scenario from site/lab regions
        │ ✓ Uses kit's template for box content label generation
        │ ✓ Knows total weight for shipping
        ▼

┌─────────────────────────────────────────────────────────────────────────────┐
│  ORDER CREATED: ORD-2025-0001                                               │
│                                                                             │
│  Kit: outbound-kit 1 (440g per box)                                         │
│  Route: Amsterdam → Brussels (Scenario 1, Item 89)                          │
│  Boxes: 3                                                                   │
│  Total shipping weight: 1320g                                               │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Useful Queries

### Get full kit contents:
```sql
SELECT * FROM v_kit_contents WHERE kit_name = 'outbound-kit 1';
```

### Get kit list for dropdown:
```sql
SELECT * FROM v_kit_types_dropdown;
```

### Calculate total customs value for a kit:
```sql
SELECT 
    kt.name AS kit_name,
    SUM(i.customs_value_eur * ki.quantity) AS total_customs_value
FROM kit_types kt
JOIN kit_items ki ON kt.id = ki.kit_type_id
JOIN items i ON ki.item_id = i.id
WHERE kt.name = 'outbound-kit 1'
GROUP BY kt.name;
```

---

## Benefits of This Structure

1. **Reusability**: Items defined once, used in multiple kit types
2. **Flexibility**: Easy to create new kit configurations
3. **Accuracy**: Weight calculated automatically from components
4. **Customs Ready**: Item-level customs info for international shipments
5. **Auditability**: Track exactly what's in each kit type
6. **Templates**: Link to correct box content label template per kit
