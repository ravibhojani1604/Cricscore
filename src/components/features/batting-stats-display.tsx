
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
import { Target } from 'lucide-react'; 

interface Batter {
  id: string;
  name: string;
  runsScored: number;
  ballsFaced: number;
  fours: number;
  sixes: number;
  isOut: boolean;
  howOut?: string;
  order: number;
}

interface BattingStatsDisplayProps {
  batters: Batter[];
  teamName: string;
  onStrikeBatterId: string | null;
  offStrikeBatterId: string | null; 
}

const calculateStrikeRate = (runs: number, balls: number): string => {
  if (balls === 0) return '0.00';
  return ((runs / balls) * 100).toFixed(2);
};

export const BattingStatsDisplay: FC<BattingStatsDisplayProps> = ({ batters, teamName, onStrikeBatterId, offStrikeBatterId }) => {
  const sortedBatters = [...batters].sort((a, b) => a.order - b.order);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <Target className="text-primary h-6 w-6" /> Batting Card ({teamName})
        </CardTitle>
        <CardDescription>Scorecard for {teamName}. <span className="text-primary">*</span> denotes on strike, <span className="text-accent-foreground"><sup>NS</sup></span> denotes non-striker.</CardDescription>
      </CardHeader>
      <CardContent>
        {sortedBatters.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">No batters in the lineup for {teamName} yet.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Batter</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-center">R</TableHead>
                <TableHead className="text-center">B</TableHead>
                <TableHead className="text-center">4s</TableHead>
                <TableHead className="text-center">6s</TableHead>
                <TableHead className="text-right">SR</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedBatters.map((batter) => {
                const isOnStrike = batter.id === onStrikeBatterId && !batter.isOut;
                const isOffStrike = batter.id === offStrikeBatterId && !batter.isOut;
                let rowClassName = '';
                if (isOnStrike) rowClassName = 'bg-primary/10';
                else if (isOffStrike) rowClassName = 'bg-accent/20';
                
                return (
                  <TableRow key={batter.id} className={rowClassName}>
                    <TableCell className="font-medium">
                      {batter.name}
                      {isOnStrike && <span className="text-primary ml-1">*</span>}
                      {isOffStrike && <span className="text-accent-foreground ml-1 text-xs align-super">NS</span>}
                    </TableCell>
                    <TableCell>{batter.isOut ? (batter.howOut || 'Out') : ((batter.ballsFaced > 0 || batter.runsScored > 0 || isOnStrike || isOffStrike) ? 'Batting' : 'Not Out')}</TableCell>
                    <TableCell className="text-center">{batter.runsScored}</TableCell>
                    <TableCell className="text-center">{batter.ballsFaced}</TableCell>
                    <TableCell className="text-center">{batter.fours}</TableCell>
                    <TableCell className="text-center">{batter.sixes}</TableCell>
                    <TableCell className="text-right">{calculateStrikeRate(batter.runsScored, batter.ballsFaced)}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
            {sortedBatters.length > 0 && <TableCaption>Batting statistics for {teamName}.</TableCaption>}
          </Table>
        )}
      </CardContent>
    </Card>
  );
};
