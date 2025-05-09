
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
      requiredRunRate = 0; // Target achieved
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Match Statistics</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div>
          <h3 className="font-semibold text-primary">Current Run Rate</h3>
          <p className="text-2xl">{runRate.toFixed(2)}</p>
        </div>
        {target !== undefined && (
          <div>
            <h3 className="font-semibold text-primary">Target</h3>
            <p className="text-2xl">{target}</p>
          </div>
        )}
        <div>
          <h3 className="font-semibold">Score</h3>
          <p className="text-lg">{runs}/{wickets}</p>
        </div>
         <div>
          <h3 className="font-semibold">Overs</h3>
          <p className="text-lg">{overs}.{balls}</p>
        </div>
        <div>
          <h3 className="font-semibold">Extras</h3>
          <p className="text-lg">{extras}</p>
        </div>
        {target !== undefined && runs < target && (
          <>
            <div>
              <h3 className="font-semibold">Runs Needed</h3>
              <p className="text-lg">{Math.max(0, target - runs)}</p>
            </div>
            <div>
              <h3 className="font-semibold">Balls Remaining</h3>
              <p className="text-lg">{ballsRemaining > 0 ? ballsRemaining : 0}</p>
            </div>
          </>
        )}
        {requiredRunRate !== null && target !==undefined && runs < target && (
          <div className="md:col-span-1">
            <h3 className="font-semibold text-accent">Required Run Rate</h3>
            <p className="text-2xl text-accent">{requiredRunRate.toFixed(2)}</p>
          </div>
        )}
         {target !== undefined && runs >= target && (
            <div className="col-span-full text-center py-2">
                <p className="text-lg font-semibold text-green-600">Target Achieved!</p>
            </div>
        )}

      </CardContent>
    </Card>
  );
};
