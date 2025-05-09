'use client';

import type { FC } from 'react';
import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send } from 'lucide-react';

interface CommentaryItem {
  id: number;
  text: string;
  timestamp: string; // ISO string or formatted string
}

interface LiveCommentaryFeedProps {
  commentaryLog: CommentaryItem[];
  onAddManualCommentary: (text: string) => void;
}

export const LiveCommentaryFeed: FC<LiveCommentaryFeedProps> = ({ commentaryLog, onAddManualCommentary }) => {
  const [manualComment, setManualComment] = useState('');
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      // Access the viewport directly if needed, or assume ScrollArea handles it.
      // Forcing scroll to bottom is tricky with shadcn's ScrollArea abstraction from here.
      // Often, the ScrollArea component itself needs to be controlled or re-keyed to force scroll.
      // A simpler approach is to reverse the log display.
    }
  }, [commentaryLog]);

  const handleAddComment = () => {
    if (manualComment.trim()) {
      onAddManualCommentary(manualComment.trim());
      setManualComment('');
    }
  };

  return (
    <Card className="flex flex-col h-full max-h-[calc(100vh-200px)] md:max-h-none">
      <CardHeader>
        <CardTitle className="text-xl">Live Commentary</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow overflow-hidden p-0">
        <ScrollArea className="h-72 md:h-[calc(100%-150px)] p-6" ref={scrollAreaRef}>
          {commentaryLog.length === 0 ? (
            <p className="text-muted-foreground text-center">No commentary yet. Match starting soon!</p>
          ) : (
            <ul className="space-y-3">
              {[...commentaryLog].reverse().map((item) => ( // Display newest first
                <li key={item.id} className="text-sm pb-2 border-b border-dashed">
                  <p>{item.text}</p>
                  <p className="text-xs text-muted-foreground pt-1">
                    {new Date(item.timestamp).toLocaleTimeString()}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </ScrollArea>
      </CardContent>
      <CardFooter className="p-4 border-t">
        <div className="flex w-full items-start space-x-2">
          <Textarea
            placeholder="Type your commentary here..."
            value={manualComment}
            onChange={(e) => setManualComment(e.target.value)}
            className="flex-1 min-h-[60px]"
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleAddComment();
              }
            }}
          />
          <Button onClick={handleAddComment} aria-label="Add commentary" size="icon" className="h-auto p-2 aspect-square self-stretch">
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};
