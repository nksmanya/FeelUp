"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  User,
  Settings,
  Trophy,
  LogOut,
} from "lucide-react";
import { navigationLinks } from "../lib/navigation";

/**
 * Navbar component for mobile view and primary top-level navigation.
 */
export default function Navbar() {
  const { data: session } = useSession();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // Navigation items are now sourced from a centralized configuration file
  const navigation = navigationLinks;

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    router.push("/");
  };

  return (
    <nav className="md:hidden backdrop-blur-sm bg-white/60 border-b border-transparent sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo & Brand */}
          <div className="flex items-center">
            <Link href="/mood-feed" className="flex items-center space-x-3">
              <div
                className="logo-img"
                style={{ ["--logo-size" as any]: "44px" }}
              >
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-white font-bold text-lg">F</span>
                </div>
              </div>
              <div>
                <div className="text-xl font-bold text-[var(--brand-black)]">
                  Feel<span className="text-[var(--brand-blue)]">Up</span>
                </div>
                <div className="text-xs text-[var(--feelup-muted)] hidden sm:block">
                  Positive Vibes Only
                </div>
              </div>
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex space-x-3 items-center">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`group relative px-3 py-2 rounded-full text-sm font-medium transition-colors ${pathname === item.href
                    ? "bg-[rgba(37,150,190,0.09)] text-[var(--brand-blue)]"
                    : "text-[var(--text-muted)] hover:bg-[rgba(37,150,190,0.03)] hover:text-[var(--brand-blue)]"
                  }`}
              >
                <div className="flex items-center space-x-2">
                  <item.icon className="w-4 h-4" />
                  <span className="hidden lg:inline">{item.name}</span>
                </div>

                {/* Tooltip for mobile */}
                <div className="lg:hidden absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-[var(--brand-black)] text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  {item.name}
                  <div className="text-xs text-[rgba(255,255,255,0.8)]">
                    {item.description}
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* User Profile */}
          <div className="relative">
            {session?.user ? (
              <div>
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center space-x-3 p-2 rounded-full hover:bg-[rgba(37,150,190,0.04)] transition-colors"
                >
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-white font-semibold text-sm"
                    style={{
                      background: "linear-gradient(90deg,#e6f7ff,#fff0f6)",
                      color: "var(--brand-blue)",
                    }}
                  >
                    {session.user.name?.[0] || session.user.email?.[0] || "?"}
                  </div>
                  <div className="hidden sm:block text-left">
                    <div className="text-sm font-medium text-gray-900">
                      {session.user.name || "User"}
                    </div>
                    <div className="text-xs text-gray-500">
                      {session.user.email}
                    </div>
                  </div>
                  <svg
                    className="w-4 h-4 text-gray-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>

                {/* Profile Dropdown */}
                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-transparent py-1 z-50 surface-card">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                          {session.user.name?.[0] ||
                            session.user.email?.[0] ||
                            "?"}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">
                            {session.user.name || "User"}
                          </div>
                          <div className="text-sm text-gray-500">
                            {session.user.email}
                          </div>
                        </div>
                      </div>
                    </div>

                    <Link
                      href="/profile"
                      className="flex items-center px-4 py-2 text-sm text-[var(--text-muted)] hover:bg-[rgba(15,23,42,0.03)]"
                    >
                      <User className="w-4 h-4 mr-3" />
                      View Profile
                    </Link>
                    <Link
                      href="/settings"
                      className="flex items-center px-4 py-2 text-sm text-[var(--text-muted)] hover:bg-[rgba(15,23,42,0.03)]"
                    >
                      <Settings className="w-4 h-4 mr-3" />
                      Settings
                    </Link>
                    <Link
                      href="/achievements"
                      className="flex items-center px-4 py-2 text-sm text-[var(--text-muted)] hover:bg-[rgba(15,23,42,0.03)]"
                    >
                      <Trophy className="w-4 h-4 mr-3" />
                      Achievements
                    </Link>
                    <div className="border-t border-gray-100 my-1"></div>
                    <button
                      onClick={handleSignOut}
                      className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      <LogOut className="w-4 h-4 mr-3" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/"
                className="bg-[var(--brand-blue)] text-white px-4 py-2 rounded-full text-sm font-medium hover:brightness-95 transition-colors"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden border-t border-gray-200">
        <div className="flex overflow-x-auto py-2 px-4 space-x-1">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center min-w-0 flex-shrink-0 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${pathname === item.href
                  ? "bg-purple-100 text-purple-700"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`}
            >
              <item.icon className="w-5 h-5 mb-1" />
              <span className="truncate">{item.name}</span>
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
