"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createBrowserSupabaseClient } from "@/lib/supabaseClient";
import PeerMatch from "@/components/PeerMatch";
import CreateCircleModal from "@/components/CreateCircleModal";
import {
  Users,
  Sparkles,
  CalendarDays,
  Flame,
  Search,
  ChevronRight,
  Plus,
  MapPin,
  ArrowRight,
} from "lucide-react";


/**
 * COMMUNITY HUB PAGE (3D UI)
 * ✅ Shows: Circles, Challenges, Upcoming Events, Suggested People
 * ✅ Realtime: circles/members, challenges, events, follows
 * ✅ Safe if tables not created yet: shows graceful "Coming soon" instead of crashing
 */

type Tab = "overview" | "circles" | "challenges";

type Profile = {
  id: string;
  username: string | null;
  full_name: string | null;
};

type Circle = {
  id: string;
  name: string;
  description: string | null;
  visibility: "public" | "followers" | "circle" | string;
  owner_id: string;
  created_at: string;
  members_count?: number;
};

type Challenge = {
  id: string;
  title: string;
  description: string | null;
  starts_on: string | null;
  ends_on: string | null;
  visibility: "public" | "followers" | "circle" | string;
  created_at: string;
  participants_count?: number;
};

type EventRow = {
  id: string;
  title: string;
  description: string | null;
  event_date: string;
  event_time: string | null;
  location: string | null;
  is_virtual: boolean | null;
  category: string | null;
  visibility: string | null;
  created_at: string | null;
};

function cx(...s: Array<string | false | undefined | null>) {
  return s.filter(Boolean).join(" ");
}

function safeErrMsg(err: any) {
  return (
    (typeof err?.message === "string" && err.message) ||
    (typeof err === "string" && err) ||
    "Unknown error"
  );
}

function fmtDate(d?: string | null) {
  if (!d) return "";
  try {
    return new Date(d).toLocaleDateString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  } catch {
    return d;
  }
}

function fmtTime(t?: string | null) {
  if (!t) return "";
  const parts = t.split(":");
  if (parts.length >= 2) return `${parts[0]}:${parts[1]}`;
  return t;
}

function badgeForVisibility(v?: string | null) {
  if (v === "followers")
    return {
      label: "Followers",
      className: "bg-[var(--input-bg)] text-[var(--brand-blue)] border-[var(--brand-blue)]",
    };
  if (v === "circle")
    return {
      label: "Circle",
      className: "bg-[var(--input-bg)] text-[var(--brand-pink)] border-[var(--brand-pink)]",
    };
  return {
    label: "Public",
    className: "bg-[var(--input-bg)] text-[var(--feelup-accent)] border-[var(--feelup-accent)]",
  };
}

function Toast({ msg, onClose }: { msg: string; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 2200);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50">
      <div className="px-4 py-2 rounded-full bg-[var(--foreground)] text-[var(--background)] text-sm shadow-lg">
        {msg}
      </div>
    </div>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] transition-colors duration-300">
      {children}
    </div>
  );
}

function GlassPanel({ children }: { children: React.ReactNode }) {
  return (
    <div className="glass rounded-2xl">
      {children}
    </div>
  );
}

