"use client";

import ClientAuthCard from "../../components/ClientAuthCard";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-linear-to-br from-purple-50 via-pink-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        {/* Navigation */}
        <nav className="mb-8">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-purple-800">FeelUp</h1>
            <button
              onClick={() => router.push("/mood-feed")}
              className="text-purple-600 hover:text-purple-800 transition-colors"
            >
              ← Back to Home
            </button>
          </div>
        </nav>

        {/* Main Content */}
        <div className="flex items-center justify-center min-h-[70vh]">
          <div className="w-full max-w-md">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-800 mb-2">
                Welcome Back
              </h2>
              <p className="text-gray-600">
                Sign in to continue your wellness journey
              </p>
            </div>

            <ClientAuthCard />
          </div>
        </div>

        {/* Footer Links */}
        <div className="mt-12 text-center text-sm text-gray-500">
          <div className="flex justify-center gap-6">
            <a
              href="/privacy"
              className="hover:text-purple-600 transition-colors"
            >
              Privacy Policy
            </a>
            <a
              href="/terms"
              className="hover:text-purple-600 transition-colors"
            >
              Terms of Service
            </a>
            <a
              href="mailto:support@feelup.com"
              className="hover:text-purple-600 transition-colors"
            >
              Support
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
