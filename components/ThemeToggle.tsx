"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button
        className="p-2 rounded-lg hover:bg-[var(--input-bg)] transition-colors group"
        aria-label="Toggle theme"
        type="button"
      >
        <span className="w-5 h-5 block" aria-hidden="true" />
      </button>
    );
  }

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="p-2 rounded-lg hover:bg-[var(--input-bg)] transition-colors group"
      aria-label="Toggle theme"
      type="button"
    >
      {theme === "dark" ? (
        <Sun className="w-5 h-5 text-[var(--feelup-muted)] group-hover:text-[var(--foreground)] transition-colors" />
      ) : (
        <Moon className="w-5 h-5 text-[var(--feelup-muted)] group-hover:text-[var(--foreground)] transition-colors" />
      )}
    </button>
  );
}
