// middleware-auth.ts - Aggiornato per @supabase/ssr
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  
  // Solo per le API di education
  if (req.nextUrl.pathname.startsWith('/api/education')) {
    try {
      // Crea client Supabase per middleware
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            getAll() {
              return req.cookies.getAll()
            },
            setAll(cookiesToSet) {
              cookiesToSet.forEach(({ name, value, options }) => {
                res.cookies.set(name, value, options)
              })
            },
          },
        }
      )
      
      const { data: { session } } = await supabase.auth.getSession()
      
      // Log per debugging
      console.log(`[Middleware Auth] API: ${req.nextUrl.pathname}`)
      console.log(`[Middleware Auth] Sessione:`, session ? 'Presente' : 'Assente')
      
      // Puoi aggiungere logica di autorizzazione qui
      // Per ora solo logging, senza bloccare
      
    } catch (error) {
      console.error('[Middleware Auth] Errore:', error)
    }
  }
  
  return res
}

export const config = {
  matcher: ['/api/education/:path*']
}