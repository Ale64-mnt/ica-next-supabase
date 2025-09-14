import {NextRequest, NextResponse} from 'next/server';
import {createClient} from '@supabase/supabase-js';

export async function POST(req: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE!;
  const adminToken = process.env.ADMIN_TOKEN || '';

  if (!url || !key) {
    return NextResponse.json({ok: false, error: 'Missing env'}, {status: 500});
  }

  const clientToken = req.headers.get('x-admin-token') || '';
  if (adminToken && clientToken !== adminToken) {
    return NextResponse.json({ok: false, error: 'unauthorized'}, {status: 401});
  }

  const supabase = createClient(url, key);
  const {title, summary, body, cover_url, tags} = await req.json();

  if (!title?.trim() || !body?.trim()) {
    return NextResponse.json({ok: false, error: 'title/body required'}, {status: 400});
  }

  const {error} = await supabase.from('blog').insert({
    title,
    summary: summary || null,
    body,
    cover_url: cover_url || null,
    tags: Array.isArray(tags) ? tags : null
  });

  if (error) {
    return NextResponse.json({ok: false, error: error.message}, {status: 400});
  }

  return NextResponse.json({ok: true});
}
