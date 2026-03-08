import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function getPrismaClient(): PrismaClient {
  const dbUrl = process.env.DATABASE_URL
  // Only throw when URL is explicitly a placeholder (e.g. from .env.example).
  // When DATABASE_URL is missing (e.g. Vercel build without env), allow client creation
  // so the build succeeds; Prisma will fail at first query with a clear error at runtime.
  if (typeof dbUrl === 'string' && (dbUrl.includes('@host/') || dbUrl.includes('host:5432'))) {
    throw new Error(
      'DATABASE_URL is set to a placeholder. Update .env with your real database URL (e.g. from Neon) and restart the dev server.'
    )
  }
  if (globalForPrisma.prisma) return globalForPrisma.prisma
  const client = new PrismaClient()
  if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = client
  return client
}

// Lazy: only validate DATABASE_URL and create client when prisma is first used.
// This allows the build to succeed on Vercel when DATABASE_URL is not set at build time.
export const prisma = new Proxy({} as PrismaClient, {
  get(_, prop) {
    return (getPrismaClient() as unknown as Record<string | symbol, unknown>)[prop]
  },
})
