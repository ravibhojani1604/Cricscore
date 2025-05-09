
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
  isStrikerSelected: boolean; // New prop
  disabled?: boolean;
}

export const ScoreControls: FC<ScoreControlsProps> = ({ 
  onAddRuns, 
  onAddWicket, 
  onNextBall, 
  teamName, 
  isBowlerSelected,
  isStrikerSelected, // Consuming new prop
  disabled = false
}) => {
  const runOptions = [0, 1, 2, 3, 4, 6];
  const overallDisabled = disabled || !isBowlerSelected || !isStrikerSelected;

  const handleRunButtonClick = (run: number) => {
    onAddRuns(run, false); 
    onNextBall(true);
  };

  const handleWicketButtonClick = () => {
    onAddWicket();
    onNextBall(true); // Wicket is a legal delivery
  };

  const handleDotBallClick = () => {
    // A dot ball means 0 runs off bat, and it's a legal delivery.
    // onAddRuns(0, false) is not strictly needed if 0 runs don't change score,
    // but if it logs commentary or updates batter stats for 0 runs, it's fine.
    // For simplicity, we can just call onNextBall for a dot.
    // However, if onAddRuns(0) correctly sets up undo for a 0-run legal ball, keep it.
    onAddRuns(0, false); // Assuming this also handles batter stats for balls faced if run = 0
    onNextBall(true);
  };
  
  const handleWideBallClick = () => {
    onAddRuns(1, true); // 1 run for wide, is an extra
    onNextBall(false); // Wide is not a legal delivery for batter, but bowler bowls again
  }

  const handleNoBallClick = () => {
    onAddRuns(1, true); // Minimum 1 run for no ball, is an extra
    // Batters can score off a no-ball, that's handled by onAddRuns for the bat runs
    // Here, we are just accounting for the no-ball itself and the extra run for it.
    onNextBall(false); // No ball is not a legal delivery, bowler bowls again (free hit may follow)
  }


  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Score Controls ({teamName})</CardTitle>
        {(!isBowlerSelected || !isStrikerSelected) && !disabled && (
          <CardDescription className="text-destructive flex items-center gap-2">
             <AlertTriangle className="h-4 w-4" /> 
             {!isBowlerSelected && "Please select a bowler. "}
             {!isStrikerSelected && "Please select a batter on strike."}
          </CardDescription>
        )}
         {disabled && (isBowlerSelected && isStrikerSelected) && ( 
            <CardDescription className="text-muted-foreground">Controls are currently disabled (e.g. innings over).</CardDescription>
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
                disabled={overallDisabled}
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
            disabled={overallDisabled}
          >
            <MinusCircle className="mr-2 h-4 w-4" /> Wicket
          </Button>
          <Button // This button is effectively for a "next legal ball that was a dot"
            variant="secondary"
            onClick={handleDotBallClick} 
            aria-label="Dot ball / Next legal delivery (0 runs off bat)"
            disabled={overallDisabled}
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
              aria-label="Wide ball, add 1 run to extras"
              disabled={overallDisabled}
            >
              Wide (+1 run)
            </Button>
            <Button
              variant="outline"
              onClick={handleNoBallClick}
              aria-label="No ball, add 1 run to extras"
              disabled={overallDisabled}
            >
              No Ball (+1 run)
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

    