"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Navbar from "../../../components/Navbar";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  bio: string;
  location: string;
  wellness_focus: string[];
  mood_streak: number;
  journal_entries: number;
  followers_count: number;
  following_count: number;
  achievements: string[];
  is_active: boolean;
  joined_date: string;
  recent_activity: string;
}

export default function ProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [followLoading, setFollowLoading] = useState(false);
  const [userPosts, setUserPosts] = useState<any[]>([]);

  const userId = params?.id as string;

  useEffect(() => {
    if (userId) {
      loadProfile();
      checkFollowStatus();
    }
  }, [userId, session]);

  useEffect(() => {
    if (profile?.email) {
      loadUserPosts();
    }
  }, [profile]);

  const loadProfile = async () => {
    try {
      const response = await fetch(`/api/users?id=${userId}`);
      if (response.ok) {
        const data = await response.json();
        setProfile(data);
      }
    } catch (error) {
      console.error("Failed to load profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const checkFollowStatus = async () => {
    if (!session?.user?.email) return;

    try {
      const response = await fetch(
        `/api/follow?user=${session.user.email}&type=following`,
      );
      if (response.ok) {
        const following = await response.json();
        const isUserFollowed = following.some(
          (follow: any) => follow.following_email === profile?.email,
        );
        setIsFollowing(isUserFollowed);
      }
    } catch (error) {
      console.error("Failed to check follow status:", error);
    }
  };

  const handleFollow = async () => {
    if (!session?.user?.email || !profile?.email) return;

    setFollowLoading(true);
    try {
      const response = await fetch("/api/follow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          follower_email: session.user.email,
          following_email: profile.email,
          action: isFollowing ? "unfollow" : "follow",
        }),
      });

      if (response.ok) {
        setIsFollowing(!isFollowing);
        // Update follower count
        setProfile((prev) =>
          prev
            ? {
                ...prev,
                followers_count: prev.followers_count + (isFollowing ? -1 : 1),
              }
            : null,
        );
      }
    } catch (error) {
      console.error("Failed to follow/unfollow:", error);
    } finally {
      setFollowLoading(false);
    }
  };

  const handleMessage = () => {
    if (profile) {
      router.push(`/messages?user=${profile.id}`);
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

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
    });
  };

  const timeAgo = (date?: string) => {
    if (!date) return "";
    const then = new Date(date).getTime();
    const now = Date.now();
    const sec = Math.floor((now - then) / 1000);
    if (sec < 60) return "just now";
    const min = Math.floor(sec / 60);
    if (min < 60) return `${min}m ago`;
    const hr = Math.floor(min / 60);
    if (hr < 24) return `${hr}h ago`;
    const days = Math.floor(hr / 24);
    if (days < 7) return `${days}d ago`;
    const weeks = Math.floor(days / 7);
    if (weeks < 5) return `${weeks}w ago`;
    const months = Math.floor(days / 30);
    if (months < 12) return `${months}mo ago`;
    const years = Math.floor(days / 365);
    return `${years}y ago`;
  };

  const getAchievementEmoji = (achievement: string) => {
    const emojiMap: { [key: string]: string } = {
      "7-Day Streak": "🔥",
      "30-Day Streak": "⭐",
      "Weekly Warrior": "⚡",
      "Mindful Master": "🧘‍♂️",
      "Community Helper": "🤝",
      "Self-Care Champion": "💆‍♀️",
      "Creative Master": "🎨",
      "Journal Guru": "📖",
      "Community Star": "🌟",
      "Fitness Warrior": "💪",
      "Motivation Master": "🚀",
      "Nature Lover": "🌿",
      "Mindful Explorer": "🗺️",
      "Balance Seeker": "⚖️",
      "Digital Detox": "📵",
    };
    return emojiMap[achievement] || "🏆";
  };

  const loadUserPosts = async () => {
    if (!profile?.email) return;
    try {
      const res = await fetch(`/api/mood-posts?owner_email=${encodeURIComponent(profile.email)}&visibility=public&limit=20`);
      if (res.ok) {
        const data = await res.json();
        setUserPosts(data.posts || []);
      }
    } catch (e) {
      console.error("Failed to load user posts", e);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
        <Navbar />
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
        <Navbar />
        <div className="flex justify-center items-center h-64">
          <div className="text-center bg-white rounded-xl p-8 shadow-sm">
            <div className="text-6xl mb-4">😞</div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              Profile Not Found
            </h2>
            <p className="text-gray-600 mb-6">
              This user profile doesn't exist or has been removed.
            </p>
            <button
              onClick={() => router.push("/explore")}
              className="btn-primary px-6 py-3 rounded-lg"
            >
              Explore Other Users
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isOwnProfile = session?.user?.email === profile.email;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Profile Header */}
        <div className="bg-white rounded-xl shadow-sm p-8 mb-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-shrink-0">
              <div
                className={`w-24 h-24 ${getAvatarColor(profile.name)} rounded-full flex items-center justify-center text-white text-3xl font-bold`}
              >
                {profile.name.charAt(0)}
              </div>
            </div>

            <div className="flex-1">
              <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {profile.name}
                  </h1>
                  <p className="text-gray-600 flex items-center gap-2 mt-1">
                    📍 {profile.location}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Member since {formatDate(profile.joined_date)}
                  </p>
                </div>

                {!isOwnProfile && session && (
                  <div className="flex gap-3">
                    <button
                      onClick={handleFollow}
                      disabled={followLoading}
                      className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                        isFollowing
                          ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
                          : "bg-purple-600 text-white hover:bg-purple-700"
                      } disabled:opacity-50`}
                    >
                      {followLoading
                        ? "..."
                        : isFollowing
                          ? "Following"
                          : "Follow"}
                    </button>
                    <button
                      onClick={handleMessage}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Message
                    </button>
                  </div>
                )}
              </div>

              <p className="text-gray-700 mt-4 leading-relaxed">
                {profile.bio}
              </p>

              {/* Wellness Focus Tags */}
              <div className="flex flex-wrap gap-2 mt-4">
                {profile.wellness_focus.map((focus, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm"
                  >
                    {focus}
                  </span>
                ))}
              </div>

              {/* Activity Status */}
              <div className="flex items-center gap-2 mt-4">
                <div
                  className={`w-3 h-3 rounded-full ${profile.is_active ? "bg-green-500" : "bg-gray-400"}`}
                ></div>
                <span className="text-sm text-gray-600">
                  {profile.is_active ? "Recently active" : "Offline"} •{" "}
                  {profile.recent_activity}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Stats */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Wellness Journey
              </h2>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">
                    {profile.mood_streak}
                  </div>
                  <div className="text-sm text-gray-600">Day Streak</div>
                  <div className="text-lg mt-1">🔥</div>
                </div>

                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {profile.journal_entries}
                  </div>
                  <div className="text-sm text-gray-600">Journal Entries</div>
                  <div className="text-lg mt-1">📝</div>
                </div>

                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {profile.followers_count}
                  </div>
                  <div className="text-sm text-gray-600">Followers</div>
                  <div className="text-lg mt-1">👥</div>
                </div>

                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {profile.following_count}
                  </div>
                  <div className="text-sm text-gray-600">Following</div>
                  <div className="text-lg mt-1">🌟</div>
                </div>
              </div>
            </div>
              {/* Recent Activity (Placeholder) */}
              <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Recent Activity
                </h2>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="text-2xl">📝</div>
                    <div>
                      <div className="font-medium text-gray-900">
                        Shared a journal entry
                      </div>
                      <div className="text-sm text-gray-600">2 hours ago</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="text-2xl">🎯</div>
                    <div>
                      <div className="font-medium text-gray-900">
                        Completed daily mood check-in
                      </div>
                      <div className="text-sm text-gray-600">1 day ago</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="text-2xl">🏆</div>
                    <div>
                      <div className="font-medium text-gray-900">
                        Earned new achievement
                      </div>
                      <div className="text-sm text-gray-600">3 days ago</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Public Posts by this user */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Public Posts</h2>
                {userPosts.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">No public posts yet.</div>
                ) : (
                  <div className="space-y-4">
                    {userPosts.map((p) => (
                      <div key={p.id} className="p-3 bg-gray-50 rounded-lg">
                        <div className="text-sm text-gray-600 mb-1">{timeAgo(p.created_at)}</div>
                        <div className="text-gray-800 mb-2">{p.content}</div>
                        {p.image_url && (
                          <img src={p.image_url} alt="post" className="w-full rounded" />
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
          </div>

          {/* Achievements */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Achievements
            </h2>
            <div className="space-y-3">
              {profile.achievements.map((achievement, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200"
                >
                  <div className="text-2xl">
                    {getAchievementEmoji(achievement)}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">
                      {achievement}
                    </div>
                    <div className="text-sm text-gray-600">
                      Wellness milestone
                    </div>
                  </div>
                </div>
              ))}

              {profile.achievements.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-4xl mb-2">🎯</div>
                  <p>No achievements yet</p>
                  <p className="text-sm">
                    Keep working on your wellness journey!
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="mt-8 flex justify-center">
          <button
            onClick={() => router.push("/mood-feed")}
            className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            ← Back to Community
          </button>
        </div>
      </div>
    </div>
  );
}
