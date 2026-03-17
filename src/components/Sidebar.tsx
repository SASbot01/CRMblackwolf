"use client";

import {
  LayoutDashboard,
  Users,
  Building2,
  Kanban,
  Settings,
  Shield,
  Sparkles,
  LogOut,
} from "lucide-react";

interface SidebarUser {
  id: string;
  email: string;
  nombre: string;
  role: string;
}

interface SidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
  user: SidebarUser | null;
  onLogout: () => void;
}

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "contacts", label: "Contacts", icon: Users },
  { id: "companies", label: "Companies", icon: Building2 },
  { id: "deals", label: "Deals", icon: Kanban },
];

export default function Sidebar({ activeView, onViewChange, user, onLogout }: SidebarProps) {
  return (
    <aside className="w-[220px] h-screen flex flex-col border-r border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] flex-shrink-0">
      <div className="px-5 py-6 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/20">
          <Shield size={16} className="text-white" />
        </div>
        <div>
          <span className="text-sm font-semibold tracking-tight">BlackWolf</span>
          <span className="text-[10px] text-text-tertiary block -mt-0.5 font-medium">CRM</span>
        </div>
      </div>

      <nav className="flex-1 px-3 py-2">
        <div className="space-y-0.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-[rgba(249,115,22,0.1)] text-orange-400"
                    : "text-text-secondary hover:text-white hover:bg-surface-hover"
                }`}
              >
                <Icon size={16} className={isActive ? "text-orange-400" : ""} />
                {item.label}
              </button>
            );
          })}

          <div className="pt-3 pb-1 px-3">
            <div className="border-t border-border" />
          </div>

          <button
            onClick={() => onViewChange("agent")}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium transition-all duration-200 ${
              activeView === "agent"
                ? "bg-gradient-to-r from-orange-500/15 to-purple-500/10 text-orange-400 border border-orange-500/20"
                : "text-text-secondary hover:text-white hover:bg-surface-hover"
            }`}
          >
            <Sparkles
              size={16}
              className={activeView === "agent" ? "text-orange-400" : ""}
            />
            AI Agent
            <span className="ml-auto text-[9px] font-bold uppercase tracking-wider bg-orange-500/20 text-orange-400 px-1.5 py-0.5 rounded-md">
              AI
            </span>
          </button>

          <div className="pt-3 pb-1 px-3">
            <div className="border-t border-border" />
          </div>
        </div>
      </nav>

      <div className="px-3 pb-4">
        <button
          onClick={() => onViewChange("settings")}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium transition-colors ${
            activeView === "settings"
              ? "text-orange-400"
              : "text-text-tertiary hover:text-text-secondary"
          }`}
        >
          <Settings size={16} />
          Settings
        </button>

        {user && (
          <div className="mt-3 px-3 py-3 rounded-xl bg-surface border border-border">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center flex-shrink-0">
                <span className="text-[8px] font-bold text-white">
                  {user.nombre
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-medium text-text-secondary truncate">
                  {user.nombre}
                </p>
                <p className="text-[9px] text-text-tertiary truncate">{user.email}</p>
              </div>
            </div>
            <button
              onClick={onLogout}
              className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[11px] text-text-tertiary hover:text-red-400 hover:bg-red-400/5 transition-all"
            >
              <LogOut size={11} />
              Sign Out
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
