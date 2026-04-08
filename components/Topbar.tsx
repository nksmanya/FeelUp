"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { MessageCircle, Bell, PlusSquare, User } from "lucide-react";
import { createBrowserSupabaseClient } from "@/lib/supabaseClient";
import { ThemeToggle } from "./ThemeToggle";

export default function Topbar() {
  const supabase = useMemo(() => createBrowserSupabaseClient(), []);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    let cancelled = false;
    let channel: any = null;

    const setup = async () => {
      const { data } = await supabase.auth.getUser();
      if (cancelled) return;
      const user = data.user;
      if (!user) return;

      // 1️⃣ Initial unread count
      const { count, error } = await supabase
        .from("notifications")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("read", false);

      if (!error) {
        setUnreadCount(count || 0);
      }

      if (cancelled) return;

      // 2️⃣ Realtime updates
      const nextChannel = supabase
        .channel(`notifications-${user.id}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "notifications",
            filter: `user_id=eq.${user.id}`,
          },
          () => {
            setUnreadCount((c) => c + 1);
          }
        )
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "notifications",
            filter: `user_id=eq.${user.id}`,
          },
          async () => {
            // Recalculate on mark-as-read
            const { count } = await supabase
              .from("notifications")
              .select("*", { count: "exact", head: true })
              .eq("user_id", user.id)
              .eq("read", false);

            setUnreadCount(count || 0);
          }
        )
        .subscribe();

      channel = nextChannel;
    };

    setup();

    return () => {
      cancelled = true;
      if (channel) supabase.removeChannel(channel);
    };
  }, [supabase]);

  return (
    <div className="flex items-center gap-2 sm:gap-3">
      {/* Messages */}
      <Link
        href="/messages"
        className="p-2 hover:bg-[var(--input-bg)] rounded-lg transition-colors group"
      >
        <MessageCircle className="w-5 h-5 text-[var(--feelup-muted)] group-hover:text-[var(--foreground)] transition-colors" />
      </Link>

      <ThemeToggle />

      {/* Notifications */}
      <Link
        href="/notifications"
        className="relative p-2 hover:bg-[var(--input-bg)] rounded-lg transition-colors group"
      >
        <Bell className="w-5 h-5 text-[var(--feelup-muted)] group-hover:text-[var(--foreground)] transition-colors" />

        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1.5 flex items-center justify-center rounded-full bg-red-600 text-white text-[10px] font-semibold">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </Link>

      {/* Create */}
      <Link
        href="/create"
        className="p-2 rounded-lg bg-[var(--brand-blue)] text-white hover:brightness-110 shadow-sm transition-all"
      >
        <PlusSquare className="w-5 h-5" />
      </Link>

      {/* Profile */}
      <Link
        href="/profile"
        className="p-2 hover:bg-[var(--input-bg)] rounded-lg transition-colors group"
      >
        <User className="w-5 h-5 text-[var(--feelup-muted)] group-hover:text-[var(--foreground)] transition-colors" />
      </Link>
    </div>
  );
}
