-- BlackWolf CRM Database Schema

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

-- Leads
CREATE TABLE IF NOT EXISTS leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  nombre TEXT NOT NULL,
  empresa TEXT NOT NULL,
  email TEXT DEFAULT '',
  telefono TEXT DEFAULT '',
  cargo TEXT DEFAULT '',
  status TEXT DEFAULT 'nuevo' CHECK (status IN ('nuevo','contactado','en_negociacion','propuesta_enviada','ganado','perdido')),
  source TEXT DEFAULT 'web' CHECK (source IN ('web','referido','linkedin','cold_call','evento','otro')),
  prioridad TEXT DEFAULT 'media' CHECK (prioridad IN ('baja','media','alta','urgente')),
  valor_estimado NUMERIC DEFAULT 0,
  notas TEXT DEFAULT '',
  ultima_interaccion TIMESTAMPTZ,
  proxima_accion TEXT,
  fecha_proxima_accion TIMESTAMPTZ,
  llamadas_realizadas INT DEFAULT 0,
  emails_enviados INT DEFAULT 0
);

-- Activities
CREATE TABLE IF NOT EXISTS activities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL CHECK (tipo IN ('llamada','email','reunion','nota','seguimiento')),
  descripcion TEXT NOT NULL,
  resultado TEXT DEFAULT ''
);

-- Team Members
CREATE TABLE IF NOT EXISTS team_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  nombre TEXT NOT NULL,
  email TEXT NOT NULL,
  roles TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  base_rate NUMERIC DEFAULT 0
);

-- Commissions
CREATE TABLE IF NOT EXISTS commissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  member_id UUID REFERENCES team_members(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  cash_neto NUMERIC DEFAULT 0,
  rate NUMERIC DEFAULT 0,
  commission_amount NUMERIC DEFAULT 0,
  source_lead TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('paid', 'pending')),
  payment_date TIMESTAMPTZ,
  period TEXT NOT NULL
);

-- Expenses
CREATE TABLE IF NOT EXISTS expenses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  concept TEXT NOT NULL,
  amount NUMERIC DEFAULT 0,
  category TEXT DEFAULT 'operational' CHECK (category IN ('operational','tools','marketing','payroll','other')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('paid', 'pending')),
  date DATE NOT NULL,
  notes TEXT DEFAULT ''
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_updated ON leads(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_activities_lead ON activities(lead_id);
CREATE INDEX IF NOT EXISTS idx_commissions_period ON commissions(period);
CREATE INDEX IF NOT EXISTS idx_commissions_member ON commissions(member_id);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date);

-- Auto-update updated_at on leads
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS leads_updated_at ON leads;
CREATE TRIGGER leads_updated_at
  BEFORE UPDATE ON leads
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Seed admin user (password: blackwolf2026)
-- bcrypt hash for 'blackwolf2026'
INSERT INTO users (email, password_hash, nombre, role) VALUES
  ('admin@blackwolfsec.io', '$2a$10$X7VYHy.5z5Q5z5Q5z5Q5zOdummyhashreplacedatruntime', 'Admin BlackWolf', 'admin')
ON CONFLICT (email) DO NOTHING;

-- Seed demo data
INSERT INTO leads (nombre, empresa, email, telefono, cargo, status, source, prioridad, valor_estimado, notas, ultima_interaccion, proxima_accion, fecha_proxima_accion, llamadas_realizadas, emails_enviados) VALUES
  ('Carlos Méndez', 'TechCorp Solutions', 'carlos@techcorp.com', '+34 612 345 678', 'CTO', 'en_negociacion', 'linkedin', 'alta', 45000, 'Interested in full security audit and pentesting', NOW() - INTERVAL '2 days', 'Send detailed technical proposal', NOW() + INTERVAL '1 day', 3, 5),
  ('Ana García', 'FinBank Digital', 'agarcia@finbank.es', '+34 698 765 432', 'CISO', 'propuesta_enviada', 'referido', 'urgente', 120000, 'Urgent PCI DSS compliance needed. Budget approved by management.', NOW() - INTERVAL '3 days', 'Call to close the deal', NOW(), 5, 8),
  ('Miguel Torres', 'CloudFirst SL', 'mtorres@cloudfirst.io', '+34 655 111 222', 'VP Engineering', 'nuevo', 'web', 'media', 25000, 'Came through web form. Wants to secure AWS cloud infrastructure.', NULL, 'Initial qualification call', NOW() + INTERVAL '1 day', 0, 1),
  ('Laura Sánchez', 'Retail Pro España', 'lsanchez@retailpro.es', '+34 622 333 444', 'IT Director', 'contactado', 'evento', 'media', 35000, 'Met at CyberSec Madrid 2026 event. Interested in training and awareness.', NOW() - INTERVAL '4 days', 'Send similar case study', NOW() + INTERVAL '2 days', 2, 3),
  ('Pedro Ruiz', 'LogiTrans Global', 'pruiz@logitrans.com', '+34 677 888 999', 'CEO', 'ganado', 'cold_call', 'alta', 80000, 'Contract signed. Full audit + SOC implementation.', NOW() - INTERVAL '7 days', NULL, NULL, 8, 12),
  ('Isabel Fernández', 'MediHealth Tech', 'ifernandez@medihealth.es', '+34 633 222 111', 'Compliance Officer', 'perdido', 'linkedin', 'baja', 15000, 'Went with competitor on price. Keep in touch for future.', NOW() - INTERVAL '6 days', NULL, NULL, 4, 6);

