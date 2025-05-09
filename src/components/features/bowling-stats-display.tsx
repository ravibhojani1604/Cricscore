
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
import { ShieldCheck, TrendingUp } from 'lucide-react';

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
  // Avoid division by zero if oversForCalc is 0 (less than 6 balls bowled)
  if (oversForCalc === 0) return 'N/A'; 
  return (runs / oversForCalc).toFixed(2);
};

export const BowlingStatsDisplay: FC<BowlingStatsDisplayProps> = ({ bowlers, teamName, currentBowlerId }) => {
  return (
    <Card className="shadow-md">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl flex items-center gap-2">
          <ShieldCheck className="text-primary h-6 w-6" /> Bowling Figures ({teamName})
        </CardTitle>
        <CardDescription>Detailed statistics for each bowler. <span className="text-accent-foreground font-semibold">*</span> denotes current bowler.</CardDescription>
      </CardHeader>
      <CardContent>
        {bowlers.length === 0 ? (
          <p className="text-muted-foreground text-center py-6">No bowlers have bowled yet for {teamName}.</p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[120px]">Bowler</TableHead>
                  <TableHead className="text-center">O</TableHead>
                  <TableHead className="text-center">M</TableHead>
                  <TableHead className="text-center">R</TableHead>
                  <TableHead className="text-center">W</TableHead>
                  <TableHead className="text-right min-w-[70px]">Econ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bowlers.map((bowler) => (
                  <TableRow key={bowler.id} className={`transition-colors duration-150 ${bowler.id === currentBowlerId ? 'bg-accent/20 hover:bg-accent/30' : 'hover:bg-muted/50'}`}>
                    <TableCell className="font-medium py-2.5">
                      {bowler.name}
                      {bowler.id === currentBowlerId && <span className="text-accent-foreground ml-1 font-bold">*</span>}
                    </TableCell>
                    <TableCell className="text-center py-2.5">{formatOvers(bowler.totalBallsBowled)}</TableCell>
                    <TableCell className="text-center py-2.5">{bowler.maidens}</TableCell>
                    <TableCell className="text-center py-2.5">{bowler.runsConceded}</TableCell>
                    <TableCell className="text-center py-2.5">{bowler.wickets}</TableCell>
                    <TableCell className="text-right py-2.5">{calculateEconomy(bowler.runsConceded, bowler.totalBallsBowled)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
              {bowlers.length > 0 && <TableCaption className="py-3">Bowling statistics summary for {teamName}.</TableCaption>}
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
