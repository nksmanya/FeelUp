import fs from "fs";
import path from "path";
import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary from env
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const DB_PATH = path.join(process.cwd(), "data", "mood_posts.json");

/**
 * Ensures that the data directory for the JSON mock database exists.
 */
function ensureDataDir() {
    const dataDir = path.dirname(DB_PATH);
    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
    }
}

/**
 * Reads all mood posts from the JSON mock database.
 * @returns {Array} Array of post objects.
 */
export function readPosts(): any[] {
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

/**
 * Writes the given posts array to the JSON mock database.
 * @param {Array} posts Array of post objects to save.
 */
export function writePosts(posts: any[]) {
    ensureDataDir();
    fs.writeFileSync(DB_PATH, JSON.stringify(posts, null, 2));
}

/**
 * Service to handle mood post operations including data retrieval, creation, and Cloudinary uploads.
 */
export const PostService = {
    /**
     * Retrieves posts based on filter criteria.
     */
    async getPosts(filters: { limit?: number; visibility?: string; owner_email?: string | null }) {
        const { limit = 20, visibility = "public", owner_email = null } = filters;
        const allPosts = readPosts();
        let filteredPosts = allPosts;

        if (owner_email) {
            filteredPosts = allPosts.filter((post: any) => post.owner_email === owner_email);
            if (visibility === "public") {
                filteredPosts = filteredPosts.filter((post: any) => post.visibility === "public");
            }
        } else if (visibility === "public") {
            filteredPosts = allPosts.filter((post: any) => post.visibility === "public");
        }

        filteredPosts.sort(
            (a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
        );

        return filteredPosts.slice(0, limit);
    },

    /**
     * Creates a new mood post, handling image uploads to Cloudinary if necessary.
     */
    async createPost(data: any) {
        const {
            content,
            mood,
            mood_emoji,
            mood_color,
            anonymous,
            owner_email,
            image_base64,
            image_name,
            image_url,
            reposted_from,
        } = data;

        const allPosts = readPosts();
        const newPost: any = {
            id: Date.now().toString(),
            content: content.trim(),
            image_url: image_url || null,
            reposted_from: reposted_from || null,
            mood: mood || null,
            mood_emoji: mood_emoji || null,
            mood_color: mood_color || null,
            visibility: "public",
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

        // Cloudinary Upload Logic
        if (image_base64 && image_name && process.env.CLOUDINARY_CLOUD_NAME) {
            try {
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
        return newPost;
    },

    /**
     * Updates an existing post with ownership verification.
     */
    async updatePost(id: string, owner_email: string, updates: any) {
        const allPosts = readPosts();
        const idx = allPosts.findIndex((p: any) => p.id === id);
        if (idx === -1) throw new Error("Post not found");

        const post = allPosts[idx];
        if (post.anonymous || post.owner_email !== owner_email) {
            throw new Error("Unauthorized");
        }

        if (typeof updates.content === "string") post.content = updates.content.trim();
        if (updates.mood) post.mood = updates.mood;
        if (updates.mood_emoji) post.mood_emoji = updates.mood_emoji;
        if (updates.mood_color) post.mood_color = updates.mood_color;
        post.updated_at = new Date().toISOString();

        allPosts[idx] = post;
        writePosts(allPosts);
        return post;
    },

    /**
     * Deletes a post with ownership verification.
     */
    async deletePost(id: string, owner_email: string) {
        const allPosts = readPosts();
        const idx = allPosts.findIndex((p: any) => p.id === id);
        if (idx === -1) throw new Error("Post not found");

        const post = allPosts[idx];
        if (post.anonymous || post.owner_email !== owner_email) {
            throw new Error("Unauthorized");
        }

        allPosts.splice(idx, 1);
        writePosts(allPosts);
        return true;
    }
};
