import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

import { createClient } from '@supabase/supabase-js'

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
)

async function main() {
  // Busca todos os OIKOS
  const { data: oikos } = await sb
    .from('tools')
    .select('id, name, created_at, department_id')
    .eq('name', 'OIKOS')
    .order('created_at', { ascending: true })

  console.log('OIKOS encontrados:', oikos?.length)

  if (oikos && oikos.length > 1) {
    // Mantém o primeiro, deleta os demais
    const toDelete = oikos.slice(1).map(t => t.id)
    const { error } = await sb.from('tools').delete().in('id', toDelete)
    if (error) console.error('Erro ao deletar:', error.message)
    else console.log(`✓ ${toDelete.length} duplicata(s) removida(s).`)
  } else {
    console.log('Sem duplicatas.')
  }
}

main()
