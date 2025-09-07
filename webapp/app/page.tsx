import Link from "next/link";

export default function Home() {
  return (
    <main style={{ padding: 24 }}>
      <h1>Benvenuto 👋</h1>
      <p>Skeleton Next.js + Supabase pronto.</p>
      <ul>
        <li>Modifica <code>app/page.tsx</code></li>
        <li>Configura le variabili in <code>.env.local</code></li>
      </ul>
      <p>
        <Link href="https://supabase.com/docs">Docs Supabase</Link>
        {" · "}
        <Link href="https://nextjs.org/docs">Docs Next.js</Link>
      </p>
    </main>
  );
}
