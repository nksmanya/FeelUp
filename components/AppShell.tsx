"use client";

import { usePathname } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import { Search } from "lucide-react";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // ✅ Pages that should NOT show normal app layout
  const isAdmin = pathname.startsWith("/admin");
  const isPsychologist = pathname.startsWith("/psychologist");
  const isLogin = pathname.startsWith("/login");

  // For these pages, render clean (no sidebar/topbar)
  if (isAdmin || isPsychologist || isLogin) {
    return <>{children}</>;
  }

  // ✅ Normal FeelUp layout
  return (
    <div className="h-screen w-full overflow-hidden bg-[var(--background)] text-[var(--foreground)] transition-colors duration-300">
      <div className="flex h-full max-w-[1600px] mx-auto">
        {/* Sidebar */}
        <Sidebar />

        {/* Main */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Topbar */}
          <header className="sticky top-0 z-40 glass border-b border-[var(--card-border)] bg-[var(--card-bg)]">
            <div className="max-w-7xl mx-auto px-6 py-3 flex items-center gap-6">
              {/* Search */}
              <div className="flex-1 flex justify-center min-w-0">
                <div className="hidden sm:flex items-center w-full max-w-2xl bg-[var(--input-bg)] border border-[var(--input-border)] rounded-full px-4 py-2 transition-all focus-within:ring-2 focus-within:ring-[var(--brand-blue)] focus-within:border-transparent">
                  <Search className="w-4 h-4 text-[var(--feelup-muted)]" />
                  <input
                    placeholder="Search people, posts, events..."
                    className="flex-1 px-3 bg-transparent outline-none text-sm text-[var(--foreground)]"
                  />
                  <button className="ml-2 px-4 py-1 rounded-full bg-[var(--brand-blue)] text-white text-sm font-medium hover:brightness-110 transition-all">
                    Ask
                  </button>
                </div>
              </div>

              <Topbar />
            </div>
          </header>

          {/* Content scroll */}
          <main className="flex-1 overflow-y-auto w-full">
            <div className="p-4 mx-auto max-w-7xl w-full">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}
