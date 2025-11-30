"use client";

import { useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import Logo from "../../components/Logo";

export default function LoginPage() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);

  async function handleCredentialsSignIn(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    if (mode === "signup") {
      // call mock register endpoint
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, acceptTerms }),
      });

      const data = await res.json();
      setLoading(false);
      if (!res.ok) return alert(data.error || "Registration failed");
      alert("Account created (mock). You can now sign in.");
      setMode("signin");
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

    // On success, NextAuth will handle the session; redirect to home
    window.location.href = "/";
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-gradient-to-b from-sky-50 to-white dark:from-black dark:to-gray-900">
      <div className="absolute -top-24 -left-24 h-64 w-64 rounded-full bg-gradient-to-br from-[#e0f7ff] to-transparent opacity-50 blur-3xl" aria-hidden />
      <div className="absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-gradient-to-br from-transparent to-[#c7f9f9] opacity-40 blur-3xl" aria-hidden />

      <main className="z-10 w-full max-w-md rounded-[var(--radius-md)] bg-white p-8 soft-glow dark:bg-[#071017] transition-all fade-in">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo size={40} />
            <div>
              <h1 className="text-lg font-semibold">FeelUp</h1>
              <p className="text-xs text-[var(--feelup-muted)]">A calm space for emotional sharing</p>
            </div>
          </div>
          <Link href="/" className="text-sm text-zinc-600 hover:underline">
            Home
          </Link>
        </div>

        <div className="mb-4 flex gap-2">
          <button
            onClick={() => setMode("signin")}
            className={`px-4 py-2 rounded-full text-sm transition ${mode === "signin" ? "bg-[var(--feelup-accent)] text-black" : "bg-transparent text-[var(--feelup-muted)] hover:bg-slate-100"}`}
            aria-pressed={mode === "signin"}
          >
            Sign in
          </button>
          <button
            onClick={() => setMode("signup")}
            className={`px-4 py-2 rounded-full text-sm transition ${mode === "signup" ? "bg-[var(--feelup-accent)] text-black" : "bg-transparent text-[var(--feelup-muted)] hover:bg-slate-100"}`}
            aria-pressed={mode === "signup"}
          >
            Sign up
          </button>
        </div>

        <form onSubmit={handleCredentialsSignIn} className="flex flex-col gap-4">
          <label className="flex flex-col text-sm">
            <span className="mb-1">Email</span>
            <input
              className="rounded-md border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--feelup-accent)] transition"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              aria-label="Email address"
            />
          </label>

          <label className="flex flex-col text-sm">
            <span className="mb-1">Password</span>
            <input
              className="rounded-md border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--feelup-accent)] transition"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              aria-label="Password"
            />
          </label>

          {mode === "signup" && (
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={acceptTerms} onChange={(e) => setAcceptTerms(e.target.checked)} />
              <span>
                I accept the <Link href="/terms" className="underline">Terms & Policies</Link>
              </span>
            </label>
          )}

          <button
            type="submit"
            className="mt-2 rounded-full px-4 py-2 text-white disabled:opacity-50 transition-transform active:scale-95 btn-primary"
            disabled={loading || (mode === "signup" && !acceptTerms)}
            aria-busy={loading}
          >
            {loading ? "Please wait..." : mode === "signin" ? "Sign in" : "Create account"}
          </button>
        </form>

        <div className="mt-6 flex flex-col gap-3">
          <div className="text-center text-sm text-zinc-600">Or continue with</div>
          <div className="flex gap-3">
            <button
              onClick={() => signIn("google")}
              className="flex-1 rounded-full px-3 py-2 text-sm hover:opacity-95 btn-secondary"
              aria-label="Sign in with Google"
            >
              Sign in with Google
            </button>
            <button
              onClick={() => signIn("github")}
              className="flex-1 rounded-full px-3 py-2 text-sm hover:opacity-95 btn-secondary"
              aria-label="Sign in with GitHub"
            >
              Sign in with GitHub
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
