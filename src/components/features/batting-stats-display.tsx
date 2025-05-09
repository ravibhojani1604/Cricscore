
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
import { Target } from 'lucide-react'; // Using Target as a generic sports icon

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
}

const calculateStrikeRate = (runs: number, balls: number): string => {
  if (balls === 0) return '0.00';
  return ((runs / balls) * 100).toFixed(2);
};

export const BattingStatsDisplay: FC<BattingStatsDisplayProps> = ({ batters, teamName, onStrikeBatterId }) => {
  const sortedBatters = [...batters].sort((a, b) => a.order - b.order);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <Target className="text-primary h-6 w-6" /> Batting Card ({teamName})
        </CardTitle>
        <CardDescription>Scorecard for {teamName}.</CardDescription>
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
              {sortedBatters.map((batter) => (
                <TableRow key={batter.id} className={batter.id === onStrikeBatterId && !batter.isOut ? 'bg-accent/50' : ''}>
                  <TableCell className="font-medium">
                    {batter.name}
                    {batter.id === onStrikeBatterId && !batter.isOut && <span className="text-primary ml-1">*</span>}
                  </TableCell>
                  <TableCell>{batter.isOut ? (batter.howOut || 'Out') : (batter.ballsFaced > 0 || batter.runsScored > 0 || batter.id === onStrikeBatterId ? 'Batting' : 'Not Out')}</TableCell>
                  <TableCell className="text-center">{batter.runsScored}</TableCell>
                  <TableCell className="text-center">{batter.ballsFaced}</TableCell>
                  <TableCell className="text-center">{batter.fours}</TableCell>
                  <TableCell className="text-center">{batter.sixes}</TableCell>
                  <TableCell className="text-right">{calculateStrikeRate(batter.runsScored, batter.ballsFaced)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
            {sortedBatters.length > 0 && <TableCaption>Batting statistics for {teamName}.</TableCaption>}
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

    