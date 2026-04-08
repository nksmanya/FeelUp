import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";

type Profile = {
  full_name?: string;
  avatar_url?: string | null;
};

type Post = {
  id: string;
  content: string;
  mood?: string;
  mood_emoji?: string;
  mood_color?: string;
  anonymous?: boolean;
  owner_email?: string | null;
  created_at?: string;
  profiles?: Profile | null;
};

export default function PostCard({ post }: { post: Post }) {
  const name = post.anonymous
    ? "Anonymous"
    : post.profiles?.full_name || post.owner_email || "User";
  const avatarLetter = name?.[0] || "U";

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

  const time = timeAgo(post.created_at);

  return (
    <motion.article 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="glass rounded-[1.25rem] p-5 mb-5 border border-[var(--card-border)] bg-[var(--card-bg)] shadow-sm hover:shadow-md transition-shadow duration-300"
    >
      <header className="post-meta mb-3">
        <div className="avatar w-11 h-11 rounded-full bg-gradient-to-tr from-[var(--feelup-accent)] to-[var(--brand-pink)] text-white flex justify-center items-center font-bold text-lg shadow-sm ring-2 ring-[var(--card-border)]" aria-hidden>
          {avatarLetter}
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div className="leading-tight">
              <div className="text-[15px] font-bold text-[var(--foreground)] tracking-tight">
                {name}
              </div>
              <div className="text-[12px] text-[var(--feelup-muted)] font-medium mt-0.5">{time}</div>
            </div>
            {post.mood && (
              <div
                className="text-xs px-3 py-1.5 rounded-full font-semibold shadow-sm flex items-center gap-1.5 border border-white/20 dark:border-white/10"
                style={{ 
                  background: post.mood_color || "var(--input-bg)", 
                  color: "var(--foreground)" 
                }}
              >
                <motion.span 
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  className="text-sm inline-block"
                >
                  {post.mood_emoji}
                </motion.span> {post.mood}
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="mt-4 text-[15px] leading-relaxed text-[var(--foreground)] opacity-90 pl-[56px] pr-2">
        {post.content}
      </div>

      <footer className="mt-5 flex items-center justify-between text-sm text-[var(--feelup-muted)] pl-[56px] border-t border-[var(--card-border)] pt-4">
        <div className="flex items-center gap-6">
          <button
            className="flex items-center gap-2 font-medium hover:text-[var(--brand-blue)] transition-colors group"
            aria-label="Like"
          >
            <motion.span 
              whileHover={{ scale: 1.2, rotate: -5 }} 
              whileTap={{ scale: 0.9 }} 
              className="text-lg grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100 transition-all"
            >
              👍
            </motion.span>
            <span>Like</span>
          </button>

          <Link
            href={`/profile/${post.owner_email || ""}`}
            className="flex items-center gap-2 font-medium hover:text-[var(--brand-blue)] transition-colors group"
          >
            <motion.span 
              whileHover={{ scale: 1.2 }} 
              className="text-lg grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100 transition-all"
            >
              💬
            </motion.span>
            <span>Comment</span>
          </Link>

          <button
            className="flex items-center gap-2 font-medium hover:text-[var(--brand-blue)] transition-colors group"
            aria-label="Share"
          >
            <motion.span 
              whileHover={{ scale: 1.2, rotate: 10 }} 
              className="text-lg grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100 transition-all"
            >
              🔗
            </motion.span>
            <span>Share</span>
          </button>
        </div>
      </footer>
    </motion.article>
  );
}
