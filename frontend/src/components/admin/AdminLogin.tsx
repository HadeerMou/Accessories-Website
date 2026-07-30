"use client";

import type * as React from "react";
import { useState } from "react";
import { API_BASE } from "@/lib/admin/api";

export function AdminLogin({ onLogin }: { onLogin: (token: string) => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const base = API_BASE;
      const response = await fetch(`${base}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error ?? "Unable to sign in");
      if (body.data.user.role !== "ADMIN")
        throw new Error("This account does not have administrator access");
      onLogin(body.data.accessToken);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to sign in");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="grid min-h-screen bg-[#1f2b25] p-5 lg:grid-cols-2">
      <div className="hidden flex-col justify-between rounded-3xl bg-[radial-gradient(circle_at_20%_10%,#657b69,transparent_40%),linear-gradient(145deg,#31483c,#18221d)] p-12 text-white lg:flex">
        <div className="font-serif text-3xl tracking-[.2em]">AURA</div>
        <div>
          <div className="mb-5 h-px w-12 bg-[#d3b47b]" />
          <h1 className="max-w-lg font-serif text-5xl leading-tight">
            Your store,
            <br />
            beautifully managed.
          </h1>
          <p className="mt-5 max-w-md text-sm leading-6 text-white/50">
            Orders, inventory, customers, and revenue in one calm workspace.
          </p>
        </div>
        <div className="text-[10px] uppercase tracking-[.2em] text-white/30">
          Aura administration · Cairo
        </div>
      </div>
      <div className="grid place-items-center">
        <form
          onSubmit={submit}
          className="w-full max-w-md rounded-3xl bg-[#faf9f6] p-8 shadow-2xl sm:p-10"
        >
          <div className="font-serif text-2xl tracking-[.18em] lg:hidden">
            AURA
          </div>
          <div className="mt-8 lg:mt-0">
            <div className="text-[10px] font-bold uppercase tracking-[.2em] text-[#98784c]">
              Secure workspace
            </div>
            <h2 className="mt-3 font-serif text-3xl">Welcome back</h2>
            <p className="mt-2 text-sm text-black/40">
              Sign in with your administrator account.
            </p>
          </div>
          <div className="mt-8 space-y-4">
            <label className="block text-xs font-semibold">
              Email address
              <input
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-2 h-12 w-full rounded-lg border border-black/10 bg-white px-4 font-normal outline-none focus:border-[#667d6b]"
                placeholder="admin@aura.com"
              />
            </label>
            <label className="block text-xs font-semibold">
              Password
              <input
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="mt-2 h-12 w-full rounded-lg border border-black/10 bg-white px-4 font-normal outline-none focus:border-[#667d6b]"
                placeholder="••••••••"
              />
            </label>
          </div>
          {error && (
            <div className="mt-4 rounded-lg bg-rose-50 px-3 py-2.5 text-xs text-rose-700">
              {error}
            </div>
          )}
          <button
            disabled={loading}
            className="mt-6 h-12 w-full rounded-lg bg-[#24352c] text-xs font-semibold text-white disabled:opacity-50"
          >
            {loading ? "Signing in…" : "Sign in to dashboard"}
          </button>
          <p className="mt-6 text-center text-[10px] leading-4 text-black/35">
            Administrator access only. Activity may be logged for security.
          </p>
        </form>
      </div>
    </div>
  );
}
