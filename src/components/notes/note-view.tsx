'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Edit, Calendar, BookOpen } from 'lucide-react'
import Link from 'next/link'
import { NoteDialog } from './note-dialog'
import { normalizeContentForEditor } from '@/lib/note-content'
import { getOrCreateUserKey, decryptNote, isEncryptedContent } from '@/lib/note-crypto'

interface Note {
  id: string
  title: string
  content: string
  createdAt: string | Date
  updatedAt: string | Date
  notebook?: {
    id: string
    title: string
    color?: string
  } | null
}

interface NoteViewProps {
  note: Note
}

export function NoteView({ note }: NoteViewProps) {
  const { user } = useUser()
  const [isEditing, setIsEditing] = useState(false)
  const [currentNote, setCurrentNote] = useState(note)
  const [decrypting, setDecrypting] = useState(!!(note.content && isEncryptedContent(note.content)))

  useEffect(() => {
    if (!user?.id || !isEncryptedContent(note.content)) {
      setDecrypting(false)
      return
    }
    let cancelled = false
    getOrCreateUserKey(user.id)
      .then((key) => {
        if (cancelled) return
        const payload = JSON.parse(note.content) as { iv: string; ct: string }
        return decryptNote(payload, key)
      })
      .then((decrypted) => {
        if (!cancelled && decrypted) {
          setCurrentNote((prev) => ({ ...prev, title: decrypted.title, content: decrypted.content }))
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setDecrypting(false)
      })
    return () => {
      cancelled = true
    }
  }, [user?.id, note.id, note.content])

  const handleNoteUpdate = (updatedNote: Note) => {
    setCurrentNote(updatedNote)
    setIsEditing(false)
  }

  if (decrypting) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Loading note...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/notes">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Notes
          </Link>
        </Button>
        <Button onClick={() => setIsEditing(true)}>
          <Edit className="h-4 w-4 mr-2" />
          Edit Note
        </Button>
      </div>

      {/* Note Content */}
      <Card>
        <CardHeader>
          <div className="space-y-4">
            <div>
              <CardTitle className="text-3xl mb-2">{currentNote.title}</CardTitle>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Created {new Date(currentNote.createdAt).toLocaleDateString()}
                </div>
                {currentNote.updatedAt !== currentNote.createdAt && (
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Updated {new Date(currentNote.updatedAt).toLocaleDateString()}
                  </div>
                )}
                {currentNote.notebook && (
                  <div className="flex items-center gap-1">
                    <BookOpen className="h-4 w-4" />
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: currentNote.notebook.color || '#3b82f6' }}
                      />
                      {currentNote.notebook.title}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="prose prose-gray max-w-none">
            <div
              className="text-base leading-relaxed [&_p]:my-3 [&_ul]:my-3 [&_ol]:my-3"
              dangerouslySetInnerHTML={{
                __html: normalizeContentForEditor(currentNote.content),
              }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      {isEditing && (
        <NoteDialog
          note={currentNote}
          onClose={() => setIsEditing(false)}
          onSave={handleNoteUpdate}
        />
      )}
    </div>
  )
}
