import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabaseClient";

/**
 * GET handler to retrieve comments for a specific post from Supabase.
 */
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const postId = url.searchParams.get("post_id");

    if (!postId) {
      return NextResponse.json({ error: "Missing post_id" }, { status: 400 });
    }

    const supabase = createServerSupabaseClient();
    const { data: comments, error } = await supabase
      .from("post_comments")
      .select("*, profiles(full_name, avatar_url)")
      .eq("post_id", postId)
      .order("created_at", { ascending: true });

    if (error) throw new Error(error.message);

    return NextResponse.json({ comments: comments || [] });
  } catch (err: any) {
    console.error("Comments GET error:", err);
    return NextResponse.json(
      { error: err?.message || String(err) },
      { status: 500 },
    );
  }
}

/**
 * POST handler to create a new comment on Supabase.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { post_id, content, anonymous, user_email } = body || {};

    if (!post_id || !content || !user_email) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Simple positivity filter
    const negativeWords = ["hate", "awful", "terrible", "stupid", "ugly", "worst", "suck"];
    if (negativeWords.some(word => content.toLowerCase().includes(word))) {
      return NextResponse.json({ error: "Please keep comments positive! 💕" }, { status: 400 });
    }

    const supabase = createServerSupabaseClient();

    // Get user_id from email
    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", user_email)
      .single();

    if (!profile) return NextResponse.json({ error: "User profile not found" }, { status: 404 });

    const { data: comment, error } = await supabase
      .from("post_comments")
      .insert({
        post_id,
        user_id: profile.id,
        content: content.trim(),
        anonymous: !!anonymous,
      })
      .select("*, profiles(full_name, avatar_url)")
      .single();

    if (error) throw new Error(error.message);

    return NextResponse.json({ comment });
  } catch (err: any) {
    console.error("Comments POST error:", err);
    return NextResponse.json({ error: err?.message || String(err) }, { status: 500 });
  }
}
