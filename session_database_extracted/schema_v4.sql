-- ============================================================================
-- Kit Order Management System - PostgreSQL Schema (v4)
-- With proper Items and Kit Bill of Materials (BOM) structure
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- ENUM TYPES
-- ============================================================================

-- Geographic region classification (for scenario lookup)
CREATE TYPE geographic_region AS ENUM (
    'EU',
    'Non-EU Europe',
    'Non-Europe'
);

CREATE TYPE order_status AS ENUM (
    'draft',
    'pending',
    'shipped_outbound',
    'in_transit',
    'delivered_to_site',
    'samples_collected',
    'shipped_sample',
    'at_lab',
    'completed',
    'cancelled'
);

CREATE TYPE box_status AS ENUM (
    'pending',
    'packed',
    'shipped_outbound',
    'at_site',
    'shipped_sample',
    'at_lab',
    'completed',
    'lost',
    'damaged',
    'returned'
);

CREATE TYPE forwarder_type AS ENUM (
    'UPS',
    'DHL',
    'FEDEX',
    'TNT',
    'OTHER'
);

CREATE TYPE document_type AS ENUM (
    'commercial_invoice',
    'customs_doc',
    'nonadr',
    'box_content_outbound',
    'box_content_sample',
    'other'
);

CREATE TYPE image_type AS ENUM (
    'outbound_label',
    'sample_label',
    'box_content',
    'customs_doc',
    'photo',
    'other'
);

CREATE TYPE audit_action AS ENUM (
    'CREATE',
    'UPDATE',
    'DELETE'
);

CREATE TYPE item_category AS ENUM (
    'tube',
    'container',
    'packaging',
    'documentation',
    'label',
    'absorbent',
    'cooling',
    'other'
);

CREATE TYPE unit_of_measure AS ENUM (
    'piece',
    'set',
    'ml',
    'g',
    'kg',
    'cm',
    'm'
);

-- ============================================================================
-- REFERENCE TABLES
-- ============================================================================

-- Shipping Scenarios Table (AREA lookup)
CREATE TABLE shipping_scenarios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    scenario_number INTEGER NOT NULL UNIQUE,
    region_from geographic_region NOT NULL,
    region_to geographic_region NOT NULL,
    combi VARCHAR(50) NOT NULL UNIQUE,
    item_no INTEGER NOT NULL,
    description TEXT NOT NULL,
    requires_customs BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (region_from, region_to)
);

-- Insert the fixed shipping scenarios data
INSERT INTO shipping_scenarios (scenario_number, region_from, region_to, combi, item_no, description, requires_customs) VALUES
(1, 'EU', 'EU', 'EUEU', 89, 'Pick-up service of hypothetic package as defined in the Tech. Specs. and delivery to lots 2 and 3 contractors according to Scenario 1', FALSE),
(2, 'EU', 'Non-EU Europe', 'EUNon-EU Europe', 90, 'Pick-up service of hypothetic package as defined in the Tech. Specs. and delivery to lots 2 and 3 contractors according to Scenario 2', TRUE),
(3, 'Non-EU Europe', 'EU', 'Non-EU EuropeEU', 91, 'Pick-up service of hypothetic package as defined in the Tech. Specs. and delivery to lots 2 and 3 contractors according to Scenario 3', TRUE),
(4, 'Non-Europe', 'EU', 'Non-EuropeEU', 92, 'Pick-up service of hypothetic package as defined in the Tech. Specs. and delivery to lots 2 and 3 contractors according to Scenario 4', TRUE),
(5, 'Non-Europe', 'Non-Europe', 'Non-EuropeNon-Europe', 93, 'Pick-up service of hypothetic package as defined in the Tech. Specs. and delivery to lots 2 and 3 contractors according to Scenario 5', TRUE),
(6, 'Non-Europe', 'Non-EU Europe', 'Non-EuropeNon-EU Europe', 94, 'Pick-up service of hypothetic package as defined in the Tech. Specs. and delivery to lots 2 and 3 contractors according to Scenario 6', TRUE),
(7, 'Non-EU Europe', 'Non-Europe', 'Non-EU EuropeNon-Europe', 95, 'Pick-up service of hypothetic package as defined in the Tech. Specs. and delivery to lots 2 and 3 contractors according to Scenario 7', TRUE),
(8, 'EU', 'Non-Europe', 'EUNon-Europe', 96, 'Pick-up service of hypothetic package as defined in the Tech. Specs. and delivery to lots 2 and 3 contractors according to Scenario 8', TRUE),
(9, 'Non-EU Europe', 'Non-EU Europe', 'Non-EU EuropeNon-EU Europe', 97, 'Pick-up service of hypothetic package as defined in the Tech. Specs. and delivery to lots 2 and 3 contractors according to Scenario 9', TRUE);

