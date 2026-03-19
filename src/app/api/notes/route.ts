import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- required by Next.js route signature
export async function GET(_request: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
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

    const notes = await prisma.note.findMany({
      where: { userId: dbUser.id },
      orderBy: { updatedAt: 'desc' },
      include: {
        notebook: true,
      },
    })

    return NextResponse.json({ notes })
  } catch (error) {
    console.error('Error fetching notes:', error)
    return NextResponse.json(
      { error: 'Failed to fetch notes' },
      { status: 500 }
    )
  }
}

/** E2E: Client sends { encryptedPayload: { iv, ct }, notebookId? }; server stores ciphertext only. */
function isEncryptedBody(body: unknown): body is { encryptedPayload: { iv: string; ct: string }; notebookId?: string | null } {
  const b = body as Record<string, unknown>
  const ep = b?.encryptedPayload as unknown
  return (
    ep !== null &&
    typeof ep === 'object' &&
    typeof (ep as { iv?: unknown }).iv === 'string' &&
    typeof (ep as { ct?: unknown }).ct === 'string'
  )
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const notebookId = (body?.notebookId as string | null | undefined) || null

    let title: string
    let content: string

    if (isEncryptedBody(body)) {
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

    const note = await prisma.note.create({
      data: {
        title,
        content,
        userId: dbUser.id,
        notebookId,
      },
      include: {
        notebook: true,
      },
    })

    return NextResponse.json({ note }, { status: 201 })
  } catch (error) {
    console.error('Error creating note:', error)
    return NextResponse.json(
      { error: 'Failed to create note' },
      { status: 500 }
    )
  }
}
