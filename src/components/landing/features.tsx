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
    description: "Automatically categorize and tag your notes with intelligent AI that learns from your writing patterns.",
    badge: "New"
  },
  {
    icon: Search,
    title: "Lightning-Fast Search",
    description: "Find any note instantly with our advanced search that understands context and meaning, not just keywords.",
    badge: null
  },
  {
    icon: Shield,
    title: "End-to-End Encryption",
    description: "Your notes are protected with military-grade encryption. Only you can access your thoughts and ideas.",
    badge: null
  },
  {
    icon: Smartphone,
    title: "Cross-Platform Sync",
    description: "Access your notes anywhere, anytime. Seamlessly sync across all your devices in real-time.",
    badge: null
  },
  {
    icon: Zap,
    title: "Instant Capture",
    description: "Capture ideas the moment they strike with our quick-add feature and voice-to-text capabilities.",
    badge: null
  },
  {
    icon: Users,
    title: "Collaborative Notes",
    description: "Share and collaborate on notes with your team. Perfect for meetings, projects, and brainstorming sessions.",
    badge: null
  },
  {
    icon: FileText,
    title: "Rich Text Editor",
    description: "Format your notes with our intuitive rich text editor. Add images, links, and structure your thoughts beautifully.",
    badge: null
  },
  {
    icon: Lock,
    title: "Privacy First",
    description: "We believe in your privacy. Your data stays yours, with no ads, no tracking, and no data selling.",
    badge: null
  },
  {
    icon: Cloud,
    title: "Automatic Backup",
    description: "Never lose your notes again. Automatic cloud backup ensures your ideas are always safe and accessible.",
    badge: null
  }
];

export function Features() {
  return (
    <section id="features" className="py-20 lg:py-32 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4">
            <Sparkles className="w-4 h-4 mr-2" />
            Features
          </Badge>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-6">
            Everything you need to{" "}
            <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              organize your thoughts
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

        {/* CTA Section */}
        <div className="text-center mt-16">
          <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-2xl p-8 lg:p-12">
            <h3 className="text-2xl lg:text-3xl font-bold mb-4">
              Ready to transform your note-taking?
            </h3>
            <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">
              Join thousands of users who have already revolutionized their productivity with NoteFlow.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/signup"
                className="inline-flex justify-center bg-primary text-primary-foreground px-8 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors"
              >
                Get started free
              </a>
              <a
                href="#faq"
                className="inline-flex justify-center border border-border px-8 py-3 rounded-lg font-medium hover:bg-muted transition-colors"
              >
                Read FAQ
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
