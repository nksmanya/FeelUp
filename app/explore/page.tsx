"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Navbar from "../../components/Navbar";

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  bio?: string;
  avatar_url?: string;
  location?: string;
  interests: string[];
  followers_count: number;
  following_count: number;
  is_following?: boolean;
  mood_streak?: number;
  last_active: string;
  wellness_focus: string[];
}

const mockUsers: UserProfile[] = [
  {
    id: "1",
    email: "sarah.chen@example.com",
    full_name: "Sarah Chen",
    bio: "Mindfulness enthusiast 🧘‍♀️ | Spreading positivity one breath at a time",
    location: "San Francisco, CA",
    interests: ["meditation", "yoga", "mindfulness", "nature"],
    followers_count: 234,
    following_count: 189,
    mood_streak: 12,
    last_active: "2 hours ago",
    wellness_focus: ["Mental Health", "Stress Management"],
  },
  {
    id: "2",
    email: "alex.rodriguez@example.com",
    full_name: "Alex Rodriguez",
    bio: "Fitness lover 💪 | Psychology student | Helping others achieve their best selves",
    location: "Austin, TX",
    interests: ["fitness", "psychology", "nutrition", "reading"],
    followers_count: 456,
    following_count: 298,
    mood_streak: 7,
    last_active: "1 day ago",
    wellness_focus: ["Physical Health", "Personal Growth"],
  },
  {
    id: "3",
    email: "jamie.park@example.com",
    full_name: "Jamie Park",
    bio: "Creative soul 🎨 | Journaling advocate | Finding beauty in everyday moments",
    location: "Portland, OR",
    interests: ["art", "journaling", "photography", "coffee"],
    followers_count: 178,
    following_count: 245,
    mood_streak: 15,
    last_active: "30 minutes ago",
    wellness_focus: ["Creativity", "Self-Expression"],
  },
  {
    id: "4",
    email: "morgan.taylor@example.com",
    full_name: "Morgan Taylor",
    bio: "Medical student 👩‍⚕️ | Mental health advocate | Balancing studies with self-care",
    location: "Boston, MA",
    interests: ["medicine", "mental health", "study tips", "self-care"],
    followers_count: 567,
    following_count: 134,
    mood_streak: 9,
    last_active: "4 hours ago",
    wellness_focus: ["Mental Health", "Academic Wellness"],
  },
  {
    id: "5",
    email: "riley.chen@example.com",
    full_name: "Riley Chen",
    bio: "Tech professional 💻 | Mindful productivity | Digital wellness explorer",
    location: "Seattle, WA",
    interests: ["technology", "productivity", "digital wellness", "hiking"],
    followers_count: 298,
    following_count: 412,
    mood_streak: 21,
    last_active: "6 hours ago",
    wellness_focus: ["Digital Balance", "Productivity"],
  },
  {
    id: "6",
    email: "casey.wong@example.com",
    full_name: "Casey Wong",
    bio: "Nutrition coach 🥗 | Yoga instructor | Helping you nourish body and mind",
    location: "Los Angeles, CA",
    interests: ["nutrition", "yoga", "cooking", "wellness"],
    followers_count: 789,
    following_count: 234,
    mood_streak: 28,
    last_active: "1 hour ago",
    wellness_focus: ["Nutrition", "Physical Wellness"],
  },
];

