// Frontend API client — all CRUD operations go through here

const BASE = "/api";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("bw_token");
}

async function apiFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> || {}),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  return fetch(`${BASE}${path}`, { ...options, headers });
}

// --- Auth ---
export async function apiLogin(email: string, password: string) {
  const res = await apiFetch("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) return { success: false, error: data.error };
  localStorage.setItem("bw_token", data.token);
  localStorage.setItem("bw_session", JSON.stringify(data.user));
  return { success: true, user: data.user };
}

export async function apiRegister(email: string, password: string, nombre: string) {
  const res = await apiFetch("/auth/register", {
    method: "POST",
    body: JSON.stringify({ email, password, nombre }),
  });
  const data = await res.json();
  if (!res.ok) return { success: false, error: data.error };
  localStorage.setItem("bw_token", data.token);
  localStorage.setItem("bw_session", JSON.stringify(data.user));
  return { success: true, user: data.user };
}

export function apiLogout() {
  localStorage.removeItem("bw_token");
  localStorage.removeItem("bw_session");
}

export function getStoredUser() {
  if (typeof window === "undefined") return null;
  try {
    const s = localStorage.getItem("bw_session");
    return s ? JSON.parse(s) : null;
  } catch { return null; }
}

// --- Leads ---
export async function apiGetLeads(filters?: {
  status?: string; source?: string; prioridad?: string; search?: string;
}) {
  const params = new URLSearchParams();
  if (filters?.status) params.set("status", filters.status);
  if (filters?.source) params.set("source", filters.source);
  if (filters?.prioridad) params.set("prioridad", filters.prioridad);
  if (filters?.search) params.set("search", filters.search);
  const res = await apiFetch(`/leads?${params}`);
  return res.json();
}

export async function apiGetLead(id: string) {
  const res = await apiFetch(`/leads/${id}`);
  return res.json();
}

export async function apiCreateLead(data: Record<string, unknown>) {
  const res = await apiFetch("/leads", { method: "POST", body: JSON.stringify(data) });
  return res.json();
}

export async function apiUpdateLead(id: string, data: Record<string, unknown>) {
  const res = await apiFetch(`/leads/${id}`, { method: "PATCH", body: JSON.stringify(data) });
  return res.json();
}

export async function apiDeleteLead(id: string) {
  await apiFetch(`/leads/${id}`, { method: "DELETE" });
}

// --- Activities ---
export async function apiGetActivities(leadId: string) {
  const res = await apiFetch(`/activities?lead_id=${leadId}`);
  return res.json();
}

export async function apiCreateActivity(data: Record<string, unknown>) {
  const res = await apiFetch("/activities", { method: "POST", body: JSON.stringify(data) });
  return res.json();
}

// --- Team ---
export async function apiGetMembers() {
  const res = await apiFetch("/team");
  return res.json();
}

export async function apiCreateMember(data: Record<string, unknown>) {
  const res = await apiFetch("/team", { method: "POST", body: JSON.stringify(data) });
  return res.json();
}

export async function apiUpdateMember(id: string, data: Record<string, unknown>) {
  const res = await apiFetch(`/team/${id}`, { method: "PATCH", body: JSON.stringify(data) });
  return res.json();
}

export async function apiDeleteMember(id: string) {
  await apiFetch(`/team/${id}`, { method: "DELETE" });
}

// --- Commissions ---
export async function apiGetCommissions(filters?: { period?: string; member_id?: string; role?: string; status?: string }) {
  const params = new URLSearchParams();
  if (filters?.period) params.set("period", filters.period);
  if (filters?.member_id) params.set("member_id", filters.member_id);
  if (filters?.role) params.set("role", filters.role);
  if (filters?.status) params.set("status", filters.status);
  const res = await apiFetch(`/commissions?${params}`);
  return res.json();
}

export async function apiCreateCommission(data: Record<string, unknown>) {
  const res = await apiFetch("/commissions", { method: "POST", body: JSON.stringify(data) });
  return res.json();
}

export async function apiUpdateCommission(id: string, data: Record<string, unknown>) {
  const res = await apiFetch(`/commissions/${id}`, { method: "PATCH", body: JSON.stringify(data) });
  return res.json();
}

// --- Expenses ---
export async function apiGetExpenses(filters?: { category?: string; status?: string; period?: string }) {
  const params = new URLSearchParams();
  if (filters?.category) params.set("category", filters.category);
  if (filters?.status) params.set("status", filters.status);
  if (filters?.period) params.set("period", filters.period);
  const res = await apiFetch(`/expenses?${params}`);
  return res.json();
}

export async function apiCreateExpense(data: Record<string, unknown>) {
  const res = await apiFetch("/expenses", { method: "POST", body: JSON.stringify(data) });
  return res.json();
}

export async function apiUpdateExpense(id: string, data: Record<string, unknown>) {
  const res = await apiFetch(`/expenses/${id}`, { method: "PATCH", body: JSON.stringify(data) });
  return res.json();
}

export async function apiDeleteExpense(id: string) {
  await apiFetch(`/expenses/${id}`, { method: "DELETE" });
}
