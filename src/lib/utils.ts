import { LeadStatus, LeadSource, LeadPriority } from "@/types/database";

export const STATUS_CONFIG: Record<LeadStatus, { label: string; color: string; bg: string }> = {
  nuevo: { label: "New", color: "text-blue-400", bg: "bg-blue-400/10 border-blue-400/20" },
  contactado: { label: "Contacted", color: "text-cyan-400", bg: "bg-cyan-400/10 border-cyan-400/20" },
  en_negociacion: { label: "In Negotiation", color: "text-orange-400", bg: "bg-orange-400/10 border-orange-400/20" },
  propuesta_enviada: { label: "Proposal Sent", color: "text-purple-400", bg: "bg-purple-400/10 border-purple-400/20" },
  ganado: { label: "Won", color: "text-emerald-400", bg: "bg-emerald-400/10 border-emerald-400/20" },
  perdido: { label: "Lost", color: "text-red-400", bg: "bg-red-400/10 border-red-400/20" },
};

export const SOURCE_CONFIG: Record<LeadSource, { label: string }> = {
  web: { label: "Web" },
  referido: { label: "Referral" },
  linkedin: { label: "LinkedIn" },
  cold_call: { label: "Cold Call" },
  evento: { label: "Event" },
  otro: { label: "Other" },
};

export const PRIORITY_CONFIG: Record<LeadPriority, { label: string; color: string }> = {
  baja: { label: "Low", color: "text-gray-400" },
  media: { label: "Medium", color: "text-yellow-400" },
  alta: { label: "High", color: "text-orange-400" },
  urgente: { label: "Urgent", color: "text-red-400" },
};

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
  }).format(value);
}

export function formatDate(date: string | null): string {
  if (!date) return "—";
  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

export function formatDateTime(date: string | null): string {
  if (!date) return "—";
  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

export function timeAgo(date: string | null): string {
  if (!date) return "Never";
  const now = new Date();
  const d = new Date(date);
  const diff = now.getTime() - d.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "Now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return formatDate(date);
}
