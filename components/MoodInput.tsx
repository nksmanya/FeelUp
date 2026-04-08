"use client";

import { useEffect, useState } from "react";

const moodOptions = [
  { label: "Happy", emoji: "😊" },
  { label: "Calm", emoji: "😌" },
  { label: "Excited", emoji: "🤩" },
  { label: "Grateful", emoji: "🙏" },
  { label: "Thoughtful", emoji: "🤔" },
  { label: "Sad", emoji: "😔" },
  { label: "Anxious", emoji: "😰" },
  { label: "Tired", emoji: "😴" },
];

export default function MoodInput({
  onSubmit,
}: {
  onSubmit: (data: {
    content: string;
    mood: string | null;
    moodEmoji: string | null;
    anonymous: boolean;
  }) => void;
}) {
  const [text, setText] = useState("");
  const [selectedMood, setSelectedMood] = useState<any>(null);
  const [confidence, setConfidence] = useState<number | null>(null);
  const [anonymous, setAnonymous] = useState(false);
  const [detecting, setDetecting] = useState(false);

  /* ---------------- AI DETECTION ---------------- */

  useEffect(() => {
    if (text.trim().length < 2) {
      setSelectedMood(null);
      setConfidence(null);
      return;
    }

    const timer = setTimeout(async () => {
      setDetecting(true);

      try {
        const res = await fetch("/api/detect-mood", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text }),
        });

        const data = await res.json();

        console.log("AI response:", data); // 👈 DEBUG (REMOVE LATER)

        if (data?.mood) {
          const mood = moodOptions.find(
            (m) => m.label === data.mood
          );

          if (mood) {
            setSelectedMood(mood);
            setConfidence(
              typeof data.confidence === "number"
                ? data.confidence
                : null
            );
          }
        }
      } catch (err) {
        console.error("Mood detection failed", err);
      } finally {
        setDetecting(false);
      }
    }, 700);

    return () => clearTimeout(timer);
  }, [text]);

  /* ---------------- SUBMIT ---------------- */

  const handleSubmit = () => {
    if (!text.trim()) return;

    onSubmit({
      content: text,
      mood: selectedMood?.label ?? null,
      moodEmoji: selectedMood?.emoji ?? null,
      anonymous,
    });

    setText("");
    setSelectedMood(null);
    setConfidence(null);
    setAnonymous(false);
  };

  /* ---------------- UI ---------------- */

  return (
    <div className="glass rounded-[1.25rem] p-5 shadow-sm border border-[var(--card-border)] bg-[var(--card-bg)] mb-6 transition-all duration-300 focus-within:shadow-md focus-within:border-[var(--brand-blue)] group">
      <div className="relative">
        <textarea
          className="w-full bg-transparent border-none p-2 resize-none text-[var(--foreground)] placeholder-[var(--feelup-muted)] focus:ring-0 outline-none text-[16px] leading-relaxed transition-all min-h-[80px]"
          placeholder="What's heavily resting on your mind?"
          rows={3}
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        
        {/* Glow effect underlying textarea */}
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[var(--brand-blue)] to-transparent opacity-0 group-focus-within:opacity-100 transition-opacity duration-500"></div>
      </div>

      <div className="flex items-center justify-between mt-4">
        <div className="flex items-center gap-4 flex-1">
          <div className="text-[13px] min-h-[22px] flex items-center">
            {detecting ? (
              <span className="flex items-center gap-2 text-[var(--brand-blue)] font-medium animate-pulse">
                <span>🧠</span> Tuning into your mood...
              </span>
            ) : selectedMood ? (
              <span className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--input-bg)] border border-[var(--card-border)]">
                <span className="text-[var(--feelup-muted)] font-medium">Detects:</span>
                <span className="font-bold text-[var(--foreground)] flex items-center gap-1.5">
                  <span className="text-base">{selectedMood.emoji}</span> {selectedMood.label}
                </span>

                {confidence !== null && (
                  <span className="ml-1 text-[11px] text-[var(--brand-pink)] font-semibold mix-blend-multiply dark:mix-blend-lighten">
                    {confidence}%
                  </span>
                )}
              </span>
            ) : (
               <span className="text-[var(--feelup-muted)] italic opacity-70">
                 AI will detect your mood automatically.
               </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4 shrink-0">
          <label className="flex items-center gap-2 text-sm text-[var(--feelup-muted)] hover:text-[var(--foreground)] transition-colors cursor-pointer select-none">
            <input
              type="checkbox"
              checked={anonymous}
              onChange={() => setAnonymous(!anonymous)}
              className="rounded-md border-[var(--input-border)] text-[var(--brand-blue)] focus:ring-[var(--brand-blue)] accent-[var(--brand-blue)] w-4 h-4 transition-all"
            />
            <span className="font-medium">Anonymous</span>
          </label>

          <button
            onClick={handleSubmit}
            disabled={!text.trim() || detecting}
            className="btn-primary gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-blue-500/20"
          >
            <span>Share</span>
            <span className="text-lg leading-none">✨</span>
          </button>
        </div>
      </div>
    </div>
  );
}