-- Countries Table
CREATE TABLE countries (
    code CHAR(2) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    region geographic_region NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert countries (EU, Non-EU Europe, and common Non-Europe)
INSERT INTO countries (code, name, region) VALUES
-- EU Countries
('AT', 'Austria', 'EU'), ('BE', 'Belgium', 'EU'), ('BG', 'Bulgaria', 'EU'),
('HR', 'Croatia', 'EU'), ('CY', 'Cyprus', 'EU'), ('CZ', 'Czech Republic', 'EU'),
('DK', 'Denmark', 'EU'), ('EE', 'Estonia', 'EU'), ('FI', 'Finland', 'EU'),
('FR', 'France', 'EU'), ('DE', 'Germany', 'EU'), ('GR', 'Greece', 'EU'),
('HU', 'Hungary', 'EU'), ('IE', 'Ireland', 'EU'), ('IT', 'Italy', 'EU'),
('LV', 'Latvia', 'EU'), ('LT', 'Lithuania', 'EU'), ('LU', 'Luxembourg', 'EU'),
('MT', 'Malta', 'EU'), ('NL', 'Netherlands', 'EU'), ('PL', 'Poland', 'EU'),
('PT', 'Portugal', 'EU'), ('RO', 'Romania', 'EU'), ('SK', 'Slovakia', 'EU'),
('SI', 'Slovenia', 'EU'), ('ES', 'Spain', 'EU'), ('SE', 'Sweden', 'EU'),
-- Non-EU Europe
('GB', 'United Kingdom', 'Non-EU Europe'), ('CH', 'Switzerland', 'Non-EU Europe'),
('NO', 'Norway', 'Non-EU Europe'), ('IS', 'Iceland', 'Non-EU Europe'),
('RS', 'Serbia', 'Non-EU Europe'), ('UA', 'Ukraine', 'Non-EU Europe'),
('BA', 'Bosnia and Herzegovina', 'Non-EU Europe'), ('ME', 'Montenegro', 'Non-EU Europe'),
('MK', 'North Macedonia', 'Non-EU Europe'), ('AL', 'Albania', 'Non-EU Europe'),
('MD', 'Moldova', 'Non-EU Europe'), ('TR', 'Turkey', 'Non-EU Europe'),
-- Non-Europe
('US', 'United States', 'Non-Europe'), ('CA', 'Canada', 'Non-Europe'),
('AU', 'Australia', 'Non-Europe'), ('JP', 'Japan', 'Non-Europe'),
('CN', 'China', 'Non-Europe'), ('BR', 'Brazil', 'Non-Europe'),
('IN', 'India', 'Non-Europe'), ('ZA', 'South Africa', 'Non-Europe'),
('IL', 'Israel', 'Non-Europe'), ('SG', 'Singapore', 'Non-Europe'),
('KR', 'South Korea', 'Non-Europe'), ('MX', 'Mexico', 'Non-Europe');

-- ============================================================================
-- ITEMS & KITS TABLES (Bill of Materials)
-- ============================================================================

-- Items Table (individual components that go into kits)
CREATE TABLE items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    item_code VARCHAR(50) NOT NULL UNIQUE,           -- Internal item/SKU code
    name VARCHAR(255) NOT NULL,                      -- Item name
    description TEXT,                                -- Detailed description
    category item_category DEFAULT 'other',          -- Type of item
    
    -- Physical properties
    weight_grams DECIMAL(10,2),                      -- Weight in grams
    length_cm DECIMAL(10,2),                         -- Length in cm
    width_cm DECIMAL(10,2),                          -- Width in cm
    height_cm DECIMAL(10,2),                         -- Height in cm
    volume_ml DECIMAL(10,2),                         -- Volume in ml (for tubes/containers)
    
    -- Inventory/ordering info
    unit_of_measure unit_of_measure DEFAULT 'piece',
    supplier VARCHAR(255),                           -- Supplier name
    supplier_item_code VARCHAR(100),                 -- Supplier's item code
    
    -- Customs/shipping info (for international shipments)
    hs_code VARCHAR(20),                             -- Harmonized System code for customs
    country_of_origin CHAR(2) REFERENCES countries(code),
    customs_description TEXT,                        -- Description for customs documents
    customs_value_eur DECIMAL(10,2),                 -- Value for customs declaration
    
    -- Regulatory
    is_dangerous_goods BOOLEAN DEFAULT FALSE,
    un_number VARCHAR(10),                           -- UN number if dangerous goods
    requires_cold_chain BOOLEAN DEFAULT FALSE,
    storage_temp_min_c DECIMAL(5,2),                 -- Min storage temperature
    storage_temp_max_c DECIMAL(5,2),                 -- Max storage temperature
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    notes TEXT,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Kit Types Table (defines different kit configurations)
CREATE TABLE kit_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    legacy_nr INTEGER UNIQUE,                        -- Nr. from Excel (1, 2, 3...)
    name VARCHAR(100) NOT NULL UNIQUE,               -- e.g., "outbound-kit 1"
    description TEXT,
    
    -- Box dimensions (outer box that contains the kit)
    box_length_cm DECIMAL(10,2),                     -- Length in cm
    box_width_cm DECIMAL(10,2),                      -- Width in cm
    box_height_cm DECIMAL(10,2),                     -- Height in cm
    box_weight_empty_grams DECIMAL(10,2),            -- Weight of empty box
    
    -- Calculated fields (updated by trigger)
    total_weight_grams DECIMAL(10,2),                -- Total weight including all items
    
    -- Templates
    box_content_template_outbound VARCHAR(255),      -- Template filename for outbound label
    box_content_template_sample VARCHAR(255),        -- Template filename for sample label
    template_path TEXT,                              -- Full path to templates
    
    -- Shipping properties
    is_urgent BOOLEAN DEFAULT FALSE,                 -- For urgent kits
    requires_customs_docs BOOLEAN DEFAULT FALSE,
    requires_nonadr BOOLEAN DEFAULT FALSE,
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    notes TEXT,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Kit Items Table (junction table: which items are in which kit, and how many)
CREATE TABLE kit_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    kit_type_id UUID NOT NULL REFERENCES kit_types(id) ON DELETE CASCADE,
    item_id UUID NOT NULL REFERENCES items(id) ON DELETE RESTRICT,
    quantity INTEGER NOT NULL DEFAULT 1,             -- How many of this item in the kit
    is_required BOOLEAN DEFAULT TRUE,                -- Is this item mandatory?
    notes TEXT,                                      -- Any special notes for this item in this kit
    sort_order INTEGER DEFAULT 0,                    -- Order for display/packing list
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE (kit_type_id, item_id)
);

