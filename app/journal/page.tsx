"use client";

import { useEffect, useState } from "react";
import { createBrowserSupabaseClient } from "../../lib/supabaseClient";
import { useRouter } from "next/navigation";
import Logo from "../../components/Logo";
import { useSession, signOut as nextAuthSignOut } from "next-auth/react";

const supabase = typeof window !== 'undefined' ? createBrowserSupabaseClient() : null;

// Mood options with emojis
const moodOptions = [
  { label: 'Happy', emoji: '😊' },
  { label: 'Calm', emoji: '😌' },
  { label: 'Excited', emoji: '🤩' },
  { label: 'Grateful', emoji: '🙏' },
  { label: 'Thoughtful', emoji: '🤔' },
  { label: 'Curious', emoji: '🤷‍♀️' },
  { label: 'Peaceful', emoji: '☮️' },
  { label: 'Hopeful', emoji: '🌟' },
  { label: 'Sad', emoji: '😔' },
  { label: 'Anxious', emoji: '😰' },
  { label: 'Tired', emoji: '😴' },
  { label: 'Overwhelmed', emoji: '😵‍💫' },
];

// Predefined tags
const commonTags = [
  'grateful', 'anxious', 'hopeful', 'reflection', 'goals', 'family', 'work', 'study',
  'health', 'friendship', 'growth', 'challenge', 'success', 'learning', 'mindful'
];

