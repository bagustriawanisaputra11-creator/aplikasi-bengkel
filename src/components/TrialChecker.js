'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter, usePathname } from 'next/navigation'

export default function TrialChecker() {
  const router = useRouter()
  const path = usePathname()
  const [hari, setHari] = useState(-1)

  useEffect(() => {
    if (path === '/login' || path === '/register' || path === '/trial-expired') return

    ;(async () => {
      const s = createClient()
      const { data: { session } } = await s.auth.getSession()
      if (!session) return

      const { data: tenant } = await s.from('tenants').select('trial_ends_at, is_active').eq('email', session.user.email).single()
      if (!tenant) return

      if (tenant.trial_ends_at) {
        const sisa = Math.ceil((new Date(tenant.trial_ends_at) - new Date()) / (1000 * 60 * 60 * 24))
        setHari(Math.max(0, sisa))
        if (sisa <= 0 || tenant.is_active === false) {
          router.push('/trial-expired')
        }
      }
    })()
  }, [path])

  if (path === '/login' || path === '/register' || path === '/trial-expired') return null

  if (hari > 0 && hari <= 3) {
    return (
      <div className="fixed top-0 left-0 right-0 z-50 bg-amber-500 text-white text-center py-2 text-sm font-medium">
        ⏳ Trial tersisa {hari} hari lagi. Segera aktivasi!
      </div>
    )
  }

  return null
}
