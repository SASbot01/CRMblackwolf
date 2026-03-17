"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, ChevronDown, GripVertical, Kanban, Table2 } from "lucide-react";
import Modal from "./Modal";
import EntityDetail from "./EntityDetail";
import { Deal, Contact, Company, Pipeline, CustomField, Tag, DealPriority } from "@/types/database";
import { apiGetDeals, apiCreateDeal, apiUpdateDeal, apiGetPipelines } from "@/lib/api";
import { formatCurrency, formatDate, PRIORITY_COLORS, timeAgo } from "@/lib/utils";

type ViewMode = "pipeline" | "table";

interface DealsViewProps {
  contacts: Contact[];
  companies: Company[];
  customFields: CustomField[];
  tags: Tag[];
  onDataChange?: () => void;
}

export default function DealsView({ contacts, companies, customFields, tags, onDataChange }: DealsViewProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("pipeline");
  const [pipelines, setPipelines] = useState<Pipeline[]>([]);
  const [selectedPipelineId, setSelectedPipelineId] = useState<string>("");
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [newStageId, setNewStageId] = useState<string>("");
  const [showPipelineDropdown, setShowPipelineDropdown] = useState(false);
  const [dragDeal, setDragDeal] = useState<string | null>(null);
  const [dragOverStage, setDragOverStage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [selectedDealId, setSelectedDealId] = useState<string | null>(null);
  const [newForm, setNewForm] = useState({
    title: "", value: "", contact_id: "", company_id: "", priority: "medium" as DealPriority, expected_close: "", notes: "",
  });

  const loadPipelines = useCallback(async () => {
    try {
      const data = await apiGetPipelines();
      if (Array.isArray(data) && data.length > 0) {
        setPipelines(data);
        if (!selectedPipelineId) setSelectedPipelineId(data[0].id);
      }
    } catch {}
  }, [selectedPipelineId]);

  const loadDeals = useCallback(async () => {
    if (!selectedPipelineId) return;
    try {
      const data = await apiGetDeals({ pipeline_id: selectedPipelineId });
      if (Array.isArray(data)) setDeals(data);
    } catch {}
    setLoading(false);
  }, [selectedPipelineId]);

  useEffect(() => { loadPipelines(); }, [loadPipelines]);
  useEffect(() => { if (selectedPipelineId) { setLoading(true); loadDeals(); } }, [selectedPipelineId, loadDeals]);

  const selectedPipeline = pipelines.find((p) => p.id === selectedPipelineId);
  const stages = (selectedPipeline?.stages || []).sort((a, b) => a.sort_order - b.sort_order);

  const getStageDeals = useCallback((stageId: string) => deals.filter((d) => d.stage_id === stageId), [deals]);

  const handleDrop = async (stageId: string) => {
    if (!dragDeal) return;
    setDragOverStage(null);
    const deal = deals.find((d) => d.id === dragDeal);
    if (deal && deal.stage_id !== stageId) {
      setDeals((prev) => prev.map((d) => d.id === dragDeal ? { ...d, stage_id: stageId } : d));
      try { await apiUpdateDeal(dragDeal, { stage_id: stageId }); } catch { await loadDeals(); }
    }
    setDragDeal(null);
  };

  const handleOpenNew = (stageId?: string) => {
    setNewStageId(stageId || stages[0]?.id || "");
    setNewForm({ title: "", value: "", contact_id: "", company_id: "", priority: "medium", expected_close: "", notes: "" });
    setShowNew(true);
  };

  const handleCreate = useCallback(async () => {
    if (!newForm.title.trim()) return;
    setSaving(true);
    try {
      await apiCreateDeal({
        title: newForm.title, value: parseFloat(newForm.value) || 0,
        contact_id: newForm.contact_id || null, company_id: newForm.company_id || null,
        pipeline_id: selectedPipelineId, stage_id: newStageId,
        priority: newForm.priority, expected_close: newForm.expected_close || null,
        notes: newForm.notes, currency: "EUR",
      } as Record<string, unknown>);
      setShowNew(false);
      await loadDeals();
      onDataChange?.();
    } catch {}
    setSaving(false);
  }, [newForm, selectedPipelineId, newStageId, loadDeals, onDataChange]);

  const getStageName = (stageId: string | null) => {
    const stage = stages.find((s) => s.id === stageId);
    return stage ? stage : null;
  };

  return (
    <div className="animate-fadeIn h-[calc(100vh-120px)] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <div className="flex items-center gap-3">
          {/* Pipeline selector */}
          <div className="relative">
            <button
              onClick={() => setShowPipelineDropdown(!showPipelineDropdown)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface border border-border hover:border-border-hover text-[13px] font-medium transition-colors"
            >
              {selectedPipeline?.name || "Select Pipeline"}
              <ChevronDown size={14} className="text-text-tertiary" />
            </button>
            {showPipelineDropdown && (
              <div className="absolute top-full left-0 mt-1 bg-[#0a0a0a] border border-border rounded-xl shadow-xl z-30 min-w-[200px] py-1 animate-scaleIn">
                {pipelines.map((p) => (
                  <button key={p.id} onClick={() => { setSelectedPipelineId(p.id); setShowPipelineDropdown(false); }}
                    className={`w-full text-left px-4 py-2 text-[13px] hover:bg-surface-hover transition-colors ${p.id === selectedPipelineId ? "text-orange-400" : "text-text-secondary"}`}>
                    {p.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* View toggle */}
          <div className="flex items-center bg-surface border border-border rounded-xl p-0.5">
            <button
              onClick={() => setViewMode("pipeline")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium transition-colors ${
                viewMode === "pipeline" ? "bg-orange-500/15 text-orange-400" : "text-text-tertiary hover:text-white"
              }`}
            >
              <Kanban size={13} />
              Pipeline
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium transition-colors ${
                viewMode === "table" ? "bg-orange-500/15 text-orange-400" : "text-text-tertiary hover:text-white"
              }`}
            >
              <Table2 size={13} />
              Table
            </button>
          </div>
        </div>

        <button onClick={() => handleOpenNew()} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-[13px] font-medium transition-colors">
          <Plus size={14} />
          New Deal
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex gap-4 flex-1 overflow-hidden">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex-1 min-w-[260px] bg-surface border border-border rounded-2xl p-4 animate-pulse" />
          ))}
        </div>
      ) : stages.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-sm text-text-tertiary">No stages configured</p>
            <p className="text-[12px] text-text-tertiary mt-1">Go to Settings to add pipeline stages</p>
          </div>
        </div>
      ) : viewMode === "pipeline" ? (
        /* ── PIPELINE VIEW ── */
        <div className="flex gap-3 flex-1 overflow-x-auto pb-2">
          {stages.map((stage) => {
            const stageDeals = getStageDeals(stage.id);
            const stageValue = stageDeals.reduce((sum, d) => sum + (d.value || 0), 0);
            const isOver = dragOverStage === stage.id;
            return (
              <div key={stage.id}
                className={`flex-shrink-0 w-[280px] flex flex-col rounded-2xl border transition-colors ${isOver ? "border-orange-500/40 bg-orange-500/5" : "border-border bg-[rgba(255,255,255,0.02)]"}`}
                onDragOver={(e) => { e.preventDefault(); setDragOverStage(stage.id); }}
                onDragLeave={() => setDragOverStage(null)}
                onDrop={() => handleDrop(stage.id)}
              >
                <div className="px-4 py-3 border-b border-border flex-shrink-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: stage.color }} />
                      <span className="text-[13px] font-medium truncate">{stage.name}</span>
                      <span className="text-[11px] text-text-tertiary flex-shrink-0">{stageDeals.length}</span>
                    </div>
                    <button onClick={() => handleOpenNew(stage.id)} className="p-1 rounded-lg hover:bg-surface-hover text-text-tertiary hover:text-white transition-colors flex-shrink-0">
                      <Plus size={14} />
                    </button>
                  </div>
                  {stageValue > 0 && <p className="text-[11px] text-text-tertiary mt-1">{formatCurrency(stageValue)}</p>}
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-2 min-h-0">
                  {stageDeals.map((deal) => {
                    const pc = PRIORITY_COLORS[deal.priority] || PRIORITY_COLORS.medium;
                    return (
                      <div key={deal.id} draggable onDragStart={() => setDragDeal(deal.id)}
                        onClick={() => setSelectedDealId(deal.id)}
                        className={`bg-surface border border-border rounded-xl p-3 cursor-grab active:cursor-grabbing hover:border-border-hover transition-all duration-200 group ${dragDeal === deal.id ? "opacity-50" : ""}`}>
                        <div className="flex items-start gap-2">
                          <GripVertical size={12} className="text-text-tertiary mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-[13px] font-medium truncate">{deal.title}</p>
                            {(deal.company || deal.contact) && (
                              <div className="flex items-center gap-1 mt-0.5 min-w-0">
                                {deal.company && <span className="text-[11px] text-text-tertiary truncate">{deal.company.name}</span>}
                                {deal.company && deal.contact && <span className="text-[11px] text-text-tertiary flex-shrink-0">·</span>}
                                {deal.contact && <span className="text-[11px] text-text-tertiary truncate">{deal.contact.first_name} {deal.contact.last_name}</span>}
                              </div>
                            )}
                            <div className="flex items-center justify-between mt-2">
                              <span className="text-[12px] font-medium text-white">{formatCurrency(deal.value || 0)}</span>
                              <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-md border ${pc.bg}`}>{pc.label}</span>
                            </div>
                            {deal.tags && deal.tags.length > 0 && (
                              <div className="flex gap-1 flex-wrap mt-2">
                                {deal.tags.slice(0, 2).map((tag) => (
                                  <span key={tag.id} className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[9px] font-medium bg-[rgba(255,255,255,0.03)] border border-border">
                                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: tag.color }} />
                                    {tag.name}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {stageDeals.length === 0 && (
                    <div className="flex items-center justify-center py-8"><p className="text-[11px] text-text-tertiary">No deals</p></div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* ── TABLE VIEW ── */
        <div className="flex-1 overflow-auto">
          <div className="bg-surface border border-border rounded-2xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left text-[11px] text-text-tertiary font-medium uppercase tracking-wider px-4 py-3">Deal</th>
                  <th className="text-left text-[11px] text-text-tertiary font-medium uppercase tracking-wider px-4 py-3">Company</th>
                  <th className="text-left text-[11px] text-text-tertiary font-medium uppercase tracking-wider px-4 py-3">Contact</th>
                  <th className="text-left text-[11px] text-text-tertiary font-medium uppercase tracking-wider px-4 py-3">Stage</th>
                  <th className="text-right text-[11px] text-text-tertiary font-medium uppercase tracking-wider px-4 py-3">Value</th>
                  <th className="text-left text-[11px] text-text-tertiary font-medium uppercase tracking-wider px-4 py-3">Priority</th>
                  <th className="text-left text-[11px] text-text-tertiary font-medium uppercase tracking-wider px-4 py-3">Close Date</th>
                  <th className="text-left text-[11px] text-text-tertiary font-medium uppercase tracking-wider px-4 py-3">Tags</th>
                  <th className="text-right text-[11px] text-text-tertiary font-medium uppercase tracking-wider px-4 py-3">Updated</th>
                </tr>
              </thead>
              <tbody>
                {deals.length === 0 ? (
                  <tr><td colSpan={9} className="text-center py-12 text-[13px] text-text-tertiary">No deals yet</td></tr>
                ) : (
                  deals.map((deal) => {
                    const pc = PRIORITY_COLORS[deal.priority] || PRIORITY_COLORS.medium;
                    const stage = getStageName(deal.stage_id);
                    return (
                      <tr key={deal.id} onClick={() => setSelectedDealId(deal.id)}
                        className="border-b border-border last:border-0 hover:bg-surface-hover transition-colors cursor-pointer group">
                        <td className="px-4 py-3">
                          <p className="text-[13px] font-medium group-hover:text-white transition-colors">{deal.title}</p>
                        </td>
                        <td className="px-4 py-3 text-[13px] text-text-secondary">{deal.company?.name || "--"}</td>
                        <td className="px-4 py-3 text-[13px] text-text-secondary">
                          {deal.contact ? `${deal.contact.first_name} ${deal.contact.last_name}` : "--"}
                        </td>
                        <td className="px-4 py-3">
                          {stage ? (
                            <span className="inline-flex items-center gap-1.5 text-[12px] text-text-secondary">
                              <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: stage.color }} />
                              {stage.name}
                            </span>
                          ) : "--"}
                        </td>
                        <td className="px-4 py-3 text-[13px] font-medium text-right">{formatCurrency(deal.value || 0)}</td>
                        <td className="px-4 py-3">
                          <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-md border ${pc.bg}`}>{pc.label}</span>
                        </td>
                        <td className="px-4 py-3 text-[13px] text-text-secondary">{deal.expected_close ? formatDate(deal.expected_close) : "--"}</td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1 flex-wrap">
                            {(deal.tags || []).slice(0, 3).map((tag) => (
                              <span key={tag.id} className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-medium bg-surface border border-border">
                                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: tag.color }} />
                                {tag.name}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-[11px] text-text-tertiary text-right">{timeAgo(deal.updated_at)}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* New Deal Modal */}
      <Modal open={showNew} onClose={() => setShowNew(false)} title="New Deal"
        footer={<>
          <button onClick={() => setShowNew(false)} className="px-4 py-2 rounded-xl bg-surface border border-border hover:bg-surface-hover text-[13px] text-text-secondary hover:text-white transition-colors">Cancel</button>
          <button onClick={handleCreate} disabled={saving || !newForm.title.trim()} className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-[13px] font-medium transition-colors disabled:opacity-50">{saving ? "Creating..." : "Create Deal"}</button>
        </>}>
        <div className="space-y-3">
          <div>
            <label className="block text-[11px] text-text-tertiary uppercase tracking-wider mb-1">Title *</label>
            <input type="text" value={newForm.title} onChange={(e) => setNewForm((p) => ({ ...p, title: e.target.value }))} className="w-full bg-surface border border-border rounded-xl px-3 py-2 text-[13px] text-white placeholder:text-text-tertiary focus:outline-none focus:border-orange-500/50 transition-colors" placeholder="Enterprise Deal" />
          </div>
          <div>
            <label className="block text-[11px] text-text-tertiary uppercase tracking-wider mb-1">Stage</label>
            <select value={newStageId} onChange={(e) => setNewStageId(e.target.value)} className="w-full bg-surface border border-border rounded-xl px-3 py-2 text-[13px] text-white focus:outline-none focus:border-orange-500/50 transition-colors">
              {stages.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] text-text-tertiary uppercase tracking-wider mb-1">Value</label>
              <input type="number" value={newForm.value} onChange={(e) => setNewForm((p) => ({ ...p, value: e.target.value }))} className="w-full bg-surface border border-border rounded-xl px-3 py-2 text-[13px] text-white placeholder:text-text-tertiary focus:outline-none focus:border-orange-500/50 transition-colors" placeholder="10000" />
            </div>
            <div>
              <label className="block text-[11px] text-text-tertiary uppercase tracking-wider mb-1">Priority</label>
              <select value={newForm.priority} onChange={(e) => setNewForm((p) => ({ ...p, priority: e.target.value as DealPriority }))} className="w-full bg-surface border border-border rounded-xl px-3 py-2 text-[13px] text-white focus:outline-none focus:border-orange-500/50 transition-colors">
                <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="urgent">Urgent</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] text-text-tertiary uppercase tracking-wider mb-1">Contact</label>
              <select value={newForm.contact_id} onChange={(e) => setNewForm((p) => ({ ...p, contact_id: e.target.value }))} className="w-full bg-surface border border-border rounded-xl px-3 py-2 text-[13px] text-white focus:outline-none focus:border-orange-500/50 transition-colors">
                <option value="">No contact</option>
                {contacts.map((c) => <option key={c.id} value={c.id}>{c.first_name} {c.last_name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[11px] text-text-tertiary uppercase tracking-wider mb-1">Company</label>
              <select value={newForm.company_id} onChange={(e) => setNewForm((p) => ({ ...p, company_id: e.target.value }))} className="w-full bg-surface border border-border rounded-xl px-3 py-2 text-[13px] text-white focus:outline-none focus:border-orange-500/50 transition-colors">
                <option value="">No company</option>
                {companies.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-[11px] text-text-tertiary uppercase tracking-wider mb-1">Expected Close</label>
            <input type="date" value={newForm.expected_close} onChange={(e) => setNewForm((p) => ({ ...p, expected_close: e.target.value }))} className="w-full bg-surface border border-border rounded-xl px-3 py-2 text-[13px] text-white focus:outline-none focus:border-orange-500/50 transition-colors" />
          </div>
          <div>
            <label className="block text-[11px] text-text-tertiary uppercase tracking-wider mb-1">Notes</label>
            <textarea value={newForm.notes} onChange={(e) => setNewForm((p) => ({ ...p, notes: e.target.value }))} rows={3} className="w-full bg-surface border border-border rounded-xl px-3 py-2 text-[13px] text-white placeholder:text-text-tertiary focus:outline-none focus:border-orange-500/50 transition-colors resize-none" placeholder="Additional notes..." />
          </div>
        </div>
      </Modal>

      {/* Deal Detail Panel */}
      {selectedDealId && (
        <EntityDetail entityType="deal" entityId={selectedDealId} onClose={() => setSelectedDealId(null)} onUpdate={loadDeals} customFields={customFields} tags={tags} />
      )}
    </div>
  );
}
