"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Menu, X, NotebookPen, LayoutDashboard } from "lucide-react";
import { useUser } from "@clerk/nextjs";

type NavbarProps = {
  /** When false (Clerk disabled / dev), show Dashboard link so the app is usable without sign-in */
  clerkEnabled?: boolean;
};

function NavbarUI({
  showDashboard,
  isOpen,
  setIsOpen,
}: {
  showDashboard: boolean;
  isOpen: boolean;
  setIsOpen: (v: boolean) => void;
}) {
  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-[1fr_auto_1fr] h-16 items-center gap-4">
          <Link href="/" className="flex items-center space-x-2 w-fit hover:opacity-90 transition-opacity">
            <NotebookPen className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold">NoteFlow</span>
          </Link>
          <div className="hidden md:flex items-center justify-center space-x-8">
            <Link href="#features" className="text-sm font-medium hover:text-primary transition-colors">Features</Link>
            <Link href="#faq" className="text-sm font-medium hover:text-primary transition-colors">FAQ</Link>
            <Link href="#video" className="text-sm font-medium hover:text-primary transition-colors">See in action</Link>
          </div>
          <div className="flex items-center justify-end gap-4">
            <div className="hidden md:flex items-center space-x-4">
              {showDashboard ? (
                <Button asChild><Link href="/dashboard" className="flex items-center gap-2"><LayoutDashboard className="h-4 w-4" />Dashboard</Link></Button>
              ) : (
                <>
                  <Button variant="ghost" asChild><Link href="/sign-in">Sign In</Link></Button>
                  <Button asChild><Link href="/sign-up">Get Started</Link></Button>
                </>
              )}
            </div>
            <div className="md:hidden">
              <Button variant="ghost" size="icon" onClick={() => setIsOpen(!isOpen)}>
                {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            </div>
          </div>
        </div>
        {isOpen && (
          <div className="md:hidden border-t">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Link href="#features" className="block px-3 py-2 text-base font-medium hover:text-primary" onClick={() => setIsOpen(false)}>Features</Link>
              <Link href="#faq" className="block px-3 py-2 text-base font-medium hover:text-primary" onClick={() => setIsOpen(false)}>FAQ</Link>
              <Link href="#video" className="block px-3 py-2 text-base font-medium hover:text-primary" onClick={() => setIsOpen(false)}>See in action</Link>
              <div className="pt-4 space-y-2">
                {showDashboard ? (
                  <Button className="w-full" asChild><Link href="/dashboard" className="flex items-center justify-center gap-2"><LayoutDashboard className="h-4 w-4" />Dashboard</Link></Button>
                ) : (
                  <>
                    <Button variant="ghost" className="w-full justify-start" asChild><Link href="/sign-in">Sign In</Link></Button>
                    <Button className="w-full" asChild><Link href="/sign-up">Get Started</Link></Button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

/** Uses Clerk only when enabled; safe to render when Clerk is disabled */
export function Navbar({ clerkEnabled = true }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  if (!clerkEnabled) {
    return <NavbarUI showDashboard={true} isOpen={isOpen} setIsOpen={setIsOpen} />;
  }
  return <NavbarWithClerk isOpen={isOpen} setIsOpen={setIsOpen} />;
}

function NavbarWithClerk({ isOpen, setIsOpen }: { isOpen: boolean; setIsOpen: (v: boolean) => void }) {
  const { isSignedIn } = useUser();
  return <NavbarUI showDashboard={!!isSignedIn} isOpen={isOpen} setIsOpen={setIsOpen} />;
}
