export default function RightSidebar() {
  return (
    <aside className="hidden xl:block w-80 pl-6">
      <div className="sticky top-24">
        <div className="surface-card p-4 mb-4">
          <h4 className="text-sm font-semibold mb-2">Mood trends</h4>
          <div className="text-[var(--text-muted)] text-sm">
            Calm ↑ · Anxious ↓ · Grateful ↑
          </div>
        </div>

        <div className="surface-card p-4 mb-4">
          <h4 className="text-sm font-semibold mb-2">Reflection prompt</h4>
          <div className="text-[var(--text-muted)] text-sm">
            What small thing made you feel grateful today?
          </div>
        </div>

        <div className="surface-card p-4">
          <h4 className="text-sm font-semibold mb-2">Suggested circles</h4>
          <ul className="text-[var(--text-muted)] space-y-2 text-sm">
            <li>#wellness</li>
            <li>#gratitude</li>
            <li>#mindfulness</li>
          </ul>
        </div>
      </div>
    </aside>
  );
}
