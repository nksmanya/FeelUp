"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface RightSidebarProps {
  userEmail?: string | null;
}

export default function RightSidebar({ userEmail }: RightSidebarProps) {
  const [suggestedUsers, setSuggestedUsers] = useState<any[]>([]);
  const [goals, setGoals] = useState<any[]>([]);

  useEffect(() => {
    // Load suggested users (mock API)
    fetch("/api/users?limit=5")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setSuggestedUsers(data.slice(0, 5));
      })
      .catch(() => {});

    // Load today's goals for the user
    if (userEmail) {
      const today = new Date().toISOString().split("T")[0];
      fetch(`/api/goals?user_email=${encodeURIComponent(userEmail)}&date=${today}`)
        .then((r) => r.json())
        .then((data) => {
          setGoals((data.goals || []).filter((g: any) => !g.completed_at));
        })
        .catch(() => {});
    }
  }, [userEmail]);

  const communities = [
    { id: "c1", name: "Mindful Living", desc: "Meditation & wellness" },
    { id: "c2", name: "Daily Habits", desc: "Micro-habits & productivity" },
    { id: "c3", name: "Creative Corner", desc: "Art & journaling" },
  ];

  return (
    <aside className="hidden lg:block w-80">
      <div className="space-y-4">
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="font-semibold">Suggested profiles</div>
            <Link href="/explore" className="text-sm text-[var(--brand-blue)]">See all</Link>
          </div>
          <div className="space-y-3">
            {suggestedUsers.map((u) => (
              <div key={u.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 flex-shrink-0 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center text-white font-semibold text-sm">
                      {u.name?.[0] || u.id?.[0]}
                    </div>
                    <Link href={`/profile/${u.id}`} className="block truncate">
                      <div className="font-medium text-sm truncate" title={u.name}>{u.name}</div>
                      <div className="text-xs text-[var(--feelup-muted)] truncate">{u.id}</div>
                    </Link>
                </div>
                <div className="flex-shrink-0 ml-2">
                  <button className="text-sm px-3 py-1 bg-blue-50 text-blue-700 rounded-md">Follow</button>
                </div>
              </div>
            ))}
            {suggestedUsers.length === 0 && (
              <div className="text-xs text-[var(--feelup-muted)]">No suggestions yet.</div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="font-semibold">Suggested communities</div>
            <Link href="/community" className="text-sm text-[var(--brand-blue)]">Browse</Link>
          </div>
          <div className="space-y-2">
            {communities.map((c) => (
              <div key={c.id} className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-sm">{c.name}</div>
                  <div className="text-xs text-[var(--feelup-muted)]">{c.desc}</div>
                </div>
                <button className="text-sm px-2 py-1 bg-gray-100 rounded-md">Join</button>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="mb-3 font-semibold">Today's goals</div>
          <div className="space-y-3">
            {goals.length === 0 && (
              <div className="text-xs text-[var(--feelup-muted)]">No pending goals for today — add one!</div>
            )}
            {goals.map((g: any) => (
              <div key={g.id} className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="font-medium text-sm">{g.title}</div>
                  {g.description && <div className="text-xs text-[var(--feelup-muted)]">{g.description}</div>}
                </div>
                <div>
                  <button className="px-2 py-1 bg-emerald-50 text-emerald-700 rounded-md text-sm">Complete</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}
