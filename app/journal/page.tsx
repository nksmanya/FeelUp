"use client";

import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { createBrowserSupabaseClient } from "../../lib/supabaseClient";
import { useRouter } from "next/navigation";
import Navbar from "../../components/Navbar";
import StreakDisplay from "../../components/StreakDisplay";
import { useSession, signOut as nextAuthSignOut } from "next-auth/react";
import { BookOpen, Heart, Image as ImageIcon, Share2, Plus, X } from "lucide-react";

// Enhanced mood options with emojis and colors
const moodOptions = [
  { label: "Happy", emoji: "😊", color: "var(--mood-happy)" },
  { label: "Calm", emoji: "😌", color: "var(--mood-calm)" },
  { label: "Excited", emoji: "🤩", color: "var(--mood-excited)" },
  { label: "Grateful", emoji: "🙏", color: "var(--mood-grateful)" },
  { label: "Thoughtful", emoji: "🤔", color: "var(--mood-thoughtful)" },
  { label: "Curious", emoji: "🤷‍♀️", color: "var(--mood-excited)" },
  { label: "Peaceful", emoji: "☮️", color: "var(--mood-grateful)" },
  { label: "Hopeful", emoji: "🌟", color: "var(--mood-happy)" },
  { label: "Motivated", emoji: "💪", color: "var(--mood-anxious)" },
  { label: "Creative", emoji: "🎨", color: "var(--mood-thoughtful)" },
  { label: "Reflective", emoji: "🌙", color: "var(--mood-thoughtful)" },
  { label: "Energetic", emoji: "⚡", color: "var(--mood-happy)" },
  { label: "Sad", emoji: "😔", color: "var(--mood-sad)" },
  { label: "Anxious", emoji: "😰", color: "var(--mood-anxious)" },
  { label: "Tired", emoji: "😴", color: "var(--mood-tired)" },
  { label: "Overwhelmed", emoji: "😵‍💫", color: "var(--mood-anxious)" },
];

const energyLevels = [
  { value: 1, label: "Very Low", emoji: "😴", color: "var(--mood-tired)" },
  { value: 2, label: "Low", emoji: "😔", color: "var(--mood-sad)" },
  { value: 3, label: "Medium", emoji: "😐", color: "var(--mood-excited)" },
  { value: 4, label: "High", emoji: "😊", color: "var(--mood-grateful)" },
  { value: 5, label: "Very High", emoji: "🚀", color: "var(--mood-happy)" },
];

// Predefined tags
const commonTags = [
  "grateful",
  "anxious",
  "hopeful",
  "reflection",
  "goals",
  "family",
  "work",
  "study",
  "health",
  "friendship",
  "growth",
  "challenge",
  "success",
  "learning",
  "mindful",
];

