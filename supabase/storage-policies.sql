-- Execute no Supabase SQL Editor

-- Permite usuários autenticados fazerem upload na pasta do próprio ID
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('avatars', 'avatars', true, 2097152, array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set
  public = true,
  file_size_limit = 2097152,
  allowed_mime_types = array['image/jpeg','image/png','image/webp'];

-- Política: usuário autenticado pode fazer upload na sua própria pasta
drop policy if exists "Authenticated users can upload avatars" on storage.objects;
create policy "Authenticated users can upload avatars"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Política: usuário pode atualizar o próprio avatar
drop policy if exists "Users can update own avatar" on storage.objects;
create policy "Users can update own avatar"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Política: leitura pública (bucket público)
drop policy if exists "Public read avatars" on storage.objects;
create policy "Public read avatars"
  on storage.objects for select
  to public
  using (bucket_id = 'avatars');
