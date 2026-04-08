"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserSupabaseClient } from "@/lib/supabaseClient";
import { BarChart3, Zap, Flame, CalendarDays, History, RefreshCcw } from "lucide-react";
import { motion, AnimatePresence, type Variants } from "framer-motion";

type Timeframe = "week" | "month" | "quarter";

type TimelineRow = {
  day: string;
  mood_posts: number;
  positive_posts: number;
  positive_percent: number;
  avg_energy: number;
  goals_completed: number;
};

type MoodDistributionRow = {
  mood: string;
  posts_count: number;
  percent: number;
};

type MemoryLaneRow = {
  kind: "mood_post" | "journal";
  id: string;
  created_at: string;
  title: string | null;
  content: string | null;
  mood: string | null;
};

type Insights = {
  days_back: number;
  total_posts: number;
  top_mood: string;
  avg_energy: number;
  weekend_positive_percent: number;
  weekday_positive_percent: number;
  best_day_of_week: string;
};

const moodColors: Record<string, string> = {
  Happy: "#fbbf24",
  Calm: "#60a5fa",
  Excited: "#f472b6",
  Grateful: "#34d399",
  Thoughtful: "#a78bfa",
  Sad: "#94a3b8",
  Anxious: "#fb7185",
  Tired: "#6b7280",
};

function daysFromTimeframe(t: Timeframe) {
  if (t === "week") return 7;
  if (t === "quarter") return 90;
  return 30;
}

function fmtDay(d: string) {
  try {
    return new Date(d).toLocaleDateString(undefined, { month: "short", day: "numeric" });
  } catch {
    return d;
  }
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function safeErrMsg(e: any) {
  return (typeof e?.message === "string" && e.message) || (typeof e === "string" && e) || "Unknown error";
}

/* ---------------- Motion helpers (TS-safe) ---------------- */

// Modern easeOut curve (cubic-bezier)
const EASE_OUT: [number, number, number, number] = [0.16, 1, 0.3, 1];

const pageFade: Variants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: EASE_OUT } },
};

const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.05 } },
};

const cardIn: Variants = {
  hidden: { opacity: 0, y: 12, scale: 0.98 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.28, ease: EASE_OUT } },
};

const softHover = { y: -2, transition: { type: "spring" as const, stiffness: 260, damping: 18 } };

