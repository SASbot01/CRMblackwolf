"use client";

import { useState } from "react";
import { Commission, Expense, TeamMember, TeamRole } from "@/types/database";
import { formatCurrency } from "@/lib/utils";
import {
  DollarSign,
  Phone,
  MessageSquare,
  User,
  Plus,
  X,
  ChevronDown,
  Check,
  ArrowDownUp,
  Receipt,
  TrendingDown,
} from "lucide-react";

interface CommissionsProps {
  commissions: Commission[];
  expenses: Expense[];
  members: TeamMember[];
  onCreateCommission: (data: Omit<Commission, "id" | "created_at">) => void;
  onUpdateCommission: (id: string, data: Partial<Commission>) => void;
  onCreateExpense: (data: Omit<Expense, "id" | "created_at">) => void;
  onUpdateExpense: (id: string, data: Partial<Expense>) => void;
  onDeleteExpense: (id: string) => void;
}

const ROLE_LABELS: Record<TeamRole, string> = {
  director: "Director",
  manager: "Manager",
  closer: "Closer",
  setter: "Setter",
};

const EXPENSE_CATEGORIES: Record<Expense["category"], string> = {
  operational: "Operational",
  tools: "Tools & Software",
  marketing: "Marketing",
  payroll: "Payroll",
  other: "Other",
};

const EXPENSE_CATEGORY_COLORS: Record<Expense["category"], string> = {
  operational: "text-blue-400",
  tools: "text-purple-400",
  marketing: "text-orange-400",
  payroll: "text-emerald-400",
  other: "text-gray-400",
};

