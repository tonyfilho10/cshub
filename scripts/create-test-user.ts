import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

import { createClient } from '@supabase/supabase-js'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../lib/generated/prisma/client'

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SECRET_KEY!)
const pool = new Pool({ connectionString: process.env.DIRECT_URL })
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) })

async function main() {
  const { data, error } = await sb.auth.admin.createUser({
    email: 'teste@cshub.com',
    password: 'Teste@1234',
    email_confirm: true,
  })
  if (error) { console.error(error.message); return }
  await prisma.profile.create({
    data: { id: data.user.id, email: 'teste@cshub.com', name: 'Usuário Teste', role: 'USER', active: true },
  })
  console.log('Usuário de teste criado.')
}
main().catch(console.error).finally(() => prisma.$disconnect())