export default function CommunityPage() {
  const router = useRouter();
  const supabase = useMemo(() => createBrowserSupabaseClient(), []);

  const [me, setMe] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [tab, setTab] = useState<Tab>("overview");
  const [query, setQuery] = useState("");
  const [showCircleModal, setShowCircleModal] = useState(false);

  const [circles, setCircles] = useState<Circle[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [events, setEvents] = useState<EventRow[]>([]);
  const [suggested, setSuggested] = useState<Profile[]>([]);

  const [circlesAvailable, setCirclesAvailable] = useState(true);
  const [challengesAvailable, setChallengesAvailable] = useState(true);

  const [toast, setToast] = useState<string | null>(null);
  const showToast = (msg: string) => setToast(msg);

  /* ---------------- AUTH ---------------- */

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (!mounted) return;

      if (!data.user) {
        router.replace("/login");
        return;
      }

      setMe(data.user);
      setLoading(false);
    })();

    return () => {
      mounted = false;
    };
  }, [router, supabase]);

  /* ---------------- LOADERS ---------------- */

  const loadSuggestedPeople = useCallback(async () => {
    const { data: auth } = await supabase.auth.getUser();
    const uid = auth.user?.id;

    const res = await supabase
      .from("profiles")
      .select("id, username, full_name")
      .order("created_at", { ascending: false })
      .limit(8);

    if (res.error) return;

    const list = (res.data || []).filter((p: any) => p.id !== uid);
    setSuggested(list);
  }, [supabase]);

  const loadEvents = useCallback(async () => {
    const res = await supabase
      .from("events")
      .select(
        "id, title, description, event_date, event_time, location, is_virtual, category, visibility, created_at"
      )
      .order("event_date", { ascending: true })
      .limit(12);

    if (res.error) return;
    setEvents(res.data || []);
  }, [supabase]);

  const loadCircles = useCallback(async () => {
    const res = await supabase
      .from("community_circles")
      .select("id, name, description, visibility, owner_id, created_at")
      .order("created_at", { ascending: false })
      .limit(12);

    if (res.error) {
      const msg = safeErrMsg(res.error);
      if (msg.toLowerCase().includes("does not exist")) {
        setCirclesAvailable(false);
        setCircles([]);
        return;
      }
      setCirclesAvailable(true);
      setCircles([]);
      return;
    }

    setCirclesAvailable(true);
    setCircles((res.data || []) as any);
  }, [supabase]);

  const loadChallenges = useCallback(async () => {
    const res = await supabase
      .from("challenges")
      .select("id, title, description, starts_on, ends_on, visibility, created_at")
      .order("created_at", { ascending: false })
      .limit(12);

    if (res.error) {
      const msg = safeErrMsg(res.error);
      if (msg.toLowerCase().includes("does not exist")) {
        setChallengesAvailable(false);
        setChallenges([]);
        return;
      }
      setChallengesAvailable(true);
      setChallenges([]);
      return;
    }

    setChallengesAvailable(true);
    setChallenges((res.data || []) as any);
  }, [supabase]);

  const loadAll = useCallback(async () => {
    await Promise.all([loadCircles(), loadChallenges(), loadEvents(), loadSuggestedPeople()]);
  }, [loadCircles, loadChallenges, loadEvents, loadSuggestedPeople]);

  useEffect(() => {
    if (!me) return;
    loadAll();
  }, [me, loadAll]);

  /* ---------------- REALTIME ---------------- */

  useEffect(() => {
    if (!me) return;

    const ch = supabase
      .channel("community-hub-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "events" }, () => loadEvents())
      .on("postgres_changes", { event: "*", schema: "public", table: "profiles" }, () => loadSuggestedPeople())
      .on("postgres_changes", { event: "*", schema: "public", table: "follows" }, () => loadSuggestedPeople())
      .on("postgres_changes", { event: "*", schema: "public", table: "community_circles" }, () => loadCircles())
      .on("postgres_changes", { event: "*", schema: "public", table: "circle_members" }, () => loadCircles())
      .on("postgres_changes", { event: "*", schema: "public", table: "challenges" }, () => loadChallenges())
      .on("postgres_changes", { event: "*", schema: "public", table: "challenge_participants" }, () => loadChallenges())
      .subscribe();

    return () => {
      supabase.removeChannel(ch);
    };
  }, [me, supabase, loadEvents, loadSuggestedPeople, loadCircles, loadChallenges]);

  /* ---------------- FILTERS ---------------- */

  const q = query.trim().toLowerCase();
  const filteredCircles = circles.filter((c) => {
    if (!q) return true;
    return (c.name || "").toLowerCase().includes(q) || (c.description || "").toLowerCase().includes(q);
  });

  const filteredChallenges = challenges.filter((c) => {
    if (!q) return true;
    return (c.title || "").toLowerCase().includes(q) || (c.description || "").toLowerCase().includes(q);
  });

  const filteredEvents = events.filter((e) => {
    if (!q) return true;
    return (e.title || "").toLowerCase().includes(q) || (e.category || "").toLowerCase().includes(q);
  });

  /* ---------------- UI ---------------- */

  if (loading) {
    return (
      <Shell>
        <div className="min-h-screen flex items-center justify-center text-[var(--feelup-muted)]">
          Loading community…
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      {toast && <Toast msg={toast} onClose={() => setToast(null)} />}

      {showCircleModal && (
        <CreateCircleModal
          onClose={() => setShowCircleModal(false)}
          onCreated={(id) => router.push(`/community/circles/${id}`)}
        />
      )}

      <main className="max-w-7xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-2xl bg-[var(--input-bg)] border border-[var(--card-border)] shadow-sm flex items-center justify-center">
                <Users className="w-6 h-6 text-[var(--brand-blue)]" />
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-[var(--foreground)]">
                Community
              </h1>
            </div>
            <p className="text-[var(--feelup-muted)] max-w-2xl">
              Your hub for <b>Circles</b>, <b>Challenges</b>, and <b>Events</b> — built for safe, supportive growth.
            </p>
          </div>

          {/* Quick actions */}
          <div className="flex flex-wrap gap-2">
            <Link
              href="/explore"
              className="px-4 py-2 rounded-2xl bg-[var(--card-bg)] border border-[var(--card-border)] shadow-sm hover:bg-[var(--input-bg)] text-sm font-semibold text-[var(--foreground)]"
            >
              Find People
            </Link>
            <Link
              href="/events"
              className="px-4 py-2 rounded-2xl bg-[var(--card-bg)] border border-[var(--card-border)] shadow-sm hover:bg-[var(--input-bg)] text-sm font-semibold text-[var(--foreground)]"
            >
              Browse Events
            </Link>
            <Link
              href="/events/create"
              className="px-4 py-2 rounded-2xl bg-[var(--brand-blue)] text-white shadow-sm hover:brightness-110 text-sm font-semibold inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Create Event
            </Link>
          </div>
        </div>

        {/* Search + Tabs */}
        <GlassPanel>
          <div className="p-4">
            <div className="flex flex-col md:flex-row md:items-center gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-[var(--feelup-muted)] absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-2xl border border-[var(--card-border)] bg-[var(--input-bg)] text-[var(--foreground)] placeholder:text-[var(--feelup-muted)] outline-none focus:ring-2 focus:ring-[var(--brand-blue)] shadow-sm"
                  placeholder="Search circles, challenges, or events…"
                />
              </div>

              <div className="flex gap-2">
                <TabButton active={tab === "overview"} onClick={() => setTab("overview")}>
                  Overview
                </TabButton>
                <TabButton active={tab === "circles"} onClick={() => setTab("circles")}>
                  Circles
                </TabButton>
                <TabButton active={tab === "challenges"} onClick={() => setTab("challenges")}>
                  Challenges
                </TabButton>
              </div>
            </div>
          </div>
        </GlassPanel>

        <div className="h-6" />

        {/* CONTENT */}
        {tab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-6">
            {/* Left */}
            <div className="space-y-6">
              {/* Circles */}
              <SectionHeader
                title="Friend Circles 🔒"
                subtitle="Private groups for trusted sharing (best friends, classmates, etc.)."
                right={
                  <Link href="/community/circles" className="text-sm text-[var(--brand-blue)] font-bold hover:underline">
                    View all
                  </Link>
                }
              />

              <div className="grid sm:grid-cols-2 gap-4">
                {!circlesAvailable ? (
                  <ComingSoonCard
                    title="Circles are not enabled yet"
                    description="Create community_circles + circle_members tables (and RLS), then this becomes realtime."
                  />
                ) : filteredCircles.slice(0, 4).length === 0 ? (
                  <EmptyCard
                    icon={<Users className="w-5 h-5" />}
                    title="No circles yet"
                    description="Create your first circle to share safely with a smaller group."
                    action={
                      <Link
                        href="/community/circles/new"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-[var(--brand-blue)] text-white shadow-sm hover:brightness-110 text-sm font-bold"
                      >
                        <Plus className="w-4 h-4" /> Create Circle
                      </Link>
                    }
                  />
                ) : (
                  filteredCircles.slice(0, 4).map((c) => <CircleCard key={c.id} circle={c} />)
                )}
              </div>

              {/* Challenges */}
              <SectionHeader
                title="FeelUp Challenges 🌱"
                subtitle="Weekly/monthly growth challenges that motivate without pressure."
                right={
                  <Link href="/community/challenges" className="text-sm text-[var(--brand-blue)] font-bold hover:underline">
                    View all
                  </Link>
                }
              />

              <div className="grid sm:grid-cols-2 gap-4">
                {!challengesAvailable ? (
                  <ComingSoonCard
                    title="Challenges are not enabled yet"
                    description="Create challenges + challenge_participants tables (and RLS), then this becomes realtime."
                  />
                ) : filteredChallenges.slice(0, 4).length === 0 ? (
                  <EmptyCard
                    icon={<Flame className="w-5 h-5" />}
                    title="No challenges yet"
                    description="Start a simple weekly challenge like “No self-criticism week”."
                  />
                ) : (
                  filteredChallenges.slice(0, 4).map((c) => <ChallengeCard key={c.id} challenge={c} />)
                )}
              </div>

              {/* Events */}
              <SectionHeader
                title="Events & Activities 🗓"
                subtitle="Create or join wellness, study, or fun events — local or virtual."
                right={
                  <Link href="/events" className="text-sm text-[var(--brand-blue)] font-bold hover:underline">
                    View all
                  </Link>
                }
              />

              <div className="grid md:grid-cols-2 gap-4">
                {filteredEvents.slice(0, 6).length === 0 ? (
                  <EmptyCard
                    icon={<CalendarDays className="w-5 h-5" />}
                    title="No events right now"
                    description="Create one and invite followers or your circle."
                    action={
                      <Link
                        href="/events/create"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-[var(--brand-blue)] text-white shadow-sm hover:brightness-110 text-sm font-bold"
                      >
                        <Plus className="w-4 h-4" /> Create Event
                      </Link>
                    }
                  />
                ) : (
                  filteredEvents.slice(0, 6).map((e) => <EventMiniCard key={e.id} ev={e} />)
                )}
              </div>
            </div>

            {/* Right */}
            <div className="space-y-6">
              <GlassPanel>
                <div className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-[var(--brand-blue)]" />
                        <h3 className="font-extrabold text-lg text-[var(--foreground)]">
                          Companion Finder 🧭
                        </h3>
                      </div>
                      <p className="text-sm text-[var(--feelup-muted)] mt-1">
                        Find a study partner, gym buddy, or beach-walk companion — matched by goals & interests.
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <button
                      onClick={() => router.push("/community/companions")}
                      className="px-4 py-3 rounded-2xl bg-[var(--brand-blue)] text-white text-sm font-bold shadow-sm hover:brightness-110"
                      type="button"
                    >
                      Start matching
                    </button>
                    <button
                      onClick={() => router.push("/explore")}
                      className="px-4 py-3 rounded-2xl border border-[var(--card-border)] bg-[var(--card-bg)] hover:bg-[var(--input-bg)] text-sm font-bold text-[var(--foreground)] shadow-sm"
                      type="button"
                    >
                      Explore
                    </button>
                  </div>

                  <div className="mt-4 text-xs text-[var(--feelup-muted)]">
                    Tip: later match using tags like <b>study</b>, <b>gym</b>, <b>walking</b>, <b>wellness</b>.
                  </div>
                </div>
              </GlassPanel>

              {/* ── ML: Semantic Peer Matching ── */}
              <PeerMatch userId={me?.id ?? ""} />

              <GlassPanel>
                <div className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-extrabold text-lg text-[var(--foreground)]">Suggested People</h3>
                    <Link href="/explore" className="text-sm text-[var(--brand-blue)] font-bold hover:underline">
                      See all
                    </Link>
                  </div>

                  <div className="space-y-3">
                    {suggested.length === 0 ? (
                      <div className="text-sm text-[var(--feelup-muted)]">No suggestions yet.</div>
                    ) : (
                      suggested.slice(0, 6).map((p) => (
                        <div key={p.id} className="flex items-center justify-between">
                          <div className="min-w-0">
                            <div className="font-bold text-sm text-[var(--foreground)] truncate">
                              {p.full_name || p.username || "User"}
                            </div>
                            <div className="text-xs text-[var(--feelup-muted)] truncate">
                              {p.username ? `@${p.username}` : "—"}
                            </div>
                          </div>

                          <button
                            onClick={() => router.push(`/profile/${p.id}`)}
                            className="text-sm text-[var(--brand-blue)] font-bold inline-flex items-center gap-1 hover:underline"
                            type="button"
                          >
                            View <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </GlassPanel>

              <GlassPanel>
                <div className="p-6 text-center">
                  <h3 className="text-lg font-extrabold text-[var(--foreground)] mb-2">Community Guidelines</h3>
                  <p className="text-sm text-[var(--feelup-muted)] mb-4">
                    Respect, empathy, and safety are our priorities.
                  </p>
                  <button
                    onClick={() => router.push("/community-guidelines")}
                    className="px-5 py-3 rounded-2xl bg-[var(--brand-blue)] text-white text-sm font-bold shadow-sm hover:brightness-110"
                    type="button"
                  >
                    Read Guidelines
                  </button>
                </div>
              </GlassPanel>
            </div>
          </div>
        )}

        {tab === "circles" && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-extrabold text-[var(--foreground)]">Your Circles</h2>
                <p className="text-sm text-[var(--feelup-muted)]">Private groups for trusted sharing.</p>
              </div>

              <Link
                href="/community/circles/new"
                className="inline-flex items-center gap-2 px-4 py-3 rounded-2xl bg-[var(--brand-blue)] text-white text-sm font-bold shadow-sm hover:brightness-110"
              >
                <Plus className="w-4 h-4" /> Create Circle
              </Link>
            </div>

            {!circlesAvailable ? (
              <ComingSoonCard
                title="Circles not enabled yet"
                description="Create community_circles + circle_members tables and add RLS, then this becomes realtime."
              />
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredCircles.length === 0 ? (
                  <EmptyCard
                    icon={<Users className="w-5 h-5" />}
                    title="No circles found"
                    description="Try a different search or create a new circle."
                  />
                ) : (
                  filteredCircles.map((c) => <CircleCard key={c.id} circle={c} showLink />)
                )}
              </div>
            )}
          </div>
        )}

        {tab === "challenges" && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-extrabold text-[var(--foreground)]">Challenges</h2>
                <p className="text-sm text-[var(--feelup-muted)]">Weekly/monthly growth challenges for gentle accountability.</p>
              </div>

              <button
                onClick={() => router.push("/community/challenges/new")}
                className="inline-flex items-center gap-2 px-4 py-3 rounded-2xl bg-[var(--brand-blue)] text-white text-sm font-bold shadow-sm hover:brightness-110"
                type="button"
              >
                <Plus className="w-4 h-4" /> Create Challenge
              </button>
            </div>

            {!challengesAvailable ? (
              <ComingSoonCard
                title="Challenges not enabled yet"
                description="Create challenges + challenge_participants tables and add RLS, then this becomes realtime."
              />
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredChallenges.length === 0 ? (
                  <EmptyCard
                    icon={<Flame className="w-5 h-5" />}
                    title="No challenges found"
                    description="Try a different search."
                  />
                ) : (
                  filteredChallenges.map((c) => <ChallengeCard key={c.id} challenge={c} showLink />)
                )}
              </div>
            )}
          </div>
        )}
      </main>
    </Shell>
  );
}

