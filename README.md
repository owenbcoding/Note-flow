# Note-Taking App

A lightweight note-taking web app built with Next.js and TypeScript. This repository contains the application scaffold with domain features being actively developed.

## What you can do

You can connect a GitHub repository containing Markdown (`.md`) or MDX (`.mdx`) files to the app. Your notes are stored and accessible online, so you can view and manage them from anywhere without keeping files solely on your local machine.

For learning and note-taking, we recommend using an app like Notion or Obsidian that allows you to export notes as Markdown files. Then, create a repository and upload the Markdown files. Finally, open NoteFlow and connect that repository to store your notes online.

## Quick Start

Prerequisites: Node.js 18+ and your preferred package manager (npm, yarn, pnpm, or bun).

Copy `.env.example` to `.env` and set at least `DATABASE_URL` (e.g., [Neon](https://neon.tech) free tier) and Clerk keys. Then:

**Security:** Keep secrets (e.g., `DATABASE_URL`, `CLERK_SECRET_KEY`) in server environment variables only—never prefix them with `NEXT_PUBLIC_` or they will be exposed to the browser. When deploying, set these in your host's environment variables (e.g., Vercel project settings). Notes are encrypted end-to-end (E2E) in the browser; see [docs/E2E_SYNC.md](docs/E2E_SYNC.md) for sync script and key handling.

```bash
npm install
npx prisma generate
npx prisma migrate deploy
npm run dev
```

Then open http://localhost:3002 in your browser.

You can start editing the UI by modifying `app/page.tsx`. The page will auto-update during development.

## Scripts

- `npm run dev`: Start the Next.js development server
- `npm run build`: Create a production build
- `npm run start`: Start the production server (after build)
- `npm run lint`: Lint the codebase

## Project Structure

- `app/`: Routes and UI (App Router). Entry page is `app/page.tsx`.
- `public/`: Static assets served at the root path.

## Tech Stack

- **Framework**: Next.js (App Router)
- **Language**: TypeScript

## Deployment

You can deploy to any platform that supports Node.js. For a streamlined experience, see the Next.js deployment guide: https://nextjs.org/docs/app/building-your-application/deploying

---

If you have ideas or run into issues, feel free to open an issue or PR.

## Creating the project from scratch
Commands to set up the project from scratch

- npx create-next-app@latest
- cursor .
- npm run dev
