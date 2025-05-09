import type { FC } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ScoreDisplayProps {
  teamName: string;
  runs: number;
  wickets: number;
  overs: number;
  balls: number;
  isBatting: boolean;
}

export const ScoreDisplay: FC<ScoreDisplayProps> = ({ teamName, runs, wickets, overs, balls, isBatting }) => {
  return (
    <Card className={isBatting ? 'border-accent shadow-lg' : ''}>
      <CardHeader>
        <CardTitle className="text-xl flex justify-between items-center">
          <span>{teamName}</span>
          {isBatting && <span className="text-sm font-normal text-accent-foreground bg-accent px-2 py-1 rounded-full">Batting</span>}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <p className="text-4xl font-bold text-primary">
          {runs}/{wickets}
        </p>
        <p className="text-muted-foreground">
          Overs: {overs}.{balls}
        </p>
      </CardContent>
    </Card>
  );
};
