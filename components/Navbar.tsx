"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Target,
  BookOpen,
  Calendar,
  Compass,
  MessageCircle,
  BarChart2,
  Settings,
} from "lucide-react";

export default function Navbar({ className = "" }: { className?: string }) {
  const pathname = usePathname();

  const links = [
    { href: "/", label: "Home", icon: Home },
    { href: "/goals", label: "Goals", icon: Target },
    { href: "/journal", label: "Journal", icon: BookOpen },
    { href: "/events", label: "Events", icon: Calendar },
    { href: "/explore", label: "Explore", icon: Compass },
    { href: "/messages", label: "Messages", icon: MessageCircle },
    { href: "/analytics", label: "Analytics", icon: BarChart2 },
    { href: "/settings", label: "Settings", icon: Settings },
  ];

  return (
    <nav className={`w-full bg-[var(--card-bg)] border-b border-[var(--card-border)] ${className}`}>
      <div className="max-w-7xl mx-auto px-4 py-3 flex gap-6 overflow-x-auto">
        {links.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;

          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                active
                  ? "bg-[var(--brand-blue)] text-white"
                  : "text-[var(--feelup-muted)] hover:bg-[var(--input-bg)] hover:text-[var(--foreground)]"
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
