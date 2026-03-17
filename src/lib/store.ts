import { Lead, Activity, LeadStatus, LeadSource, LeadPriority } from "@/types/database";

// Demo data for local development
const demoLeads: Lead[] = [
  {
    id: "1",
    created_at: "2026-03-10T10:00:00Z",
    updated_at: "2026-03-15T14:30:00Z",
    nombre: "Carlos Méndez",
    empresa: "TechCorp Solutions",
    email: "carlos@techcorp.com",
    telefono: "+34 612 345 678",
    cargo: "CTO",
    status: "en_negociacion",
    source: "linkedin",
    prioridad: "alta",
    valor_estimado: 45000,
    notas: "Interested in full security audit and pentesting",
    ultima_interaccion: "2026-03-15T14:30:00Z",
    proxima_accion: "Send detailed technical proposal",
    fecha_proxima_accion: "2026-03-18T10:00:00Z",
    llamadas_realizadas: 3,
    emails_enviados: 5,
  },
  {
    id: "2",
    created_at: "2026-03-08T09:00:00Z",
    updated_at: "2026-03-14T11:00:00Z",
    nombre: "Ana García",
    empresa: "FinBank Digital",
    email: "agarcia@finbank.es",
    telefono: "+34 698 765 432",
    cargo: "CISO",
    status: "propuesta_enviada",
    source: "referido",
    prioridad: "urgente",
    valor_estimado: 120000,
    notas: "Urgent PCI DSS compliance needed. Budget approved by management.",
    ultima_interaccion: "2026-03-14T11:00:00Z",
    proxima_accion: "Call to close the deal",
    fecha_proxima_accion: "2026-03-17T09:00:00Z",
    llamadas_realizadas: 5,
    emails_enviados: 8,
  },
  {
    id: "3",
    created_at: "2026-03-12T15:00:00Z",
    updated_at: "2026-03-12T15:00:00Z",
    nombre: "Miguel Torres",
    empresa: "CloudFirst SL",
    email: "mtorres@cloudfirst.io",
    telefono: "+34 655 111 222",
    cargo: "VP Engineering",
    status: "nuevo",
    source: "web",
    prioridad: "media",
    valor_estimado: 25000,
    notas: "Came through web form. Wants to secure AWS cloud infrastructure.",
    ultima_interaccion: null,
    proxima_accion: "Initial qualification call",
    fecha_proxima_accion: "2026-03-18T11:00:00Z",
    llamadas_realizadas: 0,
    emails_enviados: 1,
  },
  {
    id: "4",
    created_at: "2026-03-05T08:00:00Z",
    updated_at: "2026-03-13T16:00:00Z",
    nombre: "Laura Sánchez",
    empresa: "Retail Pro España",
    email: "lsanchez@retailpro.es",
    telefono: "+34 622 333 444",
    cargo: "IT Director",
    status: "contactado",
    source: "evento",
    prioridad: "media",
    valor_estimado: 35000,
    notas: "Met at CyberSec Madrid 2026 event. Interested in training and awareness.",
    ultima_interaccion: "2026-03-13T16:00:00Z",
    proxima_accion: "Send similar case study",
    fecha_proxima_accion: "2026-03-19T10:00:00Z",
    llamadas_realizadas: 2,
    emails_enviados: 3,
  },
  {
    id: "5",
    created_at: "2026-02-20T10:00:00Z",
    updated_at: "2026-03-10T09:00:00Z",
    nombre: "Pedro Ruiz",
    empresa: "LogiTrans Global",
    email: "pruiz@logitrans.com",
    telefono: "+34 677 888 999",
    cargo: "CEO",
    status: "ganado",
    source: "cold_call",
    prioridad: "alta",
    valor_estimado: 80000,
    notas: "Contract signed. Full audit + SOC implementation.",
    ultima_interaccion: "2026-03-10T09:00:00Z",
    proxima_accion: null,
    fecha_proxima_accion: null,
    llamadas_realizadas: 8,
    emails_enviados: 12,
  },
  {
    id: "6",
    created_at: "2026-03-01T14:00:00Z",
    updated_at: "2026-03-11T10:00:00Z",
    nombre: "Isabel Fernández",
    empresa: "MediHealth Tech",
    email: "ifernandez@medihealth.es",
    telefono: "+34 633 222 111",
    cargo: "Compliance Officer",
    status: "perdido",
    source: "linkedin",
    prioridad: "baja",
    valor_estimado: 15000,
    notas: "Went with competitor on price. Keep in touch for future.",
    ultima_interaccion: "2026-03-11T10:00:00Z",
    proxima_accion: null,
    fecha_proxima_accion: null,
    llamadas_realizadas: 4,
    emails_enviados: 6,
  },
];

