"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Trash2, X, GripVertical, Check } from "lucide-react";
import { Pipeline, PipelineStage, CustomField, Tag, EntityType, FieldType } from "@/types/database";
import {
  apiGetPipelines, apiCreatePipeline, apiUpdatePipeline, apiDeletePipeline,
  apiGetCustomFields, apiCreateCustomField, apiDeleteCustomField,
  apiGetTags, apiCreateTag, apiDeleteTag,
} from "@/lib/api";

type SettingsTab = "pipelines" | "fields" | "tags";

const STAGE_COLORS = [
  "#6B7280", "#EF4444", "#F97316", "#EAB308", "#22C55E",
  "#06B6D4", "#3B82F6", "#8B5CF6", "#EC4899", "#F43F5E",
];

const TAG_COLORS = [
  "#EF4444", "#F97316", "#EAB308", "#22C55E", "#06B6D4",
  "#3B82F6", "#8B5CF6", "#EC4899", "#6B7280", "#F43F5E",
];

const FIELD_TYPES: { value: FieldType; label: string }[] = [
  { value: "text", label: "Text" },
  { value: "textarea", label: "Text Area" },
  { value: "number", label: "Number" },
  { value: "currency", label: "Currency" },
  { value: "date", label: "Date" },
  { value: "email", label: "Email" },
  { value: "phone", label: "Phone" },
  { value: "url", label: "URL" },
  { value: "select", label: "Select" },
  { value: "multi_select", label: "Multi Select" },
  { value: "checkbox", label: "Checkbox" },
];

