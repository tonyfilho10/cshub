import { createClient } from '@/lib/supabase/server'
import { createClient as createAdmin } from '@supabase/supabase-js'
import { redirect } from 'next/navigation'
import UsersClient from './UsersClient'
import { Profile, Role } from '@/lib/generated/prisma/client'

export const dynamic = 'force-dynamic'

async function getProfilesAsAdmin(userId: string) {
  const admin = createAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!
  )

  const { data: me } = await admin
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single()

  if (me?.role !== 'ADMIN') return null

  const { data: profiles } = await admin
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: true })

  return profiles as Profile[] | null
}

export default async function UsuariosPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const profiles = await getProfilesAsAdmin(user.id)
  if (!profiles) redirect('/dashboard')

  return <UsersClient profiles={profiles} currentUserId={user.id} />
}
