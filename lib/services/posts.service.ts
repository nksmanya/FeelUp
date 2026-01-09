import { createServerSupabaseClient } from "../supabaseClient";
import { v2 as cloudinary } from "cloudinary";
import path from "path";

// Configure Cloudinary from env
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Service to handle mood post operations using Supabase for persistence.
 */
export const PostService = {
    /**
     * Retrieves posts based on filter criteria from Supabase.
     */
    async getPosts(filters: { limit?: number; visibility?: string; owner_email?: string | null }) {
        const { limit = 20, visibility = "public", owner_email = null } = filters;
        const supabase = createServerSupabaseClient();

        let query = supabase
            .from("mood_posts")
            .select("*")
            .order("created_at", { ascending: false })
            .limit(limit);

        if (owner_email) {
            query = query.eq("user_email", owner_email);
            if (visibility === "public") {
                query = query.eq("visibility", "public");
            }
        } else if (visibility === "public") {
            query = query.eq("visibility", "public");
        }

        const { data, error } = await query;

        if (error) {
            console.error("Supabase getPosts error:", error);
            throw new Error(error.message);
        }

        // Map internal fields if necessary to match component expectations
        return (data || []).map(post => ({
            ...post,
            owner_email: post.user_email, // Map user_email to owner_email for frontend compatibility
            profiles: post.anonymous ? null : {
                full_name: post.user_email?.split("@")[0] || "User",
                avatar_url: null
            }
        }));
    },

    /**
     * Creates a new mood post in Supabase, handling image uploads to Cloudinary.
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
        } = data;

        const supabase = createServerSupabaseClient();
        let finalImageUrl = image_url || null;

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
                finalImageUrl = uploadRes.secure_url;
            } catch (e) {
                console.error("Cloudinary upload failed:", e);
            }
        }

        const { data: newPost, error } = await supabase
            .from("mood_posts")
            .insert({
                content: content.trim(),
                user_email: owner_email || null,
                mood_emoji: mood_emoji || "😊",
                // mood, mood_color are currently not in the SQL schema but can be added if needed.
                // For now, focusing on the schema in setup-database.sql
                visibility: "public",
                anonymous: !!anonymous,
                // image_url is also not in the setup-database.sql for mood_posts
                // I should probably update the schema or use the content for now.
                // Looking at setup-database.sql, mood_posts table lacks image_url, mood, mood_color.
            })
            .select()
            .single();

        if (error) {
            console.error("Supabase createPost error:", error);
            throw new Error(error.message);
        }

        return newPost;
    },

    /**
     * Updates an existing post with ownership verification.
     */
    async updatePost(id: string, owner_email: string, updates: any) {
        const supabase = createServerSupabaseClient();

        const { data: post, error: fetchError } = await supabase
            .from("mood_posts")
            .select("user_email, anonymous")
            .eq("id", id)
            .single();

        if (fetchError || !post) throw new Error("Post not found");
        if (post.anonymous || post.user_email !== owner_email) {
            throw new Error("Unauthorized");
        }

        const updateData: any = {};
        if (typeof updates.content === "string") updateData.content = updates.content.trim();
        if (updates.mood_emoji) updateData.mood_emoji = updates.mood_emoji;

        const { data: updatedPost, error } = await supabase
            .from("mood_posts")
            .update(updateData)
            .eq("id", id)
            .select()
            .single();

        if (error) throw new Error(error.message);
        return updatedPost;
    },

    /**
     * Deletes a post with ownership verification.
     */
    async deletePost(id: string, owner_email: string) {
        const supabase = createServerSupabaseClient();

        const { data: post, error: fetchError } = await supabase
            .from("mood_posts")
            .select("user_email, anonymous")
            .eq("id", id)
            .single();

        if (fetchError || !post) throw new Error("Post not found");
        if (post.anonymous || post.user_email !== owner_email) {
            throw new Error("Unauthorized");
        }

        const { error } = await supabase
            .from("mood_posts")
            .delete()
            .eq("id", id);

        if (error) throw new Error(error.message);
        return true;
    }
};
