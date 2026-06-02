import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

function getDb() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!
  )
}

function getUserIdFromCookies(req: NextRequest): string | null {
  try {
    const token = req.cookies.getAll().find(
      c => c.name.includes('auth-token') && !c.name.includes('code')
    )
    if (!token) return null
    const payload = token.value.split('.')[1]
    if (!payload) return null
    const decoded = JSON.parse(
      Buffer.from(payload.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString()
    )
    return decoded.sub ?? null
  } catch { return null }
}

export async function GET(req: NextRequest) {
  try {
    const userId = getUserIdFromCookies(req)
    if (!userId) return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 })

    const db = getDb()

    const { data: me, error: meErr } = await db
      .from('profiles').select('role').eq('id', userId).single()

    if (meErr) return NextResponse.json({ error: `DB: ${meErr.message}` }, { status: 500 })
    if (me?.role !== 'ADMIN') return NextResponse.json({ error: 'Acesso negado.' }, { status: 403 })

    const { data: profiles, error } = await db
      .from('profiles').select('*').order('created_at', { ascending: true })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ profiles, currentUserId: userId })
  } catch (e: unknown) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : String(e) },
      { status: 500 }
    )
  }
}
