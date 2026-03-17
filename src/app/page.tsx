"use client";

import { useState, useEffect, useCallback } from "react";
import { Lead, Activity, LeadStatus, LeadSource, LeadPriority, TeamMember, Commission, Expense } from "@/types/database";
import {
  getLeads,
  getLead,
  createLead,
  updateLead,
  deleteLead,
  getActivities,
  createActivity,
} from "@/lib/store";
import {
  getMembers,
  createMember,
  updateMember,
  deleteMember,
  getCommissions,
  createCommission,
  updateCommission,
  getExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
} from "@/lib/teamStore";
import { User, loginUser, logoutUser, getStoredUser } from "@/lib/auth";
import LoginScreen from "@/components/LoginScreen";
import Sidebar from "@/components/Sidebar";
import Dashboard from "@/components/Dashboard";
import LeadTable from "@/components/LeadTable";
import LeadDetail from "@/components/LeadDetail";
import LeadForm from "@/components/LeadForm";
import Pipeline from "@/components/Pipeline";
import Analytics from "@/components/Analytics";
import AIAgent from "@/components/AIAgent";
import Team from "@/components/Team";
import Commissions from "@/components/Commissions";

export default function CRM() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [activeView, setActiveView] = useState("dashboard");
  const [leads, setLeads] = useState<Lead[]>([]);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [selectedActivities, setSelectedActivities] = useState<Activity[]>([]);
  const [showNewLead, setShowNewLead] = useState(false);
  const [filters, setFilters] = useState<{
    status?: LeadStatus;
    source?: LeadSource;
    prioridad?: LeadPriority;
    search: string;
  }>({ search: "" });

  // Team & Commissions state
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [commissions, setCommissionsList] = useState<Commission[]>([]);
  const [expenses, setExpensesList] = useState<Expense[]>([]);

  useEffect(() => {
    const stored = getStoredUser();
    if (stored) setUser(stored);
    setAuthLoading(false);
  }, []);

  const loadLeads = useCallback(async () => {
    const data = await getLeads(filters);
    setLeads(data);
  }, [filters]);

  const loadTeamData = useCallback(async () => {
    const [m, c, e] = await Promise.all([
      getMembers(),
      getCommissions(),
      getExpenses(),
    ]);
    setMembers(m);
    setCommissionsList(c);
    setExpensesList(e);
  }, []);

  useEffect(() => {
    if (user) {
      loadLeads();
      loadTeamData();
    }
  }, [loadLeads, loadTeamData, user]);

  async function handleLogin(email: string, password: string) {
    const result = await loginUser(email, password);
    if (result.success && result.user) {
      setUser(result.user);
    }
    return result;
  }

  function handleLogout() {
    logoutUser();
    setUser(null);
    setActiveView("dashboard");
    setSelectedLead(null);
  }

  async function handleSelectLead(id: string) {
    const lead = await getLead(id);
    if (lead) {
      setSelectedLead(lead);
      const acts = await getActivities(id);
      setSelectedActivities(acts);
    }
  }

  async function handleCreateLead(data: Omit<Lead, "id" | "created_at" | "updated_at">) {
    await createLead(data);
    setShowNewLead(false);
    await loadLeads();
  }

  async function handleUpdateLead(id: string, data: Partial<Lead>) {
    const updated = await updateLead(id, data);
    if (updated) {
      setSelectedLead(updated);
      await loadLeads();
    }
  }

  async function handleDeleteLead(id: string) {
    await deleteLead(id);
    setSelectedLead(null);
    await loadLeads();
  }

  async function handleAddActivity(data: Omit<Activity, "id" | "created_at">) {
    await createActivity(data);
    if (selectedLead) {
      const lead = await getLead(selectedLead.id);
      if (lead) setSelectedLead(lead);
      const acts = await getActivities(selectedLead.id);
      setSelectedActivities(acts);
    }
    await loadLeads();
  }

  async function handleUpdateStatus(id: string, status: LeadStatus) {
    await updateLead(id, { status });
    await loadLeads();
  }

  // Team handlers
  async function handleCreateMember(data: Omit<TeamMember, "id" | "created_at">) {
    await createMember(data);
    await loadTeamData();
  }

  async function handleUpdateMember(id: string, data: Partial<TeamMember>) {
    await updateMember(id, data);
    await loadTeamData();
  }

  async function handleDeleteMember(id: string) {
    await deleteMember(id);
    await loadTeamData();
  }

  // Commission handlers
  async function handleCreateCommission(data: Omit<Commission, "id" | "created_at">) {
    await createCommission(data);
    await loadTeamData();
  }

  async function handleUpdateCommission(id: string, data: Partial<Commission>) {
    await updateCommission(id, data);
    await loadTeamData();
  }

  // Expense handlers
  async function handleCreateExpense(data: Omit<Expense, "id" | "created_at">) {
    await createExpense(data);
    await loadTeamData();
  }

  async function handleUpdateExpense(id: string, data: Partial<Expense>) {
    await updateExpense(id, data);
    await loadTeamData();
  }

  async function handleDeleteExpense(id: string) {
    await deleteExpense(id);
    await loadTeamData();
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 animate-pulse" />
      </div>
    );
  }

  if (!user) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  const viewTitles: Record<string, string> = {
    dashboard: "Dashboard",
    leads: "Leads",
    pipeline: "Pipeline",
    analytics: "Analytics",
    team: "Team",
    commissions: "Commissions",
    agent: "AI Agent",
    settings: "Settings",
  };

  const viewSubtitles: Record<string, string> = {
    dashboard: "Overview of your CRM",
    leads: `${leads.length} total leads`,
    pipeline: "Drag and drop to change status",
    analytics: "Metrics and performance",
    team: "Manage your team members and roles",
    commissions: "Track commissions, payments & expenses",
    agent: "Customize your CRM with artificial intelligence",
    settings: "Configure your CRM",
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar
        activeView={activeView}
        onViewChange={setActiveView}
        user={user}
        onLogout={handleLogout}
      />

      <main className="flex-1 overflow-y-auto">
        {/* Top Bar */}
        <div className="sticky top-0 z-20 bg-background/80 backdrop-blur-xl border-b border-border px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-semibold tracking-tight">
                {viewTitles[activeView] || activeView}
              </h1>
              <p className="text-[12px] text-text-tertiary mt-0.5">
                {viewSubtitles[activeView] || ""}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-[12px] font-medium text-text-secondary">
                  {user.nombre}
                </p>
                <p className="text-[10px] text-text-tertiary">{user.role}</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-[11px] font-bold text-white shadow-lg shadow-orange-500/20">
                {user.nombre
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2)}
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {activeView === "dashboard" && (
            <Dashboard
              leads={leads}
              onSelectLead={handleSelectLead}
              onViewChange={setActiveView}
            />
          )}

          {activeView === "leads" && (
            <LeadTable
              leads={leads}
              onSelectLead={handleSelectLead}
              onNewLead={() => setShowNewLead(true)}
              filters={filters}
              onFilterChange={setFilters}
            />
          )}

          {activeView === "pipeline" && (
            <Pipeline
              leads={leads}
              onSelectLead={handleSelectLead}
              onUpdateStatus={handleUpdateStatus}
            />
          )}

          {activeView === "analytics" && <Analytics leads={leads} />}

          {activeView === "team" && (
            <Team
              members={members}
              onCreateMember={handleCreateMember}
              onUpdateMember={handleUpdateMember}
              onDeleteMember={handleDeleteMember}
            />
          )}

          {activeView === "commissions" && (
            <Commissions
              commissions={commissions}
              expenses={expenses}
              members={members}
              onCreateCommission={handleCreateCommission}
              onUpdateCommission={handleUpdateCommission}
              onCreateExpense={handleCreateExpense}
              onUpdateExpense={handleUpdateExpense}
              onDeleteExpense={handleDeleteExpense}
            />
          )}

          {activeView === "agent" && <AIAgent />}

          {activeView === "settings" && (
            <div className="animate-fadeIn">
              <div className="max-w-lg space-y-4">
                <div className="bg-surface border border-border rounded-2xl p-6">
                  <h3 className="text-sm font-semibold mb-4">Supabase Connection</h3>
                  <p className="text-[13px] text-text-secondary mb-4">
                    Set up the environment variables to connect with Supabase:
                  </p>
                  <div className="bg-[#0a0a0a] rounded-xl p-4 border border-border font-mono text-[12px] text-text-secondary space-y-1">
                    <p><span className="text-orange-400">NEXT_PUBLIC_SUPABASE_URL</span>=your_url</p>
                    <p><span className="text-orange-400">NEXT_PUBLIC_SUPABASE_ANON_KEY</span>=your_key</p>
                  </div>
                  <p className="text-[11px] text-text-tertiary mt-3">Currently using local demo data.</p>
                </div>

                <div className="bg-surface border border-border rounded-2xl p-6">
                  <h3 className="text-sm font-semibold mb-4">AI Agent — Anthropic API</h3>
                  <p className="text-[13px] text-text-secondary mb-4">
                    To use the AI Agent, configure your Anthropic API key:
                  </p>
                  <div className="bg-[#0a0a0a] rounded-xl p-4 border border-border font-mono text-[12px] text-text-secondary">
                    <p><span className="text-orange-400">ANTHROPIC_API_KEY</span>=sk-ant-...</p>
                  </div>
                  <p className="text-[11px] text-text-tertiary mt-3">
                    The agent uses Claude Sonnet 4 to generate code and suggest improvements.
                  </p>
                </div>

                <div className="bg-surface border border-border rounded-2xl p-6">
                  <h3 className="text-sm font-semibold mb-2">SQL for Supabase</h3>
                  <p className="text-[13px] text-text-secondary mb-4">
                    Run this SQL in your Supabase project:
                  </p>
                  <pre className="bg-[#0a0a0a] rounded-xl p-4 border border-border font-mono text-[11px] text-text-secondary overflow-x-auto whitespace-pre">
{`create table leads (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  nombre text not null,
  empresa text not null,
  email text default '',
  telefono text default '',
  cargo text default '',
  status text default 'nuevo',
  source text default 'web',
  prioridad text default 'media',
  valor_estimado numeric default 0,
  notas text default '',
  ultima_interaccion timestamptz,
  proxima_accion text,
  fecha_proxima_accion timestamptz,
  llamadas_realizadas int default 0,
  emails_enviados int default 0
);

create table activities (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now(),
  lead_id uuid references leads(id) on delete cascade,
  tipo text not null,
  descripcion text not null,
  resultado text default ''
);

create table team_members (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now(),
  nombre text not null,
  email text not null,
  roles text[] default '{}',
  status text default 'active',
  base_rate numeric default 0
);

create table commissions (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now(),
  member_id uuid references team_members(id) on delete cascade,
  role text not null,
  cash_neto numeric default 0,
  rate numeric default 0,
  commission_amount numeric default 0,
  source_lead text,
  status text default 'pending',
  payment_date timestamptz,
  period text not null
);

create table expenses (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now(),
  concept text not null,
  amount numeric default 0,
  category text default 'operational',
  status text default 'pending',
  date date not null,
  notes text default ''
);`}
                  </pre>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {selectedLead && (
        <LeadDetail
          lead={selectedLead}
          activities={selectedActivities}
          onClose={() => setSelectedLead(null)}
          onUpdate={handleUpdateLead}
          onDelete={handleDeleteLead}
          onAddActivity={handleAddActivity}
        />
      )}

      {showNewLead && (
        <LeadForm
          onSubmit={handleCreateLead}
          onClose={() => setShowNewLead(false)}
        />
      )}
    </div>
  );
}
