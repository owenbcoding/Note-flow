import { getCurrentUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { NotebookPen, Plus, FileText, BookOpen } from 'lucide-react'
import Link from 'next/link'
import { AINoteGenerator } from '@/components/ai/ai-note-generator'

export const dynamic = 'force-dynamic'

export default async function Dashboard() {
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

  // Get user's notes and notebooks
  const [notes, notebooks] = await Promise.all([
    prisma.note.findMany({
      where: { userId: dbUser.id },
      orderBy: { updatedAt: 'desc' },
      take: 5,
    }),
    prisma.notebook.findMany({
      where: { userId: dbUser.id },
      orderBy: { updatedAt: 'desc' },
      take: 3,
    }),
  ])

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome back, {user.firstName || 'User'}!</h1>
          <p className="text-muted-foreground">
            Here&apos;s what&apos;s happening with your notes today.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Notes</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{notes.length}</div>
              <p className="text-xs text-muted-foreground">
                +2 from last week
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Notebooks</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{notebooks.length}</div>
              <p className="text-xs text-muted-foreground">
                +1 from last week
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
              <NotebookPen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground">
                +3 from yesterday
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* AI Note Generator */}
          <div className="lg:col-span-1">
            <AINoteGenerator />
          </div>

          <div className="lg:col-span-2 space-y-8">
            {/* Recent Notes */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Notes</CardTitle>
                <CardDescription>
                  Your latest notes and thoughts
                </CardDescription>
              </CardHeader>
            <CardContent>
              {notes.length > 0 ? (
                <div className="space-y-4">
                  {notes.map((note) => (
                    <div key={note.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium">{note.title}</h4>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {note.content}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(note.updatedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">No notes yet</p>
                  <Button asChild>
                    <Link href="/notes/new">
                      <Plus className="h-4 w-4 mr-2" />
                      Create your first note
                    </Link>
                  </Button>
                </div>
              )}
              </CardContent>
            </Card>

            {/* Notebooks */}
            <Card>
              <CardHeader>
                <CardTitle>Your Notebooks</CardTitle>
                <CardDescription>
                  Organize your notes into collections
                </CardDescription>
              </CardHeader>
              <CardContent>
                {notebooks.length > 0 ? (
                  <div className="space-y-4">
                    {notebooks.map((notebook) => (
                      <div key={notebook.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div 
                            className="w-4 h-4 rounded-full" 
                            style={{ backgroundColor: notebook.color || '#3b82f6' }}
                          />
                          <div>
                            <h4 className="font-medium">{notebook.title}</h4>
                            {notebook.description && (
                              <p className="text-sm text-muted-foreground">
                                {notebook.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-4">No notebooks yet</p>
                    <Button asChild>
                      <Link href="/notebooks/new">
                        <Plus className="h-4 w-4 mr-2" />
                        Create your first notebook
                      </Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
