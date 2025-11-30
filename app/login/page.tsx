"use client";

import { useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";

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
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black">
      <main className="w-full max-w-md rounded-lg bg-white p-8 shadow-md dark:bg-[#0b0b0b] transition-all">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold">FeelUp — {mode === "signin" ? "Sign in" : "Create account"}</h2>
          <Link href="/" className="text-sm text-zinc-600 hover:underline">
            Home
          </Link>
        </div>

        <div className="mb-4 flex gap-2">
          <button
            onClick={() => setMode("signin")}
            className={`px-3 py-1 rounded-md ${mode === "signin" ? "bg-black text-white" : "bg-transparent"}`}
          >
            Sign in
          </button>
          <button
            onClick={() => setMode("signup")}
            className={`px-3 py-1 rounded-md ${mode === "signup" ? "bg-black text-white" : "bg-transparent"}`}
          >
            Sign up
          </button>
        </div>

        <form onSubmit={handleCredentialsSignIn} className="flex flex-col gap-4">
          <label className="flex flex-col text-sm">
            <span className="mb-1">Email</span>
            <input
              className="rounded-md border px-3 py-2 text-sm"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>

          <label className="flex flex-col text-sm">
            <span className="mb-1">Password</span>
            <input
              className="rounded-md border px-3 py-2 text-sm"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
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
            className="mt-2 rounded-md bg-black px-4 py-2 text-white disabled:opacity-50"
            disabled={loading || (mode === "signup" && !acceptTerms)}
          >
            {loading ? "Please wait..." : mode === "signin" ? "Sign in" : "Create account"}
          </button>
        </form>

        <div className="mt-6 flex flex-col gap-3">
          <div className="text-center text-sm text-zinc-600">Or continue with</div>
          <div className="flex gap-3">
            <button
              onClick={() => signIn("google")}
              className="flex-1 rounded-md border px-3 py-2 text-sm hover:bg-gray-50"
            >
              Sign in with Google
            </button>
            <button
              onClick={() => signIn("github")}
              className="flex-1 rounded-md border px-3 py-2 text-sm hover:bg-gray-50"
            >
              Sign in with GitHub
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
