"use client";

import { useState, useEffect, useCallback } from "react";
import { Lead, Activity, LeadStatus, LeadSource, LeadPriority, TeamMember, Commission, Expense } from "@/types/database";
import {
  apiLogin, apiLogout, getStoredUser,
  apiGetLeads, apiGetLead, apiCreateLead, apiUpdateLead, apiDeleteLead,
  apiGetActivities, apiCreateActivity,
  apiGetMembers, apiCreateMember, apiUpdateMember, apiDeleteMember,
  apiGetCommissions, apiCreateCommission, apiUpdateCommission,
  apiGetExpenses, apiCreateExpense, apiUpdateExpense, apiDeleteExpense,
} from "@/lib/api";
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

interface AppUser {
  id: string;
  email: string;
  nombre: string;
  role: "admin" | "user";
}

export default function CRM() {
  const [user, setUser] = useState<AppUser | null>(null);
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

  const [members, setMembers] = useState<TeamMember[]>([]);
  const [commissions, setCommissionsList] = useState<Commission[]>([]);
  const [expenses, setExpensesList] = useState<Expense[]>([]);

  // Check stored session
  useEffect(() => {
    const stored = getStoredUser();
    if (stored) setUser(stored);
    setAuthLoading(false);
  }, []);

  // Seed users on first load (idempotent)
  useEffect(() => {
    fetch("/api/auth/seed", { method: "POST" }).catch(() => {});
  }, []);

  const loadLeads = useCallback(async () => {
    try {
      const data = await apiGetLeads(filters);
      if (Array.isArray(data)) setLeads(data);
    } catch { /* DB not ready yet */ }
  }, [filters]);

  const loadTeamData = useCallback(async () => {
    try {
      const [m, c, e] = await Promise.all([
        apiGetMembers(),
        apiGetCommissions(),
        apiGetExpenses(),
      ]);
      if (Array.isArray(m)) setMembers(m);
      if (Array.isArray(c)) setCommissionsList(c);
      if (Array.isArray(e)) setExpensesList(e);
    } catch { /* DB not ready yet */ }
  }, []);

  useEffect(() => {
    if (user) {
      loadLeads();
      loadTeamData();
    }
  }, [loadLeads, loadTeamData, user]);

  async function handleLogin(email: string, password: string) {
    const result = await apiLogin(email, password);
    if (result.success && result.user) {
      setUser(result.user);
    }
    return result;
  }

  function handleLogout() {
    apiLogout();
    setUser(null);
    setActiveView("dashboard");
    setSelectedLead(null);
  }

  async function handleSelectLead(id: string) {
    const lead = await apiGetLead(id);
    if (lead && lead.id) {
      setSelectedLead(lead);
      const acts = await apiGetActivities(id);
      setSelectedActivities(Array.isArray(acts) ? acts : []);
    }
  }

  async function handleCreateLead(data: Omit<Lead, "id" | "created_at" | "updated_at">) {
    await apiCreateLead(data as Record<string, unknown>);
    setShowNewLead(false);
    await loadLeads();
  }

  async function handleUpdateLead(id: string, data: Partial<Lead>) {
    const updated = await apiUpdateLead(id, data as Record<string, unknown>);
    if (updated && updated.id) {
      setSelectedLead(updated);
      await loadLeads();
    }
  }

  async function handleDeleteLead(id: string) {
    await apiDeleteLead(id);
    setSelectedLead(null);
    await loadLeads();
  }

  async function handleAddActivity(data: Omit<Activity, "id" | "created_at">) {
    await apiCreateActivity(data as Record<string, unknown>);
    if (selectedLead) {
      const lead = await apiGetLead(selectedLead.id);
      if (lead && lead.id) setSelectedLead(lead);
      const acts = await apiGetActivities(selectedLead.id);
      setSelectedActivities(Array.isArray(acts) ? acts : []);
    }
    await loadLeads();
  }

  async function handleUpdateStatus(id: string, status: LeadStatus) {
    await apiUpdateLead(id, { status } as Record<string, unknown>);
    await loadLeads();
  }

  async function handleCreateMember(data: Omit<TeamMember, "id" | "created_at">) {
    await apiCreateMember(data as Record<string, unknown>);
    await loadTeamData();
  }

  async function handleUpdateMember(id: string, data: Partial<TeamMember>) {
    await apiUpdateMember(id, data as Record<string, unknown>);
    await loadTeamData();
  }

  async function handleDeleteMember(id: string) {
    await apiDeleteMember(id);
    await loadTeamData();
  }

  async function handleCreateCommission(data: Omit<Commission, "id" | "created_at">) {
    await apiCreateCommission(data as Record<string, unknown>);
    await loadTeamData();
  }

  async function handleUpdateCommission(id: string, data: Partial<Commission>) {
    await apiUpdateCommission(id, data as Record<string, unknown>);
    await loadTeamData();
  }

  async function handleCreateExpense(data: Omit<Expense, "id" | "created_at">) {
    await apiCreateExpense(data as Record<string, unknown>);
    await loadTeamData();
  }

  async function handleUpdateExpense(id: string, data: Partial<Expense>) {
    await apiUpdateExpense(id, data as Record<string, unknown>);
    await loadTeamData();
  }

  async function handleDeleteExpense(id: string) {
    await apiDeleteExpense(id);
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
                <p className="text-[12px] font-medium text-text-secondary">{user.nombre}</p>
                <p className="text-[10px] text-text-tertiary">{user.role}</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-[11px] font-bold text-white shadow-lg shadow-orange-500/20">
                {user.nombre.split(" ").map((n) => n[0]).join("").slice(0, 2)}
              </div>
            </div>
          </div>
        </div>

        <div className="p-6">
          {activeView === "dashboard" && (
            <Dashboard leads={leads} onSelectLead={handleSelectLead} onViewChange={setActiveView} />
          )}
          {activeView === "leads" && (
            <LeadTable leads={leads} onSelectLead={handleSelectLead} onNewLead={() => setShowNewLead(true)} filters={filters} onFilterChange={setFilters} />
          )}
          {activeView === "pipeline" && (
            <Pipeline leads={leads} onSelectLead={handleSelectLead} onUpdateStatus={handleUpdateStatus} />
          )}
          {activeView === "analytics" && <Analytics leads={leads} />}
          {activeView === "team" && (
            <Team members={members} onCreateMember={handleCreateMember} onUpdateMember={handleUpdateMember} onDeleteMember={handleDeleteMember} />
          )}
          {activeView === "commissions" && (
            <Commissions commissions={commissions} expenses={expenses} members={members} onCreateCommission={handleCreateCommission} onUpdateCommission={handleUpdateCommission} onCreateExpense={handleCreateExpense} onUpdateExpense={handleUpdateExpense} onDeleteExpense={handleDeleteExpense} />
          )}
          {activeView === "agent" && <AIAgent />}
          {activeView === "settings" && (
            <div className="animate-fadeIn">
              <div className="max-w-lg space-y-4">
                <div className="bg-surface border border-border rounded-2xl p-6">
                  <h3 className="text-sm font-semibold mb-4">Database</h3>
                  <p className="text-[13px] text-text-secondary mb-4">PostgreSQL running in Docker.</p>
                  <div className="bg-[#0a0a0a] rounded-xl p-4 border border-border font-mono text-[12px] text-text-secondary space-y-1">
                    <p><span className="text-orange-400">DATABASE_URL</span>=postgresql://blackwolf:***@db:5432/blackwolf_crm</p>
                    <p><span className="text-orange-400">JWT_SECRET</span>=your-secret-key</p>
                  </div>
                  <p className="text-[11px] text-text-tertiary mt-3">Connected to PostgreSQL via Docker Compose.</p>
                </div>
                <div className="bg-surface border border-border rounded-2xl p-6">
                  <h3 className="text-sm font-semibold mb-4">AI Agent — Anthropic API</h3>
                  <p className="text-[13px] text-text-secondary mb-4">Set the API key as an environment variable:</p>
                  <div className="bg-[#0a0a0a] rounded-xl p-4 border border-border font-mono text-[12px] text-text-secondary">
                    <p><span className="text-orange-400">ANTHROPIC_API_KEY</span>=sk-ant-...</p>
                  </div>
                </div>
                <div className="bg-surface border border-border rounded-2xl p-6">
                  <h3 className="text-sm font-semibold mb-4">Docker Commands</h3>
                  <div className="bg-[#0a0a0a] rounded-xl p-4 border border-border font-mono text-[11px] text-text-secondary space-y-1">
                    <p><span className="text-emerald-400">#</span> Start everything</p>
                    <p>docker compose up -d</p>
                    <p></p>
                    <p><span className="text-emerald-400">#</span> View logs</p>
                    <p>docker compose logs -f app</p>
                    <p></p>
                    <p><span className="text-emerald-400">#</span> Rebuild after changes</p>
                    <p>docker compose up -d --build</p>
                    <p></p>
                    <p><span className="text-emerald-400">#</span> Stop</p>
                    <p>docker compose down</p>
                  </div>
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
        <LeadForm onSubmit={handleCreateLead} onClose={() => setShowNewLead(false)} />
      )}
    </div>
  );
}
