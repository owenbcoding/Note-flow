'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Github, Loader2 } from 'lucide-react'
import { getOrCreateUserKey, encryptNote } from '@/lib/note-crypto'

interface ImportRepoFormProps {
  compact?: boolean
}

export function ImportRepoForm({ compact }: ImportRepoFormProps) {
  const router = useRouter()
  const { user } = useUser()
  const [repoInput, setRepoInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleImport = async () => {
    const trimmed = repoInput.trim()
    if (!trimmed) {
      setError('Enter owner/repo (e.g. facebook/react)')
      return
    }
    const parts = trimmed.split('/').map((p) => p.trim()).filter(Boolean)
    if (parts.length < 2) {
      setError('Enter owner/repo (e.g. facebook/react)')
      return
    }
    if (!user?.id) {
      setError('You must be signed in to import.')
      return
    }
    const [owner, repo] = parts
    setIsLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/import/github', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ owner, repo }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(data.error || 'Import failed')
        return
      }
      const { notebookId, files } = data as { notebookId: string; files: { title: string; content: string }[] }
      if (!notebookId || !Array.isArray(files) || files.length === 0) {
        setRepoInput('')
        router.refresh()
        return
      }
      const key = await getOrCreateUserKey(user.id)
      for (const file of files) {
        const encrypted = await encryptNote({ title: file.title, content: file.content }, key)
        await fetch('/api/notes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ encryptedPayload: encrypted, notebookId }),
        })
      }
      setRepoInput('')
      router.refresh()
    } catch {
      setError('Import failed')
    } finally {
      setIsLoading(false)
    }
  }

  if (compact) {
    return (
      <Card className="py-4">
        <CardHeader className="px-6 py-0 pb-2">
          <CardTitle className="flex items-center gap-1.5 text-sm">
            <Github className="h-4 w-4" />
            Import from GitHub
          </CardTitle>
          <CardDescription className="text-xs">
            Import .md files from a public repo
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 px-6">
          <div className="flex flex-col gap-2 sm:flex-row">
            <Input
              placeholder="owner/repo"
              value={repoInput}
              onChange={(e) => setRepoInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleImport()}
              disabled={isLoading}
              className="h-8 text-sm"
            />
            <Button onClick={handleImport} disabled={isLoading} size="sm" className="gap-1.5 shrink-0 h-8">
              {isLoading ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <>
                  <Github className="h-3 w-3" />
                  Import
                </>
              )}
            </Button>
          </div>
          {error && <p className="text-xs text-destructive">{error}</p>}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Github className="h-5 w-5" />
          Import from GitHub repo
        </CardTitle>
        <CardDescription>
          Import .md files from a public GitHub repo. Notes appear in a new notebook.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex gap-2">
          <Input
            placeholder="owner/repo (e.g. facebook/react)"
            value={repoInput}
            onChange={(e) => setRepoInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleImport()}
            disabled={isLoading}
            className="flex-1"
          />
          <Button onClick={handleImport} disabled={isLoading} className="gap-2 shrink-0">
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Importing…
              </>
            ) : (
              <>
                <Github className="h-4 w-4" />
                Import
              </>
            )}
          </Button>
        </div>
        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}
      </CardContent>
    </Card>
  )
}
