// src/hooks/use-link-summarizer.ts
'use client';

import { useState, useEffect, useCallback } from 'react';
import type { SummarizedLink } from '@/types';
import { getStoredLinks, storeLinks } from '@/lib/local-storage';
import { summarizeWebsite } from '@/ai/flows/summarize-website';
import { useToast } from '@/hooks/use-toast';

export function useLinkSummarizer() {
  const [links, setLinks] = useState<SummarizedLink[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setLinks(getStoredLinks());
  }, []);

  const addLink = useCallback(
    async (originalUrl: string) => {
      setIsLoading(true);
      const jinaUrl = `https://r.jina.ai/${originalUrl}`;
      try {
        const result = await summarizeWebsite({ url: jinaUrl });
        if (result.summary && result.summary !== 'Failed to retrieve website content.' && result.summary !== 'No summary available.' && result.summary !== 'Website content is too short to summarize (less than 1000 characters).') {
          const newLink: SummarizedLink = {
            id: crypto.randomUUID(),
            url: originalUrl, // Store the original URL for display
            summary: result.summary,
            createdAt: Date.now(),
          };
          const updatedLinks = [newLink, ...links];
          setLinks(updatedLinks);
          storeLinks(updatedLinks);
          toast({
            title: 'Link Summarized',
            description: `Successfully summarized ${originalUrl}`,
          });
        } else {
          let description = `Could not summarize ${originalUrl}.`;
          if (result.summary === 'Failed to retrieve website content.') {
            description = 'Failed to retrieve content from the website. It might be inaccessible or protected.';
          } else if (result.summary === 'No summary available.') {
             description = 'The AI could not generate a summary for this content.';
          } else if (result.summary === 'Website content is too short to summarize (less than 1000 characters).') {
            description = 'The website content is too short to provide a meaningful summary.';
          }
          toast({
            variant: 'destructive',
            title: 'Summarization Issue',
            description: description,
          });
        }
      } catch (error) {
        console.error('Error summarizing website:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'An unexpected error occurred while summarizing the link.',
        });
      } finally {
        setIsLoading(false);
      }
    },
    [links, toast]
  );

  const deleteLink = useCallback(
    (id: string) => {
      const updatedLinks = links.filter((link) => link.id !== id);
      setLinks(updatedLinks);
      storeLinks(updatedLinks);
      toast({
        title: 'Link Deleted',
        description: 'The link has been removed from your list.',
      });
    },
    [links, toast]
  );

  const updateSummary = useCallback(
    (id: string, newSummary: string) => {
      const updatedLinks = links.map((link) =>
        link.id === id ? { ...link, summary: newSummary, updatedAt: Date.now() } : link // Added updatedAt
      );
      setLinks(updatedLinks);
      storeLinks(updatedLinks);
      toast({
        title: 'Summary Updated',
        description: 'The summary has been successfully updated.',
      });
    },
    [links, toast]
  );

  const exportToMarkdown = useCallback(() => {
    if (links.length === 0) {
      toast({
        variant: 'destructive',
        title: 'No links to export',
        description: 'Add some links before exporting.',
      });
      return;
    }

    const markdownContent = links
      .map((link) => `## [${link.url}](${link.url})\n\n${link.summary}\n\n---\n`)
      .join('\n');

    const blob = new Blob([markdownContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'summarized_links.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({
      title: 'Export Successful',
      description: 'Your links have been exported to markdown.',
    });
  }, [links, toast]);

  const clearAllLinks = useCallback(() => {
    setLinks([]);
    storeLinks([]);
    toast({
      title: 'All Links Cleared',
      description: 'Your list of links has been cleared.',
    });
  }, [toast]);

  const importFromMarkdown = useCallback((file: File) => {
    setIsLoading(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (!content) {
        toast({
          variant: 'destructive',
          title: 'Import Failed',
          description: 'The file is empty or could not be read.',
        });
        setIsLoading(false);
        return;
      }

      try {
        const importedLinks: SummarizedLink[] = [];
        const sections = content.split('---').map(s => s.trim()).filter(s => s);

        sections.forEach(section => {
          const urlMatch = section.match(/^## \[(.*?)\]\((.*?)\)/);
          if (urlMatch && urlMatch[1] && urlMatch[2]) {
            const url = urlMatch[2]; // The captured URL
            const summary = section.substring(urlMatch[0].length).trim();
            if (summary) { // Ensure summary is not empty
              importedLinks.push({
                id: crypto.randomUUID(),
                url: url,
                summary: summary,
                createdAt: Date.now(), // Set current time for imported links
                                       // For more sophisticated import, you could try to parse a date if present
              });
            }
          }
        });
        
        if (importedLinks.length === 0 && sections.length > 0) {
          toast({
            variant: 'destructive',
            title: 'Import Error',
            description: 'No valid links found in the Markdown file. Please ensure it follows the exported format (e.g., ## [URL_TEXT](URL_LINK) --- SUMMARY ---).',
          });
           setIsLoading(false);
          return;
        }
        
        if (importedLinks.length === 0 && sections.length === 0) {
           toast({
            variant: 'destructive',
            title: 'Import Failed',
            description: 'No content found in the file or it is not in the correct Markdown format.',
          });
           setIsLoading(false);
          return;
        }

        // Add to existing links, avoiding duplicates by URL
        const currentLinkUrls = new Set(links.map(link => link.url));
        const newLinks = importedLinks.filter(il => !currentLinkUrls.has(il.url));
        
        const updatedLinks = [...newLinks, ...links].sort((a, b) => b.createdAt - a.createdAt);
        
        setLinks(updatedLinks);
        storeLinks(updatedLinks);
        toast({
          title: 'Import Successful',
          description: `${newLinks.length} new link(s) imported. ${importedLinks.length - newLinks.length} duplicate(s) ignored.`,
        });

      } catch (error) {
        console.error('Error parsing Markdown file:', error);
        toast({
          variant: 'destructive',
          title: 'Import Failed',
          description: 'Could not parse the Markdown file. Please ensure it is correctly formatted.',
        });
      } finally {
        setIsLoading(false);
      }
    };
    reader.onerror = () => {
      toast({
          variant: 'destructive',
          title: 'File Read Error',
          description: 'Could not read the selected file.',
        });
      setIsLoading(false);
    }
    reader.readAsText(file);
  }, [links, toast]);


  return {
    links,
    isLoading,
    addLink,
    deleteLink,
    updateSummary,
    exportToMarkdown,
    clearAllLinks,
    importFromMarkdown,
  };
}
