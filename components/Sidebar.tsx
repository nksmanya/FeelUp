"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  Heart,
  Target,
  BookOpen,
  Calendar,
  Search,
  MessageCircle,
  BarChart3,
  User,
  Settings,
  Trophy,
  LogOut,
  Info,
  Shield,
  HelpCircle,
  FileText,
  ChevronUp,
} from "lucide-react";

export default function Sidebar() {
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  const navigation = [
    { name: "Home", href: "/mood-feed", icon: Heart },
    { name: "Goals", href: "/goals", icon: Target },
    { name: "Journal", href: "/journal", icon: BookOpen },
    { name: "Events", href: "/events", icon: Calendar },
    { name: "Explore", href: "/explore", icon: Search },
    { name: "Messages", href: "/messages", icon: MessageCircle },
    { name: "Analytics", href: "/analytics", icon: BarChart3 },
  ];

  const resourceLinks = [
    { name: "About", href: "/about", icon: Info },
    { name: "Privacy Policy", href: "/privacy", icon: Shield },
    { name: "Settings", href: "/settings", icon: Settings },
    { name: "Support", href: "/support", icon: HelpCircle },
    { name: "Terms", href: "/terms", icon: FileText },
  ];

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    router.push("/");
  };

  return (
    <aside className="hidden md:flex md:flex-col md:w-52 lg:w-56 bg-white border-r sticky top-0 h-screen z-40">
      <div className="flex-0 p-4 flex items-center gap-3">
        <Link href="/mood-feed" className="flex items-center space-x-3">
          <div className="w-11 h-11 rounded-lg bg-[var(--brand-blue)] flex items-center justify-center text-white font-bold">F</div>
          <div>
            <div className="font-bold text-lg">FeelUp</div>
            <div className="text-xs text-[var(--feelup-muted)]">Positive Vibes</div>
          </div>
        </Link>
      </div>

      <nav className="flex-1 overflow-auto px-2 py-3">
        <ul className="space-y-1">
          {navigation.map((item) => (
            <li key={item.name}>
              <Link
                href={item.href}
                className={`flex items-center gap-3 px-2 py-2 rounded-md transition-colors mx-1 ${
                  pathname === item.href
                    ? "bg-[rgba(37,150,190,0.08)] text-[var(--brand-blue)]"
                    : "text-[var(--text-muted)] hover:bg-[rgba(37,150,190,0.03)] hover:text-[var(--brand-blue)]"
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium text-sm">{item.name}</span>
              </Link>
            </li>
          ))}
        </ul>

        {/* Resources Section */}
        <div className="mt-8 px-2">
          <div className="flex items-center justify-between mb-2 px-1">
            <h3 className="text-xs font-semibold text-[var(--feelup-muted)] uppercase tracking-wide">
              Resources
            </h3>
            <ChevronUp className="w-3 h-3 text-[var(--feelup-muted)]" />
          </div>
          <ul className="space-y-1">
            {resourceLinks.map((item) => (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-2 py-1.5 rounded-md transition-colors mx-1 ${
                    pathname === item.href
                      ? "bg-[rgba(37,150,190,0.08)] text-[var(--brand-blue)]"
                      : "text-[var(--text-muted)] hover:bg-[rgba(37,150,190,0.03)] hover:text-[var(--brand-blue)]"
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  <span className="font-medium text-xs">{item.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      <div className="flex-0 p-3 border-t">
        {session?.user ? (
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center text-white font-semibold">
                {session.user.name?.[0] || session.user.email?.[0] || "?"}
              </div>
              <div>
                <div className="text-sm font-medium">{session.user.name || "User"}</div>
                <div className="text-xs text-gray-500">{session.user.email}</div>
              </div>
            </div>

            <button onClick={handleSignOut} className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-md bg-red-50 text-red-600 hover:bg-red-100">
              <LogOut className="w-4 h-4" />
              <span className="text-sm font-medium">Logout</span>
            </button>
          </div>
        ) : (
          <div className="text-center">
            <Link href="/" className="bg-[var(--brand-blue)] text-white px-3 py-2 rounded-full text-sm">Sign In</Link>
          </div>
        )}
      </div>
    </aside>
  );
}
