"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Navbar from "../../components/Navbar";
import { Users, Search, Sparkles, Plus, Users2, TrendingUp, ArrowUp, ArrowRight, AlertCircle } from "lucide-react";

interface CommunityFeature {
  id: string;
  title: string;
  icon: string;
  description: string;
  status: "coming_soon" | "available" | "beta";
  features: string[];
}

interface MockUser {
  id: string;
  name: string;
  avatar: string;
  status: string;
  streak: number;
  common_goals: number;
  location?: string;
  interests: string[];
  mood_trend: "improving" | "stable" | "concerning";
  last_active: string;
}

interface Circle {
  id: string;
  name: string;
  description: string;
  member_count: number;
  category: string;
  privacy: "public" | "private";
  recent_activity: string;
}

const communityFeatures: CommunityFeature[] = [
  {
    id: "circles",
    title: "Wellness Circles",
    icon: "🌀",
    description: "Join topic-focused groups for deeper discussions and support",
    status: "available",
    features: [
      "Mindfulness groups",
      "Anxiety support",
      "Goal accountability",
      "Daily check-ins",
    ],
  },
  {
    id: "finder",
    title: "Companion Finder",
    icon: "🧭",
    description: "Smart matching with people who share your wellness journey",
    status: "beta",
    features: [
      "AI-powered matching",
      "Compatibility scoring",
      "Safe introductions",
      "Shared interests",
    ],
  },
  {
    id: "challenges",
    title: "Group Challenges",
    icon: "🏆",
    description:
      "Participate in community wellness challenges and competitions",
    status: "available",
    features: [
      "30-day challenges",
      "Team competitions",
      "Progress sharing",
      "Achievement rewards",
    ],
  },
  {
    id: "mentorship",
    title: "Peer Mentorship",
    icon: "🤝",
    description: "Connect with experienced wellness advocates as mentors",
    status: "coming_soon",
    features: [
      "1-on-1 guidance",
      "Experience sharing",
      "Goal setting",
      "Regular check-ins",
    ],
  },
];

const mockUsers: MockUser[] = [
  {
    id: "1",
    name: "Sarah M.",
    avatar: "🌸",
    status: "Focusing on mindfulness and daily meditation",
    streak: 12,
    common_goals: 3,
    location: "San Francisco, CA",
    interests: ["meditation", "mindfulness", "yoga"],
    mood_trend: "improving",
    last_active: "2 hours ago",
  },
  {
    id: "2",
    name: "Alex R.",
    avatar: "🌟",
    status: "Building consistent exercise and sleep habits",
    streak: 7,
    common_goals: 2,
    location: "Austin, TX",
    interests: ["fitness", "sleep", "nutrition"],
    mood_trend: "stable",
    last_active: "1 day ago",
  },
  {
    id: "3",
    name: "Jamie L.",
    avatar: "🍀",
    status: "Balancing work stress with wellness practices",
    streak: 15,
    common_goals: 4,
    location: "New York, NY",
    interests: ["stress management", "productivity", "mindfulness"],
    mood_trend: "improving",
    last_active: "30 minutes ago",
  },
  {
    id: "4",
    name: "Morgan K.",
    avatar: "🌙",
    status: "Creating evening routines for better sleep",
    streak: 9,
    common_goals: 2,
    location: "Seattle, WA",
    interests: ["sleep hygiene", "relaxation", "reading"],
    mood_trend: "stable",
    last_active: "3 hours ago",
  },
];

const mockCircles: Circle[] = [
  {
    id: "1",
    name: "Daily Mindfulness",
    description: "Share daily mindfulness practices and insights",
    member_count: 247,
    category: "Mindfulness",
    privacy: "public",
    recent_activity: "New meditation guide shared",
  },
  {
    id: "2",
    name: "Anxiety Support",
    description: "Safe space to discuss anxiety and coping strategies",
    member_count: 189,
    category: "Mental Health",
    privacy: "private",
    recent_activity: "Weekly check-in posted",
  },
  {
    id: "3",
    name: "Fitness Accountability",
    description: "Keep each other motivated with exercise goals",
    member_count: 156,
    category: "Physical Health",
    privacy: "public",
    recent_activity: "5 new workout logs",
  },
];

