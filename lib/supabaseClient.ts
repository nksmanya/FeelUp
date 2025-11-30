import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * Browser supabase client — use this in client components only.
 * Requires NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in env.
 */
export function createBrowserSupabaseClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY');
  }
  return createClient(url, anon);
}

/**
 * Server supabase client — use this in server code (API routes, server components).
 * Requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in env. Keep service role key secret.
 */
export function createServerSupabaseClient(): SupabaseClient {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  }
  return createClient(url, key);
}
