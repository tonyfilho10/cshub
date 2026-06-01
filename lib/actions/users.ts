'use server'

import { createClient as createSupabaseAdmin } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'

type Role = 'ADMIN' | 'USER'

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

  const admin = getAdminClient()
  const { data: profile, error } = await admin
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (error) throw new Error(`Erro ao verificar permissão: ${error.message}`)
  if (profile?.role !== 'ADMIN') throw new Error('Acesso negado.')
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

  if (error) throw new Error(`Erro ao criar auth: ${error.message}`)

  const { error: profileError } = await admin
    .from('profiles')
    .insert({ id: data.user.id, email, name, role, active: true })

  if (profileError) throw new Error(`Erro ao criar perfil: ${profileError.message}`)
}

export async function updateUser(userId: string, data: { name?: string; email?: string }) {
  await assertAdmin()
  const admin = getAdminClient()

  const { error } = await admin.from('profiles').update(data).eq('id', userId)
  if (error) throw new Error(error.message)

  if (data.email) {
    await admin.auth.admin.updateUserById(userId, { email: data.email })
  }
}

export async function updateUserRole(userId: string, role: Role) {
  await assertAdmin()
  const admin = getAdminClient()
  const { error } = await admin.from('profiles').update({ role }).eq('id', userId)
  if (error) throw new Error(error.message)
}

export async function toggleUserActive(userId: string, active: boolean) {
  await assertAdmin()
  const admin = getAdminClient()

  await admin.from('profiles').update({ active }).eq('id', userId)
  await admin.auth.admin.updateUserById(userId, {
    ban_duration: active ? 'none' : '87600h',
  })
}

export async function deleteUser(userId: string) {
  await assertAdmin()
  const admin = getAdminClient()

  await admin.auth.admin.deleteUser(userId)
  await admin.from('profiles').delete().eq('id', userId)
}
