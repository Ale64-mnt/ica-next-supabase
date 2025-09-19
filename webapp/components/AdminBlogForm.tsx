'use client';
import { supabaseBrowser() } from '@/lib/supabaseBrowser()';
"use client";

import { useEffect, useMemo, useState } from "react";

type Article = {
  id: string;
  title: string;
  excerpt: string | null;
  cover_url: string | null;
  slug: string;
  published_at: string | null;
};

function slugify(raw: string): string {
  return raw
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export default function AdminBlogForm() {
  const supabase = getSupabaseBrowser();

  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [cover, setCover] = useState<File | null>(null);
  const [slug, setSlug] = useState("");
  const [posts, setPosts] = useState<Article[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const effectiveSlug = useMemo(() => slug || slugify(title), [slug, title]);

  async function loadPosts() {
    setError(null);
    try {
      const res = await fetch("/api/admin/blog");
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Errore caricamento lista");
      setPosts(json.items ?? []);
    } catch (e: any) {
      setError(e?.message ?? "Errore inatteso");
    }
  }

  useEffect(() => {
    loadPosts();
  }, []);

  async function uploadCover(file: File): Promise<string> {
    const ext = file.name.split(".").pop() || "jpg";
    const path = `blog/${Date.now()}.${ext}`;
    const { data, error } = await supabase.storage
      .from("images")
      .upload(path, file, { upsert: false });
    if (error) throw new Error(error.message);

    const { data: pub } = supabase.storage.from("images").getPublicUrl(path);
    return pub.publicUrl;
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      let cover_url: string | undefined = undefined;
      if (cover) cover_url = await uploadCover(cover);

      const res = await fetch("/api/admin/blog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          excerpt,
          cover_url,
          slug: effectiveSlug,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Errore salvataggio");

      setTitle("");
      setExcerpt("");
      setCover(null);
      setSlug("");

      await loadPosts();
    } catch (e: any) {
      setError(e?.message ?? "Errore inatteso");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Eliminare questo post?")) return;
    try {
      const res = await fetch(`/api/admin/blog/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Errore eliminazione");
      await loadPosts();
    } catch (e: any) {
      setError(e?.message ?? "Errore inatteso");
    }
  }

  async function handleInlineEdit(p: Article) {
    const newTitle = prompt("Titolo", p.title) ?? p.title;
    const newExcerpt = prompt("Estratto", p.excerpt ?? "") ?? p.excerpt ?? "";
    const newSlug = prompt("Slug", p.slug) ?? p.slug;

    try {
      const res = await fetch(`/api/admin/blog/${p.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle,
          excerpt: newExcerpt,
          slug: newSlug,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Errore aggiornamento");
      await loadPosts();
    } catch (e: any) {
      setError(e?.message ?? "Errore inatteso");
    }
  }

  return (
    <div className="space-y-8">
      <form onSubmit={handleCreate} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Titolo</label>
          <input
            className="mt-1 w-full rounded border p-2"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Estratto</label>
          <textarea
            className="mt-1 w-full rounded border p-2"
            rows={3}
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Slug (opzionale)</label>
          <input
            className="mt-1 w-full rounded border p-2"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
          />
          <p className="text-xs text-gray-500 mt-1">
            Slug effettivo: <code>{effectiveSlug || "—"}</code>
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium">Cover</label>
          <input
            type="file"
            accept="image/*"
            className="mt-1"
            onChange={(e) => setCover(e.target.files?.[0] ?? null)}
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={saving}
          className="rounded bg-black text-white px-4 py-2 disabled:opacity-50"
        >
          {saving ? "Salvataggio..." : "Salva"}
        </button>
      </form>

      <div>
        <h3 className="text-lg font-semibold mb-3">Ultimi post</h3>
        <ul className="space-y-3">
          {posts.map((p) => (
            <li key={p.id} className="border rounded p-3 flex items-start gap-3">
              {p.cover_url ? (
                <img
                  src={p.cover_url}
                  alt={p.title}
                  className="w-20 h-20 object-cover rounded"
                />
              ) : (
                <div className="w-20 h-20 bg-gray-100 rounded" />
              )}
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">{p.title}</h4>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleInlineEdit(p)}
                      className="text-xs rounded border px-2 py-1"
                    >
                      Modifica
                    </button>
                    <button
                      onClick={() => handleDelete(p.id)}
                      className="text-xs rounded border px-2 py-1 text-red-600 border-red-600"
                    >
                      Elimina
                    </button>
                  </div>
                </div>
                <p className="text-sm text-gray-600 line-clamp-2">{p.excerpt}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {p.slug} •{" "}
                  {p.published_at
                    ? new Date(p.published_at).toLocaleString()
                    : "—"}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}