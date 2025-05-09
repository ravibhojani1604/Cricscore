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
  id: string; 
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
  fieldingTeamBowlers: Bowler[]; 
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
    // The commentary ID is returned to be associated with an action if needed for undo
    return newId;
  }, []); // Empty dependency array because setCommentaryLog is stable and crypto.randomUUID/new Date() are self-contained.

  const backupStateForUndo = (commentaryIdForAction: string | null) => {
    setLastActionState({
      teamState: JSON.parse(JSON.stringify(currentBattingTeam)), // Deep copy
      fieldingTeamBowlers: JSON.parse(JSON.stringify(fieldingTeam.bowlers)), // Deep copy
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
      addCommentary(`${existingBowler.name} selected to bowl for ${fieldingTeam.name}.`, false);
      
      if (currentBowlerId !== existingBowler.id) {
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
      addCommentary(`${newBowler.name} is a new bowler for ${fieldingTeam.name}.`, false); 
    }
    setCanUndo(false); 
  }, [
    fieldingTeam, 
    addCommentary, 
    toast, 
    setFieldingTeam, 
    currentBowlerId, 
    setCurrentBowlerId, 
    setBallsByCurrentBowlerThisSpell, 
    setRunsOffBatAgainstCurrentBowlerThisSpell
  ]);


  const handleSetCurrentBowlerById = useCallback((bowlerId: string) => {
    const bowler = fieldingTeam.bowlers.find(b => b.id === bowlerId);
    if (bowler) {
        if (currentBowlerId !== bowlerId) { // Only reset if bowler actually changes
            setCurrentBowlerId(bowlerId);
            setBallsByCurrentBowlerThisSpell(0); 
            setRunsOffBatAgainstCurrentBowlerThisSpell(0);
            addCommentary(`${bowler.name} is now bowling for ${fieldingTeam.name}.`, false);
        } else {
             // If re-selecting the same bowler, no need to reset spell stats or add commentary
        }
    }
    setCanUndo(false);
  }, [fieldingTeam.bowlers, addCommentary, currentBowlerId, setCurrentBowlerId, setBallsByCurrentBowlerThisSpell, setRunsOffBatAgainstCurrentBowlerThisSpell]);


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
          return prevTeam; 
      }

      const updatedBowlers = prevTeam.bowlers.map(b => {
        if (b.id === bowlerIdToEdit) {
          oldName = b.name;
          return { ...b, name: newName.trim() };
        }
        return b;
      });
      if (oldName && oldName !== newName.trim()) { // Check if name actually changed
        addCommentary(`Bowler ${oldName}'s name changed to ${newName.trim()}.`, false);
        toast({ title: "Bowler Name Updated", description: `${oldName} is now ${newName.trim()}.`});
      } else if (!oldName) {
        // This case should ideally not happen if bowlerIdToEdit is valid
        toast({ title: "Error", description: "Could not find bowler to edit.", variant: "destructive"});
      }
      return { ...prevTeam, bowlers: updatedBowlers };
    });
     setCanUndo(false); 
  }, [setFieldingTeam, addCommentary, toast]);


  const handleAddRuns = useCallback((runsScored: number, isExtraRun: boolean = false) => {
    if (currentBattingTeam.wickets >= 10 || currentBattingTeam.overs >= MAX_OVERS || !currentBowlerId) return;
    
    const commentaryId = addCommentary("", true); 
    backupStateForUndo(commentaryId);

    setCurrentBattingTeam(prev => ({ ...prev, runs: prev.runs + runsScored }));
    
    let commentaryText = `${runsScored} run${runsScored !== 1 ? 's' : ''} scored!`;
    if (currentBowler) { // currentBowler is from useMemo, might be null if currentBowlerId is briefly unset
      commentaryText += ` Off ${currentBowler.name}.`;
      setFieldingTeam(prevTeam => {
        const bowlerIndex = prevTeam.bowlers.findIndex(b => b.id === currentBowler.id); // Use currentBowler.id
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
    
    const finalCommentary = `${commentaryText} Current score: ${currentBattingTeam.runs + runsScored}/${currentBattingTeam.wickets}`;
    setCommentaryLog(prevLog => prevLog.map(c => c.id === commentaryId ? {...c, text: finalCommentary} : c));

  }, [currentBattingTeam, setCurrentBattingTeam, addCommentary, currentBowler, setFieldingTeam, setRunsOffBatAgainstCurrentBowlerThisSpell, backupStateForUndo, currentBowlerId]);


  const handleAddWicket = useCallback(() => {
    if (currentBattingTeam.wickets >= 10 || currentBattingTeam.overs >= MAX_OVERS || !currentBowlerId) return;

    const commentaryId = addCommentary("", true); 
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
  }, [currentBattingTeam, setCurrentBattingTeam, addCommentary, toast, currentBowler, setFieldingTeam, backupStateForUndo, currentBowlerId]);

  const handleNextBall = useCallback((isLegalDelivery: boolean) => {
    if (currentBattingTeam.wickets >= 10 || currentBattingTeam.overs >= MAX_OVERS) {
        setCanUndo(false); 
        return;
    }
    
    const isScoringActionWithoutUndoYet = !lastActionState || (lastActionState.teamState.runs === currentBattingTeam.runs && lastActionState.teamState.wickets === currentBattingTeam.wickets);

    if (isLegalDelivery && isScoringActionWithoutUndoYet && currentBowlerId) { 
        const commentaryId = addCommentary("", true); 
        backupStateForUndo(commentaryId); 
        // For dot balls or other non-score-button-triggered legal deliveries, ensure undo is set up
        // And update the commentary placeholder correctly
        const dotBallCommentaryText = `Dot ball. Bowler: ${currentBowler?.name || 'Unknown'}. Score: ${currentBattingTeam.runs}/${currentBattingTeam.wickets}`;
        setCommentaryLog(prevLog => prevLog.map(c => c.id === commentaryId ? {...c, text: dotBallCommentaryText} : c));
    } else if (!isLegalDelivery && currentBowlerId) { // Extras like wide/no-ball are often handled by onAddRuns for the run part
        // If backupStateForUndo was called by onAddRuns for an extra, its commentaryId is already set.
        // If it's an extra without runs (e.g. a wide that wasn't hit, but still an extra ball and run),
        // ensure backup and commentary for the extra itself.
        const extraRunAlreadyAccountedByAddRuns = lastActionState && lastActionState.teamState.runs < currentBattingTeam.runs;
        if(!extraRunAlreadyAccountedByAddRuns){
            const commentaryId = addCommentary("", true);
            backupStateForUndo(commentaryId);
            const extraCommentary = `Extra delivery. Bowler: ${currentBowler?.name || 'Unknown'}. Score: ${currentBattingTeam.runs}/${currentBattingTeam.wickets}`;
            setCommentaryLog(prevLog => prevLog.map(c => c.id === commentaryId ? {...c, text: extraCommentary} : c));
        }
    }


    if (isLegalDelivery) {
      setCurrentBattingTeam(prevTeam => {
        const newBalls = prevTeam.balls + 1;
        if (newBalls >= 6) {
          const newOvers = prevTeam.overs + 1;
          // Over completion commentary handled by bowler spell logic or generic if no bowler
          
          if (newOvers >= MAX_OVERS) {
            addCommentary(`Innings ended for ${prevTeam.name} after ${MAX_OVERS} overs. Final Score: ${prevTeam.runs}/${prevTeam.wickets}`, false);
            toast({ title: "Innings Over!", description: `${prevTeam.name} completed ${MAX_OVERS} overs.`});
            setCanUndo(false); 
          }
          return { ...prevTeam, overs: newOvers, balls: 0 };
        }
        return { ...prevTeam, balls: newBalls };
      });

      if (currentBowler) { // currentBowler is from useMemo
        const bowlerWhoIsBowling = currentBowler; 
        const newBallsThisSpellForBowler = ballsByCurrentBowlerThisSpell + 1;

        setFieldingTeam(prevFieldingTeam => {
          const bowlerIndex = prevFieldingTeam.bowlers.findIndex(b => b.id === bowlerWhoIsBowling.id);
          if (bowlerIndex === -1) return prevFieldingTeam; 

          const updatedBowlers = [...prevFieldingTeam.bowlers];
          const bowlerToUpdate = { ...updatedBowlers[bowlerIndex] };
          bowlerToUpdate.totalBallsBowled += 1;
          
          if (newBallsThisSpellForBowler === 6) { // Bowler's over completed
            let overSummary = `Over ${Math.floor(bowlerToUpdate.totalBallsBowled / 6)} completed by ${bowlerWhoIsBowling.name}.`;
            if (runsOffBatAgainstCurrentBowlerThisSpell === 0) { 
              bowlerToUpdate.maidens += 1;
              overSummary += ` It's a MAIDEN!`;
            }
            const bowlerOvers = Math.floor(bowlerToUpdate.totalBallsBowled / 6);
            const bowlerBalls = bowlerToUpdate.totalBallsBowled % 6; // Should be 0 here
            overSummary += ` Figures for this over: ${runsOffBatAgainstCurrentBowlerThisSpell} run(s). Total: ${bowlerOvers}.${bowlerBalls} O, ${bowlerToUpdate.maidens} M, ${bowlerToUpdate.runsConceded} R, ${bowlerToUpdate.wickets} W.`;
            addCommentary(overSummary, false);
          }
          updatedBowlers[bowlerIndex] = bowlerToUpdate;
          return { ...prevFieldingTeam, bowlers: updatedBowlers };
        });

        setBallsByCurrentBowlerThisSpell(newBallsThisSpellForBowler);

        if (newBallsThisSpellForBowler === 6) { // Team over also completed if bowler's over completed
          toast({ 
            title: "Over Complete!", 
            description: `${bowlerWhoIsBowling.name} has finished their over. Current Score: ${currentBattingTeam.runs}/${currentBattingTeam.wickets}. Please select the next bowler.` 
          });
          addCommentary(`End of the over by ${bowlerWhoIsBowling.name}. Score: ${currentBattingTeam.runs}/${currentBattingTeam.wickets}. A new bowler is needed.`, false);
          
          setCurrentBowlerId(null); 
          setBallsByCurrentBowlerThisSpell(0); 
          setRunsOffBatAgainstCurrentBowlerThisSpell(0);
          setCanUndo(false); 
        }
      } else { // No current bowler selected, but it's a legal delivery
         // This case means team over increments, but no bowler stats are updated.
         // Commentary for team over completion if balls reach 6:
         if (currentBattingTeam.balls + 1 >= 6) { // Check if this ball completes the team over
            addCommentary(`Team Over ${currentBattingTeam.overs + 1} completed. Score: ${currentBattingTeam.runs}/${currentBattingTeam.wickets}. No bowler was selected for this over.`, false);
         }
      }
    } else { 
      // Non-legal delivery logic (e.g. wide, no-ball commentary was handled if backupStateForUndo was triggered)
      // If not, a generic message or specific logic for extras without runs can be here
      // This part is now less critical as backupStateForUndo for extras tries to cover it.
    }
     // Reset lastActionState if it wasn't consumed by a scoring action that then called backupStateForUndo itself.
     // This handles dot balls or extras that call backupStateForUndo directly from onNextBall.
     if (isLegalDelivery && isScoringActionWithoutUndoYet && currentBowlerId) {
        // The backup was done for this dot ball, no need to clear lastActionState here, it's fresh.
     } else if (!isLegalDelivery && currentBowlerId && !lastActionState?.lastCommentaryId?.startsWith("run_")) {
        // Backup was done for this extra, no need to clear.
     }
     // For other cases, or if backupStateForUndo wasn't called, ensure canUndo is appropriately managed.
     // Generally, after a ball, if no specific scoring action made it undoable, subsequent ball makes prior state less directly undoable.
     // However, `setCanUndo(false)` is mostly handled by major events like over completion, wicket, or innings end.

  }, [
    currentBattingTeam, setCurrentBattingTeam, 
    addCommentary, toast, 
    currentBowler, setCurrentBowlerId, currentBowlerId, // Added currentBowlerId
    setFieldingTeam, 
    ballsByCurrentBowlerThisSpell, setBallsByCurrentBowlerThisSpell,
    runsOffBatAgainstCurrentBowlerThisSpell, setRunsOffBatAgainstCurrentBowlerThisSpell,
    lastActionState, backupStateForUndo 
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
    addCommentary(`(Action Undone) Last recorded action has been reversed. Score: ${lastActionState.teamState.runs}/${lastActionState.teamState.wickets}`, false);

    setLastActionState(null);
    setCanUndo(false);
    toast({ title: "Action Undone", description: "The last recorded action has been reverted." });
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

    if (battingTeamKey === 'team1') { // Team Alpha was batting
      if (team2.runs === -1) { // Team Bravo (team2) hasn't batted yet
        // Initialize Team Bravo's batting innings, preserve their bowlers from when they were fielding
        setTeam2(prev => ({ 
            ...prev, 
            runs: 0, 
            wickets: 0, 
            overs: 0, 
            balls: 0, 
            bowlers: prev.bowlers // Preserve existing bowlers
        }));
      }
      setBattingTeamKey('team2'); // Team Bravo is now batting, Team Alpha is fielding
      addCommentary(`--- ${team2.name} starts their innings ---`, false);
      toast({ title: "Innings Changed", description: `${team2.name} are now batting. ${team1.name} will field.`});
    } else { // Team Bravo (team2) was batting
       // Team Alpha (team1) would start batting if it's a multi-innings match or a super over, etc.
       // For this T20 simulation, if team2 finishes, match usually ends.
      const gameFinished = team2.runs !== -1 && (team2.wickets >=10 || team2.overs >= MAX_OVERS || (isTeam1AllOutOrOversDone && team2.runs > team1.runs));
      if(gameFinished) {
        addCommentary(`--- Match Concluded ---`, false);
        toast({ title: "Match Concluded", description: "Review scores for the result."});
      } else {
         // This case implies team2's innings ended prematurely and team1 bats again, not typical for T20.
         // Or, it's the start of team1's second innings in a longer format (not modeled here)
         // For now, treat as if team1 is to bat again, but it's unusual for this app's T20 context.
        if (team1.runs === 0 && team1.wickets === 0 && team1.overs === 0 && team1.balls === 0 && team1.bowlers.length > 0 && team2.runs > -1) {
             // This implies team1 fielded, and now will bat their first innings after team2. (If team2 batted first)
             // To handle team2 batting first, the initial setup would need to reflect that.
             // Current setup always starts team1 batting. This else branch is more for "what if".
        }
        setBattingTeamKey('team1'); // Team Alpha is now batting, Team Bravo is fielding
        addCommentary(`--- ${team1.name} starts their innings ---`, false); // Or "resumes" if it was interrupted.
        toast({ title: "Innings Changed", description: `${team1.name} are now batting. ${team2.name} will field.`});
      }
    }
    setCurrentBowlerId(null);
    setBallsByCurrentBowlerThisSpell(0);
    setRunsOffBatAgainstCurrentBowlerThisSpell(0);
    setCanUndo(false); 
  };
  
  const inningsEnded = currentBattingTeam.wickets >= 10 || currentBattingTeam.overs >= MAX_OVERS;
  const matchCanStartSecondInnings = inningsEnded && battingTeamKey === 'team1' && team2.runs === -1;
  
  const isTeam1AllOutOrOversDone = team1.wickets >= 10 || team1.overs >= MAX_OVERS;
  const isTeam2AllOutOrOversDone = team2.runs !== -1 && (team2.wickets >= 10 || team2.overs >= MAX_OVERS);
  
  let matchEnded = false;
  let matchResultText = "";

  if (battingTeamKey === 'team1') { // Team Alpha is batting or just finished
    if (isTeam1AllOutOrOversDone && team2.runs > team1.runs && isTeam2AllOutOrOversDone) { // Team 2 already batted and won
        matchEnded = true;
        matchResultText = `${team2.name} won by ${team2.runs - team1.runs} runs.`;
    } else if (isTeam1AllOutOrOversDone && team2.runs !== -1 && team1.runs === team2.runs && isTeam2AllOutOrOversDone){
        matchEnded = true;
        matchResultText = "Match Tied!";
    }
    // Other conditions might apply if Team 2 hasn't batted fully yet.
  } else { // Team Bravo is batting or just finished
    if (isTeam2AllOutOrOversDone) { // Team 2's innings is complete
        matchEnded = true;
        if (team2.runs > team1.runs) {
            matchResultText = `${team2.name} won by ${team2.runs - team1.runs} runs.`;
        } else if (team1.runs > team2.runs) {
            matchResultText = `${team1.name} won by ${team1.runs - team2.runs} runs.`;
             if (team1.wickets < 10) { // If team1 won by wickets (chasing)
                matchResultText = `${team1.name} won by ${10 - team1.wickets} wickets.`;
            }
        } else { // Scores are equal
            matchResultText = "Match Tied!";
        }
    } else if (team2.runs > team1.runs && isTeam1AllOutOrOversDone) { // Team 2 chasing and overtook score
        matchEnded = true;
        matchResultText = `${team2.name} won by ${10 - team2.wickets} wickets.`;
    }
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
                 <p className="text-lg font-semibold text-primary">{matchResultText || "Match Ended!"}</p>
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
              {/* Display Team 2 score card if they have started batting (runs !== -1) or if match ended (to show final scores) */}
              {(team2.runs !== -1 || matchEnded) && (
                <ScoreDisplay 
                  teamName={team2.name}
                  runs={team2.runs === -1 ? 0 : team2.runs} // Show 0 if not started but match ended
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
                  disabled={!currentBowlerId || inningsEnded || matchEnded}
                />
                <Button onClick={handleUndoLastAction} disabled={!canUndo || inningsEnded || matchEnded} variant="outline" className="w-full">
                  <Undo className="mr-2 h-4 w-4" /> Undo Last Action
                </Button>
              </>
            ) : (
              <div className="p-4 text-center bg-muted rounded-md shadow">
                <p className="font-semibold text-lg">
                    {matchEnded ? (matchResultText || "Match Concluded") : `Innings Over for ${currentBattingTeam.name}!`}
                </p>
                {!matchEnded && <p>Score: {currentBattingTeam.runs}/{currentBattingTeam.wickets} in {currentBattingTeam.overs}.{currentBattingTeam.balls} overs.</p>}
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