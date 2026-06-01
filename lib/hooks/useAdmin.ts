'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useAdmin() {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null)

  useEffect(() => {
    async function check() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setIsAdmin(false); return }

      const res = await fetch(`/api/me`)
      const data = await res.json()
      setIsAdmin(data.role === 'ADMIN')
    }
    check()
  }, [])

  return isAdmin
}
