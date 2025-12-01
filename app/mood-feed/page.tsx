"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { createBrowserSupabaseClient } from "../../lib/supabaseClient";
import { useRouter } from "next/navigation";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { useSession, signOut as nextAuthSignOut } from "next-auth/react";

// Mood options with emojis and colors
const moodOptions = [
  { label: 'Happy', emoji: '😊', color: '#fbbf24' },
  { label: 'Calm', emoji: '😌', color: '#60a5fa' },
  { label: 'Excited', emoji: '🤩', color: '#f472b6' },
  { label: 'Grateful', emoji: '🙏', color: '#34d399' },
  { label: 'Thoughtful', emoji: '🤔', color: '#a78bfa' },
  { label: 'Sad', emoji: '😔', color: '#94a3b8' },
  { label: 'Anxious', emoji: '😰', color: '#fb7185' },
  { label: 'Tired', emoji: '😴', color: '#6b7280' },
];

// Positive reaction types
const reactionTypes = [
  { type: 'cheer', emoji: '🎉', label: 'Cheer' },
  { type: 'support', emoji: '💪', label: 'Support' },
  { type: 'hug', emoji: '🤗', label: 'Hug' },
  { type: 'care', emoji: '❤️', label: 'Care' },
];

export default function MoodFeedPage() {
  const { data: nextSession, status: nextSessionStatus } = useSession();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [selectedMood, setSelectedMood] = useState<any>(null);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [newPost, setNewPost] = useState('');
  const [postReactions, setPostReactions] = useState<{[key: string]: any}>({});
  const [postComments, setPostComments] = useState<{[key: string]: any[]}>({});
  const [showComments, setShowComments] = useState<{[key: string]: boolean}>({});
  const [newComment, setNewComment] = useState<{[key: string]: string}>({});
  const router = useRouter();

  // Initialize supabase client on client-side only
  const supabase = useMemo(() => {
    if (typeof window !== 'undefined') {
      return createBrowserSupabaseClient();
    }
    return null;
  }, []);

  const loadPosts = useCallback(async () => {
    try {
      const res = await fetch('/api/mood-posts?limit=50');
      const json = await res.json();
      if (!res.ok) {
        console.log('Posts API not ready:', json.error);
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
      console.log('Posts not available - database may need setup');
      setPosts([]);
    }
  }, []);

  const loadPostReactions = async (postId: string) => {
    try {
      const res = await fetch(`/api/reactions?post_id=${postId}`);
      const data = await res.json();
      if (res.ok) {
        setPostReactions(prev => ({
          ...prev,
          [postId]: data.reactions
        }));
      }
    } catch (e) {
      console.log('Failed to load reactions for', postId);
    }
  };

  const loadPostComments = async (postId: string) => {
    try {
      const res = await fetch(`/api/comments?post_id=${postId}`);
      const data = await res.json();
      if (res.ok) {
        setPostComments(prev => ({
          ...prev,
          [postId]: data.comments || []
        }));
      }
    } catch (e) {
      console.log('Failed to load comments for', postId);
    }
  };

  const addComment = async (postId: string, content: string, anonymous: boolean) => {
    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          post_id: postId,
          content,
          anonymous,
          user_email: user?.email
        })
      });
      
      if (res.ok) {
        // Reload comments
        await loadPostComments(postId);
        // Clear comment input
        setNewComment(prev => ({ ...prev, [postId]: '' }));
      } else {
        const error = await res.json();
        alert(error.error || 'Failed to add comment');
      }
    } catch (e) {
      alert('Failed to add comment');
    }
  };

  const handleReaction = async (postId: string, reactionType: string) => {
    if (!user?.email) return;
    
    try {
      const res = await fetch('/api/reactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          post_id: postId,
          user_email: user.email,
          reaction_type: reactionType
        }),
      });
      
      if (res.ok) {
        // Reload reactions for this post
        await loadPostReactions(postId);
      }
    } catch (e) {
      console.error('Failed to add reaction:', e);
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
          await fetch('/api/profile/sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: u.email, name: u.name }),
          });
        } catch (e) {
          console.log('Profile sync failed, continuing anyway...');
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
          console.log('Session check failed:', e);
        }
      }
      
      // Only redirect if we're certain there's no valid session
      if (nextSessionStatus === 'unauthenticated') {
        setLoading(false);
        router.replace('/');
      } else {
        // Still loading NextAuth, wait a bit more
        setLoading(false);
      }
    };

    // Only run auth check if NextAuth has finished loading and we don't have a user
    if (nextSessionStatus !== 'loading' && !user) {
      checkAuth();
    }
  }, [nextSession, nextSessionStatus, router, user]);

  // Load posts when user is available (with caching to prevent reload)
  useEffect(() => {
    if (user?.email && posts.length === 0) {
      loadPosts().catch(e => console.log('Posts loading failed:', e));
    }
  }, [user, loadPosts]);

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
      
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">✨ Mood Feed</h1>
          <p className="text-gray-600">Share your feelings and support others in our positive community.</p>
        </div>
        
        <section className="mb-8 bg-white rounded-xl p-6 shadow-sm">
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              const form = e.target as HTMLFormElement;
              const fd = new FormData(form);
              const content = (fd.get('content') as string) || '';
              const visibility = (fd.get('visibility') as string) || 'public';
              const anonymous = fd.get('anonymous') === 'on';

              if (!content.trim()) return alert('Please write something');

              const owner_email = user?.email || null;

              const res = await fetch('/api/mood-posts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  content,
                  mood: selectedMood?.label,
                  mood_emoji: selectedMood?.emoji,
                  mood_color: selectedMood?.color,
                  visibility,
                  anonymous,
                  owner_email
                }),
              });
              const data = await res.json();
              if (!res.ok) return alert(data?.error || 'Could not post');
              form.reset();
              setSelectedMood(null);
              // refresh posts
              await loadPosts();
            }}
            className="grid gap-4"
          >
            <textarea 
              name="content" 
              className="input-field h-28 resize-none" 
              placeholder="How are you feeling? Share your thoughts..." 
              maxLength={500}
            />
            
            {/* Mood Selection */}
            <div>
              <label className="block text-sm font-medium mb-2">Your mood:</label>
              <div className="flex flex-wrap gap-2">
                {moodOptions.map((mood) => (
                  <button
                    key={mood.label}
                    type="button"
                    className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm transition-colors ${
                      selectedMood?.label === mood.label
                        ? 'bg-blue-100 border-2 border-blue-300'
                        : 'bg-gray-100 border border-gray-300 hover:bg-gray-200'
                    }`}
                    style={selectedMood?.label === mood.label ? { backgroundColor: mood.color + '20', borderColor: mood.color } : {}}
                    onClick={() => setSelectedMood(selectedMood?.label === mood.label ? null : mood)}
                  >
                    <span>{mood.emoji}</span>
                    <span>{mood.label}</span>
                  </button>
                ))}
              </div>
            </div>
            
            <div className="flex flex-wrap gap-4 items-center">
              <select name="visibility" className="input-field w-40">
                <option value="public">🌍 Public</option>
                <option value="friends">👥 Friends</option>
                <option value="anonymous">🔒 Anonymous</option>
              </select>
              
              <label className="flex items-center gap-2">
                <input type="checkbox" name="anonymous" />
                <span className="text-sm">Post anonymously</span>
              </label>
              
              <button type="submit" className="ml-auto btn-primary rounded-xl px-6 py-2">
                Share ✨
              </button>
            </div>
          </form>
        </section>

        <section className="grid gap-4" id="posts">
          {posts.length === 0 && (
            <div className="text-center text-[var(--feelup-muted)] py-8">
              <p>No posts yet — be the first to share! 💫</p>
            </div>
          )}
          
          {posts.map((post: any) => (
            <article key={post.id} className="rounded-xl bg-white p-6 soft-glow">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold text-sm">
                  {post.anonymous ? '😊' : (post.profiles?.full_name?.[0] || post.owner_email?.[0] || '?').toUpperCase()}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium">
                      {post.anonymous ? 'Someone' : post.profiles?.full_name || post.owner_email || 'Anonymous'}
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
                    {new Date(post.created_at).toLocaleString()}
                  </div>
                </div>
              </div>
              
              <div className="mb-4 text-gray-800 leading-relaxed">
                {post.content}
              </div>
              
              {/* Reaction Buttons */}
              <div className="flex gap-2 pt-2 border-t border-gray-100">
                {reactionTypes.map((reaction) => {
                  const count = postReactions[post.id]?.[reaction.type]?.count || 0;
                  return (
                    <button
                      key={reaction.type}
                      className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm transition-colors ${
                        count > 0
                          ? 'bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100'
                          : 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100'
                      }`}
                      onClick={() => handleReaction(post.id, reaction.type)}
                    >
                      <span>{reaction.emoji}</span>
                      <span>{reaction.label}</span>
                      {count > 0 && <span className="font-medium">({count})</span>}
                    </button>
                  );
                })}
                
                {/* Comment Toggle Button */}
                <button
                  className="flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100 ml-auto"
                  onClick={() => {
                    const isCurrentlyShowing = showComments[post.id];
                    setShowComments(prev => ({ ...prev, [post.id]: !isCurrentlyShowing }));
                    if (!isCurrentlyShowing && !postComments[post.id]) {
                      loadPostComments(post.id);
                    }
                  }}
                >
                  <span>💬</span>
                  <span>Comments</span>
                  {(postComments[post.id]?.length || 0) > 0 && (
                    <span className="font-medium">({postComments[post.id].length})</span>
                  )}
                </button>
              </div>

              {/* Comments Section */}
              {showComments[post.id] && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  {/* Existing Comments */}
                  <div className="space-y-3 mb-4">
                    {postComments[post.id]?.map((comment) => (
                      <div key={comment.id} className="flex gap-2">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center text-white text-xs">
                          {comment.anonymous ? '😊' : (comment.profiles?.full_name?.[0] || comment.user_email?.[0] || '?').toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <div className="bg-gray-50 rounded-lg px-3 py-2">
                            <div className="text-xs text-gray-500 mb-1">
                              {comment.anonymous ? 'Someone' : comment.profiles?.full_name || comment.user_email || 'Anonymous'}
                              <span className="ml-2">{new Date(comment.created_at).toLocaleString()}</span>
                            </div>
                            <div className="text-sm text-gray-800">{comment.content}</div>
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
                      value={newComment[post.id] || ''}
                      onChange={(e) => setNewComment(prev => ({ ...prev, [post.id]: e.target.value }))}
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
          ))}
        </section>
      </main>
      <Footer />
    </div>
  );
}

