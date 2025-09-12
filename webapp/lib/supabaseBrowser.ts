'use client';

import {createBrowserClient} from '@supabase/ssr';

let _client: ReturnType<typeof createBrowserClient> | null = null;

/** Ritorna un client Supabase lato browser (singleton) */
export function getSupabaseBrowser() {
  if (_client) return _client;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  if (!url || !anon) {
    throw new Error('Missing Supabase env: NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY');
  }
  _client = createBrowserClient(url, anon);
  return _client;
}

export default getSupabaseBrowser;
