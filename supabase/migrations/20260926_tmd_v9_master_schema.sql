-- ==============================================================================
-- TMD DOMINICANA V9 — SUPABASE MASTER DATABASE SCHEMA & RLS MIGRATION
-- Translated 1:1 from Google AI Studio Firestore Collections & firestore.rules
-- Database: PostgreSQL 15+ (Supabase)
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================================================
-- 1. PROFILES & ROLES (Mirroring users, admins, staff)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    company_name TEXT,
    phone TEXT,
    role TEXT DEFAULT 'client' CHECK (role IN ('client', 'staff', 'admin')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Admin & Staff Whitelist Check Functions (Matching firestore.rules isAdmin() / isStaff())
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN (
        auth.jwt() ->> 'email' IN ('mrjliriano@gmail.com', 'jliriano154@gmail.com')
        OR EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_staff()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN (
        public.is_admin()
        OR EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role IN ('staff', 'admin')
        )
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==============================================================================
-- 2. MACHINERY CATALOG (Mirroring /maquinaria and /machinery_listings)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.machinery (
    id TEXT PRIMARY KEY,
    sku TEXT UNIQUE,
    name TEXT NOT NULL,
    brand TEXT NOT NULL,
    category TEXT NOT NULL,
    model_code TEXT,
    year INT DEFAULT 2026,
    image TEXT,
    power_hp NUMERIC,
    operating_weight_kg NUMERIC,
    bucket_capacity_m3 NUMERIC,
    engine TEXT,
    description TEXT,
    in_stock BOOLEAN DEFAULT true,
    featured BOOLEAN DEFAULT false,
    warranty_months INT DEFAULT 12,
    base_price_usd NUMERIC NOT NULL DEFAULT 0,
    specs JSONB DEFAULT '[]'::jsonb,
    applications JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 3. SPARE PARTS CATALOG (Mirroring /repuestos)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.parts (
    id TEXT PRIMARY KEY,
    sku TEXT UNIQUE,
    part_number TEXT NOT NULL,
    name TEXT NOT NULL,
    brand TEXT NOT NULL,
    category TEXT NOT NULL,
    assembly_id TEXT,
    compatible_models JSONB DEFAULT '[]'::jsonb,
    price_usd NUMERIC NOT NULL DEFAULT 0,
    price_dop NUMERIC DEFAULT 0,
    stock_qty INT DEFAULT 0,
    image TEXT,
    description TEXT,
    is_oem BOOLEAN DEFAULT true,
    delivery_time_hours INT DEFAULT 24,
    cross_references JSONB DEFAULT '[]'::jsonb,
    warehouse_location TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 4. SALES LEADS & CRM INQUIRIES (Mirroring /sales_leads & /crm_inquiries)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.sales_leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    customer_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    company TEXT,
    province TEXT,
    interest_item_id TEXT,
    interest_item_type TEXT CHECK (interest_item_type IN ('machinery', 'parts', 'service', 'rental')),
    budget_range TEXT,
    status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'quoted', 'won', 'lost')),
    source TEXT DEFAULT 'web_store',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 5. QUOTES & FORMAL PROFORMAS (Mirroring /quotes and /presupuestos)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.quotes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    quote_number TEXT UNIQUE NOT NULL,
    customer_name TEXT NOT NULL,
    customer_rnc TEXT,
    customer_phone TEXT,
    customer_email TEXT,
    currency TEXT DEFAULT 'USD' CHECK (currency IN ('USD', 'DOP')),
    exchange_rate NUMERIC DEFAULT 60.50,
    items JSONB NOT NULL DEFAULT '[]'::jsonb,
    subtotal NUMERIC NOT NULL DEFAULT 0,
    itbis_amount NUMERIC NOT NULL DEFAULT 0,
    total_amount NUMERIC NOT NULL DEFAULT 0,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'approved', 'rejected', 'expired')),
    pdf_url TEXT,
    valid_until TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '15 days'),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 6. WORK ORDERS & FULLBAY SERVICE (Mirroring /work_orders & /fullbay_work_orders)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.work_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    order_number TEXT UNIQUE NOT NULL,
    machine_model TEXT NOT NULL,
    serial_number TEXT,
    service_type TEXT NOT NULL, -- 'overhaul', 'preventive', 'field_emergency', 'dvi'
    assigned_technician TEXT,
    bay_number INT,
    status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'awaiting_parts', 'qa_testing', 'completed', 'delivered')),
    hourly_rate_usd NUMERIC DEFAULT 65.00,
    labor_hours NUMERIC DEFAULT 0,
    parts_cost_usd NUMERIC DEFAULT 0,
    total_usd NUMERIC DEFAULT 0,
    telematics_livelink_id TEXT,
    dvi_checklist JSONB DEFAULT '[]'::jsonb,
    timeline JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 7. PATIO KM 22 TEST DRIVES & DEMOS (Mirroring /patio_test_drives)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.patio_test_drives (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    customer_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    machine_id TEXT NOT NULL,
    scheduled_date TIMESTAMPTZ NOT NULL,
    operator_license TEXT,
    status TEXT DEFAULT 'confirmed' CHECK (status IN ('requested', 'confirmed', 'completed', 'cancelled')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 8. AUDIT & INVENTORY QR SCAN LOGS (Mirroring /audit_logs & /inventory_logs)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id),
    action TEXT NOT NULL,
    entity TEXT NOT NULL,
    entity_id TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.inventory_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    scanned_by UUID REFERENCES auth.users(id),
    barcode_qr TEXT NOT NULL,
    item_type TEXT,
    action TEXT, -- 'inventory_audit', 'checkout_dock', 'stock_recount'
    location TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 9. ROW LEVEL SECURITY (RLS) POLICIES — 1:1 MATCH OF FIRESTORE RULES
-- ==============================================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.machinery ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.work_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patio_test_drives ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_logs ENABLE ROW LEVEL SECURITY;

-- 9.1 Profiles Policies
CREATE POLICY "Public profiles are viewable by authenticated users" ON public.profiles FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- 9.2 Machinery & Parts: Public Read for Storefront / Showroom, Staff Write
CREATE POLICY "Public read for machinery" ON public.machinery FOR SELECT USING (true);
CREATE POLICY "Staff write for machinery" ON public.machinery FOR ALL USING (public.is_staff());

CREATE POLICY "Public read for parts" ON public.parts FOR SELECT USING (true);
CREATE POLICY "Staff write for parts" ON public.parts FOR ALL USING (public.is_staff());

-- 9.3 Sales Leads: Public Create (Storefront inquiries), Staff/Admin Read & Manage
CREATE POLICY "Anyone can create sales lead" ON public.sales_leads FOR INSERT WITH CHECK (true);
CREATE POLICY "Staff and Admins manage sales leads" ON public.sales_leads FOR ALL USING (public.is_staff());
CREATE POLICY "Users view own sales leads" ON public.sales_leads FOR SELECT USING (auth.uid() = user_id);

-- 9.4 Quotes: Authenticated users create and read own, Staff/Admin manage all
CREATE POLICY "Users view own quotes" ON public.quotes FOR SELECT USING (auth.uid() = user_id OR public.is_staff());
CREATE POLICY "Users create quotes" ON public.quotes FOR INSERT WITH CHECK (auth.role() = 'authenticated' OR public.is_staff());
CREATE POLICY "Staff manage quotes" ON public.quotes FOR ALL USING (public.is_staff());

-- 9.5 Work Orders: Clients view their own orders, Staff manage all
CREATE POLICY "Clients view own work orders" ON public.work_orders FOR SELECT USING (auth.uid() = user_id OR public.is_staff());
CREATE POLICY "Staff manage work orders" ON public.work_orders FOR ALL USING (public.is_staff());

-- 9.6 Patio Test Drives: Authenticated bookings, Staff manage
CREATE POLICY "Users create test drive bookings" ON public.patio_test_drives FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users view own test drives" ON public.patio_test_drives FOR SELECT USING (auth.uid() = user_id OR public.is_staff());
CREATE POLICY "Staff manage test drives" ON public.patio_test_drives FOR ALL USING (public.is_staff());

-- 9.7 Audit Logs: Strictly Immutable (No UPDATE or DELETE)
CREATE POLICY "Staff view audit logs" ON public.audit_logs FOR SELECT USING (public.is_staff());
CREATE POLICY "Authenticated users insert audit logs" ON public.audit_logs FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- 9.8 Inventory Logs: QR scans viewable by public/staff, insert by authenticated/staff
CREATE POLICY "Anyone view inventory logs" ON public.inventory_logs FOR SELECT USING (true);
CREATE POLICY "Staff and Users insert inventory logs" ON public.inventory_logs FOR INSERT WITH CHECK (auth.role() = 'authenticated' OR public.is_staff());
