import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
)

async function main() {
  const { data, error } = await supabase.auth.admin.createUser({
    email: 'lourival.cshub@gmail.com',
    password: '@Orienhipoten2026en',
    email_confirm: true,
  })

  if (error) {
    console.error('Erro ao criar usuário:', error.message)
    process.exit(1)
  }

  console.log('Usuário criado com sucesso:', data.user?.email)
}

main()
