import { NextRequest, NextResponse } from 'next/server'
import { getSyncUserFromRequest } from '@/lib/sync-auth'
import { prisma } from '@/lib/prisma'

type NotePayload = { title: string; content: string }

/**
 * POST /api/sync/upload
 * Auth: Authorization: Bearer <sync-token>
 * Body: { notes: [{ title: string, content: string }] }
 * Creates or updates notes for the token's user. Upserts by title.
 */
export async function POST(request: NextRequest) {
  try {
    const syncUser = await getSyncUserFromRequest(request)
    if (!syncUser) {
      return NextResponse.json({ error: 'Invalid or missing sync token' }, { status: 401 })
    }

    const body = await request.json()
    const notes = body?.notes
    if (!Array.isArray(notes) || notes.length === 0) {
      return NextResponse.json(
        { error: 'Body must include a non-empty "notes" array of { title, content }' },
        { status: 400 }
      )
    }

    const payloads = notes as NotePayload[]
    for (const item of payloads) {
      if (typeof item?.title !== 'string' || typeof item?.content !== 'string') {
        return NextResponse.json(
          { error: 'Each note must have "title" and "content" strings' },
          { status: 400 }
        )
      }
    }

    const results: { title: string; id: string; created: boolean }[] = []

    for (const { title, content } of payloads) {
      const trimmedTitle = title.trim()
      if (!trimmedTitle) continue

      const existing = await prisma.note.findFirst({
        where: { userId: syncUser.id, title: trimmedTitle },
      })

      if (existing) {
        await prisma.note.update({
          where: { id: existing.id },
          data: { content, updatedAt: new Date() },
        })
        results.push({ title: trimmedTitle, id: existing.id, created: false })
      } else {
        const note = await prisma.note.create({
          data: {
            title: trimmedTitle,
            content,
            userId: syncUser.id,
          },
        })
        results.push({ title: trimmedTitle, id: note.id, created: true })
      }
    }

    return NextResponse.json({ synced: results.length, results })
  } catch (error) {
    console.error('Error syncing notes:', error)
    return NextResponse.json(
      { error: 'Failed to sync notes' },
      { status: 500 }
    )
  }
}
