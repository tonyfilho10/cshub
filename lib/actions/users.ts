'use server'

import { createClient as createSupabaseAdmin } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'

type Role = 'ADMIN' | 'USER'
export type ActionResult = { ok: true } | { ok: false; error: string }

// sb_secret_ → acesso ao banco (Data API)
function getAdminClient() {
  return createSupabaseAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!
  )
}

// eyJ... service_role JWT → auth.admin operations
function getAuthAdminClient() {
  return createSupabaseAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

async function getAdminOrError(): Promise<{ admin: ReturnType<typeof getAdminClient> } | { ok: false; error: string }> {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError) return { ok: false, error: `Auth error: ${authError.message}` }
    if (!user) return { ok: false, error: 'Não autenticado.' }

    const admin = getAdminClient()
    const { data: profile, error } = await admin
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (error) return { ok: false, error: `Permissão: ${error.message} (code: ${error.code})` }
    if (!profile) return { ok: false, error: 'Perfil não encontrado. Execute o script setup-admin.' }
    if (profile.role !== 'ADMIN') return { ok: false, error: 'Acesso negado: você não é ADMIN.' }

    return { admin }
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e)
    return { ok: false, error: `Exceção: ${msg}` }
  }
}

export async function createUser(formData: FormData): Promise<ActionResult> {
  const auth = await getAdminOrError()
  if ('ok' in auth) return auth

  const email    = formData.get('email')    as string
  const name     = formData.get('name')     as string
  const password = formData.get('password') as string
  const role     = (formData.get('role') as Role) ?? 'USER'

  const authAdmin = getAuthAdminClient()
  const { data, error } = await authAdmin.auth.admin.createUser({
    email, password, email_confirm: true,
  })
  if (error) return { ok: false, error: `Erro ao criar usuário: ${error.message}` }

  const { error: profileError } = await auth.admin
    .from('profiles')
    .insert({ id: data.user.id, email, name, role, active: true })

  if (profileError) return { ok: false, error: `Erro ao criar perfil: ${profileError.message}` }

  return { ok: true }
}

export async function updateUser(userId: string, data: { name?: string; email?: string }): Promise<ActionResult> {
  const auth = await getAdminOrError()
  if ('ok' in auth) return auth

  const { error } = await auth.admin.from('profiles').update(data).eq('id', userId)
  if (error) return { ok: false, error: error.message }

  if (data.email) {
    const authAdmin = getAuthAdminClient()
    const { error: authError } = await authAdmin.auth.admin.updateUserById(userId, { email: data.email })
    if (authError) return { ok: false, error: authError.message }
  }

  return { ok: true }
}

export async function updateUserRole(userId: string, role: Role): Promise<ActionResult> {
  const auth = await getAdminOrError()
  if ('ok' in auth) return auth

  const { error } = await auth.admin.from('profiles').update({ role }).eq('id', userId)
  if (error) return { ok: false, error: error.message }

  return { ok: true }
}

export async function toggleUserActive(userId: string, active: boolean): Promise<ActionResult> {
  const auth = await getAdminOrError()
  if ('ok' in auth) return auth

  await auth.admin.from('profiles').update({ active }).eq('id', userId)

  const authAdmin = getAuthAdminClient()
  await authAdmin.auth.admin.updateUserById(userId, {
    ban_duration: active ? 'none' : '87600h',
  })

  return { ok: true }
}

export async function deleteUser(userId: string): Promise<ActionResult> {
  const auth = await getAdminOrError()
  if ('ok' in auth) return auth

  const authAdmin = getAuthAdminClient()
  await authAdmin.auth.admin.deleteUser(userId)
  await auth.admin.from('profiles').delete().eq('id', userId)

  return { ok: true }
}