/* ---------------- UI COMPONENTS ---------------- */

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cx(
        "px-4 py-3 rounded-2xl text-sm font-extrabold transition border shadow-sm",
        active
          ? "bg-[var(--brand-blue)] text-white border-[var(--brand-blue)]"
          : "bg-[var(--card-bg)] hover:bg-[var(--input-bg)] text-[var(--foreground)] border-[var(--card-border)]"
      )}
      type="button"
    >
      {children}
    </button>
  );
}

function SectionHeader({
  title,
  subtitle,
  right,
}: {
  title: string;
  subtitle: string;
  right?: React.ReactNode;
}) {
  return (
    <div className="flex items-end justify-between gap-4">
      <div>
        <h2 className="text-xl font-extrabold text-[var(--foreground)]">{title}</h2>
        <p className="text-sm text-[var(--feelup-muted)]">{subtitle}</p>
      </div>
      {right}
    </div>
  );
}

function EmptyCard({
  icon,
  title,
  description,
  action,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--card-bg)] p-6 text-center shadow-sm">
      <div className="mx-auto w-12 h-12 rounded-2xl bg-[var(--input-bg)] border border-[var(--card-border)] shadow flex items-center justify-center text-[var(--foreground)]">
        {icon}
      </div>
      <h3 className="mt-3 font-extrabold text-[var(--foreground)]">{title}</h3>
      <p className="text-sm text-[var(--feelup-muted)] mt-1">{description}</p>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}

function ComingSoonCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--card-bg)] p-6 shadow-sm">
      <div className="flex items-center gap-2 text-[var(--brand-blue)] font-extrabold">
        <Sparkles className="w-4 h-4" />
        Coming soon
      </div>
      <div className="mt-2 text-lg font-extrabold text-[var(--foreground)]">{title}</div>
      <div className="mt-1 text-sm text-[var(--feelup-muted)]">{description}</div>
    </div>
  );
}

function CircleCard({ circle, showLink }: { circle: Circle; showLink?: boolean }) {
  const vis = badgeForVisibility(circle.visibility || "public");

  return (
    <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--card-bg)] p-5 shadow-sm transition-transform duration-200 hover:-translate-y-0.5">
      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="font-extrabold text-[var(--foreground)] truncate">{circle.name}</div>
          <div className="text-sm text-[var(--feelup-muted)] mt-1 line-clamp-2">
            {circle.description || "A trusted space for sharing."}
          </div>
        </div>

        <span className={`shrink-0 text-xs border px-2 py-1 rounded-full ${vis.className} shadow-sm`}>
          <b>{vis.label}</b>
        </span>
      </div>

      <div className="relative mt-4 flex items-center justify-between text-xs text-[var(--feelup-muted)]">
        <span>Created {fmtDate(circle.created_at)}</span>
        {showLink ? (
          <Link
            href={`/community/circles/${circle.id}`}
            className="text-[var(--brand-blue)] font-extrabold hover:underline inline-flex items-center gap-1"
          >
            Open <ChevronRight className="w-4 h-4" />
          </Link>
        ) : (
          <span className="text-[var(--feelup-muted)]">Preview</span>
        )}
      </div>
    </div>
  );
}

