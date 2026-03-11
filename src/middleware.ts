import { NextFetchEvent, NextRequest, NextResponse } from 'next/server'
import { isClerkEnabled } from '@/lib/auth'

// Enable Clerk only when keys are present; otherwise, pass-through
export default async function middleware(req: NextRequest, event: NextFetchEvent) {
  if (isClerkEnabled()) {
    const { clerkMiddleware } = await import('@clerk/nextjs/server')
    const run = clerkMiddleware()
    const response = await run(req, event)

    // In local/dev, stale Clerk dev-browser cookies can produce a 500 response
    // and keep the app in a broken loading state. Let public requests continue.
    if (!response) {
      return NextResponse.next()
    }

    if (
      response.status >= 500 &&
      response.headers.get('x-clerk-auth-reason') === 'dev-browser-missing'
    ) {
      return NextResponse.next()
    }

    return response
  }
  return NextResponse.next()
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}
