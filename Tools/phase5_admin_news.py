# Tools/phase5_admin_news.py
from pathlib import Path

root = Path(__file__).resolve().parents[1]  # cartella progetto
webapp = root / "webapp"

files = {
    # Pagina admin
    webapp / "app/[locale]/admin/news/page.tsx": """\
import AdminNewsForm from "@/components/AdminNewsForm";

export default function AdminNewsPage() {
  return (
    <main style={{padding: "2rem"}}>
      <h1>Admin – Gestione News</h1>
      <AdminNewsForm />
    </main>
  );
}
""",

    # Component form
    webapp / "components/AdminNewsForm.tsx": """\
"use client";

import { useState, useEffect } from "react";
import { getSupabaseBrowser } from "@/lib/supabaseBrowser";

export default function AdminNewsForm() {
  const supabase = getSupabaseBrowser();
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [content, setContent] = useState("");
  const [news, setNews] = useState<any[]>([]);

  async function loadNews() {
    const { data, error } = await supabase
      .from("news")
      .select("id, title, summary")
      .order("id", { ascending: false });
    if (!error) setNews(data || []);
  }

  async function saveNews() {
    const { error } = await supabase.from("news").insert({
      title,
      summary,
      content,
      created_at: new Date().toISOString()
    });
    if (error) {
      alert("Errore: " + error.message);
    } else {
      setTitle("");
      setSummary("");
      setContent("");
      await loadNews();
    }
  }

  useEffect(() => {
    loadNews();
  }, []);

  return (
    <div>
      <h2>Nuova News</h2>
      <input
        placeholder="Titolo"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <input
        placeholder="Sommario"
        value={summary}
        onChange={(e) => setSummary(e.target.value)}
      />
      <textarea
        placeholder="Contenuto"
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />
      <button onClick={saveNews}>Salva</button>

      <h2>Lista News</h2>
      <ul>
        {news.map((n) => (
          <li key={n.id}>
            <b>{n.title}</b> – {n.summary}
          </li>
        ))}
      </ul>
    </div>
  );
}
"""
}

for path, content in files.items():
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(content, encoding="utf-8")
    print(f"[OK] scritto {path}")
