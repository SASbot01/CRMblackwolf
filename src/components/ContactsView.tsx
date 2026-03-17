"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, Plus, Users, Kanban, Table2 } from "lucide-react";
import { Contact, Company, CustomField, Tag } from "@/types/database";
import { apiGetContacts, apiCreateContact } from "@/lib/api";
import { timeAgo } from "@/lib/utils";
import EntityDetail from "./EntityDetail";
import Modal from "./Modal";

type ViewMode = "cards" | "table";

interface ContactsViewProps {
  companies: Company[];
  customFields: CustomField[];
  tags: Tag[];
  onDataChange?: () => void;
}

export default function ContactsView({ companies, customFields, tags, onDataChange }: ContactsViewProps) {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("table");
  const [newForm, setNewForm] = useState({
    first_name: "", last_name: "", email: "", phone: "", position: "", region: "", company_id: "", notes: "",
  });
  const [saving, setSaving] = useState(false);

  const loadContacts = useCallback(async () => {
    try {
      const data = await apiGetContacts(search || undefined);
      if (Array.isArray(data)) setContacts(data);
    } catch {}
    setLoading(false);
  }, [search]);

  useEffect(() => {
    const timer = setTimeout(() => loadContacts(), 300);
    return () => clearTimeout(timer);
  }, [loadContacts]);

  const handleCreate = useCallback(async () => {
    if (!newForm.first_name.trim()) return;
    setSaving(true);
    try {
      await apiCreateContact({ ...newForm, company_id: newForm.company_id || null } as Record<string, unknown>);
      setShowNew(false);
      setNewForm({ first_name: "", last_name: "", email: "", phone: "", position: "", region: "", company_id: "", notes: "" });
      await loadContacts();
      onDataChange?.();
    } catch {}
    setSaving(false);
  }, [newForm, loadContacts, onDataChange]);

  const getInitials = (c: Contact) => `${c.first_name?.[0] || ""}${c.last_name?.[0] || ""}`.toUpperCase() || "?";
  const inputClass = "w-full bg-surface border border-border rounded-xl px-3 py-2 text-[13px] text-white placeholder:text-text-tertiary focus:outline-none focus:border-orange-500/50 transition-colors";

  return (
    <div className="animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" />
            <input type="text" placeholder="Search contacts..." value={search} onChange={(e) => setSearch(e.target.value)}
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
          <Plus size={14} /> New Contact
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-14 bg-surface border border-border rounded-xl animate-pulse" />
          ))}
        </div>
      ) : contacts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Users size={32} className="text-text-tertiary mb-3" />
          <p className="text-sm text-text-tertiary">No contacts found</p>
          <p className="text-[12px] text-text-tertiary mt-1">Create your first contact to get started</p>
        </div>
      ) : viewMode === "table" ? (
        /* ── TABLE VIEW ── */
        <div className="bg-surface border border-border rounded-2xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left text-[11px] text-text-tertiary font-medium uppercase tracking-wider px-4 py-3">Name</th>
                <th className="text-left text-[11px] text-text-tertiary font-medium uppercase tracking-wider px-4 py-3">Email</th>
                <th className="text-left text-[11px] text-text-tertiary font-medium uppercase tracking-wider px-4 py-3">Phone</th>
                <th className="text-left text-[11px] text-text-tertiary font-medium uppercase tracking-wider px-4 py-3">Company</th>
                <th className="text-left text-[11px] text-text-tertiary font-medium uppercase tracking-wider px-4 py-3">Region</th>
                <th className="text-left text-[11px] text-text-tertiary font-medium uppercase tracking-wider px-4 py-3">Tags</th>
                <th className="text-right text-[11px] text-text-tertiary font-medium uppercase tracking-wider px-4 py-3">Updated</th>
              </tr>
            </thead>
            <tbody>
              {contacts.map((contact) => (
                <tr key={contact.id} onClick={() => setSelectedId(contact.id)} className="border-b border-border last:border-0 hover:bg-surface-hover transition-colors cursor-pointer group">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500/20 to-orange-600/10 flex items-center justify-center flex-shrink-0 border border-orange-500/10">
                        <span className="text-[11px] font-semibold text-orange-400">{getInitials(contact)}</span>
                      </div>
                      <div>
                        <p className="text-[13px] font-medium group-hover:text-white transition-colors">{contact.first_name} {contact.last_name}</p>
                        {contact.position && <p className="text-[11px] text-text-tertiary">{contact.position}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[13px] text-text-secondary">{contact.email || "--"}</td>
                  <td className="px-4 py-3 text-[13px] text-text-secondary">{contact.phone || "--"}</td>
                  <td className="px-4 py-3 text-[13px] text-text-secondary">{contact.company?.name || "--"}</td>
                  <td className="px-4 py-3 text-[13px] text-text-secondary">{contact.region || "--"}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1 flex-wrap">
                      {(contact.tags || []).slice(0, 3).map((tag) => (
                        <span key={tag.id} className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-medium bg-surface border border-border">
                          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: tag.color }} />
                          {tag.name}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[11px] text-text-tertiary text-right">{timeAgo(contact.updated_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        /* ── CARDS VIEW ── */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {contacts.map((contact) => (
            <div key={contact.id} onClick={() => setSelectedId(contact.id)}
              className="bg-surface border border-border rounded-2xl p-4 hover:border-border-hover transition-all cursor-pointer group">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500/20 to-orange-600/10 flex items-center justify-center flex-shrink-0 border border-orange-500/10">
                  <span className="text-[13px] font-semibold text-orange-400">{getInitials(contact)}</span>
                </div>
                <div className="min-w-0">
                  <p className="text-[13px] font-medium group-hover:text-white transition-colors truncate">{contact.first_name} {contact.last_name}</p>
                  {contact.position && <p className="text-[11px] text-text-tertiary truncate">{contact.position}</p>}
                </div>
              </div>
              {contact.company?.name && (
                <p className="text-[12px] text-text-secondary mb-1 truncate">{contact.company.name}</p>
              )}
              {contact.email && (
                <p className="text-[11px] text-text-tertiary truncate">{contact.email}</p>
              )}
              {contact.phone && (
                <p className="text-[11px] text-text-tertiary">{contact.phone}</p>
              )}
              {contact.region && (
                <p className="text-[11px] text-text-tertiary mt-1">{contact.region}</p>
              )}
              {(contact.tags || []).length > 0 && (
                <div className="flex gap-1 flex-wrap mt-2">
                  {contact.tags!.slice(0, 3).map((tag) => (
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

      {/* New Contact Modal */}
      <Modal open={showNew} onClose={() => setShowNew(false)} title="New Contact"
        footer={<>
          <button onClick={() => setShowNew(false)} className="px-4 py-2 rounded-xl bg-surface border border-border hover:bg-surface-hover text-[13px] text-text-secondary hover:text-white transition-colors">Cancel</button>
          <button onClick={handleCreate} disabled={saving || !newForm.first_name.trim()} className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-[13px] font-medium transition-colors disabled:opacity-50">{saving ? "Creating..." : "Create Contact"}</button>
        </>}>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] text-text-tertiary uppercase tracking-wider mb-1">First Name *</label>
              <input type="text" value={newForm.first_name} onChange={(e) => setNewForm((p) => ({ ...p, first_name: e.target.value }))} className={inputClass} placeholder="John" />
            </div>
            <div>
              <label className="block text-[11px] text-text-tertiary uppercase tracking-wider mb-1">Last Name</label>
              <input type="text" value={newForm.last_name} onChange={(e) => setNewForm((p) => ({ ...p, last_name: e.target.value }))} className={inputClass} placeholder="Doe" />
            </div>
          </div>
          <div>
            <label className="block text-[11px] text-text-tertiary uppercase tracking-wider mb-1">Email</label>
            <input type="email" value={newForm.email} onChange={(e) => setNewForm((p) => ({ ...p, email: e.target.value }))} className={inputClass} placeholder="john@example.com" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] text-text-tertiary uppercase tracking-wider mb-1">Phone</label>
              <input type="tel" value={newForm.phone} onChange={(e) => setNewForm((p) => ({ ...p, phone: e.target.value }))} className={inputClass} placeholder="+34 612 345 678" />
            </div>
            <div>
              <label className="block text-[11px] text-text-tertiary uppercase tracking-wider mb-1">Position</label>
              <input type="text" value={newForm.position} onChange={(e) => setNewForm((p) => ({ ...p, position: e.target.value }))} className={inputClass} placeholder="CEO" />
            </div>
          </div>
          <div>
            <label className="block text-[11px] text-text-tertiary uppercase tracking-wider mb-1">Region</label>
            <input type="text" value={newForm.region} onChange={(e) => setNewForm((p) => ({ ...p, region: e.target.value }))} className={inputClass} placeholder="Madrid, EMEA, North America..." />
          </div>
          <div>
            <label className="block text-[11px] text-text-tertiary uppercase tracking-wider mb-1">Company</label>
            <select value={newForm.company_id} onChange={(e) => setNewForm((p) => ({ ...p, company_id: e.target.value }))} className={inputClass}>
              <option value="">No company</option>
              {companies.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[11px] text-text-tertiary uppercase tracking-wider mb-1">Notes</label>
            <textarea value={newForm.notes} onChange={(e) => setNewForm((p) => ({ ...p, notes: e.target.value }))} rows={3} className={`${inputClass} resize-none`} placeholder="Additional notes..." />
          </div>
        </div>
      </Modal>

      {/* Detail Panel */}
      {selectedId && (
        <EntityDetail entityType="contact" entityId={selectedId} onClose={() => setSelectedId(null)} onUpdate={loadContacts} customFields={customFields} tags={tags} />
      )}
    </div>
  );
}
