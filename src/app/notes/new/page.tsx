import { getCurrentUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { NewNoteForm } from '@/components/notes/new-note-form'

export default async function NewNotePage() {
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

  // Get user's notebooks for selection
  const notebooksRaw = await prisma.notebook.findMany({
    where: { userId: dbUser.id },
    orderBy: { title: 'asc' },
  })
  const notebooks = notebooksRaw.map((nb) => ({
    id: nb.id,
    title: nb.title,
    color: nb.color ?? undefined,
  }))

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <NewNoteForm notebooks={notebooks} />
        </div>
      </div>
    </div>
  )
}
