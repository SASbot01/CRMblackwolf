"use client";

import { useState } from "react";
import { Shield, Eye, EyeOff, ArrowRight, Loader2 } from "lucide-react";

interface LoginScreenProps {
  onLogin: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
}

export default function LoginScreen({ onLogin }: LoginScreenProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }
    setError("");
    setLoading(true);

    const result = await onLogin(email, password);
    if (!result.success) {
      setError(result.error || "Login failed");
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center relative overflow-hidden">
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.018) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.018) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(249,115,22,0.06) 0%, transparent 70%)",
        }}
      />

      <div className="relative w-full max-w-[400px] px-6 animate-fadeIn">
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-2xl shadow-orange-500/20 mb-5">
            <Shield size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">BlackWolf CRM</h1>
          <p className="text-sm text-text-tertiary mt-1">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] text-text-tertiary uppercase tracking-wider mb-1.5 font-medium">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@email.com"
              autoComplete="email"
              className="w-full bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] rounded-xl py-3 px-4 text-[14px] text-white placeholder:text-text-tertiary focus:outline-none focus:border-orange-400/40 focus:ring-1 focus:ring-orange-400/10 transition-all"
            />
          </div>

          <div>
            <label className="block text-[11px] text-text-tertiary uppercase tracking-wider mb-1.5 font-medium">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                className="w-full bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] rounded-xl py-3 px-4 pr-11 text-[14px] text-white placeholder:text-text-tertiary focus:outline-none focus:border-orange-400/40 focus:ring-1 focus:ring-orange-400/10 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-text-tertiary hover:text-text-secondary transition-colors"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2.5 animate-scaleIn">
              <p className="text-[13px] text-red-400">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-[14px] font-semibold bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 text-white transition-all duration-300 shadow-lg shadow-orange-500/20 hover:shadow-orange-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <>
                Sign In
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.06)] rounded-xl p-4">
          <p className="text-[11px] text-text-tertiary uppercase tracking-wider font-medium mb-3">
            Demo Accounts
          </p>
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => {
                setEmail("admin@blackwolfsec.io");
                setPassword("blackwolf2026");
              }}
              className="w-full text-left p-2.5 rounded-lg hover:bg-[rgba(255,255,255,0.04)] transition-colors group"
            >
              <p className="text-[12px] font-medium text-text-secondary group-hover:text-white transition-colors">
                Admin — admin@blackwolfsec.io
              </p>
              <p className="text-[11px] text-text-tertiary">blackwolf2026</p>
            </button>
            <button
              type="button"
              onClick={() => {
                setEmail("demo@blackwolfsec.io");
                setPassword("demo1234");
              }}
              className="w-full text-left p-2.5 rounded-lg hover:bg-[rgba(255,255,255,0.04)] transition-colors group"
            >
              <p className="text-[12px] font-medium text-text-secondary group-hover:text-white transition-colors">
                Demo — demo@blackwolfsec.io
              </p>
              <p className="text-[11px] text-text-tertiary">demo1234</p>
            </button>
          </div>
        </div>

        <p className="text-center text-[11px] text-text-tertiary mt-8">
          BlackWolfSec.io — Cybersecurity & Development
        </p>
      </div>
    </div>
  );
}
