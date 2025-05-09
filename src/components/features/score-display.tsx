
import type { FC } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Trophy, Users } from 'lucide-react';

interface ScoreDisplayProps {
  teamName: string;
  runs: number;
  wickets: number;
  overs: number;
  balls: number;
  extras?: number; 
  isBatting: boolean;
  onStrikeBatterName?: string;
  onStrikeBatterRuns?: number;
  onStrikeBatterBalls?: number;
  offStrikeBatterName?: string;
  offStrikeBatterRuns?: number;
  offStrikeBatterBalls?: number;
  maxOvers: number; // Added maxOvers
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
  maxOvers,
}) => {
  return (
    <Card className={`shadow-lg transition-all duration-300 ${isBatting ? 'border-2 border-accent ring-2 ring-accent/50 scale-105' : 'border'}`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-2xl flex justify-between items-center">
          <span className="flex items-center gap-2">
            <Users className={`${isBatting ? 'text-accent' : 'text-primary'} h-6 w-6`} />
            {teamName}
          </span>
          {isBatting && 
            <span className="text-xs font-semibold uppercase tracking-wider text-accent-foreground bg-accent px-3 py-1 rounded-full shadow-sm">
              Currently Batting
            </span>
          }
        </CardTitle>
         <CardDescription className="text-xs pt-1">
          Max {maxOvers} overs innings
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className={`text-5xl font-extrabold ${isBatting ? 'text-accent' : 'text-primary'}`}>
          {runs}/{wickets}
        </p>
        <div className="text-muted-foreground space-y-1">
            <p>Overs: <span className="font-medium text-foreground">{overs}.{balls}</span></p>
            <p>Extras: <span className="font-medium text-foreground">{extras ?? 0}</span></p>
        </div>

        {isBatting && (onStrikeBatterName || offStrikeBatterName) && (
          <div className="pt-2 mt-2 border-t border-border/50">
            <CardDescription className="mb-1 text-xs uppercase tracking-wider">Current Batters</CardDescription>
            <div className="text-sm text-foreground space-y-0.5">
                {onStrikeBatterName && (
                <p>
                    <span className="font-semibold">{onStrikeBatterName}*</span>: {onStrikeBatterRuns ?? 0} ({onStrikeBatterBalls ?? 0})
                </p>
                )}
                {offStrikeBatterName && (
                <p>
                    <span className="font-semibold">{offStrikeBatterName}</span>: {offStrikeBatterRuns ?? 0} ({offStrikeBatterBalls ?? 0})
                </p>
                )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
