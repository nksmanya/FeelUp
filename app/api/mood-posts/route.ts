import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '../../../lib/supabaseClient';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const limit = parseInt(url.searchParams.get('limit') || '20', 10);
    const visibility = url.searchParams.get('visibility') || 'public';

    const supabase = createServerSupabaseClient();
    
    let query = supabase
      .from('mood_posts')
      .select(`
        id, content, mood, mood_emoji, mood_color, visibility, anonymous, owner_email, created_at,
        profiles!mood_posts_owner_id_fkey(full_name, avatar_url)
      `)
      .order('created_at', { ascending: false })
      .limit(limit);
    
    // Filter by visibility (for now just public posts)
    if (visibility === 'public') {
      query = query.eq('visibility', 'public');
    }

    const { data, error } = await query;
    
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ posts: data });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || String(err) }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { content, mood, mood_emoji, mood_color, visibility = 'public', anonymous, owner_email } = body || {};
    
    if (!content || typeof content !== 'string') {
      return NextResponse.json({ error: 'Missing content' }, { status: 400 });
    }

    const supabase = createServerSupabaseClient();
    
    // Get user profile for owner_id if not anonymous
    let owner_id = null;
    if (owner_email && !anonymous) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', owner_email)
        .single();
      owner_id = profile?.id;
    }
    
    const { data, error } = await supabase.from('mood_posts').insert([{
      content: content.trim(),
      mood: mood || null,
      mood_emoji: mood_emoji || null,
      mood_color: mood_color || null,
      visibility: visibility || 'public',
      anonymous: !!anonymous,
      owner_email: anonymous ? null : owner_email || null,
      owner_id: anonymous ? null : owner_id
    }]).select().single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ post: data });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || String(err) }, { status: 500 });
  }
}
