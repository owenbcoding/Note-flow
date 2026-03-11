import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Sparkles, Users, Zap } from "lucide-react";
import Link from "next/link";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="flex justify-center mb-8">
            <Badge variant="secondary" className="px-4 py-2 text-sm">
              <Sparkles className="w-4 h-4 mr-2" />
              Free forever • Sync from NOTES or GitHub
            </Badge>
          </div>

          {/* Main Heading */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
            Your notes,{" "}
            <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              one place
            </span>
          </h1>

          {/* Subheading */}
a          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
            A free multi-user app. Import your NOTES directory or GitHub repo into your profile—or write in the app. AI-powered organization, no paid tier.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button size="lg" className="text-lg px-8 py-6" asChild>
              <Link href="/signup">
                Get started free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="text-lg px-8 py-6" asChild>
              <Link href="#features">See how it works</Link>
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-2xl mx-auto">
            <div className="flex flex-col items-center">
              <div className="flex items-center text-2xl font-bold text-primary mb-2">
                <Users className="w-6 h-6 mr-2" />
                Free
              </div>
              <p className="text-sm text-muted-foreground">Multi-user app</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="flex items-center text-2xl font-bold text-primary mb-2">
                <Zap className="w-6 h-6 mr-2" />
                Sync
              </div>
              <p className="text-sm text-muted-foreground">NOTES or GitHub</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="flex items-center text-2xl font-bold text-primary mb-2">
                <Sparkles className="w-6 h-6 mr-2" />
                AI
              </div>
              <p className="text-sm text-muted-foreground">Powered</p>
            </div>
          </div>
        </div>

        {/* Background decoration */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl"></div>
        </div>
      </div>
    </section>
  );
}
