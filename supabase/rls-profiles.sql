-- Execute no Supabase SQL Editor: Dashboard → SQL Editor → New query

-- 1. Habilitar RLS na tabela profiles
alter table profiles enable row level security;

-- 2. Política: service_role tem acesso total (necessário para as server actions de admin)
drop policy if exists "Service role full access on profiles" on profiles;
create policy "Service role full access on profiles"
  on profiles for all
  to service_role
  using (true)
  with check (true);

-- 3. Política: usuário autenticado lê apenas o próprio perfil
drop policy if exists "Users read own profile" on profiles;
create policy "Users read own profile"
  on profiles for select
  to authenticated
  using (auth.uid() = id);
