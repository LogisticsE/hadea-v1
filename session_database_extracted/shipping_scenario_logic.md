# Shipping Scenario (AREA) Logic Explained

## How the Automatic Scenario Lookup Works

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        WHEN AN ORDER IS CREATED                             │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  1. User selects SITE (e.g., "Amsterdam Clinical Site")                     │
│     → System looks up site's country_code: NL                               │
│     → System looks up country's region: EU                                  │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  2. User selects LAB (e.g., "Central Lab London")                           │
│     → System looks up lab's country_code: GB                                │
│     → System looks up country's region: Non-EU Europe                       │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  3. System automatically finds matching SHIPPING SCENARIO                   │
│                                                                             │
│     Site Region: EU  +  Lab Region: Non-EU Europe                           │
│                          │                                                  │
│                          ▼                                                  │
│     ┌─────────────────────────────────────────────────────────────────┐     │
│     │  shipping_scenarios table lookup:                               │     │
│     │  WHERE region_from = 'EU' AND region_to = 'Non-EU Europe'       │     │
│     │                                                                 │     │
│     │  Result:                                                        │     │
│     │  • Scenario: 2                                                  │     │
│     │  • Combi: "EUNon-EU Europe"                                     │     │
│     │  • Item No: 90                                                  │     │
│     │  • Description: "Pick-up service... Scenario 2"                 │     │
│     │  • Requires Customs: TRUE                                       │     │
│     └─────────────────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  4. Order is saved with shipping_scenario_id linked                         │
│                                                                             │
│     → All boxes inherit the scenario info                                   │
│     → Label generation uses Item No 90 and the description                  │
│     → System knows customs documents are required                           │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Complete Scenario Matrix

| Scenario | From | To | Combi | Item No | Customs? |
|----------|------|-----|-------|---------|----------|
| 1 | EU | EU | EUEU | 89 | No |
| 2 | EU | Non-EU Europe | EUNon-EU Europe | 90 | Yes |
| 3 | Non-EU Europe | EU | Non-EU EuropeEU | 91 | Yes |
| 4 | Non-Europe | EU | Non-EuropeEU | 92 | Yes |
| 5 | Non-Europe | Non-Europe | Non-EuropeNon-Europe | 93 | Yes |
| 6 | Non-Europe | Non-EU Europe | Non-EuropeNon-EU Europe | 94 | Yes |
| 7 | Non-EU Europe | Non-Europe | Non-EU EuropeNon-Europe | 95 | Yes |
| 8 | EU | Non-Europe | EUNon-Europe | 96 | Yes |
| 9 | Non-EU Europe | Non-EU Europe | Non-EU EuropeNon-EU Europe | 97 | Yes |

---

## Region Classification

### EU (European Union)
Austria, Belgium, Bulgaria, Croatia, Cyprus, Czech Republic, Denmark, Estonia, Finland, France, Germany, Greece, Hungary, Ireland, Italy, Latvia, Lithuania, Luxembourg, Malta, Netherlands, Poland, Portugal, Romania, Slovakia, Slovenia, Spain, Sweden

### Non-EU Europe
United Kingdom, Switzerland, Norway, Iceland, Serbia, Ukraine, Bosnia and Herzegovina, Montenegro, North Macedonia, Albania, Moldova, Turkey

### Non-Europe
All other countries (USA, Canada, Australia, Japan, China, Brazil, etc.)

---

## Database Tables Involved

```
┌─────────────┐     ┌─────────────┐     ┌───────────────────┐
│  countries  │     │    sites    │     │ shipping_scenarios│
├─────────────┤     ├─────────────┤     ├───────────────────┤
│ code (PK)   │◄────│ country_code│     │ id (PK)           │
│ name        │     │ region  ────┼────►│ region_from       │
│ region      │     │ ...         │     │ region_to         │
└─────────────┘     └─────────────┘     │ combi             │
                                        │ item_no           │
┌─────────────┐     ┌─────────────┐     │ description       │
│  countries  │     │    labs     │     │ requires_customs  │
├─────────────┤     ├─────────────┤     └───────────────────┘
│ code (PK)   │◄────│ country_code│              ▲
│ name        │     │ region  ────┼──────────────┘
│ region      │     │ ...         │
└─────────────┘     └─────────────┘
                           │
                           │
                           ▼
                    ┌─────────────┐
                    │   orders    │
                    ├─────────────┤
                    │ site_id ────┼───► (auto-lookup scenario)
                    │ lab_id  ────┼───► (auto-lookup scenario)
                    │ shipping_   │
                    │ scenario_id │◄─── (set by trigger)
                    └─────────────┘
```

---

## Sample Query: Get Label Data with Scenario Info

```sql
-- Get all the data needed to generate a sample content label
SELECT 
    o.order_number,
    ob.box_number,
    
    -- From site
    s.company_or_name AS from_company,
    s.delivery_address AS from_address,
    
    -- To lab  
    l.company_or_name AS to_company,
    l.delivery_address AS to_address,
    
    -- Contract info (from scenario lookup)
    ss.item_no,
    ss.description AS item_description,
    
    -- Waybills
    ob.sample_waybill,
    ob.barcode_sequence
    
FROM order_boxes ob
JOIN orders o ON ob.order_id = o.id
JOIN sites s ON o.site_id = s.id
JOIN labs l ON o.lab_id = l.id
JOIN shipping_scenarios ss ON o.shipping_scenario_id = ss.id
WHERE o.order_number = 'ORD-2025-0042';
```

This replaces your Excel formulas that looked up item_no and item_description from the AREA sheet!
