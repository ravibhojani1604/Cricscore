
'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import { Header } from '@/components/layout/header';
import { ScoreDisplay } from '@/components/features/score-display';
import { StatisticsTracker } from '@/components/features/statistics-tracker';
import { ScoreControls } from '@/components/features/score-controls';
import { LiveCommentaryFeed } from '@/components/features/live-commentary-feed';
import { HighlightSummarizer } from '@/components/features/highlight-summarizer';
import { BowlerControls } from '@/components/features/bowler-controls';
import { BowlingStatsDisplay } from '@/components/features/bowling-stats-display';
import { Button } from '@/components/ui/button';
import { RefreshCw, Undo } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface CommentaryItem {
  id: string;
  text: string;
  timestamp: string;
}

interface Bowler {
  id: string; // Added ID for unique identification
  name: string;
  totalBallsBowled: number;
  maidens: number;
  runsConceded: number;
  wickets: number;
}

interface TeamState {
  name: string;
  runs: number;
  wickets: number;
  overs: number;
  balls: number;
  bowlers: Bowler[];
}

interface LastActionState {
  teamState: TeamState;
  fieldingTeamBowlers: Bowler[]; // Store the whole bowlers array for simplicity or just the modified bowler
  currentBowlerId: string | null;
  ballsByCurrentBowlerThisSpell: number;
  runsOffBatAgainstCurrentBowlerThisSpell: number;
  lastCommentaryId: string | null;
}


const MAX_OVERS = 20;

