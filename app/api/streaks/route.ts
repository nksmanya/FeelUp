import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "../../../lib/supabaseClient";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const userEmail = url.searchParams.get("user_email");

    if (!userEmail) {
      return NextResponse.json(
        { error: "Missing user_email" },
        { status: 400 },
      );
    }

    const supabase = createServerSupabaseClient();

    const { data, error } = await supabase
      .from("user_streaks")
      .select("*")
      .eq("user_email", userEmail);

    if (error)
      return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ streaks: data });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || String(err) },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { user_email, streak_type, activity_date } = body || {};

    if (!user_email || !streak_type) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const supabase = createServerSupabaseClient();
    const today = activity_date || new Date().toISOString().split("T")[0];
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0];

    // Get current streak data
    const { data: currentStreak } = await supabase
      .from("user_streaks")
      .select("*")
      .eq("user_email", user_email)
      .eq("streak_type", streak_type)
      .single();

    let newCount = 1;
    let bestCount = 1;

    if (currentStreak) {
      const lastActivity = currentStreak.last_activity_date;

      if (lastActivity === today) {
        // Already recorded today, no change
        return NextResponse.json({ streak: currentStreak });
      } else if (lastActivity === yesterday) {
        // Continuing streak
        newCount = currentStreak.current_count + 1;
        bestCount = Math.max(currentStreak.best_count, newCount);
      } else {
        // Streak broken, reset to 1
        newCount = 1;
        bestCount = currentStreak.best_count;
      }
    }

    // Update or insert streak
    const { data: streak, error } = await supabase
      .from("user_streaks")
      .upsert({
        user_email,
        streak_type,
        current_count: newCount,
        best_count: bestCount,
        last_activity_date: today,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error)
      return NextResponse.json({ error: error.message }, { status: 500 });

    // Check for achievements
    await checkStreakAchievements(supabase, user_email, streak_type, newCount);

    return NextResponse.json({ streak });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || String(err) },
      { status: 500 },
    );
  }
}

async function checkStreakAchievements(
  supabase: any,
  userEmail: string,
  streakType: string,
  count: number,
) {
  const milestones = [
    { days: 3, name: "Getting Started", emoji: "🌱" },
    { days: 7, name: "Week Warrior", emoji: "⚡" },
    { days: 14, name: "Two Week Tiger", emoji: "🐅" },
    { days: 30, name: "Month Master", emoji: "🏆" },
    { days: 50, name: "Consistency Champion", emoji: "🏅" },
    { days: 100, name: "Century Superstar", emoji: "⭐" },
  ];

  for (const milestone of milestones) {
    if (count === milestone.days) {
      await supabase.from("achievements").upsert({
        user_email: userEmail,
        badge_type: "streak",
        badge_name: milestone.name,
        badge_emoji: milestone.emoji,
        description: `Maintained a ${milestone.days}-day ${streakType} streak!`,
        requirement_value: milestone.days,
        points: milestone.days * 10,
      });
    }
  }
}