-- ============================================================================
-- SITES & LABS TABLES
-- ============================================================================

-- Sites Table
CREATE TABLE sites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    legacy_id VARCHAR(50) UNIQUE,
    
    -- Contact Information
    contact_name VARCHAR(255),
    company_or_name VARCHAR(255) NOT NULL,
    telephone VARCHAR(50),
    telephone_ext VARCHAR(20),
    consignee_email VARCHAR(255),
    
    -- Address Fields
    country_code CHAR(2) REFERENCES countries(code),
    country VARCHAR(100) NOT NULL,
    address_1 VARCHAR(255),
    address_2 VARCHAR(255),
    address_3 VARCHAR(255),
    city VARCHAR(100),
    state_province VARCHAR(100),
    postal_code VARCHAR(20),
    residential_ind BOOLEAN DEFAULT FALSE,
    delivery_address TEXT,
    
    -- Alternative Names
    from_site_name VARCHAR(255),
    from_site_2 VARCHAR(255),
    from_site_3 VARCHAR(255),
    from_site_4 VARCHAR(255),
    from_site_5 VARCHAR(255),
    
    -- Pickup/Collection Information
    pickup_time_from TIME,
    pickup_time_to TIME,
    preferred_collection_location TEXT,
    
    -- Region
    region geographic_region,
    
    -- Default Forwarders
    outbound_via forwarder_type,
    sample_via forwarder_type,
    
    -- Notes
    notes TEXT,
    internal_notes TEXT,
    additional_notes TEXT,
    
    -- Metadata
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Labs Table
CREATE TABLE labs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    legacy_id VARCHAR(50) UNIQUE,
    
    -- Contact Information
    contact_name VARCHAR(255),
    company_or_name VARCHAR(255) NOT NULL,
    telephone VARCHAR(50),
    telephone_ext VARCHAR(20),
    consignee_email VARCHAR(255),
    
    -- Address Fields
    country_code CHAR(2) REFERENCES countries(code),
    country VARCHAR(100) NOT NULL,
    address_1 VARCHAR(255),
    address_2 VARCHAR(255),
    address_3 VARCHAR(255),
    city VARCHAR(100),
    state_province VARCHAR(100),
    postal_code VARCHAR(20),
    residential_ind BOOLEAN DEFAULT FALSE,
    delivery_address TEXT,
    
    -- Collection Information
    preferred_collection_location TEXT,
    
    -- Region
    region geographic_region,
    
    -- Notes
    notes TEXT,
    internal_notes TEXT,
    
    -- Metadata
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Users Table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    full_name VARCHAR(255) NOT NULL,
    department VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Shipping Accounts Table
