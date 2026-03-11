"use client";

import { Play } from "lucide-react";

export function VideoSection() {
  return (
    <section id="video" className="py-20 lg:py-24 bg-muted/20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
            See it in action
          </h2>
          <p className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto">
            A quick look at how NoteFlow helps you capture and organize your notes.
          </p>

          {/* Video container: replace the placeholder with your <video> or embed when ready */}
          <div className="relative aspect-video w-full max-w-4xl mx-auto rounded-2xl border border-border bg-muted/50 overflow-hidden shadow-lg">
            {/* Placeholder until you add your video — replace this div with e.g.:
                <video src="/your-demo.mp4" controls className="w-full h-full object-cover" />
                or an iframe for YouTube/Vimeo */}
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-muted-foreground">
              <div className="p-4 rounded-full bg-primary/10">
                <Play className="h-12 w-12 text-primary" />
              </div>
              <p className="text-sm font-medium">Demo video coming soon</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
