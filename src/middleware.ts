import { NextFetchEvent, NextRequest, NextResponse } from 'next/server'
import { isClerkEnabled } from '@/lib/auth'

// Enable Clerk only when keys are present; otherwise, pass-through
export default async function middleware(req: NextRequest, event: NextFetchEvent) {
  if (isClerkEnabled()) {
    const { clerkMiddleware } = await import('@clerk/nextjs/server')
    const run = clerkMiddleware()
    return run(req, event)
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
