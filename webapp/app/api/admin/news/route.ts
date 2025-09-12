import {NextResponse} from 'next/server';
import {createClient} from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const service = process.env.SUPABASE_SERVICE_ROLE!;
const adminToken = process.env.ADMIN_TOKEN || '';

export async function POST(req: Request) {
  // check header con token semplice
  const h = req.headers.get('x-admin-token') || '';
  if (adminToken && h !== adminToken) {
    return NextResponse.json({ok:false, error:'unauthorized'}, {status:401});
  }

  if (!url || !service) {
    return NextResponse.json({ok:false, error:'missing server env'}, {status:500});
  }

  const body = await req.json().catch(() => ({}));
  const {title, summary} = body || {};
  if (!title?.trim()) {
    return NextResponse.json({ok:false, error:'title required'}, {status:400});
  }

  const supabase = createClient(url, service);
  const {error} = await supabase.from('news').insert({title, summary});
  if (error) {
    return NextResponse.json({ok:false, error: error.message}, {status:400});
  }
  return NextResponse.json({ok:true});
}
