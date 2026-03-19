'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { FileText, Edit, Trash2, Search, Calendar } from 'lucide-react'
import Link from 'next/link'
import { NoteDialog } from './note-dialog'
import { htmlToPlainText } from '@/lib/note-content'
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

interface NotesListProps {
  initialNotes: Note[]
}

export function NotesList({ initialNotes }: NotesListProps) {
  const { user } = useUser()
  const [notes, setNotes] = useState<Note[]>(initialNotes)
  const [decrypting, setDecrypting] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'title'>('newest')
  const [editingNote, setEditingNote] = useState<Note | null>(null)
  const [deleteNoteId, setDeleteNoteId] = useState<string | null>(null)

  useEffect(() => {
    if (!user?.id) {
      setDecrypting(false)
      return
    }
    let cancelled = false
    fetch('/api/notes')
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error('Failed to fetch'))))
      .then((data: { notes: Note[] }) => {
        if (cancelled) return
        const raw = (data.notes ?? []) as Note[]
        const withDates = raw.map((n) => ({
          ...n,
          createdAt: typeof n.createdAt === 'string' ? n.createdAt : (n.createdAt as Date).toISOString?.(),
          updatedAt: typeof n.updatedAt === 'string' ? n.updatedAt : (n.updatedAt as Date).toISOString?.(),
        }))
        return withDates
      })
      .then((list) => {
        if (cancelled || !list) return []
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
        if (!cancelled && Array.isArray(decrypted)) setNotes(decrypted)
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setDecrypting(false)
      })
    return () => {
      cancelled = true
    }
  }, [user])

  const filteredNotes = notes.filter(note =>
    note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    htmlToPlainText(note.content).toLowerCase().includes(searchTerm.toLowerCase())
  )

  const sortedNotes = [...filteredNotes].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      case 'oldest':
        return new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()
      case 'title':
        return a.title.localeCompare(b.title)
      default:
        return 0
    }
  })

  const handleDelete = async (noteId: string) => {
    try {
      const response = await fetch(`/api/notes/${noteId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setNotes(notes.filter(note => note.id !== noteId))
        setDeleteNoteId(null)
      }
    } catch (error) {
      console.error('Error deleting note:', error)
    }
  }

  const handleNoteUpdate = (updatedNote: Note) => {
    setNotes(notes.map(note => note.id === updatedNote.id ? updatedNote : note))
    setEditingNote(null)
  }


  if (decrypting) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Loading notes...</p>
      </div>
    )
  }

  if (notes.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">No notes yet</h3>
        <p className="text-muted-foreground mb-6">
          Create your first note to get started with organizing your thoughts.
        </p>
        <Button asChild>
          <Link href="/notes/new">
            <FileText className="h-4 w-4 mr-2" />
            Create your first note
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Search and Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search & Filter
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search notes..."
                value={searchTerm}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <Select value={sortBy} onValueChange={(value: 'newest' | 'oldest' | 'title') => setSortBy(value)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest first</SelectItem>
                <SelectItem value="oldest">Oldest first</SelectItem>
                <SelectItem value="title">Alphabetical</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Notes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedNotes.map((note) => (
          <Card key={note.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-lg line-clamp-2 mb-1">
                    {note.title}
                  </CardTitle>
                  {note.notebook && (
                    <div className="flex items-center gap-2 mb-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: note.notebook.color || '#3b82f6' }}
                      />
                      <span className="text-sm text-muted-foreground">
                        {note.notebook.title}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex gap-1 ml-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingNote(note)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDeleteNoteId(note.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="line-clamp-3 mb-4">
                {htmlToPlainText(note.content)}
              </CardDescription>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {new Date(note.updatedAt).toLocaleDateString()}
                </div>
                <Button variant="link" size="sm" asChild>
                  <Link href={`/notes/${note.id}`}>
                    Read more
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Note Dialog */}
      {editingNote && (
        <NoteDialog
          note={editingNote}
          onClose={() => setEditingNote(null)}
          onSave={handleNoteUpdate}
        />
      )}

      {/* Delete Confirmation */}
      {deleteNoteId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle>Delete Note</CardTitle>
              <CardDescription>
                Are you sure you want to delete this note? This action cannot be undone.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex gap-3">
              <Button
                variant="destructive"
                onClick={() => handleDelete(deleteNoteId)}
                className="flex-1"
              >
                Delete
              </Button>
              <Button
                variant="outline"
                onClick={() => setDeleteNoteId(null)}
                className="flex-1"
              >
                Cancel
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
