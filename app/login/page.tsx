"use client";

import { useRouter } from "next/navigation";
import ClientAuthCard from "@/components/ClientAuthCard";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function LoginPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center relative overflow-hidden transition-colors duration-300">
      {/* Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] rounded-full bg-(--brand-pink) opacity-20 blur-[120px] pointer-events-none mix-blend-multiply dark:mix-blend-screen"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-(--brand-blue) opacity-20 blur-[150px] pointer-events-none mix-blend-multiply dark:mix-blend-screen"></div>

      {/* Theme Toggle Top Right */}
      <div className="absolute top-6 right-6 z-50">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-12 lg:gap-20 items-center px-6 py-12 relative z-10">
        {/* LEFT: BRAND / MESSAGE */}
        <div className="hidden lg:flex flex-col justify-center space-y-8 animate-in fade-in slide-in-from-left-8 duration-700">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-(--input-bg) border border-(--card-border) text-sm font-medium text-(--brand-blue) mb-4 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-(--brand-pink) animate-pulse"></span>
              Welcome back
            </div>

            <h1 className="text-6xl font-extrabold tracking-tight leading-[1.1] text-transparent bg-clip-text bg-linear-to-br from-foreground to-(--feelup-muted)">
              Continue with <br />
              <span className="bg-clip-text text-transparent bg-linear-to-r from-(--brand-blue) to-(--brand-pink)">
                FeelUp
              </span>
            </h1>

            <p className="text-xl text-(--feelup-muted) leading-relaxed max-w-lg font-medium">
              Pick up where you left off — moods, circles, and growth in one calm space.
            </p>
          </div>

          <ul className="space-y-4 text-[17px] text-foreground font-medium">
            <li className="flex items-center gap-4 bg-(--card-bg) border border-(--card-border) p-3 rounded-2xl shadow-sm w-fit">
              <span className="text-2xl">🧠</span> Track moods & emotional patterns
            </li>
            <li className="flex items-center gap-4 bg-(--card-bg) border border-(--card-border) p-3 rounded-2xl shadow-sm w-fit ml-4">
              <span className="text-2xl">🤝</span> Share safely with friends or circles
            </li>
            <li className="flex items-center gap-4 bg-(--card-bg) border border-(--card-border) p-3 rounded-2xl shadow-sm w-fit ml-8">
              <span className="text-2xl">🌱</span> Grow through gentle challenges
            </li>
          </ul>

          <div className="pt-8 flex items-center gap-4 text-sm font-medium">
            <span className="text-(--feelup-muted)">New here?</span>
            <button
              onClick={() => router.push("/")}
              className="text-(--brand-blue) hover:text-(--brand-pink) transition-colors inline-flex items-center gap-1 group"
            >
              Create an account
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </button>
          </div>
        </div>

        {/* RIGHT: LOGIN CARD */}
        <div className="w-full flex justify-center lg:justify-end animate-in fade-in slide-in-from-right-8 duration-700 delay-150">
          <div className="w-full max-w-md">
            <ClientAuthCard mode="login" />

            <div className="mt-6 text-center space-y-4">
              <p className="text-xs text-(--feelup-muted)">
                By signing in, you agree to our{" "}
                <a href="/terms" className="text-(--brand-blue) hover:underline font-medium">
                  Terms
                </a>{" "}
                &{" "}
                <a href="/privacy" className="text-(--brand-blue) hover:underline font-medium">
                  Privacy Policy
                </a>
              </p>

              <p className="text-sm font-medium text-(--feelup-muted)">
                Don’t have an account?{" "}
                <button
                  onClick={() => router.push("/")}
                  className="text-foreground hover:text-(--brand-blue) transition-colors ml-1"
                >
                  Create account
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
