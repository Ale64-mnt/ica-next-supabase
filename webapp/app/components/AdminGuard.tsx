'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import Link from 'next/link'

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true)
  const [session, setSession] = useState<any>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setLoading(false)
    })
  }, [])

  if (loading) return <p>Verifica sessione…</p>
  if (!session) return <p>Non sei autenticato. <Link href="/admin/login" style={{color:'#2563eb'}}>Accedi</Link></p>
  return <>{children}</>
}
