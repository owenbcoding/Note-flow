'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { AINoteGenerator } from '@/components/ai/ai-note-generator'
import { Save, Loader2, ArrowLeft, Wand2, LayoutDashboard } from 'lucide-react'
import Link from 'next/link'
import { getOrCreateUserKey, encryptNote } from '@/lib/note-crypto'

interface Notebook {
  id: string
  title: string
  color?: string
}

interface NewNoteFormProps {
  notebooks: Notebook[]
}

export function NewNoteForm({ notebooks }: NewNoteFormProps) {
  const router = useRouter()
  const { user } = useUser()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [notebookId, setNotebookId] = useState<string>('none')
  const [isSaving, setIsSaving] = useState(false)
  const [showAIGenerator, setShowAIGenerator] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) return
    if (!user?.id) {
      setError('You must be signed in to save notes.')
      return
    }

    setIsSaving(true)
    setError(null)
    try {
      const key = await getOrCreateUserKey(user.id)
      const encrypted = await encryptNote(
        { title: title.trim(), content: content.trim() },
        key
      )
      const response = await fetch('/api/notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          encryptedPayload: encrypted,
          notebookId: notebookId === 'none' ? null : notebookId,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        router.push(`/notes/${data.note.id}`)
      } else {
        const data = await response.json().catch(() => ({}))
        setError(data.error || 'Failed to create note. Please try again.')
      }
    } catch (err) {
      console.error('Error creating note:', err)
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleAIGeneratedContent = (generatedContent: string) => {
    setContent(generatedContent)
    if (!title.trim()) {
      // Extract a title from the generated content
      const lines = generatedContent.split('\n')
      const firstLine = lines[0].replace(/^#+\s*/, '').trim()
      if (firstLine && firstLine.length < 100) {
        setTitle(firstLine)
      }
    }
    setShowAIGenerator(false)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/notes">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Notes
            </Link>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard">
              <LayoutDashboard className="h-4 w-4 mr-2" />
              Dashboard
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Create New Note</h1>
            <p className="text-muted-foreground">
              Write your thoughts and ideas
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowAIGenerator(!showAIGenerator)}
          >
            <Wand2 className="h-4 w-4 mr-2" />
            AI Assistant
          </Button>
          <Button
            onClick={handleSave}
            disabled={!title.trim() || !content.trim() || isSaving}
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Note
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* AI Generator */}
        {showAIGenerator && (
          <div className="lg:col-span-1">
            <AINoteGenerator onGeneratedContent={handleAIGeneratedContent} />
          </div>
        )}

        {/* Note Form */}
        <div className={`${showAIGenerator ? 'lg:col-span-2' : 'lg:col-span-3'}`}>
          <Card>
            <CardHeader>
              <CardTitle>Note Details</CardTitle>
              <CardDescription>
                Fill in the details for your new note
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {error && (
                <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                  <p className="text-sm text-destructive font-medium">Error</p>
                  <p className="text-sm text-destructive/80 mt-1">{error}</p>
                </div>
              )}
              <div className="space-y-2">
                <label className="text-sm font-medium">Title</label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter note title..."
                  className="text-lg"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Notebook (Optional)</label>
                <Select value={notebookId} onValueChange={setNotebookId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a notebook" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No notebook</SelectItem>
                    {notebooks.map((notebook) => (
                      <SelectItem key={notebook.id} value={notebook.id}>
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: notebook.color || '#3b82f6' }}
                          />
                          {notebook.title}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Content</label>
                <Textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Write your note content here..."
                  rows={16}
                  className="resize-none"
                />
              </div>

              <div className="flex justify-end">
                <Button
                  onClick={handleSave}
                  disabled={!title.trim() || !content.trim() || isSaving}
                  size="lg"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating Note...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Create Note
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
