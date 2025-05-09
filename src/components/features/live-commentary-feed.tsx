
'use client';

import type { FC } from 'react';
import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send } from 'lucide-react';

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
  const viewportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (viewportRef.current) {
      // Scroll to the bottom when new commentary is added
      // This is for [...].reverse().map, so new items are at the top visually
      // but the container itself doesn't need to scroll to bottom on new item if items are prepended.
      // If newest is at bottom, then:
      // viewportRef.current.scrollTop = viewportRef.current.scrollHeight;
    }
  }, [commentaryLog]);

  const handleAddComment = () => {
    if (manualComment.trim()) {
      onAddManualCommentary(manualComment.trim());
      setManualComment('');
    }
  };

  return (
    <Card className="flex flex-col flex-1 min-h-0"> {/* Adjusted for flex sizing */}
      <CardHeader>
        <CardTitle className="text-xl">Live Commentary</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden p-0 min-h-0"> {/* Adjusted for flex child + scrolling */}
        <ScrollArea className="h-full p-6" viewportRef={viewportRef}>
          {commentaryLog.length === 0 ? (
            <p className="text-muted-foreground text-center">No commentary yet. Match starting soon!</p>
          ) : (
            <ul className="space-y-3">
              {[...commentaryLog].reverse().map((item) => ( 
                <li key={item.id} className="text-sm pb-2 border-b border-input last:border-b-0">
                  <p className="leading-relaxed">{item.text}</p>
                  <p className="text-xs text-muted-foreground pt-1">
                    {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
            className="flex-1 min-h-[60px] resize-none"
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleAddComment();
              }
            }}
            aria-label="Add manual commentary"
          />
          <Button onClick={handleAddComment} aria-label="Add commentary" size="icon" className="h-auto p-2 aspect-square self-stretch">
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};
