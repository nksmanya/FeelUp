"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { createBrowserSupabaseClient } from "@/lib/supabaseClient";

type Profile = {
  id: string;
  username: string | null;
  full_name: string | null;
};

type Community = {
  id: string;
  name: string;
  description: string | null;
};

type Goal = {
  id: string;
  title: string;
  completed: boolean;
  created_at: string; // timestamptz
};

function startOfLocalDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}
function startOfNextLocalDay(d: Date) {
  const s = startOfLocalDay(d);
  s.setDate(s.getDate() + 1);
  return s;
}

export default function RightSidebar({ userEmail }: { userEmail?: string }) {
  const supabase = useMemo(() => createBrowserSupabaseClient(), []);

  const [me, setMe] = useState<{ id: string } | null>(null);

  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [followingSet, setFollowingSet] = useState<Set<string>>(new Set());

  const [communities, setCommunities] = useState<Community[]>([]);
  const [joinedSet, setJoinedSet] = useState<Set<string>>(new Set());

  const [todayGoals, setTodayGoals] = useState<Goal[]>([]);

  // ✅ progress stats
  const totalCount = todayGoals.length;
  const completedCount = todayGoals.filter((g) => g.completed).length;
  const pendingCount = totalCount - completedCount;
  const progressPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // ✅ streak stats from user_streaks
  const [streak, setStreak] = useState<{ current_count: number; best_count: number } | null>(null);

  const [loadingProfiles, setLoadingProfiles] = useState(true);
  const [loadingCommunities, setLoadingCommunities] = useState(true);
  const [loadingGoals, setLoadingGoals] = useState(true);
  const [loadingStreak, setLoadingStreak] = useState(true);

  const avatarLetter = (p: Profile) => {
    const s = (p.full_name || p.username || "U").trim();
    return (s[0] || "U").toUpperCase();
  };

  const safeName = (p: Profile) => (p.full_name || p.username || "Unnamed user").trim();

  const getFireEmoji = (count: number) => {
    if (count >= 100) return "🏆";
    if (count >= 50) return "⭐";
    if (count >= 30) return "🔥🔥🔥";
    if (count >= 14) return "🔥🔥";
    if (count >= 7) return "🔥";
    if (count >= 3) return "✨";
    return "🌱";
  };

  /* ---------------- AUTH (get my id) ---------------- */
  useEffect(() => {
    let mounted = true;
    supabase.auth.getUser().then(({ data }) => {
      if (!mounted) return;
      if (data?.user?.id) setMe({ id: data.user.id });
    });
    return () => {
      mounted = false;
    };
  }, [supabase]);

  /* ---------------- LOAD: PROFILES + FOLLOWING ---------------- */
  const loadSuggestedProfiles = useCallback(async () => {
    setLoadingProfiles(true);

    const res = await supabase
      .from("profiles")
      .select("id, username, full_name")
      .order("created_at", { ascending: false })
      .limit(8);

    if (!res.error && res.data) {
      const list = me?.id ? res.data.filter((p) => p.id !== me.id) : res.data;
      setProfiles(list.slice(0, 5));
    }

    setLoadingProfiles(false);
  }, [supabase, me?.id]);

  const loadMyFollowing = useCallback(async () => {
    if (!me?.id) return;

    const res = await supabase.from("follows").select("following_id").eq("follower_id", me.id);

    if (!res.error) {
      const s = new Set<string>((res.data || []).map((r: any) => r.following_id));
      setFollowingSet(s);
    }
  }, [supabase, me?.id]);

  /* ---------------- LOAD: COMMUNITIES + JOINED ---------------- */
  const loadSuggestedCommunities = useCallback(async () => {
    setLoadingCommunities(true);

    const res = await supabase
      .from("communities")
      .select("id, name, description")
      .order("created_at", { ascending: false })
      .limit(6);

    if (!res.error && res.data) {
      setCommunities(res.data.slice(0, 3));
    }

    setLoadingCommunities(false);
  }, [supabase]);

  const loadMyMemberships = useCallback(async () => {
    if (!me?.id) return;

    const res = await supabase.from("community_members").select("community_id").eq("user_id", me.id);

    if (!res.error) {
      const s = new Set<string>((res.data || []).map((r: any) => r.community_id));
      setJoinedSet(s);
    }
  }, [supabase, me?.id]);

  /* ---------------- LOAD: TODAY GOALS ---------------- */
  const loadTodayGoals = useCallback(async () => {
    if (!me?.id) return;
    setLoadingGoals(true);

    const start = startOfLocalDay(new Date()).toISOString();
    const end = startOfNextLocalDay(new Date()).toISOString();

    const res = await supabase
      .from("goals")
      .select("id, title, completed, created_at")
      .eq("user_id", me.id)
      .gte("created_at", start)
      .lt("created_at", end)
      .order("created_at", { ascending: false });

    if (!res.error) {
      setTodayGoals((res.data as any) || []);
    }

    setLoadingGoals(false);
  }, [supabase, me?.id]);

  /* ---------------- LOAD: GOALS STREAK (Best + Current) ---------------- */
  const loadGoalsStreak = useCallback(async () => {
    if (!me?.id) return;
    setLoadingStreak(true);

    const res = await supabase
      .from("user_streaks")
      .select("current_count, best_count")
      .eq("user_id", me.id)
      .eq("streak_type", "goals")
      .maybeSingle();

    if (!res.error) {
      setStreak(res.data ? { current_count: res.data.current_count || 0, best_count: res.data.best_count || 0 } : { current_count: 0, best_count: 0 });
    }

    setLoadingStreak(false);
  }, [supabase, me?.id]);

  /* ---------------- INITIAL LOAD ---------------- */
  useEffect(() => {
    loadSuggestedProfiles();
    loadSuggestedCommunities();
  }, [loadSuggestedProfiles, loadSuggestedCommunities]);

  useEffect(() => {
    if (!me?.id) return;
    loadMyFollowing();
    loadMyMemberships();
    loadTodayGoals();
    loadGoalsStreak();
  }, [me?.id, loadMyFollowing, loadMyMemberships, loadTodayGoals, loadGoalsStreak]);

  /* ---------------- REALTIME ---------------- */
  useEffect(() => {
    const profilesChannel = supabase
      .channel("rt-profiles-sidebar")
      .on("postgres_changes", { event: "*", schema: "public", table: "profiles" }, () => {
        loadSuggestedProfiles();
      })
      .subscribe();

    const followsChannel = supabase
      .channel("rt-follows-sidebar")
      .on("postgres_changes", { event: "*", schema: "public", table: "follows" }, (payload) => {
        const row: any = payload.new || payload.old;
        if (me?.id && row?.follower_id === me.id) loadMyFollowing();
      })
      .subscribe();

    const communitiesChannel = supabase
      .channel("rt-communities-sidebar")
      .on("postgres_changes", { event: "*", schema: "public", table: "communities" }, () => {
        loadSuggestedCommunities();
      })
      .subscribe();

    const membersChannel = supabase
      .channel("rt-community-members-sidebar")
      .on("postgres_changes", { event: "*", schema: "public", table: "community_members" }, (payload) => {
        const row: any = payload.new || payload.old;
        if (me?.id && row?.user_id === me.id) loadMyMemberships();
      })
      .subscribe();

    const goalsChannel = supabase
      .channel("rt-goals-sidebar")
      .on("postgres_changes", { event: "*", schema: "public", table: "goals" }, (payload) => {
        const row: any = payload.new || payload.old;
        if (me?.id && row?.user_id === me.id) loadTodayGoals();
      })
      .subscribe();

    const streaksChannel = supabase
      .channel("rt-streaks-sidebar")
      .on("postgres_changes", { event: "*", schema: "public", table: "user_streaks" }, (payload) => {
        const row: any = payload.new || payload.old;
        if (me?.id && row?.user_id === me.id && row?.streak_type === "goals") loadGoalsStreak();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(profilesChannel);
      supabase.removeChannel(followsChannel);
      supabase.removeChannel(communitiesChannel);
      supabase.removeChannel(membersChannel);
      supabase.removeChannel(goalsChannel);
      supabase.removeChannel(streaksChannel);
    };
  }, [
    supabase,
    me?.id,
    loadSuggestedProfiles,
    loadMyFollowing,
    loadSuggestedCommunities,
    loadMyMemberships,
    loadTodayGoals,
    loadGoalsStreak,
  ]);

  /* ---------------- ACTIONS ---------------- */
  const toggleFollow = async (profileId: string) => {
    if (!me?.id) return;

    const isFollowing = followingSet.has(profileId);

    if (isFollowing) {
      await supabase.from("follows").delete().eq("follower_id", me.id).eq("following_id", profileId);
    } else {
      await supabase.from("follows").insert({
        follower_id: me.id,
        following_id: profileId,
      });
    }

    loadMyFollowing();
  };

  const toggleJoin = async (communityId: string) => {
    if (!me?.id) return;

    const joined = joinedSet.has(communityId);

    if (joined) {
      await supabase.from("community_members").delete().eq("user_id", me.id).eq("community_id", communityId);
    } else {
      await supabase.from("community_members").insert({
        user_id: me.id,
        community_id: communityId,
      });
    }

    loadMyMemberships();
  };

  const toggleGoalCompleted = async (goalId: string, nextCompleted: boolean) => {
    if (!me?.id) return;

    const update: any = {
      completed: nextCompleted,
      completed_at: nextCompleted ? new Date().toISOString() : null,
    };

    const res = await supabase.from("goals").update(update).eq("id", goalId).eq("user_id", me.id);

    if (res.error) {
      alert(res.error.message || "Failed to update goal");
      return;
    }

    loadTodayGoals();
  };

  // ✅ Complete all pending goals
  const completeAll = async () => {
    if (!me?.id) return;
    const pending = todayGoals.filter((g) => !g.completed);
    if (pending.length === 0) return;

    const ids = pending.map((g) => g.id);
    const now = new Date().toISOString();

    const res = await supabase
      .from("goals")
      .update({ completed: true, completed_at: now })
      .in("id", ids)
      .eq("user_id", me.id);

    if (res.error) {
      alert(res.error.message || "Failed to complete all");
      return;
    }

    loadTodayGoals();
  };

  /* ---------------- UI ---------------- */
  return (
    <aside className="hidden lg:block space-y-4 w-80 shrink-0">
      {/* Suggested profiles */}
      <div className="glass rounded-2xl p-5 border border-[var(--card-border)] bg-[var(--card-bg)]">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-[var(--foreground)]">Suggested profiles</h3>
          <Link href="/explore" className="text-xs font-semibold text-[var(--brand-blue)] hover:underline">
            See all
          </Link>
        </div>

        {loadingProfiles ? (
          <p className="text-sm text-[var(--feelup-muted)]">Loading...</p>
        ) : profiles.length === 0 ? (
          <p className="text-sm text-[var(--feelup-muted)]">No users found</p>
        ) : (
          <ul className="space-y-4">
            {profiles.map((p) => {
              const isFollowing = followingSet.has(p.id);
              return (
                <li key={p.id} className="flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[var(--feelup-accent)] to-[var(--brand-pink)] text-white flex items-center justify-center font-bold text-sm shadow-sm ring-2 ring-[var(--card-border)]">
                      {avatarLetter(p)}
                    </div>

                    <div className="leading-tight">
                      <Link href={`/profile/${p.id}`} className="text-sm font-semibold text-[var(--foreground)] hover:text-[var(--brand-blue)] transition-colors line-clamp-1">
                        {safeName(p)}
                      </Link>
                      <p className="text-[11px] text-[var(--feelup-muted)] truncate max-w-[120px]">
                        {p.username ? `@${p.username}` : userEmail ? userEmail : ""}
                      </p>
                    </div>
                  </div>

                  <button onClick={() => toggleFollow(p.id)} className={`text-xs px-3 py-1.5 rounded-full font-medium transition-all ${isFollowing ? 'bg-[var(--input-bg)] text-[var(--foreground)]' : 'bg-[var(--brand-blue)] text-white shadow-sm hover:brightness-110'}`} type="button">
                    {isFollowing ? "Following" : "Follow"}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Suggested communities */}
      <div className="glass rounded-2xl p-5 border border-[var(--card-border)] bg-[var(--card-bg)]">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-[var(--foreground)]">Suggested communities</h3>
          <Link href="/communities" className="text-xs font-semibold text-[var(--brand-blue)] hover:underline">
            Browse
          </Link>
        </div>

        {loadingCommunities ? (
          <p className="text-sm text-[var(--feelup-muted)]">Loading...</p>
        ) : communities.length === 0 ? (
          <p className="text-sm text-[var(--feelup-muted)]">No communities yet</p>
        ) : (
          <ul className="space-y-4">
            {communities.map((c) => {
              const joined = joinedSet.has(c.id);
              return (
                <li key={c.id} className="flex items-center justify-between">
                  <div className="leading-tight">
                    <Link href={`/communities/${c.id}`} className="text-sm font-semibold text-[var(--foreground)] hover:text-[var(--brand-blue)] transition-colors line-clamp-1">
                      {c.name}
                    </Link>
                    {c.description && <p className="text-[11px] text-[var(--feelup-muted)] line-clamp-1">{c.description}</p>}
                  </div>

                  <button onClick={() => toggleJoin(c.id)} className={`text-xs px-3 py-1.5 rounded-full font-medium transition-all ${joined ? 'bg-[var(--input-bg)] text-[var(--foreground)]' : 'bg-[var(--input-bg)] text-[var(--brand-blue)] font-semibold hover:bg-[var(--brand-blue)] hover:text-white'}`} type="button">
                    {joined ? "Joined" : "Join"}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Today's goals */}
      <div className="glass rounded-2xl p-5 border border-[var(--card-border)] bg-[var(--card-bg)]">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-[var(--foreground)]">Today&apos;s goals</h3>
          <Link href="/goals" className="text-xs font-semibold text-[var(--brand-blue)] hover:underline">
            Open
          </Link>
        </div>

        {/* ✅ streak row */}
        <div className="flex items-center justify-between text-xs text-[var(--feelup-muted)] mb-4 bg-[var(--input-bg)] p-2.5 rounded-xl border border-[var(--card-border)]">
          {loadingStreak ? (
            <span>Loading streak…</span>
          ) : (
            <>
              <span className="flex items-center gap-1.5">
                {getFireEmoji(streak?.current_count || 0)}
                <span className="font-bold text-[var(--foreground)]">{streak?.current_count || 0}</span> day
              </span>
              <span className="opacity-80">Best: {streak?.best_count || 0}</span>
            </>
          )}
        </div>

        {/* ✅ progress */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-xs text-[var(--feelup-muted)] mb-1.5">
            <span>
              Progress: <span className="font-bold text-[var(--foreground)]">{completedCount}</span>/{totalCount || 0}
            </span>
            <span className="font-bold text-[var(--brand-blue)]">{progressPct}%</span>
          </div>
          <div className="h-2.5 w-full bg-[var(--input-bg)] rounded-full overflow-hidden shadow-inner flex border border-[var(--card-border)]">
            <div
              className="h-full bg-gradient-to-r from-[var(--brand-pink)] to-[var(--brand-blue)] rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        {/* ✅ pending count + complete all */}
        <div className="flex items-center justify-between mb-4 border-t border-[var(--card-border)] pt-3">
          <span className="text-xs text-[var(--feelup-muted)]">
            Pending: <span className="font-bold text-[var(--foreground)]">{pendingCount}</span>
          </span>

          <button
            type="button"
            onClick={completeAll}
            disabled={pendingCount === 0}
            className="text-[11px] px-3 py-1.5 rounded-full border border-[var(--brand-blue)] text-[var(--brand-blue)] hover:bg-[var(--brand-blue)] hover:text-white transition-colors disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-[var(--brand-blue)] font-semibold"
            title="Mark all today's goals as completed"
          >
            Complete all
          </button>
        </div>

        {loadingGoals ? (
          <p className="text-sm text-[var(--feelup-muted)]">Loading...</p>
        ) : todayGoals.length === 0 ? (
          <p className="text-sm text-[var(--feelup-muted)] text-center py-2">
            No goals today —{" "}
            <Link href="/goals" className="text-[var(--brand-blue)] font-medium hover:underline">
              add one
            </Link>
          </p>
        ) : (
          <ul className="space-y-3">
            {todayGoals.map((g) => (
              <li key={g.id} className="flex gap-3 group">
                <input
                  type="checkbox"
                  checked={!!g.completed}
                  onChange={(e) => toggleGoalCompleted(g.id, e.target.checked)}
                  className="mt-0.5 min-w-[16px] h-4 w-4 rounded-md border-[var(--input-border)] text-[var(--brand-blue)] focus:ring-[var(--brand-blue)] accent-[var(--brand-blue)] transition-colors cursor-pointer"
                />
                <span className={`text-sm leading-tight transition-all ${g.completed ? "line-through text-[var(--feelup-muted)] opacity-60" : "text-[var(--foreground)]"}`}>{g.title}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </aside>
  );
}
