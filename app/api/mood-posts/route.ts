import { NextResponse } from "next/server";
import { PostService } from "@/lib/services/posts.service";

/**
 * GET handler to retrieve mood posts with optional filtering.
 */
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const limit = parseInt(url.searchParams.get("limit") || "20", 10);
    const visibility = url.searchParams.get("visibility") || "public";
    const owner_email = url.searchParams.get("owner_email");

    const posts = await PostService.getPosts({ limit, visibility, owner_email });
    return NextResponse.json({ posts });
  } catch (err: any) {
    console.error("Mood posts GET error:", err);
    return NextResponse.json(
      { error: err?.message || String(err) },
      { status: 500 },
    );
  }
}

/**
 * POST handler to create a new mood post.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body?.content || typeof body.content !== "string") {
      return NextResponse.json({ error: "Missing content" }, { status: 400 });
    }

    const post = await PostService.createPost(body);
    return NextResponse.json({ post });
  } catch (err: any) {
    console.error("Mood posts POST error:", err);
    return NextResponse.json(
      { error: err?.message || String(err) },
      { status: 500 },
    );
  }
}

/**
 * PATCH handler to update an existing mood post.
 */
export async function PATCH(req: Request) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    const body = await req.json();
    const { owner_email } = body || {};

    try {
      const post = await PostService.updatePost(id, owner_email, body);
      return NextResponse.json({ post });
    } catch (e: any) {
      const status = e.message === "Unauthorized" ? 403 : 404;
      return NextResponse.json({ error: e.message }, { status });
    }
  } catch (err: any) {
    console.error("Mood posts PATCH error:", err);
    return NextResponse.json({ error: err?.message || String(err) }, { status: 500 });
  }
}

/**
 * DELETE handler to remove a mood post.
 */
export async function DELETE(req: Request) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    const owner_email = url.searchParams.get("owner_email");
    if (!id || !owner_email) {
      return NextResponse.json({ error: "Missing id or owner_email" }, { status: 400 });
    }

    try {
      await PostService.deletePost(id, owner_email);
      return NextResponse.json({ success: true });
    } catch (e: any) {
      const status = e.message === "Unauthorized" ? 403 : 404;
      return NextResponse.json({ error: e.message }, { status });
    }
  } catch (err: any) {
    console.error("Mood posts DELETE error:", err);
    return NextResponse.json({ error: err?.message || String(err) }, { status: 500 });
  }
}
