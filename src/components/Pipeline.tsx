"use client";

import { Lead, LeadStatus } from "@/types/database";
import { STATUS_CONFIG, PRIORITY_CONFIG, formatCurrency } from "@/lib/utils";
import { Phone, Mail, GripVertical } from "lucide-react";

interface PipelineProps {
  leads: Lead[];
  onSelectLead: (id: string) => void;
  onUpdateStatus: (id: string, status: LeadStatus) => void;
}

const PIPELINE_STAGES: LeadStatus[] = [
  "nuevo",
  "contactado",
  "en_negociacion",
  "propuesta_enviada",
  "ganado",
  "perdido",
];

export default function Pipeline({
  leads,
  onSelectLead,
  onUpdateStatus,
}: PipelineProps) {
  return (
    <div className="animate-fadeIn">
      <div className="flex gap-3 overflow-x-auto pb-4">
        {PIPELINE_STAGES.map((stage) => {
          const cfg = STATUS_CONFIG[stage];
          const stageLeads = leads.filter((l) => l.status === stage);
          const totalValue = stageLeads.reduce(
            (s, l) => s + l.valor_estimado,
            0
          );

          return (
            <div
              key={stage}
              className="flex-shrink-0 w-[260px]"
              onDragOver={(e) => {
                e.preventDefault();
                e.currentTarget.classList.add("ring-1", "ring-orange-400/30");
              }}
              onDragLeave={(e) => {
                e.currentTarget.classList.remove("ring-1", "ring-orange-400/30");
              }}
              onDrop={(e) => {
                e.preventDefault();
                e.currentTarget.classList.remove("ring-1", "ring-orange-400/30");
                const leadId = e.dataTransfer.getData("text/plain");
                if (leadId) onUpdateStatus(leadId, stage);
              }}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between mb-3 px-1">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-2 h-2 rounded-full ${cfg.color.replace(
                      "text-",
                      "bg-"
                    )}`}
                  />
                  <span className="text-[12px] font-semibold text-text-secondary">
                    {cfg.label}
                  </span>
                  <span className="text-[11px] text-text-tertiary bg-surface px-1.5 py-0.5 rounded-md">
                    {stageLeads.length}
                  </span>
                </div>
                <span className="text-[10px] text-text-tertiary">
                  {formatCurrency(totalValue)}
                </span>
              </div>

              {/* Cards */}
              <div className="space-y-2 min-h-[200px] bg-surface/30 rounded-2xl p-2 border border-border/50">
                {stageLeads.map((lead) => {
                  const prCfg = PRIORITY_CONFIG[lead.prioridad];
                  return (
                    <div
                      key={lead.id}
                      draggable
                      onDragStart={(e) =>
                        e.dataTransfer.setData("text/plain", lead.id)
                      }
                      onClick={() => onSelectLead(lead.id)}
                      className="bg-[#0a0a0a] border border-border rounded-xl p-3 cursor-pointer hover:border-border-hover hover:shadow-lg hover:shadow-black/20 transition-all duration-200 group"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-orange-500/20 to-orange-600/10 flex items-center justify-center border border-orange-500/10 flex-shrink-0">
                            <span className="text-[9px] font-semibold text-orange-400">
                              {lead.nombre
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .slice(0, 2)}
                            </span>
                          </div>
                          <div>
                            <p className="text-[12px] font-medium group-hover:text-white transition-colors leading-tight">
                              {lead.nombre}
                            </p>
                            <p className="text-[10px] text-text-tertiary">
                              {lead.empresa}
                            </p>
                          </div>
                        </div>
                        <GripVertical
                          size={12}
                          className="text-text-tertiary/30 group-hover:text-text-tertiary transition-colors mt-0.5 cursor-grab"
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-[12px] font-medium text-orange-400">
                          {formatCurrency(lead.valor_estimado)}
                        </span>
                        <span className={`text-[10px] ${prCfg.color}`}>
                          {prCfg.label}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 mt-2 pt-2 border-t border-border/50">
                        <span className="text-[10px] text-text-tertiary flex items-center gap-1">
                          <Phone size={9} /> {lead.llamadas_realizadas}
                        </span>
                        <span className="text-[10px] text-text-tertiary flex items-center gap-1">
                          <Mail size={9} /> {lead.emails_enviados}
                        </span>
                      </div>
                    </div>
                  );
                })}

                {stageLeads.length === 0 && (
                  <div className="flex items-center justify-center h-24 text-[11px] text-text-tertiary/50">
                    Drag leads here
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
