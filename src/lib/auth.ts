export type AppUser = {
  id: string
  emailAddresses: Array<{ emailAddress: string }>
  firstName?: string | null
  lastName?: string | null
  imageUrl?: string | null
}

export async function getCurrentUser(): Promise<AppUser | null> {
  const devFallbackUser: AppUser = {
    id: 'dev_user',
    emailAddresses: [{ emailAddress: 'dev@example.com' }],
    firstName: 'Dev',
    lastName: 'User',
    imageUrl: null,
  }

  // Only use Clerk when keys are valid; otherwise fall back to a dev user
  const { isClerkEnabled } = await import('./auth')
  if (isClerkEnabled()) {
    try {
      const { currentUser } = await import('@clerk/nextjs/server')
      const user = (await currentUser()) as unknown as AppUser | null
      if (user) return user
      // In local dev, stale Clerk cookies can briefly resolve to null.
      if (process.env.NODE_ENV !== 'production') return devFallbackUser
      return null
    } catch {
      // Keep local dev usable if Clerk is temporarily unavailable.
      if (process.env.NODE_ENV !== 'production') return devFallbackUser
      throw new Error('Failed to resolve authenticated user')
    }
  }

  // Dev fallback user so the app works without Clerk configured
  return devFallbackUser
}

export function isClerkEnabled(): boolean {
  const pk = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
  const sk = process.env.CLERK_SECRET_KEY
  // Only enable Clerk when the keys appear valid (not placeholders)
  const looksValid =
    typeof pk === 'string' &&
    typeof sk === 'string' &&
    pk.startsWith('pk_') &&
    sk.startsWith('sk_') &&
    pk.length > 20 &&
    sk.length > 20 &&
    !pk.includes('your') &&
    !sk.includes('your')
  return looksValid
}

