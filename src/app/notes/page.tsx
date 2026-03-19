import { getCurrentUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { Button } from '@/components/ui/button'
import { Plus, LayoutDashboard } from 'lucide-react'
import Link from 'next/link'
import { NotesList } from '@/components/notes/notes-list'

export const dynamic = 'force-dynamic'

export default async function NotesPage() {
  const user = await getCurrentUser()
  
  if (!user) {
    redirect('/')
  }

  // Get or create user in database
  const dbUser = await prisma.user.upsert({
    where: { clerkId: user.id },
    update: {
      email: user.emailAddresses[0]?.emailAddress || '',
      name: user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.firstName || null,
      avatar: user.imageUrl,
    },
    create: {
      clerkId: user.id,
      email: user.emailAddresses[0]?.emailAddress || '',
      name: user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.firstName || null,
      avatar: user.imageUrl,
    },
  })

  // Do not load note content on server (E2E: client fetches and decrypts)
  const noteCount = await prisma.note.count({
    where: { userId: dbUser.id },
  })

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">My Notes</h1>
              <p className="text-muted-foreground">
                {noteCount} {noteCount === 1 ? 'note' : 'notes'} total
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" asChild>
                <Link href="/dashboard">
                  <LayoutDashboard className="h-4 w-4 mr-2" />
                  Dashboard
                </Link>
              </Button>
              <Button asChild>
                <Link href="/notes/new">
                  <Plus className="h-4 w-4 mr-2" />
                  New Note
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Notes List - fetches full notes (with encrypted content) on client and decrypts */}
        <NotesList initialNotes={[]} />
      </div>
    </div>
  )
}
