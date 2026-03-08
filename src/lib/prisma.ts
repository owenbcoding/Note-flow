import { PrismaClient } from '@prisma/client'

const dbUrl = process.env.DATABASE_URL
if (!dbUrl || dbUrl.includes('@host/') || dbUrl.includes('host:5432')) {
  throw new Error(
    'DATABASE_URL is missing or still set to the placeholder. Update .env with your real database URL (e.g. from Neon) and restart the dev server (stop and run `pnpm run dev` again).'
  )
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
