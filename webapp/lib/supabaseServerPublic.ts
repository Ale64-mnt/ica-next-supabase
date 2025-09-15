import { createClient } from "@supabase/supabase-js";

let supabase: ReturnType<typeof createClient> | null = null;

export function getSupabasePublicServer() {
  if (supabase) return supabase;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!; // solo lettura pubblica
  supabase = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return supabase;
}
