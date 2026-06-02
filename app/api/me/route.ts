import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

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
    if (!userId) return NextResponse.json({ role: null }, { status: 401 })

    const db = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SECRET_KEY!
    )

    const { data: profile } = await db
      .from('profiles').select('role').eq('id', userId).single()

    return NextResponse.json({ role: profile?.role ?? 'USER' })
  } catch {
    return NextResponse.json({ role: 'USER' })
  }
}
