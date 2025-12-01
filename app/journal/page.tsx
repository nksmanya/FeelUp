"use client";

import { useEffect, useState } from "react";
import { createBrowserSupabaseClient } from "../../lib/supabaseClient";
import { useRouter } from "next/navigation";
import Navbar from "../../components/Navbar";
import StreakDisplay from "../../components/StreakDisplay";
import { useSession, signOut as nextAuthSignOut } from "next-auth/react";

const supabase = typeof window !== 'undefined' ? createBrowserSupabaseClient() : null;

// Enhanced mood options with emojis and colors
const moodOptions = [
  { label: 'Happy', emoji: '😊', color: '#fbbf24' },
  { label: 'Calm', emoji: '😌', color: '#60a5fa' },
  { label: 'Excited', emoji: '🤩', color: '#f472b6' },
  { label: 'Grateful', emoji: '🙏', color: '#34d399' },
  { label: 'Thoughtful', emoji: '🤔', color: '#a78bfa' },
  { label: 'Curious', emoji: '🤷‍♀️', color: '#fb7185' },
  { label: 'Peaceful', emoji: '☮️', color: '#10b981' },
  { label: 'Hopeful', emoji: '🌟', color: '#fbbf24' },
  { label: 'Motivated', emoji: '💪', color: '#ef4444' },
  { label: 'Creative', emoji: '🎨', color: '#8b5cf6' },
  { label: 'Reflective', emoji: '🌙', color: '#6366f1' },
  { label: 'Energetic', emoji: '⚡', color: '#f59e0b' },
  { label: 'Sad', emoji: '😔', color: '#94a3b8' },
  { label: 'Anxious', emoji: '😰', color: '#fb7185' },
  { label: 'Tired', emoji: '😴', color: '#6b7280' },
  { label: 'Overwhelmed', emoji: '😵‍💫', color: '#f87171' },
];

const energyLevels = [
  { value: 1, label: 'Very Low', emoji: '😴', color: '#6b7280' },
  { value: 2, label: 'Low', emoji: '😔', color: '#9ca3af' },
  { value: 3, label: 'Medium', emoji: '😐', color: '#60a5fa' },
  { value: 4, label: 'High', emoji: '😊', color: '#34d399' },
  { value: 5, label: 'Very High', emoji: '🚀', color: '#f59e0b' },
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
  const [energyLevel, setEnergyLevel] = useState<number | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [customTag, setCustomTag] = useState('');
  const [canConvertToPost, setCanConvertToPost] = useState<boolean>(false);
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
      energy_level: energyLevel,
      tags: selectedTags,
      is_gratitude: isGratitude,
      can_convert_to_post: canConvertToPost
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
        setEnergyLevel(null);
        setSelectedTags([]);
        setCustomTag('');
        setCanConvertToPost(false);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-2 border-purple-600 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your journal...</p>
          </div>
        </div>
      </div>
    );
  }

  const currentEntries = activeTab === 'journal' ? entries : gratitudeEntries;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">📝 Feel Journal</h1>
          <p className="text-gray-600">Your private space for thoughts, reflections, and gratitude.</p>
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

              {/* Energy Level Selection */}
              <div>
                <label className="block text-sm font-medium mb-2">Energy level:</label>
                <div className="flex gap-2">
                  {energyLevels.map((level) => (
                    <button
                      key={level.value}
                      type="button"
                      className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg text-sm transition-all ${
                        energyLevel === level.value
                          ? 'bg-green-100 border-2 border-green-300 transform scale-105'
                          : 'bg-gray-100 border border-gray-300 hover:bg-gray-200 hover:scale-105'
                      }`}
                      onClick={() => setEnergyLevel(energyLevel === level.value ? null : level.value)}
                      style={{ backgroundColor: energyLevel === level.value ? level.color + '20' : undefined }}
                    >
                      <span className="text-lg">{level.emoji}</span>
                      <span className="text-xs">{level.label}</span>
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

              {/* Convert to Post Option */}
              {!showGratitude && (
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="canConvertToPost"
                    checked={canConvertToPost}
                    onChange={(e) => setCanConvertToPost(e.target.checked)}
                    className="rounded"
                  />
                  <label htmlFor="canConvertToPost" className="text-sm text-gray-700">
                    Allow this entry to be shared as a mood post
                  </label>
                </div>
              )}

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
                {!entry.is_gratitude && entry.can_convert_to_post && (
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

              {(entry.mood || entry.energy_level) && (
                <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                  {entry.mood && (
                    <span>Mood: {entry.mood_emoji} {entry.mood}</span>
                  )}
                  {entry.energy_level && (
                    <span>
                      Energy: {energyLevels.find(l => l.value === entry.energy_level)?.emoji} {energyLevels.find(l => l.value === entry.energy_level)?.label}
                    </span>
                  )}
                </div>
              )}
            </article>
          ))}
        </div>
      </main>
    </div>
  );
}