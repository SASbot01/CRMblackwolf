"use client";

import { useState, useEffect, useCallback } from "react";
import {
  X, Trash2, Edit3, Save, Plus,
  Phone, Mail, Calendar, FileText, CheckSquare,
  Tag as TagIcon,
} from "lucide-react";
import { EntityType, CustomField, Tag, Activity, ActivityType } from "@/types/database";
import {
  apiGetContact, apiUpdateContact, apiDeleteContact,
  apiGetCompany, apiUpdateCompany, apiDeleteCompany,
  apiGetDeal, apiUpdateDeal, apiDeleteDeal,
  apiGetActivities, apiCreateActivity,
  apiAddTag, apiRemoveTag,
} from "@/lib/api";
import { timeAgo, formatDate, formatCurrency, ACTIVITY_ICONS } from "@/lib/utils";

interface EntityDetailProps {
  entityType: EntityType;
  entityId: string;
  onClose: () => void;
  onUpdate: () => void;
  customFields: CustomField[];
  tags: Tag[];
}

const ACTIVITY_TYPE_ICONS: Record<string, typeof Phone> = {
  call: Phone,
  email: Mail,
  meeting: Calendar,
  note: FileText,
  task: CheckSquare,
};

export default function EntityDetail({
  entityType, entityId, onClose, onUpdate, customFields, tags,
}: EntityDetailProps) {
  const [entity, setEntity] = useState<Record<string, unknown> | null>(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState<Record<string, unknown>>({});
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showAddActivity, setShowAddActivity] = useState(false);
  const [activityForm, setActivityForm] = useState({ type: "note" as ActivityType, title: "", description: "" });
  const [showTagPicker, setShowTagPicker] = useState(false);

  const relevantCustomFields = customFields.filter((f) => f.entity_type === entityType);

  const fetchEntity = useCallback(async () => {
    try {
      let data;
      if (entityType === "contact") data = await apiGetContact(entityId);
      else if (entityType === "company") data = await apiGetCompany(entityId);
      else data = await apiGetDeal(entityId);
      setEntity(data);
      setFormData(data);
    } catch {}
  }, [entityType, entityId]);

  const fetchActivities = useCallback(async () => {
    try {
      const data = await apiGetActivities(entityType, entityId);
      if (Array.isArray(data)) setActivities(data);
    } catch {}
  }, [entityType, entityId]);

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchEntity(), fetchActivities()]).finally(() => setLoading(false));
  }, [fetchEntity, fetchActivities]);

  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      if (entityType === "contact") await apiUpdateContact(entityId, formData);
      else if (entityType === "company") await apiUpdateCompany(entityId, formData);
      else await apiUpdateDeal(entityId, formData);
      await fetchEntity();
      setEditing(false);
      onUpdate();
    } catch {}
    setSaving(false);
  }, [entityType, entityId, formData, fetchEntity, onUpdate]);

  const handleDelete = useCallback(async () => {
    if (!confirm("Are you sure you want to delete this?")) return;
    try {
      if (entityType === "contact") await apiDeleteContact(entityId);
      else if (entityType === "company") await apiDeleteCompany(entityId);
      else await apiDeleteDeal(entityId);
      onUpdate();
      onClose();
    } catch {}
  }, [entityType, entityId, onUpdate, onClose]);

  const handleAddActivity = useCallback(async () => {
    if (!activityForm.title.trim()) return;
    try {
      await apiCreateActivity({
        entity_type: entityType,
        entity_id: entityId,
        type: activityForm.type,
        title: activityForm.title,
        description: activityForm.description,
        completed: false,
      });
      setActivityForm({ type: "note", title: "", description: "" });
      setShowAddActivity(false);
      await fetchActivities();
    } catch {}
  }, [activityForm, entityType, entityId, fetchActivities]);

  const handleAddTag = useCallback(async (tagId: string) => {
    try {
      await apiAddTag(entityType, entityId, tagId);
      await fetchEntity();
      onUpdate();
      setShowTagPicker(false);
    } catch {}
  }, [entityType, entityId, fetchEntity, onUpdate]);

  const handleRemoveTag = useCallback(async (tagId: string) => {
    try {
      await apiRemoveTag(entityType, entityId, tagId);
      await fetchEntity();
      onUpdate();
    } catch {}
  }, [entityType, entityId, fetchEntity, onUpdate]);

  const updateField = (key: string, value: unknown) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const updateCustomField = (key: string, value: unknown) => {
    setFormData((prev) => ({
      ...prev,
      custom_fields: { ...(prev.custom_fields as Record<string, unknown> || {}), [key]: value },
    }));
  };

  const entityName = entityType === "contact"
    ? `${entity?.first_name || ""} ${entity?.last_name || ""}`.trim()
    : entityType === "company"
    ? (entity?.name as string) || ""
    : (entity?.title as string) || "";

  const entityTags = (entity?.tags as Tag[]) || [];
  const availableTags = tags.filter((t) => !entityTags.find((et) => et.id === t.id));

  const renderField = (label: string, key: string, type: string = "text") => {
    const value = formData[key] as string || "";
    if (!editing) {
      return (
        <div key={key} className="py-2">
          <p className="text-[11px] text-text-tertiary uppercase tracking-wider mb-0.5">{label}</p>
          <p className="text-[13px] text-text-secondary">{value || "--"}</p>
        </div>
      );
    }
    return (
      <div key={key} className="py-2">
        <label className="block text-[11px] text-text-tertiary uppercase tracking-wider mb-1">{label}</label>
        {type === "textarea" ? (
          <textarea
            value={value}
            onChange={(e) => updateField(key, e.target.value)}
            rows={3}
            className="w-full bg-surface border border-border rounded-xl px-3 py-2 text-[13px] text-white focus:outline-none focus:border-orange-500/50 transition-colors resize-none"
          />
        ) : (
          <input
            type={type}
            value={value}
            onChange={(e) => updateField(key, e.target.value)}
            className="w-full bg-surface border border-border rounded-xl px-3 py-2 text-[13px] text-white focus:outline-none focus:border-orange-500/50 transition-colors"
          />
        )}
      </div>
    );
  };

  const renderCustomFieldInput = (field: CustomField) => {
    const cfData = (formData.custom_fields as Record<string, unknown>) || {};
    const value = cfData[field.field_key] as string || "";

    if (!editing) {
      return (
        <div key={field.id} className="py-2">
          <p className="text-[11px] text-text-tertiary uppercase tracking-wider mb-0.5">{field.name}</p>
          <p className="text-[13px] text-text-secondary">
            {field.field_type === "checkbox" ? (value ? "Yes" : "No") : (value || "--")}
          </p>
        </div>
      );
    }

    if (field.field_type === "select") {
      return (
        <div key={field.id} className="py-2">
          <label className="block text-[11px] text-text-tertiary uppercase tracking-wider mb-1">{field.name}</label>
          <select
            value={value}
            onChange={(e) => updateCustomField(field.field_key, e.target.value)}
            className="w-full bg-surface border border-border rounded-xl px-3 py-2 text-[13px] text-white focus:outline-none focus:border-orange-500/50 transition-colors"
          >
            <option value="">Select...</option>
            {(field.options || []).map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>
      );
    }

    if (field.field_type === "checkbox") {
      return (
        <div key={field.id} className="py-2 flex items-center gap-2">
          <input
            type="checkbox"
            checked={!!value}
            onChange={(e) => updateCustomField(field.field_key, e.target.checked)}
            className="rounded border-border"
          />
          <label className="text-[13px] text-text-secondary">{field.name}</label>
        </div>
      );
    }

    if (field.field_type === "textarea") {
      return (
        <div key={field.id} className="py-2">
          <label className="block text-[11px] text-text-tertiary uppercase tracking-wider mb-1">{field.name}</label>
          <textarea
            value={value}
            onChange={(e) => updateCustomField(field.field_key, e.target.value)}
            rows={3}
            className="w-full bg-surface border border-border rounded-xl px-3 py-2 text-[13px] text-white focus:outline-none focus:border-orange-500/50 transition-colors resize-none"
          />
        </div>
      );
    }

    const inputType = field.field_type === "number" || field.field_type === "currency" ? "number"
      : field.field_type === "date" ? "date"
      : field.field_type === "email" ? "email"
      : field.field_type === "url" ? "url"
      : field.field_type === "phone" ? "tel"
      : "text";

    return (
      <div key={field.id} className="py-2">
        <label className="block text-[11px] text-text-tertiary uppercase tracking-wider mb-1">{field.name}</label>
        <input
          type={inputType}
          value={value}
          onChange={(e) => updateCustomField(field.field_key, e.target.value)}
          className="w-full bg-surface border border-border rounded-xl px-3 py-2 text-[13px] text-white focus:outline-none focus:border-orange-500/50 transition-colors"
        />
      </div>
    );
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
        onClick={onClose}
      />
      <div className="fixed top-0 right-0 h-screen w-[480px] bg-[#0a0a0a] border-l border-border z-50 flex flex-col animate-slideIn">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex-1 min-w-0">
            <p className="text-[10px] text-text-tertiary uppercase tracking-wider mb-0.5">{entityType}</p>
            <h2 className="text-lg font-semibold truncate">{loading ? "Loading..." : entityName}</h2>
          </div>
          <div className="flex items-center gap-2">
            {!editing ? (
              <button
                onClick={() => setEditing(true)}
                className="p-2 rounded-lg hover:bg-surface-hover text-text-secondary hover:text-white transition-colors"
              >
                <Edit3 size={16} />
              </button>
            ) : (
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-[12px] font-medium transition-colors disabled:opacity-50"
              >
                <Save size={12} />
                {saving ? "Saving..." : "Save"}
              </button>
            )}
            <button
              onClick={handleDelete}
              className="p-2 rounded-lg hover:bg-red-500/10 text-text-tertiary hover:text-red-400 transition-colors"
            >
              <Trash2 size={16} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-surface-hover text-text-tertiary hover:text-white transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-12 bg-surface rounded-xl animate-pulse" />
              ))}
            </div>
          ) : (
            <>
              {/* Standard Fields */}
              <div>
                <h3 className="text-[12px] font-semibold text-text-secondary uppercase tracking-wider mb-2">Details</h3>
                <div className="space-y-0.5">
                  {entityType === "contact" && (
                    <>
                      {renderField("First Name", "first_name")}
                      {renderField("Last Name", "last_name")}
                      {renderField("Email", "email", "email")}
                      {renderField("Phone", "phone", "tel")}
                      {renderField("Position", "position")}
                      {renderField("Region", "region")}
                      {renderField("Notes", "notes", "textarea")}
                    </>
                  )}
                  {entityType === "company" && (
                    <>
                      {renderField("Name", "name")}
                      {renderField("Industry", "industry")}
                      {renderField("Region", "region")}
                      {renderField("Website", "website", "url")}
                      {renderField("Email", "email", "email")}
                      {renderField("Phone", "phone", "tel")}
                      {renderField("Address", "address")}
                      {renderField("Notes", "notes", "textarea")}
                    </>
                  )}
                  {entityType === "deal" && (
                    <>
                      {renderField("Title", "title")}
                      <div className="py-2">
                        <p className="text-[11px] text-text-tertiary uppercase tracking-wider mb-0.5">Value</p>
                        <p className="text-[13px] text-text-secondary">{formatCurrency((entity?.value as number) || 0)}</p>
                      </div>
                      {renderField("Notes", "notes", "textarea")}
                    </>
                  )}
                </div>
              </div>

              {/* Custom Fields */}
              {relevantCustomFields.length > 0 && (
                <div>
                  <h3 className="text-[12px] font-semibold text-text-secondary uppercase tracking-wider mb-2">Custom Fields</h3>
                  <div className="space-y-0.5">
                    {relevantCustomFields.map(renderCustomFieldInput)}
                  </div>
                </div>
              )}

              {/* Tags */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-[12px] font-semibold text-text-secondary uppercase tracking-wider">Tags</h3>
                  <button
                    onClick={() => setShowTagPicker(!showTagPicker)}
                    className="p-1 rounded-lg hover:bg-surface-hover text-text-tertiary hover:text-white transition-colors"
                  >
                    <Plus size={14} />
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {entityTags.map((tag) => (
                    <span
                      key={tag.id}
                      className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-[11px] font-medium bg-surface border border-border group"
                    >
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: tag.color }} />
                      {tag.name}
                      <button
                        onClick={() => handleRemoveTag(tag.id)}
                        className="text-text-tertiary hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <X size={10} />
                      </button>
                    </span>
                  ))}
                  {entityTags.length === 0 && (
                    <p className="text-[12px] text-text-tertiary">No tags</p>
                  )}
                </div>
                {showTagPicker && availableTags.length > 0 && (
                  <div className="mt-2 p-2 bg-surface border border-border rounded-xl space-y-1">
                    {availableTags.map((tag) => (
                      <button
                        key={tag.id}
                        onClick={() => handleAddTag(tag.id)}
                        className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-surface-hover text-[12px] text-text-secondary hover:text-white transition-colors"
                      >
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: tag.color }} />
                        {tag.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Activities */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-[12px] font-semibold text-text-secondary uppercase tracking-wider">Activity</h3>
                  <button
                    onClick={() => setShowAddActivity(!showAddActivity)}
                    className="flex items-center gap-1 px-2 py-1 rounded-lg bg-surface border border-border hover:border-border-hover text-[11px] text-text-secondary hover:text-white transition-colors"
                  >
                    <Plus size={12} />
                    Add
                  </button>
                </div>

                {showAddActivity && (
                  <div className="mb-4 p-3 bg-surface border border-border rounded-xl space-y-2 animate-scaleIn">
                    <select
                      value={activityForm.type}
                      onChange={(e) => setActivityForm((p) => ({ ...p, type: e.target.value as ActivityType }))}
                      className="w-full bg-[#0a0a0a] border border-border rounded-xl px-3 py-2 text-[13px] text-white focus:outline-none focus:border-orange-500/50"
                    >
                      <option value="note">Note</option>
                      <option value="call">Call</option>
                      <option value="email">Email</option>
                      <option value="meeting">Meeting</option>
                      <option value="task">Task</option>
                    </select>
                    <input
                      type="text"
                      placeholder="Title"
                      value={activityForm.title}
                      onChange={(e) => setActivityForm((p) => ({ ...p, title: e.target.value }))}
                      className="w-full bg-[#0a0a0a] border border-border rounded-xl px-3 py-2 text-[13px] text-white placeholder:text-text-tertiary focus:outline-none focus:border-orange-500/50"
                    />
                    <textarea
                      placeholder="Description (optional)"
                      value={activityForm.description}
                      onChange={(e) => setActivityForm((p) => ({ ...p, description: e.target.value }))}
                      rows={2}
                      className="w-full bg-[#0a0a0a] border border-border rounded-xl px-3 py-2 text-[13px] text-white placeholder:text-text-tertiary focus:outline-none focus:border-orange-500/50 resize-none"
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setShowAddActivity(false)}
                        className="px-3 py-1.5 rounded-xl text-[12px] text-text-secondary hover:text-white transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleAddActivity}
                        className="px-3 py-1.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-[12px] font-medium transition-colors"
                      >
                        Add Activity
                      </button>
                    </div>
                  </div>
                )}

                <div className="space-y-1">
                  {activities.length === 0 ? (
                    <p className="text-[12px] text-text-tertiary text-center py-4">No activities yet</p>
                  ) : (
                    activities.map((activity) => {
                      const config = ACTIVITY_ICONS[activity.type] || { label: activity.type, color: "text-text-secondary" };
                      const Icon = ACTIVITY_TYPE_ICONS[activity.type] || FileText;
                      return (
                        <div
                          key={activity.id}
                          className="flex items-start gap-3 p-2 rounded-xl hover:bg-surface-hover transition-colors"
                        >
                          <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-surface border border-border flex-shrink-0 mt-0.5">
                            <Icon size={12} className={config.color} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[12px] font-medium truncate">{activity.title}</p>
                            {activity.description && (
                              <p className="text-[11px] text-text-tertiary mt-0.5 line-clamp-2">{activity.description}</p>
                            )}
                            <p className="text-[10px] text-text-tertiary mt-0.5">{timeAgo(activity.created_at)}</p>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
