-- BlackWolf CRM v2 — Customizable Schema

-- Users / Auth
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  nombre TEXT NOT NULL,
  role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive'))
);

-- Pipelines (multiple, configurable)
CREATE TABLE IF NOT EXISTS pipelines (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  name TEXT NOT NULL,
  sort_order INT DEFAULT 0
);

-- Pipeline Stages
CREATE TABLE IF NOT EXISTS pipeline_stages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  pipeline_id UUID REFERENCES pipelines(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT DEFAULT '#6B7280',
  sort_order INT DEFAULT 0,
  is_won BOOLEAN DEFAULT false,
  is_lost BOOLEAN DEFAULT false
);

-- Custom Field Definitions
CREATE TABLE IF NOT EXISTS custom_fields (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  entity_type TEXT NOT NULL CHECK (entity_type IN ('contact', 'company', 'deal')),
  name TEXT NOT NULL,
  field_key TEXT NOT NULL,
  field_type TEXT NOT NULL CHECK (field_type IN ('text','number','date','select','multi_select','checkbox','url','email','phone','currency','textarea')),
  options JSONB DEFAULT '[]',
  required BOOLEAN DEFAULT false,
  sort_order INT DEFAULT 0,
  UNIQUE(entity_type, field_key)
);

-- Tags
CREATE TABLE IF NOT EXISTS tags (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  color TEXT DEFAULT '#6B7280'
);

-- Companies
CREATE TABLE IF NOT EXISTS companies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  name TEXT NOT NULL,
  industry TEXT DEFAULT '',
  website TEXT DEFAULT '',
  phone TEXT DEFAULT '',
  email TEXT DEFAULT '',
  address TEXT DEFAULT '',
  region TEXT DEFAULT '',
  notes TEXT DEFAULT '',
  custom_fields JSONB DEFAULT '{}'
);

-- Contacts
CREATE TABLE IF NOT EXISTS contacts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
  first_name TEXT NOT NULL,
  last_name TEXT DEFAULT '',
  email TEXT DEFAULT '',
  phone TEXT DEFAULT '',
  position TEXT DEFAULT '',
  region TEXT DEFAULT '',
  notes TEXT DEFAULT '',
  custom_fields JSONB DEFAULT '{}'
);

-- Deals
CREATE TABLE IF NOT EXISTS deals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  title TEXT NOT NULL,
  contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
  company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
  pipeline_id UUID REFERENCES pipelines(id) ON DELETE SET NULL,
  stage_id UUID REFERENCES pipeline_stages(id) ON DELETE SET NULL,
  value NUMERIC DEFAULT 0,
  currency TEXT DEFAULT 'EUR',
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low','medium','high','urgent')),
  expected_close DATE,
  notes TEXT DEFAULT '',
  custom_fields JSONB DEFAULT '{}'
);

-- Entity Tags (polymorphic)
CREATE TABLE IF NOT EXISTS entity_tags (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL CHECK (entity_type IN ('contact','company','deal')),
  entity_id UUID NOT NULL,
  UNIQUE(tag_id, entity_type, entity_id)
);

-- Activities (polymorphic)
CREATE TABLE IF NOT EXISTS activities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  entity_type TEXT NOT NULL CHECK (entity_type IN ('contact','company','deal')),
  entity_id UUID NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('call','email','meeting','note','task')),
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  completed BOOLEAN DEFAULT false,
  due_date TIMESTAMPTZ,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_contacts_company ON contacts(company_id);
CREATE INDEX IF NOT EXISTS idx_deals_pipeline ON deals(pipeline_id);
CREATE INDEX IF NOT EXISTS idx_deals_stage ON deals(stage_id);
CREATE INDEX IF NOT EXISTS idx_deals_contact ON deals(contact_id);
CREATE INDEX IF NOT EXISTS idx_deals_company ON deals(company_id);
CREATE INDEX IF NOT EXISTS idx_entity_tags_entity ON entity_tags(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_activities_entity ON activities(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_custom_fields_entity ON custom_fields(entity_type);

-- Auto-update triggers
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS contacts_updated_at ON contacts;
CREATE TRIGGER contacts_updated_at BEFORE UPDATE ON contacts FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS companies_updated_at ON companies;
CREATE TRIGGER companies_updated_at BEFORE UPDATE ON companies FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS deals_updated_at ON deals;
CREATE TRIGGER deals_updated_at BEFORE UPDATE ON deals FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Seed admin user (password: blackwolf2026)
INSERT INTO users (email, password_hash, nombre, role) VALUES
  ('admin@blackwolfsec.io', '$2a$10$X7VYHy.5z5Q5z5Q5z5Q5zOdummyhashreplacedatruntime', 'Admin BlackWolf', 'admin')
ON CONFLICT (email) DO NOTHING;

-- Default pipeline
INSERT INTO pipelines (id, name, sort_order) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Sales', 0)
ON CONFLICT DO NOTHING;

INSERT INTO pipeline_stages (pipeline_id, name, color, sort_order, is_won, is_lost) VALUES
  ('00000000-0000-0000-0000-000000000001', 'New', '#3B82F6', 0, false, false),
  ('00000000-0000-0000-0000-000000000001', 'Contacted', '#06B6D4', 1, false, false),
  ('00000000-0000-0000-0000-000000000001', 'Negotiation', '#F97316', 2, false, false),
  ('00000000-0000-0000-0000-000000000001', 'Proposal', '#A855F7', 3, false, false),
  ('00000000-0000-0000-0000-000000000001', 'Won', '#10B981', 4, true, false),
  ('00000000-0000-0000-0000-000000000001', 'Lost', '#EF4444', 5, false, true)
ON CONFLICT DO NOTHING;
