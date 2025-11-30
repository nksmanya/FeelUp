"use client";

import { useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Logo from "../../components/Logo";

export default function MoodFeedPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") router.push("/");
  }, [status, router]);

  if (status === "loading") return <div className="p-8">Loading...</div>;

  const user = session?.user;

  return (
    <div className="min-h-screen p-8">
      <header className="max-w-4xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Logo size={40} />
          <div>
            <div className="text-sm text-[var(--feelup-muted)]">Signed in as</div>
            <div className="font-semibold">{user?.name || "Anonymous"}</div>
            <div className="text-xs text-[var(--feelup-muted)]">{user?.email}</div>
          </div>
        </div>
        <div>
          <button className="btn-secondary rounded-md px-3 py-2" onClick={() => signOut({ callbackUrl: '/' })}>Sign out</button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto mt-8">
        <h1 className="text-2xl font-semibold mb-4">Mood Feed</h1>
        <p className="text-[var(--feelup-muted)] mb-6">A simple feed of recent moods and reflections (placeholder content).</p>

        <section className="grid gap-4">
          {/* Mock feed items */}
          <article className="rounded-lg bg-white p-4 soft-glow">
            <div className="text-sm text-[var(--feelup-muted)]">{user?.name || 'You'}</div>
            <div className="mt-2">Feeling calm and reflective today — took a walk and noticed the small things.</div>
          </article>

          <article className="rounded-lg bg-white p-4 soft-glow">
            <div className="text-sm text-[var(--feelup-muted)]">Alex</div>
            <div className="mt-2">Anxious in the morning, but talking helped.</div>
          </article>
        </section>
      </main>
    </div>
  );
}
