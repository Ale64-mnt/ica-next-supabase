# Tools/fix_admin_structure.py
# Crea la struttura /app/admin e le pagine base per gestire le News

from pathlib import Path

ROOT = Path(__file__).resolve().parents[1] / "webapp" / "app"

files = {
    # /app/admin/page.tsx (dashboard)
    ROOT / "admin" / "page.tsx": r'''"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function AdminHome() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  if (!user) {
    return (
      <div style={{ padding: 24 }}>
        <h1>Area Amministrazione</h1>
        <p>Non sei autenticato.</p>
        <Link href="/login" className="underline text-blue-600">Vai al login</Link>
      </div>
    );
  }

  return (
    <div style={{ padding: 24 }}>
      <h1>Area Amministrazione</h1>
      <p>Benvenuto, {user.email}</p>

      <ul style={{ marginTop: 16, lineHeight: 1.9 }}>
        <li><Link className="underline text-blue-600" href="/admin/news">Gestione News</Link></li>
      </ul>
    </div>
  );
}
''',

    # /app/admin/news/page.tsx (lista news)
    ROOT / "admin" / "news" / "page.tsx": r'''"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

type News = {
  id: string;
  title: string;
  source?: string | null;
  published_at?: string | null;
  created_at?: string;
};

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function AdminNewsList() {
  const [items, setItems] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("news")
        .select("id,title,source,published_at,created_at")
        .order("published_at", { ascending: false })
        .limit(100);
      if (!error && data) setItems(data as News[]);
      setLoading(false);
    };
    load();
  }, []);

  return (
    <div style={{ padding: 24 }}>
      <h1>News</h1>
      <div style={{ marginBottom: 16 }}>
        <Link className="underline text-blue-600" href="/admin/news/new">
          + Nuova News
        </Link>
      </div>

      {loading && <p>Caricamento…</p>}

      {!loading && items.length === 0 && <p>Nessuna news.</p>}

      <ul style={{ lineHeight: 1.9 }}>
        {items.map(n => (
          <li key={n.id}>
            <Link className="underline text-blue-600" href={`/admin/news/${n.id}`}>
              {n.title}
            </Link>
            {n.source ? <> — <em>{n.source}</em></> : null}
          </li>
        ))}
      </ul>
    </div>
  );
}
''',

    # /app/admin/news/new/page.tsx (creazione)
    ROOT / "admin" / "news" / "new" / "page.tsx": r'''"use client";

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
''',

    # /app/admin/news/[id]/page.tsx (view/edit semplice)
    ROOT / "admin" / "news" / "[id]" / "page.tsx": r'''"use client";

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
'''
}

def main():
    created = []
    for path, content in files.items():
        path.parent.mkdir(parents=True, exist_ok=True)
        if not path.exists():
            path.write_text(content, encoding="utf-8")
            created.append(str(path.relative_to(ROOT.parents[0])))
        else:
            # sovrascrive sempre per allinearci
            path.write_text(content, encoding="utf-8")
            created.append(str(path.relative_to(ROOT.parents[0])) + " (aggiornato)")
    print("✅ Creati/aggiornati file:")
    for p in created:
        print("   -", p)

if __name__ == "__main__":
    main()
