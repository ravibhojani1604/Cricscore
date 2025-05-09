'use client';

import type { FC } from 'react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { summarizeMatchHighlights } from '@/ai/flows/summarize-match-highlights';
import { Loader2, Sparkles, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface HighlightSummarizerProps {
  commentaryToSummarize: string;
}

export const HighlightSummarizer: FC<HighlightSummarizerProps> = ({ commentaryToSummarize }) => {
  const [summary, setSummary] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentCommentary, setCurrentCommentary] = useState(commentaryToSummarize);
  const { toast } = useToast();

  useEffect(() => {
    setCurrentCommentary(commentaryToSummarize);
  }, [commentaryToSummarize]);

  const handleSummarize = async () => {
    if (!currentCommentary.trim()) {
      setError("Commentary is empty. Please add some commentary first.");
      toast({
        title: "Empty Commentary",
        description: "Cannot summarize empty commentary.",
        variant: "destructive",
      });
      return;
    }
    setIsLoading(true);
    setError(null);
    setSummary(null);
    try {
      const result = await summarizeMatchHighlights({ commentary: currentCommentary });
      setSummary(result.summary);
      toast({
        title: "Summary Generated!",
        description: "Match highlights have been summarized.",
      });
    } catch (e) {
      const errorMessage = (e instanceof Error) ? e.message : "An unknown error occurred.";
      setError(errorMessage);
      toast({
        title: "Summarization Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <Sparkles className="text-accent h-6 w-6" /> AI Highlight Summarizer
        </CardTitle>
        <CardDescription>
          Get a quick summary of the match highlights using AI. The more commentary, the better the summary!
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Textarea
            placeholder="Match commentary will appear here for summarization..."
            value={currentCommentary}
            onChange={(e) => setCurrentCommentary(e.target.value)}
            rows={8}
            className="min-h-[120px]"
            aria-label="Match commentary for summarization"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Edit the commentary above or use the live feed. Then click summarize.
          </p>
        </div>
        <Button onClick={handleSummarize} disabled={isLoading || !currentCommentary.trim()} className="w-full">
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="mr-2 h-4 w-4" />
          )}
          Generate Summary
        </Button>
        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {summary && !isLoading && (
          <div className="p-4 bg-secondary/50 rounded-md border border-primary/20 shadow">
            <h3 className="font-semibold text-primary mb-2">Match Summary:</h3>
            <p className="text-sm whitespace-pre-wrap">{summary}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