CREATE TABLE shipping_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    forwarder forwarder_type NOT NULL,
    account_number VARCHAR(100) NOT NULL,
    account_name VARCHAR(255),
    description TEXT,
    is_default BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- MAIN TABLES (Orders & Boxes)
-- ============================================================================

-- Orders Table
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number VARCHAR(50) NOT NULL UNIQUE,
    
    -- Shipment Types
    sample_type VARCHAR(100),
    outbound_type VARCHAR(100),
    
    -- References
    kit_type_id UUID REFERENCES kit_types(id),
    site_id UUID NOT NULL REFERENCES sites(id),
    lab_id UUID NOT NULL REFERENCES labs(id),
    shipping_scenario_id UUID REFERENCES shipping_scenarios(id),
    
    -- Dates
    confirmed_sampling_date DATE,
    confirmed_pickup_date DATE,
    outbound_shipping_date DATE,
    
    -- Forwarder Info
    outbound_forwarder forwarder_type,
    sample_forwarder forwarder_type,
    
    -- Collection Info
    collection_booked_by UUID REFERENCES users(id),
    collection_booked_by_name VARCHAR(255),
    collection_id VARCHAR(100),
    
    -- Status & Notes
    status order_status DEFAULT 'draft',
    notes TEXT,
    
    -- Metadata
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Order Boxes Table
CREATE TABLE order_boxes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    box_number INTEGER NOT NULL,
    
    -- OUTBOUND SHIPMENT INFO
    outbound_waybill VARCHAR(100),
    outbound_label_created_by UUID REFERENCES users(id),
    outbound_label_created_by_name VARCHAR(255),
    outbound_account_id UUID REFERENCES shipping_accounts(id),
    outbound_account_name VARCHAR(255),
    box_content_generated_outbound BOOLEAN DEFAULT FALSE,
    outbound_label_created_at TIMESTAMP WITH TIME ZONE,
    
    -- SAMPLE SHIPMENT INFO
    sample_waybill VARCHAR(100),
    sample_label_created_by UUID REFERENCES users(id),
    sample_label_created_by_name VARCHAR(255),
    sample_account_id UUID REFERENCES shipping_accounts(id),
    sample_account_name VARCHAR(255),
    box_content_generated_sample BOOLEAN DEFAULT FALSE,
    nonadr_generated BOOLEAN DEFAULT FALSE,
    sample_label_created_at TIMESTAMP WITH TIME ZONE,
    
    -- BOX CONTENTS
    barcode_sequence VARCHAR(255),
    barcode_start VARCHAR(50),
    barcode_end VARCHAR(50),
    barcode_count INTEGER,
    barcode_details JSONB,
    
    -- WAREHOUSE OPERATIONS
    box_picked_by UUID REFERENCES users(id),
    box_picked_by_name VARCHAR(255),
    box_picked_at TIMESTAMP WITH TIME ZONE,
    box_checked_by UUID REFERENCES users(id),
    box_checked_by_name VARCHAR(255),
    box_checked_at TIMESTAMP WITH TIME ZONE,
    
    -- NOTIFICATIONS
    notified_simona BOOLEAN DEFAULT FALSE,
    notified_at TIMESTAMP WITH TIME ZONE,
    
    -- STATUS & EXCEPTIONS
    exception TEXT,
    status box_status DEFAULT 'pending',
    
    -- DATA QUALITY FLAGS (for migration)
    is_migrated_data BOOLEAN DEFAULT FALSE,          -- TRUE if imported from Excel
    waybill_match_verified BOOLEAN DEFAULT TRUE,     -- FALSE if outbound/sample pairing is unverified (migrated data)
    verification_notes TEXT,                         -- Notes about verification (e.g., "Verified from photo IMG_001.jpg")
    verified_by UUID REFERENCES users(id),
    verified_at TIMESTAMP WITH TIME ZONE,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE (order_id, box_number)
);

