import { createClient } from '@/lib/supabase/server'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@/lib/generated/prisma/client'
import { redirect } from 'next/navigation'
import UsersClient from './UsersClient'

export const dynamic = 'force-dynamic'

async function getProfilesAsAdmin(userId: string) {
  const pool = new Pool({ connectionString: process.env.DIRECT_URL })
  const adapter = new PrismaPg(pool)
  const prisma = new PrismaClient({ adapter })

  const me = await prisma.profile.findUnique({ where: { id: userId } })
  if (me?.role !== 'ADMIN') {
    await prisma.$disconnect()
    return null
  }

  const profiles = await prisma.profile.findMany({ orderBy: { createdAt: 'asc' } })
  await prisma.$disconnect()
  return { profiles, me }
}

export default async function UsuariosPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const result = await getProfilesAsAdmin(user.id)
  if (!result) redirect('/dashboard')

  return <UsersClient profiles={result.profiles} currentUserId={user.id} />
}
