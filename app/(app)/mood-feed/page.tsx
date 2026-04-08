"use client";

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createBrowserSupabaseClient } from "@/lib/supabaseClient";
import RightSidebar from "@/components/RightSidebar";
import Footer from "@/components/Footer";

/* ---------------- MOODS ---------------- */
const moodOptions = [
  { label: "Happy", emoji: "😊", color: "#fbbf24" },
  { label: "Calm", emoji: "😌", color: "#60a5fa" },
  { label: "Excited", emoji: "🤩", color: "#f472b6" },
  { label: "Grateful", emoji: "🙏", color: "#34d399" },
  { label: "Thoughtful", emoji: "🤔", color: "#a78bfa" },
  { label: "Sad", emoji: "😔", color: "#94a3b8" },
  { label: "Anxious", emoji: "😰", color: "#fb7185" },
  { label: "Tired", emoji: "😴", color: "#6b7280" },
];

/* Supportive reactions only */
const SUPPORTIVE_REACTIONS = [
  { key: "CHEER", label: "Cheer", emoji: "🎉" },
  { key: "SUPPORT", label: "Support", emoji: "💪" },
  { key: "HUG", label: "Hug", emoji: "🤗" },
  { key: "LOVE", label: "Love", emoji: "❤️" },
] as const;

type ReactionKey = (typeof SUPPORTIVE_REACTIONS)[number]["key"];
type Visibility = "public" | "followers" | "mutuals";
type ProfileLite = { full_name: string | null; username: string | null };

const REACTION_COL = "reaction_type";
const PROFILES_FK_REL = "mood_posts_owner_id_fkey"; // your real FK name

function safeErrMsg(err: any) {
  return (
    (typeof err?.message === "string" && err.message) ||
    (typeof err === "string" && err) ||
    "Unknown error"
  );
}