-- Seed team members
INSERT INTO team_members (nombre, email, roles, status, base_rate) VALUES
  ('Abel Flauta Travesera', 'abelflautatravesera@gmail.com', ARRAY['director','manager','closer','setter'], 'active', 65),
  ('SuperAdmin', 'alex@blackwolfsec.io', ARRAY['director'], 'active', 0),
  ('María López', 'maria@blackwolfsec.io', ARRAY['closer','setter'], 'active', 50),
  ('David Chen', 'david@blackwolfsec.io', ARRAY['closer'], 'active', 45);

-- Seed activities
INSERT INTO activities (lead_id, tipo, descripcion, resultado)
SELECT l.id, 'llamada', 'Follow-up call about technical requirements', 'Positive - needs formal proposal'
FROM leads l WHERE l.nombre = 'Carlos Méndez';

INSERT INTO activities (lead_id, tipo, descripcion, resultado)
SELECT l.id, 'email', 'Sent PCI DSS commercial proposal', 'Under review by legal team'
FROM leads l WHERE l.nombre = 'Ana García';

INSERT INTO activities (lead_id, tipo, descripcion, resultado)
SELECT l.id, 'reunion', 'Service presentation video call', 'Interested, requested more training info'
FROM leads l WHERE l.nombre = 'Laura Sánchez';

INSERT INTO activities (lead_id, tipo, descripcion, resultado)
SELECT l.id, 'reunion', 'Contract signing', 'Closed - project starts in April'
FROM leads l WHERE l.nombre = 'Pedro Ruiz';

INSERT INTO activities (lead_id, tipo, descripcion, resultado)
SELECT l.id, 'nota', 'Lead registered from web form', 'Pending initial contact'
FROM leads l WHERE l.nombre = 'Miguel Torres';

-- Seed commissions
INSERT INTO commissions (member_id, role, cash_neto, rate, commission_amount, source_lead, status, payment_date, period)
SELECT tm.id, 'closer', 80000, 65, 52000, 'LogiTrans Global', 'paid', NOW() - INTERVAL '2 days', '2026-03'
FROM team_members tm WHERE tm.nombre = 'Abel Flauta Travesera';

INSERT INTO commissions (member_id, role, cash_neto, rate, commission_amount, source_lead, status, payment_date, period)
SELECT tm.id, 'setter', 80000, 10, 8000, 'LogiTrans Global', 'paid', NOW() - INTERVAL '2 days', '2026-03'
FROM team_members tm WHERE tm.nombre = 'María López';

INSERT INTO commissions (member_id, role, cash_neto, rate, commission_amount, source_lead, status, period)
SELECT tm.id, 'closer', 120000, 45, 54000, 'FinBank Digital', 'pending', '2026-03'
FROM team_members tm WHERE tm.nombre = 'David Chen';

INSERT INTO commissions (member_id, role, cash_neto, rate, commission_amount, source_lead, status, period)
SELECT tm.id, 'director', 200000, 5, 10000, 'All deals override', 'pending', '2026-03'
FROM team_members tm WHERE tm.nombre = 'Abel Flauta Travesera';

-- Seed expenses
INSERT INTO expenses (concept, amount, category, status, date, notes) VALUES
  ('AWS Infrastructure', 2500, 'tools', 'paid', '2026-03-01', 'Monthly cloud hosting'),
  ('LinkedIn Sales Navigator', 800, 'tools', 'paid', '2026-03-01', 'Team licenses x4'),
  ('Google Ads Campaign', 3000, 'marketing', 'paid', '2026-03-05', 'Q1 cybersecurity campaign'),
  ('Office Rent', 1800, 'operational', 'pending', '2026-03-15', 'Monthly office space');
