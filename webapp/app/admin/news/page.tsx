'use client';
"use client";

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
