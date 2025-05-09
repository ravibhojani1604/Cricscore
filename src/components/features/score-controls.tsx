'use client';

import type { FC } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PlusCircle, MinusCircle, Dot, AlertTriangle } from 'lucide-react';

interface ScoreControlsProps {
  onAddRuns: (runs: number, isExtraRun?: boolean) => void;
  onAddWicket: () => void;
  onNextBall: (isLegalDelivery: boolean) => void;
  teamName: string;
  isBowlerSelected: boolean;
}

export const ScoreControls: FC<ScoreControlsProps> = ({ onAddRuns, onAddWicket, onNextBall, teamName, isBowlerSelected }) => {
  const runOptions = [0, 1, 2, 3, 4, 6];

  const handleRunButtonClick = (run: number) => {
    onAddRuns(run, false); // Runs off bat are not extras
    onNextBall(true);
  };

  const handleWicketButtonClick = () => {
    onAddWicket();
    onNextBall(true);
  };

  const handleDotBallClick = () => {
    onAddRuns(0, false); // 0 runs, not an extra
    onNextBall(true);
  };
  
  const handleWideBallClick = () => {
    onAddRuns(1, true); // Wide adds 1 run, is an extra
    onNextBall(false); // Not a legal ball for over count
  }

  const handleNoBallClick = () => {
    onAddRuns(1, true); // No ball adds 1 run (base), is an extra
    // Potentially more runs could be scored off a no-ball, handled by subsequent run button.
    // For simplicity, just the penalty run here.
    onNextBall(false); // Not a legal ball for over count
  }


  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Score Controls ({teamName})</CardTitle>
        {!isBowlerSelected && (
          <CardDescription className="text-destructive flex items-center gap-2">
             <AlertTriangle className="h-4 w-4" /> Please select a bowler before adding scores.
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="text-sm font-medium mb-2 text-muted-foreground">Add Runs (Off Bat)</h3>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {runOptions.map((run) => (
              <Button
                key={run}
                variant="outline"
                onClick={() => handleRunButtonClick(run)}
                className="flex flex-col h-auto py-2"
                aria-label={`Add ${run} run${run !== 1 ? 's' : ''}`}
                disabled={!isBowlerSelected}
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
            onClick={handleWicketButtonClick}
            aria-label="Add wicket"
            disabled={!isBowlerSelected}
          >
            <MinusCircle className="mr-2 h-4 w-4" /> Wicket
          </Button>
          <Button
            variant="secondary"
            onClick={handleDotBallClick}
            aria-label="Dot ball / Next legal ball"
            disabled={!isBowlerSelected}
          >
             <Dot className="mr-2 h-5 w-5" /> Dot Ball
          </Button>
        </div>
        
        <div>
          <h3 className="text-sm font-medium mb-2 text-muted-foreground">Extras</h3>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              onClick={handleWideBallClick}
              aria-label="Wide ball, add 1 run"
              disabled={!isBowlerSelected}
            >
              Wide (+1 run)
            </Button>
            <Button
              variant="outline"
              onClick={handleNoBallClick}
              aria-label="No ball, add 1 run"
              disabled={!isBowlerSelected}
            >
              No Ball (+1 run)
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
