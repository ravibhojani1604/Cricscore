
'use client';

import type { FC } from 'react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { summarizeMatchHighlights } from '@/ai/flows/summarize-match-highlights';
import { Loader2, Sparkles, AlertTriangle, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';

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
    <Card className="shadow-md">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl flex items-center gap-2">
          <Sparkles className="text-accent h-6 w-6" /> AI Highlight Summarizer
        </CardTitle>
        <CardDescription>
          Generate a concise summary of match highlights using AI.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="commentary-input" className="text-sm font-medium text-muted-foreground mb-1 block">
            Match Commentary (Edit or use live feed)
          </Label>
          <Textarea
            id="commentary-input"
            placeholder="Match commentary will appear here for summarization..."
            value={currentCommentary}
            onChange={(e) => setCurrentCommentary(e.target.value)}
            rows={8}
            className="min-h-[150px] shadow-sm focus:ring-primary"
            aria-label="Match commentary for summarization"
          />
        </div>
        <Button onClick={handleSummarize} disabled={isLoading || !currentCommentary.trim()} className="w-full py-3 text-base shadow-sm">
          {isLoading ? (
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          ) : (
            <Sparkles className="mr-2 h-5 w-5" />
          )}
          Generate Summary
        </Button>
        {error && (
          <Alert variant="destructive" className="mt-3">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error Summarizing</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {summary && !isLoading && (
          <div className="p-4 bg-secondary/50 rounded-lg border border-primary/30 shadow-inner space-y-2">
            <h3 className="font-semibold text-primary flex items-center gap-2 text-lg">
                <FileText className="h-5 w-5" /> Match Summary
            </h3>
            <p className="text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed">{summary}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

