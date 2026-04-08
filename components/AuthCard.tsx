"use client";

import { Dispatch, SetStateAction } from "react";

type Props = {
  mode?: "login" | "signup";

  email: string;
  setEmail: Dispatch<SetStateAction<string>>;

  password: string;
  setPassword: Dispatch<SetStateAction<string>>;

  full_name: string;
  setFullName: Dispatch<SetStateAction<string>>;

  username: string;
  setUsername: Dispatch<SetStateAction<string>>;

  acceptTerms: boolean;
  setAcceptTerms: Dispatch<SetStateAction<boolean>>;

  onRegister: (e: React.FormEvent) => void;
  onLogin?: (e: React.FormEvent) => void;

  error: string;
  loading: boolean;
};

function isStaffEmail(email?: string) {
  const e = (email || "").toLowerCase().trim();
  return e.endsWith("@admin.feelup") || e.endsWith("@psychologist.feelup");
}

export default function AuthCard({
  mode = "signup",

  email,
  setEmail,
  password,
  setPassword,
  full_name,
  setFullName,
  username,
  setUsername,
  acceptTerms,
  setAcceptTerms,

  onRegister,
  onLogin,

  error,
  loading,
}: Props) {
  const isSignup = mode === "signup";
  const staffTyped = isStaffEmail(email);

  return (
    <div className="glass rounded-[2rem] p-8 border border-[var(--card-border)] bg-[var(--card-bg)] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)]">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-[var(--brand-blue)] to-[var(--brand-pink)] text-white shadow-lg mb-4">
          <span className="font-bold text-xl tracking-tight">F</span>
        </div>
        <h2 className="text-2xl font-bold text-[var(--foreground)] tracking-tight">
          {isSignup ? "Create your account" : "Welcome back"}
        </h2>
        <p className="text-sm text-[var(--feelup-muted)] mt-1.5 font-medium">
          {isSignup ? "Start your wellness journey today" : "Sign in to continue your journey"}
        </p>
      </div>

      <form onSubmit={isSignup ? onRegister : onLogin} className="space-y-5">
        {/* FULL NAME (Signup only) */}
        {isSignup && (
          <div>
            <label className="block text-[13px] font-semibold text-[var(--foreground)] mb-1.5 pl-1">Full name</label>
            <input
              type="text"
              placeholder="e.g. Jane Doe"
              className="input-field"
              value={full_name}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>
        )}

        {/* USERNAME (Signup only) */}
        {isSignup && (
          <div>
            <label className="block text-[13px] font-semibold text-[var(--foreground)] mb-1.5 pl-1">Username</label>
            <input
              type="text"
              placeholder="e.g. janedoe"
              className="input-field"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
        )}

        {/* EMAIL */}
        <div>
          <label className="block text-[13px] font-semibold text-[var(--foreground)] mb-1.5 pl-1">Email address</label>
          <input
            type="email"
            placeholder="you@example.com"
            className="input-field"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        {/* PASSWORD */}
        <div>
          <label className="block text-[13px] font-semibold text-[var(--foreground)] mb-1.5 pl-1">Password</label>
          <input
            type="password"
            placeholder="••••••••"
            className="input-field"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        {/* TERMS (Signup only) */}
        {isSignup && (
          <label className="flex items-start gap-3 mt-4 group">
            <input
              type="checkbox"
              checked={acceptTerms}
              onChange={(e) => setAcceptTerms(e.target.checked)}
              className="mt-0.5 min-w-[18px] h-4 w-4 rounded-md border-[var(--input-border)] text-[var(--brand-blue)] focus:ring-[var(--brand-blue)] accent-[var(--brand-blue)] transition-colors cursor-pointer"
            />
            <span className="text-[13px] font-medium text-[var(--feelup-muted)] leading-tight cursor-pointer group-hover:text-[var(--foreground)] transition-colors">
              I agree to the{" "}
              <a href="/terms" className="text-[var(--brand-blue)] hover:underline">terms</a>{" "}
              &{" "}
              <a href="/privacy" className="text-[var(--brand-blue)] hover:underline">privacy policy</a>
            </span>
          </label>
        )}

        {/* ERROR */}
        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl">
            <p className="text-[13px] font-medium text-red-600 dark:text-red-400 text-center">{error}</p>
          </div>
        )}

        {/* SUBMIT */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 mt-2 rounded-xl bg-[var(--foreground)] text-[var(--background)] hover:opacity-90 transition-all font-semibold shadow-lg disabled:opacity-50 flex items-center justify-center gap-2 group"
        >
          {loading ? (
            <>
              <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
              {isSignup ? "Creating account..." : "Signing in..."}
            </>
          ) : (
            <>
              {isSignup ? "Create Account" : "Sign In"}
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </>
          )}
        </button>

        {/* Helpful hint (login only) */}
        {!isSignup ? (
          <p className="text-[11px] text-[var(--feelup-muted)] text-center font-medium opacity-70">
            For staff access: @admin.feelup or @psychologist.feelup
          </p>
        ) : null}
      </form>

      {/* Legacy external link helper for AuthCard rendering directly sometimes */}
      <div className="mt-6 text-center text-sm font-medium text-[var(--feelup-muted)]">
        {isSignup ? null : staffTyped ? (
          <span className="text-[13px]">
            Account creation is restricted for staff emails.
          </span>
        ) : null}
      </div>
    </div>
  );
}
