// Summarize match highlights using AI.

'use server';

/**
 * @fileOverview Summarizes cricket match highlights using AI. The flow takes in
 *  live match commentary and generates a summary of key moments.
 *
 * - summarizeMatchHighlights - A function that handles the summarization process.
 * - SummarizeMatchHighlightsInput - The input type for the summarizeMatchHighlights function.
 * - SummarizeMatchHighlightsOutput - The return type for the summarizeMatchHighlights function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeMatchHighlightsInputSchema = z.object({
  commentary: z
    .string()
    .describe('Live text commentary of the cricket match.'),
});
export type SummarizeMatchHighlightsInput = z.infer<
  typeof SummarizeMatchHighlightsInputSchema
>;

const SummarizeMatchHighlightsOutputSchema = z.object({
  summary: z
    .string()
    .describe('A summary of the key match highlights.'),
});
export type SummarizeMatchHighlightsOutput = z.infer<
  typeof SummarizeMatchHighlightsOutputSchema
>;

export async function summarizeMatchHighlights(
  input: SummarizeMatchHighlightsInput
): Promise<SummarizeMatchHighlightsOutput> {
  return summarizeMatchHighlightsFlow(input);
}

const summarizeMatchHighlightsPrompt = ai.definePrompt({
  name: 'summarizeMatchHighlightsPrompt',
  input: {schema: SummarizeMatchHighlightsInputSchema},
  output: {schema: SummarizeMatchHighlightsOutputSchema},
  prompt: `You are an expert cricket analyst. Generate a summary of key match
  highlights based on the live commentary provided. Focus on summarizing the
  most important moments and plays of the match.

  Live Commentary: {{{commentary}}}`,
});

const summarizeMatchHighlightsFlow = ai.defineFlow(
  {
    name: 'summarizeMatchHighlightsFlow',
    inputSchema: SummarizeMatchHighlightsInputSchema,
    outputSchema: SummarizeMatchHighlightsOutputSchema,
  },
  async input => {
    const {output} = await summarizeMatchHighlightsPrompt(input);
    return output!;
  }
);
