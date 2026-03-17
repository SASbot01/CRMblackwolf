"use client";

import { Lead } from "@/types/database";
import { STATUS_CONFIG, SOURCE_CONFIG, PRIORITY_CONFIG, formatCurrency } from "@/lib/utils";

interface AnalyticsProps {
  leads: Lead[];
}

export default function Analytics({ leads }: AnalyticsProps) {
  const total = leads.length;
  if (total === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-text-tertiary text-[13px]">
        No data to display
      </div>
    );
  }

  // Status distribution
  const statusData = Object.entries(STATUS_CONFIG).map(([key, cfg]) => {
    const count = leads.filter((l) => l.status === key).length;
    const value = leads
      .filter((l) => l.status === key)
      .reduce((s, l) => s + l.valor_estimado, 0);
    return { key, ...cfg, count, value, pct: (count / total) * 100 };
  });

  // Source distribution
  const sourceData = Object.entries(SOURCE_CONFIG).map(([key, cfg]) => {
    const count = leads.filter((l) => l.source === key).length;
    return { key, ...cfg, count, pct: (count / total) * 100 };
  }).filter(s => s.count > 0);

  // Priority distribution
  const priorityData = Object.entries(PRIORITY_CONFIG).map(([key, cfg]) => {
    const count = leads.filter((l) => l.prioridad === key).length;
    return { key, ...cfg, count, pct: (count / total) * 100 };
  });

  // Conversion rates
  const ganados = leads.filter((l) => l.status === "ganado").length;
  const perdidos = leads.filter((l) => l.status === "perdido").length;
  const cerrados = ganados + perdidos;
  const winRate = cerrados > 0 ? ((ganados / cerrados) * 100).toFixed(1) : "—";

  const valorTotal = leads.reduce((s, l) => s + l.valor_estimado, 0);
  const valorGanado = leads
    .filter((l) => l.status === "ganado")
    .reduce((s, l) => s + l.valor_estimado, 0);
  const avgDealSize = total > 0 ? valorTotal / total : 0;

  const totalLlamadas = leads.reduce((s, l) => s + l.llamadas_realizadas, 0);
  const totalEmails = leads.reduce((s, l) => s + l.emails_enviados, 0);

  return (
    <div className="animate-fadeIn space-y-4">
      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-3">
        <KPICard label="Conversion Rate" value={`${winRate}%`} accent />
        <KPICard label="Total Pipeline Value" value={formatCurrency(valorTotal)} />
        <KPICard label="Closed Revenue" value={formatCurrency(valorGanado)} accent />
        <KPICard label="Average Deal Size" value={formatCurrency(avgDealSize)} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Status Breakdown */}
        <div className="bg-surface border border-border rounded-2xl p-5">
          <h3 className="text-sm font-semibold mb-4">Distribution by Status</h3>
          <div className="space-y-3">
            {statusData.map((s) => (
              <div key={s.key}>
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-[12px] font-medium ${s.color}`}>
                    {s.label}
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="text-[11px] text-text-tertiary">
                      {formatCurrency(s.value)}
                    </span>
                    <span className="text-[12px] font-medium w-6 text-right">
                      {s.count}
                    </span>
                  </div>
                </div>
                <div className="h-1.5 bg-[rgba(255,255,255,0.04)] rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${s.color.replace(
                      "text-",
                      "bg-"
                    )}`}
                    style={{ width: `${s.pct}%`, opacity: 0.6 }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Source Breakdown */}
        <div className="bg-surface border border-border rounded-2xl p-5">
          <h3 className="text-sm font-semibold mb-4">Lead Sources</h3>
          <div className="space-y-3">
            {sourceData.map((s) => (
              <div key={s.key}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[12px] font-medium text-text-secondary">
                    {s.label}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-text-tertiary">
                      {s.pct.toFixed(0)}%
                    </span>
                    <span className="text-[12px] font-medium w-6 text-right">
                      {s.count}
                    </span>
                  </div>
                </div>
                <div className="h-1.5 bg-[rgba(255,255,255,0.04)] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-orange-400 transition-all duration-500"
                    style={{ width: `${s.pct}%`, opacity: 0.6 }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {/* Priority */}
        <div className="bg-surface border border-border rounded-2xl p-5">
          <h3 className="text-sm font-semibold mb-4">By Priority</h3>
          <div className="space-y-3">
            {priorityData.map((p) => (
              <div key={p.key} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-2 h-2 rounded-full ${p.color.replace(
                      "text-",
                      "bg-"
                    )}`}
                  />
                  <span className={`text-[12px] font-medium ${p.color}`}>
                    {p.label}
                  </span>
                </div>
                <span className="text-[13px] font-semibold">{p.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Activity Stats */}
        <div className="bg-surface border border-border rounded-2xl p-5">
          <h3 className="text-sm font-semibold mb-4">Total Activity</h3>
          <div className="space-y-4">
            <div>
              <p className="text-2xl font-semibold text-orange-400">
                {totalLlamadas}
              </p>
              <p className="text-[11px] text-text-tertiary mt-0.5">
                Calls made
              </p>
            </div>
            <div>
              <p className="text-2xl font-semibold">{totalEmails}</p>
              <p className="text-[11px] text-text-tertiary mt-0.5">
                Emails sent
              </p>
            </div>
            <div>
              <p className="text-2xl font-semibold text-text-secondary">
                {totalLlamadas + totalEmails}
              </p>
              <p className="text-[11px] text-text-tertiary mt-0.5">
                Total interactions
              </p>
            </div>
          </div>
        </div>

        {/* Funnel */}
        <div className="bg-surface border border-border rounded-2xl p-5">
          <h3 className="text-sm font-semibold mb-4">Sales Funnel</h3>
          <div className="space-y-2">
            {["nuevo", "contactado", "en_negociacion", "propuesta_enviada", "ganado"].map(
              (stage, i) => {
                const cfg = STATUS_CONFIG[stage as keyof typeof STATUS_CONFIG];
                const count = leads.filter((l) => l.status === stage).length;
                const maxWidth = 100 - i * 15;
                return (
                  <div key={stage} className="flex items-center gap-3">
                    <div
                      className={`h-8 rounded-lg flex items-center px-3 transition-all ${cfg.color.replace(
                        "text-",
                        "bg-"
                      )}/10`}
                      style={{ width: `${Math.max(maxWidth, 30)}%` }}
                    >
                      <span className={`text-[11px] font-medium ${cfg.color}`}>
                        {cfg.label}
                      </span>
                    </div>
                    <span className="text-[13px] font-semibold w-6">{count}</span>
                  </div>
                );
              }
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function KPICard({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="bg-surface border border-border rounded-2xl p-4 hover:border-border-hover transition-all">
      <p className="text-[11px] text-text-tertiary uppercase tracking-wider font-medium mb-2">
        {label}
      </p>
      <p
        className={`text-xl font-semibold ${
          accent ? "text-orange-400" : "text-white"
        }`}
      >
        {value}
      </p>
    </div>
  );
}
