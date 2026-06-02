import { createClient as createAdmin } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

function getUserIdFromCookies(req: NextRequest): string | null {
  try {
    const cookies = req.cookies.getAll()
    const tokenCookie = cookies.find(c => c.name.includes('auth-token') && !c.name.includes('code'))
    if (!tokenCookie) return null
    const payload = tokenCookie.value.split('.')[1]
    if (!payload) return null
    const decoded = JSON.parse(Buffer.from(payload.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString())
    return decoded.sub ?? null
  } catch { return null }
}

export async function GET(req: NextRequest) {
  try {
    const userId = getUserIdFromCookies(req)
    if (!userId) return NextResponse.json({ role: null }, { status: 401 })

    const sb = createAdmin(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data: profile } = await sb
      .from('profiles').select('role').eq('id', userId).single()

    return NextResponse.json({ role: profile?.role ?? 'USER' })
  } catch {
    return NextResponse.json({ role: 'USER' })
  }
}
