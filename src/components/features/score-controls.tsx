'use client';

import type { FC } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, MinusCircle, ArrowRightCircle, Dot } from 'lucide-react';

interface ScoreControlsProps {
  onAddRuns: (runs: number) => void;
  onAddWicket: () => void;
  onNextBall: (isLegalDelivery: boolean) => void; // true if legal, false for wide/no-ball that doesn't count to 6
  teamName: string;
}

export const ScoreControls: FC<ScoreControlsProps> = ({ onAddRuns, onAddWicket, onNextBall, teamName }) => {
  const runOptions = [0, 1, 2, 3, 4, 6];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Score Controls ({teamName})</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="text-sm font-medium mb-2 text-muted-foreground">Add Runs</h3>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {runOptions.map((run) => (
              <Button
                key={run}
                variant="outline"
                onClick={() => {
                  onAddRuns(run);
                  onNextBall(true);
                }}
                className="flex flex-col h-auto py-2"
                aria-label={`Add ${run} run${run !== 1 ? 's' : ''}`}
              >
                <span className="text-lg font-bold">{run}</span>
                <span className="text-xs">{run !== 1 ? 'Runs' : 'Run'}</span>
              </Button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="destructive"
            onClick={() => {
              onAddWicket();
              onNextBall(true);
            }}
            aria-label="Add wicket"
          >
            <MinusCircle className="mr-2 h-4 w-4" /> Wicket
          </Button>
          <Button
            variant="secondary"
            onClick={() => onNextBall(true)} // For dot ball specifically or just moving to next ball after non-run event
            aria-label="Dot ball / Next legal ball"
          >
             <Dot className="mr-2 h-5 w-5" /> Dot Ball
          </Button>
        </div>
        
        <div>
          <h3 className="text-sm font-medium mb-2 text-muted-foreground">Extras (Legal delivery not incremented for over count)</h3>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              onClick={() => {
                onAddRuns(1); // Wide usually adds 1 run
                onNextBall(false); // Not a legal ball for over count
              }}
              aria-label="Wide ball, add 1 run"
            >
              Wide (+1 run)
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                onAddRuns(1); // No ball usually adds 1 run + runs scored off it (simplified here)
                onNextBall(false); // Not a legal ball for over count
              }}
              aria-label="No ball, add 1 run"
            >
              No Ball (+1 run)
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
