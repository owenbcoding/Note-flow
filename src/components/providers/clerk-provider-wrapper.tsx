'use client'

import { ClerkProvider } from '@clerk/nextjs'

type Props = {
  enabled: boolean
  children: React.ReactNode
}

export default function ClerkProviderWrapper({ enabled, children }: Props) {
  if (!enabled) return <>{children}</>
  return <ClerkProvider>{children}</ClerkProvider>
}


