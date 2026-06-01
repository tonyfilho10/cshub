import { createClient } from '@/lib/supabase/server'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@/lib/generated/prisma/client'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ role: null }, { status: 401 })

  const pool = new Pool({ connectionString: process.env.DIRECT_URL })
  const adapter = new PrismaPg(pool)
  const prisma = new PrismaClient({ adapter })

  const profile = await prisma.profile.findUnique({ where: { id: user.id } })
  await prisma.$disconnect()

  return NextResponse.json({ role: profile?.role ?? 'USER' })
}
