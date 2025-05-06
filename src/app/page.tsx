'use client';

import { useLinkSummarizer } from '@/hooks/use-link-summarizer';
import { SummarizeForm } from '@/components/summarize-form';
import { LinkList } from '@/components/link-list';
import { Button } from '@/components/ui/button';
import { Download, ShieldAlert } from 'lucide-react';
import { LinkIcon } from '@/components/icons/link-icon';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";


export default function Home() {
  const { links, isLoading, addLink, deleteLink, exportToMarkdown, clearAllLinks } =
    useLinkSummarizer();

  return (
    <div className="min-h-screen flex flex-col items-center justify-start p-4 sm:p-8 bg-gradient-to-br from-background to-slate-900/50">
      <main className="container mx-auto max-w-4xl w-full bg-card/80 backdrop-blur-md p-6 sm:p-10 rounded-xl shadow-2xl border border-border mt-8 mb-8">
        <header className="mb-8 text-center">
          <div className="inline-flex items-center justify-center bg-primary/10 p-3 rounded-full mb-4">
            <LinkIcon className="h-10 w-10 text-primary" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary via-accent to-primary-foreground">
            Link Summarizer
          </h1>
          <p className="mt-3 text-lg text-muted-foreground max-w-xl mx-auto">
            Paste any website link to get a concise AI-generated summary. Build your list and export it anytime.
          </p>
        </header>

        <section className="mb-10">
          <SummarizeForm onSubmit={addLink} isLoading={isLoading} />
        </section>

        <section className="mb-8">
           <Alert className="mb-6 bg-secondary/30 border-secondary">
            <ShieldAlert className="h-5 w-5 text-primary" />
            <AlertTitle className="font-semibold text-primary-foreground/90">AI Usage Note</AlertTitle>
            <AlertDescription className="text-muted-foreground">
              The AI decides what information to include in the summary. Results may vary based on website content and structure.
            </AlertDescription>
          </Alert>
          <LinkList links={links} onDelete={deleteLink} onClearAll={clearAllLinks} isLoading={isLoading && links.length === 0} />
        </section>

        {links.length > 0 && (
          <section className="text-center">
            <Button
              onClick={exportToMarkdown}
              className="w-full sm:w-auto h-12 text-base"
              variant="outline"
            >
              <Download className="mr-2 h-5 w-5" />
              Export as Markdown
            </Button>
          </section>
        )}
      </main>
      <footer className="py-8 text-center text-muted-foreground text-sm">
        <p>&copy; {new Date().getFullYear()} Link Summarizer. Minimalist design for maximum focus.</p>
      </footer>
    </div>
  );
}
