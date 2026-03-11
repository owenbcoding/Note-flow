import { getCurrentUser } from '@/lib/auth'
import { redirect, notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { NoteView } from '@/components/notes/note-view'

export const dynamic = 'force-dynamic'

interface NotePageProps {
  params: Promise<{ id: string }>
}

export default async function NotePage({ params }: NotePageProps) {
  const { id } = await params
  const user = await getCurrentUser()
  
  if (!user) {
    redirect('/')
  }

  // Get user from database
  const dbUser = await prisma.user.findUnique({
    where: { clerkId: user.id },
  })

  if (!dbUser) {
    redirect('/')
  }

  // Get the note
  const note = await prisma.note.findFirst({
    where: {
      id,
      userId: dbUser.id,
    },
    include: {
      notebook: true,
    },
  })

  if (!note) {
    notFound()
  }

  // Serialize for client component (Date -> string)
  const serializedNote = {
    ...note,
    createdAt: note.createdAt.toISOString(),
    updatedAt: note.updatedAt.toISOString(),
    notebook: note.notebook
      ? {
          id: note.notebook.id,
          title: note.notebook.title,
          color: note.notebook.color ?? undefined,
        }
      : null,
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <NoteView note={serializedNote} />
        </div>
      </div>
    </div>
  )
}
