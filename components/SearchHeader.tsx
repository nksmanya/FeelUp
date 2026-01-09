"use client";

import { Search } from "lucide-react";

/**
 * SearchHeader component extracting the search functionality from the main layout.
 * Includes a search input and an "Ask AI" button.
 */
export default function SearchHeader() {
    return (
        <div className="flex-1 flex justify-center">
            <div className="hidden sm:flex items-center w-full max-w-2xl bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl px-4 py-3 shadow-lg hover:shadow-xl transition-all duration-200">
                <div className="flex items-center">
                    <Search className="w-5 h-5 text-gray-400" />
                </div>
                <input
                    aria-label="Chat with AI"
                    placeholder="Find anything"
                    className="flex-1 px-4 text-sm bg-transparent outline-none placeholder:text-gray-400 text-gray-700"
                />
                <div className="ml-2">
                    <button className="inline-flex items-center gap-2 px-6 py-2 rounded-xl bg-gradient-to-r from-orange-400 to-yellow-400 text-white text-sm font-semibold hover:from-orange-500 hover:to-yellow-500 transition-all duration-200 shadow-md hover:shadow-lg">
                        Ask
                    </button>
                </div>
            </div>
        </div>
    );
}
