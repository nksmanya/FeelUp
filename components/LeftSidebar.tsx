import Link from "next/link";

export default function LeftSidebar() {
  return (
    <aside className="hidden lg:block w-64 pr-6 shrink-0 space-y-4">
      <div className="sticky top-24 space-y-4">
        {/* Circles */}
        <div className="glass rounded-2xl p-5 border border-[var(--card-border)] bg-[var(--card-bg)] shadow-sm">
          <h4 className="text-sm font-bold text-[var(--foreground)] mb-3">Circles</h4>
          <ul className="text-[var(--feelup-muted)] space-y-2.5">
            <li>
              <Link href="/circles/wellness" className="text-sm font-medium hover:text-[var(--brand-blue)] transition-colors hover:underline underline-offset-4 decoration-[var(--brand-blue)]/30">
                #wellness
              </Link>
            </li>
            <li>
              <Link href="/circles/gratitude" className="text-sm font-medium hover:text-[var(--brand-blue)] transition-colors hover:underline underline-offset-4 decoration-[var(--brand-blue)]/30">
                #gratitude
              </Link>
            </li>
            <li>
              <Link href="/circles/mindfulness" className="text-sm font-medium hover:text-[var(--brand-pink)] transition-colors hover:underline underline-offset-4 decoration-[var(--brand-pink)]/30">
                #mindfulness
              </Link>
            </li>
            <li>
              <Link href="/circles/exercise" className="text-sm font-medium hover:text-[var(--brand-blue)] transition-colors hover:underline underline-offset-4 decoration-[var(--brand-blue)]/30">
                #exercise
              </Link>
            </li>
          </ul>
        </div>

        {/* Discover */}
        <div className="glass rounded-2xl p-5 border border-[var(--card-border)] bg-[var(--card-bg)] shadow-sm">
          <h4 className="text-sm font-bold text-[var(--foreground)] mb-3">Discover</h4>
          <ul className="text-[var(--feelup-muted)] space-y-3">
            <li>
              <Link href="/discover" className="text-sm font-medium hover:text-[var(--foreground)] transition-colors flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--brand-blue)]"></span>
                Trending emotions
              </Link>
            </li>
            <li>
              <Link href="/support" className="text-sm font-medium hover:text-[var(--foreground)] transition-colors flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--brand-pink)]"></span>
                Support hub
              </Link>
            </li>
            <li>
              <Link href="/anonymous" className="text-sm font-medium hover:text-[var(--foreground)] transition-colors flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--feelup-accent)]"></span>
                Anonymous posts
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </aside>
  );
}
