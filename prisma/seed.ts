import 'dotenv/config'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../lib/generated/prisma/client'

const pool = new Pool({ connectionString: process.env.DIRECT_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  const departments = [
    { name: 'Onboarding',           slug: 'onboarding',           order: 1 },
    { name: 'Comercial',            slug: 'comercial',            order: 2 },
    { name: 'Legalização',          slug: 'legalizacao',          order: 3 },
    { name: 'Fiscal',               slug: 'fiscal',               order: 4 },
    { name: 'Financeiro',           slug: 'financeiro',           order: 5 },
    { name: 'Contábil',             slug: 'contabil',             order: 6 },
    { name: 'Departamento Pessoal', slug: 'departamento-pessoal', order: 7 },
    { name: 'CS',                   slug: 'cs',                   order: 8 },
  ]

  for (const dept of departments) {
    await prisma.department.upsert({
      where: { slug: dept.slug },
      update: {},
      create: dept,
    })
  }

  console.log('Seed concluído — 8 departamentos inseridos.')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
