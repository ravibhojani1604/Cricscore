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
  disabled?: boolean; // Added disabled prop
}

export const ScoreControls: FC<ScoreControlsProps> = ({ 
  onAddRuns, 
  onAddWicket, 
  onNextBall, 
  teamName, 
  isBowlerSelected,
  disabled = false // Default to false
}) => {
  const runOptions = [0, 1, 2, 3, 4, 6];

  const handleRunButtonClick = (run: number) => {
    onAddRuns(run, false); 
    onNextBall(true);
  };

  const handleWicketButtonClick = () => {
    onAddWicket();
    onNextBall(true);
  };

  const handleDotBallClick = () => {
    onAddRuns(0, false); 
    onNextBall(true);
  };
  
  const handleWideBallClick = () => {
    onAddRuns(1, true); 
    onNextBall(false); 
  }

  const handleNoBallClick = () => {
    onAddRuns(1, true); 
    onNextBall(false); 
  }


  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Score Controls ({teamName})</CardTitle>
        {!isBowlerSelected && !disabled && ( // Show warning only if not generally disabled
          <CardDescription className="text-destructive flex items-center gap-2">
             <AlertTriangle className="h-4 w-4" /> Please select a bowler before adding scores.
          </CardDescription>
        )}
         {disabled && isBowlerSelected && ( // Show generic disabled message if bowler is selected but controls are off
            <CardDescription className="text-muted-foreground">Controls are currently disabled.</CardDescription>
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
                disabled={disabled || !isBowlerSelected}
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
            disabled={disabled || !isBowlerSelected}
          >
            <MinusCircle className="mr-2 h-4 w-4" /> Wicket
          </Button>
          <Button
            variant="secondary"
            onClick={handleDotBallClick}
            aria-label="Dot ball / Next legal ball"
            disabled={disabled || !isBowlerSelected}
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
              disabled={disabled || !isBowlerSelected}
            >
              Wide (+1 run)
            </Button>
            <Button
              variant="outline"
              onClick={handleNoBallClick}
              aria-label="No ball, add 1 run"
              disabled={disabled || !isBowlerSelected}
            >
              No Ball (+1 run)
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};