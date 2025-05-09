
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
import { UserCheck, Users } from 'lucide-react'; 

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
    <Card className="shadow-md">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl flex items-center gap-2">
          <Users className="text-primary h-6 w-6" /> Batting Card ({teamName})
        </CardTitle>
        <CardDescription>
          Individual scores for {teamName}.
          <span className="text-primary font-semibold">*</span> denotes on strike,
          <span className="text-accent-foreground font-semibold"><sup> NS</sup></span> denotes non-striker.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {sortedBatters.length === 0 ? (
          <p className="text-muted-foreground text-center py-6">No batters in the lineup for {teamName} yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[120px]">Batter</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-center">R</TableHead>
                  <TableHead className="text-center">B</TableHead>
                  <TableHead className="text-center">4s</TableHead>
                  <TableHead className="text-center">6s</TableHead>
                  <TableHead className="text-right min-w-[60px]">SR</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedBatters.map((batter) => {
                  const isOnStrike = batter.id === onStrikeBatterId && !batter.isOut;
                  const isOffStrike = batter.id === offStrikeBatterId && !batter.isOut;
                  let rowClassName = 'transition-colors duration-150';
                  if (isOnStrike) rowClassName += ' bg-primary/10 hover:bg-primary/20';
                  else if (isOffStrike) rowClassName += ' bg-accent/10 hover:bg-accent/20';
                  else rowClassName += ' hover:bg-muted/50';
                  
                  return (
                    <TableRow key={batter.id} className={rowClassName}>
                      <TableCell className="font-medium py-2.5">
                        {batter.name}
                        {isOnStrike && <span className="text-primary ml-1 font-bold">*</span>}
                        {isOffStrike && <span className="text-accent-foreground ml-1 text-xs align-super font-semibold">NS</span>}
                      </TableCell>
                      <TableCell className="py-2.5">{batter.isOut ? (batter.howOut || 'Out') : ((batter.ballsFaced > 0 || batter.runsScored > 0 || isOnStrike || isOffStrike) ? 'Not Out' : 'Yet to Bat')}</TableCell>
                      <TableCell className="text-center py-2.5">{batter.runsScored}</TableCell>
                      <TableCell className="text-center py-2.5">{batter.ballsFaced}</TableCell>
                      <TableCell className="text-center py-2.5">{batter.fours}</TableCell>
                      <TableCell className="text-center py-2.5">{batter.sixes}</TableCell>
                      <TableCell className="text-right py-2.5">{calculateStrikeRate(batter.runsScored, batter.ballsFaced)}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
              {sortedBatters.length > 0 && <TableCaption className="py-3">Batting statistics for {teamName}.</TableCaption>}
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
