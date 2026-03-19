import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { HelpCircle } from "lucide-react";

const faqs = [
  {
    question: "How does the AI-powered organization work?",
    answer: "Our AI helps you generate well-structured notes from simple prompts. Choose a note type (meeting, study, journal, etc.), describe what you want to write about, and the AI will create organized content for you."
  },
  {
    question: "Is my data secure and private?",
    answer: "Yes. We use end-to-end encryption to protect your notes. Your data is encrypted before it leaves your device and can only be decrypted by you. We never have access to your note content, and we don't sell or share your data with third parties."
  },
  {
    question: "Can I import my existing notes?",
    answer: "Yes! You can import Markdown files from GitHub repositories. Simply provide the repository name (e.g., owner/repo), and we'll import all .md files into a dedicated notebook in your account."
  },
  {
    question: "Does NoteFlow work offline?",
    answer: "NoteFlow is a web-based application that requires an internet connection to access and sync your notes. However, your browser may cache recently viewed notes for quick access."
  },
  {
    question: "What platforms are supported?",
    answer: "NoteFlow is a web application that works on any device with a modern web browser—desktop, tablet, or mobile. Access your notes from any platform without installing native apps."
  },
  {
    question: "How much does it cost?",
    answer: "NoteFlow is free. All features—including AI-powered note generation, GitHub import, and end-to-end encryption—are available at no cost. We believe everyone deserves great tools without a paywall."
  },
  {
    question: "Can I collaborate with others on notes?",
    answer: "Currently, NoteFlow focuses on personal note-taking. Each user has their own private collection of notes with end-to-end encryption. Collaboration features may be added in the future."
  },
  {
    question: "What file types can I attach to notes?",
    answer: "NoteFlow currently supports rich text content with images and links. You can format your notes with headings, lists, bold, italic, and other standard text formatting options."
  }
];

export function FAQ() {
  return (
    <section id="faq" className="py-20 lg:py-5">
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
            Everything you need to know about NoteFlow. Can&apos;t find what you&apos;re looking for? 
            Feel free to reach out to our team.
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
      </div>
    </section>
  );
}
