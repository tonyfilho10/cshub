import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../lib/generated/prisma/client'
import { createClient } from '@supabase/supabase-js'

const pool = new Pool({ connectionString: process.env.DIRECT_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
)

async function main() {
  const adminEmail = 'lourival.cshub@gmail.com'

  const { data: { users } } = await supabase.auth.admin.listUsers()
  const authUser = users.find(u => u.email === adminEmail)

  if (!authUser) {
    console.error(`Usuário ${adminEmail} não encontrado no Supabase Auth.`)
    process.exit(1)
  }

  await prisma.profile.upsert({
    where: { id: authUser.id },
    update: { role: 'ADMIN' },
    create: {
      id: authUser.id,
      email: adminEmail,
      name: 'Lourival',
      role: 'ADMIN',
      active: true,
    },
  })

  console.log(`✓ ${adminEmail} definido como ADMIN.`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
