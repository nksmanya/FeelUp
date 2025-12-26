import React from 'react';
import posts from '../data/mood_posts.json';
import PostCard from '../components/PostCard';
import Navbar from '../components/Navbar';

export default function Home() {
  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f7fbfc,#ffffff)]">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: sidebar */}
          <aside className="hidden lg:block lg:col-span-3">
            <div className="surface-card p-4 mb-4">
              <h3 className="text-sm font-semibold text-[var(--brand-black)] mb-2">Home</h3>
              <p className="text-xs text-[var(--text-muted)]">A calm feed of community posts.</p>
            </div>

            <div className="surface-card p-4">
              <h4 className="text-sm font-semibold mb-2">Communities</h4>
              <ul className="text-[var(--text-muted)] space-y-2">
                <li>#wellness</li>
                <li>#gratitude</li>
                <li>#mindfulness</li>
                <li>#exercise</li>
              </ul>
            </div>
          </aside>

          {/* Center: feed */}
          <section className="lg:col-span-6">
            <div className="mb-4">
              <div className="surface-card p-4">
                <div className="flex items-center gap-3">
                  <div className="avatar">😊</div>
                  <div className="flex-1">
                    <div className="text-sm font-semibold">Create a post</div>
                    <div className="text-xs text-[var(--text-muted)]">Share a moment or reflection</div>
                  </div>
                  <button className="btn-primary text-sm">Post</button>
                </div>
              </div>
            </div>

            <div>
              {posts.map((p) => (
                <PostCard key={(p as any).id} post={p as any} />
              ))}
            </div>
          </section>

          {/* Right: trends / suggestions */}
          <aside className="hidden lg:block lg:col-span-3">
            <div className="surface-card p-4 mb-4">
              <h3 className="text-sm font-semibold text-[var(--brand-black)] mb-2">Trending</h3>
              <ul className="text-[var(--text-muted)] space-y-2">
                <li>Mindfulness tips</li>
                <li>Gratitude habits</li>
                <li>Workout wins</li>
              </ul>
            </div>

            <div className="surface-card p-4">
              <h4 className="text-sm font-semibold mb-2">Who to follow</h4>
              <div className="space-y-3 text-[var(--text-muted)]">
                <div className="flex items-center gap-3">
                  <div className="avatar">A</div>
                  <div>
                    <div className="text-sm font-medium text-[var(--brand-black)]">Alex Rodriguez</div>
                    <div className="text-xs">@alex</div>
                  </div>
                  <button className="ml-auto btn-secondary text-xs">Follow</button>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