function ChallengeCard({ challenge, showLink }: { challenge: Challenge; showLink?: boolean }) {
  const vis = badgeForVisibility(challenge.visibility || "public");
  return (
    <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--card-bg)] p-5 shadow-sm transition-transform duration-200 hover:-translate-y-0.5">
      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="font-extrabold text-[var(--foreground)] truncate">{challenge.title}</div>
          <div className="text-sm text-[var(--feelup-muted)] mt-1 line-clamp-2">
            {challenge.description || "A gentle challenge to help you grow."}
          </div>
        </div>

        <span className={`shrink-0 text-xs border px-2 py-1 rounded-full ${vis.className} shadow-sm`}>
          <b>{vis.label}</b>
        </span>
      </div>

      <div className="relative mt-4 flex items-center justify-between text-xs text-[var(--feelup-muted)]">
        <span>
          {challenge.starts_on ? fmtDate(challenge.starts_on) : "Start soon"}{" "}
          {challenge.ends_on ? `→ ${fmtDate(challenge.ends_on)}` : ""}
        </span>

        {showLink ? (
          <Link
            href={`/community/challenges/${challenge.id}`}
            className="text-[var(--brand-blue)] font-extrabold hover:underline inline-flex items-center gap-1"
          >
            Open <ChevronRight className="w-4 h-4" />
          </Link>
        ) : (
          <span className="text-[var(--feelup-muted)]">Preview</span>
        )}
      </div>
    </div>
  );
}

