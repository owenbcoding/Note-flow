import { createHash, randomBytes } from 'crypto'
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'

export function hashToken(token: string): string {
  return createHash('sha256').update(token, 'utf8').digest('hex')
}

export function generateSecureToken(): string {
  return randomBytes(32).toString('hex')
}

/**
 * Validates Authorization: Bearer <sync-token> and returns the Prisma user for that token, or null.
 */
export async function getSyncUserFromRequest(request: NextRequest): Promise<{ id: string } | null> {
  const auth = request.headers.get('authorization')
  if (!auth?.startsWith('Bearer ')) return null
  const token = auth.slice(7).trim()
  if (!token) return null

  const tokenHash = hashToken(token)
  const syncToken = await prisma.syncToken.findFirst({
    where: { tokenHash },
    include: { user: true },
  })
  if (!syncToken?.user) return null
  return { id: syncToken.user.id }
}