export default function SettingsView() {
  const [activeTab, setActiveTab] = useState<SettingsTab>("pipelines");

  return (
    <div className="animate-fadeIn max-w-4xl">
      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-surface border border-border rounded-xl p-1 w-fit">
        {(["pipelines", "fields", "tags"] as SettingsTab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-[13px] font-medium transition-colors capitalize ${
              activeTab === tab
                ? "bg-orange-500/15 text-orange-400"
                : "text-text-secondary hover:text-white hover:bg-surface-hover"
            }`}
          >
            {tab === "fields" ? "Custom Fields" : tab}
          </button>
        ))}
      </div>

      {activeTab === "pipelines" && <PipelinesSettings />}
      {activeTab === "fields" && <CustomFieldsSettings />}
      {activeTab === "tags" && <TagsSettings />}
    </div>
  );
}

function PipelinesSettings() {
  const [pipelines, setPipelines] = useState<Pipeline[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [pipelineName, setPipelineName] = useState("");
  const [stages, setStages] = useState<Array<{ name: string; color: string; is_won: boolean; is_lost: boolean }>>([]);
  const [saving, setSaving] = useState(false);

  const loadPipelines = useCallback(async () => {
    try {
      const data = await apiGetPipelines();
      if (Array.isArray(data)) setPipelines(data);
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => { loadPipelines(); }, [loadPipelines]);

  const handleAddStage = () => {
    setStages((prev) => [...prev, { name: "", color: STAGE_COLORS[prev.length % STAGE_COLORS.length], is_won: false, is_lost: false }]);
  };

  const handleRemoveStage = (index: number) => {
    setStages((prev) => prev.filter((_, i) => i !== index));
  };

  const updateStage = (index: number, field: string, value: unknown) => {
    setStages((prev) => prev.map((s, i) => i === index ? { ...s, [field]: value } : s));
  };

  const handleNewPipeline = () => {
    setPipelineName("");
    setStages([
      { name: "New", color: "#6B7280", is_won: false, is_lost: false },
      { name: "Qualified", color: "#3B82F6", is_won: false, is_lost: false },
      { name: "Proposal", color: "#F97316", is_won: false, is_lost: false },
      { name: "Won", color: "#22C55E", is_won: true, is_lost: false },
      { name: "Lost", color: "#EF4444", is_won: false, is_lost: true },
    ]);
    setEditingId(null);
    setShowNew(true);
  };

  const handleEditPipeline = (pipeline: Pipeline) => {
    setPipelineName(pipeline.name);
    setStages(
      (pipeline.stages || [])
        .sort((a, b) => a.sort_order - b.sort_order)
        .map((s) => ({ name: s.name, color: s.color, is_won: s.is_won, is_lost: s.is_lost }))
    );
    setEditingId(pipeline.id);
    setShowNew(true);
  };

  const handleSave = async () => {
    if (!pipelineName.trim()) return;
    setSaving(true);
    const payload = {
      name: pipelineName,
      stages: stages.map((s, i) => ({ ...s, sort_order: i })),
    };
    try {
      if (editingId) {
        await apiUpdatePipeline(editingId, payload as Record<string, unknown>);
      } else {
        await apiCreatePipeline(payload as Record<string, unknown>);
      }
      setShowNew(false);
      await loadPipelines();
    } catch {}
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this pipeline and all its stages?")) return;
    try {
      await apiDeletePipeline(id);
      await loadPipelines();
    } catch {}
  };

  if (loading) {
    return <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-16 bg-surface border border-border rounded-2xl animate-pulse" />)}</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Pipelines</h3>
        <button
          onClick={handleNewPipeline}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-[12px] font-medium transition-colors"
        >
          <Plus size={14} />
          New Pipeline
        </button>
      </div>

      {pipelines.length === 0 && !showNew && (
        <div className="text-center py-12">
          <p className="text-sm text-text-tertiary">No pipelines configured</p>
        </div>
      )}

      {pipelines.map((pipeline) => (
        <div key={pipeline.id} className="bg-surface border border-border rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-[14px] font-medium">{pipeline.name}</h4>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleEditPipeline(pipeline)}
                className="px-2 py-1 rounded-lg text-[11px] text-text-secondary hover:text-white hover:bg-surface-hover transition-colors"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(pipeline.id)}
                className="p-1 rounded-lg hover:bg-red-500/10 text-text-tertiary hover:text-red-400 transition-colors"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            {(pipeline.stages || []).sort((a, b) => a.sort_order - b.sort_order).map((stage) => (
              <span
                key={stage.id}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium bg-[rgba(255,255,255,0.03)] border border-border"
              >
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: stage.color }} />
                {stage.name}
                {stage.is_won && <span className="text-green-400 text-[9px]">W</span>}
                {stage.is_lost && <span className="text-red-400 text-[9px]">L</span>}
              </span>
            ))}
          </div>
        </div>
      ))}

      {/* Pipeline Editor Modal */}
      {showNew && (
        <>
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" onClick={() => setShowNew(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-[#0a0a0a] border border-border rounded-2xl w-full max-w-lg max-h-[80vh] flex flex-col animate-scaleIn">
              <div className="flex items-center justify-between px-6 py-4 border-b border-border flex-shrink-0">
                <h2 className="text-base font-semibold">{editingId ? "Edit Pipeline" : "New Pipeline"}</h2>
                <button onClick={() => setShowNew(false)} className="p-1 rounded-lg hover:bg-surface-hover text-text-tertiary hover:text-white transition-colors">
                  <X size={16} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
                <div>
                  <label className="block text-[11px] text-text-tertiary uppercase tracking-wider mb-1">Pipeline Name *</label>
                  <input
                    type="text"
                    value={pipelineName}
                    onChange={(e) => setPipelineName(e.target.value)}
                    className="w-full bg-surface border border-border rounded-xl px-3 py-2 text-[13px] text-white placeholder:text-text-tertiary focus:outline-none focus:border-orange-500/50 transition-colors"
                    placeholder="Sales Pipeline"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-[11px] text-text-tertiary uppercase tracking-wider">Stages</label>
                    <button
                      onClick={handleAddStage}
                      className="flex items-center gap-1 px-2 py-1 rounded-lg bg-surface border border-border hover:border-border-hover text-[11px] text-text-secondary hover:text-white transition-colors"
                    >
                      <Plus size={12} />
                      Add Stage
                    </button>
                  </div>
                  <div className="space-y-2">
                    {stages.map((stage, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 bg-surface border border-border rounded-xl">
                        <GripVertical size={12} className="text-text-tertiary flex-shrink-0" />
                        <div className="relative flex-shrink-0">
                          <input
                            type="color"
                            value={stage.color}
                            onChange={(e) => updateStage(index, "color", e.target.value)}
                            className="w-6 h-6 rounded-md border-0 cursor-pointer bg-transparent"
                          />
                        </div>
                        <input
                          type="text"
                          value={stage.name}
                          onChange={(e) => updateStage(index, "name", e.target.value)}
                          placeholder="Stage name"
                          className="flex-1 bg-transparent border-0 text-[13px] text-white placeholder:text-text-tertiary focus:outline-none"
                        />
                        <label className="flex items-center gap-1 text-[10px] text-text-tertiary cursor-pointer">
                          <input
                            type="checkbox"
                            checked={stage.is_won}
                            onChange={(e) => updateStage(index, "is_won", e.target.checked)}
                            className="rounded border-border"
                          />
                          Won
                        </label>
                        <label className="flex items-center gap-1 text-[10px] text-text-tertiary cursor-pointer">
                          <input
                            type="checkbox"
                            checked={stage.is_lost}
                            onChange={(e) => updateStage(index, "is_lost", e.target.checked)}
                            className="rounded border-border"
                          />
                          Lost
                        </label>
                        <button
                          onClick={() => handleRemoveStage(index)}
                          className="p-1 rounded-lg hover:bg-red-500/10 text-text-tertiary hover:text-red-400 transition-colors flex-shrink-0"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2 px-6 py-4 border-t border-border flex-shrink-0">
                <button
                  onClick={() => setShowNew(false)}
                  className="px-4 py-2 rounded-xl bg-surface border border-border hover:bg-surface-hover text-[13px] text-text-secondary hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving || !pipelineName.trim()}
                  className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-[13px] font-medium transition-colors disabled:opacity-50"
                >
                  {saving ? "Saving..." : editingId ? "Update Pipeline" : "Create Pipeline"}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function CustomFieldsSettings() {
  const [fields, setFields] = useState<CustomField[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeEntityTab, setActiveEntityTab] = useState<EntityType>("contact");
  const [showNew, setShowNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newForm, setNewForm] = useState({
    name: "",
    field_key: "",
    field_type: "text" as FieldType,
    options: "",
    required: false,
  });

  const loadFields = useCallback(async () => {
    try {
      const data = await apiGetCustomFields();
      if (Array.isArray(data)) setFields(data);
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => { loadFields(); }, [loadFields]);

  const filteredFields = fields.filter((f) => f.entity_type === activeEntityTab);

  const handleCreate = async () => {
    if (!newForm.name.trim() || !newForm.field_key.trim()) return;
    setSaving(true);
    try {
      await apiCreateCustomField({
        entity_type: activeEntityTab,
        name: newForm.name,
        field_key: newForm.field_key,
        field_type: newForm.field_type,
        options: newForm.options ? newForm.options.split(",").map((s) => s.trim()).filter(Boolean) : [],
        required: newForm.required,
        sort_order: filteredFields.length,
      } as Record<string, unknown>);
      setShowNew(false);
      setNewForm({ name: "", field_key: "", field_type: "text", options: "", required: false });
      await loadFields();
    } catch {}
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this custom field?")) return;
    try {
      await apiDeleteCustomField(id);
      await loadFields();
    } catch {}
  };

  const handleNameChange = (name: string) => {
    const key = name.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");
    setNewForm((p) => ({ ...p, name, field_key: key }));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex gap-1 bg-surface border border-border rounded-xl p-1">
          {(["contact", "company", "deal"] as EntityType[]).map((et) => (
            <button
              key={et}
              onClick={() => setActiveEntityTab(et)}
              className={`px-3 py-1.5 rounded-lg text-[12px] font-medium transition-colors capitalize ${
                activeEntityTab === et ? "bg-orange-500/15 text-orange-400" : "text-text-secondary hover:text-white"
              }`}
            >
              {et}
            </button>
          ))}
        </div>
        <button
          onClick={() => setShowNew(true)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-[12px] font-medium transition-colors"
        >
          <Plus size={14} />
          Add Field
        </button>
      </div>

      {loading ? (
        <div className="space-y-2">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-12 bg-surface border border-border rounded-xl animate-pulse" />)}</div>
      ) : filteredFields.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-sm text-text-tertiary">No custom fields for {activeEntityTab}s</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredFields.sort((a, b) => a.sort_order - b.sort_order).map((field) => (
            <div key={field.id} className="flex items-center justify-between p-3 bg-surface border border-border rounded-xl">
              <div className="flex items-center gap-3">
                <div>
                  <p className="text-[13px] font-medium">{field.name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] text-text-tertiary font-mono">{field.field_key}</span>
                    <span className="text-[10px] text-orange-400 bg-orange-400/10 px-1.5 py-0.5 rounded">{field.field_type}</span>
                    {field.required && <span className="text-[10px] text-red-400 bg-red-400/10 px-1.5 py-0.5 rounded">required</span>}
                  </div>
                </div>
              </div>
              <button
                onClick={() => handleDelete(field.id)}
                className="p-1.5 rounded-lg hover:bg-red-500/10 text-text-tertiary hover:text-red-400 transition-colors"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* New Field Modal */}
      {showNew && (
        <>
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" onClick={() => setShowNew(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-[#0a0a0a] border border-border rounded-2xl w-full max-w-md animate-scaleIn">
              <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                <h2 className="text-base font-semibold">New Custom Field</h2>
                <button onClick={() => setShowNew(false)} className="p-1 rounded-lg hover:bg-surface-hover text-text-tertiary hover:text-white transition-colors">
                  <X size={16} />
                </button>
              </div>
              <div className="px-6 py-4 space-y-3">
                <div>
                  <label className="block text-[11px] text-text-tertiary uppercase tracking-wider mb-1">Entity Type</label>
                  <p className="text-[13px] text-white capitalize">{activeEntityTab}</p>
                </div>
                <div>
                  <label className="block text-[11px] text-text-tertiary uppercase tracking-wider mb-1">Name *</label>
                  <input
                    type="text"
                    value={newForm.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    className="w-full bg-surface border border-border rounded-xl px-3 py-2 text-[13px] text-white placeholder:text-text-tertiary focus:outline-none focus:border-orange-500/50 transition-colors"
                    placeholder="Field name"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-text-tertiary uppercase tracking-wider mb-1">Key</label>
                  <input
                    type="text"
                    value={newForm.field_key}
                    onChange={(e) => setNewForm((p) => ({ ...p, field_key: e.target.value }))}
                    className="w-full bg-surface border border-border rounded-xl px-3 py-2 text-[13px] text-text-secondary font-mono focus:outline-none focus:border-orange-500/50 transition-colors"
                    placeholder="field_key"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-text-tertiary uppercase tracking-wider mb-1">Type</label>
                  <select
                    value={newForm.field_type}
                    onChange={(e) => setNewForm((p) => ({ ...p, field_type: e.target.value as FieldType }))}
                    className="w-full bg-surface border border-border rounded-xl px-3 py-2 text-[13px] text-white focus:outline-none focus:border-orange-500/50 transition-colors"
                  >
                    {FIELD_TYPES.map((ft) => (
                      <option key={ft.value} value={ft.value}>{ft.label}</option>
                    ))}
                  </select>
                </div>
                {(newForm.field_type === "select" || newForm.field_type === "multi_select") && (
                  <div>
                    <label className="block text-[11px] text-text-tertiary uppercase tracking-wider mb-1">Options (comma separated)</label>
                    <input
                      type="text"
                      value={newForm.options}
                      onChange={(e) => setNewForm((p) => ({ ...p, options: e.target.value }))}
                      className="w-full bg-surface border border-border rounded-xl px-3 py-2 text-[13px] text-white placeholder:text-text-tertiary focus:outline-none focus:border-orange-500/50 transition-colors"
                      placeholder="Option 1, Option 2, Option 3"
                    />
                  </div>
                )}
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newForm.required}
                    onChange={(e) => setNewForm((p) => ({ ...p, required: e.target.checked }))}
                    className="rounded border-border"
                  />
                  <span className="text-[13px] text-text-secondary">Required field</span>
                </label>
              </div>
              <div className="flex justify-end gap-2 px-6 py-4 border-t border-border">
                <button
                  onClick={() => setShowNew(false)}
                  className="px-4 py-2 rounded-xl bg-surface border border-border hover:bg-surface-hover text-[13px] text-text-secondary hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreate}
                  disabled={saving || !newForm.name.trim() || !newForm.field_key.trim()}
                  className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-[13px] font-medium transition-colors disabled:opacity-50"
                >
                  {saving ? "Creating..." : "Create Field"}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function TagsSettings() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState(TAG_COLORS[0]);
  const [saving, setSaving] = useState(false);

  const loadTags = useCallback(async () => {
    try {
      const data = await apiGetTags();
      if (Array.isArray(data)) setTags(data);
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => { loadTags(); }, [loadTags]);

  const handleCreate = async () => {
    if (!newName.trim()) return;
    setSaving(true);
    try {
      await apiCreateTag({ name: newName, color: newColor });
      setNewName("");
      setNewColor(TAG_COLORS[0]);
      setShowNew(false);
      await loadTags();
    } catch {}
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this tag?")) return;
    try {
      await apiDeleteTag(id);
      await loadTags();
    } catch {}
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Tags</h3>
        <button
          onClick={() => setShowNew(true)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-[12px] font-medium transition-colors"
        >
          <Plus size={14} />
          New Tag
        </button>
      </div>

      {loading ? (
        <div className="space-y-2">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-10 bg-surface border border-border rounded-xl animate-pulse" />)}</div>
      ) : tags.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-sm text-text-tertiary">No tags created yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {tags.map((tag) => (
            <div key={tag.id} className="flex items-center justify-between p-3 bg-surface border border-border rounded-xl">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: tag.color }} />
                <span className="text-[13px] font-medium">{tag.name}</span>
              </div>
              <button
                onClick={() => handleDelete(tag.id)}
                className="p-1.5 rounded-lg hover:bg-red-500/10 text-text-tertiary hover:text-red-400 transition-colors"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* New Tag Modal */}
      {showNew && (
        <>
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" onClick={() => setShowNew(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-[#0a0a0a] border border-border rounded-2xl w-full max-w-sm animate-scaleIn">
              <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                <h2 className="text-base font-semibold">New Tag</h2>
                <button onClick={() => setShowNew(false)} className="p-1 rounded-lg hover:bg-surface-hover text-text-tertiary hover:text-white transition-colors">
                  <X size={16} />
                </button>
              </div>
              <div className="px-6 py-4 space-y-3">
                <div>
                  <label className="block text-[11px] text-text-tertiary uppercase tracking-wider mb-1">Name *</label>
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full bg-surface border border-border rounded-xl px-3 py-2 text-[13px] text-white placeholder:text-text-tertiary focus:outline-none focus:border-orange-500/50 transition-colors"
                    placeholder="Tag name"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-text-tertiary uppercase tracking-wider mb-1">Color</label>
                  <div className="flex gap-2 flex-wrap">
                    {TAG_COLORS.map((color) => (
                      <button
                        key={color}
                        onClick={() => setNewColor(color)}
                        className={`w-7 h-7 rounded-lg border-2 transition-all ${
                          newColor === color ? "border-white scale-110" : "border-transparent"
                        }`}
                        style={{ backgroundColor: color }}
                      >
                        {newColor === color && <Check size={12} className="text-white mx-auto" />}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2 px-6 py-4 border-t border-border">
                <button
                  onClick={() => setShowNew(false)}
                  className="px-4 py-2 rounded-xl bg-surface border border-border hover:bg-surface-hover text-[13px] text-text-secondary hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreate}
                  disabled={saving || !newName.trim()}
                  className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-[13px] font-medium transition-colors disabled:opacity-50"
                >
                  {saving ? "Creating..." : "Create Tag"}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
