
'use client';

import type { FC } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableCaption,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ShieldCheck } from 'lucide-react';

interface Bowler {
  id: string; 
  name: string;
  totalBallsBowled: number;
  maidens: number;
  runsConceded: number;
  wickets: number;
}

interface BowlingStatsDisplayProps {
  bowlers: Bowler[];
  teamName: string;
  currentBowlerId: string | null;
}

const formatOvers = (totalBalls: number): string => {
  const overs = Math.floor(totalBalls / 6);
  const balls = totalBalls % 6;
  return `${overs}.${balls}`;
};

const calculateEconomy = (runs: number, totalBalls: number): string => {
  if (totalBalls === 0) return '0.00';
  const oversForCalc = totalBalls / 6;
  return (runs / oversForCalc).toFixed(2);
};

export const BowlingStatsDisplay: FC<BowlingStatsDisplayProps> = ({ bowlers, teamName, currentBowlerId }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <ShieldCheck className="text-primary h-6 w-6" /> Bowling Figures ({teamName})
        </CardTitle>
        <CardDescription>Detailed statistics for each bowler.</CardDescription>
      </CardHeader>
      <CardContent>
        {bowlers.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">No bowlers have bowled yet for {teamName}.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Bowler</TableHead>
                <TableHead className="text-center">Overs</TableHead>
                <TableHead className="text-center">Maidens</TableHead>
                <TableHead className="text-center">Runs</TableHead>
                <TableHead className="text-center">Wickets</TableHead>
                <TableHead className="text-right">Economy</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bowlers.map((bowler) => (
                <TableRow key={bowler.id} className={bowler.id === currentBowlerId ? 'bg-accent/50' : ''}>
                  <TableCell className="font-medium">
                    {bowler.name}
                    {bowler.id === currentBowlerId && <span className="text-primary ml-1">*</span>}
                  </TableCell>
                  <TableCell className="text-center">{formatOvers(bowler.totalBallsBowled)}</TableCell>
                  <TableCell className="text-center">{bowler.maidens}</TableCell>
                  <TableCell className="text-center">{bowler.runsConceded}</TableCell>
                  <TableCell className="text-center">{bowler.wickets}</TableCell>
                  <TableCell className="text-right">{calculateEconomy(bowler.runsConceded, bowler.totalBallsBowled)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
            {bowlers.length > 0 && <TableCaption>Bowling statistics summary for {teamName}.</TableCaption>}
          </Table>
        )}
      </CardContent>
    </Card>
  );
};
