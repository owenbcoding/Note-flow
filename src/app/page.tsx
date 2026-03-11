import { Navbar } from "@/components/landing/navbar";
import { Hero } from "@/components/landing/hero";
import { VideoSection } from "@/components/landing/video-section";
import { Features } from "@/components/landing/features";
import { FAQ } from "@/components/landing/faq";
import { Footer } from "@/components/landing/footer";
import { isClerkEnabled } from "@/lib/auth";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar clerkEnabled={isClerkEnabled()} />
      <main>
        <Hero />
        <VideoSection />
        <Features />
        <FAQ />
      </main>
      <Footer />
    </div>
  );
}
