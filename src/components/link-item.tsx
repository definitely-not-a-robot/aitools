'use client';

import type { SummarizedLink } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Trash2, ExternalLink } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

type LinkItemProps = {
  link: SummarizedLink;
  onDelete: (id: string) => void;
};

export function LinkItem({ link, onDelete }: LinkItemProps) {
  return (
    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="max-w-[calc(100%-3rem)]">
            <CardTitle className="text-xl break-all">
              <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary transition-colors flex items-center gap-1.5"
              >
                {link.url} <ExternalLink size={16} className="shrink-0" />
              </a>
            </CardTitle>
            <CardDescription className="text-xs pt-1">
              Added {formatDistanceToNow(new Date(link.createdAt), { addSuffix: true })}
            </CardDescription>
          </div>
           <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(link.id)}
            aria-label="Delete link"
            className="text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="h-5 w-5" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-foreground/90 leading-relaxed">{link.summary}</p>
      </CardContent>
    </Card>
  );
}
