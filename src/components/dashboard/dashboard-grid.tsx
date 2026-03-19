'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, FileText, BookOpen, Check, Copy, Trash2, Loader2, Edit } from 'lucide-react'
import { ImportRepoForm } from '@/components/dashboard/import-repo-form'
import Link from 'next/link'
import { AINoteGenerator } from '@/components/ai/ai-note-generator'
import { NoteDialog } from '@/components/notes/note-dialog'
import { htmlToPlainText } from '@/lib/note-content'
import { getOrCreateUserKey, encryptNote, decryptNote, isEncryptedContent } from '@/lib/note-crypto'

interface Note {
  id: string
  title: string
  content: string
  updatedAt: Date | string
  notebookId?: string | null
  notebook?: { id: string; title: string; color?: string } | null
}

/** Shape expected by NoteDialog (createdAt optional for server-passed notes) */
type NoteForDialog = Note & { createdAt?: Date | string }

interface Notebook {
  id: string
  title: string
  description: string | null
  color: string | null
  /** Only for GitHub-imported notebooks — clickable file list, not shown elsewhere */
  importedNotes: { id: string; title: string }[]
}

interface DashboardGridProps {
  noteCount?: number
  notebooks: Notebook[]
}

export function DashboardGrid({ notebooks }: DashboardGridProps) {
  const router = useRouter()
  const { user } = useUser()
  const [allNotes, setAllNotes] = useState<Note[]>([])
  const [recentNotes, setRecentNotes] = useState<Note[]>([])
  const [notesLoading, setNotesLoading] = useState(true)
  const [notesError, setNotesError] = useState<string | null>(null)
  const [generatedContent, setGeneratedContent] = useState('')
  const [copied, setCopied] = useState(false)
  const [removingNotebookId, setRemovingNotebookId] = useState<string | null>(null)
  const [editingNote, setEditingNote] = useState<NoteForDialog | null>(null)
  const [deletingNoteId, setDeletingNoteId] = useState<string | null>(null)

  useEffect(() => {
    if (!user?.id) {
      setNotesLoading(false)
      return
    }
    let cancelled = false
    setNotesError(null)
    const importedNotebookIds = new Set(
      notebooks
        .filter((n) => n.description === 'Imported from GitHub')
        .map((n) => n.id)
    )
    fetch('/api/notes')
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error('Failed to fetch'))))
      .then((data: { notes: Note[] }) => {
        if (cancelled) return (data.notes ?? []) as Note[]
        const raw = (data.notes ?? []).map((n: Note) => ({
          ...n,
          updatedAt: typeof n.updatedAt === 'string' ? n.updatedAt : (n.updatedAt as Date)?.toISOString?.() ?? '',
          notebook: n.notebook ? { ...n.notebook, color: n.notebook.color ?? undefined } : n.notebook,
        }))
        return raw
      })
      .then((list) => {
        if (cancelled || !list || list.length === 0) {
          if (!cancelled && list) {
            setAllNotes(list)
            setRecentNotes(
              list
                .filter((n) => {
                  const nbId = n.notebookId ?? n.notebook?.id ?? null
                  return !nbId || !importedNotebookIds.has(nbId)
                })
                .slice(0, 5)
            )
          }
          setNotesLoading(false)
          return
        }
        return getOrCreateUserKey(user!.id).then((key) =>
          Promise.all(
            list.map(async (n) => {
              if (n.content && isEncryptedContent(n.content)) {
                try {
                  const payload = JSON.parse(n.content) as { iv: string; ct: string }
                  const { title, content } = await decryptNote(payload, key)
                  return { ...n, title, content }
                } catch {
                  return n
                }
              }
              return n
            })
          )
        )
      })
      .then((decrypted) => {
        if (!cancelled && decrypted) {
          setAllNotes(decrypted)
          setRecentNotes(
            decrypted
              .filter((n) => {
                const nbId = n.notebookId ?? n.notebook?.id ?? null
                return !nbId || !importedNotebookIds.has(nbId)
              })
              .slice(0, 5)
          )
        }
      })
      .catch((e: unknown) => {
        if (cancelled) return
        const message =
          e instanceof Error ? e.message : 'Failed to load notes from /api/notes'
        setNotesError(message)
      })
      .finally(() => {
        if (!cancelled) setNotesLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [user, notebooks])

  const handleDeleteNote = async (noteId: string) => {
    if (!confirm('Delete this note? This cannot be undone.')) return
    setDeletingNoteId(noteId)
    try {
      const res = await fetch(`/api/notes/${noteId}`, { method: 'DELETE' })
      if (res.ok) {
        setAllNotes((prev) => prev.filter((n) => n.id !== noteId))
        setRecentNotes((prev) => prev.filter((n) => n.id !== noteId))
        router.refresh()
        return
      }
      const data = await res.json().catch(() => ({}))
      const message =
        (data as { error?: string })?.error || `Delete failed (${res.status})`
      alert(message)
    } finally {
      setDeletingNoteId(null)
    }
  }

  const handleNoteSaved = () => {
    setEditingNote(null)
    router.refresh()
  }

  /** Show in scrollable Generated Content card + save to Recent Notes when non-empty (E2E encrypted). */
  const handleGeneratedContent = async (content: string) => {
    setGeneratedContent(content)
    if (!content.trim() || !user?.id) return
    const lines = content.split('\n')
    const firstLine = lines[0].replace(/^#+\s*/, '').trim()
    const title =
      firstLine && firstLine.length < 100 ? firstLine : 'AI generated note'
    try {
      const key = await getOrCreateUserKey(user.id)
      const encrypted = await encryptNote({ title, content: content.trim() }, key)
      const res = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ encryptedPayload: encrypted }),
      })
      if (res.ok) {
        const data = await res.json()
        setAllNotes((prev) => [{ ...data.note, title, content: content.trim() }, ...prev])
        setRecentNotes((prev) =>
          [{ ...data.note, title, content: content.trim(), updatedAt: data.note.updatedAt }, ...prev].slice(0, 5)
        )
        router.refresh()
      }
    } catch {
      // non-blocking
    }
  }

  const handleCopy = async () => {
    if (generatedContent) {
      await navigator.clipboard.writeText(generatedContent)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleRemoveNotebook = async (notebookId: string) => {
    if (!confirm('Remove this notebook and all its notes? This cannot be undone.')) return
    setRemovingNotebookId(notebookId)
    try {
      const res = await fetch(`/api/notebooks/${notebookId}`, { method: 'DELETE' })
      if (res.ok) router.refresh()
    } finally {
      setRemovingNotebookId(null)
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 lg:grid-rows-[auto_auto_auto] gap-8">
      {/* Left column: AI Note Generator + Import repo (same width) */}
      <div className="lg:col-start-1 lg:row-start-1 space-y-6">
        <AINoteGenerator
          onGeneratedContent={handleGeneratedContent}
          hideOutput
          className="min-h-[360px]"
        />
        <ImportRepoForm compact />
      </div>

      {/* Right column: Recent Notes + Generated Content stacked with gap-2 (no grid gap between them) */}
      <div className="lg:col-start-2 lg:col-span-2 lg:row-start-1 flex flex-col gap-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Notes</CardTitle>
            <CardDescription>
              Your latest notes and thoughts
            </CardDescription>
          </CardHeader>
          <CardContent>
            {notesLoading ? (
              <div className="text-center py-8 text-muted-foreground">Loading notes...</div>
            ) : recentNotes.length > 0 ? (
              <div className="space-y-4">
                {recentNotes.map((note) => (
                  <div
                    key={note.id}
                    className="flex items-start gap-2 p-3 border rounded-lg group"
                  >
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium">{note.title}</h4>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {htmlToPlainText(note.content)}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(note.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex shrink-0 gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        title="Edit note"
                        onClick={() =>
                          setEditingNote({
                            ...note,
                            createdAt: note.updatedAt,
                          })
                        }
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        title="Delete note"
                        onClick={() => handleDeleteNote(note.id)}
                        disabled={deletingNoteId === note.id}
                      >
                        {deletingNoteId === note.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
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

        <Card className="flex flex-col">
          <CardHeader className="shrink-0 pb-2 py-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Generated Content</CardTitle>
              {generatedContent && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopy}
                  className="h-8"
                >
                  {copied ? (
                    <>
                      <Check className="h-3 w-3 mr-1" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3 mr-1" />
                      Copy
                    </>
                  )}
                </Button>
              )}
            </div>
            <CardDescription>
              {generatedContent
                ? "AI-generated note content—scroll to read. Also saved to Recent Notes."
                : "Generate a note with AI using the form on the left."}
            </CardDescription>
          </CardHeader>
          <CardContent className="px-6 pb-4 pt-0">
            <div className="overflow-y-auto rounded-md bg-muted p-3 border border-border/50" style={{ height: '220px' }}>
              {generatedContent ? (
                <pre className="whitespace-pre-wrap text-sm font-mono">
                  {generatedContent}
                </pre>
              ) : (
                <p className="text-sm text-muted-foreground h-full flex items-center justify-center">
                  The AI generated note will go here
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Notebooks: always next row after the stacked block */}
      <div className="lg:col-start-2 lg:col-span-2 lg:row-start-2">
        <Card>
          <CardHeader>
            <CardTitle>Your Notebooks</CardTitle>
            <CardDescription>
              Imported GitHub .md files appear here as clickable files organized by repository notebook.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {notesError ? (
              <div className="mb-4 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                Couldn’t load notes: {notesError}
              </div>
            ) : null}
            {notebooks.length > 0 ? (
              <div className="space-y-4">
                {notebooks.map((notebook) => {
                  const isImported =
                    notebook.description === 'Imported from GitHub'
                  const importedFiles = isImported
                    ? allNotes
                        .filter((n) => (n.notebookId ?? n.notebook?.id ?? null) === notebook.id)
                        .map((n) => ({ id: n.id, title: n.title || 'Encrypted' }))
                        .sort((a, b) => a.title.localeCompare(b.title))
                    : []
                  return (
                    <div
                      key={notebook.id}
                      className="border rounded-lg overflow-hidden"
                    >
                      <div className="flex items-center justify-between p-3 bg-muted/30">
                        <div className="flex items-center space-x-3 min-w-0">
                          <div
                            className="w-4 h-4 rounded-full shrink-0"
                            style={{
                              backgroundColor: notebook.color || '#3b82f6',
                            }}
                          />
                          <div className="min-w-0">
                            <h4 className="font-medium truncate">{notebook.title}</h4>
                            {notebook.description && (
                              <p className="text-sm text-muted-foreground truncate">
                                {notebook.description}
                              </p>
                            )}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
                          onClick={() => handleRemoveNotebook(notebook.id)}
                          disabled={removingNotebookId === notebook.id}
                          title="Remove notebook and all its notes"
                        >
                          {removingNotebookId === notebook.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                      {isImported && notesLoading ? (
                        <div className="px-3 py-2 text-xs text-muted-foreground border-t">
                          Loading files...
                        </div>
                      ) : isImported && importedFiles.length > 0 ? (
                        <ul className="divide-y border-t bg-background max-h-56 overflow-y-auto">
                          {importedFiles.map((file) => (
                            <li key={file.id}>
                              <Link
                                href={`/notes/${file.id}`}
                                className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted/60 transition-colors cursor-pointer"
                              >
                                <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                                <span className="truncate">{file.title}</span>
                              </Link>
                            </li>
                          ))}
                        </ul>
                      ) : isImported && importedFiles.length === 0 ? (
                        <div className="px-3 py-2 text-xs text-muted-foreground border-t">
                          No files in this import yet
                        </div>
                      ) : null}
                    </div>
                  )
                })}
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

      {editingNote && (
        <NoteDialog
          note={{
            ...editingNote,
            createdAt: editingNote.createdAt ?? editingNote.updatedAt,
            updatedAt: editingNote.updatedAt,
          }}
          onClose={() => setEditingNote(null)}
          onSave={handleNoteSaved}
        />
      )}
    </div>
  )
}
