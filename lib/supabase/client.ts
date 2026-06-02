import { createBrowserClient } from '@supabase/ssr'

// createBrowserClient gerencia cookies corretamente no Next.js
// Necessário para que as API routes server-side consigam ler a sessão
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
