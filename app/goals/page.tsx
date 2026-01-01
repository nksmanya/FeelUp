"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { createBrowserSupabaseClient } from "../../lib/supabaseClient";
import { useRouter } from "next/navigation";
import Navbar from "../../components/Navbar";
import StreakDisplay from "../../components/StreakDisplay";
import { useSession, signOut as nextAuthSignOut } from "next-auth/react";

// Goal categories with emojis
const goalCategories = [
  { value: 'study', label: '📚 Study', color: '#3b82f6' },
  { value: 'exercise', label: '💪 Exercise', color: '#ef4444' },
  { value: 'wellness', label: '🧘 Wellness', color: '#10b981' },
  { value: 'social', label: '👥 Social', color: '#f59e0b' },
  { value: 'creative', label: '🎨 Creative', color: '#8b5cf6' },
  { value: 'personal', label: '✨ Personal', color: '#06b6d4' },
];

// Mood options for goal completion
const completionMoods = [
  { value: 'accomplished', emoji: '🎉', label: 'Accomplished' },
  { value: 'proud', emoji: '😊', label: 'Proud' },
  { value: 'relieved', emoji: '😌', label: 'Relieved' },
  { value: 'energized', emoji: '⚡', label: 'Energized' },
  { value: 'calm', emoji: '🕊️', label: 'Calm' },
  { value: 'grateful', emoji: '🙏', label: 'Grateful' },
];

