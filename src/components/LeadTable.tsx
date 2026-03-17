"use client";

import { useState } from "react";
import { Lead, LeadStatus, LeadSource, LeadPriority } from "@/types/database";
import {
  STATUS_CONFIG,
  SOURCE_CONFIG,
  PRIORITY_CONFIG,
  formatCurrency,
  timeAgo,
} from "@/lib/utils";
import {
  Search,
  Plus,
  Phone,
  Mail,
  SlidersHorizontal,
  ChevronDown,
  ArrowUpDown,
} from "lucide-react";

interface LeadTableProps {
  leads: Lead[];
  onSelectLead: (id: string) => void;
  onNewLead: () => void;
  filters: {
    status?: LeadStatus;
    source?: LeadSource;
    prioridad?: LeadPriority;
    search: string;
  };
  onFilterChange: (filters: LeadTableProps["filters"]) => void;
}

export default function LeadTable({
  leads,
  onSelectLead,
  onNewLead,
  filters,
  onFilterChange,
}: LeadTableProps) {
  const [showFilters, setShowFilters] = useState(false);
  const [sortField, setSortField] = useState<keyof Lead>("updated_at");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const sorted = [...leads].sort((a, b) => {
    const aVal = a[sortField];
    const bVal = b[sortField];
    if (aVal == null) return 1;
    if (bVal == null) return -1;
    const cmp = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
    return sortDir === "asc" ? cmp : -cmp;
  });

  function handleSort(field: keyof Lead) {
    if (sortField === field) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDir("desc");
    }
  }

  const SortHeader = ({
    field,
    children,
    className = "",
  }: {
    field: keyof Lead;
    children: React.ReactNode;
    className?: string;
  }) => (
    <th
      className={`text-left text-[11px] font-medium text-text-tertiary uppercase tracking-wider py-3 px-4 cursor-pointer hover:text-text-secondary transition-colors select-none ${className}`}
      onClick={() => handleSort(field)}
    >
      <span className="flex items-center gap-1">
        {children}
        {sortField === field && (
          <ArrowUpDown size={10} className="text-orange-400" />
        )}
      </span>
    </th>
  );

  return (
    <div className="animate-fadeIn">
      {/* Toolbar */}
      <div className="flex items-center gap-3 mb-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary"
          />
          <input
            type="text"
            placeholder="Search leads..."
            value={filters.search}
            onChange={(e) =>
              onFilterChange({ ...filters, search: e.target.value })
            }
            className="w-full bg-surface border border-border rounded-xl py-2 pl-9 pr-4 text-[13px] text-white placeholder:text-text-tertiary focus:outline-none focus:border-orange-400/30 focus:ring-1 focus:ring-orange-400/10 transition-all"
          />
        </div>

        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-3 py-2 rounded-xl text-[13px] border transition-all duration-200 ${
            showFilters
              ? "bg-orange-400/10 border-orange-400/20 text-orange-400"
              : "bg-surface border-border text-text-secondary hover:border-border-hover"
          }`}
        >
          <SlidersHorizontal size={14} />
          Filters
        </button>

        <button
          onClick={onNewLead}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-medium bg-orange-500 hover:bg-orange-400 text-white transition-all duration-200 shadow-lg shadow-orange-500/20"
        >
          <Plus size={14} />
          New Lead
        </button>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="flex items-center gap-3 mb-4 animate-fadeIn">
          <FilterSelect
            label="Status"
            value={filters.status || ""}
            options={Object.entries(STATUS_CONFIG).map(([k, v]) => ({
              value: k,
              label: v.label,
            }))}
            onChange={(v) =>
              onFilterChange({
                ...filters,
                status: (v || undefined) as LeadStatus | undefined,
              })
            }
          />
          <FilterSelect
            label="Source"
            value={filters.source || ""}
            options={Object.entries(SOURCE_CONFIG).map(([k, v]) => ({
              value: k,
              label: v.label,
            }))}
            onChange={(v) =>
              onFilterChange({
                ...filters,
                source: (v || undefined) as LeadSource | undefined,
              })
            }
          />
          <FilterSelect
            label="Priority"
            value={filters.prioridad || ""}
            options={Object.entries(PRIORITY_CONFIG).map(([k, v]) => ({
              value: k,
              label: v.label,
            }))}
            onChange={(v) =>
              onFilterChange({
                ...filters,
                prioridad: (v || undefined) as LeadPriority | undefined,
              })
            }
          />
          {(filters.status || filters.source || filters.prioridad) && (
            <button
              onClick={() =>
                onFilterChange({
                  search: filters.search,
                })
              }
              className="text-[11px] text-orange-400 hover:text-orange-300 transition-colors"
            >
              Clear filters
            </button>
          )}
        </div>
      )}

      {/* Table */}
      <div className="bg-surface border border-border rounded-2xl overflow-hidden">
        <table className="w-full">
          <thead className="border-b border-border">
            <tr>
              <SortHeader field="nombre" className="pl-5">
                Lead
              </SortHeader>
              <SortHeader field="status">Status</SortHeader>
              <SortHeader field="prioridad">Priority</SortHeader>
              <SortHeader field="valor_estimado">Value</SortHeader>
              <SortHeader field="source">Source</SortHeader>
              <th className="text-left text-[11px] font-medium text-text-tertiary uppercase tracking-wider py-3 px-4">
                Contact
              </th>
              <SortHeader field="ultima_interaccion">Last Contact</SortHeader>
              <SortHeader field="fecha_proxima_accion">Next Action</SortHeader>
            </tr>
          </thead>
          <tbody>
            {sorted.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  className="text-center py-16 text-text-tertiary text-[13px]"
                >
                  No leads found
                </td>
              </tr>
            ) : (
              sorted.map((lead, i) => {
                const statusCfg = STATUS_CONFIG[lead.status];
                const priorityCfg = PRIORITY_CONFIG[lead.prioridad];
                const sourceCfg = SOURCE_CONFIG[lead.source];
                return (
                  <tr
                    key={lead.id}
                    onClick={() => onSelectLead(lead.id)}
                    className="border-b border-border/50 last:border-0 cursor-pointer hover:bg-[rgba(249,115,22,0.03)] transition-colors duration-150 group"
                    style={{ animationDelay: `${i * 30}ms` }}
                  >
                    <td className="py-3 px-5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500/20 to-orange-600/10 flex items-center justify-center border border-orange-500/10 flex-shrink-0">
                          <span className="text-[10px] font-semibold text-orange-400">
                            {lead.nombre
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .slice(0, 2)}
                          </span>
                        </div>
                        <div>
                          <p className="text-[13px] font-medium group-hover:text-white transition-colors">
                            {lead.nombre}
                          </p>
                          <p className="text-[11px] text-text-tertiary">
                            {lead.cargo} · {lead.empresa}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`text-[11px] font-medium px-2 py-1 rounded-lg border ${statusCfg.bg}`}
                      >
                        {statusCfg.label}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`text-[12px] font-medium ${priorityCfg.color}`}>
                        {priorityCfg.label}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-[13px] font-medium">
                      {formatCurrency(lead.valor_estimado)}
                    </td>
                    <td className="py-3 px-4 text-[12px] text-text-secondary">
                      {sourceCfg.label}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-text-tertiary flex items-center gap-1">
                          <Phone size={10} /> {lead.llamadas_realizadas}
                        </span>
                        <span className="text-[11px] text-text-tertiary flex items-center gap-1">
                          <Mail size={10} /> {lead.emails_enviados}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-[12px] text-text-secondary">
                      {timeAgo(lead.ultima_interaccion)}
                    </td>
                    <td className="py-3 px-4">
                      {lead.proxima_accion ? (
                        <div>
                          <p className="text-[11px] text-text-secondary truncate max-w-[160px]">
                            {lead.proxima_accion}
                          </p>
                          <p className="text-[10px] text-text-tertiary">
                            {lead.fecha_proxima_accion
                              ? new Date(
                                  lead.fecha_proxima_accion
                                ).toLocaleDateString("en-US", {
                                  day: "numeric",
                                  month: "short",
                                })
                              : ""}
                          </p>
                        </div>
                      ) : (
                        <span className="text-[11px] text-text-tertiary">—</span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-3 text-[11px] text-text-tertiary text-right">
        {sorted.length} lead{sorted.length !== 1 ? "s" : ""}
      </div>
    </div>
  );
}

function FilterSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none bg-surface border border-border rounded-xl py-2 pl-3 pr-8 text-[12px] text-text-secondary focus:outline-none focus:border-orange-400/30 transition-all cursor-pointer hover:border-border-hover"
      >
        <option value="">{label}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <ChevronDown
        size={12}
        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-tertiary pointer-events-none"
      />
    </div>
  );
}
