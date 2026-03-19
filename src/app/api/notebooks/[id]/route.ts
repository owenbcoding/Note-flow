import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

/**
 * DELETE /api/notebooks/[id]
 * Deletes a notebook and all its notes. Use this to remove imported GitHub repository notes.
 */
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

    const dbUser = await prisma.user.findUnique({
      where: { clerkId: user.id },
    })

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const notebook = await prisma.notebook.findFirst({
      where: {
        id,
        userId: dbUser.id,
      },
    })

    if (!notebook) {
      return NextResponse.json({ error: 'Notebook not found' }, { status: 404 })
    }

    // Delete all notes in the notebook, then delete the notebook
    await prisma.note.deleteMany({
      where: { notebookId: id },
    })
    await prisma.notebook.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting notebook:', error)
    return NextResponse.json(
      { error: 'Failed to delete notebook' },
      { status: 500 }
    )
  }
}