export default function ExplorePage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState<UserProfile[]>(mockUsers);
  const [filteredUsers, setFilteredUsers] = useState<UserProfile[]>(mockUsers);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [followingUsers, setFollowingUsers] = useState<Set<string>>(new Set());

  const filters = [
    { id: "all", label: "All Users", count: users.length },
    {
      id: "active",
      label: "Recently Active",
      count: users.filter((u) => u.last_active.includes("hour")).length,
    },
    {
      id: "streaks",
      label: "High Streaks",
      count: users.filter((u) => u.mood_streak && u.mood_streak > 10).length,
    },
    {
      id: "popular",
      label: "Popular",
      count: users.filter((u) => u.followers_count > 300).length,
    },
  ];

  useEffect(() => {
    let filtered = users;

    // Apply filter
    switch (selectedFilter) {
      case "active":
        filtered = users.filter((user) => user.last_active.includes("hour"));
        break;
      case "streaks":
        filtered = users.filter(
          (user) => user.mood_streak && user.mood_streak > 10,
        );
        break;
      case "popular":
        filtered = users.filter((user) => user.followers_count > 300);
        break;
    }

    // Apply search
    if (searchQuery) {
      filtered = filtered.filter(
        (user) =>
          user.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.bio?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.interests.some((interest) =>
            interest.toLowerCase().includes(searchQuery.toLowerCase()),
          ) ||
          user.wellness_focus.some((focus) =>
            focus.toLowerCase().includes(searchQuery.toLowerCase()),
          ),
      );
    }

    setFilteredUsers(filtered);
  }, [searchQuery, selectedFilter, users]);

  const handleFollow = async (userId: string) => {
    if (!session) {
      router.push("/login");
      return;
    }

    const user = users.find((u) => u.id === userId);
    if (!user) return;

    try {
      const isCurrentlyFollowing = followingUsers.has(userId);
      const response = await fetch("/api/follow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          follower_email: session.user?.email,
          following_email: user.email,
          action: isCurrentlyFollowing ? "unfollow" : "follow",
        }),
      });

      if (response.ok) {
        setFollowingUsers((prev) => {
          const newSet = new Set(prev);
          if (newSet.has(userId)) {
            newSet.delete(userId);
          } else {
            newSet.add(userId);
          }
          return newSet;
        });

        // Update follower counts
        setUsers((prev) =>
          prev.map((user) => {
            if (user.id === userId) {
              return {
                ...user,
                followers_count: followingUsers.has(userId)
                  ? user.followers_count - 1
                  : user.followers_count + 1,
                is_following: !followingUsers.has(userId),
              };
            }
            return user;
          }),
        );
      }
    } catch (error) {
      console.error("Follow action failed:", error);
    }
  };

  const getAvatarColor = (name: string) => {
    const colors = [
      "bg-purple-500",
      "bg-blue-500",
      "bg-green-500",
      "bg-yellow-500",
      "bg-pink-500",
      "bg-indigo-500",
      "bg-red-500",
      "bg-teal-500",
    ];
    return colors[name.length % colors.length];
  };

  if (!session) {
    return (
      <div className="min-h-screen bg-linear-to-br from-purple-50 via-pink-50 to-blue-50">
        <Navbar />
        <div className="flex justify-center items-center h-64">
          <div className="text-center bg-white rounded-xl p-8 shadow-sm">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🔍</span>
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              Explore Our Community
            </h2>
            <p className="text-gray-600 mb-6">
              Sign in to discover and connect with amazing people
            </p>
            <button
              onClick={() => router.push("/login")}
              className="btn-primary px-6 py-3 rounded-lg"
            >
              Sign In to Explore
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-purple-50 via-pink-50 to-blue-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-purple-800 mb-4">
            🔍 Explore
          </h1>
          <p className="text-xl text-gray-600 mb-6 max-w-3xl mx-auto">
            Discover amazing people in our wellness community and build
            meaningful connections
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl p-6 shadow-sm mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, bio, interests, or wellness focus..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            {/* Filter Dropdown */}
            <select
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              {filters.map((filter) => (
                <option key={filter.id} value={filter.id}>
                  {filter.label} ({filter.count})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap gap-3 mb-8">
          {filters.map((filter) => (
            <button
              key={filter.id}
              onClick={() => setSelectedFilter(filter.id)}
              className={`px-4 py-2 rounded-full font-medium transition-colors ${
                selectedFilter === filter.id
                  ? "bg-purple-600 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
              }`}
            >
              {filter.label}
              <span className="ml-2 text-sm opacity-75">({filter.count})</span>
            </button>
          ))}
        </div>

        {/* Users Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUsers.map((user) => (
            <div
              key={user.id}
              className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              {/* User Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-12 h-12 ${getAvatarColor(user.full_name)} rounded-full flex items-center justify-center text-white font-semibold`}
                  >
                    {user.full_name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {user.full_name}
                    </h3>
                    <p className="text-gray-500 text-sm">📍 {user.location}</p>
                  </div>
                </div>
                {user.mood_streak && user.mood_streak > 0 && (
                  <div className="text-center">
                    <div className="text-orange-500 font-bold text-lg">
                      {user.mood_streak}
                    </div>
                    <div className="text-xs text-gray-500">🔥 streak</div>
                  </div>
                )}
              </div>

              {/* Bio */}
              {user.bio && (
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {user.bio}
                </p>
              )}

              {/* Wellness Focus */}
              <div className="mb-4">
                <div className="text-xs text-gray-500 mb-2">
                  Wellness Focus:
                </div>
                <div className="flex flex-wrap gap-1">
                  {user.wellness_focus.map((focus) => (
                    <span
                      key={focus}
                      className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded"
                    >
                      {focus}
                    </span>
                  ))}
                </div>
              </div>

              {/* Interests */}
              <div className="mb-4">
                <div className="text-xs text-gray-500 mb-2">Interests:</div>
                <div className="flex flex-wrap gap-1">
                  {user.interests.slice(0, 3).map((interest) => (
                    <span
                      key={interest}
                      className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded"
                    >
                      {interest}
                    </span>
                  ))}
                  {user.interests.length > 3 && (
                    <span className="text-xs text-gray-500">
                      +{user.interests.length - 3} more
                    </span>
                  )}
                </div>
              </div>

              {/* Stats */}
              <div className="flex justify-between text-sm text-gray-500 mb-4">
                <span>👥 {user.followers_count} followers</span>
                <span>Following {user.following_count}</span>
                <span>{user.last_active}</span>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => router.push(`/profile/${user.id}`)}
                  className="flex-1 py-2 px-3 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 transition-colors"
                >
                  View Profile
                </button>
                <button
                  onClick={() => handleFollow(user.id)}
                  className={`flex-1 py-2 px-3 rounded-lg text-sm transition-colors ${
                    followingUsers.has(user.id) || user.is_following
                      ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
                      : "bg-purple-600 text-white hover:bg-purple-700"
                  }`}
                >
                  {followingUsers.has(user.id) || user.is_following
                    ? "Following"
                    : "Follow"}
                </button>
                <button
                  onClick={() => router.push(`/messages?user=${user.id}`)}
                  className="py-2 px-3 bg-blue-100 text-blue-700 rounded-lg text-sm hover:bg-blue-200 transition-colors"
                >
                  💬
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* No Results */}
        {filteredUsers.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No Users Found
            </h3>
            <p className="text-gray-600 mb-6">
              Try adjusting your search terms or filters to discover more
              community members.
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedFilter("all");
              }}
              className="btn-secondary px-6 py-2 rounded-lg"
            >
              Clear Filters
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