-- Box Images Table
CREATE TABLE box_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    box_id UUID NOT NULL REFERENCES order_boxes(id) ON DELETE CASCADE,
    image_type image_type NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size INTEGER,
    mime_type VARCHAR(100),
    description TEXT,
    uploaded_by UUID REFERENCES users(id),
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Box Documents Table
CREATE TABLE box_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    box_id UUID NOT NULL REFERENCES order_boxes(id) ON DELETE CASCADE,
    document_type document_type NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size INTEGER,
    mime_type VARCHAR(100),
    description TEXT,
    generated_by UUID REFERENCES users(id),
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Audit Log Table
CREATE TABLE audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID NOT NULL,
    action audit_action NOT NULL,
    changed_fields JSONB,
    old_values JSONB,
    new_values JSONB,
    changed_by UUID REFERENCES users(id),
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    ip_address INET,
    user_agent TEXT
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Items indexes
CREATE INDEX idx_items_item_code ON items(item_code);
CREATE INDEX idx_items_category ON items(category);
CREATE INDEX idx_items_is_active ON items(is_active);

-- Kit types indexes
CREATE INDEX idx_kit_types_name ON kit_types(name);
CREATE INDEX idx_kit_types_legacy_nr ON kit_types(legacy_nr);
CREATE INDEX idx_kit_types_is_active ON kit_types(is_active);

-- Kit items indexes
CREATE INDEX idx_kit_items_kit_type_id ON kit_items(kit_type_id);
CREATE INDEX idx_kit_items_item_id ON kit_items(item_id);

-- Sites indexes
CREATE INDEX idx_sites_legacy_id ON sites(legacy_id);
CREATE INDEX idx_sites_company_name ON sites(company_or_name);
CREATE INDEX idx_sites_from_site_name ON sites(from_site_name);
CREATE INDEX idx_sites_country ON sites(country);
CREATE INDEX idx_sites_country_code ON sites(country_code);
CREATE INDEX idx_sites_region ON sites(region);
CREATE INDEX idx_sites_is_active ON sites(is_active);

-- Labs indexes
CREATE INDEX idx_labs_legacy_id ON labs(legacy_id);
CREATE INDEX idx_labs_company_name ON labs(company_or_name);
CREATE INDEX idx_labs_country ON labs(country);
CREATE INDEX idx_labs_country_code ON labs(country_code);
CREATE INDEX idx_labs_region ON labs(region);
CREATE INDEX idx_labs_is_active ON labs(is_active);

