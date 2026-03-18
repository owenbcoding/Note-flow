import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user from database
    const dbUser = await prisma.user.findUnique({
      where: { clerkId: user.id },
    })

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

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
      return NextResponse.json({ error: 'Note not found' }, { status: 404 })
    }

    return NextResponse.json({ note })
  } catch (error) {
    console.error('Error fetching note:', error)
    return NextResponse.json(
      { error: 'Failed to fetch note' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const notebookId = (body?.notebookId as string | null | undefined) ?? null

    let title: string
    let content: string

    if (
      body?.encryptedPayload &&
      typeof (body.encryptedPayload as { iv?: unknown }).iv === 'string' &&
      typeof (body.encryptedPayload as { ct?: unknown }).ct === 'string'
    ) {
      title = 'Encrypted'
      content = JSON.stringify(body.encryptedPayload)
    } else {
      const t = body?.title
      const c = body?.content
      if (typeof t !== 'string' || typeof c !== 'string' || !t.trim() || !c.trim()) {
        return NextResponse.json(
          { error: 'Title and content are required, or provide encryptedPayload (E2E)' },
          { status: 400 }
        )
      }
      title = t.trim()
      content = c.trim()
    }

    const dbUser = await prisma.user.findUnique({
      where: { clerkId: user.id },
    })

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const note = await prisma.note.updateMany({
      where: {
        id,
        userId: dbUser.id,
      },
      data: {
        title,
        content,
        notebookId,
      },
    })

    if (note.count === 0) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 })
    }

    const updatedNote = await prisma.note.findUnique({
      where: { id },
      include: {
        notebook: true,
      },
    })

    return NextResponse.json({ note: updatedNote })
  } catch (error) {
    console.error('Error updating note:', error)
    return NextResponse.json(
      { error: 'Failed to update note' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get or create user in database (avoid 404s if user wasn't created yet)
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

    const note = await prisma.note.deleteMany({
      where: {
        id,
        userId: dbUser.id,
      },
    })

    if (note.count === 0) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting note:', error)
    // Common setup error: DB not migrated yet
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      (error as { code?: string }).code === 'P2021'
    ) {
      return NextResponse.json(
        { error: 'Database is not initialized. Run: npx prisma migrate deploy' },
        { status: 500 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to delete note' },
      { status: 500 }
    )
  }
}
