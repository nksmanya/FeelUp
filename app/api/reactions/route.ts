import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabaseClient";

/**
 * GET handler to retrieve reaction summaries for a post from Supabase.
 */
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const postId = url.searchParams.get("post_id");

    if (!postId) {
      return NextResponse.json({ error: "Missing post_id" }, { status: 400 });
    }

    const supabase = createServerSupabaseClient();
    const { data: reactions, error } = await supabase
      .from("post_reactions")
      .select("reaction_type, profiles(full_name)")
      .eq("post_id", postId);

    if (error) throw new Error(error.message);

    // Group by reaction type and count
    const reactionSummary = (reactions || []).reduce((acc: any, reaction: any) => {
      const type = reaction.reaction_type;
      if (!acc[type]) {
        acc[type] = { count: 0, users: [] };
      }
      acc[type].count++;
      acc[type].users.push(reaction.profiles?.full_name || "Anonymous");
      return acc;
    }, {});

    return NextResponse.json({ reactions: reactionSummary });
  } catch (err: any) {
    console.error("Reactions GET error:", err);
    return NextResponse.json({ error: err?.message || String(err) }, { status: 500 });
  }
}

/**
 * POST handler to toggle a reaction on Supabase.
 */
export async function POST(req: Request) {
  try {
    const { post_id, user_email, reaction_type } = await req.json();

    if (!post_id || !user_email || !reaction_type) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const validReactions = ["cheer", "support", "hug", "care"];
    if (!validReactions.includes(reaction_type)) {
      return NextResponse.json({ error: "Invalid reaction type" }, { status: 400 });
    }

    const supabase = createServerSupabaseClient();

    // Get user_id from email
    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", user_email)
      .single();

    if (!profile) return NextResponse.json({ error: "User profile not found" }, { status: 404 });

    // Check if reaction already exists
    const { data: existingReaction } = await supabase
      .from("post_reactions")
      .select("id")
      .eq("post_id", post_id)
      .eq("user_id", profile.id)
      .eq("reaction_type", reaction_type)
      .maybeSingle();

    if (existingReaction) {
      // Toggle off: remove reaction
      const { error: deleteError } = await supabase
        .from("post_reactions")
        .delete()
        .eq("id", existingReaction.id);

      if (deleteError) throw new Error(deleteError.message);
      return NextResponse.json({ success: true, action: "removed" });
    } else {
      // Toggle on: add new reaction
      const { data: newReaction, error: insertError } = await supabase
        .from("post_reactions")
        .insert({
          post_id,
          user_id: profile.id,
          reaction_type,
        })
        .select()
        .single();

      if (insertError) throw new Error(insertError.message);
      return NextResponse.json({ success: true, action: "added", reaction: newReaction });
    }
  } catch (err: any) {
    console.error("Reactions POST error:", err);
    return NextResponse.json({ error: err?.message || String(err) }, { status: 500 });
  }
}