-- Orders indexes
CREATE INDEX idx_orders_order_number ON orders(order_number);
CREATE INDEX idx_orders_site_id ON orders(site_id);
CREATE INDEX idx_orders_lab_id ON orders(lab_id);
CREATE INDEX idx_orders_kit_type_id ON orders(kit_type_id);
CREATE INDEX idx_orders_shipping_scenario_id ON orders(shipping_scenario_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_confirmed_sampling_date ON orders(confirmed_sampling_date);
CREATE INDEX idx_orders_outbound_shipping_date ON orders(outbound_shipping_date);
CREATE INDEX idx_orders_created_at ON orders(created_at);

-- Order boxes indexes
CREATE INDEX idx_order_boxes_order_id ON order_boxes(order_id);
CREATE INDEX idx_order_boxes_outbound_waybill ON order_boxes(outbound_waybill);
CREATE INDEX idx_order_boxes_sample_waybill ON order_boxes(sample_waybill);
CREATE INDEX idx_order_boxes_status ON order_boxes(status);
CREATE INDEX idx_order_boxes_barcode_sequence ON order_boxes(barcode_sequence);

-- Audit log indexes
CREATE INDEX idx_audit_log_entity ON audit_log(entity_type, entity_id);
CREATE INDEX idx_audit_log_changed_at ON audit_log(changed_at);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers
CREATE TRIGGER update_items_updated_at BEFORE UPDATE ON items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_kit_types_updated_at BEFORE UPDATE ON kit_types
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_kit_items_updated_at BEFORE UPDATE ON kit_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_order_boxes_updated_at BEFORE UPDATE ON order_boxes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sites_updated_at BEFORE UPDATE ON sites
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_labs_updated_at BEFORE UPDATE ON labs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_shipping_accounts_updated_at BEFORE UPDATE ON shipping_accounts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to auto-set region from country code
CREATE OR REPLACE FUNCTION set_entity_region()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.country_code IS NOT NULL AND NEW.region IS NULL THEN
        SELECT region INTO NEW.region FROM countries WHERE code = NEW.country_code;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_site_region_trigger BEFORE INSERT OR UPDATE ON sites
    FOR EACH ROW EXECUTE FUNCTION set_entity_region();
CREATE TRIGGER set_lab_region_trigger BEFORE INSERT OR UPDATE ON labs
    FOR EACH ROW EXECUTE FUNCTION set_entity_region();

-- Function to generate order number
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
DECLARE
    year_part VARCHAR(4);
    seq_num INTEGER;
BEGIN
    IF NEW.order_number IS NULL THEN
        year_part := TO_CHAR(CURRENT_DATE, 'YYYY');
        SELECT COALESCE(MAX(
            CAST(SUBSTRING(order_number FROM 'ORD-' || year_part || '-(\d+)') AS INTEGER)
        ), 0) + 1
        INTO seq_num
        FROM orders
        WHERE order_number LIKE 'ORD-' || year_part || '-%';
        
        NEW.order_number := 'ORD-' || year_part || '-' || LPAD(seq_num::TEXT, 4, '0');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER generate_order_number_trigger BEFORE INSERT ON orders
    FOR EACH ROW EXECUTE FUNCTION generate_order_number();

-- Function to auto-set shipping scenario and default forwarders
CREATE OR REPLACE FUNCTION set_order_shipping_scenario()
RETURNS TRIGGER AS $$
DECLARE
    site_region geographic_region;
    lab_region geographic_region;
    scenario_id UUID;
    site_outbound forwarder_type;
    site_sample forwarder_type;
BEGIN
    SELECT region, outbound_via, sample_via 
    INTO site_region, site_outbound, site_sample 
    FROM sites WHERE id = NEW.site_id;
    
    SELECT region INTO lab_region FROM labs WHERE id = NEW.lab_id;
    
    IF site_region IS NOT NULL AND lab_region IS NOT NULL THEN
        SELECT id INTO scenario_id 
        FROM shipping_scenarios 
        WHERE region_from = site_region AND region_to = lab_region;
        
        NEW.shipping_scenario_id := scenario_id;
    END IF;
    
    IF NEW.outbound_forwarder IS NULL THEN
        NEW.outbound_forwarder := site_outbound;
    END IF;
    
    IF NEW.sample_forwarder IS NULL THEN
        NEW.sample_forwarder := site_sample;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_order_shipping_scenario_trigger BEFORE INSERT OR UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION set_order_shipping_scenario();

-- Function to calculate kit total weight
CREATE OR REPLACE FUNCTION calculate_kit_weight()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE kit_types
    SET total_weight_grams = (
        SELECT COALESCE(kt.box_weight_empty_grams, 0) + COALESCE(SUM(i.weight_grams * ki.quantity), 0)
        FROM kit_items ki
        JOIN items i ON ki.item_id = i.id
        WHERE ki.kit_type_id = kit_types.id
    )
    WHERE id = COALESCE(NEW.kit_type_id, OLD.kit_type_id);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER calculate_kit_weight_trigger 
    AFTER INSERT OR UPDATE OR DELETE ON kit_items
    FOR EACH ROW EXECUTE FUNCTION calculate_kit_weight();

-- ============================================================================
-- VIEWS
-- ============================================================================

-- View: Kit contents (Bill of Materials)
CREATE VIEW v_kit_contents AS
SELECT 
    kt.id AS kit_type_id,
    kt.legacy_nr,
    kt.name AS kit_name,
    kt.description AS kit_description,
    kt.box_length_cm,
    kt.box_width_cm,
    kt.box_height_cm,
    kt.box_weight_empty_grams,
    kt.total_weight_grams,
    kt.box_content_template_outbound,
    kt.is_urgent,
    i.id AS item_id,
    i.item_code,
    i.name AS item_name,
    i.description AS item_description,
    i.category AS item_category,
    i.weight_grams AS item_weight_grams,
    ki.quantity,
    (i.weight_grams * ki.quantity) AS line_weight_grams,
    ki.is_required,
    ki.sort_order
FROM kit_types kt
LEFT JOIN kit_items ki ON kt.id = ki.kit_type_id
LEFT JOIN items i ON ki.item_id = i.id
WHERE kt.is_active = TRUE
ORDER BY kt.name, ki.sort_order, i.name;

-- View: Kit summary (for dropdowns)
CREATE VIEW v_kit_types_dropdown AS
SELECT 
    kt.id,
    kt.legacy_nr,
    kt.name,
    kt.description,
    kt.is_urgent,
    kt.total_weight_grams,
    kt.box_content_template_outbound,
    COUNT(ki.id) AS item_count
FROM kit_types kt
LEFT JOIN kit_items ki ON kt.id = ki.kit_type_id
WHERE kt.is_active = TRUE
GROUP BY kt.id, kt.legacy_nr, kt.name, kt.description, kt.is_urgent, 
         kt.total_weight_grams, kt.box_content_template_outbound
ORDER BY kt.legacy_nr, kt.name;

-- View: Complete order summary
CREATE VIEW v_orders_summary AS
SELECT 
    o.id,
    o.order_number,
    o.sample_type,
    o.outbound_type,
    
    -- Kit info
    kt.name AS kit_type_name,
    kt.is_urgent AS kit_is_urgent,
    
    -- Site info
    s.company_or_name AS site_name,
    s.from_site_name AS site_alt_name,
    s.city AS site_city,
    s.country AS site_country,
    s.region AS site_region,
    
    -- Lab info
    l.company_or_name AS lab_name,
    l.city AS lab_city,
    l.country AS lab_country,
    l.region AS lab_region,
    
    -- Shipping scenario
    ss.scenario_number,
    ss.combi AS area_combi,
    ss.item_no AS contract_item_no,
    ss.description AS contract_item_description,
    ss.requires_customs,
    
    -- Dates
    o.confirmed_sampling_date,
    o.confirmed_pickup_date,
    o.outbound_shipping_date,
    EXTRACT(WEEK FROM o.outbound_shipping_date) AS outbound_weeknum,
    TO_CHAR(o.outbound_shipping_date, 'YY-MM') AS outbound_yy_mm,
    
    -- Forwarders
    o.outbound_forwarder,
    o.sample_forwarder,
    
    -- Collection
    o.collection_booked_by_name,
    o.collection_id,
    
    -- Status
    o.status,
    
    -- Box counts
    COUNT(ob.id) AS total_boxes,
    COUNT(ob.id) FILTER (WHERE ob.status = 'completed') AS completed_boxes,
    COUNT(ob.id) FILTER (WHERE ob.status = 'lost') AS lost_boxes,
    COUNT(ob.id) FILTER (WHERE ob.exception IS NOT NULL AND ob.exception != '') AS boxes_with_exceptions,
    
    o.notes,
    o.created_at,
    o.updated_at
FROM orders o
LEFT JOIN kit_types kt ON o.kit_type_id = kt.id
LEFT JOIN sites s ON o.site_id = s.id
LEFT JOIN labs l ON o.lab_id = l.id
LEFT JOIN shipping_scenarios ss ON o.shipping_scenario_id = ss.id
LEFT JOIN order_boxes ob ON o.id = ob.order_id
GROUP BY o.id, o.order_number, o.sample_type, o.outbound_type, kt.name, kt.is_urgent,
         s.company_or_name, s.from_site_name, s.city, s.country, s.region,
         l.company_or_name, l.city, l.country, l.region,
         ss.scenario_number, ss.combi, ss.item_no, ss.description, ss.requires_customs,
         o.confirmed_sampling_date, o.confirmed_pickup_date, o.outbound_shipping_date,
         o.outbound_forwarder, o.sample_forwarder, o.collection_booked_by_name,
         o.collection_id, o.status, o.notes, o.created_at, o.updated_at;

-- View: Box details with waybill pairs
CREATE VIEW v_box_waybill_pairs AS
SELECT 
    ob.id AS box_id,
    o.id AS order_id,
    o.order_number,
    ob.box_number,
    
    -- Kit info
    kt.name AS kit_type_name,
    
    -- Site info
    s.company_or_name AS site_name,
    s.from_site_name AS site_alt_name,
    s.city AS site_city,
    s.country AS site_country,
    s.delivery_address AS site_address,
    
    -- Lab info
    l.company_or_name AS lab_name,
    l.city AS lab_city,
    l.country AS lab_country,
    l.delivery_address AS lab_address,
    
    -- Shipping scenario
    ss.scenario_number,
    ss.combi AS area_combi,
    ss.item_no AS contract_item_no,
    ss.description AS contract_item_description,
    
    -- Linked waybills
    ob.outbound_waybill,
    ob.sample_waybill,
    
    -- Barcode info
    ob.barcode_sequence,
    
    -- Status
    ob.status AS box_status,
    o.status AS order_status,
    
    -- Forwarders
    o.outbound_forwarder,
    o.sample_forwarder,
    
    -- Dates
    o.confirmed_sampling_date,
    o.confirmed_pickup_date,
    o.outbound_shipping_date,
    
    -- Tracking
    ob.exception,
    ob.notified_simona,
    
    -- Who did what
    ob.outbound_label_created_by_name,
    ob.sample_label_created_by_name,
    ob.box_picked_by_name,
    ob.box_checked_by_name,
    
    -- Document generation status
    ob.box_content_generated_outbound,
    ob.box_content_generated_sample,
    ob.nonadr_generated,
    
    -- Account info
    ob.outbound_account_name,
    ob.sample_account_name
FROM order_boxes ob
JOIN orders o ON ob.order_id = o.id
LEFT JOIN kit_types kt ON o.kit_type_id = kt.id
JOIN sites s ON o.site_id = s.id
JOIN labs l ON o.lab_id = l.id
LEFT JOIN shipping_scenarios ss ON o.shipping_scenario_id = ss.id;

-- ============================================================================
-- SAMPLE DATA (Items and Kits)
-- ============================================================================

-- Sample items
INSERT INTO items (item_code, name, description, category, weight_grams, volume_ml) VALUES
('TUBE-10ML-001', '10ml Sample Tube', 'Sterile 10ml sample collection tube with screw cap', 'tube', 15, 10),
('TUBE-5ML-001', '5ml Sample Tube', 'Sterile 5ml sample collection tube with screw cap', 'tube', 10, 5),
('ABS-PAD-001', 'Absorbent Pad', 'Absorbent pad for secondary containment', 'absorbent', 5, NULL),
('BAG-BIO-001', 'Biohazard Bag', 'Biohazard specimen bag with zip closure', 'packaging', 8, NULL),
('BOX-SEC-001', 'Secondary Container', 'Rigid secondary containment box', 'container', 150, NULL),
('ICE-GEL-001', 'Gel Ice Pack', 'Reusable gel ice pack for cold chain', 'cooling', 200, NULL),
('DOC-INST-001', 'Sampling Instructions', 'Printed sampling instructions document', 'documentation', 10, NULL),
('LBL-BAR-001', 'Barcode Label Set', 'Pre-printed barcode labels (set of 4)', 'label', 2, NULL);

-- Sample kit types (matching your Excel)
INSERT INTO kit_types (legacy_nr, name, description, box_length_cm, box_width_cm, box_height_cm, box_weight_empty_grams, box_content_template_outbound, template_path, is_urgent) VALUES
(1, 'outbound-kit 1', 'Standard outbound kit with basic sampling supplies', 30, 20, 15, 200, 'boxcontentlabel_template_outbound1.docx', 'V:\ETNL007\Data\Logistics\General\HaDEA\Order Entry\template\', FALSE),
(2, 'outbound-kit 2', 'Extended outbound kit with additional tubes', 35, 25, 20, 250, 'boxcontentlabel_template_outbound2.docx', 'template\', FALSE),
(3, 'outbound-kit1 URGENT', 'Urgent version of standard kit', 30, 20, 15, 200, 'boxcontentlabel_template_outbound1.docx', 'V:\ETNL007\Data\Logistics\General\HaDEA\Order Entry\template\', TRUE);

-- Sample kit contents (kit 1)
INSERT INTO kit_items (kit_type_id, item_id, quantity, sort_order)
SELECT 
    kt.id,
    i.id,
    CASE i.item_code 
        WHEN 'TUBE-10ML-001' THEN 4
        WHEN 'ABS-PAD-001' THEN 2
        WHEN 'BAG-BIO-001' THEN 1
        WHEN 'BOX-SEC-001' THEN 1
        WHEN 'DOC-INST-001' THEN 1
        WHEN 'LBL-BAR-001' THEN 1
        ELSE 1
    END,
    CASE i.item_code 
        WHEN 'BOX-SEC-001' THEN 1
        WHEN 'BAG-BIO-001' THEN 2
        WHEN 'TUBE-10ML-001' THEN 3
        WHEN 'ABS-PAD-001' THEN 4
        WHEN 'LBL-BAR-001' THEN 5
        WHEN 'DOC-INST-001' THEN 6
        ELSE 10
    END
FROM kit_types kt
CROSS JOIN items i
WHERE kt.name = 'outbound-kit 1'
AND i.item_code IN ('TUBE-10ML-001', 'ABS-PAD-001', 'BAG-BIO-001', 'BOX-SEC-001', 'DOC-INST-001', 'LBL-BAR-001');
