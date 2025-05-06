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
    async (url: string) => {
      setIsLoading(true);
      try {
        const result = await summarizeWebsite({ url });
        if (result.summary && result.summary !== 'Failed to retrieve website content.' && result.summary !== 'No summary available.') {
          const newLink: SummarizedLink = {
            id: crypto.randomUUID(),
            url,
            summary: result.summary,
            createdAt: Date.now(),
          };
          const updatedLinks = [newLink, ...links];
          setLinks(updatedLinks);
          storeLinks(updatedLinks);
          toast({
            title: 'Link Summarized',
            description: `Successfully summarized ${url}`,
          });
        } else {
          toast({
            variant: 'destructive',
            title: 'Summarization Failed',
            description: result.summary || `Could not summarize ${url}. Please try another link.`,
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


  return {
    links,
    isLoading,
    addLink,
    deleteLink,
    exportToMarkdown,
    clearAllLinks,
  };
}
