'use server'

import { createClient as createSupabaseAdmin } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient, Role } from '@/lib/generated/prisma/client'
import { revalidatePath } from 'next/cache'

function getPrisma() {
  const connectionString = process.env.DIRECT_URL ?? process.env.DATABASE_URL
  const pool = new Pool({ connectionString })
  const adapter = new PrismaPg(pool)
  return new PrismaClient({ adapter })
}

function getAdminClient() {
  return createSupabaseAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!
  )
}

async function assertAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Não autenticado.')

  const prisma = getPrisma()
  const profile = await prisma.profile.findUnique({ where: { id: user.id } })
  await prisma.$disconnect()

  if (profile?.role !== 'ADMIN') throw new Error('Acesso negado.')
}

export async function getUsers() {
  await assertAdmin()
  const prisma = getPrisma()
  const profiles = await prisma.profile.findMany({ orderBy: { createdAt: 'asc' } })
  await prisma.$disconnect()
  return profiles
}

export async function createUser(formData: FormData) {
  await assertAdmin()

  const email = formData.get('email') as string
  const name = formData.get('name') as string
  const password = formData.get('password') as string
  const role = (formData.get('role') as Role) ?? 'USER'

  const admin = getAdminClient()
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })

  if (error) throw new Error(error.message)

  const prisma = getPrisma()
  await prisma.profile.create({
    data: { id: data.user.id, email, name, role, active: true },
  })
  await prisma.$disconnect()

  revalidatePath('/dashboard/usuarios')
}

export async function updateUserRole(userId: string, role: Role) {
  await assertAdmin()
  const prisma = getPrisma()
  await prisma.profile.update({ where: { id: userId }, data: { role } })
  await prisma.$disconnect()
  revalidatePath('/dashboard/usuarios')
}

export async function updateUser(userId: string, data: { name?: string; email?: string }) {
  await assertAdmin()
  const prisma = getPrisma()
  await prisma.profile.update({ where: { id: userId }, data })
  await prisma.$disconnect()

  if (data.email) {
    const admin = getAdminClient()
    await admin.auth.admin.updateUserById(userId, { email: data.email })
  }

  revalidatePath('/dashboard/usuarios')
}

export async function deleteUser(userId: string) {
  await assertAdmin()

  const admin = getAdminClient()
  await admin.auth.admin.deleteUser(userId)

  const prisma = getPrisma()
  await prisma.profile.delete({ where: { id: userId } })
  await prisma.$disconnect()

  revalidatePath('/dashboard/usuarios')
}

export async function toggleUserActive(userId: string, active: boolean) {
  await assertAdmin()
  const prisma = getPrisma()
  await prisma.profile.update({ where: { id: userId }, data: { active } })
  await prisma.$disconnect()

  const admin = getAdminClient()
  if (active) {
    await admin.auth.admin.updateUserById(userId, { ban_duration: 'none' })
  } else {
    await admin.auth.admin.updateUserById(userId, { ban_duration: '87600h' })
  }

  revalidatePath('/dashboard/usuarios')
}
