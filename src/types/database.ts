// ── Core Types ──

export interface User {
  id: string;
  created_at: string;
  email: string;
  nombre: string;
  role: "admin" | "user";
  status: "active" | "inactive";
}

// ── Pipelines ──

export interface Pipeline {
  id: string;
  created_at: string;
  name: string;
  sort_order: number;
  stages?: PipelineStage[];
}

export interface PipelineStage {
  id: string;
  pipeline_id: string;
  name: string;
  color: string;
  sort_order: number;
  is_won: boolean;
  is_lost: boolean;
}

// ── Custom Fields ──

export type FieldType =
  | "text"
  | "number"
  | "date"
  | "select"
  | "multi_select"
  | "checkbox"
  | "url"
  | "email"
  | "phone"
  | "currency"
  | "textarea";

export type EntityType = "contact" | "company" | "deal";

export interface CustomField {
  id: string;
  created_at: string;
  entity_type: EntityType;
  name: string;
  field_key: string;
  field_type: FieldType;
  options: string[];
  required: boolean;
  sort_order: number;
}

// ── Tags ──

export interface Tag {
  id: string;
  name: string;
  color: string;
}

// ── Companies ──

export interface Company {
  id: string;
  created_at: string;
  updated_at: string;
  name: string;
  industry: string;
  website: string;
  phone: string;
  email: string;
  address: string;
  region: string;
  notes: string;
  custom_fields: Record<string, unknown>;
  tags?: Tag[];
  _contact_count?: number;
  _deal_count?: number;
  _deal_value?: number;
}

// ── Contacts ──

export interface Contact {
  id: string;
  created_at: string;
  updated_at: string;
  company_id: string | null;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  position: string;
  region: string;
  notes: string;
  custom_fields: Record<string, unknown>;
  tags?: Tag[];
  company?: Company;
}

// ── Deals ──

export type DealPriority = "low" | "medium" | "high" | "urgent";

export interface Deal {
  id: string;
  created_at: string;
  updated_at: string;
  title: string;
  contact_id: string | null;
  company_id: string | null;
  pipeline_id: string | null;
  stage_id: string | null;
  value: number;
  currency: string;
  priority: DealPriority;
  expected_close: string | null;
  notes: string;
  custom_fields: Record<string, unknown>;
  tags?: Tag[];
  contact?: Contact;
  company?: Company;
  stage?: PipelineStage;
}

// ── Activities ──

export type ActivityType = "call" | "email" | "meeting" | "note" | "task";

export interface Activity {
  id: string;
  created_at: string;
  entity_type: EntityType;
  entity_id: string;
  type: ActivityType;
  title: string;
  description: string;
  completed: boolean;
  due_date: string | null;
  user_id: string | null;
}

// ── Views ──

export type ViewType =
  | "dashboard"
  | "contacts"
  | "companies"
  | "deals"
  | "settings";
