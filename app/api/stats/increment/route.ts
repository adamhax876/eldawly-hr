import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST() {
  try {
    // Attempt standard single-row select and update/upsert
    const { data: fetchResult, error: fetchError } = await supabaseAdmin
      .from('stats')
      .select('value')
      .eq('key', 'total_visitors')
      .maybeSingle();

    if (fetchError) {
      return NextResponse.json({ success: false, error: fetchError.message }, { status: 500 });
    }

    const currentVal = fetchResult?.value ? Number(fetchResult.value) : 0;
    
    const { error: upsertError } = await supabaseAdmin
      .from('stats')
      .upsert({ 
        key: 'total_visitors', 
        value: currentVal + 1,
        updated_at: new Date().toISOString()
      });

    if (upsertError) {
      return NextResponse.json({ success: false, error: upsertError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, count: currentVal + 1 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
