import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('stats')
      .select('key, value');

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    const statsMap: Record<string, number> = {
      total_visitors: 0,
      total_cvs_roasted: 0,
    };

    data?.forEach((row) => {
      statsMap[row.key] = Number(row.value);
    });

    return NextResponse.json({ success: true, stats: statsMap });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
