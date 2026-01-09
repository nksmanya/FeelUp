import { createServerSupabaseClient } from "../supabaseClient";
import { v2 as cloudinary } from "cloudinary";
import path from "path";

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Service to handle journal entry operations using Supabase for persistence.
 */
export const JournalService = {
    /**
     * Retrieves journal entries for a user from Supabase.
     */
    async getEntries(filters: { user_email: string; limit?: number; is_gratitude?: boolean }) {
        const { user_email, limit = 20, is_gratitude = false } = filters;
        const supabase = createServerSupabaseClient();

        let query = supabase
            .from("journal_entries")
            .select("*")
            .eq("user_email", user_email)
            .order("created_at", { ascending: false })
            .limit(limit);

        if (is_gratitude) {
            query = query.eq("is_gratitude", true);
        }

        const { data, error } = await query;

        if (error) {
            console.error("Supabase getEntries error:", error);
            throw new Error(error.message);
        }

        return data || [];
    },

    /**
     * Creates a new journal entry in Supabase.
     */
    async createEntry(data: any) {
        const {
            user_email,
            title,
            content,
            mood,
            mood_emoji,
            energy_level,
            tags,
            is_gratitude,
            can_convert_to_post,
            image_base64,
            image_name,
        } = data;

        const supabase = createServerSupabaseClient();
        let imageUrl = null;

        // Upload image to Cloudinary if provided
        if (image_base64 && image_name && process.env.CLOUDINARY_CLOUD_NAME) {
            try {
                const ext = path.extname(image_name).toLowerCase().replace(".", "");
                let mime = "image/png";
                if (ext === "jpg" || ext === "jpeg") mime = "image/jpeg";
                else if (ext === "webp") mime = "image/webp";
                else if (ext === "gif") mime = "image/gif";

                const dataUri = `data:${mime};base64,${image_base64}`;
                const uploadRes = await cloudinary.uploader.upload(dataUri, {
                    folder: "feelup/journal",
                });
                imageUrl = uploadRes.secure_url;
            } catch (e) {
                console.error("Cloudinary upload failed for journal image:", e);
            }
        }

        const { data: newEntry, error } = await supabase
            .from("journal_entries")
            .insert({
                user_email,
                title: title?.trim() || null,
                content: content.trim(),
                mood_tag: mood || null,
                mood_emoji: mood_emoji || null,
                energy_level: energy_level || null,
                tags: tags || [],
                is_gratitude: !!is_gratitude,
                can_convert_to_post: !!can_convert_to_post,
                // Optional image_url field if added to schema
                // image_url: imageUrl
            })
            .select()
            .single();

        if (error) {
            console.error("Supabase createEntry error:", error);
            throw new Error(error.message);
        }

        return newEntry;
    },

    /**
     * Updates an existing journal entry.
     */
    async updateEntry(id: string, user_email: string, updates: any) {
        const supabase = createServerSupabaseClient();

        const { data: entry, error: fetchError } = await supabase
            .from("journal_entries")
            .select("user_email")
            .eq("id", id)
            .single();

        if (fetchError || !entry) throw new Error("Entry not found");
        if (entry.user_email !== user_email) throw new Error("Unauthorized");

        const updateData: any = {};
        if (updates.title !== undefined) updateData.title = updates.title?.trim() || null;
        if (updates.content !== undefined) updateData.content = updates.content.trim();
        if (updates.mood !== undefined) updateData.mood_tag = updates.mood || null;
        if (updates.mood_emoji !== undefined) updateData.mood_emoji = updates.mood_emoji || null;
        if (updates.tags !== undefined) updateData.tags = updates.tags || [];

        const { data: updatedEntry, error } = await supabase
            .from("journal_entries")
            .update({ ...updateData, updated_at: new Date().toISOString() })
            .eq("id", id)
            .select()
            .single();

        if (error) throw new Error(error.message);
        return updatedEntry;
    },

    /**
     * Deletes a journal entry.
     */
    async deleteEntry(id: string, user_email: string) {
        const supabase = createServerSupabaseClient();

        const { data: entry, error: fetchError } = await supabase
            .from("journal_entries")
            .select("user_email")
            .eq("id", id)
            .single();

        if (fetchError || !entry) throw new Error("Entry not found");
        if (entry.user_email !== user_email) throw new Error("Unauthorized");

        const { error } = await supabase
            .from("journal_entries")
            .delete()
            .eq("id", id);

        if (error) throw new Error(error.message);
        return true;
    }
};
