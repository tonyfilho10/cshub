'use server'

import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'

type Role = 'ADMIN' | 'USER'
export type ActionResult = { ok: true } | { ok: false; error: string }

// Cliente Supabase com a secret key — para queries de dados (bypassa RLS)
function getDb() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!
  )
}

// Chamada direta ao GoTrue (Auth Admin REST API)
// Funciona com sb_secret_ sem depender do SDK auth.admin
async function authAdmin(method: string, path: string, body?: object) {
  const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/admin${path}`
  const res = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
      'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.msg ?? data.message ?? `HTTP ${res.status}`)
  return data
}

async function assertAdmin(): Promise<string | null> {
  try {
    // Usa @supabase/ssr para obter o usuário — funciona com a nova chave ECC
    const supabase = await createClient()
    const { data: { user }, error: authErr } = await supabase.auth.getUser()
    if (authErr || !user) return 'Não autenticado.'

    // Usa sb_secret_ para verificar o role no banco (bypassa RLS)
    const db = getDb()
    const { data: profile, error: profileErr } = await db
      .from('profiles').select('role').eq('id', user.id).single()

    if (profileErr) return `Perfil não encontrado: ${profileErr.message}`
    if (profile?.role !== 'ADMIN') return 'Acesso negado.'
    return null
  } catch (e) {
    return `Erro: ${e instanceof Error ? e.message : String(e)}`
  }
}

export async function createUser(formData: FormData): Promise<ActionResult> {
  const err = await assertAdmin()
  if (err) return { ok: false, error: err }

  const email        = formData.get('email')         as string
  const name         = formData.get('name')          as string
  const password     = formData.get('password')      as string
  const role         = (formData.get('role') as Role) ?? 'USER'
  const departmentId = (formData.get('department_id') as string) || null

  try {
    const authUser = await authAdmin('POST', '/users', {
      email,
      password,
      email_confirm: true,
    })

    const db = getDb()
    const { error: profileError } = await db
      .from('profiles')
      .insert({ id: authUser.id, email, name, role, active: true, department_id: departmentId })

    if (profileError) return { ok: false, error: `Perfil: ${profileError.message}` }
    return { ok: true }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) }
  }
}

export async function updateUser(userId: string, data: { name?: string; email?: string; department_id?: string | null }): Promise<ActionResult> {
  const err = await assertAdmin()
  if (err) return { ok: false, error: err }

  try {
    const db = getDb()
    const { error } = await db.from('profiles').update(data).eq('id', userId)
    if (error) return { ok: false, error: error.message }

    if (data.email) {
      await authAdmin('PUT', `/users/${userId}`, { email: data.email })
    }
    return { ok: true }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) }
  }
}

export async function updateUserRole(userId: string, role: Role): Promise<ActionResult> {
  const err = await assertAdmin()
  if (err) return { ok: false, error: err }

  const db = getDb()
  const { error } = await db.from('profiles').update({ role }).eq('id', userId)
  if (error) return { ok: false, error: error.message }
  return { ok: true }
}

export async function toggleUserActive(userId: string, active: boolean): Promise<ActionResult> {
  const err = await assertAdmin()
  if (err) return { ok: false, error: err }

  try {
    const db = getDb()
    await db.from('profiles').update({ active }).eq('id', userId)
    await authAdmin('PUT', `/users/${userId}`, {
      ban_duration: active ? 'none' : '87600h',
    })
    return { ok: true }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) }
  }
}

export async function deleteUser(userId: string): Promise<ActionResult> {
  const err = await assertAdmin()
  if (err) return { ok: false, error: err }

  try {
    await authAdmin('DELETE', `/users/${userId}`)
    const db = getDb()
    await db.from('profiles').delete().eq('id', userId)
    return { ok: true }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) }
  }
}
