// Frontend API client — all CRUD operations

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

async function jsonOrThrow(res: Response) {
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data;
}

// ── Auth ──
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

// ── Contacts ──
export async function apiGetContacts(search?: string) {
  const params = search ? `?search=${encodeURIComponent(search)}` : "";
  const res = await apiFetch(`/contacts${params}`);
  return jsonOrThrow(res);
}

export async function apiGetContact(id: string) {
  const res = await apiFetch(`/contacts/${id}`);
  return jsonOrThrow(res);
}

export async function apiCreateContact(data: Record<string, unknown>) {
  const res = await apiFetch("/contacts", { method: "POST", body: JSON.stringify(data) });
  return jsonOrThrow(res);
}

export async function apiUpdateContact(id: string, data: Record<string, unknown>) {
  const res = await apiFetch(`/contacts/${id}`, { method: "PATCH", body: JSON.stringify(data) });
  return jsonOrThrow(res);
}

export async function apiDeleteContact(id: string) {
  await apiFetch(`/contacts/${id}`, { method: "DELETE" });
}

// ── Companies ──
export async function apiGetCompanies(search?: string) {
  const params = search ? `?search=${encodeURIComponent(search)}` : "";
  const res = await apiFetch(`/companies${params}`);
  return jsonOrThrow(res);
}

export async function apiGetCompany(id: string) {
  const res = await apiFetch(`/companies/${id}`);
  return jsonOrThrow(res);
}

export async function apiCreateCompany(data: Record<string, unknown>) {
  const res = await apiFetch("/companies", { method: "POST", body: JSON.stringify(data) });
  return jsonOrThrow(res);
}

export async function apiUpdateCompany(id: string, data: Record<string, unknown>) {
  const res = await apiFetch(`/companies/${id}`, { method: "PATCH", body: JSON.stringify(data) });
  return jsonOrThrow(res);
}

export async function apiDeleteCompany(id: string) {
  await apiFetch(`/companies/${id}`, { method: "DELETE" });
}

// ── Deals ──
export async function apiGetDeals(filters?: { pipeline_id?: string; stage_id?: string; search?: string }) {
  const params = new URLSearchParams();
  if (filters?.pipeline_id) params.set("pipeline_id", filters.pipeline_id);
  if (filters?.stage_id) params.set("stage_id", filters.stage_id);
  if (filters?.search) params.set("search", filters.search);
  const res = await apiFetch(`/deals?${params}`);
  return jsonOrThrow(res);
}

export async function apiGetDeal(id: string) {
  const res = await apiFetch(`/deals/${id}`);
  return jsonOrThrow(res);
}

export async function apiCreateDeal(data: Record<string, unknown>) {
  const res = await apiFetch("/deals", { method: "POST", body: JSON.stringify(data) });
  return jsonOrThrow(res);
}

export async function apiUpdateDeal(id: string, data: Record<string, unknown>) {
  const res = await apiFetch(`/deals/${id}`, { method: "PATCH", body: JSON.stringify(data) });
  return jsonOrThrow(res);
}

export async function apiDeleteDeal(id: string) {
  await apiFetch(`/deals/${id}`, { method: "DELETE" });
}

// ── Pipelines ──
export async function apiGetPipelines() {
  const res = await apiFetch("/pipelines");
  return jsonOrThrow(res);
}

export async function apiCreatePipeline(data: Record<string, unknown>) {
  const res = await apiFetch("/pipelines", { method: "POST", body: JSON.stringify(data) });
  return jsonOrThrow(res);
}

export async function apiUpdatePipeline(id: string, data: Record<string, unknown>) {
  const res = await apiFetch(`/pipelines/${id}`, { method: "PATCH", body: JSON.stringify(data) });
  return jsonOrThrow(res);
}

export async function apiDeletePipeline(id: string) {
  await apiFetch(`/pipelines/${id}`, { method: "DELETE" });
}

// ── Custom Fields ──
export async function apiGetCustomFields(entityType?: string) {
  const params = entityType ? `?entity_type=${entityType}` : "";
  const res = await apiFetch(`/custom-fields${params}`);
  return jsonOrThrow(res);
}

export async function apiCreateCustomField(data: Record<string, unknown>) {
  const res = await apiFetch("/custom-fields", { method: "POST", body: JSON.stringify(data) });
  return jsonOrThrow(res);
}

export async function apiUpdateCustomField(id: string, data: Record<string, unknown>) {
  const res = await apiFetch(`/custom-fields/${id}`, { method: "PATCH", body: JSON.stringify(data) });
  return jsonOrThrow(res);
}

export async function apiDeleteCustomField(id: string) {
  await apiFetch(`/custom-fields/${id}`, { method: "DELETE" });
}

// ── Tags ──
export async function apiGetTags() {
  const res = await apiFetch("/tags");
  return jsonOrThrow(res);
}

export async function apiCreateTag(data: Record<string, unknown>) {
  const res = await apiFetch("/tags", { method: "POST", body: JSON.stringify(data) });
  return jsonOrThrow(res);
}

export async function apiUpdateTag(id: string, data: Record<string, unknown>) {
  const res = await apiFetch(`/tags/${id}`, { method: "PATCH", body: JSON.stringify(data) });
  return jsonOrThrow(res);
}

export async function apiDeleteTag(id: string) {
  await apiFetch(`/tags/${id}`, { method: "DELETE" });
}

// ── Activities ──
export async function apiGetActivities(entityType: string, entityId: string) {
  const res = await apiFetch(`/activities?entity_type=${entityType}&entity_id=${entityId}`);
  return jsonOrThrow(res);
}

export async function apiCreateActivity(data: Record<string, unknown>) {
  const res = await apiFetch("/activities", { method: "POST", body: JSON.stringify(data) });
  return jsonOrThrow(res);
}

// ── Dashboard ──
export async function apiGetDashboard() {
  const res = await apiFetch("/dashboard");
  return jsonOrThrow(res);
}

// ── Entity Tags ──
export async function apiAddTag(entityType: string, entityId: string, tagId: string) {
  const res = await apiFetch("/tags/assign", {
    method: "POST",
    body: JSON.stringify({ entity_type: entityType, entity_id: entityId, tag_id: tagId }),
  });
  return jsonOrThrow(res);
}

export async function apiRemoveTag(entityType: string, entityId: string, tagId: string) {
  await apiFetch(`/tags/assign?entity_type=${entityType}&entity_id=${entityId}&tag_id=${tagId}`, {
    method: "DELETE",
  });
}
