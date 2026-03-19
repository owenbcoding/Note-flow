import { NextRequest, NextResponse } from 'next/server'
import { getSyncUserFromRequest } from '@/lib/sync-auth'
import { prisma } from '@/lib/prisma'

type PlainNote = { title: string; content: string }
type EncryptedNote = { encryptedPayload: { iv: string; ct: string } }

function isEncryptedNote(item: unknown): item is EncryptedNote {
  const ep = (item as EncryptedNote)?.encryptedPayload
  return ep && typeof ep.iv === 'string' && typeof ep.ct === 'string'
}

/**
 * POST /api/sync/upload
 * Auth: Authorization: Bearer <sync-token>
 * Body: { notes: [{ title, content }] } (legacy) or { notes: [{ encryptedPayload: { iv, ct } }] } (E2E)
 * Creates or updates notes for the token's user. With E2E, the sync script must encrypt
 * each note with the user's key before uploading. See docs/E2E_SYNC.md.
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
        { error: 'Body must include a non-empty "notes" array with { title, content } or { encryptedPayload }' },
        { status: 400 }
      )
    }

    const results: { title: string; id: string; created: boolean }[] = []

    for (const item of notes as (PlainNote | EncryptedNote)[]) {
      let title: string
      let content: string

      if (isEncryptedNote(item)) {
        title = 'Encrypted'
        content = JSON.stringify(item.encryptedPayload)
      } else {
        const t = (item as PlainNote).title
        const c = (item as PlainNote).content
        if (typeof t !== 'string' || typeof c !== 'string') {
          return NextResponse.json(
            { error: 'Each note must have "title" and "content" or "encryptedPayload"' },
            { status: 400 }
          )
        }
        title = t.trim()
        content = c.trim()
      }

      if (!title && !isEncryptedNote(item)) continue

      const storedTitle = title || 'Encrypted'
      const isEncrypted = isEncryptedNote(item)
      const existing = isEncrypted
        ? null
        : await prisma.note.findFirst({
            where: { userId: syncUser.id, title: storedTitle },
          })

      if (existing) {
        await prisma.note.update({
          where: { id: existing.id },
          data: { content, updatedAt: new Date() },
        })
        results.push({ title: storedTitle, id: existing.id, created: false })
      } else {
        const note = await prisma.note.create({
          data: {
            title: storedTitle,
            content,
            userId: syncUser.id,
          },
        })
        results.push({ title: storedTitle, id: note.id, created: true })
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
