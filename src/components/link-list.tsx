'use client';

import type { SummarizedLink } from '@/types';
import { LinkItem } from './link-item';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { ListCollapse, Trash } from 'lucide-react';

type LinkListProps = {
  links: SummarizedLink[];
  onDelete: (id: string) => void;
  onClearAll: () => void;
  isLoading: boolean;
};

export function LinkList({ links, onDelete, onClearAll, isLoading }: LinkListProps) {
  if (isLoading && links.length === 0) {
    return (
       <div className="text-center py-10">
        <p className="text-muted-foreground">Loading initial links...</p>
      </div>
    )
  }
  
  if (links.length === 0) {
    return (
      <div className="text-center py-10 border-2 border-dashed border-border rounded-lg">
        <ListCollapse className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-xl font-semibold mb-1">No links yet</h3>
        <p className="text-muted-foreground">
          Add a website URL above to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Your Links</h2>
        {links.length > 0 && (
           <Button variant="outline" size="sm" onClick={onClearAll} className="text-muted-foreground hover:text-destructive hover:border-destructive">
            <Trash className="mr-2 h-4 w-4" /> Clear All
          </Button>
        )}
      </div>
      <ScrollArea className="h-[calc(100vh-380px)] sm:h-[calc(100vh-420px)] pr-4 -mr-4">
        <div className="space-y-4">
          {links.map((link) => (
            <LinkItem key={link.id} link={link} onDelete={onDelete} />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
