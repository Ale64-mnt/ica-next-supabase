import { NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseService } from "@/lib/supabaseServer";

const UpdateSchema = z.object({
  title: z.string().min(1).optional(),
  excerpt: z.string().min(1).optional(),
  cover_url: z.string().url().nullable().optional(),
  slug: z.string().min(1).optional(),
});

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const payload = await req.json();
    const parsed = UpdateSchema.parse(payload);

    const supa = getSupabaseService();

    if (parsed.slug) {
      const { data: dup, error: dupErr } = await supa
        .from("articles")
        .select("id")
        .eq("slug", parsed.slug)
        .neq("id", params.id)
        .limit(1);
      if (dupErr) return NextResponse.json({ error: dupErr.message }, { status: 500 });
      if (dup && dup.length > 0) {
        return NextResponse.json({ error: "Slug già esistente" }, { status: 409 });
      }
    }

    const { data, error } = await supa
      .from("articles")
      .update(parsed)
      .eq("id", params.id)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ item: data });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Invalid request" }, { status: 400 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const supa = getSupabaseService();
  const { error } = await supa.from("articles").delete().eq("id", params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
