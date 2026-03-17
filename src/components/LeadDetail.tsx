"use client";

import { useState } from "react";
import { Lead, Activity, LeadStatus } from "@/types/database";
import {
  STATUS_CONFIG,
  SOURCE_CONFIG,
  PRIORITY_CONFIG,
  formatCurrency,
  formatDateTime,
  formatDate,
} from "@/lib/utils";
import {
  X,
  Phone,
  Mail,
  Building2,
  User,
  Calendar,
  DollarSign,
  MessageSquare,
  ChevronRight,
  Trash2,
  Edit3,
  Plus,
} from "lucide-react";

interface LeadDetailProps {
  lead: Lead;
  activities: Activity[];
  onClose: () => void;
  onUpdate: (id: string, data: Partial<Lead>) => void;
  onDelete: (id: string) => void;
  onAddActivity: (data: Omit<Activity, "id" | "created_at">) => void;
}

const ACTIVITY_ICONS: Record<Activity["tipo"], React.ReactNode> = {
  llamada: <Phone size={12} />,
  email: <Mail size={12} />,
  reunion: <Calendar size={12} />,
  nota: <MessageSquare size={12} />,
  seguimiento: <ChevronRight size={12} />,
};

const ACTIVITY_COLORS: Record<Activity["tipo"], string> = {
  llamada: "text-green-400 bg-green-400/10",
  email: "text-blue-400 bg-blue-400/10",
  reunion: "text-purple-400 bg-purple-400/10",
  nota: "text-yellow-400 bg-yellow-400/10",
  seguimiento: "text-orange-400 bg-orange-400/10",
};

