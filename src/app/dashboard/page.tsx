import { getCurrentUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { NotebookPen, FileText, BookOpen, RefreshCw, PlusCircle } from 'lucide-react'
import Link from 'next/link'
import { DashboardGrid } from '@/components/dashboard/dashboard-grid'
import { DashboardHeader } from '@/components/dashboard/dashboard-header'

function isConnectionError(e: unknown): boolean {
  if (e instanceof Error) {
    if (e.name === 'PrismaClientInitializationError') return true
    if (e.message.includes("Can't reach database server")) return true
  }
  return false
}

async function withDbRetry<T>(fn: () => Promise<T>): Promise<T> {
  const delaysMs = [0, 1000, 2000, 4000, 8000]
  let lastError: unknown

  for (const delayMs of delaysMs) {
    if (delayMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, delayMs))
    }

    try {
      return await fn()
    } catch (e) {
      if (!isConnectionError(e)) throw e
      lastError = e
    }
  }

  throw lastError ?? new Error('Database connection failed')
}

export const dynamic = 'force-dynamic'

export default async function Dashboard() {
  const user = await getCurrentUser()
  
  if (!user) {
    redirect('/')
  }

  try {
    const data = await withDbRetry(async () => {
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

    const IMPORTED_DESC = 'Imported from GitHub'

    const noteCount = await prisma.note.count({
      where: { userId: dbUser.id },
    })

    const notebooks = await prisma.notebook.findMany({
      where: { userId: dbUser.id },
      orderBy: { updatedAt: 'desc' },
      take: 8,
    })

    const notebooksForGrid = notebooks.map((nb) => ({
      id: nb.id,
      title: nb.title,
      description: nb.description,
      color: nb.color,
      // E2E: notebook file lists are rendered client-side after decryption
      importedNotes: nb.description === IMPORTED_DESC ? [] : [],
    }))
      return { noteCount, notebooksForGrid }
    })

    return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header with quick links and sign out button */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Welcome back, {user.firstName || 'User'}!</h1>
            <p className="text-muted-foreground">
              Here&apos;s what&apos;s happening with your notes today.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:shrink-0">
            <Button variant="outline" size="sm" asChild>
              <Link href="/notes" className="gap-2">
                <FileText className="h-4 w-4" />
                Notes
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href="/notes/new" className="gap-2">
                <PlusCircle className="h-4 w-4" />
                New note
              </Link>
            </Button>
            <DashboardHeader />
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Notes</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.noteCount}</div>
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
              <div className="text-2xl font-bold">{data.notebooksForGrid.length}</div>
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

        <DashboardGrid noteCount={data.noteCount} notebooks={data.notebooksForGrid} />
      </div>
    </div>
    )
  } catch (e) {
    if (isConnectionError(e)) {
      return (
        <div className="min-h-screen bg-background">
          <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
              <div>
                <h1 className="text-3xl font-bold mb-2">Welcome back, {user.firstName || 'User'}!</h1>
                <p className="text-muted-foreground">
                  Here&apos;s what&apos;s happening with your notes today.
                </p>
              </div>
              <div className="sm:shrink-0">
                <DashboardHeader />
              </div>
            </div>

            <Card className="mb-8 border-amber-300/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <RefreshCw className="h-5 w-5 text-muted-foreground" />
                  Database temporarily unavailable
                </CardTitle>
                <CardDescription>
                  Dashboard is running in limited mode until the DB connection recovers.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button asChild className="w-full sm:w-auto">
                  <Link href="/dashboard">Retry connection</Link>
                </Button>
              </CardContent>
            </Card>

            <DashboardGrid noteCount={0} notebooks={[]} />
          </div>
        </div>
      )
    }
    throw e
  }
}
