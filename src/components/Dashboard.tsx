"use client";

import { Lead } from "@/types/database";
import { STATUS_CONFIG, PRIORITY_CONFIG, formatCurrency, timeAgo } from "@/lib/utils";
import {
  Users,
  TrendingUp,
  Trophy,
  Clock,
  Phone,
  Mail,
  ArrowUpRight,
} from "lucide-react";

interface DashboardProps {
  leads: Lead[];
  onSelectLead: (id: string) => void;
  onViewChange: (view: string) => void;
}

export default function Dashboard({ leads, onSelectLead, onViewChange }: DashboardProps) {
  const total = leads.length;
  const activos = leads.filter(
    (l) => !["ganado", "perdido"].includes(l.status)
  ).length;
  const ganados = leads.filter((l) => l.status === "ganado").length;
  const valorPipeline = leads
    .filter((l) => !["ganado", "perdido"].includes(l.status))
    .reduce((s, l) => s + l.valor_estimado, 0);
  const valorGanado = leads
    .filter((l) => l.status === "ganado")
    .reduce((s, l) => s + l.valor_estimado, 0);

  const urgentes = leads
    .filter(
      (l) =>
        l.fecha_proxima_accion &&
        new Date(l.fecha_proxima_accion) <= new Date(Date.now() + 86400000 * 2) &&
        !["ganado", "perdido"].includes(l.status)
    )
    .sort(
      (a, b) =>
        new Date(a.fecha_proxima_accion!).getTime() -
        new Date(b.fecha_proxima_accion!).getTime()
    );

  const recientes = [...leads]
    .sort(
      (a, b) =>
        new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    )
    .slice(0, 5);

  const stats = [
    {
      label: "Total Leads",
      value: total,
      icon: Users,
      accent: false,
    },
    {
      label: "Active",
      value: activos,
      icon: TrendingUp,
      accent: false,
    },
    {
      label: "Won",
      value: ganados,
      icon: Trophy,
      accent: true,
    },
    {
      label: "Pipeline",
      value: formatCurrency(valorPipeline),
      icon: TrendingUp,
      accent: false,
    },
    {
      label: "Revenue Won",
      value: formatCurrency(valorGanado),
      icon: Trophy,
      accent: true,
    },
  ];

  return (
    <div className="animate-fadeIn">
      {/* Stats */}
      <div className="grid grid-cols-5 gap-3 mb-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="bg-surface border border-border rounded-2xl p-4 hover:border-border-hover transition-all duration-200"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] text-text-tertiary font-medium uppercase tracking-wider">
                  {stat.label}
                </span>
                <Icon
                  size={14}
                  className={stat.accent ? "text-orange-400" : "text-text-tertiary"}
                />
              </div>
              <p
                className={`text-xl font-semibold ${
                  stat.accent ? "text-orange-400" : "text-white"
                }`}
              >
                {stat.value}
              </p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-3 gap-4">
        {/* Acciones urgentes */}
        <div className="col-span-1 bg-surface border border-border rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <Clock size={14} className="text-orange-400" />
              Pending Actions
            </h3>
            <span className="text-[11px] text-text-tertiary">{urgentes.length}</span>
          </div>
          <div className="space-y-2">
            {urgentes.length === 0 ? (
              <p className="text-[13px] text-text-tertiary py-4 text-center">
                No urgent actions
              </p>
            ) : (
              urgentes.map((lead) => (
                <button
                  key={lead.id}
                  onClick={() => onSelectLead(lead.id)}
                  className="w-full text-left p-3 rounded-xl bg-[rgba(255,255,255,0.02)] hover:bg-surface-hover border border-transparent hover:border-border transition-all duration-200 group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] font-medium group-hover:text-white transition-colors">
                      {lead.nombre}
                    </span>
                    <ArrowUpRight
                      size={12}
                      className="text-text-tertiary group-hover:text-orange-400 transition-colors"
                    />
                  </div>
                  <p className="text-[11px] text-text-tertiary mt-0.5">
                    {lead.proxima_accion}
                  </p>
                  <p className="text-[10px] text-orange-400/70 mt-1">
                    {lead.fecha_proxima_accion
                      ? new Date(lead.fecha_proxima_accion).toLocaleDateString("en-US", {
                          day: "numeric",
                          month: "short",
                        })
                      : ""}
                  </p>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Actividad reciente */}
        <div className="col-span-2 bg-surface border border-border rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold">Recent Activity</h3>
            <button
              onClick={() => onViewChange("leads")}
              className="text-[11px] text-orange-400 hover:text-orange-300 transition-colors"
            >
              View all →
            </button>
          </div>
          <div className="space-y-1">
            {recientes.map((lead, i) => {
              const statusCfg = STATUS_CONFIG[lead.status];
              const priorityCfg = PRIORITY_CONFIG[lead.prioridad];
              return (
                <button
                  key={lead.id}
                  onClick={() => onSelectLead(lead.id)}
                  className="w-full text-left flex items-center gap-4 p-3 rounded-xl hover:bg-surface-hover transition-all duration-200 group"
                  style={{ animationDelay: `${i * 50}ms` }}
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500/20 to-orange-600/10 flex items-center justify-center flex-shrink-0 border border-orange-500/10">
                    <span className="text-[11px] font-semibold text-orange-400">
                      {lead.nombre
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .slice(0, 2)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[13px] font-medium truncate">
                        {lead.nombre}
                      </span>
                      <span className="text-[11px] text-text-tertiary truncate">
                        {lead.empresa}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span
                        className={`text-[10px] font-medium px-1.5 py-0.5 rounded-md border ${statusCfg.bg}`}
                      >
                        {statusCfg.label}
                      </span>
                      <span className={`text-[10px] ${priorityCfg.color}`}>
                        {priorityCfg.label}
                      </span>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-[13px] font-medium text-text-secondary">
                      {formatCurrency(lead.valor_estimado)}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5 justify-end">
                      <span className="text-[10px] text-text-tertiary flex items-center gap-0.5">
                        <Phone size={9} /> {lead.llamadas_realizadas}
                      </span>
                      <span className="text-[10px] text-text-tertiary flex items-center gap-0.5">
                        <Mail size={9} /> {lead.emails_enviados}
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] text-text-tertiary w-16 text-right flex-shrink-0">
                    {timeAgo(lead.ultima_interaccion)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
