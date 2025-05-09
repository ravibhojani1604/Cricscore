
'use client';

import type { FC } from 'react';
import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, MessageSquareText } from 'lucide-react';

interface CommentaryItem {
  id: string; 
  text: string;
  timestamp: string; 
}

interface LiveCommentaryFeedProps {
  commentaryLog: CommentaryItem[];
  onAddManualCommentary: (text: string) => void;
}

export const LiveCommentaryFeed: FC<LiveCommentaryFeedProps> = ({ commentaryLog, onAddManualCommentary }) => {
  const [manualComment, setManualComment] = useState('');
  const scrollAreaViewportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll to top when new commentary is added (since list is reversed)
    if (scrollAreaViewportRef.current) {
      scrollAreaViewportRef.current.scrollTop = 0;
    }
  }, [commentaryLog]);

  const handleAddComment = () => {
    if (manualComment.trim()) {
      onAddManualCommentary(manualComment.trim());
      setManualComment('');
    }
  };

  return (
    <Card className="shadow-md flex flex-col flex-1 min-h-[400px] md:min-h-0">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl flex items-center gap-2">
            <MessageSquareText className="text-primary h-6 w-6" /> Live Commentary
        </CardTitle>
        <CardDescription>Follow the live action or add your own notes.</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden p-0">
        <ScrollArea className="h-full p-4 md:p-6" viewportRef={scrollAreaViewportRef}>
          {commentaryLog.length === 0 ? (
            <p className="text-muted-foreground text-center py-10">No commentary yet. Match starting soon!</p>
          ) : (
            <ul className="space-y-3">
              {[...commentaryLog].reverse().map((item) => ( 
                <li key={item.id} className="text-sm pb-3 border-b border-border/70 last:border-b-0">
                  <p className="leading-relaxed text-foreground/90">{item.text}</p>
                  <p className="text-xs text-muted-foreground pt-1.5">
                    {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
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
            className="flex-1 min-h-[60px] resize-none shadow-sm focus:ring-primary"
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleAddComment();
              }
            }}
            aria-label="Add manual commentary"
          />
          <Button onClick={handleAddComment} aria-label="Add commentary" size="icon" className="h-auto p-2.5 aspect-square self-stretch shadow-sm">
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};
