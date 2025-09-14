import { NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseService } from "@/lib/supabaseServer";

const CreateSchema = z.object({
  title: z.string().min(1),
  excerpt: z.string().min(1),
  cover_url: z.string().url().optional().nullable(),
  slug: z.string().min(1),
});

export async function GET() {
  const supa = getSupabaseService();
  const { data, error } = await supa
    .from("articles")
    .select("id,title,excerpt,cover_url,slug,published_at")
    .order("published_at", { ascending: false })
    .limit(50);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ items: data ?? [] });
}

export async function POST(req: Request) {
  try {
    const payload = await req.json();
    const parsed = CreateSchema.parse(payload);

    const supa = getSupabaseService();

    const { data: exists, error: exErr } = await supa
      .from("articles")
      .select("id")
      .eq("slug", parsed.slug)
      .limit(1);
    if (exErr) return NextResponse.json({ error: exErr.message }, { status: 500 });
    if (exists && exists.length > 0) {
      return NextResponse.json({ error: "Slug già esistente" }, { status: 409 });
    }

    const { data, error } = await supa
      .from("articles")
      .insert({
        title: parsed.title,
        excerpt: parsed.excerpt,
        cover_url: parsed.cover_url ?? null,
        slug: parsed.slug,
        published_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ item: data }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Invalid request" }, { status: 400 });
  }
}
