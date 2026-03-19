import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { isClerkEnabled } from "@/lib/auth";
import ClerkProviderWrapper from "@/components/providers/clerk-provider-wrapper";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NoteFlow - Intelligent Note-Taking",
  description: "Organize your thoughts and capture ideas with AI-powered note generation. Import from GitHub or write directly in the app.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ClerkProviderWrapper enabled={isClerkEnabled()}>
          {children}
        </ClerkProviderWrapper>
      </body>
    </html>
  );
}