export default function Commissions({
  commissions,
  expenses,
  members,
  onCreateCommission,
  onUpdateCommission,
  onCreateExpense,
  onUpdateExpense,
  onDeleteExpense,
}: CommissionsProps) {
  const [activeTab, setActiveTab] = useState<"commissions" | "expenses">("commissions");
  const [period, setPeriod] = useState("2026-03");
  const [roleFilter, setRoleFilter] = useState<TeamRole | "">("");
  const [showNewCommission, setShowNewCommission] = useState(false);
  const [showNewExpense, setShowNewExpense] = useState(false);

  const [commForm, setCommForm] = useState({
    member_id: "",
    role: "closer" as TeamRole,
    cash_neto: 0,
    rate: 0,
    source_lead: "",
    status: "pending" as "paid" | "pending",
    payment_date: null as string | null,
  });

  const [expForm, setExpForm] = useState({
    concept: "",
    amount: 0,
    category: "operational" as Expense["category"],
    status: "pending" as "paid" | "pending",
    date: new Date().toISOString().split("T")[0],
    notes: "",
  });

  // Filter commissions
  const filtered = commissions
    .filter((c) => c.period === period)
    .filter((c) => !roleFilter || c.role === roleFilter);

  // Stats
  const totalCommissions = filtered.reduce((s, c) => s + c.commission_amount, 0);
  const closerTotal = filtered.filter((c) => c.role === "closer").reduce((s, c) => s + c.commission_amount, 0);
  const setterTotal = filtered.filter((c) => c.role === "setter").reduce((s, c) => s + c.commission_amount, 0);
  const directorTotal = filtered.filter((c) => c.role === "director" || c.role === "manager").reduce((s, c) => s + c.commission_amount, 0);
  const paidTotal = filtered.filter((c) => c.status === "paid").reduce((s, c) => s + c.commission_amount, 0);
  const pendingTotal = filtered.filter((c) => c.status === "pending").reduce((s, c) => s + c.commission_amount, 0);

  // Expense stats
  const periodExpenses = expenses.filter((e) => e.date.startsWith(period));
  const totalExpenses = periodExpenses.reduce((s, e) => s + e.amount, 0);
  const paidExpenses = periodExpenses.filter((e) => e.status === "paid").reduce((s, e) => s + e.amount, 0);
  const pendingExpenses = periodExpenses.filter((e) => e.status === "pending").reduce((s, e) => s + e.amount, 0);

  function getMemberName(id: string) {
    return members.find((m) => m.id === id)?.nombre || "Unknown";
  }

  function handleCreateCommission(e: React.FormEvent) {
    e.preventDefault();
    if (!commForm.member_id) return;
    const commission_amount = (commForm.cash_neto * commForm.rate) / 100;
    onCreateCommission({
      ...commForm,
      commission_amount,
      period,
    });
    setCommForm({ member_id: "", role: "closer", cash_neto: 0, rate: 0, source_lead: "", status: "pending", payment_date: null });
    setShowNewCommission(false);
  }

  function handleCreateExpense(e: React.FormEvent) {
    e.preventDefault();
    if (!expForm.concept.trim()) return;
    onCreateExpense(expForm);
    setExpForm({ concept: "", amount: 0, category: "operational", status: "pending", date: new Date().toISOString().split("T")[0], notes: "" });
    setShowNewExpense(false);
  }

  const monthLabel = new Date(period + "-01").toLocaleDateString("en-US", { month: "long", year: "numeric" });

  return (
    <div className="animate-fadeIn">
      {/* Period & Tabs */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <input
            type="month"
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="bg-surface border border-border rounded-xl py-2 px-3 text-[13px] text-white focus:outline-none focus:border-orange-400/30 transition-all cursor-pointer"
          />
          <div className="flex bg-surface border border-border rounded-xl overflow-hidden">
            <button
              onClick={() => setActiveTab("commissions")}
              className={`px-4 py-2 text-[12px] font-medium transition-all ${
                activeTab === "commissions"
                  ? "bg-orange-500/15 text-orange-400"
                  : "text-text-secondary hover:text-white"
              }`}
            >
              Commissions
            </button>
            <button
              onClick={() => setActiveTab("expenses")}
              className={`px-4 py-2 text-[12px] font-medium transition-all ${
                activeTab === "expenses"
                  ? "bg-orange-500/15 text-orange-400"
                  : "text-text-secondary hover:text-white"
              }`}
            >
              Expenses
            </button>
          </div>
        </div>

        <button
          onClick={() => activeTab === "commissions" ? setShowNewCommission(true) : setShowNewExpense(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-medium bg-orange-500 hover:bg-orange-400 text-white transition-all shadow-lg shadow-orange-500/20"
        >
          <Plus size={14} />
          {activeTab === "commissions" ? "Add Commission" : "Add Expense"}
        </button>
      </div>

      {activeTab === "commissions" ? (
        <>
          {/* Commission Stats */}
          <div className="grid grid-cols-6 gap-3 mb-6">
            <StatCard icon={<DollarSign size={14} />} label="Total Commissions" value={formatCurrency(totalCommissions)} accent />
            <StatCard icon={<Phone size={14} />} label="Closers" value={formatCurrency(closerTotal)} />
            <StatCard icon={<MessageSquare size={14} />} label="Setters" value={formatCurrency(setterTotal)} />
            <StatCard icon={<User size={14} />} label="Managers/Directors" value={formatCurrency(directorTotal)} />
            <StatCard icon={<Check size={14} />} label="Paid" value={formatCurrency(paidTotal)} color="text-emerald-400" />
            <StatCard icon={<ArrowDownUp size={14} />} label="Pending" value={formatCurrency(pendingTotal)} color="text-yellow-400" />
          </div>

          {/* Role Filter */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setRoleFilter("")}
              className={`px-3 py-1.5 rounded-lg text-[12px] font-medium border transition-all ${
                !roleFilter
                  ? "bg-orange-400/10 border-orange-400/20 text-orange-400"
                  : "border-border text-text-tertiary hover:text-white hover:border-border-hover"
              }`}
            >
              All
            </button>
            {(Object.keys(ROLE_LABELS) as TeamRole[]).map((role) => (
              <button
                key={role}
                onClick={() => setRoleFilter(roleFilter === role ? "" : role)}
                className={`px-3 py-1.5 rounded-lg text-[12px] font-medium border transition-all ${
                  roleFilter === role
                    ? "bg-orange-400/10 border-orange-400/20 text-orange-400"
                    : "border-border text-text-tertiary hover:text-white hover:border-border-hover"
                }`}
              >
                {ROLE_LABELS[role]}
              </button>
            ))}
          </div>

          {/* New Commission Form */}
          {showNewCommission && (
            <div className="bg-surface border border-border rounded-2xl p-5 mb-4 animate-scaleIn">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold">New Commission</h3>
                <button onClick={() => setShowNewCommission(false)} className="p-1 hover:bg-surface-hover rounded-lg transition-colors">
                  <X size={14} className="text-text-tertiary" />
                </button>
              </div>
              <form onSubmit={handleCreateCommission} className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] text-text-tertiary uppercase tracking-wider mb-1.5 font-medium">Member</label>
                  <select
                    value={commForm.member_id}
                    onChange={(e) => {
                      const m = members.find((m) => m.id === e.target.value);
                      setCommForm({ ...commForm, member_id: e.target.value, rate: m?.base_rate || 0 });
                    }}
                    className="w-full bg-[rgba(255,255,255,0.03)] border border-border rounded-xl py-2 px-3 text-[13px] text-white focus:outline-none focus:border-orange-400/30 transition-all appearance-none cursor-pointer"
                  >
                    <option value="">Select member</option>
                    {members.map((m) => (
                      <option key={m.id} value={m.id}>{m.nombre}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] text-text-tertiary uppercase tracking-wider mb-1.5 font-medium">Role</label>
                  <select
                    value={commForm.role}
                    onChange={(e) => setCommForm({ ...commForm, role: e.target.value as TeamRole })}
                    className="w-full bg-[rgba(255,255,255,0.03)] border border-border rounded-xl py-2 px-3 text-[13px] text-white focus:outline-none focus:border-orange-400/30 transition-all appearance-none cursor-pointer"
                  >
                    {(Object.keys(ROLE_LABELS) as TeamRole[]).map((r) => (
                      <option key={r} value={r}>{ROLE_LABELS[r]}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] text-text-tertiary uppercase tracking-wider mb-1.5 font-medium">Source / Lead</label>
                  <input
                    type="text"
                    value={commForm.source_lead}
                    onChange={(e) => setCommForm({ ...commForm, source_lead: e.target.value })}
                    placeholder="Deal name"
                    className="w-full bg-[rgba(255,255,255,0.03)] border border-border rounded-xl py-2 px-3 text-[13px] text-white placeholder:text-text-tertiary focus:outline-none focus:border-orange-400/30 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-text-tertiary uppercase tracking-wider mb-1.5 font-medium">Net Cash (€)</label>
                  <input
                    type="number"
                    value={commForm.cash_neto}
                    onChange={(e) => setCommForm({ ...commForm, cash_neto: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-[rgba(255,255,255,0.03)] border border-border rounded-xl py-2 px-3 text-[13px] text-white focus:outline-none focus:border-orange-400/30 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-text-tertiary uppercase tracking-wider mb-1.5 font-medium">Rate (%)</label>
                  <input
                    type="number"
                    value={commForm.rate}
                    onChange={(e) => setCommForm({ ...commForm, rate: parseFloat(e.target.value) || 0 })}
                    min="0"
                    max="100"
                    className="w-full bg-[rgba(255,255,255,0.03)] border border-border rounded-xl py-2 px-3 text-[13px] text-white focus:outline-none focus:border-orange-400/30 transition-all"
                  />
                </div>
                <div className="flex items-end">
                  <div className="w-full bg-surface border border-border rounded-xl py-2 px-3">
                    <p className="text-[10px] text-text-tertiary">Commission</p>
                    <p className="text-[14px] font-semibold text-orange-400">
                      {formatCurrency((commForm.cash_neto * commForm.rate) / 100)}
                    </p>
                  </div>
                </div>
                <div className="col-span-3 flex justify-end gap-2 pt-2">
                  <button type="button" onClick={() => setShowNewCommission(false)} className="px-4 py-2 rounded-xl text-[13px] text-text-secondary hover:text-white transition-colors">Cancel</button>
                  <button type="submit" className="px-5 py-2 rounded-xl text-[13px] font-medium bg-orange-500 hover:bg-orange-400 text-white transition-all shadow-lg shadow-orange-500/20">Add Commission</button>
                </div>
              </form>
            </div>
          )}

          {/* Commissions Table */}
          <div className="bg-surface border border-border rounded-2xl overflow-hidden">
            <table className="w-full">
              <thead className="border-b border-border">
                <tr>
                  <th className="text-left text-[11px] font-medium text-text-tertiary uppercase tracking-wider py-3 px-5">Name</th>
                  <th className="text-left text-[11px] font-medium text-text-tertiary uppercase tracking-wider py-3 px-4">Role</th>
                  <th className="text-left text-[11px] font-medium text-text-tertiary uppercase tracking-wider py-3 px-4">Net Cash</th>
                  <th className="text-left text-[11px] font-medium text-text-tertiary uppercase tracking-wider py-3 px-4">Rate</th>
                  <th className="text-left text-[11px] font-medium text-text-tertiary uppercase tracking-wider py-3 px-4">Commission</th>
                  <th className="text-left text-[11px] font-medium text-text-tertiary uppercase tracking-wider py-3 px-4">Source</th>
                  <th className="text-left text-[11px] font-medium text-text-tertiary uppercase tracking-wider py-3 px-4">Status</th>
                  <th className="text-left text-[11px] font-medium text-text-tertiary uppercase tracking-wider py-3 px-4">Payment</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-12 text-text-tertiary text-[13px]">
                      No commissions for this period
                    </td>
                  </tr>
                ) : (
                  filtered.map((comm) => (
                    <tr key={comm.id} className="border-b border-border/50 last:border-0 hover:bg-[rgba(249,115,22,0.03)] transition-colors">
                      <td className="py-3 px-5">
                        <span className="text-[13px] font-medium">{getMemberName(comm.member_id)}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-[11px] font-medium px-2 py-1 rounded-lg border bg-surface border-border">
                          {ROLE_LABELS[comm.role]}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-[13px] text-text-secondary">{formatCurrency(comm.cash_neto)}</td>
                      <td className="py-3 px-4 text-[13px] text-text-secondary">{comm.rate}%</td>
                      <td className="py-3 px-4 text-[13px] font-semibold text-orange-400">{formatCurrency(comm.commission_amount)}</td>
                      <td className="py-3 px-4 text-[12px] text-text-tertiary">{comm.source_lead || "—"}</td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => onUpdateCommission(comm.id, { status: comm.status === "paid" ? "pending" : "paid", payment_date: comm.status === "pending" ? new Date().toISOString() : null })}
                          className={`text-[11px] font-medium px-2 py-1 rounded-lg border cursor-pointer transition-all ${
                            comm.status === "paid"
                              ? "bg-emerald-400/10 text-emerald-400 border-emerald-400/20"
                              : "bg-yellow-400/10 text-yellow-400 border-yellow-400/20"
                          }`}
                        >
                          {comm.status === "paid" ? "Paid" : "Pending"}
                        </button>
                      </td>
                      <td className="py-3 px-4 text-[12px] text-text-tertiary">
                        {comm.payment_date
                          ? new Date(comm.payment_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                          : "—"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <>
          {/* Expense Stats */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            <StatCard icon={<Receipt size={14} />} label="Total Expenses" value={formatCurrency(totalExpenses)} accent />
            <StatCard icon={<Check size={14} />} label="Paid" value={formatCurrency(paidExpenses)} color="text-emerald-400" />
            <StatCard icon={<TrendingDown size={14} />} label="Pending" value={formatCurrency(pendingExpenses)} color="text-yellow-400" />
          </div>

          {/* New Expense Form */}
          {showNewExpense && (
            <div className="bg-surface border border-border rounded-2xl p-5 mb-4 animate-scaleIn">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold">New Expense</h3>
                <button onClick={() => setShowNewExpense(false)} className="p-1 hover:bg-surface-hover rounded-lg transition-colors">
                  <X size={14} className="text-text-tertiary" />
                </button>
              </div>
              <form onSubmit={handleCreateExpense} className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] text-text-tertiary uppercase tracking-wider mb-1.5 font-medium">Concept *</label>
                  <input
                    type="text"
                    value={expForm.concept}
                    onChange={(e) => setExpForm({ ...expForm, concept: e.target.value })}
                    placeholder="Office rent, Software..."
                    className="w-full bg-[rgba(255,255,255,0.03)] border border-border rounded-xl py-2 px-3 text-[13px] text-white placeholder:text-text-tertiary focus:outline-none focus:border-orange-400/30 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-text-tertiary uppercase tracking-wider mb-1.5 font-medium">Amount (€)</label>
                  <input
                    type="number"
                    value={expForm.amount}
                    onChange={(e) => setExpForm({ ...expForm, amount: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-[rgba(255,255,255,0.03)] border border-border rounded-xl py-2 px-3 text-[13px] text-white focus:outline-none focus:border-orange-400/30 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-text-tertiary uppercase tracking-wider mb-1.5 font-medium">Category</label>
                  <select
                    value={expForm.category}
                    onChange={(e) => setExpForm({ ...expForm, category: e.target.value as Expense["category"] })}
                    className="w-full bg-[rgba(255,255,255,0.03)] border border-border rounded-xl py-2 px-3 text-[13px] text-white focus:outline-none focus:border-orange-400/30 transition-all appearance-none cursor-pointer"
                  >
                    {Object.entries(EXPENSE_CATEGORIES).map(([k, v]) => (
                      <option key={k} value={k}>{v}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] text-text-tertiary uppercase tracking-wider mb-1.5 font-medium">Date</label>
                  <input
                    type="date"
                    value={expForm.date}
                    onChange={(e) => setExpForm({ ...expForm, date: e.target.value })}
                    className="w-full bg-[rgba(255,255,255,0.03)] border border-border rounded-xl py-2 px-3 text-[13px] text-white focus:outline-none focus:border-orange-400/30 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-text-tertiary uppercase tracking-wider mb-1.5 font-medium">Status</label>
                  <select
                    value={expForm.status}
                    onChange={(e) => setExpForm({ ...expForm, status: e.target.value as "paid" | "pending" })}
                    className="w-full bg-[rgba(255,255,255,0.03)] border border-border rounded-xl py-2 px-3 text-[13px] text-white focus:outline-none focus:border-orange-400/30 transition-all appearance-none cursor-pointer"
                  >
                    <option value="pending">Pending</option>
                    <option value="paid">Paid</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] text-text-tertiary uppercase tracking-wider mb-1.5 font-medium">Notes</label>
                  <input
                    type="text"
                    value={expForm.notes}
                    onChange={(e) => setExpForm({ ...expForm, notes: e.target.value })}
                    placeholder="Optional notes..."
                    className="w-full bg-[rgba(255,255,255,0.03)] border border-border rounded-xl py-2 px-3 text-[13px] text-white placeholder:text-text-tertiary focus:outline-none focus:border-orange-400/30 transition-all"
                  />
                </div>
                <div className="col-span-3 flex justify-end gap-2 pt-2">
                  <button type="button" onClick={() => setShowNewExpense(false)} className="px-4 py-2 rounded-xl text-[13px] text-text-secondary hover:text-white transition-colors">Cancel</button>
                  <button type="submit" className="px-5 py-2 rounded-xl text-[13px] font-medium bg-orange-500 hover:bg-orange-400 text-white transition-all shadow-lg shadow-orange-500/20">Add Expense</button>
                </div>
              </form>
            </div>
          )}

          {/* Expenses Table */}
          <div className="bg-surface border border-border rounded-2xl overflow-hidden">
            <table className="w-full">
              <thead className="border-b border-border">
                <tr>
                  <th className="text-left text-[11px] font-medium text-text-tertiary uppercase tracking-wider py-3 px-5">Concept</th>
                  <th className="text-left text-[11px] font-medium text-text-tertiary uppercase tracking-wider py-3 px-4">Category</th>
                  <th className="text-left text-[11px] font-medium text-text-tertiary uppercase tracking-wider py-3 px-4">Amount</th>
                  <th className="text-left text-[11px] font-medium text-text-tertiary uppercase tracking-wider py-3 px-4">Date</th>
                  <th className="text-left text-[11px] font-medium text-text-tertiary uppercase tracking-wider py-3 px-4">Notes</th>
                  <th className="text-left text-[11px] font-medium text-text-tertiary uppercase tracking-wider py-3 px-4">Status</th>
                  <th className="text-left text-[11px] font-medium text-text-tertiary uppercase tracking-wider py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {periodExpenses.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-text-tertiary text-[13px]">
                      No expenses for this period
                    </td>
                  </tr>
                ) : (
                  periodExpenses.map((exp) => (
                    <tr key={exp.id} className="border-b border-border/50 last:border-0 hover:bg-[rgba(249,115,22,0.03)] transition-colors">
                      <td className="py-3 px-5 text-[13px] font-medium">{exp.concept}</td>
                      <td className="py-3 px-4">
                        <span className={`text-[12px] font-medium ${EXPENSE_CATEGORY_COLORS[exp.category]}`}>
                          {EXPENSE_CATEGORIES[exp.category]}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-[13px] font-semibold text-red-400">{formatCurrency(exp.amount)}</td>
                      <td className="py-3 px-4 text-[12px] text-text-secondary">
                        {new Date(exp.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </td>
                      <td className="py-3 px-4 text-[12px] text-text-tertiary max-w-[200px] truncate">{exp.notes || "—"}</td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => onUpdateExpense(exp.id, { status: exp.status === "paid" ? "pending" : "paid" })}
                          className={`text-[11px] font-medium px-2 py-1 rounded-lg border cursor-pointer transition-all ${
                            exp.status === "paid"
                              ? "bg-emerald-400/10 text-emerald-400 border-emerald-400/20"
                              : "bg-yellow-400/10 text-yellow-400 border-yellow-400/20"
                          }`}
                        >
                          {exp.status === "paid" ? "Paid" : "Pending"}
                        </button>
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => onDeleteExpense(exp.id)}
                          className="text-[11px] text-text-tertiary hover:text-red-400 transition-colors"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  accent = false,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  accent?: boolean;
  color?: string;
}) {
  return (
    <div className="bg-surface border border-border rounded-2xl p-4 hover:border-border-hover transition-all">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] text-text-tertiary font-medium uppercase tracking-wider">
          {label}
        </span>
        <span className={color || (accent ? "text-orange-400" : "text-text-tertiary")}>{icon}</span>
      </div>
      <p className={`text-xl font-semibold ${color || (accent ? "text-orange-400" : "text-white")}`}>
        {value}
      </p>
    </div>
  );
}