function EventMiniCard({ ev }: { ev: EventRow }) {
  const vis = badgeForVisibility(ev.visibility || "public");

  return (
    <Link
      href={`/events/${ev.id}`}
      className="rounded-2xl border border-[var(--card-border)] bg-[var(--card-bg)] p-5 shadow-sm transition-transform duration-200 hover:-translate-y-0.5"
    >
      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="font-extrabold text-[var(--foreground)] truncate">{ev.title}</div>
          <div className="text-sm text-[var(--feelup-muted)] mt-1 line-clamp-2">
            {ev.description || "Tap to view details."}
          </div>
        </div>

        <span className={`shrink-0 text-xs border px-2 py-1 rounded-full ${vis.className} shadow-sm`}>
          <b>{vis.label}</b>
        </span>
      </div>

      <div className="relative mt-4 flex items-center justify-between text-xs text-[var(--feelup-muted)]">
        <span>
          {fmtDate(ev.event_date)} {ev.event_time ? `· ${fmtTime(ev.event_time)}` : ""}
        </span>
        <span className="text-[var(--brand-blue)] font-extrabold inline-flex items-center gap-1">
          View <ArrowRight className="w-4 h-4" />
        </span>
      </div>

      <div className="relative mt-2 text-xs text-[var(--feelup-muted)] inline-flex items-center gap-2">
        {ev.is_virtual ? (
          <span>💻 Virtual</span>
        ) : ev.location ? (
          <span className="inline-flex items-center gap-1">
            <MapPin className="w-3 h-3" /> {ev.location}
          </span>
        ) : (
          <span>📍 Location TBD</span>
        )}
        {ev.category ? <span>· 🏷 {ev.category}</span> : null}
      </div>
    </Link>
  );
}
