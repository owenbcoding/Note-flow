import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { hashToken, generateSecureToken } from '@/lib/sync-auth'

/**
 * POST /api/sync/token
 * Requires Clerk auth. Creates or replaces the sync token for the current user.
 * Returns the plain token once; store it securely (e.g. NOTEFLOW_SYNC_TOKEN env) for the sync script.
 */
export async function POST() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const dbUser = await prisma.user.upsert({
      where: { clerkId: user.id },
      update: {
        email: user.emailAddresses[0]?.emailAddress ?? '',
        name: user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.firstName ?? null,
        avatar: user.imageUrl ?? undefined,
      },
      create: {
        clerkId: user.id,
        email: user.emailAddresses[0]?.emailAddress ?? '',
        name: user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.firstName ?? null,
        avatar: user.imageUrl ?? undefined,
      },
    })

    const plainToken = generateSecureToken()
    const tokenHash = hashToken(plainToken)

    await prisma.syncToken.upsert({
      where: { userId: dbUser.id },
      update: { tokenHash },
      create: {
        userId: dbUser.id,
        tokenHash,
      },
    })

    return NextResponse.json({ token: plainToken })
  } catch (error) {
    console.error('Error creating sync token:', error)
    return NextResponse.json(
      { error: 'Failed to create sync token' },
      { status: 500 }
    )
  }
}
