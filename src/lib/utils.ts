export function formatCurrency(value: number): string {
  if (Math.abs(value) >= 1_000_000) {
    return `€${(value / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  }
  if (Math.abs(value) >= 10_000) {
    return `€${(value / 1_000).toFixed(0)}K`;
  }
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
  }).format(value);
}

export function formatDate(date: string | null): string {
  if (!date) return "—";
  return new Intl.DateTimeFormat("es-ES", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

export function formatDateTime(date: string | null): string {
  if (!date) return "—";
  return new Intl.DateTimeFormat("es-ES", {
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
  if (minutes < 60) return `${minutes}m`;
  if (hours < 24) return `${hours}h`;
  if (days < 7) return `${days}d`;
  return formatDate(date);
}

export const PRIORITY_COLORS: Record<string, { label: string; color: string; bg: string }> = {
  low: { label: "Low", color: "text-gray-400", bg: "bg-gray-400/10 border-gray-400/20" },
  medium: { label: "Medium", color: "text-yellow-400", bg: "bg-yellow-400/10 border-yellow-400/20" },
  high: { label: "High", color: "text-orange-400", bg: "bg-orange-400/10 border-orange-400/20" },
  urgent: { label: "Urgent", color: "text-red-400", bg: "bg-red-400/10 border-red-400/20" },
};

export const ACTIVITY_ICONS: Record<string, { label: string; color: string }> = {
  call: { label: "Call", color: "text-green-400" },
  email: { label: "Email", color: "text-blue-400" },
  meeting: { label: "Meeting", color: "text-purple-400" },
  note: { label: "Note", color: "text-yellow-400" },
  task: { label: "Task", color: "text-cyan-400" },
};
