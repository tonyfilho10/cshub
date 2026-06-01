import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

import { createClient } from '@supabase/supabase-js'

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
)

async function main() {
  const { data: departments, error } = await sb
    .from('departments')
    .select('id, name')
    .order('order', { ascending: true })

  if (error || !departments) {
    console.error('Erro ao buscar departamentos:', error?.message)
    process.exit(1)
  }

  for (const dept of departments) {
    const { error: insertError } = await sb.from('tools').insert({
      department_id: dept.id,
      name: 'FollowUp',
      description: 'Organize suas demandas com a Matriz de Eisenhower.',
      url: 'https://followup-production-3de2.up.railway.app/',
      icon: '🎯',
      active: true,
      user_count: 0,
    })

    if (insertError) {
      console.error(`Erro em ${dept.name}:`, insertError.message)
    } else {
      console.log(`✓ FollowUp adicionado em: ${dept.name}`)
    }
  }
}

main()
