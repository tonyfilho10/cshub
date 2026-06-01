import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
)

async function main() {
  // Criar bucket avatars (público)
  const { error } = await supabase.storage.createBucket('avatars', {
    public: true,
    fileSizeLimit: 2097152, // 2MB
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
  })

  if (error && error.message !== 'The resource already exists') {
    console.error('Erro ao criar bucket:', error.message)
    process.exit(1)
  }

  console.log('Bucket "avatars" configurado com sucesso.')
}

main()
