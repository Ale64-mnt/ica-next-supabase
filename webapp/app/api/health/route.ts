import {NextResponse} from "next/server";

export async function GET() {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) {
      return NextResponse.json({ok:false, urlOk: !!url, keyOk: !!key, fatal: "Missing env"}, {status: 500});
    }

    const r = await fetch(`${url}/rest/v1/news?select=id&limit=1`, {
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`
      },
      cache: "no-store"
    });

    const info: any = { urlOk: true, keyOk: true, restStatus: r.status };
    if (!r.ok) {
      info.ok = false;
      info.error = await r.text();
      return NextResponse.json(info, { status: r.status });
    }

    const data = await r.json();
    info.ok = true;
    info.rows = Array.isArray(data) ? data.length : 0;
    return NextResponse.json(info);
  } catch (e: any) {
    return NextResponse.json({ ok: false, fatal: e?.message ?? String(e) }, { status: 500 });
  }
}