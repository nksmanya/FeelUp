import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '../../../lib/supabaseClient';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const user_email = url.searchParams.get('user_email');
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const is_gratitude = url.searchParams.get('is_gratitude') === 'true';
    
    if (!user_email) {
      return NextResponse.json({ error: 'User email required' }, { status: 400 });
    }
    
    const supabase = createServerSupabaseClient();
    
    // Get user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', user_email)
      .single();
    
    if (!profile) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    let query = supabase
      .from('journal_entries')
      .select('*')
      .eq('user_id', profile.id)
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (is_gratitude) {
      query = query.eq('is_gratitude', true);
    }
    
    const { data: entries, error } = await query;
    
    if (error) {
      return NextResponse.json({ error: 'Failed to fetch entries' }, { status: 500 });
    }
    
    return NextResponse.json({ entries: entries || [] });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || String(err) }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { user_email, title, content, mood, mood_emoji, tags, is_gratitude } = await req.json();
    
    if (!user_email || !content?.trim()) {
      return NextResponse.json({ error: 'User email and content are required' }, { status: 400 });
    }
    
    const supabase = createServerSupabaseClient();
    
    // Get user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', user_email)
      .single();
    
    if (!profile) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    const { data: newEntry, error } = await supabase
      .from('journal_entries')
      .insert({
        user_id: profile.id,
        title: title?.trim() || null,
        content: content.trim(),
        mood: mood || null,
        mood_emoji: mood_emoji || null,
        tags: tags || [],
        is_gratitude: !!is_gratitude
      })
      .select()
      .single();
    
    if (error) {
      return NextResponse.json({ error: 'Failed to create entry' }, { status: 500 });
    }
    
    return NextResponse.json({ entry: newEntry });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || String(err) }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const { entry_id, user_email, title, content, mood, mood_emoji, tags } = await req.json();
    
    if (!entry_id || !user_email) {
      return NextResponse.json({ error: 'Entry ID and user email required' }, { status: 400 });
    }
    
    const supabase = createServerSupabaseClient();
    
    // Get user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', user_email)
      .single();
    
    if (!profile) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    const updateData: any = {
      updated_at: new Date().toISOString()
    };
    
    if (title !== undefined) updateData.title = title?.trim() || null;
    if (content !== undefined) updateData.content = content.trim();
    if (mood !== undefined) updateData.mood = mood || null;
    if (mood_emoji !== undefined) updateData.mood_emoji = mood_emoji || null;
    if (tags !== undefined) updateData.tags = tags || [];
    
    const { data: updatedEntry, error } = await supabase
      .from('journal_entries')
      .update(updateData)
      .eq('id', entry_id)
      .eq('user_id', profile.id)
      .select()
      .single();
    
    if (error) {
      return NextResponse.json({ error: 'Failed to update entry' }, { status: 500 });
    }
    
    return NextResponse.json({ entry: updatedEntry });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || String(err) }, { status: 500 });
  }
}