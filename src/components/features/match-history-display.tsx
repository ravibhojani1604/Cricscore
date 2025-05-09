
'use client';

import type { FC } from 'react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableCaption } from "@/components/ui/table";
import { ScrollArea } from '@/components/ui/scroll-area';
import { Trash2 } from 'lucide-react';
import type { MatchRecord } from '@/app/page'; // Ensure MatchRecord includes extras

interface MatchHistoryDisplayProps {
  history: MatchRecord[];
  onClearHistory: () => void;
}

export const MatchHistoryDisplay: FC<MatchHistoryDisplayProps> = ({ history, onClearHistory }) => {
  return (
    <div className="flex flex-col h-full">
      <ScrollArea className="flex-grow">
        {history.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">No match history found.</p>
        ) : (
          <Table>
            <TableCaption>A list of your past matches. Newest matches are shown first.</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Date</TableHead>
                <TableHead>Team 1</TableHead>
                <TableHead className="text-center">Score (Overs) (Extras)</TableHead>
                <TableHead>Team 2</TableHead>
                <TableHead className="text-center">Score (Overs) (Extras)</TableHead>
                <TableHead className="min-w-[180px]">Result</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...history].reverse().map((match) => (
                <TableRow key={match.id}>
                  <TableCell>{new Date(match.date).toLocaleDateString()}</TableCell>
                  <TableCell className="font-medium">{match.team1Name}</TableCell>
                  <TableCell className="text-center">{match.team1Score} ({match.team1Overs}) (E: {match.team1Extras})</TableCell>
                  <TableCell className="font-medium">{match.team2Name}</TableCell>
                  <TableCell className="text-center">{match.team2Score} ({match.team2Overs}) (E: {match.team2Extras})</TableCell>
                  <TableCell>{match.result}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </ScrollArea>
      {history.length > 0 && (
        <div className="pt-4 mt-auto border-t">
          <Button variant="destructive" onClick={onClearHistory} className="w-full">
            <Trash2 className="mr-2 h-4 w-4" /> Clear All History
          </Button>
        </div>
      )}
    </div>
  );
};
