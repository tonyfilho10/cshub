import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

import { createClient } from '@supabase/supabase-js'

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
)

async function main() {
  // Habilita RLS e cria políticas para profiles
  const queries = [
    `alter table profiles enable row level security;`,
    `drop policy if exists "Service role full access on profiles" on profiles;`,
    `create policy "Service role full access on profiles"
       on profiles for all
       to service_role
       using (true) with check (true);`,
    `drop policy if exists "Users read own profile" on profiles;`,
    `create policy "Users read own profile"
       on profiles for select
       to authenticated
       using (auth.uid() = id);`,
  ]

  for (const sql of queries) {
    const { error } = await sb.rpc('exec_sql', { sql }).single()
    if (error) {
      // rpc não disponível — tentar via REST direto
      console.log(`SQL pendente (execute no SQL Editor do Supabase):\n${sql}\n`)
    } else {
      console.log('✓ Executado:', sql.slice(0, 60))
    }
  }

  console.log('\nSe houver SQLs pendentes, execute-os no Supabase SQL Editor.')
}

main()
