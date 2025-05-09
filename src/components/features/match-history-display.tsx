
'use client';

import type { FC } from 'react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableCaption } from "@/components/ui/table";
import { ScrollArea } from '@/components/ui/scroll-area';
import { Trash2, CalendarDays } from 'lucide-react';
import type { MatchRecord } from '@/app/page'; 

interface MatchHistoryDisplayProps {
  history: MatchRecord[];
  onClearHistory: () => void;
}

export const MatchHistoryDisplay: FC<MatchHistoryDisplayProps> = ({ history, onClearHistory }) => {
  return (
    <div className="flex flex-col h-full">
      <ScrollArea className="flex-grow border border-border rounded-lg shadow-inner">
        {history.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-8">
            <CalendarDays className="h-16 w-16 mb-4 text-primary/50" />
            <p className="text-lg">No match history found.</p>
            <p className="text-sm">Completed matches will appear here.</p>
          </div>
        ) : (
          <Table>
            <TableCaption className="py-3 text-sm">A list of your past matches. Newest matches are shown first.</TableCaption>
            <TableHeader className="sticky top-0 bg-muted/80 backdrop-blur-sm z-10">
              <TableRow>
                <TableHead className="w-[100px] sm:w-[120px]">Date</TableHead>
                <TableHead className="min-w-[100px]">Team 1</TableHead>
                <TableHead className="text-center min-w-[150px]">Score (Overs) (Extras)</TableHead>
                <TableHead className="min-w-[100px]">Team 2</TableHead>
                <TableHead className="text-center min-w-[150px]">Score (Overs) (Extras)</TableHead>
                <TableHead className="min-w-[180px]">Result</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* History is already newest first from page.tsx */}
              {history.map((match) => (
                <TableRow key={match.id} className="hover:bg-secondary/50 transition-colors">
                  <TableCell className="py-3">{new Date(match.date).toLocaleDateString()}</TableCell>
                  <TableCell className="font-medium py-3">{match.team1Name}</TableCell>
                  <TableCell className="text-center py-3">{match.team1Score} ({match.team1Overs}) (E: {match.team1Extras})</TableCell>
                  <TableCell className="font-medium py-3">{match.team2Name}</TableCell>
                  <TableCell className="text-center py-3">{match.team2Score} ({match.team2Overs}) (E: {match.team2Extras})</TableCell>
                  <TableCell className="py-3">{match.result}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </ScrollArea>
      {history.length > 0 && (
        <div className="pt-4 mt-auto"> {/* Removed border-t to rely on DialogFooter border */}
          <Button variant="destructive" onClick={onClearHistory} className="w-full shadow-sm py-3 text-base">
            <Trash2 className="mr-2 h-4 w-4" /> Clear All History
          </Button>
        </div>
      )}
    </div>
  );
};
