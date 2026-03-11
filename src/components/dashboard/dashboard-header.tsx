'use client'

import { useClerk } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'
import { LogOut } from 'lucide-react'

export function DashboardHeader() {
  const { signOut } = useClerk()

  const handleSignOut = () => {
    signOut()
      .then(() => { window.location.href = '/' })
      .catch(() => { window.location.href = '/' })
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleSignOut}
      className="gap-2"
    >
      <LogOut className="h-4 w-4" />
      Sign out
    </Button>
  )
}
