"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function EditNews() {
  const { id } = useParams<{ id: string }>();
  const r = useRouter();
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [source, setSource] = useState("");
  const [summary, setSummary] = useState("");
  const [publishedAt, setPublishedAt] = useState<string>("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("news")
        .select("*")
        .eq("id", id)
        .single();
      if (error) {
        alert("Errore: " + error.message);
        r.push("/admin/news");
        return;
      }
      setTitle(data.title ?? "");
      setSource(data.source ?? "");
      setSummary(data.summary ?? "");
      setPublishedAt(data.published_at ?? "");
      setLoading(false);
    };
    if (id) load();
  }, [id, r]);

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase
      .from("news")
      .update({
        title,
        source: source || null,
        summary: summary || null,
        published_at: publishedAt || null,
      })
      .eq("id", id);
    if (error) {
      alert("Errore: " + error.message);
      return;
    }
    alert("Salvato!");
  };

  const onDelete = async () => {
    if (!confirm("Confermi l'eliminazione?")) return;
    const { error } = await supabase.from("news").delete().eq("id", id);
    if (error) {
      alert("Errore: " + error.message);
      return;
    }
    r.push("/admin/news");
  };

  if (loading) return <div style={{ padding: 24 }}>Caricamento…</div>;

  return (
    <div style={{ padding: 24, maxWidth: 720 }}>
      <h1>Modifica News</h1>
      <form onSubmit={onSave} style={{ display: "grid", gap: 12 }}>
        <label>
          Titolo<br/>
          <input className="border p-2 w-full" value={title} onChange={e => setTitle(e.target.value)} required />
        </label>
        <label>
          Fonte<br/>
          <input className="border p-2 w-full" value={source} onChange={e => setSource(e.target.value)} />
        </label>
        <label>
          Data pubblicazione (YYYY-MM-DD)<br/>
          <input className="border p-2 w-full" value={publishedAt} onChange={e => setPublishedAt(e.target.value)} />
        </label>
        <label>
          Sintesi<br/>
          <textarea className="border p-2 w-full" rows={6} value={summary} onChange={e => setSummary(e.target.value)} />
        </label>

        <div style={{ display: "flex", gap: 8 }}>
          <button className="border px-4 py-2" type="submit">Salva</button>
          <button className="border px-4 py-2" type="button" onClick={onDelete}>Elimina</button>
        </div>
      </form>
    </div>
  );
}
