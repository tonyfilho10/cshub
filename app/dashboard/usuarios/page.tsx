import { createClient } from '@/lib/supabase/server'
import { createClient as createAdmin } from '@supabase/supabase-js'
import { redirect } from 'next/navigation'
import UsersClient from './UsersClient'
import { Profile } from '@/lib/generated/prisma/client'

export const dynamic = 'force-dynamic'

type FetchResult =
  | { ok: true; profiles: Profile[]; userId: string }
  | { ok: false; error: string }

async function fetchData(): Promise<FetchResult> {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError) return { ok: false, error: `Auth: ${authError.message}` }
    if (!user) return { ok: false, error: 'redirect:/login' }

    const admin = createAdmin(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SECRET_KEY!
    )

    const { data: me, error: meError } = await admin
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (meError) return { ok: false, error: `Perfil: ${meError.message} (${meError.code})` }
    if (!me) return { ok: false, error: 'Perfil não encontrado. Execute setup-admin.' }
    if (me.role !== 'ADMIN') return { ok: false, error: 'redirect:/dashboard' }

    const { data: profiles, error: listError } = await admin
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: true })

    if (listError) return { ok: false, error: `Lista: ${listError.message}` }

    return { ok: true, profiles: (profiles ?? []) as Profile[], userId: user.id }
  } catch (e: unknown) {
    return { ok: false, error: `Exceção: ${e instanceof Error ? e.message : String(e)}` }
  }
}

export default async function UsuariosPage() {
  const result = await fetchData()

  if (!result.ok) {
    if (result.error === 'redirect:/login') redirect('/login')
    if (result.error === 'redirect:/dashboard') redirect('/dashboard')

    return (
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground">Gestão de Usuários</h2>
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4">
          <p className="text-sm font-medium text-red-500">Erro ao carregar usuários</p>
          <p className="text-xs text-red-400 mt-1 font-mono">{result.error}</p>
          <p className="text-xs text-muted-foreground mt-3">
            Se o erro mencionar RLS ou permissão, execute o SQL em{' '}
            <code className="text-xs">supabase/rls-profiles.sql</code> no SQL Editor do Supabase.
          </p>
        </div>
      </div>
    )
  }

  return <UsersClient profiles={result.profiles} currentUserId={result.userId} />
}
