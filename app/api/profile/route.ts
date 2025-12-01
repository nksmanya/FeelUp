import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '../../../lib/supabaseClient';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const email = url.searchParams.get('email');
    
    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 });
    }
    
    const supabase = createServerSupabaseClient();
    
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', email)
      .single();
    
    if (error && error.code !== 'PGRST116') { // Not found is OK
      return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
    }
    
    return NextResponse.json({ profile: profile || null });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || String(err) }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const { email, full_name, bio, privacy_level, theme } = await req.json();
    
    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 });
    }
    
    const supabase = createServerSupabaseClient();
    
    const updateData: any = {};
    if (full_name !== undefined) updateData.full_name = full_name;
    if (bio !== undefined) updateData.bio = bio;
    if (privacy_level !== undefined) updateData.privacy_level = privacy_level;
    if (theme !== undefined) updateData.theme = theme;
    
    updateData.updated_at = new Date().toISOString();
    
    // Upsert the profile
    const { data: profile, error } = await supabase
      .from('profiles')
      .upsert({ email, ...updateData }, { onConflict: 'email' })
      .select()
      .single();
    
    if (error) {
      return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
    }
    
    return NextResponse.json({ profile });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || String(err) }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { email } = await req.json();
    
    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 });
    }
    
    const supabase = createServerSupabaseClient();
    
    // Delete all user data (cascade should handle most of this)
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('email', email);
    
    if (error) {
      return NextResponse.json({ error: 'Failed to delete account' }, { status: 500 });
    }
    
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || String(err) }, { status: 500 });
  }
}