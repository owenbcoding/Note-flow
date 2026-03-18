"use client";

import { useRef, useState } from "react";
import { Play } from "lucide-react";

export function VideoSection() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  function handlePlayPauseClick() {
    const el = videoRef.current;
    if (!el) return;

    if (el.paused || el.ended) {
      void el.play();
    } else {
      el.pause();
    }
  }

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

          <p className="text-sm sm:text-base text-muted-foreground mb-4">
            Click on the video for a teaser
          </p>

          <div className="relative aspect-video w-full max-w-4xl mx-auto rounded-2xl border border-border bg-muted/50 overflow-hidden shadow-lg">
            <video
              src="/assets/Landing-video.mp4"
              controls
              playsInline
              preload="metadata"
              ref={videoRef}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onEnded={() => setIsPlaying(false)}
              onClick={handlePlayPauseClick}
              className="absolute inset-0 h-full w-full object-cover cursor-pointer"
            />

            {!isPlaying && (
              <button
                type="button"
                onClick={handlePlayPauseClick}
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 grid place-items-center rounded-full bg-background/80 backdrop-blur border border-border shadow-lg h-16 w-16 sm:h-20 sm:w-20 transition hover:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                aria-label="Play teaser"
              >
                <Play className="h-8 w-8 sm:h-10 sm:w-10 text-foreground ml-0.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
