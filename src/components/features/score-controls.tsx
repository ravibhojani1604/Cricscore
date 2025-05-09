
'use client';

import type { FC } from 'react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PlusCircle, MinusCircle, Dot, AlertTriangle, ShieldAlert } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

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

  const additionalRunOptionsForExtras = [0, 1, 2, 3, 4];


  return (
    <Card className="shadow-md">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl flex items-center gap-2">
            <ShieldAlert className="text-primary h-6 w-6" /> Score Controls ({teamName})
        </CardTitle>
        {(!isBowlerSelected || !isStrikerSelected) && !disabled && (
          <Alert variant="destructive" className="mt-2">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Action Required</AlertTitle>
            <AlertDescription>
             {!isBowlerSelected && "Please select a bowler. "}
             {!isStrikerSelected && "Please select a batter on strike."}
            </AlertDescription>
          </Alert>
        )}
         {disabled && (isBowlerSelected && isStrikerSelected) && ( 
            <CardDescription className="text-muted-foreground pt-1">Controls are currently disabled (e.g. innings over or match ended).</CardDescription>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="text-base font-medium mb-2 text-foreground">Runs Scored (Off Bat)</h3>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 p-3 bg-muted/30 rounded-md border border-input">
            {runOptions.map((run) => (
              <Button
                key={run}
                variant="outline"
                onClick={() => handleRunButtonClick(run)}
                className="flex flex-col h-auto py-2.5 shadow-sm hover:bg-primary/10 focus:bg-primary/10 focus:ring-primary"
                aria-label={`Add ${run} run${run !== 1 ? 's' : ''}`}
                disabled={overallDisabled}
              >
                <span className="text-xl font-bold">{run}</span>
                <span className="text-xs uppercase tracking-wider">{run !== 1 ? 'Runs' : 'Run'}</span>
              </Button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="destructive"
            onClick={handleWicketButtonClick}
            aria-label="Add wicket"
            disabled={overallDisabled}
            className="py-3 text-base shadow-sm"
          >
            <MinusCircle className="mr-2 h-5 w-5" /> Wicket
          </Button>
          <Button
            variant="secondary"
            onClick={handleDotBallClick} 
            aria-label="Dot ball / Next legal delivery (0 runs off bat)"
            disabled={overallDisabled}
            className="py-3 text-base shadow-sm"
          >
             <Dot className="mr-2 h-6 w-6" /> Dot Ball
          </Button>
        </div>
        
        <div>
          <h3 className="text-base font-medium mb-3 text-foreground">Extras</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Wide Ball Section */}
            <div className="space-y-2 p-4 border rounded-lg bg-background shadow-sm hover:shadow-md transition-shadow">
              <Label htmlFor="wide-additional-runs" className="font-semibold text-lg">Wide</Label>
              <CardDescription>A wide delivery (1 run) + any additional runs scored.</CardDescription>
              <div className="flex items-center gap-2 pt-2">
                <Select
                  value={wideAdditionalRuns}
                  onValueChange={setWideAdditionalRuns}
                  disabled={overallDisabled}
                >
                  <SelectTrigger id="wide-additional-runs" className="flex-grow shadow-sm" aria-label="Select additional runs for wide">
                    <SelectValue placeholder="Select runs..." />
                  </SelectTrigger>
                  <SelectContent>
                    {additionalRunOptionsForExtras.map(run => (
                       <SelectItem key={`wide-${run}`} value={String(run)}>
                         {run === 0 ? "0 runs (wide only)" : `+ ${run} run${run !== 1 ? 's' : ''}`}
                       </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  onClick={handleConfirmWide}
                  disabled={overallDisabled}
                  variant="outline"
                  className="flex-shrink-0 shadow-sm px-3 py-2"
                  aria-label={`Confirm wide with ${1 + parseInt(wideAdditionalRuns, 10)} total runs`}
                >
                  Confirm Wide ({1 + parseInt(wideAdditionalRuns, 10)})
                </Button>
              </div>
            </div>

            {/* No Ball Section */}
            <div className="space-y-2 p-4 border rounded-lg bg-background shadow-sm hover:shadow-md transition-shadow">
              <Label htmlFor="noball-additional-runs" className="font-semibold text-lg">No Ball</Label>
              <CardDescription>A no ball delivery (1 run) + any additional runs scored.</CardDescription>
              <div className="flex items-center gap-2 pt-2">
                <Select
                  value={noBallAdditionalRuns}
                  onValueChange={setNoBallAdditionalRuns}
                  disabled={overallDisabled}
                >
                  <SelectTrigger id="noball-additional-runs" className="flex-grow shadow-sm" aria-label="Select additional runs for no ball">
                    <SelectValue placeholder="Select runs..." />
                  </SelectTrigger>
                  <SelectContent>
                     {additionalRunOptionsForExtras.map(run => (
                       <SelectItem key={`noball-${run}`} value={String(run)}>
                         {run === 0 ? "0 runs (no ball only)" : `+ ${run} run${run !== 1 ? 's' : ''}`}
                       </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  onClick={handleConfirmNoBall}
                  disabled={overallDisabled}
                  variant="outline"
                  className="flex-shrink-0 shadow-sm px-3 py-2"
                  aria-label={`Confirm no ball with ${1 + parseInt(noBallAdditionalRuns, 10)} total runs`}
                >
                  Confirm NB ({1 + parseInt(noBallAdditionalRuns, 10)})
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
