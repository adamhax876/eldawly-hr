import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// Helper to verify admin token and email
async function verifyAdmin(request: Request) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { authorized: false, error: 'Missing or invalid authorization header' };
  }

  const token = authHeader.substring(7);
  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

  if (error || !user) {
    return { authorized: false, error: 'Invalid token: ' + (error?.message || 'User not found') };
  }

  const adminEmail = process.env.ADMIN_EMAIL || process.env.NEXT_PUBLIC_ADMIN_EMAIL;
  if (adminEmail && user.email !== adminEmail) {
    return { authorized: false, error: 'Forbidden: Access restricted to admin email' };
  }

  return { authorized: true, user };
}

export async function GET(request: Request) {
  try {
    const auth = await verifyAdmin(request);
    if (!auth.authorized) {
      return NextResponse.json({ success: false, error: auth.error }, { status: 401 });
    }

    const { data, error } = await supabaseAdmin
      .from('config')
      .select('key, value');

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    const configs: Record<string, string> = {};
    if (data) {
      data.forEach(item => {
        configs[item.key] = item.value;
      });
    }

    return NextResponse.json({ success: true, configs });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const auth = await verifyAdmin(request);
    if (!auth.authorized) {
      return NextResponse.json({ success: false, error: auth.error }, { status: 401 });
    }

    const { configs } = await request.json();

    if (!configs || typeof configs !== 'object') {
      return NextResponse.json({ success: false, error: 'Invalid configs payload' }, { status: 400 });
    }

    // Upsert all keys sequentially/concurrently
    const upsertPromises = Object.entries(configs).map(([key, value]) => {
      return supabaseAdmin
        .from('config')
        .upsert({ 
          key, 
          value: String(value),
          updated_at: new Date().toISOString()
        });
    });

    const results = await Promise.all(upsertPromises);
    const failedResult = results.find(res => res.error);
    if (failedResult) {
      return NextResponse.json({ success: false, error: failedResult.error?.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
