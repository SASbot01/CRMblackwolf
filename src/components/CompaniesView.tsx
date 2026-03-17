"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, Plus, Building2, Kanban, Table2 } from "lucide-react";
import { Company, CustomField, Tag } from "@/types/database";
import { apiGetCompanies, apiCreateCompany } from "@/lib/api";
import { formatCurrency, timeAgo } from "@/lib/utils";
import EntityDetail from "./EntityDetail";
import Modal from "./Modal";

type ViewMode = "cards" | "table";

interface CompaniesViewProps {
  customFields: CustomField[];
  tags: Tag[];
  onDataChange?: () => void;
}

export default function CompaniesView({ customFields, tags, onDataChange }: CompaniesViewProps) {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("table");
  const [newForm, setNewForm] = useState({
    name: "", industry: "", website: "", phone: "", email: "", address: "", region: "", notes: "",
  });
  const [saving, setSaving] = useState(false);

  const loadCompanies = useCallback(async () => {
    try {
      const data = await apiGetCompanies(search || undefined);
      if (Array.isArray(data)) setCompanies(data);
    } catch {}
    setLoading(false);
  }, [search]);

  useEffect(() => {
    const timer = setTimeout(() => loadCompanies(), 300);
    return () => clearTimeout(timer);
  }, [loadCompanies]);

  const handleCreate = useCallback(async () => {
    if (!newForm.name.trim()) return;
    setSaving(true);
    try {
      await apiCreateCompany(newForm as Record<string, unknown>);
      setShowNew(false);
      setNewForm({ name: "", industry: "", website: "", phone: "", email: "", address: "", region: "", notes: "" });
      await loadCompanies();
      onDataChange?.();
    } catch {}
    setSaving(false);
  }, [newForm, loadCompanies, onDataChange]);

  const inputClass = "w-full bg-surface border border-border rounded-xl px-3 py-2 text-[13px] text-white placeholder:text-text-tertiary focus:outline-none focus:border-orange-500/50 transition-colors";

  return (
    <div className="animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" />
            <input type="text" placeholder="Search companies..." value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-surface border border-border rounded-xl py-2 pl-9 pr-4 text-[13px] text-white placeholder:text-text-tertiary focus:outline-none focus:border-orange-500/50 transition-colors" />
          </div>
          <div className="flex items-center bg-surface border border-border rounded-xl p-0.5">
            <button onClick={() => setViewMode("cards")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium transition-colors ${viewMode === "cards" ? "bg-orange-500/15 text-orange-400" : "text-text-tertiary hover:text-white"}`}>
              <Kanban size={13} /> Cards
            </button>
            <button onClick={() => setViewMode("table")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium transition-colors ${viewMode === "table" ? "bg-orange-500/15 text-orange-400" : "text-text-tertiary hover:text-white"}`}>
              <Table2 size={13} /> Table
            </button>
          </div>
        </div>
        <button onClick={() => setShowNew(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-[13px] font-medium transition-colors">
          <Plus size={14} /> New Company
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-14 bg-surface border border-border rounded-xl animate-pulse" />
          ))}
        </div>
      ) : companies.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Building2 size={32} className="text-text-tertiary mb-3" />
          <p className="text-sm text-text-tertiary">No companies found</p>
          <p className="text-[12px] text-text-tertiary mt-1">Create your first company to get started</p>
        </div>
      ) : viewMode === "table" ? (
        /* ── TABLE VIEW ── */
        <div className="bg-surface border border-border rounded-2xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left text-[11px] text-text-tertiary font-medium uppercase tracking-wider px-4 py-3">Company</th>
                <th className="text-left text-[11px] text-text-tertiary font-medium uppercase tracking-wider px-4 py-3">Industry</th>
                <th className="text-left text-[11px] text-text-tertiary font-medium uppercase tracking-wider px-4 py-3">Region</th>
                <th className="text-center text-[11px] text-text-tertiary font-medium uppercase tracking-wider px-4 py-3">Contacts</th>
                <th className="text-center text-[11px] text-text-tertiary font-medium uppercase tracking-wider px-4 py-3">Deals</th>
                <th className="text-right text-[11px] text-text-tertiary font-medium uppercase tracking-wider px-4 py-3">Deal Value</th>
                <th className="text-left text-[11px] text-text-tertiary font-medium uppercase tracking-wider px-4 py-3">Tags</th>
                <th className="text-right text-[11px] text-text-tertiary font-medium uppercase tracking-wider px-4 py-3">Updated</th>
              </tr>
            </thead>
            <tbody>
              {companies.map((company) => (
                <tr key={company.id} onClick={() => setSelectedId(company.id)} className="border-b border-border last:border-0 hover:bg-surface-hover transition-colors cursor-pointer group">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500/20 to-orange-600/10 flex items-center justify-center flex-shrink-0 border border-orange-500/10">
                        <Building2 size={14} className="text-orange-400" />
                      </div>
                      <p className="text-[13px] font-medium group-hover:text-white transition-colors">{company.name}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[13px] text-text-secondary">{company.industry || "--"}</td>
                  <td className="px-4 py-3 text-[13px] text-text-secondary">{company.region || "--"}</td>
                  <td className="px-4 py-3 text-[13px] text-text-secondary text-center">{company._contact_count ?? 0}</td>
                  <td className="px-4 py-3 text-[13px] text-text-secondary text-center">{company._deal_count ?? 0}</td>
                  <td className="px-4 py-3 text-[13px] text-text-secondary text-right">{company._deal_value ? formatCurrency(company._deal_value) : "--"}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1 flex-wrap">
                      {(company.tags || []).slice(0, 3).map((tag) => (
                        <span key={tag.id} className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-medium bg-surface border border-border">
                          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: tag.color }} />
                          {tag.name}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[11px] text-text-tertiary text-right">{timeAgo(company.updated_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        /* ── CARDS VIEW ── */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {companies.map((company) => (
            <div key={company.id} onClick={() => setSelectedId(company.id)}
              className="bg-surface border border-border rounded-2xl p-4 hover:border-border-hover transition-all cursor-pointer group">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500/20 to-orange-600/10 flex items-center justify-center flex-shrink-0 border border-orange-500/10">
                  <Building2 size={18} className="text-orange-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-[13px] font-medium group-hover:text-white transition-colors truncate">{company.name}</p>
                  {company.industry && <p className="text-[11px] text-text-tertiary truncate">{company.industry}</p>}
                </div>
              </div>
              {company.region && <p className="text-[11px] text-text-tertiary mb-1">{company.region}</p>}
              <div className="flex items-center gap-4 text-[11px] text-text-tertiary mt-2">
                <span>{company._contact_count ?? 0} contacts</span>
                <span>{company._deal_count ?? 0} deals</span>
              </div>
              {(company._deal_value ?? 0) > 0 && (
                <p className="text-[12px] font-medium text-orange-400 mt-1">{formatCurrency(company._deal_value!)}</p>
              )}
              {company.email && <p className="text-[11px] text-text-tertiary mt-2 truncate">{company.email}</p>}
              {company.phone && <p className="text-[11px] text-text-tertiary">{company.phone}</p>}
              {(company.tags || []).length > 0 && (
                <div className="flex gap-1 flex-wrap mt-2">
                  {company.tags!.slice(0, 3).map((tag) => (
                    <span key={tag.id} className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[9px] font-medium bg-[rgba(255,255,255,0.03)] border border-border">
                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: tag.color }} />
                      {tag.name}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* New Company Modal */}
      <Modal open={showNew} onClose={() => setShowNew(false)} title="New Company"
        footer={<>
          <button onClick={() => setShowNew(false)} className="px-4 py-2 rounded-xl bg-surface border border-border hover:bg-surface-hover text-[13px] text-text-secondary hover:text-white transition-colors">Cancel</button>
          <button onClick={handleCreate} disabled={saving || !newForm.name.trim()} className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-[13px] font-medium transition-colors disabled:opacity-50">{saving ? "Creating..." : "Create Company"}</button>
        </>}>
        <div className="space-y-3">
          <div>
            <label className="block text-[11px] text-text-tertiary uppercase tracking-wider mb-1">Name *</label>
            <input type="text" value={newForm.name} onChange={(e) => setNewForm((p) => ({ ...p, name: e.target.value }))} className={inputClass} placeholder="Acme Inc." />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] text-text-tertiary uppercase tracking-wider mb-1">Industry</label>
              <input type="text" value={newForm.industry} onChange={(e) => setNewForm((p) => ({ ...p, industry: e.target.value }))} className={inputClass} placeholder="Technology" />
            </div>
            <div>
              <label className="block text-[11px] text-text-tertiary uppercase tracking-wider mb-1">Region</label>
              <input type="text" value={newForm.region} onChange={(e) => setNewForm((p) => ({ ...p, region: e.target.value }))} className={inputClass} placeholder="EMEA, North America..." />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] text-text-tertiary uppercase tracking-wider mb-1">Website</label>
              <input type="url" value={newForm.website} onChange={(e) => setNewForm((p) => ({ ...p, website: e.target.value }))} className={inputClass} placeholder="https://acme.com" />
            </div>
            <div>
              <label className="block text-[11px] text-text-tertiary uppercase tracking-wider mb-1">Phone</label>
              <input type="tel" value={newForm.phone} onChange={(e) => setNewForm((p) => ({ ...p, phone: e.target.value }))} className={inputClass} placeholder="+34 612 345 678" />
            </div>
          </div>
          <div>
            <label className="block text-[11px] text-text-tertiary uppercase tracking-wider mb-1">Email</label>
            <input type="email" value={newForm.email} onChange={(e) => setNewForm((p) => ({ ...p, email: e.target.value }))} className={inputClass} placeholder="info@acme.com" />
          </div>
          <div>
            <label className="block text-[11px] text-text-tertiary uppercase tracking-wider mb-1">Address</label>
            <input type="text" value={newForm.address} onChange={(e) => setNewForm((p) => ({ ...p, address: e.target.value }))} className={inputClass} placeholder="123 Main St, City" />
          </div>
          <div>
            <label className="block text-[11px] text-text-tertiary uppercase tracking-wider mb-1">Notes</label>
            <textarea value={newForm.notes} onChange={(e) => setNewForm((p) => ({ ...p, notes: e.target.value }))} rows={3} className={`${inputClass} resize-none`} placeholder="Additional notes..." />
          </div>
        </div>
      </Modal>

      {/* Detail Panel */}
      {selectedId && (
        <EntityDetail entityType="company" entityId={selectedId} onClose={() => setSelectedId(null)} onUpdate={loadCompanies} customFields={customFields} tags={tags} />
      )}
    </div>
  );
}
