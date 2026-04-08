"use client";

import { useRouter } from "next/navigation";
import ClientAuthCard from "@/components/ClientAuthCard";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function SignupPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] flex items-center justify-center relative overflow-hidden transition-colors duration-300">
      {/* Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] rounded-full bg-[var(--brand-pink)] opacity-20 blur-[120px] pointer-events-none mix-blend-multiply dark:mix-blend-screen"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-[var(--brand-blue)] opacity-20 blur-[150px] pointer-events-none mix-blend-multiply dark:mix-blend-screen"></div>

      {/* Theme Toggle Top Right */}
      <div className="absolute top-6 right-6 z-50">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-12 lg:gap-20 items-center px-6 py-12 relative z-10">
        {/* LEFT: BRAND / MESSAGE */}
        <div className="hidden lg:flex flex-col justify-center space-y-8 animate-in fade-in slide-in-from-left-8 duration-700">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--input-bg)] border border-[var(--card-border)] text-sm font-medium text-[var(--brand-blue)] mb-4 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-[var(--brand-pink)] animate-pulse"></span>
              Your Wellness Journey Begins
            </div>
            
            <h1 className="text-6xl font-extrabold tracking-tight leading-[1.1] text-transparent bg-clip-text bg-gradient-to-br from-[var(--foreground)] to-[var(--feelup-muted)]">
              Welcome to <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-[var(--brand-blue)] to-[var(--brand-pink)]">
                FeelUp
              </span> <span className="text-5xl">🌱</span>
            </h1>

            <p className="text-xl text-[var(--feelup-muted)] leading-relaxed max-w-lg font-medium">
              A safe, beautiful space to track your moods, reflect deeply, and connect without pressure or judgment.
            </p>
          </div>

          <ul className="space-y-4 text-[17px] text-[var(--foreground)] font-medium">
            <li className="flex items-center gap-4 bg-[var(--card-bg)] border border-[var(--card-border)] p-3 rounded-2xl shadow-sm w-fit">
              <span className="text-2xl">🧠</span> Track moods & emotional patterns
            </li>
            <li className="flex items-center gap-4 bg-[var(--card-bg)] border border-[var(--card-border)] p-3 rounded-2xl shadow-sm w-fit ml-4">
              <span className="text-2xl">🤝</span> Share safely with friends or circles
            </li>
            <li className="flex items-center gap-4 bg-[var(--card-bg)] border border-[var(--card-border)] p-3 rounded-2xl shadow-sm w-fit ml-8">
              <span className="text-2xl">🌱</span> Grow through gentle challenges
            </li>
          </ul>

          <div className="pt-8 flex items-center gap-4 text-sm font-medium">
            <span className="text-[var(--feelup-muted)]">Already a member?</span>
            <button
              onClick={() => router.push("/login")}
              className="text-[var(--brand-blue)] hover:text-[var(--brand-pink)] transition-colors inline-flex items-center gap-1 group"
            >
              Sign in to your account
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </button>
          </div>
        </div>

        {/* RIGHT: SIGNUP CARD */}
        <div className="w-full flex justify-center lg:justify-end animate-in fade-in slide-in-from-right-8 duration-700 delay-150">
          <div className="w-full max-w-md">
            {/* The Auth Card acts as the container */}
            <ClientAuthCard mode="signup" />

            <div className="mt-6 text-center space-y-4">
              <p className="text-xs text-[var(--feelup-muted)]">
                By joining, you agree to our{" "}
                <a href="/terms" className="text-[var(--brand-blue)] hover:underline font-medium">
                  Terms
                </a>{" "}
                &{" "}
                <a href="/privacy" className="text-[var(--brand-blue)] hover:underline font-medium">
                  Privacy Policy
                </a>
              </p>

              <p className="text-sm font-medium text-[var(--feelup-muted)]">
                Already have an account?{" "}
                <button
                  onClick={() => router.push("/login")}
                  className="text-[var(--foreground)] hover:text-[var(--brand-blue)] transition-colors ml-1"
                >
                  Log in
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
