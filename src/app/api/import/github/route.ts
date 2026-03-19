import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

/**
 * POST /api/import/github
 * Body: { owner: string, repo: string }
 * Fetches .md files from a public GitHub repository and creates a notebook for the current user.
 * Returns notebookId and file contents so the client can encrypt and create notes (E2E).
 * The server never sees or stores plaintext note content for imports.
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { owner, repo } = body as { owner?: string; repo?: string }
    if (!owner || !repo || typeof owner !== 'string' || typeof repo !== 'string') {
      return NextResponse.json(
        { error: 'Body must include "owner" and "repo" (e.g., "facebook", "react")' },
        { status: 400 }
      )
    }

    const trimmedOwner = owner.trim()
    const trimmedRepo = repo.trim()
    if (!trimmedOwner || !trimmedRepo) {
      return NextResponse.json({ error: 'owner and repo cannot be empty' }, { status: 400 })
    }

    const dbUser = await prisma.user.findUnique({ where: { clerkId: user.id } })
    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const repoRes = await fetch(
      `https://api.github.com/repos/${encodeURIComponent(trimmedOwner)}/${encodeURIComponent(trimmedRepo)}`,
      {
        headers: { Accept: 'application/vnd.github.v3+json' },
        next: { revalidate: 0 },
      }
    )
    if (!repoRes.ok) {
      const err = await repoRes.json().catch(() => ({}))
      return NextResponse.json(
        { error: (err as { message?: string }).message || `GitHub repo not found: ${trimmedOwner}/${trimmedRepo}` },
        { status: 404 }
      )
    }
    const repoData = (await repoRes.json()) as { default_branch: string }
    const defaultBranch = repoData.default_branch

    const treeRes = await fetch(
      `https://api.github.com/repos/${encodeURIComponent(trimmedOwner)}/${encodeURIComponent(trimmedRepo)}/git/trees/${defaultBranch}?recursive=1`,
      {
        headers: { Accept: 'application/vnd.github.v3+json' },
        next: { revalidate: 0 },
      }
    )
    if (!treeRes.ok) {
      return NextResponse.json(
        { error: 'Could not fetch repo file tree' },
        { status: 502 }
      )
    }
    const treeData = (await treeRes.json()) as {
      tree: Array<{ path: string; type: string; sha?: string }>
    }
    const mdFiles = (treeData.tree || []).filter(
      (f) => f.type === 'blob' && f.path.toLowerCase().endsWith('.md')
    )
    if (mdFiles.length === 0) {
      return NextResponse.json(
        { error: `No .md files found in ${trimmedOwner}/${trimmedRepo}` },
        { status: 404 }
      )
    }

    const notebookTitle = `${trimmedOwner}/${trimmedRepo}`
    const existingNotebook = await prisma.notebook.findFirst({
      where: { userId: dbUser.id, title: notebookTitle },
    })
    let notebookId: string
    if (existingNotebook) {
      notebookId = existingNotebook.id
    } else {
      const created = await prisma.notebook.create({
        data: {
          title: notebookTitle,
          description: 'Imported from GitHub',
          userId: dbUser.id,
        },
      })
      notebookId = created.id
    }

    const limit = 50
    const files: { title: string; content: string }[] = []

    for (let i = 0; i < Math.min(mdFiles.length, limit); i++) {
      const file = mdFiles[i]
      if (!file.path) continue

      const fileRes = await fetch(
        `https://api.github.com/repos/${encodeURIComponent(trimmedOwner)}/${encodeURIComponent(trimmedRepo)}/contents/${encodeURIComponent(file.path)}`,
        {
          headers: { Accept: 'application/vnd.github.v3.raw' },
          next: { revalidate: 0 },
        }
      )
      if (!fileRes.ok) continue

      const content = await fileRes.text()
      const title = file.path.split('/').pop()?.replace(/\.md$/i, '') || file.path
      files.push({ title, content })
    }

    return NextResponse.json({
      notebookId,
      notebookTitle,
      files,
    })
  } catch (error) {
    console.error('GitHub import error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Import failed' },
      { status: 500 }
    )
  }
}
