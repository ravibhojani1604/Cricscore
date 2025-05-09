import type { FC } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface StatisticsTrackerProps {
  runs: number;
  overs: number;
  balls: number;
}

export const StatisticsTracker: FC<StatisticsTrackerProps> = ({ runs, overs, balls }) => {
  const totalBallsPlayed = overs * 6 + balls;
  const runRate = totalBallsPlayed > 0 ? (runs / totalBallsPlayed) * 6 : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Match Statistics</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <h3 className="font-semibold text-primary">Current Run Rate</h3>
          <p className="text-2xl">{runRate.toFixed(2)}</p>
        </div>
        {/* Add more stats here as needed, e.g., required run rate, projected score */}
        <div>
          <h3 className="font-semibold">Total Overs</h3>
          <p className="text-lg">{overs}.{balls}</p>
        </div>
      </CardContent>
    </Card>
  );
};
