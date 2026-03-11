import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Brain, 
  Search, 
  Shield, 
  Smartphone, 
  Zap, 
  Users,
  FileText,
  Lock,
  Cloud,
  Sparkles
} from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "AI-Powered Organization",
    description: "Generate well-structured notes with AI. Choose from meeting notes, study notes, ideas, journal entries, and more—all organized by type.",
    badge: null
  },
  {
    icon: FileText,
    title: "Rich Text Editor",
    description: "Format your notes with our intuitive rich text editor. Add images, links, and structure your thoughts beautifully.",
    badge: null
  },
  {
    icon: Smartphone,
    title: "Cross-Platform Sync",
    description: "Access your notes anywhere, anytime. Sync across devices and import from GitHub—your notes follow you wherever you go.",
    badge: null
  },
  {
    icon: Search,
    title: "Lightning-Fast Search",
    description: "Find any note instantly with our advanced search that understands context and meaning, not just keywords.",
    badge: "Coming Soon"
  },
  {
    icon: Shield,
    title: "End-to-End Encryption",
    description: "Your notes are protected with military-grade encryption. Only you can access your thoughts and ideas.",
    badge: "Coming Soon"
  },
  {
    icon: Zap,
    title: "Instant Capture",
    description: "Capture ideas the moment they strike with our quick-add feature and voice-to-text capabilities.",
    badge: "Coming Soon"
  },
  {
    icon: Users,
    title: "Collaborative Notes",
    description: "Share and collaborate on notes with your team. Perfect for meetings, projects, and brainstorming sessions.",
    badge: "Coming Soon"
  },
  {
    icon: Lock,
    title: "Privacy First",
    description: "We believe in your privacy. Your data stays yours, with no ads, no tracking, and no data selling.",
    badge: "Coming Soon"
  },
  {
    icon: Cloud,
    title: "Automatic Backup",
    description: "Never lose your notes again. Automatic cloud backup ensures your ideas are always safe and accessible.",
    badge: "Coming Soon"
  }
];

export function Features() {
  return (
    <section id="features" className="py-20 lg:py-5 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4">
            <Sparkles className="w-4 h-4 mr-2" />
            Features
          </Badge>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-6">
            <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Organize your thoughts
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Powerful features designed to enhance your productivity and help you capture, organize, and find your notes effortlessly.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="p-3 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  {feature.badge && (
                    <Badge variant="secondary" className="text-xs">
                      {feature.badge}
                    </Badge>
                  )}
                </div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base leading-relaxed">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