const demoActivities: Activity[] = [
  { id: "a1", created_at: "2026-03-15T14:30:00Z", lead_id: "1", tipo: "llamada", descripcion: "Follow-up call about technical requirements", resultado: "Positive - needs formal proposal" },
  { id: "a2", created_at: "2026-03-14T11:00:00Z", lead_id: "2", tipo: "email", descripcion: "Sent PCI DSS commercial proposal", resultado: "Under review by legal team" },
  { id: "a3", created_at: "2026-03-13T16:00:00Z", lead_id: "4", tipo: "reunion", descripcion: "Service presentation video call", resultado: "Interested, requested more training info" },
  { id: "a4", created_at: "2026-03-10T09:00:00Z", lead_id: "5", tipo: "reunion", descripcion: "Contract signing", resultado: "Closed - project starts in April" },
  { id: "a5", created_at: "2026-03-12T15:00:00Z", lead_id: "3", tipo: "nota", descripcion: "Lead registered from web form", resultado: "Pending initial contact" },
];

let leads = [...demoLeads];
let activities = [...demoActivities];

export async function getLeads(filters?: {
  status?: LeadStatus;
  source?: LeadSource;
  prioridad?: LeadPriority;
  search?: string;
}): Promise<Lead[]> {
  let result = [...leads];

  if (filters?.status) {
    result = result.filter((l) => l.status === filters.status);
  }
  if (filters?.source) {
    result = result.filter((l) => l.source === filters.source);
  }
  if (filters?.prioridad) {
    result = result.filter((l) => l.prioridad === filters.prioridad);
  }
  if (filters?.search) {
    const s = filters.search.toLowerCase();
    result = result.filter(
      (l) =>
        l.nombre.toLowerCase().includes(s) ||
        l.empresa.toLowerCase().includes(s) ||
        l.email.toLowerCase().includes(s)
    );
  }

  return result.sort(
    (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
  );
}

export async function getLead(id: string): Promise<Lead | undefined> {
  return leads.find((l) => l.id === id);
}

export async function createLead(
  data: Omit<Lead, "id" | "created_at" | "updated_at">
): Promise<Lead> {
  const now = new Date().toISOString();
  const newLead: Lead = {
    ...data,
    id: crypto.randomUUID(),
    created_at: now,
    updated_at: now,
  };
  leads.unshift(newLead);
  return newLead;
}

export async function updateLead(
  id: string,
  data: Partial<Omit<Lead, "id" | "created_at">>
): Promise<Lead | undefined> {
  const index = leads.findIndex((l) => l.id === id);
  if (index === -1) return undefined;
  leads[index] = { ...leads[index], ...data, updated_at: new Date().toISOString() };
  return leads[index];
}

export async function deleteLead(id: string): Promise<boolean> {
  const len = leads.length;
  leads = leads.filter((l) => l.id !== id);
  activities = activities.filter((a) => a.lead_id !== id);
  return leads.length < len;
}

export async function getActivities(leadId: string): Promise<Activity[]> {
  return activities
    .filter((a) => a.lead_id === leadId)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export async function createActivity(
  data: Omit<Activity, "id" | "created_at">
): Promise<Activity> {
  const newActivity: Activity = {
    ...data,
    id: crypto.randomUUID(),
    created_at: new Date().toISOString(),
  };
  activities.unshift(newActivity);
  const leadIndex = leads.findIndex((l) => l.id === data.lead_id);
  if (leadIndex !== -1) {
    leads[leadIndex].ultima_interaccion = newActivity.created_at;
    leads[leadIndex].updated_at = newActivity.created_at;
    if (data.tipo === "llamada") leads[leadIndex].llamadas_realizadas++;
    if (data.tipo === "email") leads[leadIndex].emails_enviados++;
  }
  return newActivity;
}

export function getStats() {
  const total = leads.length;
  const byStatus: Record<LeadStatus, number> = {
    nuevo: 0,
    contactado: 0,
    en_negociacion: 0,
    propuesta_enviada: 0,
    ganado: 0,
    perdido: 0,
  };
  let valorTotal = 0;
  let valorGanado = 0;

  leads.forEach((l) => {
    byStatus[l.status]++;
    valorTotal += l.valor_estimado;
    if (l.status === "ganado") valorGanado += l.valor_estimado;
  });

  return { total, byStatus, valorTotal, valorGanado };
}
