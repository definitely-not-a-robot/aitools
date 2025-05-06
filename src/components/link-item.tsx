// src/components/link-item.tsx
'use client';

import type { SummarizedLink } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Trash2, ExternalLink, Pencil, Save, XCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useState, useEffect } from 'react';

type LinkItemProps = {
  link: SummarizedLink;
  onDelete: (id: string) => void;
  onUpdateSummary: (id: string, newSummary: string) => void;
};

export function LinkItem({ link, onDelete, onUpdateSummary }: LinkItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [currentSummary, setCurrentSummary] = useState(link.summary);

  useEffect(() => {
    if (!isEditing) {
      setCurrentSummary(link.summary);
    }
  }, [link.summary, isEditing]);

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleSaveClick = () => {
    onUpdateSummary(link.id, currentSummary);
    setIsEditing(false);
  };

  const handleCancelClick = () => {
    setCurrentSummary(link.summary);
    setIsEditing(false);
  };

  return (
    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader>
        <div className="flex justify-between items-start gap-2">
          <div className="flex-grow min-w-0"> {/* Ensure this container can shrink */}
            <CardTitle className="text-xl break-words"> {/* Use break-words for long URLs */}
              <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary transition-colors flex items-center gap-1.5 group"
              >
                <span className="truncate group-hover:underline">{link.url}</span>
                <ExternalLink size={16} className="shrink-0" />
              </a>
            </CardTitle>
            <CardDescription className="text-xs pt-1">
              Added {formatDistanceToNow(new Date(link.createdAt), { addSuffix: true })}
            </CardDescription>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            {!isEditing && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleEditClick}
                aria-label="Edit summary"
                className="text-muted-foreground hover:text-primary"
              >
                <Pencil className="h-5 w-5" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(link.id)}
              aria-label="Delete link"
              className="text-muted-foreground hover:text-destructive"
              disabled={isEditing}
            >
              <Trash2 className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isEditing ? (
          <div className="space-y-3">
            <Textarea
              value={currentSummary}
              onChange={(e) => setCurrentSummary(e.target.value)}
              rows={5}
              className="text-base"
              aria-label="Edit summary textarea"
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={handleCancelClick} size="sm">
                <XCircle className="mr-2 h-4 w-4" />
                Cancel
              </Button>
              <Button onClick={handleSaveClick} size="sm">
                <Save className="mr-2 h-4 w-4" />
                Save Summary
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-foreground/90 leading-relaxed whitespace-pre-wrap">{link.summary}</p>
        )}
      </CardContent>
    </Card>
  );
}
