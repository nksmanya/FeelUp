"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Navbar from "../../components/Navbar";
import { appCache, CACHE_KEYS } from "../../lib/cache";

export default function ProfilePage() {
  const { data: session } = useSession();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [streaks, setStreaks] = useState<any[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ full_name: "", bio: "" });
  const router = useRouter();

  const loadProfile = useCallback(async () => {
    if (!user?.email) return;

    try {
      const res = await fetch(
        `/api/profile?email=${encodeURIComponent(user.email)}`,
      );
      const data = await res.json();
      if (res.ok) {
        setProfile(data.profile);
        setEditForm({
          full_name: data.profile?.full_name || "",
          bio: data.profile?.bio || "",
        });
      }
    } catch (e) {
      console.error("Failed to load profile:", e);
    }
  }, [user?.email]);

  const loadAchievements = useCallback(async () => {
    if (!user?.email) return;

    try {
      const res = await fetch(
        `/api/achievements?user_email=${encodeURIComponent(user.email)}`,
      );
      const data = await res.json();
      if (res.ok) {
        setAchievements(data.achievements || []);
      }
    } catch (e) {
      console.error("Failed to load achievements:", e);
    }
  }, [user?.email]);

  const loadStreaks = useCallback(async () => {
    if (!user?.email) return;

    try {
      const res = await fetch(
        `/api/streaks?user_email=${encodeURIComponent(user.email)}`,
      );
      const data = await res.json();
      if (res.ok) {
        setStreaks(data.streaks || []);
      }
    } catch (e) {
      console.error("Failed to load streaks:", e);
    }
  }, [user?.email]);

  const updateProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: user.email,
          ...editForm,
        }),
      });

      if (res.ok) {
        setIsEditing(false);
        await loadProfile();
      } else {
        const error = await res.json();
        alert(error.error || "Failed to update profile");
      }
    } catch (e) {
      alert("Failed to update profile");
    }
  };

  useEffect(() => {
    if (session?.user?.email) {
      setUser(session.user);
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => {
    if (user?.email) {
      loadProfile();
      loadAchievements();
      loadStreaks();
    }
  }, [user, loadProfile, loadAchievements, loadStreaks]);

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
    router.push("/");
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Profile Header */}
        <div className="bg-white rounded-xl p-8 soft-glow mb-8">
          <div className="flex items-start gap-6">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white text-3xl font-bold">
                {(profile?.full_name ||
                  user.name ||
                  user.email ||
                  "U")[0].toUpperCase()}
              </span>
            </div>

            <div className="flex-1">
              {!isEditing ? (
                <>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {profile?.full_name || user.name || "FeelUp User"}
                  </h1>
                  <p className="text-gray-600 mb-4">{user.email}</p>
                  {profile?.bio && (
                    <p className="text-gray-700 mb-4">{profile.bio}</p>
                  )}
                  <button
                    onClick={() => setIsEditing(true)}
                    className="btn-secondary"
                  >
                    ✏️ Edit Profile
                  </button>
                </>
              ) : (
                <form onSubmit={updateProfile} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={editForm.full_name}
                      onChange={(e) =>
                        setEditForm((prev) => ({
                          ...prev,
                          full_name: e.target.value,
                        }))
                      }
                      className="input-field"
                      placeholder="Your full name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Bio
                    </label>
                    <textarea
                      value={editForm.bio}
                      onChange={(e) =>
                        setEditForm((prev) => ({
                          ...prev,
                          bio: e.target.value,
                        }))
                      }
                      className="input-field h-24 resize-none"
                      placeholder="Tell us about yourself..."
                      maxLength={200}
                    />
                  </div>
                  <div className="flex gap-2">
                    <button type="submit" className="btn-primary">
                      Save Changes
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="btn-secondary"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 soft-glow text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {streaks.find((s) => s.streak_type === "overall")
                ?.current_count || 0}
            </div>
            <div className="text-gray-600">Current Streak</div>
          </div>

          <div className="bg-white rounded-xl p-6 soft-glow text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {achievements.length}
            </div>
            <div className="text-gray-600">Achievements</div>
          </div>

          <div className="bg-white rounded-xl p-6 soft-glow text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">
              {profile?.total_goals_completed || 0}
            </div>
            <div className="text-gray-600">Goals Completed</div>
          </div>
        </div>

        {/* Achievements */}
        <div className="bg-white rounded-xl p-8 soft-glow mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            🏆 Achievements
          </h2>

          {achievements.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">🌟</div>
              <p className="text-gray-600">
                Start completing goals to unlock achievements!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {achievements.map((achievement) => (
                <div
                  key={achievement.id}
                  className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-4 border border-yellow-200"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{achievement.badge_emoji}</span>
                    <div>
                      <div className="font-semibold text-gray-900">
                        {achievement.badge_name}
                      </div>
                      <div className="text-sm text-gray-600">
                        {achievement.description}
                      </div>
                      <div className="text-xs text-yellow-700 mt-1">
                        +{achievement.points} points
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Streaks */}
        <div className="bg-white rounded-xl p-8 soft-glow">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            🔥 Your Streaks
          </h2>

          {streaks.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">🎯</div>
              <p className="text-gray-600">
                Complete daily goals to start building streaks!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {streaks.map((streak) => (
                <div
                  key={streak.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div>
                    <div className="font-semibold text-gray-900 capitalize">
                      {streak.streak_type.replace("_", " ")} Streak
                    </div>
                    <div className="text-sm text-gray-600">
                      Best: {streak.best_count} days
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-orange-600">
                      {streak.current_count} 🔥
                    </div>
                    <div className="text-sm text-gray-600">Current</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
