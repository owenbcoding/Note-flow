# Note‑Taking App

A lightweight note‑taking web app built with Next.js and TypeScript. This repository currently contains the application scaffold; domain features will be iterated on here.

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

### First Prompt :
You are a professional software developer with 10 years of frontend and ux experience. Take a look at my nextjs setup. I want to create a simple note-taking app and right now i want to focus on landing side of things.

Modify my root page.tsx.

Create a component folder to store all components, make sure you create relevant folders inside of this, example since we’re working on landing, call the first folder landing and create components in those. For now focus only on landing and create a landing page with reference design. I basically want an Hero, Features, FAQ, Navbar, footer. Use my shadcn components for design purposes. 

### Next Prompt :
Shadcn is already installed in my code, but get components you’ll need.

Then takea a look at how Neon works: https://neon.com/ ( but dont prompt it).

### Next Prompt : 
npx prisma generate

npx prisma db push

Then create and up a clerk account https://clerk.com/docs/nextjs/getting-started/quickstart

### Next prompt!
Create a complete notes dashboard with CRUD operations. I want to add, edit, and delete notes with title, content, and dates. Sort by newest first.
Include:

API routes: /api/notes and /api/notes/[id]
Components: NoteCard, NoteDialog, updated dashboard page
Prisma Note model with userId relation
Install: npm install clsx tailwind-merge and npx shadcn add textarea dialog
Add cn utility function to utils.ts
Grid layout (responsive), loading states, error handling

Use shadcn components and follow our design style. Make it complete and working in one go.

### Last prompt for this project
import OpenAI from "openai";
const client = new OpenAI();

const response = await client.responses.create({
  model: "gpt-5",
  input: "Write a short bedtime story about a unicorn.",
});

console.log(response.output_text);

Above is the documentation for OPENAI API, I want to have ai text generation capabilities inside my application, help me integrate this api, and give a button to user so that they can generate their notes with ai.

