import { NextResponse } from "next/server";

// Mock user profiles data
const mockUserProfiles = [
  {
    id: "1",
    name: "Sarah Chen",
    email: "sarah.chen@example.com",
    avatar: null,
    bio: "Meditation enthusiast and mental health advocate. Sharing daily mindfulness tips and positive energy! 🧘‍♀️✨",
    location: "San Francisco, CA",
    wellness_focus: ["Meditation", "Anxiety Management", "Sleep Health"],
    mood_streak: 45,
    journal_entries: 127,
    followers_count: 89,
    following_count: 156,
    achievements: ["7-Day Streak", "Mindful Master", "Community Helper"],
    is_active: true,
    joined_date: "2024-08-15T00:00:00.000Z",
    recent_activity: "Shared a meditation tip 2 hours ago",
  },
  {
    id: "2",
    name: "Alex Rodriguez",
    email: "alex.rodriguez@example.com",
    avatar: null,
    bio: "Student exploring mindfulness and stress management. Love connecting with like-minded people who prioritize mental wellness! 📚🌱",
    location: "Austin, TX",
    wellness_focus: ["Stress Management", "Study Wellness", "Self-Care"],
    mood_streak: 23,
    journal_entries: 67,
    followers_count: 42,
    following_count: 78,
    achievements: ["Weekly Warrior", "Self-Care Champion"],
    is_active: true,
    joined_date: "2024-09-22T00:00:00.000Z",
    recent_activity: "Completed mood check-in 1 hour ago",
  },
  {
    id: "3",
    name: "Jamie Park",
    email: "jamie.park@example.com",
    avatar: null,
    bio: "Creative soul using art and journaling for emotional wellness. Passionate about helping others find their creative spark! 🎨💕",
    location: "Portland, OR",
    wellness_focus: ["Creative Wellness", "Emotional Health", "Journaling"],
    mood_streak: 67,
    journal_entries: 203,
    followers_count: 134,
    following_count: 92,
    achievements: [
      "Creative Master",
      "Journal Guru",
      "30-Day Streak",
      "Community Star",
    ],
    is_active: true,
    joined_date: "2024-07-10T00:00:00.000Z",
    recent_activity: "Posted a gratitude journal entry 30 minutes ago",
  },
  {
    id: "4",
    name: "Morgan Taylor",
    email: "morgan.taylor@example.com",
    avatar: null,
    bio: "Fitness and mental health go hand in hand! Sharing tips for physical and emotional wellness every day. 💪🧠",
    location: "Denver, CO",
    wellness_focus: ["Physical Wellness", "Mental Strength", "Motivation"],
    mood_streak: 34,
    journal_entries: 89,
    followers_count: 76,
    following_count: 103,
    achievements: ["Fitness Warrior", "Motivation Master"],
    is_active: true,
    joined_date: "2024-08-28T00:00:00.000Z",
    recent_activity: "Shared workout wellness tips 4 hours ago",
  },
  {
    id: "5",
    name: "Riley Chen",
    email: "riley.chen@example.com",
    avatar: null,
    bio: "Nature lover and mindfulness practitioner. Finding peace in outdoor meditation and forest walks. 🌲🌸",
    location: "Seattle, WA",
    wellness_focus: ["Nature Therapy", "Mindfulness", "Outdoor Wellness"],
    mood_streak: 28,
    journal_entries: 98,
    followers_count: 67,
    following_count: 84,
    achievements: ["Nature Lover", "Mindful Explorer"],
    is_active: true,
    joined_date: "2024-09-05T00:00:00.000Z",
    recent_activity: "Shared nature meditation experience 6 hours ago",
  },
  {
    id: "6",
    name: "Quinn Williams",
    email: "quinn.williams@example.com",
    avatar: null,
    bio: "Tech professional focusing on work-life balance and digital wellness. Helping others navigate stress in the modern world! 💻⚖️",
    location: "New York, NY",
    wellness_focus: ["Work-Life Balance", "Digital Wellness", "Productivity"],
    mood_streak: 19,
    journal_entries: 54,
    followers_count: 38,
    following_count: 62,
    achievements: ["Balance Seeker", "Digital Detox"],
    is_active: true,
    joined_date: "2024-10-12T00:00:00.000Z",
    recent_activity: "Posted about digital boundaries 8 hours ago",
  },
];

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("id");
    const email = searchParams.get("email");
    const search = searchParams.get("search");
    const focus = searchParams.get("focus");

    let users = [...mockUserProfiles];

    // Get specific user by ID or email
    if (userId) {
      const user = users.find((u) => u.id === userId);
      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }
      return NextResponse.json(user);
    }

    if (email) {
      const user = users.find((u) => u.email === email);
      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }
      return NextResponse.json(user);
    }

    // Filter by search query
    if (search) {
      const searchLower = search.toLowerCase();
      users = users.filter(
        (user) =>
          user.name.toLowerCase().includes(searchLower) ||
          user.bio.toLowerCase().includes(searchLower) ||
          user.location.toLowerCase().includes(searchLower) ||
          user.wellness_focus.some((focus) =>
            focus.toLowerCase().includes(searchLower),
          ),
      );
    }

    // Filter by wellness focus
    if (focus) {
      users = users.filter((user) =>
        user.wellness_focus.some((userFocus) =>
          userFocus.toLowerCase().includes(focus.toLowerCase()),
        ),
      );
    }

    // Sort by activity and streak
    users.sort((a, b) => {
      if (a.is_active !== b.is_active) {
        return a.is_active ? -1 : 1;
      }
      return b.mood_streak - a.mood_streak;
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error("Error fetching user profiles:", error);
    return NextResponse.json(
      { error: "Failed to fetch user profiles" },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { email, ...updateData } = body;

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // In a real app, this would update the user profile in the database
    // For now, we'll just return a success response
    return NextResponse.json({
      message: "Profile updated successfully",
      data: updateData,
    });
  } catch (error) {
    console.error("Error updating user profile:", error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 },
    );
  }
}
