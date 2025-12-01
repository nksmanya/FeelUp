import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '../../../lib/supabaseClient';

export async function POST(req: Request) {
  try {
    const { post_id, user_email, reaction_type } = await req.json();
    
    if (!post_id || !user_email || !reaction_type) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    // Validate reaction type (positive reactions only)
    const validReactions = ['cheer', 'support', 'hug', 'care'];
    if (!validReactions.includes(reaction_type)) {
      return NextResponse.json({ error: 'Invalid reaction type' }, { status: 400 });
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
    
    // Check if reaction already exists
    const { data: existingReaction } = await supabase
      .from('post_reactions')
      .select('id')
      .eq('post_id', post_id)
      .eq('user_id', profile.id)
      .eq('reaction_type', reaction_type)
      .single();
    
    if (existingReaction) {
      // Remove reaction if it exists (toggle)
      const { error: deleteError } = await supabase
        .from('post_reactions')
        .delete()
        .eq('id', existingReaction.id);
      
      if (deleteError) {
        return NextResponse.json({ error: 'Failed to remove reaction' }, { status: 500 });
      }
      
      return NextResponse.json({ action: 'removed' });
    } else {
      // Add new reaction
      const { data: newReaction, error } = await supabase
        .from('post_reactions')
        .insert({
          post_id,
          user_id: profile.id,
          reaction_type
        })
        .select()
        .single();
      
      if (error) {
        return NextResponse.json({ error: 'Failed to add reaction' }, { status: 500 });
      }
      
      return NextResponse.json({ action: 'added', reaction: newReaction });
    }
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || String(err) }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const post_id = url.searchParams.get('post_id');
    
    if (!post_id) {
      return NextResponse.json({ error: 'Post ID required' }, { status: 400 });
    }
    
    const supabase = createServerSupabaseClient();
    
    // Get reaction counts for the post
    const { data: reactions, error } = await supabase
      .from('post_reactions')
      .select('reaction_type, user_id, profiles!post_reactions_user_id_fkey(full_name)')
      .eq('post_id', post_id);
    
    if (error) {
      return NextResponse.json({ error: 'Failed to fetch reactions' }, { status: 500 });
    }
    
    // Group reactions by type and count them
    const reactionCounts = reactions.reduce((acc: any, reaction: any) => {
      if (!acc[reaction.reaction_type]) {
        acc[reaction.reaction_type] = { count: 0, users: [] };
      }
      acc[reaction.reaction_type].count++;
      acc[reaction.reaction_type].users.push(reaction.profiles?.full_name || 'Anonymous');
      return acc;
    }, {});
    
    return NextResponse.json({ reactions: reactionCounts });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || String(err) }, { status: 500 });
  }
}