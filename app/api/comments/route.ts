import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '../../../lib/supabaseClient';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const postId = url.searchParams.get('post_id');
    
    if (!postId) {
      return NextResponse.json({ error: 'Missing post_id' }, { status: 400 });
    }

    const supabase = createServerSupabaseClient();
    
    const { data, error } = await supabase
      .from('post_comments')
      .select(`
        id, content, anonymous, user_email, created_at,
        profiles!post_comments_user_email_fkey(full_name, avatar_url)
      `)
      .eq('post_id', postId)
      .order('created_at', { ascending: true });
    
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ comments: data });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || String(err) }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { post_id, content, anonymous, user_email } = body || {};
    
    if (!post_id || !content || !user_email) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Simple positivity filter - reject negative words
    const negativeWords = ['hate', 'awful', 'terrible', 'stupid', 'ugly', 'worst', 'suck'];
    const lowerContent = content.toLowerCase();
    const hasNegativeWords = negativeWords.some(word => lowerContent.includes(word));
    
    if (hasNegativeWords) {
      return NextResponse.json({ 
        error: 'Please keep comments positive and supportive! 💕' 
      }, { status: 400 });
    }

    const supabase = createServerSupabaseClient();
    
    const { data, error } = await supabase.from('post_comments').insert([{
      post_id,
      content: content.trim(),
      anonymous: !!anonymous,
      user_email: anonymous ? null : user_email
    }]).select().single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ comment: data });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || String(err) }, { status: 500 });
  }
}