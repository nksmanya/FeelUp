"use client";

import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { createBrowserSupabaseClient } from "../../lib/supabaseClient";
import { useRouter } from "next/navigation";
import Navbar from "../../components/Navbar";
import RightSidebar from "../../components/RightSidebar";
import Footer from "../../components/Footer";
import { useSession, signOut as nextAuthSignOut } from "next-auth/react";

// Mood options with emojis and colors
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

// Positive reaction types
const reactionTypes = [
  { type: "cheer", emoji: "🎉", label: "Cheer" },
  { type: "support", emoji: "💪", label: "Support" },
  { type: "hug", emoji: "🤗", label: "Hug" },
  { type: "care", emoji: "❤️", label: "Care" },
];

export default function MoodFeedPage() {
  const { data: nextSession, status: nextSessionStatus } = useSession();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [selectedMood, setSelectedMood] = useState<any>(null);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [newPost, setNewPost] = useState("");
  const [postReactions, setPostReactions] = useState<{ [key: string]: any }>(
    {},
  );
  const [postComments, setPostComments] = useState<{ [key: string]: any[] }>(
    {},
  );
  const [showComments, setShowComments] = useState<{ [key: string]: boolean }>(
    {},
  );
  const [newComment, setNewComment] = useState<{ [key: string]: string }>({});
  const router = useRouter();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const [composerOpen, setComposerOpen] = useState<boolean>(false);
  const [editPostId, setEditPostId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState<string>("");
  const [bookmarkedPosts, setBookmarkedPosts] = useState<string[]>([]);

  function timeAgo(date?: string) {
    if (!date) return "";
    const then = new Date(date).getTime();
    const now = Date.now();
    const sec = Math.floor((now - then) / 1000);
    if (sec < 60) return "just now";
    const min = Math.floor(sec / 60);
    if (min < 60) return `${min}m ago`;
    const hr = Math.floor(min / 60);
    if (hr < 24) return `${hr}h ago`;
    const days = Math.floor(hr / 24);
    if (days < 7) return `${days}d ago`;
    const weeks = Math.floor(days / 7);
    if (weeks < 5) return `${weeks}w ago`;
    const months = Math.floor(days / 30);
    if (months < 12) return `${months}mo ago`;
    const years = Math.floor(days / 365);
    return `${years}y ago`;
  }

  // Initialize supabase client on client-side only
  const supabase = useMemo(() => {
    if (typeof window !== "undefined") {
      return createBrowserSupabaseClient();
    }
    return null;
  }, []);

  const loadPosts = useCallback(async () => {
    try {
      const res = await fetch("/api/mood-posts?limit=50");
      const json = await res.json();
      if (!res.ok) {
        console.log("Posts API not ready:", json.error);
        setPosts([]);
        return;
      }
      const postsData = json.posts || [];
      setPosts(postsData);

      // Load reactions for each post
      for (const post of postsData) {
        loadPostReactions(post.id);
      }
    } catch (e) {
      console.log("Posts not available - database may need setup");
      setPosts([]);
    }
  }, []);

  const loadPostReactions = async (postId: string) => {
    try {
      const res = await fetch(`/api/reactions?post_id=${postId}`);
      const data = await res.json();
      if (res.ok) {
        setPostReactions((prev) => ({
          ...prev,
          [postId]: data.reactions,
        }));
      }
    } catch (e) {
      console.log("Failed to load reactions for", postId);
    }
  };

  const loadPostComments = async (postId: string) => {
    try {
      const res = await fetch(`/api/comments?post_id=${postId}`);
      const data = await res.json();
      if (res.ok) {
        setPostComments((prev) => ({
          ...prev,
          [postId]: data.comments || [],
        }));
      }
    } catch (e) {
      console.log("Failed to load comments for", postId);
    }
  };

  const addComment = async (
    postId: string,
    content: string,
    anonymous: boolean,
  ) => {
    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          post_id: postId,
          content,
          anonymous,
          user_email: user?.email,
        }),
      });

      if (res.ok) {
        // Reload comments
        await loadPostComments(postId);
        // Clear comment input
        setNewComment((prev) => ({ ...prev, [postId]: "" }));
      } else {
        const error = await res.json();
        alert(error.error || "Failed to add comment");
      }
    } catch (e) {
      alert("Failed to add comment");
    }
  };

  const handleReaction = async (postId: string, reactionType: string) => {
    if (!user?.email) return;

    try {
      const res = await fetch("/api/reactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          post_id: postId,
          user_email: user.email,
          reaction_type: reactionType,
        }),
      });

      if (res.ok) {
        // Reload reactions for this post
        await loadPostReactions(postId);
      }
    } catch (e) {
      console.error("Failed to add reaction:", e);
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      // Only set loading if we don't already have a user
      if (!user) {
        setLoading(true);
      }

      // Check NextAuth session first (OAuth)
      if (nextSession?.user?.email) {
        const u = nextSession.user as any;
        setUser({ email: u.email, user_metadata: { full_name: u.name } });

        // Try to sync profile (ignore errors for now)
        try {
          await fetch("/api/profile/sync", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: u.email, name: u.name }),
          });
        } catch (e) {
          console.log("Profile sync failed, continuing anyway...");
        }

        setLoading(false);
        return;
      }

      // Check Supabase session (email/password)
      if (supabase) {
        try {
          const { data } = await supabase.auth.getSession();
          if (data?.session?.user) {
            setUser(data.session.user);
            setLoading(false);
            return;
          }
        } catch (e) {
          console.log("Session check failed:", e);
        }
      }

      // Only redirect if we're certain there's no valid session. Avoid
      // redirecting while an OAuth callback is in progress (e.g. `?code=`),
      // which can cause a loop between `/` and `/mood-feed`.
      const search = typeof window !== "undefined" ? window.location.search : "";
      const params = new URLSearchParams(search);
      const isOAuthCallback = params.has("code") || params.has("state") || params.has("oauth_token");

      if (nextSessionStatus === "unauthenticated" && !isOAuthCallback) {
        setLoading(false);
        router.replace("/");
      } else {
        // Either NextAuth is still resolving or we're in an OAuth callback —
        // keep the loading state until session settles to prevent flashing the feed.
        setLoading(false);
      }
    };

    // If NextAuth is still loading, keep showing the loading state to avoid
    // rendering the feed briefly before auth is resolved (prevents flicker).
    if (nextSessionStatus === "loading") {
      setLoading(true);
      return;
    }

    // Only run auth check once NextAuth has finished loading and we don't have a user
    if (!user) {
      checkAuth();
    }
  }, [nextSession, nextSessionStatus, router, user]);

  // Load posts when user is available (with caching to prevent reload)
  useEffect(() => {
    if (user?.email && posts.length === 0) {
      loadPosts().catch((e) => console.log("Posts loading failed:", e));
    }
    if (user?.email) loadBookmarkedPosts();
  }, [user, loadPosts]);

  const loadBookmarkedPosts = async () => {
    if (!user?.email) return;
    try {
      const res = await fetch(`/api/bookmarks?user_email=${encodeURIComponent(user.email)}`);
      if (res.ok) {
        const data = await res.json();
        setBookmarkedPosts(data.posts || []);
      }
    } catch (e) {
      console.error('Failed to load bookmarks', e);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-2 border-purple-600 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your mood feed...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="px-4 py-4">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px] gap-6">
          <div className="min-w-0">

        <section className="mb-8">
          {!composerOpen ? (
            <div className="surface-card p-4 mb-4 max-w-2xl mx-auto w-full">
              <div
                className="flex items-center gap-3 p-3 rounded-full border border-gray-200 hover:shadow-sm cursor-pointer"
                onClick={() => setComposerOpen(true)}
              >
                <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-white">🙂</div>
                <div className="flex-1 text-gray-600">Start a post</div>
              </div>
            </div>
          ) : (
            <div className="surface-card p-4 mb-4 max-w-2xl mx-auto w-full">
            <form
            onSubmit={async (e) => {
              e.preventDefault();
              const form = e.target as HTMLFormElement;
              const fd = new FormData(form);
              const content = (fd.get("content") as string) || "";
              const visibility = (fd.get("visibility") as string) || "public";
              const anonymous = fd.get("anonymous") === "on";

              if (!content.trim() && !imageFile) return alert("Please write something or add an image");

              let image_base64: string | null = null;
              let image_name: string | null = null;

              if (imageFile) {
                image_name = imageFile.name;
                image_base64 = await new Promise<string | null>((resolve) => {
                  const reader = new FileReader();
                  reader.onload = () => {
                    const result = reader.result as string;
                    const parts = result.split(",");
                    resolve(parts[1] || null);
                  };
                  reader.onerror = () => resolve(null);
                  reader.readAsDataURL(imageFile);
                });
              }

              const owner_email = user?.email || null;

              const payload: any = {
                content,
                mood: selectedMood?.label,
                mood_emoji: selectedMood?.emoji,
                mood_color: selectedMood?.color,
                visibility,
                anonymous,
                owner_email,
              };
              if (image_base64 && image_name) {
                payload.image_base64 = image_base64;
                payload.image_name = image_name;
              }

              const res = await fetch("/api/mood-posts", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
              });
              const data = await res.json();
              if (!res.ok) return alert(data?.error || "Could not post");
              form.reset();
              setSelectedMood(null);
              setImageFile(null);
              if (imagePreview) {
                URL.revokeObjectURL(imagePreview);
                setImagePreview(null);
              }
              // refresh posts
              await loadPosts();
            }}
            className="grid gap-4"
          >
            <textarea
              name="content"
              className="input-field h-40 resize-none w-full"
              placeholder="How are you feeling? Share your thoughts..."
              maxLength={500}
            />

            {/* image input is triggered by icon next to Share button */}

            {imagePreview && (
              <div className="flex items-start gap-2 mt-2">
                <img src={imagePreview} alt="preview" className="w-24 h-24 object-cover rounded" />
                <div>
                  <div className="text-sm mb-2">Selected image</div>
                  <button
                    type="button"
                    className="text-xs text-red-600"
                      onClick={() => {
                      if (imagePreview) URL.revokeObjectURL(imagePreview);
                      setImagePreview(null);
                      setImageFile(null);
                      if (imageInputRef.current) imageInputRef.current.value = "";
                    }}
                  >
                    Remove
                  </button>
                </div>
              </div>
            )}

            {/* Mood Selection */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Your mood:
              </label>
              <div className="flex flex-wrap gap-2">
                {moodOptions.map((mood) => (
                  <button
                    key={mood.label}
                    type="button"
                    className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm transition-colors ${
                      selectedMood?.label === mood.label
                        ? "bg-blue-100 border-2 border-blue-300"
                        : "bg-gray-100 border border-gray-300 hover:bg-gray-200"
                    }`}
                    style={
                      selectedMood?.label === mood.label
                        ? {
                            backgroundColor: mood.color + "20",
                            borderColor: mood.color,
                          }
                        : {}
                    }
                    onClick={() =>
                      setSelectedMood(
                        selectedMood?.label === mood.label ? null : mood,
                      )
                    }
                  >
                    <span>{mood.emoji}</span>
                    <span>{mood.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex items-center gap-2">
                <input type="hidden" name="visibility" value="public" />
                <div className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-sm">🌍 Public</div>
              </div>

              <label className="flex items-center gap-2">
                <input type="checkbox" name="anonymous" />
                <span className="text-sm">Post anonymously</span>
              </label>

              <div className="ml-auto flex items-center gap-2">
                <button
                  type="button"
                    aria-label="Add image"
                    className="p-2 rounded-md bg-blue-500 text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300"
                    onClick={() => imageInputRef.current?.click()}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <rect x="3" y="4" width="18" height="16" rx="2" ry="2" />
                    <circle cx="16" cy="8" r="2" />
                    <polyline points="21 15 16 10 11 15 3 8" />
                  </svg>
                </button>
                <input
                  ref={imageInputRef}
                  type="file"
                  name="image"
                  accept="image/*"
                  className="hidden"
                  onChange={(ev) => {
                    const f = (ev.target as HTMLInputElement).files?.[0] || null;
                    setImageFile(f);
                    if (f) setImagePreview(URL.createObjectURL(f));
                    else {
                      if (imagePreview) URL.revokeObjectURL(imagePreview);
                      setImagePreview(null);
                    }
                  }}
                />

                <button
                  type="submit"
                  className="btn-primary rounded-xl px-6 py-2"
                >
                  Share ✨
                </button>
              </div>
            </div>
            </form>
            </div>
          )}
        </section>

        <section className="grid gap-4" id="posts">
          {posts.length === 0 && (
            <div className="text-center text-[var(--feelup-muted)] py-8">
              <p>No posts yet — be the first to share! 💫</p>
            </div>
          )}

          {posts.map((post: any) => {
            const original = posts.find((p: any) => p.id === post.reposted_from) || null;
            return (
            <article
                key={post.id}
                className="surface-card p-4 mb-4 max-w-2xl mx-auto w-full"
              >
              <div className="flex items-start gap-3 mb-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold text-sm">
                  {post.anonymous
                    ? "😊"
                    : (
                        post.profiles?.full_name?.[0] ||
                        post.owner_email?.[0] ||
                        "?"
                      ).toUpperCase()}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium">
                      {post.anonymous
                        ? "Someone"
                        : post.profiles?.full_name ||
                          post.owner_email ||
                          "Anonymous"}
                    </span>
                    {post.mood_emoji && (
                      <span className="text-lg">{post.mood_emoji}</span>
                    )}
                    {post.mood && (
                      <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600">
                        {post.mood}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-[var(--feelup-muted)]">
                    {timeAgo(post.created_at)}
                    {post.updated_at && post.updated_at !== post.created_at && (
                      <span className="ml-2 text-[var(--feelup-muted)]">(edited)</span>
                    )}
                  </div>
                  {post.reposted_from && (
                    <div className="text-xs text-[var(--feelup-muted)] mt-1">
                      🔁 Reposted{original ? (
                        <>
                          {' from '}
                          <a href={`#${original.id}`} className="underline hover:text-blue-600">{original.profiles?.full_name || original.owner_email || 'Someone'}</a>
                        </>
                      ) : ' from another user'}
                    </div>
                  )}
                </div>
              </div>

              <div className="mb-4 text-gray-800 leading-relaxed">
                {editPostId === post.id ? (
                  <div className="grid gap-2">
                    <textarea
                      className="input-field h-24"
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                    />
                    <div className="flex gap-2">
                      <button
                        className="px-4 py-2 bg-green-500 text-white rounded-lg"
                        onClick={async () => {
                          // save edit
                          try {
                            const res = await fetch(`/api/mood-posts?id=${encodeURIComponent(post.id)}`, {
                              method: "PATCH",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ content: editContent, owner_email: user?.email }),
                            });
                            if (!res.ok) {
                              const err = await res.json();
                              alert(err?.error || "Failed to update post");
                              return;
                            }
                            setEditPostId(null);
                            setEditContent("");
                            await loadPosts();
                          } catch (e) {
                            alert("Failed to update post");
                          }
                        }}
                      >
                        Save
                      </button>
                      <button
                        className="px-4 py-2 bg-gray-200 rounded-lg"
                        onClick={() => {
                          setEditPostId(null);
                          setEditContent("");
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="prose max-w-none text-gray-800">
                    {post.content}
                  </div>
                )}
              </div>
              {post.image_url && (
                <div className="mt-4 overflow-hidden rounded bg-gray-50 p-3 flex items-center justify-center">
                  <img src={post.image_url} alt="post image" className="w-full rounded object-contain max-h-[720px]" />
                </div>
              )}

              

              {/* Reaction Buttons */}
              <div className="flex gap-2 pt-2 border-t border-gray-100">
                {reactionTypes.map((reaction) => {
                  const count =
                    postReactions[post.id]?.[reaction.type]?.count || 0;
                  return (
                    <button
                      key={reaction.type}
                      aria-label={reaction.label}
                      title={reaction.label}
                      className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm transition-colors ${
                        count > 0
                          ? "bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100"
                          : "bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100"
                      }`}
                      onClick={() => handleReaction(post.id, reaction.type)}
                    >
                      <span className="text-lg">{reaction.emoji}</span>
                      {count > 0 && (
                        <span className="font-medium">({count})</span>
                      )}
                    </button>
                  );
                })}

                <div className="ml-auto flex items-center gap-2">
                  {/* Owner Edit/Delete (right-aligned with comments) */}
                  {!post.anonymous && user?.email && post.owner_email === user.email && (
                    <>
                      <button
                        type="button"
                        aria-label="Edit"
                        title="Edit"
                        className="p-2 rounded-md bg-gray-50 hover:bg-gray-100"
                        onClick={() => {
                          setEditPostId(post.id);
                          setEditContent(post.content || "");
                        }}
                      >
                        ✏️
                      </button>

                      <button
                        type="button"
                        aria-label="Repost"
                        title="Repost"
                        className="p-2 rounded-md bg-gray-50 hover:bg-gray-100"
                        onClick={async () => {
                          if (!user?.email) return alert('Sign in to repost');
                          try {
                            const res = await fetch('/api/mood-posts', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({
                                content: post.content,
                                mood: post.mood,
                                mood_emoji: post.mood_emoji,
                                owner_email: user.email,
                                image_url: post.image_url || null,
                                reposted_from: post.id,
                              }),
                            });
                            if (!res.ok) {
                              const err = await res.json();
                              return alert(err?.error || 'Failed to repost');
                            }
                            await loadPosts();
                            alert('Reposted');
                          } catch (e) {
                            alert('Failed to repost');
                          }
                        }}
                      >
                        🔁
                      </button>

                      <button
                        type="button"
                        aria-label={bookmarkedPosts.includes(post.id) ? 'Remove bookmark' : 'Save'}
                        title={bookmarkedPosts.includes(post.id) ? 'Remove bookmark' : 'Save'}
                        className="p-2 rounded-md bg-gray-50 hover:bg-gray-100"
                        onClick={async () => {
                          if (!user?.email) return alert('Sign in to save posts');
                          try {
                            if (!bookmarkedPosts.includes(post.id)) {
                              const res = await fetch('/api/bookmarks', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ user_email: user.email, post_id: post.id }),
                              });
                              if (!res.ok) throw new Error('Failed to save');
                              setBookmarkedPosts((prev) => [...prev, post.id]);
                            } else {
                              const res = await fetch(`/api/bookmarks?user_email=${encodeURIComponent(user.email)}&post_id=${encodeURIComponent(post.id)}`, { method: 'DELETE' });
                              if (!res.ok) throw new Error('Failed to remove');
                              setBookmarkedPosts((prev) => prev.filter((id) => id !== post.id));
                            }
                          } catch (e) {
                            alert('Failed to update saved posts');
                          }
                        }}
                      >
                        {bookmarkedPosts.includes(post.id) ? '🔖' : '📑'}
                      </button>

                      <button
                        type="button"
                        aria-label="Share"
                        title="Share"
                        className="p-2 rounded-md bg-gray-50 hover:bg-gray-100"
                        onClick={() => {
                          try {
                            const url = `${location.origin}/mood-feed#${post.id}`;
                            navigator.clipboard.writeText(url);
                            alert('Link copied to clipboard');
                          } catch (e) {
                            alert('Could not copy link');
                          }
                        }}
                      >
                        📤
                      </button>
                      <button
                        type="button"
                        aria-label="Delete"
                        title="Delete"
                        className="p-2 rounded-md bg-red-50 hover:bg-red-100"
                        onClick={async () => {
                          if (!confirm('Delete this post?')) return;
                          try {
                            const res = await fetch(`/api/mood-posts?id=${encodeURIComponent(post.id)}&owner_email=${encodeURIComponent(user.email)}`, { method: 'DELETE' });
                            if (!res.ok) {
                              const err = await res.json();
                              return alert(err?.error || 'Failed to delete post');
                            }
                            await loadPosts();
                          } catch (e) {
                            alert('Failed to delete post');
                          }
                        }}
                      >
                        🗑️
                      </button>
                    </>
                  )}

                  {/* Comment Toggle Button */}
                  <button
                    className="flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100"
                    onClick={() => {
                      const isCurrentlyShowing = showComments[post.id];
                      setShowComments((prev) => ({
                        ...prev,
                        [post.id]: !isCurrentlyShowing,
                      }));
                      if (!isCurrentlyShowing && !postComments[post.id]) {
                        loadPostComments(post.id);
                      }
                    }}
                  >
                    <span>💬</span>
                    <span className="sr-only">Comments</span>
                    {(postComments[post.id]?.length || 0) > 0 && (
                      <span className="font-medium">({postComments[post.id].length})</span>
                    )}
                  </button>
                </div>
              </div>

              {/* Comments Section */}
              {showComments[post.id] && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  {/* Existing Comments */}
                  <div className="space-y-3 mb-4">
                    {postComments[post.id]?.map((comment) => (
                      <div key={comment.id} className="flex gap-2">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center text-white text-xs">
                          {comment.anonymous
                            ? "😊"
                            : (
                                comment.profiles?.full_name?.[0] ||
                                comment.user_email?.[0] ||
                                "?"
                              ).toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <div className="bg-gray-50 rounded-lg px-3 py-2">
                            <div className="text-xs text-gray-500 mb-1">
                              {comment.anonymous
                                ? "Someone"
                                : comment.profiles?.full_name ||
                                  comment.user_email ||
                                  "Anonymous"}
                              <span className="ml-2">
                                {timeAgo(comment.created_at)}
                              </span>
                            </div>
                            <div className="text-sm text-gray-800">
                              {comment.content}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Add Comment Form */}
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      const content = newComment[post.id]?.trim();
                      if (content) {
                        addComment(post.id, content, false);
                      }
                    }}
                    className="flex gap-2"
                  >
                    <input
                      type="text"
                      value={newComment[post.id] || ""}
                      onChange={(e) =>
                        setNewComment((prev) => ({
                          ...prev,
                          [post.id]: e.target.value,
                        }))
                      }
                      placeholder="Add a supportive comment..."
                      className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      maxLength={200}
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 transition-colors"
                    >
                      💕 Send
                    </button>
                  </form>
                </div>
              )}
            </article>
          );
          })}
        </section>
          </div>
          <RightSidebar userEmail={user?.email} />
        </div>
      </main>
      <Footer />
    </div>
  );
}
