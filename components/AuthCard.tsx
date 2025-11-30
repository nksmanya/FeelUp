"use client";

import { useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import Logo from "./Logo";

export default function AuthCard() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);

  async function handleCredentialsSignIn(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    if (mode === "signup") {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, acceptTerms }),
      });

      const data = await res.json();
      if (!res.ok) {
        setLoading(false);
        return alert(data.error || "Registration failed");
      }

      // After mock registration, sign the user in automatically and redirect to the feed
      const signed = await signIn("credentials", { redirect: false, name, email, password } as any);
      setLoading(false);
      if (!signed || (signed as any).error) return alert((signed as any)?.error || "Sign in failed");
      window.location.href = "/mood-feed";
      return;
    }

    const result = await signIn("credentials", {
      redirect: false,
      email,
      password,
    } as any);

    setLoading(false);

    if (!result || (result as any).error) {
      alert((result as any)?.error || "Sign in failed");
      return;
    }

    window.location.href = "/mood-feed";
  }

  return (
    <div className="mx-auto w-full rounded-[var(--radius-md)] bg-white p-6 soft-glow">
      <div className="mb-4 flex items-center justify-center">
        <Logo size={56} />
      </div>

      <h2 className="mb-2 text-center text-2xl font-semibold">FeelUp</h2>
      <p className="mb-4 text-center text-sm text-[var(--feelup-muted)]">
        A calm space for emotional sharing. Sign in or create an account to continue.
      </p>

      <nav className="mb-4 flex gap-2" role="tablist" aria-label="Sign in or sign up">
        <button
          onClick={() => setMode("signin")}
          aria-selected={mode === "signin"}
          className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition ${mode === "signin" ? "btn-primary" : "btn-ghost"}`}
        >
          Sign in
        </button>
        <button
          onClick={() => setMode("signup")}
          aria-selected={mode === "signup"}
          className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition ${mode === "signup" ? "btn-primary" : "btn-ghost"}`}
        >
          Create account
        </button>
      </nav>

      <form onSubmit={handleCredentialsSignIn} className="flex flex-col gap-3">
        {mode === "signup" && (
          <label className="flex flex-col text-sm">
            <span className="mb-1 text-sm" style={{ color: 'var(--feelup-muted)' }}>Full name</span>
            <input className="input-field" type="text" value={name} onChange={(e) => setName(e.target.value)} required placeholder="Your name" />
          </label>
        )}

        <label className="flex flex-col text-sm">
          <span className="mb-1 text-sm" style={{ color: 'var(--feelup-muted)' }}>Email</span>
          <input className="input-field" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="you@provider.com" />
        </label>

        <label className="flex flex-col text-sm">
          <span className="mb-1 text-sm" style={{ color: 'var(--feelup-muted)' }}>Password</span>
          <input className="input-field" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="At least 6 characters" />
        </label>

        {mode === "signup" && (
          <label className="flex items-start gap-3 text-sm">
            <input type="checkbox" checked={acceptTerms} onChange={(e) => setAcceptTerms(e.target.checked)} className="mt-1" />
            <span className="text-sm">I accept the <Link href="/terms" className="underline">Terms & Policies</Link></span>
          </label>
        )}

        <div className="flex flex-col gap-3 mt-1">
          <button type="submit" className="w-full rounded-xl px-4 py-3 text-white disabled:opacity-60 btn-primary" disabled={loading || (mode === "signup" && !acceptTerms)} aria-busy={loading}>
            {loading ? "Please wait..." : mode === "signin" ? "Sign in" : "Create account"}
          </button>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-[rgba(86,100,120,0.08)]" />
            <div className="text-xs text-[var(--feelup-muted)]">Or continue with</div>
            <div className="flex-1 h-px bg-[rgba(86,100,120,0.08)]" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => signIn("google", { callbackUrl: '/mood-feed' })} className="rounded-xl px-3 py-2 text-sm btn-secondary" aria-label="Sign in with Google">Google</button>
            <button onClick={() => signIn("github", { callbackUrl: '/mood-feed' })} className="rounded-xl px-3 py-2 text-sm btn-secondary" aria-label="Sign in with GitHub">GitHub</button>
          </div>
        </div>
      </form>

      <div className="mt-4 text-center text-xs text-[var(--feelup-muted)]">
        By continuing you agree to our <Link href="/terms" className="underline">Terms & Policies</Link>.
      </div>
    </div>
  );
}
