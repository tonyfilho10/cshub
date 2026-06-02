import { createClient as createSupabaseClient } from '@supabase/supabase-js'

// Usa @supabase/supabase-js diretamente — compatível com todos os formatos de chave
export function createClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
