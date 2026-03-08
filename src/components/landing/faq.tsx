import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { HelpCircle } from "lucide-react";

const faqs = [
  {
    question: "How does the AI-powered organization work?",
    answer: "Our AI analyzes your note content and automatically suggests tags, categories, and connections between related notes. It learns from your writing patterns and preferences to provide increasingly accurate organization suggestions over time."
  },
  {
    question: "Is my data secure and private?",
    answer: "Absolutely. We use end-to-end encryption to protect your notes. Your data is encrypted before it leaves your device and can only be decrypted by you. We never have access to your actual note content, and we don't sell or share your data with third parties."
  },
  {
    question: "Can I import my existing notes?",
    answer: "Yes! We support importing from popular note-taking apps like Evernote, Notion, OneNote, and plain text files. Our import process preserves your formatting and structure as much as possible."
  },
  {
    question: "Does NoteFlow work offline?",
    answer: "Yes, NoteFlow works completely offline. You can create, edit, and organize notes without an internet connection. Your changes will sync automatically when you're back online."
  },
  {
    question: "What platforms are supported?",
    answer: "NoteFlow is available on web, iOS, Android, Windows, and macOS. All platforms sync seamlessly, so you can access your notes from any device."
  },
  {
    question: "How much does it cost?",
    answer: "NoteFlow is free. All features—including AI-powered organization, search, encryption, sync, and collaboration—are available at no cost. We believe everyone deserves great tools without a paywall."
  },
  {
    question: "Can I collaborate with others on notes?",
    answer: "Yes! You can share notes with others, collaborate in real-time, and manage permissions. Perfect for team projects, meeting notes, and shared knowledge bases. All included for free."
  },
  {
    question: "What file types can I attach to notes?",
    answer: "You can attach images, PDFs, documents, audio files, and more. We support most common file formats and provide preview capabilities for many file types directly within the app."
  }
];

export function FAQ() {
  return (
    <section id="faq" className="py-20 lg:py-32">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4">
            <HelpCircle className="w-4 h-4 mr-2" />
            FAQ
          </Badge>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-6">
            Frequently Asked{" "}
            <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Questions
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Everything you need to know about NoteFlow. Can&apos;t find the answer you&apos;re looking for? 
            Please chat with our friendly team.
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem 
                key={index} 
                value={`item-${index}`}
                className="border border-border rounded-lg px-6 py-2 hover:bg-muted/50 transition-colors"
              >
                <AccordionTrigger className="text-left font-medium hover:no-underline">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed pt-2">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        {/* Contact CTA */}
        <div className="text-center mt-16">
          <div className="bg-muted/50 rounded-2xl p-8 lg:p-12">
            <h3 className="text-2xl lg:text-3xl font-bold mb-4">
              Still have questions?
            </h3>
            <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">
              Our support team is here to help. Get in touch and we&apos;ll respond within 24 hours.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-primary text-primary-foreground px-8 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors">
                Contact Support
              </button>
              <button className="border border-border px-8 py-3 rounded-lg font-medium hover:bg-muted transition-colors">
                View Documentation
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
