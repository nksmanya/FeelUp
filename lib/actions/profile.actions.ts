"use server";

import { supabaseAdmin as supabase } from "@/lib/supabaseServer";

/* 1️⃣ Auto-create profile after signup */
export async function createProfile(
  userId: string,
  fullName: string,
  username: string
) {

  const { error } = await supabase.from("profiles").insert({
    id: userId,
    full_name: fullName,
    username: username.toLowerCase(),
  });

  if (error) {
    throw new Error(error.message);
  }
}

/* 2️⃣ Username availability check */
export async function isUsernameAvailable(username: string) {

  const { data, error } = await supabase
    .from("profiles")
    .select("username")
    .eq("username", username.toLowerCase())
    .maybeSingle(); // ✅ FIX

  if (error) {
    console.error("Username check error:", error.message);
    return false;
  }

  return !data; // true = available
}
