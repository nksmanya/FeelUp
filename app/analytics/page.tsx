"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Navbar from "../../components/Navbar";
import { BarChart3, Flame, CheckCircle2, BookOpen, TrendingUp, Zap, Target } from "lucide-react";

// Mock data generator for demo
const generateMockMoodData = () => {
  const moods = [
    "Happy",
    "Calm",
    "Excited",
    "Grateful",
    "Thoughtful",
    "Sad",
    "Anxious",
    "Tired",
  ];
  const last30Days = [];
  for (let i = 29; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    last30Days.push({
      date: date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      mood: moods[Math.floor(Math.random() * moods.length)],
      energy: Math.floor(Math.random() * 5) + 1,
      goals_completed: Math.floor(Math.random() * 4),
    });
  }
  return last30Days;
};

const moodColors: { [key: string]: string } = {
  Happy: "#fbbf24",
  Calm: "#60a5fa",
  Excited: "#f472b6",
  Grateful: "#34d399",
  Thoughtful: "#a78bfa",
  Sad: "#94a3b8",
  Anxious: "#fb7185",
  Tired: "#6b7280",
};

export default function AnalyticsPage() {
  const { data: session } = useSession();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [timeframe, setTimeframe] = useState<"week" | "month" | "quarter">(
    "month",
  );
  const [moodData, setMoodData] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalGoals: 0,
    completedGoals: 0,
    currentStreak: 0,
    journalEntries: 0,
    avgMoodScore: 0,
    avgEnergyLevel: 0,
  });
  const router = useRouter();

  // Ensure component is mounted before generating random data
  useEffect(() => {
    setMounted(true);
  }, []);

  const loadAnalytics = useCallback(async () => {
    if (!user?.email || !mounted) return;

    // For now, use mock data until backend analytics are implemented
    const mockData = generateMockMoodData();
    setMoodData(mockData);

    // Calculate mock stats
    const totalMoods = mockData.length;
    const positiveModds = mockData.filter((d) =>
      ["Happy", "Calm", "Excited", "Grateful"].includes(d.mood),
    ).length;
    const avgEnergy =
      mockData.reduce((sum, d) => sum + d.energy, 0) / totalMoods;
    const totalGoalsCompleted = mockData.reduce(
      (sum, d) => sum + d.goals_completed,
      0,
    );

    setStats({
      totalGoals: totalGoalsCompleted + Math.floor(Math.random() * 20),
      completedGoals: totalGoalsCompleted,
      currentStreak: 7 + Math.floor(Math.random() * 15),
      journalEntries: 15 + Math.floor(Math.random() * 30),
      avgMoodScore: Math.round((positiveModds / totalMoods) * 100),
      avgEnergyLevel: Math.round(avgEnergy * 10) / 10,
    });
  }, [user?.email, mounted]);

  useEffect(() => {
    if (session?.user) {
      setUser(session.user);
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => {
    if (user) {
      loadAnalytics();
    }
  }, [user, loadAnalytics, timeframe]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <p className="text-gray-600 mb-4">
              Please sign in to view your analytics
            </p>
            <button
              onClick={() => router.push("/login")}
              className="btn-primary"
            >
              Sign In
            </button>
          </div>
        </div>
      </div>
    );
  }

  const moodCounts = moodData.reduce(
    (acc, day) => {
      acc[day.mood] = (acc[day.mood] || 0) + 1;
      return acc;
    },
    {} as { [key: string]: number },
  );

  const topMood = Object.entries(moodCounts).sort(
    ([, a], [, b]) => (b as number) - (a as number),
  )[0];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <BarChart3 className="w-8 h-8 text-[var(--brand-blue)]" />
              <h1 className="text-4xl font-bold text-gray-900">
                Your Analytics
              </h1>
            </div>
            <p className="text-gray-600">
              Discover insights about your mood patterns and wellness journey
            </p>
          </div>

          <div className="bg-white rounded-xl p-2 soft-glow">
            <div className="flex gap-2">
              {(["week", "month", "quarter"] as const).map((period) => (
                <button
                  key={period}
                  onClick={() => setTimeframe(period)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors capitalize ${
                    timeframe === period
                      ? "bg-blue-600 text-white"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {period}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <div className="bg-white rounded-xl p-6 soft-glow text-center">
            <div className="text-2xl font-bold text-blue-600 mb-1">
              {stats.currentStreak}
            </div>
            <div className="text-sm text-gray-600">Current Streak</div>
          </div>

          <div className="bg-white rounded-xl p-6 soft-glow text-center">
            <div className="text-2xl font-bold text-green-600 mb-1">
              {stats.completedGoals}
            </div>
            <div className="text-sm text-gray-600">Goals Completed</div>
          </div>

          <div className="bg-white rounded-xl p-6 soft-glow text-center">
            <div className="text-2xl font-bold text-purple-600 mb-1">
              {stats.journalEntries}
            </div>
            <div className="text-sm text-gray-600">Journal Entries</div>
          </div>

          <div className="bg-white rounded-xl p-6 soft-glow text-center">
            <div className="text-2xl font-bold text-yellow-600 mb-1">
              {stats.avgMoodScore}%
            </div>
            <div className="text-sm text-gray-600">Positive Days</div>
          </div>

          <div className="bg-white rounded-xl p-6 soft-glow text-center">
            <div className="text-2xl font-bold text-orange-600 mb-1">
              {stats.avgEnergyLevel}/5
            </div>
            <div className="text-sm text-gray-600">Avg Energy</div>
          </div>

          <div className="bg-white rounded-xl p-6 soft-glow text-center">
            <div className="text-xl font-bold text-pink-600 mb-1">
              {topMood?.[0] || "N/A"}
            </div>
            <div className="text-sm text-gray-600">Top Mood</div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Mood Timeline */}
          <div className="bg-white rounded-xl p-8 soft-glow">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              📈 Mood Timeline
            </h2>
            <div className="space-y-3">
              {moodData.slice(-10).map((day, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <div className="text-sm text-gray-500 w-16">{day.date}</div>
                  <div className="flex-1 bg-gray-100 rounded-full h-3 relative overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        backgroundColor: moodColors[day.mood] || "#6b7280",
                        width: `${(day.energy / 5) * 100}%`,
                      }}
                    ></div>
                  </div>
                  <div className="text-sm font-medium text-gray-700 w-20">
                    {day.mood}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Mood Distribution */}
          <div className="bg-white rounded-xl p-8 soft-glow">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <BarChart3 className="w-6 h-6" />
              Mood Distribution
            </h2>
            <div className="space-y-3">
              {Object.entries(moodCounts)
                .sort(([, a], [, b]) => (b as number) - (a as number))
                .map(([mood, count]) => (
                  <div key={mood} className="flex items-center gap-3">
                    <div className="text-sm font-medium text-gray-700 w-20">
                      {mood}
                    </div>
                    <div className="flex-1 bg-gray-100 rounded-full h-3 relative overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{
                          backgroundColor: moodColors[mood] || "#6b7280",
                          width: `${((count as number) / moodData.length) * 100}%`,
                        }}
                      ></div>
                    </div>
                    <div className="text-sm text-gray-500 w-12">
                      {count as number} days
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* Insights & Recommendations */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Weekly Insights */}
          <div className="bg-white rounded-xl p-8 soft-glow">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              💡 Weekly Insights
            </h2>
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-semibold text-green-800 mb-2">
                  🎉 Great Progress!
                </h3>
                <p className="text-green-700 text-sm">
                  You've maintained a {stats.currentStreak}-day streak and
                  completed {stats.completedGoals} goals this period.
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-800 mb-2">
                  📊 Pattern Notice
                </h3>
                <p className="text-blue-700 text-sm">
                  Your most frequent mood is {topMood?.[0]} with{" "}
                  {stats.avgEnergyLevel}/5 average energy.
                </p>
              </div>

              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h3 className="font-semibold text-purple-800 mb-2">
                  ✨ Wellness Score
                </h3>
                <p className="text-purple-700 text-sm">
                  {stats.avgMoodScore}% of your days have been positive. Keep up
                  the great work!
                </p>
              </div>
            </div>
          </div>

          {/* Recommendations */}
          <div className="bg-white rounded-xl p-8 soft-glow">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Zap className="w-6 h-6" />
              Recommendations
            </h2>
            <div className="space-y-4">
              <div className="flex gap-3">
                <span className="text-2xl">🌅</span>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    Morning Routine
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Consider setting a consistent morning routine to boost
                    energy levels.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <span className="text-2xl">📝</span>
                <div>
                  <h3 className="font-semibold text-gray-900">Journal More</h3>
                  <p className="text-gray-600 text-sm">
                    Try writing in your journal daily to improve mood awareness.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <span className="text-2xl">🤝</span>
                <div>
                  <h3 className="font-semibold text-gray-900">Connect</h3>
                  <p className="text-gray-600 text-sm">
                    Engage with the community for additional support and
                    motivation.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <span className="text-2xl">🎯</span>
                <div>
                  <h3 className="font-semibold text-gray-900">Goal Variety</h3>
                  <p className="text-gray-600 text-sm">
                    Mix different types of goals to maintain engagement and
                    growth.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Development Notice */}
        <div className="mt-8 bg-linear-to-r from-blue-50 to-purple-50 rounded-xl p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center justify-center gap-2">
            <BarChart3 className="w-6 h-6" />
            Enhanced Analytics Coming Soon
          </h2>
          <p className="text-gray-700 mb-4 max-w-2xl mx-auto">
            We're developing advanced analytics including trend predictions,
            goal success patterns, and personalized insights based on your
            unique wellness journey.
          </p>
          <p className="text-sm text-gray-600">
            Current data shown is representative. Full analytics integration is
            in progress.
          </p>
        </div>
      </main>
    </div>
  );
}
