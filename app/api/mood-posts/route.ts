import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { v2 as cloudinary } from "cloudinary";

// Mock database using JSON file for development
const DB_PATH = path.join(process.cwd(), "data", "mood_posts.json");

// Configure Cloudinary from env
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

function ensureDataDir() {
  const dataDir = path.dirname(DB_PATH);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
}

function readPosts() {
  ensureDataDir();
  if (!fs.existsSync(DB_PATH)) {
    return [];
  }
  try {
    const data = fs.readFileSync(DB_PATH, "utf-8");
    return JSON.parse(data);
  } catch {
    return [];
  }
}

function writePosts(posts: any[]) {
  ensureDataDir();
  fs.writeFileSync(DB_PATH, JSON.stringify(posts, null, 2));
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const limit = parseInt(url.searchParams.get("limit") || "20", 10);
    const visibility = url.searchParams.get("visibility") || "public";

    const allPosts = readPosts();
    let filteredPosts = allPosts;

    // Filter by visibility
    if (visibility === "public") {
      filteredPosts = allPosts.filter(
        (post: any) => post.visibility === "public",
      );
    }

    // Sort by created_at descending and limit
    filteredPosts.sort(
      (a: any, b: any) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );
    filteredPosts = filteredPosts.slice(0, limit);

    return NextResponse.json({ posts: filteredPosts });
  } catch (err: any) {
    console.error("Mood posts GET error:", err);
    return NextResponse.json(
      { error: err?.message || String(err) },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      content,
      mood,
      mood_emoji,
      mood_color,
      visibility = "public",
      anonymous,
      owner_email,
      image_base64,
      image_name,
    } = body || {};

    if (!content || typeof content !== "string") {
      return NextResponse.json({ error: "Missing content" }, { status: 400 });
    }

    const allPosts = readPosts();
    const newPost = {
      id: Date.now().toString(),
      content: content.trim(),
      image_url: null as string | null,
      mood: mood || null,
      mood_emoji: mood_emoji || null,
      mood_color: mood_color || null,
      visibility: visibility || "public",
      anonymous: !!anonymous,
      owner_email: anonymous ? null : owner_email || null,
      created_at: new Date().toISOString(),
      profiles: anonymous
        ? null
        : {
            full_name: owner_email?.split("@")[0] || "Anonymous User",
            avatar_url: null,
          },
    };

    // If an image was provided as base64, upload to Cloudinary and set image_url
    if (image_base64 && image_name && process.env.CLOUDINARY_CLOUD_NAME) {
      try {
        // Guess mime type from file extension
        const ext = path.extname(image_name).toLowerCase().replace(".", "");
        let mime = "image/png";
        if (ext === "jpg" || ext === "jpeg") mime = "image/jpeg";
        else if (ext === "webp") mime = "image/webp";
        else if (ext === "gif") mime = "image/gif";

        const dataUri = `data:${mime};base64,${image_base64}`;
        const uploadRes = await cloudinary.uploader.upload(dataUri, {
          folder: "feelup/mood-posts",
        });
        newPost.image_url = uploadRes.secure_url;
      } catch (e) {
        console.error("Cloudinary upload failed:", e);
      }
    }

    allPosts.push(newPost);
    writePosts(allPosts);

    console.log("Mood post created successfully:", newPost);
    return NextResponse.json({ post: newPost });
  } catch (err: any) {
    console.error("Mood posts POST error:", err);
    return NextResponse.json(
      { error: err?.message || String(err) },
      { status: 500 },
    );
  }
}