export default function GoalsPage() {
  const { data: nextSession } = useSession();
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [goals, setGoals] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [completingGoal, setCompletingGoal] = useState<any>(null);
  const router = useRouter();

  // Initialize supabase client on client-side only
  const supabase = useMemo(() => {
    if (typeof window !== 'undefined') {
      return createBrowserSupabaseClient();
    }
    return null;
  }, []);

  // Set date after component mounts to prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
    setSelectedDate(new Date().toISOString().split('T')[0]);
  }, []);

  const loadGoals = useCallback(async (date: string = selectedDate) => {
    if (!user?.email) return;
    
    try {
      const res = await fetch(`/api/goals?user_email=${encodeURIComponent(user.email)}&date=${date}`);
      const data = await res.json();
      if (res.ok) {
        setGoals(data.goals || []);
      }
    } catch (e) {
      console.error('Failed to load goals:', e);
    }
  }, [user?.email, selectedDate]);

  const addGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const fd = new FormData(form);
    
    const goalData = {
      user_email: user.email,
      title: fd.get('title') as string,
      description: fd.get('description') as string,
      category: fd.get('category') as string,
      target_date: selectedDate
    };

    try {
      const res = await fetch('/api/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(goalData)
      });

      if (res.ok) {
        form.reset();
        setShowAddGoal(false);
        await loadGoals();
      } else {
        const error = await res.json();
        alert(error.error || 'Failed to add goal');
      }
    } catch (e) {
      alert('Failed to add goal');
    }
  };

  const completeGoal = async (goal: any, mood: string, reflection: string) => {
    try {
      const res = await fetch('/api/goals', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          goal_id: goal.id,
          user_email: user.email,
          completed: true,
          mood_at_completion: mood,
          reflection_note: reflection
        })
      });

      if (res.ok) {
        setCompletingGoal(null);
        await loadGoals();
        
        // Update streak for goal completion
        try {
          await fetch('/api/streaks', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              user_email: user.email,
              streak_type: 'goals'
            })
          });
        } catch (e) {
          console.log('Failed to update streak');
        }

        // Check for achievements
        try {
          const completedCount = goals.filter(g => g.completed_at).length + 1;
          const today = new Date().toDateString();
          const completedToday = goals.filter(g => {
            if (!g.completed_at) return false;
            const completedDate = new Date(g.completed_at).toDateString();
            return completedDate === today;
          }).length + 1;

          await fetch('/api/achievements', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              user_email: user.email,
              badge_type: 'goals',
              trigger_data: {
                totalCompleted: completedCount,
                completedToday: completedToday
              }
            })
          });
        } catch (e) {
          console.log('Failed to check achievements');
        }
      } else {
        const error = await res.json();
        alert(error.error || 'Failed to complete goal');
      }
    } catch (e) {
      alert('Failed to complete goal');
    }
  };

  useEffect(() => {
    let mounted = true;

    const checkAuth = async () => {
      // Only set loading if we don't already have a user
      if (!user) {
        setLoading(true);
      }

      if (nextSession?.user?.email) {
        const u = nextSession.user as any;
        setUser({ email: u.email, user_metadata: { full_name: u.name } });
        setLoading(false);
        return;
      }

      if (!supabase) return;
      const { data } = await supabase.auth.getSession();
      const session = data.session;
      if (!session) {
        router.push('/');
        return;
      }
      if (mounted) setUser(session.user);
      setLoading(false);
    };

    // Only check auth if we don't have a user
    if (!user) {
      checkAuth();
    }
  }, [nextSession, router, user]);

  useEffect(() => {
    if (user?.email && goals.length === 0) {
      loadGoals();
    }
  }, [user, loadGoals, goals.length]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-2 border-purple-600 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your goals...</p>
          </div>
        </div>
      </div>
    );
  }

  const completedGoals = goals.filter(g => g.completed_at);
  const pendingGoals = goals.filter(g => !g.completed_at);
  const completionRate = goals.length > 0 ? Math.round((completedGoals.length / goals.length) * 100) : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">🎯 Daily Goals</h1>
          <p className="text-gray-600">Set and track your daily micro-goals for consistent progress.</p>
        </div>

        {/* Top stats cards */}
        <div className="mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl p-6 shadow-sm flex flex-col items-center text-center">
              <div className="text-3xl">🔥</div>
              <div className="mt-2">
                <StreakDisplay userEmail={user?.email || ''} streakType="goals" size="small" />
              </div>
              <div className="text-xs text-gray-500 mt-1">Day Streak</div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm flex flex-col items-center text-center">
              <div className="text-3xl">✅</div>
              <div className="text-3xl font-bold mt-2">{completedGoals.length}/{goals.length || 1}</div>
              <div className="text-xs text-gray-500 mt-1">Today's Progress</div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm flex flex-col items-center text-center">
              <div className="text-3xl">🏆</div>
              <div className="text-3xl font-bold mt-2">{completionRate}%</div>
              <div className="text-xs text-gray-500 mt-1">Completion Rate</div>
            </div>
          </div>

          <div className="mt-6 bg-white rounded-full h-3 overflow-hidden">
            <div className="h-full bg-emerald-400" style={{ width: `${completionRate}%` }} />
          </div>
        </div>

        {/* heading area (kept above) */}

        {/* Date Selector */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Select Date:</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="input-field w-48"
          />
        </div>

        {/* Add Goal Section */}
        <div className="mb-8">
          {!showAddGoal ? (
            <div className="flex justify-center">
              <button
                onClick={() => setShowAddGoal(true)}
                className="px-6 py-3 rounded-full bg-white border border-gray-200 shadow-sm text-gray-700 hover:bg-gray-50"
              >
                + Add Custom Goal
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-6 soft-glow">
              <form onSubmit={addGoal} className="grid gap-4">
                <input
                  type="text"
                  name="title"
                  placeholder="Goal title (e.g., 'Read 20 pages', 'Walk 30 minutes')"
                  className="input-field"
                  required
                  maxLength={100}
                />
                <textarea
                  name="description"
                  placeholder="Optional details or notes about this goal..."
                  className="input-field h-20 resize-none"
                  maxLength={300}
                />
                <select name="category" className="input-field w-48" required>
                  <option value="">Select Category</option>
                  {goalCategories.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
                <div className="flex gap-2">
                  <button type="submit" className="btn-primary rounded-xl px-4 py-2">
                    Add Goal
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddGoal(false)}
                    className="btn-secondary rounded-xl px-4 py-2"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Goals List */}
        <div className="grid gap-6">
          {/* Pending Goals */}
          {pendingGoals.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold mb-4 text-orange-600">
                📋 Pending Goals ({pendingGoals.length})
              </h2>
              <div className="grid gap-3">
                {pendingGoals.map(goal => {
                  const category = goalCategories.find(c => c.value === goal.category);
                  return (
                    <div key={goal.id} className="bg-white rounded-2xl p-4 soft-glow flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center text-2xl">
                          {category?.label?.split(' ')[0] || '•'}
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">{goal.title}</h3>
                          {goal.description && (
                            <p className="text-sm text-gray-600 mt-1">{goal.description}</p>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={() => setCompletingGoal(goal)}
                        aria-label={`Complete ${goal.title}`}
                        className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-emerald-50"
                      >
                        ○
                      </button>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Completed Goals */}
          {completedGoals.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold mb-4 text-green-600">
                ✅ Completed Goals ({completedGoals.length})
              </h2>
              <div className="grid gap-3">
                {completedGoals.map(goal => {
                  const category = goalCategories.find(c => c.value === goal.category);
                  const completionMood = completionMoods.find(m => m.value === goal.mood_at_completion);
                  return (
                    <div key={goal.id} className="bg-white rounded-2xl p-4 soft-glow flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-2xl text-emerald-700">✓</div>
                        <div>
                          <h3 className="font-medium text-gray-900 line-through text-gray-500">{goal.title}</h3>
                          {goal.description && (
                            <p className="text-sm text-gray-600 mt-1">{goal.description}</p>
                          )}
                          {goal.reflection_note && (
                            <div className="mt-2 p-2 bg-green-50 rounded-lg">
                              <div className="text-xs text-green-700 font-medium mb-1">Reflection:</div>
                              <p className="text-sm text-green-800">{goal.reflection_note}</p>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="text-xs text-gray-500">
                        Completed: {new Date(goal.completed_at).toLocaleString()}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {goals.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <p className="text-lg mb-2">No goals for {selectedDate}</p>
              <p>Start by adding your first micro-goal! 🚀</p>
            </div>
          )}
        </div>
      </main>

      {/* Goal Completion Modal */}
      {completingGoal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Complete Goal 🎉</h3>
            <p className="text-gray-700 mb-4">"{completingGoal.title}"</p>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.target as HTMLFormElement);
              const mood = fd.get('mood') as string;
              const reflection = fd.get('reflection') as string;
              completeGoal(completingGoal, mood, reflection);
            }}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">How do you feel?</label>
                <select name="mood" className="input-field w-full" required>
                  <option value="">Select your mood</option>
                  {completionMoods.map(mood => (
                    <option key={mood.value} value={mood.value}>
                      {mood.emoji} {mood.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Reflection (optional)</label>
                <textarea
                  name="reflection"
                  placeholder="How did this goal make you feel? What did you learn?"
                  className="input-field h-20 resize-none w-full"
                  maxLength={300}
                />
              </div>
              
              <div className="flex gap-2">
                <button type="submit" className="btn-primary rounded-xl px-4 py-2 flex-1">
                  Complete Goal ✓
                </button>
                <button
                  type="button"
                  onClick={() => setCompletingGoal(null)}
                  className="btn-secondary rounded-xl px-4 py-2"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}