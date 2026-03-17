"use client";

import { useState, useEffect } from "react";
import { apiGetDashboard } from "@/lib/api";
import { formatCurrency, timeAgo, PRIORITY_COLORS, ACTIVITY_ICONS } from "@/lib/utils";
import {
  Users,
  Building2,
  TrendingUp,
  Trophy,
  DollarSign,
  ArrowUpRight,
  Phone,
  Mail,
  Calendar,
  FileText,
  CheckSquare,
} from "lucide-react";

interface DashboardData {
  total_contacts: number;
  total_companies: number;
  active_deals: number;
  pipeline_value: number;
  won_revenue: number;
  recent_deals: Array<{
    id: string;
    title: string;
    value: number;
    priority: string;
    updated_at: string;
    contact?: { first_name: string; last_name: string };
    company?: { name: string };
    stage?: { name: string; color: string };
  }>;
  recent_activities: Array<{
    id: string;
    type: string;
    title: string;
    created_at: string;
  }>;
}

interface DashboardProps {
  onViewChange?: (view: string) => void;
}

const ACTIVITY_TYPE_ICONS: Record<string, typeof Phone> = {
  call: Phone,
  email: Mail,
  meeting: Calendar,
  note: FileText,
  task: CheckSquare,
};

export default function Dashboard({ onViewChange }: DashboardProps) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGetDashboard()
      .then((d) => setData(d))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="animate-fadeIn">
        <div className="grid grid-cols-5 gap-3 mb-6">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-surface border border-border rounded-2xl p-4 h-24 animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-surface border border-border rounded-2xl p-5 h-64 animate-pulse" />
          <div className="bg-surface border border-border rounded-2xl p-5 h-64 animate-pulse" />
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="animate-fadeIn flex items-center justify-center h-64">
        <p className="text-text-tertiary text-sm">Unable to load dashboard data</p>
      </div>
    );
  }

  const stats = [
    { label: "Total Contacts", value: data.total_contacts, icon: Users, accent: false },
    { label: "Total Companies", value: data.total_companies, icon: Building2, accent: false },
    { label: "Active Deals", value: data.active_deals, icon: TrendingUp, accent: false },
    { label: "Pipeline Value", value: formatCurrency(data.pipeline_value || 0), icon: DollarSign, accent: false },
    { label: "Won Revenue", value: formatCurrency(data.won_revenue || 0), icon: Trophy, accent: true },
  ];

  return (
    <div className="animate-fadeIn">
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

      <div className="grid grid-cols-2 gap-4">
        {/* Recent Deals */}
        <div className="bg-surface border border-border rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <TrendingUp size={14} className="text-orange-400" />
              Recent Deals
            </h3>
            {onViewChange && (
              <button
                onClick={() => onViewChange("deals")}
                className="text-[11px] text-orange-400 hover:text-orange-300 transition-colors"
              >
                View all
              </button>
            )}
          </div>
          <div className="space-y-1">
            {(!data.recent_deals || data.recent_deals.length === 0) ? (
              <p className="text-[13px] text-text-tertiary py-4 text-center">
                No deals yet
              </p>
            ) : (
              data.recent_deals.map((deal, i) => (
                <div
                  key={deal.id}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-surface-hover transition-all duration-200 group"
                  style={{ animationDelay: `${i * 50}ms` }}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[13px] font-medium truncate">
                        {deal.title}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      {deal.contact && (
                        <span className="text-[11px] text-text-tertiary truncate">
                          {deal.contact.first_name} {deal.contact.last_name}
                        </span>
                      )}
                      {deal.company && (
                        <span className="text-[11px] text-text-tertiary truncate">
                          {deal.contact ? "·" : ""} {deal.company.name}
                        </span>
                      )}
                    </div>
                  </div>
                  {deal.stage && (
                    <span
                      className="text-[10px] font-medium px-2 py-0.5 rounded-md border flex-shrink-0"
                      style={{
                        backgroundColor: `${deal.stage.color}15`,
                        borderColor: `${deal.stage.color}30`,
                        color: deal.stage.color,
                      }}
                    >
                      {deal.stage.name}
                    </span>
                  )}
                  <div className="text-right flex-shrink-0">
                    <p className="text-[13px] font-medium text-text-secondary">
                      {formatCurrency(deal.value || 0)}
                    </p>
                    <p className="text-[10px] text-text-tertiary">
                      {timeAgo(deal.updated_at)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Activities */}
        <div className="bg-surface border border-border rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <CheckSquare size={14} className="text-orange-400" />
              Recent Activities
            </h3>
          </div>
          <div className="space-y-1">
            {(!data.recent_activities || data.recent_activities.length === 0) ? (
              <p className="text-[13px] text-text-tertiary py-4 text-center">
                No activities yet
              </p>
            ) : (
              data.recent_activities.map((activity, i) => {
                const activityConfig = ACTIVITY_ICONS[activity.type] || { label: activity.type, color: "text-text-secondary" };
                const ActivityIcon = ACTIVITY_TYPE_ICONS[activity.type] || FileText;
                return (
                  <div
                    key={activity.id}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-surface-hover transition-all duration-200"
                    style={{ animationDelay: `${i * 50}ms` }}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-surface border border-border`}>
                      <ActivityIcon size={14} className={activityConfig.color} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-medium truncate">{activity.title}</p>
                      <p className="text-[11px] text-text-tertiary capitalize">{activityConfig.label}</p>
                    </div>
                    <span className="text-[10px] text-text-tertiary flex-shrink-0">
                      {timeAgo(activity.created_at)}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
