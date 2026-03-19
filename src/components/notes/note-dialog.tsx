'use client'

import { useEffect, useRef, useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { X, Save, Loader2 } from 'lucide-react'
import {
  isEmptyEditorContent,
  normalizeContentForEditor,
} from '@/lib/note-content'
import { getOrCreateUserKey, encryptNote } from '@/lib/note-crypto'

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

interface NoteDialogProps {
  note: Note
  onClose: () => void
  onSave: (note: Note) => void
}

export function NoteDialog({ note, onClose, onSave }: NoteDialogProps) {
  const { user } = useUser()
  const [title, setTitle] = useState(note.title)
  const [content, setContent] = useState(note.content)
  const [isSaving, setIsSaving] = useState(false)
  const [isEditorReady, setIsEditorReady] = useState(false)
  const editorRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    let isMounted = true

    const initializeEditor = async () => {
      if (!editorRef.current || !isMounted) return

      const { default: Quill } = await import('quill')
      if (!editorRef.current || !isMounted) return
      editorRef.current.innerHTML = ''

      const quill = new Quill(editorRef.current, {
        theme: 'snow',
        modules: {
          toolbar: [
            ['bold', 'italic', 'underline'],
            [{ header: [1, 2, 3, false] }],
            [{ list: 'ordered' }, { list: 'bullet' }],
            ['blockquote', 'code-block', 'link'],
            ['clean'],
          ],
        },
      })

      quill.root.innerHTML = normalizeContentForEditor(note.content)
      setContent(quill.root.innerHTML)

      quill.on('text-change', () => {
        setContent(quill.root.innerHTML)
      })

      setIsEditorReady(true)
    }

    initializeEditor()

    return () => {
      isMounted = false
      setIsEditorReady(false)
    }
  }, [note.id, note.content])

  const handleSave = async () => {
    if (!user?.id) return
    setIsSaving(true)
    try {
      const key = await getOrCreateUserKey(user.id)
      const encrypted = await encryptNote({ title: title.trim(), content }, key)
      const response = await fetch(`/api/notes/${note.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          encryptedPayload: encrypted,
          notebookId: note.notebook?.id ?? null,
        }),
      })

      if (response.ok) {
        const { note: raw } = await response.json()
        onSave({ ...raw, title: title.trim(), content })
      }
    } catch (error) {
      console.error('Error updating note:', error)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-5xl max-h-[92vh] overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle>Edit Note</CardTitle>
            <CardDescription>
              Update your note in an expanded rich text editor
            </CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4 overflow-y-auto">
          <div className="space-y-2">
            <label className="text-sm font-medium">Title</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Note title..."
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Content</label>
            <div className="rounded-md border bg-background p-2">
              <div
                ref={editorRef}
                className="min-h-[360px]"
                aria-label="Rich text note editor"
              />
            </div>
            {!isEditorReady ? (
              <p className="text-xs text-muted-foreground">Loading editor...</p>
            ) : null}
          </div>
          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleSave}
              disabled={
                !title.trim() ||
                isEmptyEditorContent(content) ||
                isSaving ||
                !isEditorReady
              }
              className="flex-1"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
