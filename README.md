# Note‑Taking App

A lightweight note‑taking web app built with Next.js and TypeScript. This repository currently contains the application scaffold; domain features will be iterated on here.

## What you can do

You can connect a GitHub repository that uses Markdown (`.md`) or MDX (`.mdx`) files to the app. Your notes are stored and accessible online, so you can view and manage them from anywhere—no need to keep files only on your local machine or view on the go with your mobile 

what we recommend you to do is when you are learning is to take your notes down in a app such as Notion or obsidian which alows you to export the notes as a markdown file and then create a repo and upload the mark down files to that repo open up noteflow then connect that repo with the notes you added to to store them online.

## Quick Start

Prerequisites: Node.js 18+ and your preferred package manager (npm, yarn, pnpm, or bun).

Copy `.env.example` to `.env` and set at least `DATABASE_URL` (e.g. [Neon](https://neon.tech) free tier) and Clerk keys. Then:

```bash
npm install
npx prisma generate
npx prisma migrate deploy
npm run dev
```

Then open http://localhost:3002 in your browser.

You can start editing the UI by modifying `app/page.tsx`. The page will auto‑update during development.

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
command to setting up the project from scratch

- npx create-next-app@latest
- cursor .
- npm run dev

