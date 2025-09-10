"use client";

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
