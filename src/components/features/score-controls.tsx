
'use client';

import type { FC } from 'react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PlusCircle, MinusCircle, Dot, AlertTriangle } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface ScoreControlsProps {
  onAddRuns: (runs: number, isExtraRun?: boolean) => void;
  onAddWicket: () => void;
  onNextBall: (isLegalDelivery: boolean) => void;
  teamName: string;
  isBowlerSelected: boolean;
  isStrikerSelected: boolean;
  disabled?: boolean;
}

export const ScoreControls: FC<ScoreControlsProps> = ({ 
  onAddRuns, 
  onAddWicket, 
  onNextBall, 
  teamName, 
  isBowlerSelected,
  isStrikerSelected,
  disabled = false
}) => {
  const runOptions = [0, 1, 2, 3, 4, 6];
  const overallDisabled = disabled || !isBowlerSelected || !isStrikerSelected;

  const [wideAdditionalRuns, setWideAdditionalRuns] = useState<string>("0");
  const [noBallAdditionalRuns, setNoBallAdditionalRuns] = useState<string>("0");

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
  
  const handleConfirmWide = () => {
    const additionalRuns = parseInt(wideAdditionalRuns, 10);
    const totalRunsForWide = 1 + additionalRuns;
    onAddRuns(totalRunsForWide, true);
    onNextBall(false);
  };

  const handleConfirmNoBall = () => {
    const additionalRuns = parseInt(noBallAdditionalRuns, 10);
    const totalRunsForNoBall = 1 + additionalRuns;
    onAddRuns(totalRunsForNoBall, true);
    onNextBall(false);
  };

  const additionalRunOptions = [0, 1, 2, 3, 4];

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
          <Button
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Wide Ball Section */}
            <div className="space-y-2 p-3 border rounded-md bg-background shadow-sm">
              <Label htmlFor="wide-additional-runs" className="font-semibold">Wide + Additional Runs</Label>
              <div className="flex items-center gap-2">
                <Select
                  value={wideAdditionalRuns}
                  onValueChange={setWideAdditionalRuns}
                  disabled={overallDisabled}
                >
                  <SelectTrigger id="wide-additional-runs" className="flex-grow" aria-label="Select additional runs for wide">
                    <SelectValue placeholder="Select runs..." />
                  </SelectTrigger>
                  <SelectContent>
                    {additionalRunOptions.map(run => (
                       <SelectItem key={`wide-${run}`} value={String(run)}>
                         {run === 0 ? "0 runs (wide only)" : `+${run} run${run !== 1 ? 's' : ''}`}
                       </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  onClick={handleConfirmWide}
                  disabled={overallDisabled}
                  variant="outline"
                  className="flex-shrink-0"
                  aria-label={`Confirm wide with ${1 + parseInt(wideAdditionalRuns, 10)} total runs`}
                >
                  Wide ({1 + parseInt(wideAdditionalRuns, 10)})
                </Button>
              </div>
            </div>

            {/* No Ball Section */}
            <div className="space-y-2 p-3 border rounded-md bg-background shadow-sm">
              <Label htmlFor="noball-additional-runs" className="font-semibold">No Ball + Additional Runs</Label>
              <div className="flex items-center gap-2">
                <Select
                  value={noBallAdditionalRuns}
                  onValueChange={setNoBallAdditionalRuns}
                  disabled={overallDisabled}
                >
                  <SelectTrigger id="noball-additional-runs" className="flex-grow" aria-label="Select additional runs for no ball">
                    <SelectValue placeholder="Select runs..." />
                  </SelectTrigger>
                  <SelectContent>
                     {additionalRunOptions.map(run => (
                       <SelectItem key={`noball-${run}`} value={String(run)}>
                         {run === 0 ? "0 runs (no ball only)" : `+${run} run${run !== 1 ? 's' : ''}`}
                       </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  onClick={handleConfirmNoBall}
                  disabled={overallDisabled}
                  variant="outline"
                  className="flex-shrink-0"
                  aria-label={`Confirm no ball with ${1 + parseInt(noBallAdditionalRuns, 10)} total runs`}
                >
                  NB ({1 + parseInt(noBallAdditionalRuns, 10)})
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