// ✅ NEW: extract hashtags from post text
function extractHashtags(text: string): string[] {
  const matches = text.match(/#([\p{L}\p{N}_]+)/gu) || [];
  const tags = matches
    .map((m) => m.slice(1).toLowerCase().trim())
    .filter(Boolean);
  return Array.from(new Set(tags)).slice(0, 20);
}

function dedupePostsById(list: any[]) {
  const seen = new Set<string>();
  return list.filter((post) => {
    const id = String(post?.id || "");
    if (!id || seen.has(id)) return false;
    seen.add(id);
    return true;
  });
}

export default function MoodFeedPage() {
  const router = useRouter();
  const supabase = useMemo(() => createBrowserSupabaseClient(), []);

  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [posts, setPosts] = useState<any[]>([]);

  // composer
  const [composerOpen, setComposerOpen] = useState(false);
  const [content, setContent] = useState("");
  const [selectedMood, setSelectedMood] = useState<any>(null);
  const [anonymous, setAnonymous] = useState(false);
  const [visibility, setVisibility] = useState<Visibility>("public");
  const [posting, setPosting] = useState(false);

  // energy
  const [energyLevel, setEnergyLevel] = useState<number>(3);

  // AI suggestion (optional)
  const [detectingMood, setDetectingMood] = useState(false);
  const [suggestedMood, setSuggestedMood] = useState<any>(null);
  const [confidence, setConfidence] = useState<number | null>(null);
  const [moodReason, setMoodReason] = useState<string | null>(null);

  // image
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const imageInputRef = useRef<HTMLInputElement | null>(null);

  // comments + reactions
  const [comments, setComments] = useState<Record<string, any[]>>({});
  const [newComment, setNewComment] = useState<Record<string, string>>({});
  const [reactionsMap, setReactionsMap] = useState<Record<string, any>>({});
  const [openComments, setOpenComments] = useState<Record<string, boolean>>({});

  // saved posts map (postId -> true)
  const [savedMap, setSavedMap] = useState<Record<string, boolean>>({});

  // repost modal
  const [repostModal, setRepostModal] = useState<
    null | { post: any; caption: string; visibility: Visibility; anonymous: boolean }
  >(null);
  const [reposting, setReposting] = useState(false);

  // realtime refs
  const openCommentsRef = useRef<Record<string, boolean>>({});

  useEffect(() => {
    openCommentsRef.current = openComments;
  }, [openComments]);

  const logErr = (label: string, err: any, extra?: any) => {
    const msg = safeErrMsg(err);
    const code =
      (typeof err?.code === "string" && err.code) ||
      (typeof err?.status === "number" ? String(err.status) : "");

    if (msg.toLowerCase().includes("auth session missing")) return;
    if (msg.toLowerCase().includes("lockmanager")) return; // Silence harmless Supabase concurrency locks

    console.error(`${label} ${code ? `[${code}]` : ""} ${msg}`);
    if (extra !== undefined) console.error(`${label} extra:`, extra);
  };

  // ✅ NEW: mark user active (for "Active this week")
  const markActive = useCallback(async () => {
    if (!user?.id) return;
    await supabase
      .from("profiles")
      .update({ last_active_at: new Date().toISOString() })
      .eq("id", user.id);
  }, [supabase, user?.id]);

  const pill = (text: string) => (
    <span className="inline-flex items-center rounded-full border border-[var(--card-border)] px-2 py-0.5 text-[11px] text-[var(--feelup-muted)] bg-[var(--input-bg)]">
      {text}
    </span>
  );

  const timeAgo = (date: string) => {
    const diff = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
    if (diff < 60) return "just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  const humanVisibility = (v?: string) => {
    if (v === "followers") return "Friend circle";
    if (v === "mutuals") return "Close friends";
    return "Public";
  };

  const timeOfDayInsight = useMemo(() => {
    const h = new Date().getHours();
    if (h >= 5 && h <= 10) return "🌅 Good morning — what’s your plan for today?";
    if (h >= 11 && h <= 16) return "☀️ Midday check-in — how’s your day going so far?";
    if (h >= 17 && h <= 21) return "🌇 Evening — how did your day go?";
    return "🌙 Late night — how was your day? Be kind to yourself.";
  }, [composerOpen]);

  const visiblePosts = useMemo(() => dedupePostsById(posts), [posts]);

  /* ---------------- AUTH ---------------- */
  useEffect(() => {
    let mounted = true;

    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;

      const u = data.session?.user ?? null;
      if (!u) {
        router.replace("/login");
        return;
      }

      setUser(u);
      setLoading(false);
    })();

    return () => {
      mounted = false;
    };
  }, [router, supabase]);

  /* ---------------- AI MOOD SUGGESTION ---------------- */
  useEffect(() => {
    if (selectedMood) return;

    const txt = content.trim();
    if (txt.length < 8) {
      setSuggestedMood(null);
      setConfidence(null);
      setMoodReason(null);
      return;
    }
    if (posting) return;

    const timer = setTimeout(async () => {
      setDetectingMood(true);
      try {
        const res = await fetch("/api/detect-mood", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: txt }),
        });

        const data = await res.json();
        const mood = moodOptions.find(
          (m) => m.label.toLowerCase() === String(data?.mood || "").toLowerCase()
        );

        if (mood) {
          setSuggestedMood(mood);
          setConfidence(typeof data?.confidence === "number" ? data.confidence : null);
          setMoodReason(typeof data?.reason === "string" ? data.reason : null);
        } else {
          setSuggestedMood(null);
          setConfidence(null);
          setMoodReason(null);
        }
      } catch (e) {
        console.error("detect-mood error:", e);
      } finally {
        setDetectingMood(false);
      }
    }, 800);

    return () => clearTimeout(timer);
  }, [content, selectedMood, posting]);

  const useSuggestion = () => {
    if (!suggestedMood) return;
    setSelectedMood(suggestedMood);
    setSuggestedMood(null);
  };

  /* ---------------- REACTIONS ---------------- */
  const loadReactions = useCallback(
    async (postId: string) => {
      if (!postId) return;

      const res = await supabase
        .from("post_reactions")
        .select(REACTION_COL)
        .eq("post_id", postId);

      if (res.error) {
        logErr("LOAD REACTIONS ERROR:", res.error, res);
        setReactionsMap((p) => ({ ...p, [postId]: p[postId] || {} }));
        return;
      }

      const counts: Record<string, number> = {
        CHEER: 0,
        SUPPORT: 0,
        HUG: 0,
        LOVE: 0,
      };

      (res.data || []).forEach((r: any) => {
        const key = r?.[REACTION_COL] as string | undefined;
        if (!key) return;
        counts[key] = (counts[key] || 0) + 1;
      });

      setReactionsMap((p) => ({ ...p, [postId]: counts }));
    },
    [supabase]
  );

  const toggleReaction = async (postId: string, reactionKey: ReactionKey) => {
    if (!user) return;
    if (!postId) return;

    const sel = await supabase
      .from("post_reactions")
      .select("id")
      .eq("post_id", postId)
      .eq("user_id", user.id)
      .eq(REACTION_COL, reactionKey)
      .maybeSingle();

    if (sel.error) {
      logErr("toggleReaction select error:", sel.error, sel);
      return;
    }

    if (sel.data?.id) {
      const del = await supabase.from("post_reactions").delete().eq("id", sel.data.id);
      if (del.error) logErr("toggleReaction delete error:", del.error, del);
    } else {
      // Guard against stale cards (post removed between render and click).
      const postExists = await supabase
        .from("mood_posts")
        .select("id")
        .eq("id", postId)
        .maybeSingle();

      if (postExists.error || !postExists.data?.id) {
        logErr("toggleReaction post missing:", postExists.error || "Post no longer exists", postExists);
        await loadPosts();
        return;
      }

      const ins = await supabase.from("post_reactions").insert({
        post_id: postId,
        user_id: user.id,
        reaction_type: reactionKey,
      });
      if (ins.error) {
        // 23503 = FK violation (post deleted/raced). Refresh feed to clear stale cards.
        if (String(ins.error.code) === "23503") {
          await loadPosts();
          return;
        }

        logErr("toggleReaction insert error:", ins.error, ins);
        return;
      }
    }

    // ✅ mark active
    markActive();

    loadReactions(postId);
  };

  /* ---------------- SAVED POSTS ---------------- */
  const loadSavedForFeed = useCallback(
    async (postIds: string[]) => {
      if (!user?.id) return;
      if (postIds.length === 0) {
        setSavedMap({});
        return;
      }

      const res = await supabase
        .from("saved_posts")
        .select("post_id")
        .eq("user_id", user.id)
        .in("post_id", postIds);

      if (res.error) {
        logErr("LOAD SAVED ERROR:", res.error, res);
        return;
      }

      const map: Record<string, boolean> = {};
      (res.data || []).forEach((r: any) => {
        if (r?.post_id) map[r.post_id] = true;
      });
      setSavedMap(map);
    },
    [supabase, user?.id]
  );

  const toggleSave = async (postId: string) => {
    if (!user?.id) return;

    const isSaved = !!savedMap[postId];
    setSavedMap((p) => ({ ...p, [postId]: !isSaved }));

    if (isSaved) {
      const del = await supabase
        .from("saved_posts")
        .delete()
        .eq("user_id", user.id)
        .eq("post_id", postId);

      if (del.error) {
        setSavedMap((p) => ({ ...p, [postId]: true }));
        alert(del.error.message || "Failed to unsave");
        return;
      }
    } else {
      const ins = await supabase.from("saved_posts").insert({ user_id: user.id, post_id: postId });

      if (ins.error) {
        setSavedMap((p) => ({ ...p, [postId]: false }));
        alert(ins.error.message || "Failed to save");
        return;
      }
    }

    // ✅ mark active
    markActive();
  };

  /* ---------------- LOAD POSTS ---------------- */
  const loadPosts = useCallback(async () => {
    const res = await supabase
      .from("mood_posts")
      .select(
        `
        id,
        content,
        mood,
        mood_emoji,
        mood_color,
        image_url,
        anonymous,
        visibility,
        owner_id,
        created_at,
        energy_level,
        reposted_from,
        hashtags,
        profiles:profiles!${PROFILES_FK_REL} (
          full_name,
          username
        )
      `
      )
      .order("created_at", { ascending: false });

    if (res.error) {
      logErr("LOAD POSTS ERROR:", res.error, res);
      alert(`Failed to load posts: ${res.error.message || "Unknown error"}`);
      return;
    }

    const list = dedupePostsById(res.data || []);

    const ids = list.map((p: any) => p.id).filter(Boolean);
    loadSavedForFeed(ids);

    const originalIds = Array.from(new Set(list.map((p: any) => p.reposted_from).filter(Boolean)));

    let originalsById: Record<string, any> = {};
    if (originalIds.length > 0) {
      const originalsRes = await supabase
        .from("mood_posts")
        .select(
          `
          id,
          content,
          mood,
          mood_emoji,
          mood_color,
          image_url,
          owner_id,
          created_at,
          hashtags
        `
        )
        .in("id", originalIds);

      if (!originalsRes.error) {
        originalsById = Object.fromEntries((originalsRes.data || []).map((o: any) => [o.id, o]));
      }
    }

    const merged = list.map((p: any) => ({
      ...p,
      original: p.reposted_from ? originalsById[p.reposted_from] || null : null,
    }));

    setPosts(merged);

    merged.forEach((p: any) => {
      if (p?.id) loadReactions(p.id);
    });
  }, [supabase, loadReactions, loadSavedForFeed]);

  useEffect(() => {
    if (user) loadPosts();
  }, [user, loadPosts]);

  /* ---------------- COMMENTS (✅ FIXED: post_comments table) ---------------- */
  const loadComments = useCallback(
    async (postId: string) => {
      const res = await supabase
        .from("post_comments")
        .select("id, post_id, user_id, content, anonymous, created_at")
        .eq("post_id", postId)
        .order("created_at");

      if (res.error) {
        logErr("LOAD COMMENTS ERROR:", res.error, res);
        return;
      }

      const list = res.data || [];
      const userIds = Array.from(new Set(list.map((c: any) => c.user_id).filter(Boolean)));

      let profilesById: Record<string, any> = {};
      if (userIds.length > 0) {
        const profRes = await supabase.from("profiles").select("id, full_name, username").in("id", userIds);

        if (!profRes.error) {
          profilesById = Object.fromEntries((profRes.data || []).map((p: any) => [p.id, p]));
        } else {
          logErr("LOAD COMMENT PROFILES ERROR:", profRes.error, profRes);
        }
      }

      const merged = list.map((c: any) => ({
        ...c,
        profiles: profilesById[c.user_id] || null,
      }));

      setComments((p) => ({ ...p, [postId]: merged }));
    },
    [supabase]
  );

  const toggleCommentsPanel = async (postId: string) => {
    const next = !openComments[postId];
    setOpenComments((p) => ({ ...p, [postId]: next }));
    if (next) await loadComments(postId);
  };

  const addComment = async (postId: string) => {
    if (!user) return;
    const text = (newComment[postId] ?? "").trim();
    if (!text) return;

    const res = await supabase.from("post_comments").insert({
      post_id: postId,
      user_id: user.id,
      user_email: user.email ?? null,
      content: text,
      anonymous: false, // keep comment names visible; change if you want
    });

    if (res.error) {
      alert(res.error.message || "Comment rejected.");
      logErr("ADD COMMENT ERROR:", res.error, res);
      return;
    }

    // ✅ mark active
    markActive();

    setNewComment((p) => ({ ...p, [postId]: "" }));
    loadComments(postId);
  };

  /* ---------------- CREATE POST (✅ hashtags + last_active_at) ---------------- */
  const submitPost = async () => {
    if (!user) return alert("User not ready. Please refresh.");
    if (!selectedMood) return alert("Please select a mood (or use suggestion)");

    setPosting(true);

    try {
      let image_url: string | null = null;

      if (imageFile) {
        const path = `${user.id}/${Date.now()}_${imageFile.name}`;
        const up = await supabase.storage.from("mood-images").upload(path, imageFile, { upsert: false });

        if (up.error) {
          alert("Failed to upload image: " + up.error.message);
          logErr("Image upload error:", up.error, up);
          return;
        }

        image_url = supabase.storage.from("mood-images").getPublicUrl(up.data.path).data.publicUrl;
      }

      // ✅ NEW: tags from content
      const tags = extractHashtags(content || "");

      const payload: any = {
        content: content.trim() ? content.trim() : null,
        mood: selectedMood.label,
        mood_emoji: selectedMood.emoji,
        mood_color: selectedMood.color,
        anonymous,
        visibility,
        owner_id: user.id,
        image_url,
        energy_level: energyLevel,

        // ✅ NEW
        hashtags: tags,
      };

      const ins = await supabase.from("mood_posts").insert(payload);

      if (ins.error) {
        alert(ins.error.message || "Failed to share post");
        logErr("Post insert error:", ins.error, ins);
        return;
      }

      // ✅ NEW: mark active
      await markActive();

      setContent("");
      setSelectedMood(null);
      setSuggestedMood(null);
      setConfidence(null);
      setMoodReason(null);
      setAnonymous(false);
      setVisibility("public");
      setImageFile(null);
      setEnergyLevel(3);

      if (imagePreview) URL.revokeObjectURL(imagePreview);
      setImagePreview(null);

      setComposerOpen(false);
      loadPosts();
    } finally {
      setPosting(false);
    }
  };

  /* ---------------- REPOST (optional: hashtags from caption + original) ---------------- */
  const openRepost = (post: any) => {
    setRepostModal({
      post,
      caption: "",
      visibility: "public",
      anonymous: false,
    });
  };

  const doRepost = async () => {
    if (!user?.id || !repostModal) return;

    setReposting(true);
    try {
      const original = repostModal.post?.original || repostModal.post;

      // tags: caption tags + original tags (merged)
      const captionTags = extractHashtags(repostModal.caption || "");
      const originalTags: string[] = Array.isArray(original?.hashtags) ? original.hashtags : [];
      const tags = Array.from(new Set([...captionTags, ...originalTags])).slice(0, 20);

      const payload: any = {
        owner_id: user.id,
        content: repostModal.caption.trim() ? repostModal.caption.trim() : null,
        mood: original?.mood || null,
        mood_emoji: original?.mood_emoji || null,
        mood_color: original?.mood_color || null,
        image_url: original?.image_url || null,
        visibility: repostModal.visibility,
        anonymous: repostModal.anonymous,
        reposted_from: original?.id,
        energy_level: null,
        hashtags: tags,
      };

      const ins = await supabase.from("mood_posts").insert(payload);

      if (ins.error) {
        alert(ins.error.message || "Failed to repost");
        return;
      }

      await markActive();

      setRepostModal(null);
      loadPosts();
    } finally {
      setReposting(false);
    }
  };

  /* ---------------- REALTIME ---------------- */
  useEffect(() => {
    const postsChannel = supabase
      .channel("realtime-posts")
      .on("postgres_changes", { event: "*", schema: "public", table: "mood_posts" }, () => loadPosts())
      .subscribe();

    const reactionsChannel = supabase
      .channel("realtime-reactions")
      .on("postgres_changes", { event: "*", schema: "public", table: "post_reactions" }, (payload) => {
        const postId = (payload.new as any)?.post_id || (payload.old as any)?.post_id;
        if (postId) loadReactions(postId);
      })
      .subscribe();

    // ✅ FIXED table name: post_comments
    const commentsChannel = supabase
      .channel("realtime-comments")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "post_comments" }, (payload) => {
        const postId = (payload.new as any)?.post_id;
        if (postId && openCommentsRef.current[postId]) {
          loadComments(postId);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(postsChannel);
      supabase.removeChannel(reactionsChannel);
      supabase.removeChannel(commentsChannel);
    };
  }, [supabase, loadPosts, loadReactions, loadComments]);

  if (loading) return <div className="p-10 text-center">Loading…</div>;

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] transition-colors duration-300">
      <main className="max-w-6xl mx-auto p-4 grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
        <div className="space-y-6">
          {/* Composer */}
          <div className="glass rounded-[1.25rem] p-5 border border-[var(--card-border)] bg-[var(--card-bg)] shadow-sm">
            {!composerOpen ? (
              <button
                onClick={() => setComposerOpen(true)}
                className="w-full text-left text-[var(--feelup-muted)] hover:text-[var(--foreground)]"
                type="button"
              >
                Start a post…
              </button>
            ) : (
              <>
                <div className="mb-3 text-sm text-[var(--feelup-muted)] font-medium">{timeOfDayInsight}</div>

                <textarea
                  className="w-full bg-transparent border-none p-3 resize-none text-[var(--foreground)] placeholder-[var(--feelup-muted)] focus:ring-0 outline-none text-[16px] leading-relaxed transition-all min-h-[80px]"
                  placeholder="How are you feeling? (optional)  Try #happy #study"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                />

                {/* AI suggestion */}
                {detectingMood ? (
                  <p className="text-xs text-[var(--brand-blue)] mt-2 font-medium animate-pulse">🧠 Suggesting a mood…</p>
                ) : suggestedMood && !selectedMood ? (
                  <div className="mt-3 rounded-2xl border border-[var(--card-border)] bg-[var(--input-bg)] p-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-sm font-medium text-[var(--foreground)]">
                        Suggested:{" "}
                        <span className="font-bold">
                          {suggestedMood.emoji} {suggestedMood.label}
                        </span>
                        {confidence !== null ? (
                          <span className="ml-2 text-xs text-[var(--feelup-muted)]">(AI {confidence}%)</span>
                        ) : null}
                      </div>
                      <button
                        type="button"
                        onClick={useSuggestion}
                        className="text-xs px-3 py-1.5 rounded-full bg-[var(--brand-blue)] text-white hover:brightness-110 shadow-sm transition-all font-semibold"
                      >
                        Use suggestion
                      </button>
                    </div>
                    {moodReason ? <div className="mt-1 text-xs text-[var(--feelup-muted)]">🧠 {moodReason}</div> : null}
                  </div>
                ) : null}

                {/* Mood picker */}
                {selectedMood ? (
                  <div className="mt-2 flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-bold text-[var(--foreground)]">
                      {selectedMood.emoji} {selectedMood.label}
                    </span>
                    <button
                      type="button"
                      className="text-xs px-3 py-1.5 rounded-full border border-[var(--card-border)] bg-[var(--input-bg)] hover:bg-[var(--card-border)] text-[var(--foreground)] transition-colors"
                      onClick={() => setSelectedMood(null)}
                    >
                      Change
                    </button>
                  </div>
                ) : null}

                <div className="flex flex-wrap gap-2 mt-3">
                  {moodOptions.map((m) => (
                    <button
                      key={m.label}
                      onClick={() => {
                        setSelectedMood(m);
                        setSuggestedMood(null);
                        setConfidence(null);
                        setMoodReason(null);
                      }}
                      className="px-3 py-1.5 rounded-full text-sm border border-[var(--card-border)] bg-[var(--card-bg)] text-[var(--foreground)] hover:bg-[var(--input-bg)] transition-colors"
                      type="button"
                    >
                      {m.emoji} {m.label}
                    </button>
                  ))}
                </div>

                {/* Energy */}
                <div className="mt-4 bg-[var(--input-bg)] border border-[var(--card-border)] rounded-2xl p-3">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-semibold text-[var(--foreground)]">Energy ⚡</div>
                    <span className="inline-flex items-center rounded-full border border-[var(--card-border)] px-2 py-0.5 text-[11px] font-medium text-[var(--feelup-muted)] bg-[var(--card-bg)]">
                      {energyLevel <= 2 ? "Low" : energyLevel === 3 ? "Medium" : "High"}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center gap-3">
                    <span className="text-sm grayscale opacity-70">😴</span>
                    <input
                      type="range"
                      min={1}
                      max={5}
                      value={energyLevel}
                      onChange={(e) => setEnergyLevel(Number(e.target.value))}
                      className="w-full accent-[var(--brand-blue)]"
                    />
                    <span className="text-sm grayscale opacity-70">🚀</span>
                  </div>
                </div>

                {/* Visibility + Anonymous */}
                <div className="mt-4 flex items-center gap-3">
                  <span className="text-sm font-medium text-[var(--feelup-muted)]">Visibility</span>
                  <select
                    className="border border-[var(--card-border)] rounded-full px-3 py-1.5 text-sm bg-[var(--input-bg)] text-[var(--foreground)] outline-none focus:ring-2 focus:ring-[var(--brand-blue)] transition-all font-medium"
                    value={visibility}
                    onChange={(e) => setVisibility(e.target.value as Visibility)}
                  >
                    <option value="public">Public</option>
                    <option value="followers">Friend circle (followers)</option>
                    <option value="mutuals">Close friends (mutuals)</option>
                  </select>

                  <label className="ml-auto text-sm font-medium text-[var(--feelup-muted)] flex items-center gap-2 cursor-pointer hover:text-[var(--foreground)] transition-colors">
                    <input
                      type="checkbox"
                      checked={anonymous}
                      onChange={(e) => setAnonymous(e.target.checked)}
                      className="rounded border-[var(--input-border)] text-[var(--brand-blue)] focus:ring-[var(--brand-blue)] accent-[var(--brand-blue)] w-4 h-4 transition-all"
                    />
                    Anonymous
                  </label>
                </div>

                {/* Image */}
                {imagePreview && (
                  <div className="mt-4">
                    <img
                      src={imagePreview}
                      className="rounded-2xl max-h-[420px] w-full object-cover border"
                      alt="preview"
                    />
                  </div>
                )}

                <div className="flex items-center justify-between mt-4 gap-2">
                  <button
                    type="button"
                    onClick={() => imageInputRef.current?.click()}
                    className="text-sm border border-[var(--card-border)] px-3 py-2 rounded-xl hover:bg-[var(--input-bg)] text-[var(--foreground)]"
                  >
                    Add Image
                  </button>

                  <input
                    ref={imageInputRef}
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) {
                        setImageFile(f);
                        if (imagePreview) URL.revokeObjectURL(imagePreview);
                        setImagePreview(URL.createObjectURL(f));
                      }
                    }}
                  />

                  <button
                    disabled={!selectedMood || posting}
                    onClick={submitPost}
                    className="bg-[var(--brand-blue)] disabled:opacity-40 text-white px-4 py-2 rounded-xl hover:brightness-110"
                    type="button"
                  >
                    {posting ? "Posting..." : "Share ✨"}
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Posts */}
          <div className="space-y-4">
            {visiblePosts.map((post) => {
              const name = post.anonymous
                ? "Anonymous"
                : (post.profiles as ProfileLite | null)?.full_name ||
                  (post.profiles as ProfileLite | null)?.username ||
                  "User";

              const isSaved = !!savedMap[post.id];
              const original = post.original as any | null;
              const isRepost = !!post.reposted_from;

              return (
                <div key={post.id} className="rounded-2xl shadow-sm border border-[var(--card-border)] bg-[var(--card-bg)] p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="text-sm text-[var(--feelup-muted)]">
                      <div className="font-medium text-[var(--foreground)]">{name}</div>
                      <div className="text-xs text-[var(--feelup-muted)] mt-0.5 flex items-center gap-2 flex-wrap">
                        <span>{timeAgo(post.created_at)}</span>
                        <span>•</span>
                        <span>{humanVisibility(post.visibility)}</span>
                        {typeof post.energy_level === "number" ? (
                          <>
                            <span>•</span>
                            <span>⚡ {post.energy_level}/5</span>
                          </>
                        ) : null}
                        {isRepost ? (
                          <>
                            <span>•</span>
                            <span>↪️ Repost</span>
                          </>
                        ) : null}
                      </div>

                      {/* ✅ show hashtags */}
                      {Array.isArray(post.hashtags) && post.hashtags.length > 0 ? (
                        <div className="mt-1 text-xs text-[var(--brand-blue)] flex flex-wrap gap-2">
                          {post.hashtags.slice(0, 8).map((t: string) => (
                            <span key={t} className="px-2 py-0.5 rounded-full bg-[var(--input-bg)] border border-[var(--card-border)]">
                              #{t}
                            </span>
                          ))}
                        </div>
                      ) : null}
                    </div>

                    {/* Save button */}
                    <button
                      type="button"
                      onClick={() => toggleSave(post.id)}
                      className="text-xs px-3 py-1.5 rounded-full border border-[var(--card-border)] hover:bg-[var(--input-bg)] text-[var(--foreground)]"
                      title={isSaved ? "Unsave" : "Save"}
                    >
                      {isSaved ? "🔖 Saved" : "🔖 Save"}
                    </button>
                  </div>

                  {/* Post content */}
                  <div className="mt-3 text-[var(--foreground)]">
                    <div className="text-base">
                      <span className="mr-2">{post.mood_emoji}</span>
                      {post.content ? (
                        <span className="whitespace-pre-wrap">{post.content}</span>
                      ) : (
                        <span className="text-[var(--feelup-muted)]">(no text)</span>
                      )}
                    </div>

                    {post.image_url ? (
                      <img
                        src={post.image_url}
                        className="mt-3 rounded-2xl max-h-[520px] w-full object-cover border"
                        alt="post"
                      />
                    ) : null}

                    {/* Original card (for repost) */}
                    {isRepost && original ? (
                      <div className="mt-3 border border-[var(--card-border)] rounded-2xl p-3 bg-[var(--input-bg)]">
                        <div className="text-xs text-[var(--feelup-muted)] mb-1">Original</div>
                        <div className="text-sm text-[var(--foreground)]">
                          <span className="mr-2">{original.mood_emoji}</span>
                          {original.content ? (
                            <span className="whitespace-pre-wrap">{original.content}</span>
                          ) : (
                            <span className="text-[var(--feelup-muted)]">(no text)</span>
                          )}
                        </div>
                        {original.image_url ? (
                          <img
                            src={original.image_url}
                            className="mt-2 rounded-xl max-h-[420px] w-full object-cover border"
                            alt="original"
                          />
                        ) : null}
                      </div>
                    ) : null}
                  </div>

                  {/* Actions */}
                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      {SUPPORTIVE_REACTIONS.map((r) => (
                        <button
                          key={r.key}
                          onClick={() => toggleReaction(post.id, r.key)}
                          type="button"
                          className="text-sm border border-[var(--card-border)] rounded-full px-3 py-1.5 hover:bg-[var(--input-bg)] flex items-center gap-2 text-[var(--foreground)]"
                          title={r.label}
                        >
                          <span>{r.emoji}</span>
                          <span className="text-[var(--foreground)]">{reactionsMap[post.id]?.[r.key] ?? 0}</span>
                        </button>
                      ))}

                      {/* Repost */}
                      <button
                        type="button"
                        onClick={() => openRepost(post)}
                        className="text-sm border border-[var(--card-border)] rounded-full px-3 py-1.5 hover:bg-[var(--input-bg)] text-[var(--foreground)]"
                        title="Repost"
                      >
                        ↪️ Repost
                      </button>
                    </div>

                    <div className="ml-auto">
                      <button
                        className="text-sm text-[var(--brand-blue)] hover:underline"
                        onClick={() => toggleCommentsPanel(post.id)}
                        type="button"
                      >
                        💬 {openComments[post.id] ? "Hide comments" : "Comments"}
                      </button>
                    </div>
                  </div>

                  {/* Comments */}
                  {openComments[post.id] && (
                    <div className="mt-3">
                      <div className="space-y-2">
                        {(comments[post.id] || []).map((c) => {
                          const commenterName =
                            c.anonymous
                              ? "Anonymous"
                              : c.profiles?.full_name || c.profiles?.username || "User";

                          return (
                            <div key={c.id} className="text-sm">
                              <span className="font-medium text-[var(--foreground)]">{commenterName}</span>
                              <span className="text-[var(--feelup-muted)]"> · </span>
                              <span className="text-[var(--foreground)]">{c.content}</span>
                            </div>
                          );
                        })}
                      </div>

                      <div className="flex gap-2 mt-3">
                        <input
                          className="border border-[var(--card-border)] bg-[var(--input-bg)] text-[var(--foreground)] placeholder:text-[var(--feelup-muted)] rounded-xl px-3 py-2 text-sm flex-1 focus:outline-none focus:ring-2 focus:ring-[var(--brand-blue)]"
                          value={newComment[post.id] || ""}
                          onChange={(e) =>
                            setNewComment((p) => ({
                              ...p,
                              [post.id]: e.target.value,
                            }))
                          }
                          placeholder="No links. Keep it supportive…"
                        />
                        <button
                          onClick={() => addComment(post.id)}
                          className="text-sm bg-[var(--brand-blue)] hover:brightness-110 text-white px-4 rounded-xl"
                          type="button"
                        >
                          Send
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <RightSidebar userEmail={user?.email} />
      </main>

      <Footer />

      {/* Repost Modal */}
      {repostModal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4">
          <div className="bg-[var(--card-bg)] p-6 rounded-2xl w-full max-w-md space-y-4 border border-[var(--card-border)] text-[var(--foreground)]">
            <div className="text-lg font-semibold">↪️ Repost</div>

            <textarea
              className="w-full border border-[var(--card-border)] bg-[var(--input-bg)] text-[var(--foreground)] placeholder:text-[var(--feelup-muted)] rounded-xl px-3 py-2"
              placeholder="Add a caption (optional)  Try #motivation"
              value={repostModal.caption}
              onChange={(e) =>
                setRepostModal((p) => (p ? { ...p, caption: e.target.value } : p))
              }
            />

            <div className="flex items-center gap-2">
              <span className="text-sm text-[var(--feelup-muted)]">Visibility</span>
              <select
                className="border border-[var(--card-border)] rounded-lg px-3 py-1.5 text-sm bg-[var(--input-bg)] text-[var(--foreground)]"
                value={repostModal.visibility}
                onChange={(e) =>
                  setRepostModal((p) =>
                    p ? { ...p, visibility: e.target.value as Visibility } : p
                  )
                }
              >
                <option value="public">Public</option>
                <option value="followers">Friend circle (followers)</option>
                <option value="mutuals">Close friends (mutuals)</option>
              </select>

              <label className="ml-auto text-sm text-[var(--feelup-muted)] flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={repostModal.anonymous}
                  onChange={(e) =>
                    setRepostModal((p) => (p ? { ...p, anonymous: e.target.checked } : p))
                  }
                />
                Anonymous
              </label>
            </div>

            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => setRepostModal(null)}
                className="px-4 py-2 rounded border border-[var(--card-border)] bg-[var(--input-bg)] text-[var(--foreground)]"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={doRepost}
                disabled={reposting}
                className="px-4 py-2 rounded bg-[var(--brand-blue)] hover:brightness-110 text-white disabled:opacity-60"
              >
                {reposting ? "Reposting..." : "Repost"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
