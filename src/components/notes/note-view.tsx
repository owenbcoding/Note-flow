'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Edit, Calendar, BookOpen } from 'lucide-react'
import Link from 'next/link'
import { NoteDialog } from './note-dialog'

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
  const [isEditing, setIsEditing] = useState(false)
  const [currentNote, setCurrentNote] = useState(note)

  const handleNoteUpdate = (updatedNote: Note) => {
    setCurrentNote(updatedNote)
    setIsEditing(false)
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
            <pre className="whitespace-pre-wrap font-sans text-base leading-relaxed">
              {currentNote.content}
            </pre>
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
