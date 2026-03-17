"use client";

import { useState } from "react";
import { TeamMember, TeamRole } from "@/types/database";
import {
  Plus,
  Edit3,
  Trash2,
  X,
  User,
  Mail,
  Shield,
  Check,
} from "lucide-react";

interface TeamProps {
  members: TeamMember[];
  onCreateMember: (data: Omit<TeamMember, "id" | "created_at">) => void;
  onUpdateMember: (id: string, data: Partial<TeamMember>) => void;
  onDeleteMember: (id: string) => void;
}

const ROLE_LABELS: Record<TeamRole, string> = {
  director: "Director",
  manager: "Manager",
  closer: "Closer",
  setter: "Setter",
};

const ROLE_COLORS: Record<TeamRole, string> = {
  director: "bg-purple-400/10 text-purple-400 border-purple-400/20",
  manager: "bg-blue-400/10 text-blue-400 border-blue-400/20",
  closer: "bg-emerald-400/10 text-emerald-400 border-emerald-400/20",
  setter: "bg-orange-400/10 text-orange-400 border-orange-400/20",
};

export default function Team({
  members,
  onCreateMember,
  onUpdateMember,
  onDeleteMember,
}: TeamProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState({
    nombre: "",
    email: "",
    roles: [] as TeamRole[],
    status: "active" as "active" | "inactive",
    base_rate: 0,
  });

  function resetForm() {
    setForm({ nombre: "", email: "", roles: [], status: "active", base_rate: 0 });
    setShowForm(false);
    setEditingId(null);
  }

  function startEdit(member: TeamMember) {
    setForm({
      nombre: member.nombre,
      email: member.email,
      roles: [...member.roles],
      status: member.status,
      base_rate: member.base_rate,
    });
    setEditingId(member.id);
    setShowForm(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.nombre.trim() || !form.email.trim() || form.roles.length === 0) return;

    if (editingId) {
      onUpdateMember(editingId, form);
    } else {
      onCreateMember(form);
    }
    resetForm();
  }

  function toggleRole(role: TeamRole) {
    setForm((prev) => ({
      ...prev,
      roles: prev.roles.includes(role)
        ? prev.roles.filter((r) => r !== role)
        : [...prev.roles, role],
    }));
  }

  const groupedByRole: Record<TeamRole, TeamMember[]> = {
    director: members.filter((m) => m.roles.includes("director")),
    manager: members.filter((m) => m.roles.includes("manager")),
    closer: members.filter((m) => m.roles.includes("closer")),
    setter: members.filter((m) => m.roles.includes("setter")),
  };

  return (
    <div className="animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-[13px] text-text-secondary">
            {members.length} member{members.length !== 1 ? "s" : ""} ·{" "}
            {members.filter((m) => m.status === "active").length} active
          </p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-medium bg-orange-500 hover:bg-orange-400 text-white transition-all shadow-lg shadow-orange-500/20"
        >
          <Plus size={14} />
          Add Member
        </button>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="bg-surface border border-border rounded-2xl p-5 mb-6 animate-scaleIn">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold">
              {editingId ? "Edit Member" : "New Member"}
            </h3>
            <button onClick={resetForm} className="p-1 hover:bg-surface-hover rounded-lg transition-colors">
              <X size={14} className="text-text-tertiary" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-text-tertiary uppercase tracking-wider mb-1.5 font-medium">
                  Name *
                </label>
                <input
                  type="text"
                  value={form.nombre}
                  onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                  placeholder="John Doe"
                  className="w-full bg-[rgba(255,255,255,0.03)] border border-border rounded-xl py-2 px-3 text-[13px] text-white placeholder:text-text-tertiary focus:outline-none focus:border-orange-400/30 transition-all"
                />
              </div>
              <div>
                <label className="block text-[11px] text-text-tertiary uppercase tracking-wider mb-1.5 font-medium">
                  Email *
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="john@company.com"
                  className="w-full bg-[rgba(255,255,255,0.03)] border border-border rounded-xl py-2 px-3 text-[13px] text-white placeholder:text-text-tertiary focus:outline-none focus:border-orange-400/30 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] text-text-tertiary uppercase tracking-wider mb-1.5 font-medium">
                Roles *
              </label>
              <div className="flex gap-2">
                {(Object.keys(ROLE_LABELS) as TeamRole[]).map((role) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => toggleRole(role)}
                    className={`px-3 py-1.5 rounded-lg text-[12px] font-medium border transition-all ${
                      form.roles.includes(role)
                        ? ROLE_COLORS[role]
                        : "border-border text-text-tertiary hover:border-border-hover"
                    }`}
                  >
                    {form.roles.includes(role) && <Check size={10} className="inline mr-1" />}
                    {ROLE_LABELS[role]}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-text-tertiary uppercase tracking-wider mb-1.5 font-medium">
                  Base Rate (%)
                </label>
                <input
                  type="number"
                  value={form.base_rate}
                  onChange={(e) => setForm({ ...form, base_rate: parseInt(e.target.value) || 0 })}
                  min="0"
                  max="100"
                  className="w-full bg-[rgba(255,255,255,0.03)] border border-border rounded-xl py-2 px-3 text-[13px] text-white focus:outline-none focus:border-orange-400/30 transition-all"
                />
              </div>
              <div>
                <label className="block text-[11px] text-text-tertiary uppercase tracking-wider mb-1.5 font-medium">
                  Status
                </label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value as "active" | "inactive" })}
                  className="w-full bg-[rgba(255,255,255,0.03)] border border-border rounded-xl py-2 px-3 text-[13px] text-white focus:outline-none focus:border-orange-400/30 transition-all appearance-none cursor-pointer"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 rounded-xl text-[13px] text-text-secondary hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl text-[13px] font-medium bg-orange-500 hover:bg-orange-400 text-white transition-all shadow-lg shadow-orange-500/20"
              >
                {editingId ? "Save Changes" : "Add Member"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Members grouped by role */}
      <div className="space-y-6">
        {(Object.keys(ROLE_LABELS) as TeamRole[]).map((role) => {
          const roleMembers = groupedByRole[role];
          if (roleMembers.length === 0) return null;

          return (
            <div key={role}>
              <h3 className="text-[12px] font-semibold text-text-tertiary uppercase tracking-wider mb-3 flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${ROLE_COLORS[role].split(" ")[1].replace("text-", "bg-")}`} />
                {ROLE_LABELS[role]}s
                <span className="text-[11px] bg-surface px-1.5 py-0.5 rounded-md font-normal">
                  {roleMembers.length}
                </span>
              </h3>

              <div className="space-y-2">
                {roleMembers.map((member) => (
                  <div
                    key={`${role}-${member.id}`}
                    className="bg-surface border border-border rounded-xl p-4 hover:border-border-hover transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      {/* Avatar */}
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500/20 to-orange-600/10 flex items-center justify-center border border-orange-500/10 flex-shrink-0">
                        <span className="text-[12px] font-semibold text-orange-400">
                          {member.nombre
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .slice(0, 2)}
                        </span>
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-[14px] font-medium">{member.nombre}</p>
                          <span
                            className={`text-[10px] px-1.5 py-0.5 rounded-md ${
                              member.status === "active"
                                ? "bg-emerald-400/10 text-emerald-400"
                                : "bg-red-400/10 text-red-400"
                            }`}
                          >
                            {member.status === "active" ? "Active" : "Inactive"}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-[12px] text-text-tertiary flex items-center gap-1">
                            <Mail size={10} />
                            {member.email}
                          </span>
                        </div>
                      </div>

                      {/* Roles */}
                      <div className="flex gap-1.5 flex-shrink-0">
                        {member.roles.map((r) => (
                          <span
                            key={r}
                            className={`text-[10px] font-medium px-2 py-1 rounded-lg border ${ROLE_COLORS[r]}`}
                          >
                            {ROLE_LABELS[r]}
                          </span>
                        ))}
                      </div>

                      {/* Rate */}
                      <div className="text-right flex-shrink-0 mr-2">
                        <p className="text-[13px] font-semibold text-orange-400">
                          {member.base_rate}%
                        </p>
                        <p className="text-[10px] text-text-tertiary">base</p>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                        <button
                          onClick={() => startEdit(member)}
                          className="p-2 rounded-lg hover:bg-surface-hover text-text-tertiary hover:text-white transition-all"
                        >
                          <Edit3 size={13} />
                        </button>
                        {confirmDeleteId === member.id ? (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => {
                                onDeleteMember(member.id);
                                setConfirmDeleteId(null);
                              }}
                              className="px-2 py-1 rounded-lg text-[11px] bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
                            >
                              Delete
                            </button>
                            <button
                              onClick={() => setConfirmDeleteId(null)}
                              className="px-2 py-1 rounded-lg text-[11px] text-text-tertiary hover:text-white transition-colors"
                            >
                              No
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setConfirmDeleteId(member.id)}
                            className="p-2 rounded-lg hover:bg-red-400/10 text-text-tertiary hover:text-red-400 transition-all"
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
