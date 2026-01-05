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
    <aside className="hidden md:flex md:flex-col md:w-64 lg:w-72 bg-gradient-to-b from-gray-50 to-white border-r border-gray-100 sticky top-0 h-screen z-40 shadow-sm">
      <div className="flex-0 p-6 flex items-center gap-4">
        <Link href="/mood-feed" className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
            F
          </div>
          <div>
            <div className="font-bold text-xl text-gray-900">FeelUp</div>
            <div className="text-sm text-gray-500 font-medium">Positive Vibes</div>
          </div>
        </Link>
      </div>

      <nav className="flex-1 overflow-auto px-4 py-2">
        <ul className="space-y-2">
          {navigation.map((item) => (
            <li key={item.name}>
              <Link
                href={item.href}
                className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 group ${
                  pathname === item.href
                    ? "bg-blue-50 text-blue-600 shadow-sm border border-blue-100"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 hover:shadow-sm"
                }`}
              >
                <item.icon className={`w-5 h-5 transition-colors ${
                  pathname === item.href ? "text-blue-500" : "text-gray-400 group-hover:text-gray-600"
                }`} />
                <span className="font-medium text-sm">{item.name}</span>
              </Link>
            </li>
          ))}
        </ul>

        {/* Resources Section */}
        <div className="mt-6 px-0">
          <div className="flex items-center justify-between mb-3 px-4">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Resources
            </h3>
            <ChevronUp className="w-3 h-3 text-gray-400" />
          </div>
          <ul className="space-y-1">
            {resourceLinks.map((item) => (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-2 transition-all duration-200 group ${
                    pathname === item.href
                      ? "bg-blue-50 text-blue-600 border-r-2 border-blue-500"
                      : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                  }`}
                >
                  <item.icon className={`w-4 h-4 transition-colors ${
                    pathname === item.href ? "text-blue-500" : "text-gray-400 group-hover:text-gray-600"
                  }`} />
                  <span className="font-medium text-sm">{item.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      <div className="flex-0 p-4 border-t border-gray-100">
        {session?.user ? (
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-11 h-11 rounded-full bg-gradient-to-br from-purple-400 via-blue-500 to-green-400 flex items-center justify-center text-white font-semibold shadow-md">
                {session.user.name?.[0] || session.user.email?.[0] || "?"}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-gray-900 truncate">{session.user.name || "User"}</div>
                <div className="text-xs text-gray-500 truncate">{session.user.email}</div>
              </div>
            </div>

            <button onClick={handleSignOut} className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition-colors duration-200 font-medium text-sm">
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        ) : (
          <div className="text-center">
            <Link href="/" className="block w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-3 rounded-xl text-sm font-medium hover:shadow-lg transition-all duration-200">Sign In</Link>
          </div>
        )}
      </div>
    </aside>
  );
}
