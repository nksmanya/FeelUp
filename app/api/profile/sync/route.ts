import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '../../../../lib/supabaseClient';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, name } = body || {};
    if (!email) return NextResponse.json({ error: 'Missing email' }, { status: 400 });

    const supabase = createServerSupabaseClient();

    // Upsert into profiles table using email as the unique identifier
    const { data, error } = await supabase
      .from('profiles')
      .upsert(
        { 
          email: email, 
          full_name: name || null 
        },
        { 
          onConflict: 'email',
          ignoreDuplicates: false 
        }
      )
      .select();

    if (error) {
      console.error('Profile sync error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, data });
  } catch (err: any) {
    console.error('Profile sync catch error:', err);
    return NextResponse.json({ error: err?.message || String(err) }, { status: 500 });
  }
}
