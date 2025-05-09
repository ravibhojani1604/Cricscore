
import type { FC } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface StatisticsTrackerProps {
  runs: number;
  overs: number;
  balls: number;
  wickets: number;
  extras: number;
  target?: number; // Optional target score for chasing team
}

export const StatisticsTracker: FC<StatisticsTrackerProps> = ({ runs, overs, balls, wickets, extras, target }) => {
  const totalBallsPlayed = overs * 6 + balls;
  const runRate = totalBallsPlayed > 0 ? (runs / totalBallsPlayed) * 6 : 0;
  const MAX_OVERS = 20; // Assuming T20
  const ballsRemaining = MAX_OVERS * 6 - totalBallsPlayed;

  let requiredRunRate: number | null = null;
  if (target && ballsRemaining > 0) {
    const runsNeeded = target - runs;
    if (runsNeeded > 0) {
      requiredRunRate = (runsNeeded / ballsRemaining) * 6;
    } else {
      requiredRunRate = 0; // Target achieved or surpassed
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Match Statistics</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-6">
        <div>
          <h3 className="text-sm font-medium text-muted-foreground">Current Run Rate</h3>
          <p className="text-2xl font-semibold text-foreground">{runRate.toFixed(2)}</p>
        </div>
        {target !== undefined && (
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">Target</h3>
            <p className="text-2xl font-semibold text-foreground">{target}</p>
          </div>
        )}
        <div>
          <h3 className="text-sm font-medium text-muted-foreground">Score</h3>
          <p className="text-lg font-semibold text-foreground">{runs}/{wickets}</p>
        </div>
         <div>
          <h3 className="text-sm font-medium text-muted-foreground">Overs</h3>
          <p className="text-lg font-semibold text-foreground">{overs}.{balls}</p>
        </div>
        <div>
          <h3 className="text-sm font-medium text-muted-foreground">Extras</h3>
          <p className="text-lg font-semibold text-foreground">{extras}</p>
        </div>
        {target !== undefined && runs < target && (
          <>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Runs Needed</h3>
              <p className="text-lg font-semibold text-foreground">{Math.max(0, target - runs)}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Balls Remaining</h3>
              <p className="text-lg font-semibold text-foreground">{ballsRemaining > 0 ? ballsRemaining : 0}</p>
            </div>
          </>
        )}
        {requiredRunRate !== null && target !==undefined && runs < target && ballsRemaining > 0 && (
          <div className="md:col-span-1">
            <h3 className="text-sm font-medium text-muted-foreground text-accent">Required Run Rate</h3>
            <p className="text-2xl font-semibold text-accent">{requiredRunRate.toFixed(2)}</p>
          </div>
        )}
         {target !== undefined && runs >= target && (
            <div className="col-span-full text-center py-2">
                <p className="text-xl font-bold text-green-600">Target Achieved!</p>
            </div>
        )}
      </CardContent>
    </Card>
  );
};
