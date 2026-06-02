import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

import { createClient } from '@supabase/supabase-js'

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
)

async function main() {
  const { data: dept } = await sb
    .from('departments').select('id').eq('slug', 'fiscal').single()

  if (!dept) { console.error('Departamento fiscal não encontrado'); process.exit(1) }

  const { error } = await sb.from('tools').insert({
    department_id: dept.id,
    name: 'Cúmplice',
    description: 'Sistema de inteligência contábil para acompanhar e gerenciar as demandas fiscais do escritório.',
    url: 'https://kdm-cumplice.netlify.app/login',
    icon: '🧠',
    active: true,
    user_count: 0,
  })

  if (error) { console.error(error.message); process.exit(1) }
  console.log('✓ Cúmplice adicionado ao departamento Fiscal.')
}

main()