export default function CommunityPage() {
  const { data: session } = useSession();
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<
    "discover" | "circles" | "features"
  >("discover");
  const [joinedCircles, setJoinedCircles] = useState<Circle[]>([]);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const router = useRouter();

  const allInterests = [
    "meditation",
    "mindfulness",
    "fitness",
    "sleep",
    "nutrition",
    "stress-management",
    "productivity",
  ];

  useEffect(() => {
    if (session?.user) {
      setUser(session.user);
      // Simulate user's joined circles
      setJoinedCircles([mockCircles[0]]);
    }
  }, [session]);

  const filteredUsers =
    selectedInterests.length > 0
      ? mockUsers.filter((user) =>
          user.interests.some((interest) =>
            selectedInterests.includes(interest),
          ),
        )
      : mockUsers;

  const getMoodTrendColor = (trend: string) => {
    switch (trend) {
      case "improving":
        return "text-green-600";
      case "stable":
        return "text-blue-600";
      case "concerning":
        return "text-yellow-600";
      default:
        return "text-gray-600";
    }
  };

  const getMoodTrendIcon = (trend: string) => {
    switch (trend) {
      case "improving":
        return "📈";
      case "stable":
        return "➡️";
      case "concerning":
        return "⚠️";
      default:
        return "❓";
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-linear-to-br from-purple-50 via-pink-50 to-blue-50">
        <Navbar />
        <div className="flex justify-center items-center h-64">
          <div className="text-center bg-white rounded-xl p-8 shadow-sm">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🤝</span>
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              Join Our Community
            </h2>
            <p className="text-gray-600 mb-6">
              Connect with others on their wellness journey
            </p>
            <button
              onClick={() => router.push("/login")}
              className="btn-primary px-6 py-3 rounded-lg"
            >
              Sign In to Continue
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
          <div className="flex items-center justify-center gap-3 mb-4">
            <Users className="w-10 h-10 text-purple-600" />
            <h1 className="text-5xl font-bold text-purple-800">
              Community
            </h1>
          </div>
          <p className="text-xl text-gray-600 mb-6 max-w-3xl mx-auto">
            Connect, support, and grow together on your wellness journey
          </p>

          {/* Tab Navigation */}
          <div className="bg-white rounded-xl p-2 soft-glow inline-flex flex-wrap gap-2">
            {[
              {
                id: "discover",
                label: "🔍 Discover People",
                count: mockUsers.length,
              },
              {
                id: "circles",
                label: "🌀 My Circles",
                count: joinedCircles.length,
              },
              {
                id: "features",
                label: "🌟 Features",
                count: communityFeatures.length,
              },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors text-sm flex items-center gap-2 ${
                  activeTab === tab.id
                    ? "bg-purple-600 text-white"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <IconComponent className="w-4 h-4" />
                {tab.label}
                <span className="text-xs opacity-75">({tab.count})</span>
              </button>
              );
            })}
          </div>
        </div>

        {/* Discover Tab */}
        {activeTab === "discover" && (
          <div className="space-y-8">
            {/* Interest Filter */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                🎯 Filter by Interests
              </h3>
              <div className="flex flex-wrap gap-2">
                {allInterests.map((interest) => (
                  <button
                    key={interest}
                    onClick={() => {
                      setSelectedInterests((prev) =>
                        prev.includes(interest)
                          ? prev.filter((i) => i !== interest)
                          : [...prev, interest],
                      );
                    }}
                    className={`px-3 py-1 rounded-full text-sm transition-colors ${
                      selectedInterests.includes(interest)
                        ? "bg-purple-100 text-purple-700 border border-purple-300"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {interest}
                  </button>
                ))}
                {selectedInterests.length > 0 && (
                  <button
                    onClick={() => setSelectedInterests([])}
                    className="px-3 py-1 rounded-full text-sm bg-red-100 text-red-700 hover:bg-red-200"
                  >
                    Clear filters
                  </button>
                )}
              </div>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-sm">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                🧭 Find Your Wellness Companions
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredUsers.map((person) => (
                  <div
                    key={person.id}
                    className="bg-gray-50 rounded-lg p-6 hover:bg-gray-100 transition-colors cursor-pointer border border-gray-200"
                  >
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-12 h-12 bg-linear-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xl shrink-0">
                        {person.avatar}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 mb-1">
                          {person.name}
                        </h3>
                        <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                          {person.status}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                          <span>🔥 {person.streak} day streak</span>
                          <span
                            className={getMoodTrendColor(person.mood_trend)}
                          >
                            {getMoodTrendIcon(person.mood_trend)}{" "}
                            {person.mood_trend}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500">
                          📍 {person.location} • Active {person.last_active}
                        </div>
                      </div>
                    </div>

                    <div className="mb-4">
                      <div className="text-xs text-gray-500 mb-2">
                        Common interests:
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {person.interests.slice(0, 3).map((interest) => (
                          <span
                            key={interest}
                            className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded"
                          >
                            {interest}
                          </span>
                        ))}
                        {person.interests.length > 3 && (
                          <span className="text-xs text-gray-500">
                            +{person.interests.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button className="btn-primary text-sm px-3 py-1 flex-1 rounded-lg">
                        Connect
                      </button>
                      <button className="btn-secondary text-sm px-3 py-1 rounded-lg">
                        View Profile
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {filteredUsers.length === 0 && (
                <div className="text-center py-8">
                  <div className="text-4xl mb-4">🔍</div>
                  <p className="text-gray-600">
                    No users found with those interests. Try different filters!
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Circles Tab */}
        {activeTab === "circles" && (
          <div className="space-y-8">
            <div className="bg-white rounded-xl p-8 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  🌀 Your Circles
                </h2>
                <button className="btn-primary px-4 py-2 rounded-lg">
                  Create Circle
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {joinedCircles.map((circle) => (
                  <div
                    key={circle.id}
                    className="border rounded-lg p-6 hover:bg-gray-50 cursor-pointer"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-semibold text-gray-900">
                        {circle.name}
                      </h3>
                      <span
                        className={`px-2 py-1 text-xs rounded ${
                          circle.privacy === "private"
                            ? "bg-red-100 text-red-700"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        {circle.privacy}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm mb-3">
                      {circle.description}
                    </p>
                    <div className="text-xs text-gray-500 mb-3">
                      👥 {circle.member_count} members • {circle.category}
                    </div>
                    <div className="text-xs text-blue-600">
                      📢 {circle.recent_activity}
                    </div>
                  </div>
                ))}
              </div>

              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                🔍 Discover More Circles
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {mockCircles
                  .filter(
                    (circle) => !joinedCircles.find((j) => j.id === circle.id),
                  )
                  .map((circle) => (
                    <div
                      key={circle.id}
                      className="border rounded-lg p-6 hover:bg-gray-50"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="font-semibold text-gray-900">
                          {circle.name}
                        </h3>
                        <span
                          className={`px-2 py-1 text-xs rounded ${
                            circle.privacy === "private"
                              ? "bg-red-100 text-red-700"
                              : "bg-green-100 text-green-700"
                          }`}
                        >
                          {circle.privacy}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm mb-3">
                        {circle.description}
                      </p>
                      <div className="text-xs text-gray-500 mb-4">
                        👥 {circle.member_count} members • {circle.category}
                      </div>
                      <button className="w-full btn-secondary py-2 rounded-lg text-sm">
                        Join Circle
                      </button>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

        {/* Features Tab */}
        {activeTab === "features" && (
          <div className="space-y-8">
            <div className="bg-white rounded-xl p-8 shadow-sm">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                🌟 Community Features
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {communityFeatures.map((feature) => (
                  <div
                    key={feature.id}
                    className="border rounded-lg p-6 hover:border-purple-300 transition-colors"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-3xl">{feature.icon}</span>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {feature.title}
                        </h3>
                        <span
                          className={`px-2 py-1 text-xs rounded ${
                            feature.status === "available"
                              ? "bg-green-100 text-green-700"
                              : feature.status === "beta"
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {feature.status === "available"
                            ? "Available"
                            : feature.status === "beta"
                              ? "Beta"
                              : "Coming Soon"}
                        </span>
                      </div>
                    </div>

                    <p className="text-gray-600 text-sm mb-4">
                      {feature.description}
                    </p>

                    <ul className="text-xs text-gray-500 space-y-1 mb-4">
                      {feature.features.map((item, idx) => (
                        <li key={idx}>• {item}</li>
                      ))}
                    </ul>

                    <button
                      className={`w-full py-2 rounded-lg text-sm font-medium ${
                        feature.status === "available"
                          ? "btn-primary"
                          : feature.status === "beta"
                            ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                            : "bg-gray-100 text-gray-500 cursor-not-allowed"
                      }`}
                      disabled={feature.status === "coming_soon"}
                    >
                      {feature.status === "available"
                        ? "Try Now"
                        : feature.status === "beta"
                          ? "Join Beta"
                          : "Coming Soon"}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Community Guidelines Notice */}
        <div className="mt-8 bg-linear-to-r from-blue-50 to-purple-50 rounded-xl p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            🤝 Community Guidelines
          </h2>
          <p className="text-gray-700 mb-4 max-w-2xl mx-auto">
            Our community thrives on respect, support, and positive
            interactions. Please review our guidelines to help maintain a safe
            and welcoming space for everyone.
          </p>
          <button
            onClick={() => router.push("/community-guidelines")}
            className="btn-primary px-6 py-3 rounded-lg"
          >
            Read Guidelines
          </button>
        </div>
      </main>
    </div>
  );
}
