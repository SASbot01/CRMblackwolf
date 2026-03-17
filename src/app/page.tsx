"use client";

import { useState, useEffect, useCallback } from "react";
import { Contact, Company, CustomField, Tag, ViewType } from "@/types/database";
import {
  apiLogin, apiLogout, getStoredUser,
  apiGetContacts, apiGetCompanies,
  apiGetCustomFields, apiGetTags,
} from "@/lib/api";
import LoginScreen from "@/components/LoginScreen";
import Sidebar from "@/components/Sidebar";
import Dashboard from "@/components/Dashboard";
import ContactsView from "@/components/ContactsView";
import CompaniesView from "@/components/CompaniesView";
import DealsView from "@/components/DealsView";
import SettingsView from "@/components/SettingsView";
import AIAgent from "@/components/AIAgent";

interface AppUser {
  id: string;
  email: string;
  nombre: string;
  role: "admin" | "user";
}

export default function CRM() {
  const [user, setUser] = useState<AppUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [activeView, setActiveView] = useState<string>("dashboard");

  const [contacts, setContacts] = useState<Contact[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [customFields, setCustomFields] = useState<CustomField[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);

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

  const loadCoreData = useCallback(async () => {
    try {
      const [contactsData, companiesData, fieldsData, tagsData] = await Promise.all([
        apiGetContacts().catch(() => []),
        apiGetCompanies().catch(() => []),
        apiGetCustomFields().catch(() => []),
        apiGetTags().catch(() => []),
      ]);
      if (Array.isArray(contactsData)) setContacts(contactsData);
      if (Array.isArray(companiesData)) setCompanies(companiesData);
      if (Array.isArray(fieldsData)) setCustomFields(fieldsData);
      if (Array.isArray(tagsData)) setTags(tagsData);
    } catch {}
  }, []);

  useEffect(() => {
    if (user) loadCoreData();
  }, [user, loadCoreData]);

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
    contacts: "Contacts",
    companies: "Companies",
    deals: "Deals",
    agent: "AI Agent",
    settings: "Settings",
  };

  const viewSubtitles: Record<string, string> = {
    dashboard: "Overview of your CRM",
    contacts: `${contacts.length} total contacts`,
    companies: `${companies.length} total companies`,
    deals: "Pipeline & deal management",
    agent: "Customize your CRM with artificial intelligence",
    settings: "Pipelines, custom fields & tags",
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
            <Dashboard onViewChange={setActiveView} />
          )}
          {activeView === "contacts" && (
            <ContactsView
              companies={companies}
              customFields={customFields}
              tags={tags}
              onDataChange={loadCoreData}
            />
          )}
          {activeView === "companies" && (
            <CompaniesView
              customFields={customFields}
              tags={tags}
              onDataChange={loadCoreData}
            />
          )}
          {activeView === "deals" && (
            <DealsView
              contacts={contacts}
              companies={companies}
              customFields={customFields}
              tags={tags}
              onDataChange={loadCoreData}
            />
          )}
          {activeView === "agent" && <AIAgent />}
          {activeView === "settings" && <SettingsView />}
        </div>
      </main>
    </div>
  );
}
