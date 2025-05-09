
import type { FC } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ScoreDisplayProps {
  teamName: string;
  runs: number;
  wickets: number;
  overs: number;
  balls: number;
  extras?: number; // Added extras prop
  isBatting: boolean;
  onStrikeBatterName?: string;
  onStrikeBatterRuns?: number;
  onStrikeBatterBalls?: number;
  offStrikeBatterName?: string;
  offStrikeBatterRuns?: number;
  offStrikeBatterBalls?: number;
}

export const ScoreDisplay: FC<ScoreDisplayProps> = ({ 
  teamName, 
  runs, 
  wickets, 
  overs, 
  balls, 
  extras,
  isBatting,
  onStrikeBatterName,
  onStrikeBatterRuns,
  onStrikeBatterBalls,
  offStrikeBatterName,
  offStrikeBatterRuns,
  offStrikeBatterBalls,
}) => {
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
        <p className="text-sm text-muted-foreground">
          Extras: {extras ?? 0}
        </p>
        {isBatting && (onStrikeBatterName || offStrikeBatterName) && (
          <div className="text-xs text-muted-foreground pt-1 space-y-1">
            {onStrikeBatterName && (
              <p>
                {onStrikeBatterName}*: {onStrikeBatterRuns ?? 0} ({onStrikeBatterBalls ?? 0})
              </p>
            )}
            {offStrikeBatterName && (
              <p>
                {offStrikeBatterName}: {offStrikeBatterRuns ?? 0} ({offStrikeBatterBalls ?? 0})
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