export default function LeadDetail({
  lead,
  activities,
  onClose,
  onUpdate,
  onDelete,
  onAddActivity,
}: LeadDetailProps) {
  const [showNewActivity, setShowNewActivity] = useState(false);
  const [newActivity, setNewActivity] = useState({
    tipo: "llamada" as Activity["tipo"],
    descripcion: "",
    resultado: "",
  });
  const [confirmDelete, setConfirmDelete] = useState(false);

  const statusCfg = STATUS_CONFIG[lead.status];
  const priorityCfg = PRIORITY_CONFIG[lead.prioridad];

  const statusOrder: LeadStatus[] = [
    "nuevo",
    "contactado",
    "en_negociacion",
    "propuesta_enviada",
    "ganado",
    "perdido",
  ];

  function handleAddActivity() {
    if (!newActivity.descripcion.trim()) return;
    onAddActivity({
      lead_id: lead.id,
      ...newActivity,
    });
    setNewActivity({ tipo: "llamada", descripcion: "", resultado: "" });
    setShowNewActivity(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative w-[520px] h-full bg-[#0a0a0a] border-l border-border overflow-y-auto animate-slideIn">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-[#0a0a0a]/95 backdrop-blur-xl border-b border-border px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500/30 to-orange-600/10 flex items-center justify-center border border-orange-500/20">
                <span className="text-sm font-semibold text-orange-400">
                  {lead.nombre
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)}
                </span>
              </div>
              <div>
                <h2 className="text-base font-semibold">{lead.nombre}</h2>
                <p className="text-[12px] text-text-tertiary">
                  {lead.cargo} · {lead.empresa}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-surface-hover transition-colors"
            >
              <X size={16} className="text-text-tertiary" />
            </button>
          </div>
        </div>

        <div className="px-6 py-5 space-y-5">
          {/* Status Pipeline */}
          <div>
            <p className="text-[11px] text-text-tertiary uppercase tracking-wider mb-3 font-medium">
              Lead Status
            </p>
            <div className="flex gap-1">
              {statusOrder.map((s) => {
                const cfg = STATUS_CONFIG[s];
                const isActive = lead.status === s;
                return (
                  <button
                    key={s}
                    onClick={() => onUpdate(lead.id, { status: s })}
                    className={`flex-1 py-2 rounded-lg text-[10px] font-medium border transition-all duration-200 ${
                      isActive
                        ? `${cfg.bg} ${cfg.color}`
                        : "border-transparent text-text-tertiary hover:text-text-secondary hover:bg-surface"
                    }`}
                  >
                    {cfg.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-2 gap-3">
            <InfoCard
              icon={<Mail size={13} />}
              label="Email"
              value={lead.email}
            />
            <InfoCard
              icon={<Phone size={13} />}
              label="Phone"
              value={lead.telefono}
            />
            <InfoCard
              icon={<Building2 size={13} />}
              label="Company"
              value={lead.empresa}
            />
            <InfoCard
              icon={<User size={13} />}
              label="Position"
              value={lead.cargo}
            />
            <InfoCard
              icon={<DollarSign size={13} />}
              label="Estimated Value"
              value={formatCurrency(lead.valor_estimado)}
              accent
            />
            <InfoCard
              icon={<Calendar size={13} />}
              label="Source"
              value={SOURCE_CONFIG[lead.source].label}
            />
          </div>

          {/* Priority */}
          <div>
            <p className="text-[11px] text-text-tertiary uppercase tracking-wider mb-2 font-medium">
              Priority
            </p>
            <div className="flex gap-2">
              {(
                Object.entries(PRIORITY_CONFIG) as [
                  string,
                  { label: string; color: string }
                ][]
              ).map(([key, cfg]) => (
                <button
                  key={key}
                  onClick={() =>
                    onUpdate(lead.id, {
                      prioridad: key as Lead["prioridad"],
                    })
                  }
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-medium border transition-all duration-200 ${
                    lead.prioridad === key
                      ? `${cfg.color} bg-surface border-border-hover`
                      : "text-text-tertiary border-transparent hover:border-border hover:bg-surface"
                  }`}
                >
                  {cfg.label}
                </button>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="flex gap-3">
            <div className="flex-1 bg-surface border border-border rounded-xl p-3 text-center">
              <p className="text-lg font-semibold">{lead.llamadas_realizadas}</p>
              <p className="text-[10px] text-text-tertiary mt-0.5">Calls</p>
            </div>
            <div className="flex-1 bg-surface border border-border rounded-xl p-3 text-center">
              <p className="text-lg font-semibold">{lead.emails_enviados}</p>
              <p className="text-[10px] text-text-tertiary mt-0.5">Emails</p>
            </div>
            <div className="flex-1 bg-surface border border-border rounded-xl p-3 text-center">
              <p className="text-lg font-semibold">{activities.length}</p>
              <p className="text-[10px] text-text-tertiary mt-0.5">Activities</p>
            </div>
          </div>

          {/* Notas */}
          {lead.notas && (
            <div>
              <p className="text-[11px] text-text-tertiary uppercase tracking-wider mb-2 font-medium">
                Notes
              </p>
              <p className="text-[13px] text-text-secondary leading-relaxed bg-surface border border-border rounded-xl p-3">
                {lead.notas}
              </p>
            </div>
          )}

          {/* Próxima acción */}
          {lead.proxima_accion && (
            <div className="bg-orange-400/5 border border-orange-400/10 rounded-xl p-4">
              <p className="text-[11px] text-orange-400 uppercase tracking-wider mb-1 font-medium">
                Next Action
              </p>
              <p className="text-[13px] text-white">{lead.proxima_accion}</p>
              {lead.fecha_proxima_accion && (
                <p className="text-[11px] text-text-tertiary mt-1">
                  {formatDate(lead.fecha_proxima_accion)}
                </p>
              )}
            </div>
          )}

          {/* Activities */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-[11px] text-text-tertiary uppercase tracking-wider font-medium">
                Activity History
              </p>
              <button
                onClick={() => setShowNewActivity(!showNewActivity)}
                className="flex items-center gap-1 text-[11px] text-orange-400 hover:text-orange-300 transition-colors"
              >
                <Plus size={12} />
                New
              </button>
            </div>

            {showNewActivity && (
              <div className="bg-surface border border-border rounded-xl p-4 mb-3 animate-scaleIn">
                <div className="flex gap-2 mb-3">
                  {(
                    ["llamada", "email", "reunion", "nota", "seguimiento"] as const
                  ).map((tipo) => (
                    <button
                      key={tipo}
                      onClick={() =>
                        setNewActivity({ ...newActivity, tipo })
                      }
                      className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] border transition-all ${
                        newActivity.tipo === tipo
                          ? `${ACTIVITY_COLORS[tipo]} border-current/20`
                          : "text-text-tertiary border-transparent hover:bg-surface-hover"
                      }`}
                    >
                      {ACTIVITY_ICONS[tipo]}
                      {tipo.charAt(0).toUpperCase() + tipo.slice(1)}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  placeholder="Description..."
                  value={newActivity.descripcion}
                  onChange={(e) =>
                    setNewActivity({
                      ...newActivity,
                      descripcion: e.target.value,
                    })
                  }
                  className="w-full bg-transparent border border-border rounded-lg py-2 px-3 text-[13px] text-white placeholder:text-text-tertiary focus:outline-none focus:border-orange-400/30 mb-2"
                />
                <input
                  type="text"
                  placeholder="Result..."
                  value={newActivity.resultado}
                  onChange={(e) =>
                    setNewActivity({
                      ...newActivity,
                      resultado: e.target.value,
                    })
                  }
                  className="w-full bg-transparent border border-border rounded-lg py-2 px-3 text-[13px] text-white placeholder:text-text-tertiary focus:outline-none focus:border-orange-400/30 mb-3"
                />
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setShowNewActivity(false)}
                    className="px-3 py-1.5 rounded-lg text-[12px] text-text-tertiary hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddActivity}
                    className="px-3 py-1.5 rounded-lg text-[12px] font-medium bg-orange-500 hover:bg-orange-400 text-white transition-colors"
                  >
                    Save
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-2">
              {activities.length === 0 ? (
                <p className="text-[12px] text-text-tertiary text-center py-6">
                  No activities recorded
                </p>
              ) : (
                activities.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex gap-3 p-3 rounded-xl hover:bg-surface transition-colors"
                  >
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        ACTIVITY_COLORS[activity.tipo]
                      }`}
                    >
                      {ACTIVITY_ICONS[activity.tipo]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] text-white">
                        {activity.descripcion}
                      </p>
                      {activity.resultado && (
                        <p className="text-[11px] text-text-tertiary mt-0.5">
                          {activity.resultado}
                        </p>
                      )}
                      <p className="text-[10px] text-text-tertiary mt-1">
                        {formatDateTime(activity.created_at)}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-border">
            {confirmDelete ? (
              <div className="flex items-center gap-3">
                <p className="text-[12px] text-red-400 flex-1">
                  Delete this lead?
                </p>
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="px-3 py-1.5 rounded-lg text-[12px] text-text-tertiary hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => onDelete(lead.id)}
                  className="px-3 py-1.5 rounded-lg text-[12px] font-medium bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
                >
                  Delete
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmDelete(true)}
                className="flex items-center gap-2 text-[12px] text-text-tertiary hover:text-red-400 transition-colors"
              >
                <Trash2 size={13} />
                Delete lead
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoCard({
  icon,
  label,
  value,
  accent = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="bg-surface border border-border rounded-xl p-3">
      <div className="flex items-center gap-1.5 mb-1">
        <span className="text-text-tertiary">{icon}</span>
        <span className="text-[10px] text-text-tertiary uppercase tracking-wider">
          {label}
        </span>
      </div>
      <p
        className={`text-[13px] font-medium truncate ${
          accent ? "text-orange-400" : "text-white"
        }`}
      >
        {value}
      </p>
    </div>
  );
}
