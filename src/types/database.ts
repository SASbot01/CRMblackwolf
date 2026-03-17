export type LeadStatus =
  | "nuevo"
  | "contactado"
  | "en_negociacion"
  | "propuesta_enviada"
  | "ganado"
  | "perdido";

export type LeadSource =
  | "web"
  | "referido"
  | "linkedin"
  | "cold_call"
  | "evento"
  | "otro";

export type LeadPriority = "baja" | "media" | "alta" | "urgente";

export interface Lead {
  id: string;
  created_at: string;
  updated_at: string;
  nombre: string;
  empresa: string;
  email: string;
  telefono: string;
  cargo: string;
  status: LeadStatus;
  source: LeadSource;
  prioridad: LeadPriority;
  valor_estimado: number;
  notas: string;
  ultima_interaccion: string | null;
  proxima_accion: string | null;
  fecha_proxima_accion: string | null;
  llamadas_realizadas: number;
  emails_enviados: number;
}

export interface Activity {
  id: string;
  created_at: string;
  lead_id: string;
  tipo: "llamada" | "email" | "reunion" | "nota" | "seguimiento";
  descripcion: string;
  resultado: string;
}

// Team & Commissions
export type TeamRole = "director" | "manager" | "closer" | "setter";

export interface TeamMember {
  id: string;
  created_at: string;
  nombre: string;
  email: string;
  roles: TeamRole[];
  status: "active" | "inactive";
  base_rate: number; // percentage
  avatar?: string;
}

export interface Commission {
  id: string;
  created_at: string;
  member_id: string;
  role: TeamRole;
  cash_neto: number;
  rate: number; // percentage
  commission_amount: number;
  source_lead?: string;
  status: "paid" | "pending";
  payment_date: string | null;
  period: string; // "2026-03"
}

export interface Expense {
  id: string;
  created_at: string;
  concept: string;
  amount: number;
  category: "operational" | "tools" | "marketing" | "payroll" | "other";
  status: "paid" | "pending";
  date: string;
  notes: string;
}

export interface Database {
  public: {
    Tables: {
      leads: {
        Row: Lead;
        Insert: Omit<Lead, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<Lead, "id" | "created_at">>;
      };
      activities: {
        Row: Activity;
        Insert: Omit<Activity, "id" | "created_at">;
        Update: Partial<Omit<Activity, "id" | "created_at">>;
      };
    };
  };
}
