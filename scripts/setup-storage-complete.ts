import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

import { createClient } from '@supabase/supabase-js'

// Usa service role para configurar storage
const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
)

async function main() {
  // 1. Garante que o bucket existe e é público
  const { data: buckets } = await sb.storage.listBuckets()
  const exists = buckets?.some(b => b.id === 'avatars')

  if (!exists) {
    const { error } = await sb.storage.createBucket('avatars', {
      public: true,
      fileSizeLimit: 2097152,
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
    })
    if (error) console.error('Erro ao criar bucket:', error.message)
    else console.log('✓ Bucket "avatars" criado.')
  } else {
    // Atualiza para garantir que é público
    const { error } = await sb.storage.updateBucket('avatars', {
      public: true,
      fileSizeLimit: 2097152,
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
    })
    if (error) console.error('Erro ao atualizar bucket:', error.message)
    else console.log('✓ Bucket "avatars" atualizado (público).')
  }

  console.log('\nPróximo passo: execute o SQL abaixo no Supabase SQL Editor:')
  console.log(`
-- Habilitar RLS no storage
alter table storage.objects enable row level security;

-- Remover políticas antigas se existirem
drop policy if exists "Authenticated users can upload avatars" on storage.objects;
drop policy if exists "Users can update own avatar" on storage.objects;
drop policy if exists "Public read avatars" on storage.objects;
drop policy if exists "Users can delete own avatar" on storage.objects;

-- Upload: usuário autenticado sobe na própria pasta
create policy "Authenticated users can upload avatars"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'avatars');

-- Update: qualquer autenticado pode atualizar (upsert)
create policy "Users can update own avatar"
  on storage.objects for update to authenticated
  using (bucket_id = 'avatars');

-- Leitura pública
create policy "Public read avatars"
  on storage.objects for select to public
  using (bucket_id = 'avatars');

-- Delete: usuário pode deletar na própria pasta
create policy "Users can delete own avatar"
  on storage.objects for delete to authenticated
  using (bucket_id = 'avatars');
  `)
}

main()
