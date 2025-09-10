"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function NewNews() {
  const r = useRouter();
  const [title, setTitle] = useState("");
  const [source, setSource] = useState("");
  const [summary, setSummary] = useState("");
  const [publishedAt, setPublishedAt] = useState<string>("");

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data, error } = await supabase
      .from("news")
      .insert([{
        title,
        source: source || null,
        summary: summary || null,
        published_at: publishedAt || null
      }])
      .select("id")
      .single();
    if (error) {
      alert("Errore: " + error.message);
      return;
    }
    r.push("/admin/news/" + data!.id);
  };

  return (
    <div style={{ padding: 24, maxWidth: 720 }}>
      <h1>Nuova News</h1>
      <form onSubmit={onSave} style={{ display: "grid", gap: 12 }}>
        <label>
          Titolo<br/>
          <input className="border p-2 w-full" value={title} onChange={e => setTitle(e.target.value)} required />
        </label>
        <label>
          Fonte (es. Bank of England)<br/>
          <input className="border p-2 w-full" value={source} onChange={e => setSource(e.target.value)} />
        </label>
        <label>
          Data pubblicazione (YYYY-MM-DD)<br/>
          <input className="border p-2 w-full" value={publishedAt} onChange={e => setPublishedAt(e.target.value)} placeholder="2025-01-17" />
        </label>
        <label>
          Sintesi<br/>
          <textarea className="border p-2 w-full" rows={6} value={summary} onChange={e => setSummary(e.target.value)} />
        </label>

        <div style={{ display: "flex", gap: 8 }}>
          <button className="border px-4 py-2" type="submit">Salva</button>
          <button className="border px-4 py-2" type="button" onClick={() => r.back()}>Annulla</button>
        </div>
      </form>
    </div>
  );
}
