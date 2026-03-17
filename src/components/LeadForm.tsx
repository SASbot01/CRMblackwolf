"use client";

import { useState } from "react";
import { Lead, LeadStatus, LeadSource, LeadPriority } from "@/types/database";
import { STATUS_CONFIG, SOURCE_CONFIG, PRIORITY_CONFIG } from "@/lib/utils";
import { X } from "lucide-react";

interface LeadFormProps {
  onSubmit: (data: Omit<Lead, "id" | "created_at" | "updated_at">) => void;
  onClose: () => void;
}

export default function LeadForm({ onSubmit, onClose }: LeadFormProps) {
  const [form, setForm] = useState({
    nombre: "",
    empresa: "",
    email: "",
    telefono: "",
    cargo: "",
    status: "nuevo" as LeadStatus,
    source: "web" as LeadSource,
    prioridad: "media" as LeadPriority,
    valor_estimado: 0,
    notas: "",
    ultima_interaccion: null as string | null,
    proxima_accion: "",
    fecha_proxima_accion: "",
    llamadas_realizadas: 0,
    emails_enviados: 0,
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.nombre.trim() || !form.empresa.trim()) return;
    onSubmit({
      ...form,
      proxima_accion: form.proxima_accion || null,
      fecha_proxima_accion: form.fecha_proxima_accion || null,
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-[#0a0a0a] border border-border rounded-2xl overflow-hidden animate-scaleIn">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-base font-semibold">New Lead</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-surface-hover transition-colors"
          >
            <X size={16} className="text-text-tertiary" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-3">
            <FormField
              label="Name *"
              value={form.nombre}
              onChange={(v) => setForm({ ...form, nombre: v })}
              placeholder="John Doe"
            />
            <FormField
              label="Company *"
              value={form.empresa}
              onChange={(v) => setForm({ ...form, empresa: v })}
              placeholder="Acme Corp"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <FormField
              label="Email"
              value={form.email}
              onChange={(v) => setForm({ ...form, email: v })}
              placeholder="juan@acme.com"
              type="email"
            />
            <FormField
              label="Phone"
              value={form.telefono}
              onChange={(v) => setForm({ ...form, telefono: v })}
              placeholder="+34 600 000 000"
            />
          </div>

          <FormField
            label="Position"
            value={form.cargo}
            onChange={(v) => setForm({ ...form, cargo: v })}
            placeholder="CTO"
          />

          <div className="grid grid-cols-3 gap-3">
            <FormSelect
              label="Status"
              value={form.status}
              options={Object.entries(STATUS_CONFIG).map(([k, v]) => ({
                value: k,
                label: v.label,
              }))}
              onChange={(v) => setForm({ ...form, status: v as LeadStatus })}
            />
            <FormSelect
              label="Source"
              value={form.source}
              options={Object.entries(SOURCE_CONFIG).map(([k, v]) => ({
                value: k,
                label: v.label,
              }))}
              onChange={(v) => setForm({ ...form, source: v as LeadSource })}
            />
            <FormSelect
              label="Priority"
              value={form.prioridad}
              options={Object.entries(PRIORITY_CONFIG).map(([k, v]) => ({
                value: k,
                label: v.label,
              }))}
              onChange={(v) => setForm({ ...form, prioridad: v as LeadPriority })}
            />
          </div>

          <FormField
            label="Estimated Value (€)"
            value={form.valor_estimado.toString()}
            onChange={(v) =>
              setForm({ ...form, valor_estimado: parseInt(v) || 0 })
            }
            type="number"
            placeholder="0"
          />

          <div>
            <label className="block text-[11px] text-text-tertiary uppercase tracking-wider mb-1.5 font-medium">
              Notes
            </label>
            <textarea
              value={form.notas}
              onChange={(e) => setForm({ ...form, notas: e.target.value })}
              placeholder="Notes about the lead..."
              rows={3}
              className="w-full bg-surface border border-border rounded-xl py-2 px-3 text-[13px] text-white placeholder:text-text-tertiary focus:outline-none focus:border-orange-400/30 focus:ring-1 focus:ring-orange-400/10 transition-all resize-none"
            />
          </div>

          <FormField
            label="Next Action"
            value={form.proxima_accion}
            onChange={(v) => setForm({ ...form, proxima_accion: v })}
            placeholder="Call for presentation"
          />

          <FormField
            label="Next Action Date"
            value={form.fecha_proxima_accion}
            onChange={(v) => setForm({ ...form, fecha_proxima_accion: v })}
            type="date"
          />

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-[13px] text-text-secondary hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-[13px] font-medium bg-orange-500 hover:bg-orange-400 text-white transition-all duration-200 shadow-lg shadow-orange-500/20"
            >
              Create Lead
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function FormField({
  label,
  value,
  onChange,
  placeholder = "",
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div>
      <label className="block text-[11px] text-text-tertiary uppercase tracking-wider mb-1.5 font-medium">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-surface border border-border rounded-xl py-2 px-3 text-[13px] text-white placeholder:text-text-tertiary focus:outline-none focus:border-orange-400/30 focus:ring-1 focus:ring-orange-400/10 transition-all"
      />
    </div>
  );
}

function FormSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="block text-[11px] text-text-tertiary uppercase tracking-wider mb-1.5 font-medium">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-surface border border-border rounded-xl py-2 px-3 text-[13px] text-white focus:outline-none focus:border-orange-400/30 transition-all appearance-none cursor-pointer"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