export default function CricketPage() {
  const { toast } = useToast();

  const initialTeamStateFactory = (name: string): TeamState => ({
    name,
    runs: 0,
    wickets: 0,
    overs: 0,
    balls: 0,
    bowlers: [],
  });

  const [team1, setTeam1] = useState<TeamState>({...initialTeamStateFactory('Team Alpha')});
  const [team2, setTeam2] = useState<TeamState>({...initialTeamStateFactory('Team Bravo'), runs: -1 });
  const [battingTeamKey, setBattingTeamKey] = useState<'team1' | 'team2'>('team1');
  
  const [commentaryLog, setCommentaryLog] = useState<CommentaryItem[]>([]);
  const [currentBowlerId, setCurrentBowlerId] = useState<string | null>(null);
  
  const [ballsByCurrentBowlerThisSpell, setBallsByCurrentBowlerThisSpell] = useState(0);
  const [runsOffBatAgainstCurrentBowlerThisSpell, setRunsOffBatAgainstCurrentBowlerThisSpell] = useState(0);

  // For Undo functionality
  const [lastActionState, setLastActionState] = useState<LastActionState | null>(null);
  const [canUndo, setCanUndo] = useState(false);

  const currentBattingTeam = battingTeamKey === 'team1' ? team1 : team2;
  const setCurrentBattingTeam = battingTeamKey === 'team1' ? setTeam1 : setTeam2;
  
  const fieldingTeamKey = battingTeamKey === 'team1' ? 'team2' : 'team1';
  const fieldingTeam = fieldingTeamKey === 'team1' ? team1 : team2;
  const setFieldingTeam = fieldingTeamKey === 'team1' ? setTeam1 : setTeam2;

  const currentBowler = useMemo(() => {
    return fieldingTeam.bowlers.find(b => b.id === currentBowlerId) || null;
  }, [fieldingTeam.bowlers, currentBowlerId]);

  const addCommentary = useCallback((text: string, isUndoable: boolean = true): string => {
    const newId = crypto.randomUUID();
    const newCommentaryItem = { id: newId, text, timestamp: new Date().toISOString() };
    setCommentaryLog(prevLog => [...prevLog, newCommentaryItem]);
    if (isUndoable && newId) {
        // This will be captured by backupStateForUndo to associate with the action
    }
    return newId;
  }, []);

  const backupStateForUndo = (commentaryIdForAction: string | null) => {
    setLastActionState({
      teamState: JSON.parse(JSON.stringify(currentBattingTeam)),
      fieldingTeamBowlers: JSON.parse(JSON.stringify(fieldingTeam.bowlers)),
      currentBowlerId: currentBowlerId,
      ballsByCurrentBowlerThisSpell: ballsByCurrentBowlerThisSpell,
      runsOffBatAgainstCurrentBowlerThisSpell: runsOffBatAgainstCurrentBowlerThisSpell,
      lastCommentaryId: commentaryIdForAction,
    });
    setCanUndo(true);
  };

  const handleAddOrSelectBowlerByName = useCallback((name: string) => {
    if (!name.trim()) {
      toast({ title: "Invalid Bowler Name", description: "Bowler name cannot be empty.", variant: "destructive"});
      return;
    }
    const existingBowler = fieldingTeam.bowlers.find(b => b.name.toLowerCase() === name.trim().toLowerCase());
    if (existingBowler) {
      setCurrentBowlerId(existingBowler.id);
      addCommentary(`${existingBowler.name} selected to bowl for ${fieldingTeam.name}.`);
      // Reset spell stats if it's a different bowler or first time selecting this session
      const currentSelectedBowler = fieldingTeam.bowlers.find(b => b.id === existingBowler.id);
      if (currentBowlerId !== existingBowler.id || !currentSelectedBowler) {
          setBallsByCurrentBowlerThisSpell(0);
          setRunsOffBatAgainstCurrentBowlerThisSpell(0);
      }

    } else {
      const newBowler: Bowler = { 
        id: crypto.randomUUID(), 
        name: name.trim(), 
        totalBallsBowled: 0, 
        maidens: 0, 
        runsConceded: 0, 
        wickets: 0 
      };
      setFieldingTeam(prevTeam => ({ ...prevTeam, bowlers: [...prevTeam.bowlers, newBowler] }));
      setCurrentBowlerId(newBowler.id);
      setBallsByCurrentBowlerThisSpell(0);
      setRunsOffBatAgainstCurrentBowlerThisSpell(0);
      addCommentary(`${newBowler.name} is a new bowler for ${fieldingTeam.name}.`);
    }
    setCanUndo(false); // Selecting a bowler is not undoable in this context
  }, [fieldingTeam, addCommentary, toast, setFieldingTeam, currentBowlerId]);


  const handleSetCurrentBowlerById = useCallback((bowlerId: string) => {
    const bowler = fieldingTeam.bowlers.find(b => b.id === bowlerId);
    if (bowler) {
        setCurrentBowlerId(bowlerId);
        setBallsByCurrentBowlerThisSpell(0); // Reset spell stats for new/changed bowler
        setRunsOffBatAgainstCurrentBowlerThisSpell(0);
        addCommentary(`${bowler.name} is now bowling for ${fieldingTeam.name}.`);
    }
    setCanUndo(false);
  }, [fieldingTeam.bowlers, addCommentary]);


  const handleEditBowlerName = useCallback((bowlerIdToEdit: string, newName: string) => {
    if (!newName.trim()) {
      toast({ title: "Invalid Name", description: "Bowler name cannot be empty.", variant: "destructive" });
      return;
    }
    let oldName = "";
    setFieldingTeam(prevTeam => {
      const bowlerExistsWithNewName = prevTeam.bowlers.some(b => b.name.toLowerCase() === newName.trim().toLowerCase() && b.id !== bowlerIdToEdit);
      if (bowlerExistsWithNewName) {
          toast({title: "Duplicate Name", description: "Another bowler already has this name.", variant: "destructive"});
          return prevTeam; // Do not update
      }

      const updatedBowlers = prevTeam.bowlers.map(b => {
        if (b.id === bowlerIdToEdit) {
          oldName = b.name;
          return { ...b, name: newName.trim() };
        }
        return b;
      });
      if (oldName) {
        addCommentary(`Bowler ${oldName}'s name changed to ${newName.trim()}.`, false);
        toast({ title: "Bowler Name Updated", description: `${oldName} is now ${newName.trim()}.`});
      }
      return { ...prevTeam, bowlers: updatedBowlers };
    });
     setCanUndo(false); // Name edit not part of ball-by-ball undo
  }, [setFieldingTeam, addCommentary, toast]);


  const handleAddRuns = useCallback((runsScored: number, isExtraRun: boolean = false) => {
    if (currentBattingTeam.wickets >= 10 || currentBattingTeam.overs >= MAX_OVERS) return;
    
    const commentaryId = addCommentary("", true); // Placeholder, will be updated
    backupStateForUndo(commentaryId);

    setCurrentBattingTeam(prev => ({ ...prev, runs: prev.runs + runsScored }));
    
    let commentaryText = `${runsScored} run${runsScored !== 1 ? 's' : ''} scored!`;
    if (currentBowler) {
      commentaryText += ` Off ${currentBowler.name}.`;
      setFieldingTeam(prevTeam => {
        const bowlerIndex = prevTeam.bowlers.findIndex(b => b.id === currentBowler.id);
        if (bowlerIndex !== -1) {
          const updatedBowlers = [...prevTeam.bowlers];
          updatedBowlers[bowlerIndex] = {
            ...updatedBowlers[bowlerIndex],
            runsConceded: updatedBowlers[bowlerIndex].runsConceded + runsScored,
          };
          return { ...prevTeam, bowlers: updatedBowlers };
        }
        return prevTeam;
      });
    }
    if (!isExtraRun) {
      setRunsOffBatAgainstCurrentBowlerThisSpell(prev => prev + runsScored);
    }
    
    // Update the commentary entry with full details
    const finalCommentary = `${commentaryText} Current score: ${currentBattingTeam.runs + runsScored}/${currentBattingTeam.wickets}`;
    setCommentaryLog(prevLog => prevLog.map(c => c.id === commentaryId ? {...c, text: finalCommentary} : c));

  }, [currentBattingTeam, setCurrentBattingTeam, addCommentary, currentBowler, setFieldingTeam, setRunsOffBatAgainstCurrentBowlerThisSpell, backupStateForUndo]);


  const handleAddWicket = useCallback(() => {
    if (currentBattingTeam.wickets >= 10 || currentBattingTeam.overs >= MAX_OVERS) return;

    const commentaryId = addCommentary("", true); // Placeholder
    backupStateForUndo(commentaryId);

    setCurrentBattingTeam(prev => ({ ...prev, wickets: prev.wickets + 1 }));
    let wicketCommentary = `WICKET! That's wicket number ${currentBattingTeam.wickets + 1}.`;
    
    if (currentBowler) {
      wicketCommentary += ` Bowler: ${currentBowler.name}.`;
      setFieldingTeam(prevTeam => {
        const bowlerIndex = prevTeam.bowlers.findIndex(b => b.id === currentBowler.id);
        if (bowlerIndex !== -1) {
          const updatedBowlers = [...prevTeam.bowlers];
          updatedBowlers[bowlerIndex] = {
            ...updatedBowlers[bowlerIndex],
            wickets: updatedBowlers[bowlerIndex].wickets + 1,
          };
          return { ...prevTeam, bowlers: updatedBowlers };
        }
        return prevTeam;
      });
    }
    
    const finalCommentary = `${wicketCommentary} Score: ${currentBattingTeam.runs}/${currentBattingTeam.wickets + 1}`;
     setCommentaryLog(prevLog => prevLog.map(c => c.id === commentaryId ? {...c, text: finalCommentary} : c));

    if (currentBattingTeam.wickets + 1 >= 10) {
      addCommentary(`Innings ended for ${currentBattingTeam.name}.`, false);
      toast({ title: "Innings Over!", description: `${currentBattingTeam.name} are all out.`});
      setCanUndo(false);
    }
  }, [currentBattingTeam, setCurrentBattingTeam, addCommentary, toast, currentBowler, setFieldingTeam, backupStateForUndo]);

  const handleNextBall = useCallback((isLegalDelivery: boolean) => {
    if (currentBattingTeam.wickets >= 10 || currentBattingTeam.overs >= MAX_OVERS) {
        setCanUndo(false); // No further balls, so no undo for ball progression
        return;
    }
    // backupStateForUndo is called by handleAddRuns/handleAddWicket which precede this for scoring shots
    // For extras like wide/no-ball that don't have runs/wickets directly associated via those handlers before onNextBall:
    if (!lastActionState && isLegalDelivery === false) { // If it's an extra processed directly by NextBall
        const commentaryId = addCommentary("", true); // Placeholder for extra's own commentary
        backupStateForUndo(commentaryId);
    }


    if (isLegalDelivery) {
      setCurrentBattingTeam(prevTeam => {
        const newBalls = prevTeam.balls + 1;
        if (newBalls >= 6) {
          const newOvers = prevTeam.overs + 1;
          addCommentary(`Team Over ${newOvers} completed. Score: ${prevTeam.runs}/${prevTeam.wickets}`, false);
          
          if (newOvers >= MAX_OVERS) {
            addCommentary(`Innings ended for ${prevTeam.name} after ${MAX_OVERS} overs.`, false);
            toast({ title: "Innings Over!", description: `${prevTeam.name} completed ${MAX_OVERS} overs.`});
            setCanUndo(false); // Innings over
          }
          return { ...prevTeam, overs: newOvers, balls: 0 };
        }
        return { ...prevTeam, balls: newBalls };
      });

      if (currentBowler) {
        const bowlerWhoIsBowling = currentBowler; 
        const newBallsThisSpellForBowler = ballsByCurrentBowlerThisSpell + 1;

        setFieldingTeam(prevFieldingTeam => {
          const bowlerIndex = prevFieldingTeam.bowlers.findIndex(b => b.id === bowlerWhoIsBowling.id);
          if (bowlerIndex === -1) return prevFieldingTeam; 

          const updatedBowlers = [...prevFieldingTeam.bowlers];
          const bowlerToUpdate = { ...updatedBowlers[bowlerIndex] };
          bowlerToUpdate.totalBallsBowled += 1;
          
          if (newBallsThisSpellForBowler === 6) {
            let overSummary = `Over completed by ${bowlerWhoIsBowling.name}.`;
            if (runsOffBatAgainstCurrentBowlerThisSpell === 0) { 
              bowlerToUpdate.maidens += 1;
              overSummary += ` It's a MAIDEN!`;
            }
            const bowlerOvers = Math.floor(bowlerToUpdate.totalBallsBowled / 6);
            const bowlerBalls = bowlerToUpdate.totalBallsBowled % 6;
            overSummary += ` Figures: ${bowlerOvers}.${bowlerBalls} O, ${bowlerToUpdate.maidens} M, ${bowlerToUpdate.runsConceded} R, ${bowlerToUpdate.wickets} W.`;
            addCommentary(overSummary, false);
          }
          updatedBowlers[bowlerIndex] = bowlerToUpdate;
          return { ...prevFieldingTeam, bowlers: updatedBowlers };
        });

        setBallsByCurrentBowlerThisSpell(newBallsThisSpellForBowler);

        if (newBallsThisSpellForBowler === 6) {
          toast({ 
            title: "Over Complete!", 
            description: `${bowlerWhoIsBowling.name} has finished their over. Please select the next bowler.` 
          });
          addCommentary(`End of the over by ${bowlerWhoIsBowling.name}. A new bowler is needed.`, false);
          
          setCurrentBowlerId(null); 
          setBallsByCurrentBowlerThisSpell(0); 
          setRunsOffBatAgainstCurrentBowlerThisSpell(0);
          setCanUndo(false); // Over complete, new bowler selection is next logical step
        }
      }
    } else { // Not a legal delivery (e.g. wide, no-ball)
      // Commentary for extras is usually handled by onAddRuns if runs are scored,
      // or here if it's just the extra itself.
      // If backupStateForUndo was called above for an extra:
      if (lastActionState && lastActionState.lastCommentaryId && !currentBattingTeam.wickets && currentBattingTeam.runs === lastActionState.teamState.runs -1) { // Basic check if it's likely an extra
           const extraCommentary = `Extra delivery (e.g., Wide/No-ball). Ball does not count towards the over. Score: ${currentBattingTeam.runs}/${currentBattingTeam.wickets}`;
           setCommentaryLog(prevLog => prevLog.map(c => c.id === lastActionState.lastCommentaryId ? {...c, text: extraCommentary} : c));
      } else {
           addCommentary(`Extra delivery. Ball does not count towards the over. Score: ${currentBattingTeam.runs}/${currentBattingTeam.wickets}`, true); // This might be a duplicate if already handled
      }
    }
  }, [
    currentBattingTeam, setCurrentBattingTeam, 
    addCommentary, toast, 
    currentBowler, setCurrentBowlerId, 
    setFieldingTeam, 
    ballsByCurrentBowlerThisSpell, setBallsByCurrentBowlerThisSpell,
    runsOffBatAgainstCurrentBowlerThisSpell, setRunsOffBatAgainstCurrentBowlerThisSpell,
    lastActionState, backupStateForUndo // Added backupStateForUndo
  ]);

  const handleUndoLastAction = () => {
    if (!canUndo || !lastActionState) {
      toast({ title: "Cannot Undo", description: "No action to undo or action is not undoable.", variant: "destructive" });
      return;
    }

    setCurrentBattingTeam(lastActionState.teamState);
    setFieldingTeam(prev => ({...prev, bowlers: lastActionState.fieldingTeamBowlers}));
    setCurrentBowlerId(lastActionState.currentBowlerId);
    setBallsByCurrentBowlerThisSpell(lastActionState.ballsByCurrentBowlerThisSpell);
    setRunsOffBatAgainstCurrentBowlerThisSpell(lastActionState.runsOffBatAgainstCurrentBowlerThisSpell);
    
    if (lastActionState.lastCommentaryId) {
      setCommentaryLog(prev => prev.filter(c => c.id !== lastActionState.lastCommentaryId));
    }
    addCommentary(`(Action Undone) Last scoring action has been reversed.`, false);

    setLastActionState(null);
    setCanUndo(false);
    toast({ title: "Action Undone", description: "The last scoring action has been reverted." });
  };


  const handleAddManualCommentary = useCallback((text: string) => {
    addCommentary(`(Manual) ${text}`, false);
  }, [addCommentary]);

  const fullCommentaryText = useMemo(() => {
    return commentaryLog.map(c => `${new Date(c.timestamp).toLocaleTimeString()}: ${c.text}`).join('\n');
  }, [commentaryLog]);

  const resetMatch = () => {
    setTeam1({...initialTeamStateFactory('Team Alpha')});
    setTeam2({...initialTeamStateFactory('Team Bravo'), runs: -1 });
    setBattingTeamKey('team1');
    setCommentaryLog([]);
    setCurrentBowlerId(null);
    setBallsByCurrentBowlerThisSpell(0);
    setRunsOffBatAgainstCurrentBowlerThisSpell(0);
    setLastActionState(null);
    setCanUndo(false);
    toast({ title: "Match Reset", description: "The match has been reset to its initial state."});
  };
  
  const switchInnings = () => {
    if (currentBowler && ballsByCurrentBowlerThisSpell > 0 && ballsByCurrentBowlerThisSpell < 6) {
        addCommentary(`${currentBowler.name} finishes their incomplete over due to innings change. Figures may be partial for this spell.`, false);
    }

    if (battingTeamKey === 'team1') {
      if (team2.runs === -1) { 
        setTeam2(prev => ({ ...prev, runs: 0, wickets: 0, overs: 0, balls: 0, bowlers: [] }));
      }
      setBattingTeamKey('team2');
      addCommentary(`--- ${team2.name} starts their innings ---`, false);
      toast({ title: "Innings Changed", description: `${team2.name} are now batting.`});
    } else {
      // Logic for switching back or ending match
      const gameFinished = team2.runs !== -1 && (team2.wickets >=10 || team2.overs >= MAX_OVERS || (team1.overs >= MAX_OVERS && team1.runs < team2.runs));
      if(gameFinished) {
        addCommentary(`--- Match Concluded ---`, false);
        toast({ title: "Match Concluded", description: "Review scores for the result."});
      } else {
         // This condition might need review based on match rules (e.g. if Team1 can bat again)
        addCommentary(`--- Innings switch requested for ${team1.name}. Ensure match context is correct. ---`, false);
        toast({ title: "Match Status", description: "Consider match end or further innings."});
        setBattingTeamKey('team1'); 
      }
    }
    setCurrentBowlerId(null);
    setBallsByCurrentBowlerThisSpell(0);
    setRunsOffBatAgainstCurrentBowlerThisSpell(0);
    setCanUndo(false); // Innings switch makes previous ball actions irrelevant for undo
  };
  
  const inningsEnded = currentBattingTeam.wickets >= 10 || currentBattingTeam.overs >= MAX_OVERS;
  const matchCanStartSecondInnings = inningsEnded && battingTeamKey === 'team1' && team2.runs === -1;
  
  const isTeam1AllOutOrOversDone = team1.wickets >= 10 || team1.overs >= MAX_OVERS;
  const isTeam2AllOutOrOversDone = team2.runs !== -1 && (team2.wickets >= 10 || team2.overs >= MAX_OVERS);
  
  let matchEnded = false;
  if (battingTeamKey === 'team1' && isTeam1AllOutOrOversDone && team2.runs !== -1 && team1.runs < team2.runs && isTeam2AllOutOrOversDone) {
      matchEnded = true;
  } else if (battingTeamKey === 'team2' && isTeam2AllOutOrOversDone) {
      matchEnded = true;
  } else if (battingTeamKey === 'team2' && team2.runs > team1.runs && isTeam1AllOutOrOversDone) {
      matchEnded = true;
  }


  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow container mx-auto p-4 md:p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-semibold text-primary">Current Match</h2>
          <div className="space-x-2">
            { matchCanStartSecondInnings && !matchEnded && (
                <Button onClick={switchInnings} variant="outline" className="border-accent text-accent-foreground hover:bg-accent hover:text-accent-foreground">Start {team2.name}'s Innings</Button>
            )}
             { matchEnded && (
                 <p className="text-lg font-semibold text-primary">Match Ended!</p>
             )}
            <Button onClick={resetMatch} variant="outline">
              <RefreshCw className="mr-2 h-4 w-4" /> Reset Match
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ScoreDisplay 
                teamName={team1.name}
                runs={team1.runs}
                wickets={team1.wickets}
                overs={team1.overs}
                balls={team1.balls}
                isBatting={battingTeamKey === 'team1'}
              />
              {team2.runs !== -1 && (
                <ScoreDisplay 
                  teamName={team2.name}
                  runs={team2.runs}
                  wickets={team2.wickets}
                  overs={team2.overs}
                  balls={team2.balls}
                  isBatting={battingTeamKey === 'team2'}
                />
              )}
            </div>
            
            <StatisticsTracker 
              runs={currentBattingTeam.runs} 
              overs={currentBattingTeam.overs} 
              balls={currentBattingTeam.balls} 
            />
            
            {!inningsEnded && !matchEnded ? (
              <>
                <BowlerControls
                  bowlers={fieldingTeam.bowlers}
                  currentBowlerId={currentBowlerId}
                  onAddOrSelectBowlerByName={handleAddOrSelectBowlerByName}
                  onSetCurrentBowlerById={handleSetCurrentBowlerById}
                  onEditBowlerName={handleEditBowlerName}
                  disabled={inningsEnded || matchEnded}
                  fieldingTeamName={fieldingTeam.name}
                />
                <ScoreControls
                  onAddRuns={handleAddRuns}
                  onAddWicket={handleAddWicket}
                  onNextBall={handleNextBall}
                  teamName={currentBattingTeam.name}
                  isBowlerSelected={!!currentBowlerId}
                />
                <Button onClick={handleUndoLastAction} disabled={!canUndo} variant="outline" className="w-full">
                  <Undo className="mr-2 h-4 w-4" /> Undo Last Action
                </Button>
              </>
            ) : (
              <div className="p-4 text-center bg-muted rounded-md shadow">
                <p className="font-semibold text-lg">
                    {matchEnded ? "Match Concluded" : `Innings Over for ${currentBattingTeam.name}!`}
                </p>
                {!matchEnded && <p>Score: {currentBattingTeam.runs}/{currentBattingTeam.wickets} in {currentBattingTeam.overs}.{currentBattingTeam.balls} overs.</p>}
                 {matchEnded && battingTeamKey === 'team1' && team1.runs > team2.runs && isTeam2AllOutOrOversDone && <p>{team1.name} wins!</p>}
                 {matchEnded && battingTeamKey === 'team1' && team1.runs < team2.runs && isTeam2AllOutOrOversDone && <p>{team2.name} wins!</p>}
                 {matchEnded && battingTeamKey === 'team2' && team2.runs > team1.runs && isTeam1AllOutOrOversDone && <p>{team2.name} wins!</p>}
                 {matchEnded && battingTeamKey === 'team2' && team2.runs < team1.runs && isTeam1AllOutOrOversDone && <p>{team1.name} wins!</p>}
                 {matchEnded && team1.runs === team2.runs && (isTeam1AllOutOrOversDone && isTeam2AllOutOrOversDone) && <p>Match Tied!</p>}
              </div>
            )}
          </div>

          <div className="lg:col-span-1 space-y-6 flex flex-col">
             <BowlingStatsDisplay bowlers={fieldingTeam.bowlers} teamName={fieldingTeam.name} />
            <LiveCommentaryFeed
              commentaryLog={commentaryLog}
              onAddManualCommentary={handleAddManualCommentary}
            />
            <HighlightSummarizer commentaryToSummarize={fullCommentaryText} />
          </div>
        </div>
      </main>
      <footer className="text-center p-4 text-sm text-muted-foreground border-t">
        Cricket Companion &copy; {new Date().getFullYear()}
      </footer>
    </div>
  );
}

    