export default function JournalPage() {
  const { data: nextSession } = useSession();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [entries, setEntries] = useState<any[]>([]);
  const [gratitudeEntries, setGratitudeEntries] = useState<any[]>([]);
  const [showNewEntry, setShowNewEntry] = useState(false);
  const [showGratitude, setShowGratitude] = useState(false);
  const [selectedMood, setSelectedMood] = useState<any>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [customTag, setCustomTag] = useState('');
  const [activeTab, setActiveTab] = useState<'journal' | 'gratitude'>('journal');
  const router = useRouter();

  const loadEntries = async () => {
    if (!user?.email) return;
    
    try {
      // Load journal entries
      const res = await fetch(`/api/journal?user_email=${encodeURIComponent(user.email)}&limit=50`);
      const data = await res.json();
      if (res.ok) {
        setEntries(data.entries.filter((e: any) => !e.is_gratitude) || []);
      }

      // Load gratitude entries
      const gratRes = await fetch(`/api/journal?user_email=${encodeURIComponent(user.email)}&limit=50&is_gratitude=true`);
      const gratData = await gratRes.json();
      if (gratRes.ok) {
        setGratitudeEntries(gratData.entries || []);
      }
    } catch (e) {
      console.error('Failed to load entries:', e);
    }
  };

  const addEntry = async (e: React.FormEvent, isGratitude = false) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const fd = new FormData(form);
    
    const entryData = {
      user_email: user.email,
      title: fd.get('title') as string,
      content: fd.get('content') as string,
      mood: selectedMood?.label,
      mood_emoji: selectedMood?.emoji,
      tags: selectedTags,
      is_gratitude: isGratitude
    };

    try {
      const res = await fetch('/api/journal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entryData)
      });

      if (res.ok) {
        form.reset();
        setShowNewEntry(false);
        setShowGratitude(false);
        setSelectedMood(null);
        setSelectedTags([]);
        setCustomTag('');
        await loadEntries();
      } else {
        const error = await res.json();
        alert(error.error || 'Failed to add entry');
      }
    } catch (e) {
      alert('Failed to add entry');
    }
  };

  const convertToPost = async (entry: any) => {
    try {
      const res = await fetch('/api/mood-posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: entry.content,
          mood: entry.mood,
          mood_emoji: entry.mood_emoji,
          visibility: 'public',
          anonymous: false,
          owner_email: user.email
        })
      });

      if (res.ok) {
        alert('Entry converted to mood post! 🎉');
        router.push('/mood-feed');
      } else {
        const error = await res.json();
        alert(error.error || 'Failed to convert to post');
      }
    } catch (e) {
      alert('Failed to convert to post');
    }
  };

  const addCustomTag = () => {
    if (customTag.trim() && !selectedTags.includes(customTag.trim().toLowerCase())) {
      setSelectedTags([...selectedTags, customTag.trim().toLowerCase()]);
      setCustomTag('');
    }
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  useEffect(() => {
    let mounted = true;

    (async () => {
      if (nextSession?.user?.email) {
        const u = nextSession.user as any;
        setUser({ email: u.email, user_metadata: { full_name: u.name } });
        setLoading(false);
        return;
      }

      if (!supabase) return;
      const { data } = await supabase.auth.getSession();
      const session = data.session;
      if (!session) {
        router.push('/');
        return;
      }
      if (mounted) setUser(session.user);
      setLoading(false);
    })();
  }, [nextSession, router]);

  useEffect(() => {
    if (user?.email) {
      loadEntries();
    }
  }, [user]);

  if (loading) return <div className="p-8">Loading...</div>;

  const currentEntries = activeTab === 'journal' ? entries : gratitudeEntries;

  return (
    <div className="min-h-screen p-8">
      <header className="max-w-4xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Logo size={40} />
          <div>
            <div className="text-sm text-[var(--feelup-muted)]">Feel Journal</div>
            <div className="font-semibold">{user?.user_metadata?.full_name || user?.email || "Anonymous"}</div>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            className="btn-secondary rounded-md px-3 py-2"
            onClick={() => router.push('/mood-feed')}
          >
            💭 Feed
          </button>
          <button
            className="btn-secondary rounded-md px-3 py-2"
            onClick={() => router.push('/goals')}
          >
            📅 Goals
          </button>
          <button
            className="btn-secondary rounded-md px-3 py-2"
            onClick={async () => {
              if (nextSession) {
                await nextAuthSignOut({ callbackUrl: '/' });
                router.push('/');
                return;
              }
              await supabase?.auth.signOut();
              router.push('/');
            }}
          >
            Sign out
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto mt-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold mb-2">Feel Journal 📔</h1>
            <p className="text-[var(--feelup-muted)]">Your private space for thoughts, reflections, and gratitude</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveTab('journal')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'journal'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            📝 Journal ({entries.length})
          </button>
          <button
            onClick={() => setActiveTab('gratitude')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'gratitude'
                ? 'bg-green-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            🙏 Gratitude ({gratitudeEntries.length})
          </button>
        </div>

        {/* Add Entry Buttons */}
        <div className="flex gap-3 mb-8">
          {!showNewEntry && !showGratitude && (
            <>
              <button
                onClick={() => setShowNewEntry(true)}
                className="btn-primary rounded-xl px-6 py-3"
              >
                + New Entry
              </button>
              <button
                onClick={() => setShowGratitude(true)}
                className="bg-green-500 hover:bg-green-600 text-white rounded-xl px-6 py-3 transition-colors"
              >
                + Gratitude Note
              </button>
            </>
          )}
        </div>

        {/* New Journal Entry Form */}
        {(showNewEntry || showGratitude) && (
          <div className="bg-white rounded-xl p-6 soft-glow mb-8">
            <h3 className="text-lg font-semibold mb-4">
              {showGratitude ? '🙏 New Gratitude Note' : '📝 New Journal Entry'}
            </h3>
            <form onSubmit={(e) => addEntry(e, showGratitude)} className="grid gap-4">
              {!showGratitude && (
                <input
                  type="text"
                  name="title"
                  placeholder="Entry title (optional)"
                  className="input-field"
                  maxLength={100}
                />
              )}
              <textarea
                name="content"
                placeholder={showGratitude ? "What are you grateful for today?" : "Write your thoughts, feelings, or reflections..."}
                className="input-field h-32 resize-none"
                required
                maxLength={1000}
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
                      onClick={() => setSelectedMood(selectedMood?.label === mood.label ? null : mood)}
                    >
                      <span>{mood.emoji}</span>
                      <span>{mood.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium mb-2">Tags:</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {commonTags.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      className={`px-2 py-1 text-xs rounded-full transition-colors ${
                        selectedTags.includes(tag)
                          ? 'bg-purple-100 border border-purple-300 text-purple-700'
                          : 'bg-gray-100 border border-gray-300 hover:bg-gray-200'
                      }`}
                      onClick={() => toggleTag(tag)}
                    >
                      #{tag}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customTag}
                    onChange={(e) => setCustomTag(e.target.value)}
                    placeholder="Add custom tag"
                    className="input-field flex-1"
                    maxLength={20}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomTag())}
                  />
                  <button
                    type="button"
                    onClick={addCustomTag}
                    className="btn-secondary rounded px-3 py-1 text-sm"
                  >
                    Add
                  </button>
                </div>
                {selectedTags.length > 0 && (
                  <div className="mt-2 text-sm text-gray-600">
                    Selected: {selectedTags.map(tag => `#${tag}`).join(', ')}
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <button type="submit" className="btn-primary rounded-xl px-4 py-2">
                  Save Entry
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowNewEntry(false);
                    setShowGratitude(false);
                    setSelectedMood(null);
                    setSelectedTags([]);
                    setCustomTag('');
                  }}
                  className="btn-secondary rounded-xl px-4 py-2"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Entries List */}
        <div className="grid gap-4">
          {currentEntries.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <p className="text-lg mb-2">
                {activeTab === 'journal' ? 'No journal entries yet' : 'No gratitude notes yet'}
              </p>
              <p>Start writing your first {activeTab === 'journal' ? 'entry' : 'gratitude note'}! ✨</p>
            </div>
          )}

          {currentEntries.map((entry) => (
            <article key={entry.id} className="bg-white rounded-xl p-6 soft-glow">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                  {entry.mood_emoji && (
                    <span className="text-2xl">{entry.mood_emoji}</span>
                  )}
                  <div>
                    {entry.title && (
                      <h3 className="font-semibold text-gray-900">{entry.title}</h3>
                    )}
                    <div className="text-xs text-gray-500">
                      {new Date(entry.created_at).toLocaleString()}
                      {entry.updated_at !== entry.created_at && ' (edited)'}
                    </div>
                  </div>
                </div>
                {!entry.is_gratitude && (
                  <button
                    onClick={() => convertToPost(entry)}
                    className="text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 px-2 py-1 rounded-md transition-colors"
                    title="Convert to mood post"
                  >
                    Share 📤
                  </button>
                )}
              </div>

              <div className="text-gray-800 leading-relaxed mb-3 whitespace-pre-wrap">
                {entry.content}
              </div>

              {entry.tags && entry.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                  {entry.tags.map((tag: string, idx: number) => (
                    <span
                      key={idx}
                      className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded-full"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {entry.mood && (
                <div className="text-sm text-gray-600">
                  Mood: {entry.mood_emoji} {entry.mood}
                </div>
              )}
            </article>
          ))}
        </div>
      </main>
    </div>
  );
}