import 'dotenv/config'
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../lib/generated/prisma/client'

const pool = new Pool({ connectionString: process.env.DIRECT_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  const department = await prisma.department.findUnique({
    where: { slug: 'financeiro' },
  })

  if (!department) {
    console.error('Departamento "financeiro" não encontrado.')
    process.exit(1)
  }

  const tool = await prisma.tool.create({
    data: {
      departmentId: department.id,
      name: 'OIKOS',
      description: 'Economia e elegância.',
      url: 'https://web-production-0dbca.up.railway.app/',
      icon: '💰',
      active: true,
      userCount: 0,
    },
  })

  console.log(`Ferramenta "${tool.name}" cadastrada com sucesso no departamento Financeiro.`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
