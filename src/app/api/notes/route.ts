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

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { title, content, notebookId } = await request.json()

    if (!title || !content) {
      return NextResponse.json(
        { error: 'Title and content are required' },
        { status: 400 }
      )
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

    const note = await prisma.note.create({
      data: {
        title,
        content,
        userId: dbUser.id,
        notebookId: notebookId || null,
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