export default function JournalPage() {
  const { data: nextSession } = useSession();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [entries, setEntries] = useState<any[]>([]);
  const [gratitudeEntries, setGratitudeEntries] = useState<any[]>([]);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [entryType, setEntryType] = useState<"journal" | "gratitude" | null>(null);
  const [selectedMood, setSelectedMood] = useState<any>(null);
  const [energyLevel, setEnergyLevel] = useState<number | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [customTag, setCustomTag] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const [canConvertToPost, setCanConvertToPost] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<"journal" | "gratitude">(
    "journal",
  );
  const router = useRouter();

  // Initialize supabase client on client-side only
  const supabase = useMemo(() => {
    if (typeof window !== "undefined") {
      return createBrowserSupabaseClient();
    }
    return null;
  }, []);

  const loadEntries = useCallback(async () => {
    if (!user?.email) return;

    try {
      // Load journal entries
      const res = await fetch(
        `/api/journal?user_email=${encodeURIComponent(user.email)}&limit=50`,
      );
      const data = await res.json();
      if (res.ok) {
        setEntries(data.entries.filter((e: any) => !e.is_gratitude) || []);
      }

      // Load gratitude entries
      const gratRes = await fetch(
        `/api/journal?user_email=${encodeURIComponent(user.email)}&limit=50&is_gratitude=true`,
      );
      const gratData = await gratRes.json();
      if (gratRes.ok) {
        setGratitudeEntries(gratData.entries || []);
      }
    } catch (e) {
      console.error("Failed to load entries:", e);
    }
  }, [user?.email]);

  const addEntry = async (e: React.FormEvent, isGratitude = false) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const fd = new FormData(form);

    const file = imageFile;
    let image_base64: string | null = null;
    let image_name: string | null = null;

    if (file && file.size > 0) {
      image_name = file.name;
      image_base64 = await new Promise<string | null>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          const parts = result.split(",");
          resolve(parts[1] || null);
        };
        reader.onerror = () => resolve(null);
        reader.readAsDataURL(file);
      });
    }

    const entryData = {
      user_email: user.email,
      title: fd.get("title") as string,
      content: fd.get("content") as string,
      mood: selectedMood?.label,
      mood_emoji: selectedMood?.emoji,
      energy_level: energyLevel,
      tags: selectedTags,
      is_gratitude: isGratitude,
      can_convert_to_post: canConvertToPost,
      image_base64,
      image_name,
    };

    try {
      const res = await fetch("/api/journal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(entryData),
      });

      if (res.ok) {
        form.reset();
        setEntryType(null);
        setSelectedMood(null);
        setEnergyLevel(null);
        setSelectedTags([]);
        setCustomTag("");
        setCanConvertToPost(false);
        if (imagePreview) {
          URL.revokeObjectURL(imagePreview);
          setImagePreview(null);
        }
        setImageFile(null);
        await loadEntries();
      } else {
        const error = await res.json();
        alert(error.error || "Failed to add entry");
      }
    } catch (e) {
      alert("Failed to add entry");
    }
  };

  const convertToPost = async (entry: any) => {
    try {
      const res = await fetch("/api/mood-posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: entry.content,
          mood: entry.mood,
          mood_emoji: entry.mood_emoji,
          visibility: "public",
          anonymous: false,
          owner_email: user.email,
        }),
      });

      if (res.ok) {
        alert("Entry converted to mood post! 🎉");
        router.push("/mood-feed");
      } else {
        const error = await res.json();
        alert(error.error || "Failed to convert to post");
      }
    } catch (e) {
      alert("Failed to convert to post");
    }
  };

  // Edit / Delete state and handlers
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<any>(null);

  const startEditing = (entry: any) => {
    setEditingEntryId(entry.id);
    setEditFormData({ title: entry.title || "", content: entry.content || "", tags: entry.tags || [] });
  };

  const cancelEditing = () => {
    setEditingEntryId(null);
    setEditFormData(null);
  };

  const updateEntry = async (entryId: string) => {
    try {
      const res = await fetch("/api/journal", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entry_id: entryId,
          user_email: user.email,
          title: editFormData.title,
          content: editFormData.content,
          tags: editFormData.tags,
        }),
      });

      if (res.ok) {
        cancelEditing();
        await loadEntries();
      } else {
        const error = await res.json();
        alert(error.error || "Failed to update entry");
      }
    } catch (e) {
      alert("Failed to update entry");
    }
  };

  const deleteEntry = async (entryId: string) => {
    if (!confirm("Are you sure you want to delete this entry?")) return;
    try {
      const res = await fetch(`/api/journal?entry_id=${entryId}&user_email=${encodeURIComponent(user.email)}`, {
        method: "DELETE",
      });

      if (res.ok) {
        // If deleting the entry being edited, reset edit state
        if (editingEntryId === entryId) cancelEditing();
        await loadEntries();
      } else {
        const error = await res.json();
        alert(error.error || "Failed to delete entry");
      }
    } catch (e) {
      alert("Failed to delete entry");
    }
  };

  const addCustomTag = () => {
    if (
      customTag.trim() &&
      !selectedTags.includes(customTag.trim().toLowerCase())
    ) {
      setSelectedTags([...selectedTags, customTag.trim().toLowerCase()]);
      setCustomTag("");
    }
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };

  useEffect(() => {
    const mounted = true;

    const checkAuth = async () => {
      // Only set loading if we don't already have a user
      if (!user) {
        setLoading(true);
      }

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
        router.push("/");
        return;
      }
      if (mounted) setUser(session.user);
      setLoading(false);
    };

    // Only check auth if we don't have a user
    if (!user) {
      checkAuth();
    }
  }, [nextSession, router, user]);

  useEffect(() => {
    if (user?.email && entries.length === 0 && gratitudeEntries.length === 0) {
      loadEntries();
    }
  }, [user, loadEntries, entries.length, gratitudeEntries.length]);

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

  const currentEntries = activeTab === "journal" ? entries : gratitudeEntries;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <BookOpen className="w-8 h-8 text-[var(--brand-blue)]" />
            <h1 className="text-3xl font-bold text-gray-900">
              Feel Journal
            </h1>
          </div>
          <p className="text-gray-600">
            Your private space for thoughts, reflections, and gratitude.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveTab("journal")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
              activeTab === "journal"
                ? "bg-blue-500 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            <BookOpen className="w-4 h-4" />
            Journal ({entries.length})
          </button>
          <button
            onClick={() => setActiveTab("gratitude")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
              activeTab === "gratitude"
                ? "bg-green-500 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            <Heart className="w-4 h-4" />
            Gratitude ({gratitudeEntries.length})
          </button>
        </div>

        {/* Add Entry Button */}
        <div className="mb-8">
          {!entryType && (
            <div className="relative">
              <button
                onClick={() => setShowAddMenu(!showAddMenu)}
                className="btn-primary rounded-xl px-6 py-3 flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Add Entry
              </button>

              {/* Dropdown Menu */}
              {showAddMenu && (
                <div className="absolute top-full left-0 mt-2 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-10 min-w-[200p
x]">                                                                                                                                                      <button
                    onClick={() => {
                      setEntryType("journal");
                      setShowAddMenu(false);
                    }}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 transition-colors"
                  >
                    <BookOpen className="w-5 h-5 text-blue-500" />
                    <div>
                      <div className="font-medium text-gray-900">Journal Entry</div>
                      <div className="text-sm text-gray-500">Write your thoughts and reflections</div>
                    </div>
                  </button>
                  <button
                    onClick={() => {
                      setEntryType("gratitude");
                      setShowAddMenu(false);
                    }}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 transition-colors border-t border-gra
y-100"                                                                                                                                                    >
                    <Heart className="w-5 h-5 text-green-500" />
                    <div>
                      <div className="font-medium text-gray-900">Gratitude Note</div>
                      <div className="text-sm text-gray-500">Express what you're grateful for</div>
                    </div>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* New Journal Entry Form */}
        {entryType && (
          <div className="bg-white rounded-xl p-6 soft-glow mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                {entryType === "gratitude" ? (
                  <>
                    <Heart className="w-5 h-5 text-green-500" />
                    New Gratitude Note
                  </>
                ) : (
                  <>
                    <BookOpen className="w-5 h-5 text-blue-500" />
                    New Journal Entry
                  </>
                )}
              </h3>
              <button
                onClick={() => {
                  setEntryType(null);
                  setSelectedMood(null);
                  setEnergyLevel(null);
                  setSelectedTags([]);
                  setImageFile(null);
                  setImagePreview(null);
                  setCanConvertToPost(false);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Close form"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <form
              onSubmit={(e) => addEntry(e, entryType === "gratitude")}
              className="grid gap-4"
            >
              {entryType === "journal" && (
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
                placeholder={
                  entryType === "gratitude"
                    ? "What are you grateful for today?"
                    : "Write your thoughts, feelings, or reflections..."
                }
                className="input-field h-32 resize-none"
                required
                maxLength={1000}
              />

              <div className="text-sm">
                <button
                  type="button"
                  className="btn-secondary rounded px-3 py-2"
                  onClick={() => imageInputRef.current?.click()}
                >
                  + Add image (optional)
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
              </div>

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

              {/* Energy Level Selection */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Energy level:
                </label>
                <div className="flex gap-2">
                  {energyLevels.map((level) => (
                    <button
                      key={level.value}
                      type="button"
                      className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg text-sm transition-all ${
                        energyLevel === level.value
                          ? "bg-green-100 border-2 border-green-300 transform scale-105"
                          : "bg-gray-100 border border-gray-300 hover:bg-gray-200 hover:scale-105"
                      }`}
                      onClick={() =>
                        setEnergyLevel(
                          energyLevel === level.value ? null : level.value,
                        )
                      }
                      style={{
                        backgroundColor:
                          energyLevel === level.value
                            ? level.color + "20"
                            : undefined,
                      }}
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
                          ? "bg-purple-100 border border-purple-300 text-purple-700"
                          : "bg-gray-100 border border-gray-300 hover:bg-gray-200"
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
                    onKeyPress={(e) =>
                      e.key === "Enter" && (e.preventDefault(), addCustomTag())
                    }
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
                    Selected: {selectedTags.map((tag) => `#${tag}`).join(", ")}
                  </div>
                )}
              </div>

              {/* Convert to Post Option */}
              {entryType !== "gratitude" && (
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="canConvertToPost"
                    checked={canConvertToPost}
                    onChange={(e) => setCanConvertToPost(e.target.checked)}
                    className="rounded"
                  />
                  <label
                    htmlFor="canConvertToPost"
                    className="text-sm text-gray-700"
                  >
                    Allow this entry to be shared as a mood post
                  </label>
                </div>
              )}

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="btn-primary rounded-xl px-4 py-2"
                >
                  Save Entry
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEntryType(null);
                    setSelectedMood(null);
                    setSelectedTags([]);
                    setCustomTag("");
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
                {activeTab === "journal"
                  ? "No journal entries yet"
                  : "No gratitude notes yet"}
              </p>
              <p>
                Start writing your first{" "}
                {activeTab === "journal" ? "entry" : "gratitude note"}!
                ✨
              </p>
            </div>
          )}

          {currentEntries.map((entry) => (
            <article
              key={entry.id}
              className="bg-white rounded-xl p-6 soft-glow"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                  {entry.mood_emoji && (
                    <span className="text-2xl">{entry.mood_emoji}</span>
                  )}
                  <div>
                    {entry.title && (
                      <h3 className="font-semibold text-gray-900">
                        {entry.title}
                      </h3>
                    )}
                    <div className="text-xs text-gray-500">
                      {new Date(entry.created_at).toLocaleString()}
                      {entry.updated_at !== entry.created_at && " (edited)"}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {!entry.is_gratitude && entry.can_convert_to_post && (
                  <button
                    onClick={() => convertToPost(entry)}
                    className="text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 px-2 py-1 rounded-md transition-colors"
                    title="Convert to mood post"
                  >
                    Share 📤
                  </button>
                )}
                  <button
                    onClick={() => startEditing(entry)}
                    className="text-xs bg-yellow-100 hover:bg-yellow-200 text-yellow-700 px-2 py-1 rounded-md transition-colors"
                    title="Edit entry"
                  >
                    Edit ✏️
                  </button>
                  <button
                    onClick={() => deleteEntry(entry.id)}
                    className="text-xs bg-red-100 hover:bg-red-200 text-red-700 px-2 py-1 rounded-md transition-colors"
                    title="Delete entry"
                  >
                    Delete 🗑️
                  </button>
                </div>
              </div>

              {editingEntryId === entry.id ? (
                <div className="grid gap-2">
                  <input
                    type="text"
                    value={editFormData?.title || ""}
                    onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                    className="input-field"
                  />
                  <textarea
                    value={editFormData?.content || ""}
                    onChange={(e) => setEditFormData({ ...editFormData, content: e.target.value })}
                    className="input-field h-32"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => updateEntry(entry.id)}
                      className="btn-primary rounded px-3 py-2"
                    >
                      Save
                    </button>
                    <button
                      onClick={cancelEditing}
                      className="btn-secondary rounded px-3 py-2"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-gray-800 leading-relaxed mb-3 whitespace-pre-wrap">
                  {entry.content}
                </div>
              )}

              {entry.image_url && (
                <div className="mt-3">
                  <img src={entry.image_url} alt="journal image" className="w-full rounded" />
                </div>
              )}

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
                    <span>
                      Mood: {entry.mood_emoji} {entry.mood}
                    </span>
                  )}
                  {entry.energy_level && (
                    <span>
                      Energy: {" "}
                      {
                        energyLevels.find((l) => l.value === entry.energy_level)
                          ?.emoji
                      } {" "}
                      {
                        energyLevels.find((l) => l.value === entry.energy_level)
                          ?.label
                      }
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