export default function AnalyticsPage() {
  const router = useRouter();
  const supabase = useMemo(() => createBrowserSupabaseClient(), []);

  const [timeframe, setTimeframe] = useState<Timeframe>("month");
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [timeline, setTimeline] = useState<TimelineRow[]>([]);
  const [distribution, setDistribution] = useState<MoodDistributionRow[]>([]);
  const [insights, setInsights] = useState<Insights | null>(null);
  const [memoryLane, setMemoryLane] = useState<MemoryLaneRow[]>([]);

  const [stats, setStats] = useState({
    moodStreak: 0,
    goalsCompleted: 0,
    totalMoodPosts: 0,
    positivePercent: 0,
    avgEnergy: 0,
    topMood: "N/A",
  });

  const inFlightRef = useRef(false);

  const loadAll = useCallback(async () => {
    if (inFlightRef.current) return;
    inFlightRef.current = true;

    const days_back = daysFromTimeframe(timeframe);
    setErrorMsg(null);
    setLoading(true);

    try {
      const { data: authRes, error: authErr } = await supabase.auth.getUser();
      if (authErr) throw authErr;

      if (!authRes.user) {
        router.replace("/login");
        return;
      }

      const corr = await supabase.rpc("get_my_mood_goal_correlation", { days_back });
      if (corr.error) throw corr.error;
      const corrRows = (corr.data || []) as TimelineRow[];
      setTimeline(corrRows);

      const dist = await supabase.rpc("get_my_mood_distribution", { days_back });
      if (dist.error) throw dist.error;
      const distRows = (dist.data || []) as MoodDistributionRow[];
      setDistribution(distRows);

      const ins = await supabase.rpc("get_my_emotional_insights", { days_back });
      if (ins.error) throw ins.error;
      const insRow = ins.data as Insights;
      setInsights(insRow);

      const mem = await supabase.rpc("get_my_memory_lane", { days_back: Math.max(days_back, 90) });
      if (mem.error) setMemoryLane([]);
      else setMemoryLane((mem.data || []) as MemoryLaneRow[]);

      const totalMoodPosts = corrRows.reduce((s, r) => s + (r.mood_posts || 0), 0);
      const goalsCompleted = corrRows.reduce((s, r) => s + (r.goals_completed || 0), 0);
      const positivePosts = corrRows.reduce((s, r) => s + (r.positive_posts || 0), 0);

      const avgEnergy =
        corrRows.length > 0
          ? Math.round((corrRows.reduce((s, r) => s + (r.avg_energy || 0), 0) / corrRows.length) * 10) / 10
          : 0;

      const positivePercent = totalMoodPosts === 0 ? 0 : Math.round((positivePosts / totalMoodPosts) * 100);

      let streak = 0;
      for (let i = corrRows.length - 1; i >= 0; i--) {
        if ((corrRows[i]?.mood_posts || 0) > 0) streak++;
        else break;
      }

      const topMood = distRows?.[0]?.mood || insRow?.top_mood || "N/A";

      setStats({ moodStreak: streak, goalsCompleted, totalMoodPosts, positivePercent, avgEnergy, topMood });
    } catch (e: any) {
      setErrorMsg(safeErrMsg(e));
    } finally {
      setLoading(false);
      inFlightRef.current = false;
    }
  }, [router, supabase, timeframe]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  useEffect(() => {
    const ch = supabase
      .channel("analytics-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "mood_posts" }, () => loadAll())
      .on("postgres_changes", { event: "*", schema: "public", table: "goal_completions" }, () => loadAll())
      .on("postgres_changes", { event: "*", schema: "public", table: "journal_entries" }, () => loadAll())
      .subscribe();

    return () => {
      supabase.removeChannel(ch);
    };
  }, [supabase, loadAll]);

  const maxGoals = Math.max(1, ...timeline.map((r) => r.goals_completed || 0));
  const maxEnergy = 5;

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <motion.main variants={pageFade} initial="hidden" animate="show" className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <motion.div
                initial={{ rotate: -6, opacity: 0, scale: 0.9 }}
                animate={{ rotate: 0, opacity: 1, scale: 1 }}
                transition={{ type: "spring" as const, stiffness: 260, damping: 18 }}
                className="w-11 h-11 rounded-2xl bg-[var(--card-bg)] border border-[var(--card-border)] shadow-[var(--card-shadow)] flex items-center justify-center"
              >
                <BarChart3 className="w-6 h-6 text-[var(--brand-blue)]" />
              </motion.div>
              <div>
                <h1 className="text-4xl font-bold text-[var(--foreground)]">Your Analytics</h1>
                <p className="text-[var(--feelup-muted)]">
                  Realtime insights from your wellness journey <span className="text-[var(--feelup-muted)]">(only you can see this)</span>.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-[var(--card-bg)] rounded-2xl p-1.5 shadow-[var(--card-shadow)] border border-[var(--card-border)] flex gap-1">
              {(["week", "month", "quarter"] as const).map((p) => (
                <motion.button
                  key={p}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setTimeframe(p)}
                  className={`px-4 py-2 rounded-xl capitalize text-sm font-semibold transition ${
                    timeframe === p ? "bg-[var(--brand-blue)] text-white shadow-sm" : "text-[var(--feelup-muted)] hover:bg-[var(--input-bg)]"
                  }`}
                  type="button"
                >
                  {p}
                </motion.button>
              ))}
            </div>

            <motion.button
              whileHover={softHover}
              whileTap={{ scale: 0.98 }}
              onClick={loadAll}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-[var(--card-bg)] border border-[var(--card-border)] shadow-[var(--card-shadow)] hover:bg-[var(--input-bg)] text-sm font-semibold text-[var(--foreground)]"
              type="button"
            >
              <RefreshCcw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </motion.button>
          </div>
        </div>

        {/* Error */}
        <AnimatePresence>
          {errorMsg && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.25, ease: EASE_OUT }}
              className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-5 shadow-[var(--card-shadow)] mb-6"
            >
              <div className="font-semibold text-red-600">Analytics failed to load</div>
              <div className="text-sm text-[var(--feelup-muted)] mt-1">{errorMsg}</div>
              <div className="text-xs text-[var(--feelup-muted)] mt-2">
                Tip: DevTools → Network → check <b>/rest/v1/rpc/...</b> failing calls (404/401/500)
              </div>
              <div className="mt-4 flex gap-2">
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={loadAll}
                  className="px-4 py-2 rounded-xl bg-[var(--brand-blue)] text-white text-sm font-semibold"
                  type="button"
                >
                  Retry
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setErrorMsg(null)}
                  className="px-4 py-2 rounded-xl border border-[var(--card-border)] bg-[var(--input-bg)] text-sm font-semibold text-[var(--foreground)] hover:bg-[var(--card-bg)]"
                  type="button"
                >
                  Dismiss
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {loading ? (
          <div className="bg-[var(--card-bg)] rounded-2xl border border-[var(--card-border)] shadow-[var(--card-shadow)] p-8 text-[var(--feelup-muted)]">
            <div className="flex items-center gap-3">
              <div className="h-3 w-3 rounded-full bg-[var(--brand-blue)] animate-pulse" />
              <div className="font-semibold">Loading analytics…</div>
            </div>
          </div>
        ) : (
          <>
            {/* Stats */}
            <motion.div variants={stagger} initial="hidden" animate="show" className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
              <StatCard icon={<Flame className="w-4 h-4" />} label="Mood Streak" value={`${stats.moodStreak} days`} />
              <StatCard icon={<Zap className="w-4 h-4" />} label="Avg Energy" value={`${stats.avgEnergy}/5`} />
              <StatCard icon={<BarChart3 className="w-4 h-4" />} label="Mood Posts" value={stats.totalMoodPosts} />
              <StatCard icon={<CalendarDays className="w-4 h-4" />} label="Goals Done" value={stats.goalsCompleted} />
              <StatCard icon={<Zap className="w-4 h-4" />} label="Positive" value={`${stats.positivePercent}%`} />
              <StatCard icon={<History className="w-4 h-4" />} label="Top Mood" value={stats.topMood} />
            </motion.div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <motion.div variants={cardIn} initial="hidden" animate="show" className="bg-[var(--card-bg)] p-6 rounded-2xl shadow-[var(--card-shadow)] border border-[var(--card-border)]">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-bold text-[var(--foreground)]">Mood + Energy Timeline</h2>
                  <span className="text-xs text-[var(--feelup-muted)]">Blue = energy · Green = goals</span>
                </div>

                <div className="space-y-3">
                  {timeline.slice(-14).map((d, i) => {
                    const energyPct = clamp(((d.avg_energy || 0) / maxEnergy) * 100, 0, 100);
                    const goalsPct = clamp(((d.goals_completed || 0) / maxGoals) * 100, 0, 100);

                    return (
                      <motion.div
                        key={d.day + i}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.22, delay: i * 0.02, ease: EASE_OUT }}
                        className="rounded-xl border border-[var(--card-border)] bg-[var(--input-bg)] p-3 hover:bg-[var(--card-bg)] transition"
                      >
                        <div className="flex items-center justify-between text-xs text-[var(--feelup-muted)] mb-2">
                          <span className="font-medium">{fmtDay(d.day)}</span>
                          <span>
                            Energy: <b className="text-[var(--foreground)]">{d.avg_energy || 0}/5</b> · Goals:{" "}
                            <b className="text-[var(--foreground)]">{d.goals_completed || 0}</b>
                          </span>
                        </div>

                        <div className="space-y-2">
                          <div className="w-full bg-[var(--input-border)] rounded-full h-2 overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${energyPct}%` }}
                              transition={{ duration: 0.6, ease: EASE_OUT }}
                              className="h-2 rounded-full bg-[var(--brand-blue)]"
                            />
                          </div>
                          <div className="w-full bg-[var(--input-border)] rounded-full h-2 overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${goalsPct}%` }}
                              transition={{ duration: 0.6, ease: EASE_OUT }}
                              className="h-2 rounded-full bg-emerald-600"
                            />
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>

              <motion.div variants={cardIn} initial="hidden" animate="show" className="bg-[var(--card-bg)] p-6 rounded-2xl shadow-[var(--card-shadow)] border border-[var(--card-border)]">
                <h2 className="font-bold mb-4 flex items-center gap-2 text-[var(--foreground)]">
                  <Zap className="w-5 h-5" /> Mood Distribution
                </h2>

                {distribution.length === 0 ? (
                  <div className="text-sm text-[var(--feelup-muted)]">No mood posts yet.</div>
                ) : (
                  <div className="space-y-3">
                    {distribution.map((row, idx) => {
                      const pct = clamp(row.percent || 0, 0, 100);
                      const color = moodColors[row.mood] || "#9ca3af";
                      return (
                        <motion.div
                          key={row.mood}
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.22, delay: idx * 0.02, ease: EASE_OUT }}
                          className="rounded-xl border border-[var(--card-border)] bg-[var(--input-bg)] p-3"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
                              <span className="text-sm font-semibold text-[var(--foreground)]">{row.mood}</span>
                            </div>
                            <span className="text-xs text-[var(--feelup-muted)]">
                              {row.posts_count} · <b className="text-[var(--foreground)]">{pct}%</b>
                            </span>
                          </div>
                          <div className="w-full bg-[var(--input-border)] rounded-full h-3 overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${pct}%` }}
                              transition={{ duration: 0.7, ease: EASE_OUT }}
                              className="h-3 rounded-full"
                              style={{ backgroundColor: color }}
                            />
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            </div>

            {/* Memory Lane */}
            <motion.div variants={cardIn} initial="hidden" animate="show" className="bg-[var(--card-bg)] rounded-2xl border border-[var(--card-border)] shadow-[var(--card-shadow)] p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-[var(--foreground)]">⏳ Memory Lane</h2>
                <span className="text-xs text-[var(--feelup-muted)]">A gentle rewind</span>
              </div>

              {memoryLane.length === 0 ? (
                <div className="text-sm text-[var(--feelup-muted)]">
                  No memory lane items yet. (If <b>journal_entries</b> doesn’t exist, you may only see mood posts.)
                </div>
              ) : (
                <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-3">
                  {memoryLane.slice(0, 12).map((item) => (
                    <MemoryCard key={item.kind + item.id} item={item} />
                  ))}
                </motion.div>
              )}
            </motion.div>
          </>
        )}
      </motion.main>
    </div>
  );
}

function StatCard({ label, value, icon }: { label: string; value: any; icon: React.ReactNode }) {
  return (
    <motion.div variants={cardIn} whileHover={softHover} className="bg-[var(--card-bg)] p-5 rounded-2xl text-center shadow-[var(--card-shadow)] border border-[var(--card-border)]">
      <div className="flex items-center justify-center gap-2 text-[var(--feelup-muted)] text-xs mb-2">
        {icon}
        <span>{label}</span>
      </div>
      <div className="text-2xl font-extrabold text-[var(--brand-blue)]">{value}</div>
      <div className="mt-2 h-px bg-gradient-to-r from-transparent via-[var(--input-border)] to-transparent" />
      <div className="mt-2 text-[11px] text-[var(--feelup-muted)]">Keep going 💪</div>
    </motion.div>
  );
}

function MemoryCard({ item }: { item: MemoryLaneRow }) {
  const title = item.kind === "mood_post" ? `Mood: ${item.title || item.mood || "Mood post"}` : "Journal";
  const when = (() => {
    try {
      return new Date(item.created_at).toLocaleString();
    } catch {
      return item.created_at;
    }
  })();

  return (
    <motion.div variants={cardIn} whileHover={{ y: -1 }} className="p-4 rounded-2xl border border-[var(--card-border)] bg-[var(--input-bg)] hover:bg-[var(--card-bg)] transition shadow-[var(--card-shadow)]">
      <div className="flex items-center justify-between text-xs text-[var(--feelup-muted)]">
        <span className="font-semibold text-[var(--foreground)]">{title}</span>
        <span>{when}</span>
      </div>
      {item.content ? (
        <div className="mt-2 text-sm text-[var(--foreground)] whitespace-pre-wrap">{item.content}</div>
      ) : (
        <div className="mt-2 text-sm text-[var(--feelup-muted)]">(no text)</div>
      )}
    </motion.div>
  );
}

function InsightLine({ label, value }: { label: string; value: string }) {
  return (
    <motion.div variants={cardIn} className="flex items-center justify-between gap-4 p-3 rounded-xl border border-[var(--card-border)] bg-[var(--input-bg)]">
      <span className="text-[var(--feelup-muted)]">{label}</span>
      <span className="font-semibold text-[var(--foreground)]">{value}</span>
    </motion.div>
  );
}
