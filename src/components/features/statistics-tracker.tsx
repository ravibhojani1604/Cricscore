
import type { FC } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BarChart3, Target, TrendingUp, Hourglass, Percent } from 'lucide-react';

interface StatisticsTrackerProps {
  runs: number;
  overs: number;
  balls: number;
  wickets: number;
  extras: number;
  target?: number; 
  maxOvers: number;
}

export const StatisticsTracker: FC<StatisticsTrackerProps> = ({ runs, overs, balls, wickets, extras, target, maxOvers }) => {
  const totalBallsPlayed = overs * 6 + balls;
  const runRate = totalBallsPlayed > 0 ? (runs / totalBallsPlayed) * 6 : 0;
  const ballsRemainingInMatch = maxOvers > 0 ? maxOvers * 6 - totalBallsPlayed : 0;

  let requiredRunRate: number | string | null = null;
  if (target && ballsRemainingInMatch > 0 && maxOvers > 0) {
    const runsNeededToWin = target - runs;
    if (runsNeededToWin <= 0) {
      requiredRunRate = "Achieved"; 
    } else {
      requiredRunRate = ((runsNeededToWin / ballsRemainingInMatch) * 6).toFixed(2);
    }
  } else if (target && runs < target && ballsRemainingInMatch <=0 && maxOvers > 0) {
      requiredRunRate = "N/A"; 
  }


  const StatItem: FC<{ icon: React.ElementType, label: string, value: string | number, valueClassName?: string, unit?: string }> = 
    ({ icon: Icon, label, value, valueClassName, unit }) => (
    <div className="p-3 bg-muted/30 rounded-lg border border-input flex flex-col items-start shadow-sm hover:bg-muted/50 transition-colors">
      <div className="flex items-center gap-2 mb-1">
        <Icon className="h-5 w-5 text-primary" />
        <h3 className="text-sm font-medium text-muted-foreground">{label}</h3>
      </div>
      <p className={`text-2xl font-semibold ${valueClassName || 'text-foreground'}`}>
        {value}
        {unit && <span className="text-sm font-normal ml-1">{unit}</span>}
      </p>
    </div>
  );

  return (
    <Card className="shadow-md">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl flex items-center gap-2">
          <BarChart3 className="text-primary h-6 w-6" /> Match Statistics
        </CardTitle>
        <CardDescription>
          Key performance indicators for the current innings. (Max {maxOvers > 0 ? `${maxOvers} overs` : 'N/A overs'} per innings)
        </CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <StatItem icon={TrendingUp} label="Run Rate" value={runRate.toFixed(2)} unit="RPO" />
        <StatItem icon={Target} label="Score" value={`${runs}/${wickets}`} />
        <StatItem icon={Hourglass} label="Overs" value={`${overs}.${balls}`} />
        <StatItem icon={Percent} label="Extras" value={extras} />

        {target !== undefined && (
          <StatItem icon={Target} label="Target" value={target} valueClassName="text-accent-foreground" />
        )}
        
        {target !== undefined && runs < target && maxOvers > 0 && (
          <>
            <StatItem 
              icon={Hourglass} 
              label="Runs Needed" 
              value={Math.max(0, target - runs)} 
              valueClassName={Math.max(0, target - runs) === 0 ? "text-green-600" : "text-destructive"} 
            />
            <StatItem 
                icon={Hourglass} 
                label="Balls Left" 
                value={ballsRemainingInMatch > 0 ? ballsRemainingInMatch : 0} 
            />
            {requiredRunRate !== null && (
                 <StatItem 
                    icon={TrendingUp} 
                    label="Req. Rate" 
                    value={requiredRunRate} 
                    unit={typeof requiredRunRate === 'string' && requiredRunRate !== "Achieved" && requiredRunRate !== "N/A" ? "RPO" : ""}
                    valueClassName={requiredRunRate === "Achieved" ? "text-green-600" : requiredRunRate === "N/A" ? "text-muted-foreground" : "text-accent"} />
            )}
          </>
        )}
         {target !== undefined && runs >= target && maxOvers > 0 && (
            <div className="col-span-full text-center py-3 bg-green-100 dark:bg-green-900/30 rounded-lg border border-green-500">
                <p className="text-xl font-bold text-green-600 dark:text-green-400">Target Achieved!</p>
            </div>
        )}
        {target !== undefined && runs < target && ballsRemainingInMatch <=0 && maxOvers > 0 && (
             <div className="col-span-full text-center py-3 bg-red-100 dark:bg-red-900/30 rounded-lg border border-red-500">
                <p className="text-xl font-bold text-red-600 dark:text-red-400">Target Not Met - Innings Ended</p>
            </div>
        )}
      </CardContent>
    </Card>
  );
};
