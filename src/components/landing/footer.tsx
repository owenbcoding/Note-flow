"use client";

import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  NotebookPen,
  Twitter,
  Github,
  Linkedin,
  Mail,
  ArrowUp,
} from "lucide-react";

const socialLinks = [
  { name: "Twitter", href: "https://twitter.com", icon: Twitter },
  { name: "GitHub", href: "https://github.com", icon: Github },
  { name: "LinkedIn", href: "https://linkedin.com", icon: Linkedin },
  { name: "Email", href: "mailto:support@noteflow.com", icon: Mail },
];

export function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="bg-muted/30 border-t mt-10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content: NoteFlow + Newsletter centered row */}
        <div className="py-16">
          <div className="flex flex-col md:flex-row justify-center items-center md:items-start gap-12 md:gap-16 lg:gap-24 max-w-4xl mx-auto">
            {/* Brand: left */}
            <div className="flex flex-col items-center md:items-start text-center md:text-left">
              <Link href="/" className="flex items-center space-x-2 mb-4 w-fit hover:opacity-90 transition-opacity">
                <NotebookPen className="h-8 w-8 text-primary" />
                <span className="text-2xl font-bold">NoteFlow</span>
              </Link>
              <p className="text-muted-foreground mb-6 max-w-sm">
                An intelligent note-taking app that helps you capture, organize, and find your thoughts effortlessly.
                Built for modern productivity with AI-powered note generation.
              </p>
              <div className="flex space-x-4">
                {socialLinks.map((social) => (
                  <Button
                    key={social.name}
                    variant="ghost"
                    size="icon"
                    asChild
                    className="hover:bg-primary/10"
                  >
                    <Link
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <social.icon className="h-5 w-5" />
                      <span className="sr-only">{social.name}</span>
                    </Link>
                  </Button>
                ))}
              </div>
            </div>

            {/* Newsletter: right */}
            <div className="flex flex-col items-center md:items-start text-center md:text-left min-w-0 w-full md:max-w-sm">
              <h3 className="text-2xl font-bold mb-4">Stay updated</h3>
              <p className="text-muted-foreground mb-6">
                Get the latest updates, tips, and new features delivered to your inbox.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 w-full">
                <input
                  type="email"
                  placeholder="Newsletter coming soon—stay tuned!"
                  className="flex-1 px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
                <Button className="px-8 py-3 sm:mt-0 shrink-0">
                  Subscribe
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                No spam, unsubscribe at any time.
              </p>
            </div>
          </div>
        </div>

        <Separator />

        {/* Bottom Footer */}
        <div className="py-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-6">
              <p className="text-sm text-muted-foreground">
                © 2026 NoteFlow. All rights reserved.
              </p>
              <div className="flex items-center space-x-4">
                <Badge variant="outline" className="text-xs">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  All systems operational
                </Badge>
              </div>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={scrollToTop}
              className="flex items-center space-x-2"
            >
              <ArrowUp className="h-4 w-4" />
              <span>Back to top</span>
            </Button>
          </div>
        </div>
      </div>
    </footer>
  );
}
