import { TeamMember, Commission, Expense, TeamRole } from "@/types/database";

const demoMembers: TeamMember[] = [
  {
    id: "tm1",
    created_at: "2026-01-01T00:00:00Z",
    nombre: "Abel Flauta Travesera",
    email: "abelflautatravesera@gmail.com",
    roles: ["director", "manager", "closer", "setter"],
    status: "active",
    base_rate: 65,
  },
  {
    id: "tm2",
    created_at: "2026-01-01T00:00:00Z",
    nombre: "SuperAdmin",
    email: "alex@blackwolfsec.io",
    roles: ["director"],
    status: "active",
    base_rate: 0,
  },
  {
    id: "tm3",
    created_at: "2026-02-15T00:00:00Z",
    nombre: "María López",
    email: "maria@blackwolfsec.io",
    roles: ["closer", "setter"],
    status: "active",
    base_rate: 50,
  },
  {
    id: "tm4",
    created_at: "2026-03-01T00:00:00Z",
    nombre: "David Chen",
    email: "david@blackwolfsec.io",
    roles: ["closer"],
    status: "active",
    base_rate: 45,
  },
];

const demoCommissions: Commission[] = [
  {
    id: "c1",
    created_at: "2026-03-10T00:00:00Z",
    member_id: "tm1",
    role: "closer",
    cash_neto: 80000,
    rate: 65,
    commission_amount: 52000,
    source_lead: "LogiTrans Global",
    status: "paid",
    payment_date: "2026-03-15T00:00:00Z",
    period: "2026-03",
  },
  {
    id: "c2",
    created_at: "2026-03-14T00:00:00Z",
    member_id: "tm3",
    role: "setter",
    cash_neto: 80000,
    rate: 10,
    commission_amount: 8000,
    source_lead: "LogiTrans Global",
    status: "paid",
    payment_date: "2026-03-15T00:00:00Z",
    period: "2026-03",
  },
  {
    id: "c3",
    created_at: "2026-03-14T00:00:00Z",
    member_id: "tm4",
    role: "closer",
    cash_neto: 120000,
    rate: 45,
    commission_amount: 54000,
    source_lead: "FinBank Digital",
    status: "pending",
    payment_date: null,
    period: "2026-03",
  },
  {
    id: "c4",
    created_at: "2026-03-05T00:00:00Z",
    member_id: "tm1",
    role: "director",
    cash_neto: 200000,
    rate: 5,
    commission_amount: 10000,
    source_lead: "All deals override",
    status: "pending",
    payment_date: null,
    period: "2026-03",
  },
];

const demoExpenses: Expense[] = [
  {
    id: "e1",
    created_at: "2026-03-01T00:00:00Z",
    concept: "AWS Infrastructure",
    amount: 2500,
    category: "tools",
    status: "paid",
    date: "2026-03-01",
    notes: "Monthly cloud hosting",
  },
  {
    id: "e2",
    created_at: "2026-03-01T00:00:00Z",
    concept: "LinkedIn Sales Navigator",
    amount: 800,
    category: "tools",
    status: "paid",
    date: "2026-03-01",
    notes: "Team licenses x4",
  },
  {
    id: "e3",
    created_at: "2026-03-05T00:00:00Z",
    concept: "Google Ads Campaign",
    amount: 3000,
    category: "marketing",
    status: "paid",
    date: "2026-03-05",
    notes: "Q1 cybersecurity campaign",
  },
  {
    id: "e4",
    created_at: "2026-03-10T00:00:00Z",
    concept: "Office Rent",
    amount: 1800,
    category: "operational",
    status: "pending",
    date: "2026-03-15",
    notes: "Monthly office space",
  },
];

let members = [...demoMembers];
let commissions = [...demoCommissions];
let expenses = [...demoExpenses];

// --- Team Members ---
export async function getMembers(): Promise<TeamMember[]> {
  return [...members].sort((a, b) => a.nombre.localeCompare(b.nombre));
}

export async function getMember(id: string): Promise<TeamMember | undefined> {
  return members.find((m) => m.id === id);
}

export async function createMember(
  data: Omit<TeamMember, "id" | "created_at">
): Promise<TeamMember> {
  const member: TeamMember = {
    ...data,
    id: crypto.randomUUID(),
    created_at: new Date().toISOString(),
  };
  members.push(member);
  return member;
}

export async function updateMember(
  id: string,
  data: Partial<Omit<TeamMember, "id" | "created_at">>
): Promise<TeamMember | undefined> {
  const idx = members.findIndex((m) => m.id === id);
  if (idx === -1) return undefined;
  members[idx] = { ...members[idx], ...data };
  return members[idx];
}

export async function deleteMember(id: string): Promise<boolean> {
  const len = members.length;
  members = members.filter((m) => m.id !== id);
  commissions = commissions.filter((c) => c.member_id !== id);
  return members.length < len;
}

// --- Commissions ---
export async function getCommissions(filters?: {
  period?: string;
  member_id?: string;
  role?: TeamRole;
  status?: "paid" | "pending";
}): Promise<Commission[]> {
  let result = [...commissions];
  if (filters?.period) result = result.filter((c) => c.period === filters.period);
  if (filters?.member_id) result = result.filter((c) => c.member_id === filters.member_id);
  if (filters?.role) result = result.filter((c) => c.role === filters.role);
  if (filters?.status) result = result.filter((c) => c.status === filters.status);
  return result.sort((a, b) => b.commission_amount - a.commission_amount);
}

export async function createCommission(
  data: Omit<Commission, "id" | "created_at">
): Promise<Commission> {
  const commission: Commission = {
    ...data,
    id: crypto.randomUUID(),
    created_at: new Date().toISOString(),
  };
  commissions.push(commission);
  return commission;
}

export async function updateCommission(
  id: string,
  data: Partial<Omit<Commission, "id" | "created_at">>
): Promise<Commission | undefined> {
  const idx = commissions.findIndex((c) => c.id === id);
  if (idx === -1) return undefined;
  commissions[idx] = { ...commissions[idx], ...data };
  return commissions[idx];
}

export async function deleteCommission(id: string): Promise<boolean> {
  const len = commissions.length;
  commissions = commissions.filter((c) => c.id !== id);
  return commissions.length < len;
}

// --- Expenses ---
export async function getExpenses(filters?: {
  category?: Expense["category"];
  status?: "paid" | "pending";
  period?: string;
}): Promise<Expense[]> {
  let result = [...expenses];
  if (filters?.category) result = result.filter((e) => e.category === filters.category);
  if (filters?.status) result = result.filter((e) => e.status === filters.status);
  if (filters?.period) result = result.filter((e) => e.date.startsWith(filters.period!));
  return result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export async function createExpense(
  data: Omit<Expense, "id" | "created_at">
): Promise<Expense> {
  const expense: Expense = {
    ...data,
    id: crypto.randomUUID(),
    created_at: new Date().toISOString(),
  };
  expenses.push(expense);
  return expense;
}

export async function updateExpense(
  id: string,
  data: Partial<Omit<Expense, "id" | "created_at">>
): Promise<Expense | undefined> {
  const idx = expenses.findIndex((e) => e.id === id);
  if (idx === -1) return undefined;
  expenses[idx] = { ...expenses[idx], ...data };
  return expenses[idx];
}

export async function deleteExpense(id: string): Promise<boolean> {
  const len = expenses.length;
  expenses = expenses.filter((e) => e.id !== id);
  return expenses.length < len;
}
