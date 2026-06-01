-- Departamentos
create table departments (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  "order" int not null default 0
);

-- Ferramentas
create table tools (
  id uuid primary key default gen_random_uuid(),
  department_id uuid references departments(id) on delete cascade,
  name text not null,
  description text,
  url text not null,
  icon text,
  active boolean not null default true,
  user_count int not null default 0,
  created_at timestamptz default now()
);

-- Seed departamentos
insert into departments (name, slug, "order") values
  ('Onboarding',           'onboarding',           1),
  ('Comercial',            'comercial',             2),
  ('Legalização',          'legalizacao',           3),
  ('Fiscal',               'fiscal',                4),
  ('Financeiro',           'financeiro',            5),
  ('Contábil',             'contabil',              6),
  ('Departamento Pessoal', 'departamento-pessoal',  7),
  ('CS',                   'cs',                    8);

-- RLS: somente usuários autenticados leem
alter table departments enable row level security;
alter table tools enable row level security;

create policy "Authenticated users can read departments"
  on departments for select
  to authenticated
  using (true);

create policy "Authenticated users can read tools"
  on tools for select
  to authenticated
  using (true);
