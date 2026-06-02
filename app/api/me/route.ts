import { createServerClient } from '@supabase/ssr'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // Lê os cookies da requisição
    const cookieStore = await cookies()

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => cookieStore.getAll(),
          setAll: () => {},
        },
      }
    )

    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ role: null }, { status: 401 })
    }

    // Usa service role para buscar o perfil sem restrições de RLS
    const db = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SECRET_KEY!
    )

    const { data: profile, error: dbError } = await db
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (dbError) {
      return NextResponse.json({ role: 'USER', debug: dbError.message })
    }

    return NextResponse.json({ role: profile?.role ?? 'USER' })
  } catch (e: unknown) {
    return NextResponse.json({ role: 'USER', debug: String(e) })
  }
}
