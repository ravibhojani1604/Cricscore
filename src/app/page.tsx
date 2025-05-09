
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
import { BatterControls } from '@/components/features/batter-controls';
import { BattingStatsDisplay } from '@/components/features/batting-stats-display';
import { MatchHistoryDisplay } from '@/components/features/match-history-display';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { RefreshCw, Undo, History } from 'lucide-react';
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

interface Batter {
  id: string;
  name: string;
  runsScored: number;
  ballsFaced: number;
  fours: number;
  sixes: number;
  isOut: boolean;
  howOut?: string; 
  order: number; 
}

interface TeamState {
  name: string;
  runs: number;
  wickets: number;
  overs: number;
  balls: number;
  extras: number; // Added extras
  bowlers: Bowler[];
  batters: Batter[];
}

interface LastActionState {
  teamState: TeamState;
  fieldingTeamBowlers: Bowler[]; 
  currentBowlerId: string | null;
  onStrikeBatterId: string | null;
  offStrikeBatterId: string | null;
  ballsByCurrentBowlerThisSpell: number;
  runsOffBatAgainstCurrentBowlerThisSpell: number;
  lastCommentaryId: string | null;
}

export interface MatchRecord {
  id: string;
  team1Name: string;
  team1Score: string;
  team1Overs: string;
  team1Extras: number;
  team2Name: string;
  team2Score: string;
  team2Overs: string;
  team2Extras: number;
  result: string;
  date: string; 
}


const MAX_OVERS = 20;
const MAX_WICKETS = 10;
const MAX_BATTERS_PER_TEAM = 11;
const MAX_BOWLERS_PER_TEAM_LIST = 11; // Assuming max 11 players can be listed as bowlers too

export default function CricketPage() {
  const { toast } = useToast();

  const initialTeamStateFactory = (name: string): TeamState => ({
    name,
    runs: 0,
    wickets: 0,
    overs: 0,
    balls: 0,
    extras: 0, // Initialize extras
    bowlers: [],
    batters: [],
  });

  const [team1, setTeam1] = useState<TeamState>({...initialTeamStateFactory('Team Alpha')});
  const [team2, setTeam2] = useState<TeamState>({...initialTeamStateFactory('Team Bravo'), runs: -1 }); 
  const [battingTeamKey, setBattingTeamKey] = useState<'team1' | 'team2'>('team1');
  
  const [commentaryLog, setCommentaryLog] = useState<CommentaryItem[]>([]);
  const [currentBowlerId, setCurrentBowlerId] = useState<string | null>(null);
  const [onStrikeBatterId, setOnStrikeBatterId] = useState<string | null>(null);
  const [offStrikeBatterId, setOffStrikeBatterId] = useState<string | null>(null);
  
  const [ballsByCurrentBowlerThisSpell, setBallsByCurrentBowlerThisSpell] = useState(0);
  const [runsOffBatAgainstCurrentBowlerThisSpell, setRunsOffBatAgainstCurrentBowlerThisSpell] = useState(0);

  const [lastActionState, setLastActionState] = useState<LastActionState | null>(null);
  const [canUndo, setCanUndo] = useState(false);

  const [matchHistory, setMatchHistory] = useState<MatchRecord[]>([]);
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);
  const [hasMatchBeenSaved, setHasMatchBeenSaved] = useState(false);

  const currentBattingTeam = battingTeamKey === 'team1' ? team1 : team2;
  const setCurrentBattingTeam = battingTeamKey === 'team1' ? setTeam1 : setTeam2;
  
  const fieldingTeamKey = battingTeamKey === 'team1' ? 'team2' : 'team1';
  const fieldingTeam = fieldingTeamKey === 'team1' ? team1 : team2;
  const setFieldingTeam = fieldingTeamKey === 'team1' ? setTeam1 : setTeam2;

  const currentBowler = useMemo(() => {
    return fieldingTeam.bowlers.find(b => b.id === currentBowlerId) || null;
  }, [fieldingTeam.bowlers, currentBowlerId]);

  const onStrikeBatter = useMemo(() => {
    return currentBattingTeam.batters.find(b => b.id === onStrikeBatterId) || null;
  }, [currentBattingTeam.batters, onStrikeBatterId]);

  const offStrikeBatter = useMemo(() => {
    return currentBattingTeam.batters.find(b => b.id === offStrikeBatterId) || null;
  }, [currentBattingTeam.batters, offStrikeBatterId]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedHistory = localStorage.getItem('cricketMatchHistory');
      if (storedHistory) {
        setMatchHistory(JSON.parse(storedHistory));
      }
    }
  }, []);

  const addCommentary = useCallback((text: string, isUndoable: boolean = true): string => {
    const newId = crypto.randomUUID();
    const newCommentaryItem = { id: newId, text, timestamp: new Date().toISOString() };
    setCommentaryLog(prevLog => [newCommentaryItem, ...prevLog]); // Add to beginning for newest first
    return newId;
  }, []);

  const backupStateForUndo = (commentaryIdForAction: string | null) => {
    setLastActionState({
      teamState: JSON.parse(JSON.stringify(currentBattingTeam)),
      fieldingTeamBowlers: JSON.parse(JSON.stringify(fieldingTeam.bowlers)),
      currentBowlerId: currentBowlerId,
      onStrikeBatterId: onStrikeBatterId,
      offStrikeBatterId: offStrikeBatterId,
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
    if (currentBowlerId && ballsByCurrentBowlerThisSpell > 0 && ballsByCurrentBowlerThisSpell < 6) {
        toast({ title: "Over in Progress", description: "Cannot change bowler mid-over unless the current over is complete.", variant: "destructive" });
        return;
    }
     if (fieldingTeam.bowlers.length >= 1 && !fieldingTeam.bowlers.find(b => b.name.toLowerCase() === name.trim().toLowerCase())) {
      toast({ title: "Bowler Limit Reached", description: `Only one bowler can be active or in the list for ${fieldingTeam.name} at a time for this version. Select the existing bowler or clear to add a new one.`, variant: "destructive"});
      return;
    }


    const existingBowler = fieldingTeam.bowlers.find(b => b.name.toLowerCase() === name.trim().toLowerCase());
    if (existingBowler) {
      if (currentBowlerId !== existingBowler.id) {
        setCurrentBowlerId(existingBowler.id);
        setBallsByCurrentBowlerThisSpell(0);
        setRunsOffBatAgainstCurrentBowlerThisSpell(0);
        addCommentary(`${existingBowler.name} selected to bowl for ${fieldingTeam.name}.`, false);
      }
    } else {
      if (fieldingTeam.bowlers.length >= MAX_BOWLERS_PER_TEAM_LIST) { 
        toast({ title: "Team Full", description: `Cannot add more than ${MAX_BOWLERS_PER_TEAM_LIST} players (including bowlers) to ${fieldingTeam.name}.`, variant: "destructive" });
        return;
      }
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
  }, [fieldingTeam, addCommentary, toast, setFieldingTeam, currentBowlerId, ballsByCurrentBowlerThisSpell]);

  const handleSetCurrentBowlerById = useCallback((bowlerId: string) => {
     if (currentBowlerId && ballsByCurrentBowlerThisSpell > 0 && ballsByCurrentBowlerThisSpell < 6 && currentBowlerId !== bowlerId) {
        toast({ title: "Over in Progress", description: "Cannot change bowler mid-over. Complete the current over first.", variant: "destructive" });
        return;
    }
    const bowler = fieldingTeam.bowlers.find(b => b.id === bowlerId);
    if (bowler) {
        if (currentBowlerId !== bowlerId) {
            setCurrentBowlerId(bowlerId);
            setBallsByCurrentBowlerThisSpell(0); 
            setRunsOffBatAgainstCurrentBowlerThisSpell(0);
            addCommentary(`${bowler.name} is now bowling for ${fieldingTeam.name}.`, false);
        }
    }
    setCanUndo(false);
  }, [fieldingTeam.bowlers, addCommentary, currentBowlerId, fieldingTeam.name, ballsByCurrentBowlerThisSpell, toast]);

  const handleEditBowlerName = useCallback((bowlerIdToEdit: string, newName: string) => {
    if (!newName.trim()) {
      toast({ title: "Invalid Name", description: "Bowler name cannot be empty.", variant: "destructive" });
      return;
    }
    
    if (currentBowlerId === bowlerIdToEdit && ballsByCurrentBowlerThisSpell > 0) {
        toast({ title: "Cannot Edit Bowler", description: "Bowler name cannot be changed mid-over. Wait for the over to complete.", variant: "destructive"});
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
      if (oldName && oldName !== newName.trim()) {
        addCommentary(`Bowler ${oldName}'s name changed to ${newName.trim()}.`, false);
        toast({ title: "Bowler Name Updated", description: `${oldName} is now ${newName.trim()}.`});
      } else if (!oldName) {
        toast({ title: "Error", description: "Could not find bowler to edit.", variant: "destructive"});
      }
      return { ...prevTeam, bowlers: updatedBowlers };
    });
     setCanUndo(false); 
  }, [setFieldingTeam, addCommentary, toast, currentBowlerId, ballsByCurrentBowlerThisSpell]);

  const handleAddBatter = useCallback((name: string) => {
    if (!name.trim()) {
      toast({ title: "Invalid Batter Name", description: "Batter name cannot be empty.", variant: "destructive" });
      return;
    }
    if (currentBattingTeam.batters.length >= MAX_BATTERS_PER_TEAM) {
      toast({ title: "Lineup Full", description: `Cannot add more than ${MAX_BATTERS_PER_TEAM} batters to ${currentBattingTeam.name}.`, variant: "destructive" });
      return;
    }
     const activeBattersCount = (onStrikeBatterId ? 1 : 0) + (offStrikeBatterId ? 1 : 0);
     if (activeBattersCount >= 2 && currentBattingTeam.batters.length < MAX_BATTERS_PER_TEAM) {
       const onStrikeBatterIsSet = currentBattingTeam.batters.some(b => b.id === onStrikeBatterId && !b.isOut);
       const offStrikeBatterIsSet = currentBattingTeam.batters.some(b => b.id === offStrikeBatterId && !b.isOut);
       if(onStrikeBatterIsSet && offStrikeBatterIsSet){
          toast({ title: "Two Batters Active", description: "Cannot add a new batter while two active batters are already selected and not out. Wait for a wicket or ensure one batter slot is free by deselecting.", variant: "destructive" });
          return;
       }
    }


    setCurrentBattingTeam(prevTeam => {
      const nameExists = prevTeam.batters.some(b => b.name.toLowerCase() === name.trim().toLowerCase());
      if (nameExists) {
        toast({ title: "Duplicate Batter Name", description: "A batter with this name already exists.", variant: "destructive" });
        return prevTeam;
      }
      const newBatter: Batter = {
        id: crypto.randomUUID(),
        name: name.trim(),
        runsScored: 0,
        ballsFaced: 0,
        fours: 0,
        sixes: 0,
        isOut: false,
        order: prevTeam.batters.length + 1,
      };
      const updatedBatters = [...prevTeam.batters, newBatter];
      addCommentary(`${newBatter.name} added to ${prevTeam.name}'s batting lineup.`, false);
      
      if (!onStrikeBatterId && !newBatter.isOut) {
        setOnStrikeBatterId(newBatter.id);
        addCommentary(`${newBatter.name} is on strike.`, false);
      } else if (!offStrikeBatterId && newBatter.id !== onStrikeBatterId && !newBatter.isOut) {
        setOffStrikeBatterId(newBatter.id);
        addCommentary(`${newBatter.name} is at the non-striker's end.`, false);
      }
      return { ...prevTeam, batters: updatedBatters };
    });
    setCanUndo(false);
  }, [setCurrentBattingTeam, toast, addCommentary, onStrikeBatterId, offStrikeBatterId, currentBattingTeam.batters, currentBattingTeam.name]);

  const handleSelectBatter = useCallback((position: 'onStrike' | 'offStrike', batterId: string) => {
    const selectedBatter = currentBattingTeam.batters.find(b => b.id === batterId);
    if (!selectedBatter || selectedBatter.isOut) {
      toast({ title: "Invalid Selection", description: "Batter is out or does not exist.", variant: "destructive" });
      return;
    }

    if (position === 'onStrike') {
      if (batterId === offStrikeBatterId && offStrikeBatterId !== null) { 
            toast({ title: "Invalid Selection", description: "Batter cannot be at both ends.", variant: "destructive" });
            return;
      }
      setOnStrikeBatterId(batterId);
      addCommentary(`${selectedBatter.name} is now on strike.`, false);
    } else { 
      if (batterId === onStrikeBatterId && onStrikeBatterId !== null) { 
            toast({ title: "Invalid Selection", description: "Batter cannot be at both ends.", variant: "destructive" });
            return;
      }
      setOffStrikeBatterId(batterId);
      addCommentary(`${selectedBatter.name} is at the non-striker's end.`, false);
    }
    setCanUndo(false);
  }, [currentBattingTeam.batters, onStrikeBatterId, offStrikeBatterId, toast, addCommentary]);

  const handleSwapStrike = useCallback(() => {
    if (!onStrikeBatterId || !offStrikeBatterId) {
        if (onStrikeBatterId && !offStrikeBatterId) {
            addCommentary(`${onStrikeBatter?.name || 'Striker'} remains on strike. No non-striker to swap with.`, false)
        }
        return;
    }
    const temp = onStrikeBatterId;
    setOnStrikeBatterId(offStrikeBatterId);
    setOffStrikeBatterId(temp);
    const newStriker = currentBattingTeam.batters.find(b => b.id === offStrikeBatterId); 
    addCommentary(`Strike rotated. ${newStriker?.name || 'New batter'} is now on strike.`, false);
    setCanUndo(false); 
  }, [onStrikeBatterId, offStrikeBatterId, addCommentary, currentBattingTeam.batters, onStrikeBatter]);


  const handleAddRuns = useCallback((runsScored: number, isExtraRun: boolean = false) => {
    if (currentBattingTeam.wickets >= MAX_WICKETS || currentBattingTeam.overs >= MAX_OVERS || !currentBowlerId || !onStrikeBatterId) {
      if(!currentBowlerId) toast({title: "Bowler Needed", description: "Please select a bowler.", variant: "destructive"});
      if(!onStrikeBatterId) toast({title: "Striker Needed", description: "Please select the batter on strike.", variant: "destructive"});
      return;
    }
    
    const commentaryId = addCommentary("", true); 
    backupStateForUndo(commentaryId);

    setCurrentBattingTeam(prevTeam => {
      const updatedTeamScore = prevTeam.runs + runsScored;
      let updatedBattersList = [...prevTeam.batters];
      let updatedExtrasCount = prevTeam.extras;

      if (isExtraRun) {
        updatedExtrasCount += runsScored;
      } else {
        const strikerIndex = updatedBattersList.findIndex(b => b.id === onStrikeBatterId);
        if (strikerIndex !== -1) {
          const batter = updatedBattersList[strikerIndex];
          updatedBattersList[strikerIndex] = {
            ...batter,
            runsScored: batter.runsScored + runsScored,
            fours: batter.fours + (runsScored === 4 ? 1 : 0),
            sixes: batter.sixes + (runsScored === 6 ? 1 : 0),
          };
        }
      }
      return { 
        ...prevTeam, 
        runs: updatedTeamScore, 
        batters: updatedBattersList, 
        extras: updatedExtrasCount 
      };
    });
    
    let commentaryText = `${runsScored} run${runsScored !== 1 ? 's' : ''} scored`;
    if (onStrikeBatter && !isExtraRun) commentaryText += ` by ${onStrikeBatter.name}!`;
    else if (isExtraRun) commentaryText += ` (extras).`;
    if (currentBowler) commentaryText += ` Off ${currentBowler.name}.`;
    
    setFieldingTeam(prevTeam => {
      const bowlerIndex = prevTeam.bowlers.findIndex(b => b.id === currentBowlerId);
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

    if (!isExtraRun) {
      setRunsOffBatAgainstCurrentBowlerThisSpell(prev => prev + runsScored);
    }
    
    // This will use the score values *before* the setCurrentBattingTeam update has been applied for this specific render cycle.
    // For accurate score in commentary, it's better to calculate it based on the change.
    const newScoreForCommentary = currentBattingTeam.runs + runsScored;
    const finalCommentary = `${commentaryText} Score: ${newScoreForCommentary}/${currentBattingTeam.wickets}`;
    setCommentaryLog(prevLog => prevLog.map(c => c.id === commentaryId ? {...c, text: finalCommentary} : c));

    if (runsScored % 2 !== 0 && !isExtraRun && currentBattingTeam.balls < 5 && currentBattingTeam.overs < MAX_OVERS && currentBattingTeam.wickets < MAX_WICKETS) { 
      handleSwapStrike();
    }

  }, [currentBattingTeam, setCurrentBattingTeam, addCommentary, currentBowler, currentBowlerId, setFieldingTeam, onStrikeBatterId, onStrikeBatter, handleSwapStrike, setRunsOffBatAgainstCurrentBowlerThisSpell, backupStateForUndo, toast]);


  const handleAddWicket = useCallback(() => {
    if (currentBattingTeam.wickets >= MAX_WICKETS || currentBattingTeam.overs >= MAX_OVERS || !currentBowlerId || !onStrikeBatterId) {
      if(!currentBowlerId) toast({title: "Bowler Needed", description: "Please select a bowler.", variant: "destructive"});
      if(!onStrikeBatterId) toast({title: "Striker Needed", description: "Please select the batter on strike.", variant: "destructive"});
      return;
    }

    const commentaryId = addCommentary("", true); 
    backupStateForUndo(commentaryId);

    let batterOutName = "Batter"; 
    setCurrentBattingTeam(prevTeam => {
      const batterOutIndex = prevTeam.batters.findIndex(b => b.id === onStrikeBatterId);
      let updatedBatters = [...prevTeam.batters];
      
      if (batterOutIndex !== -1) {
        batterOutName = updatedBatters[batterOutIndex].name;
        updatedBatters[batterOutIndex] = {
          ...updatedBatters[batterOutIndex],
          isOut: true,
          howOut: currentBowler ? `b ${currentBowler.name}` : "out", 
        };
      }
      // Wicket itself doesn't add to runs or extras, just increments wicket count.
      return { ...prevTeam, wickets: prevTeam.wickets + 1, batters: updatedBatters };
    });
    
    let wicketCommentary = `WICKET! ${batterOutName} is out! That's wicket number ${currentBattingTeam.wickets + 1}.`;
    
    if (currentBowler) {
      wicketCommentary += ` Bowler: ${currentBowler.name}.`;
      setFieldingTeam(prevTeam => {
        const bowlerIndex = prevTeam.bowlers.findIndex(b => b.id === currentBowlerId);
        if (bowlerIndex !== -1) {
          const updatedBowlers = [...prevTeam.bowlers];
          updatedBowlers[bowlerIndex] = { ...updatedBowlers[bowlerIndex], wickets: updatedBowlers[bowlerIndex].wickets + 1 };
          return { ...prevTeam, bowlers: updatedBowlers };
        }
        return prevTeam;
      });
    }
    
    const finalCommentary = `${wicketCommentary} Score: ${currentBattingTeam.runs}/${currentBattingTeam.wickets + 1}`;
    setCommentaryLog(prevLog => prevLog.map(c => c.id === commentaryId ? {...c, text: finalCommentary} : c));
    
    setOnStrikeBatterId(null); 

    if (currentBattingTeam.wickets + 1 >= MAX_WICKETS) {
      addCommentary(`Innings ended for ${currentBattingTeam.name}. All out.`, false);
      toast({ title: "Innings Over!", description: `${currentBattingTeam.name} are all out.`});
      setCanUndo(false);
    } else {
        toast({ title: "Wicket!", description: `Select the next batter for ${currentBattingTeam.name}.`});
    }
  }, [currentBattingTeam, setCurrentBattingTeam, addCommentary, toast, currentBowler, currentBowlerId, setFieldingTeam, onStrikeBatterId, backupStateForUndo]);

  const handleNextBall = useCallback((isLegalDelivery: boolean) => {
    if (currentBattingTeam.wickets >= MAX_WICKETS || currentBattingTeam.overs >= MAX_OVERS) {
        setCanUndo(false); 
        return;
    }
     if (!currentBowlerId || (!onStrikeBatterId && currentBattingTeam.wickets < MAX_WICKETS)) { 
      if(!currentBowlerId) toast({title: "Bowler Needed", description: "Please select a bowler.", variant: "destructive"});
      if(!onStrikeBatterId && currentBattingTeam.wickets < MAX_WICKETS) toast({title: "Striker Needed", description: "Please select the batter on strike.", variant: "destructive"});
      return;
    }
    
    const isScoringActionWithoutUndoYet = !lastActionState || 
      (lastActionState.teamState.runs === currentBattingTeam.runs && 
       lastActionState.teamState.wickets === currentBattingTeam.wickets &&
       lastActionState.onStrikeBatterId === onStrikeBatterId &&
       lastActionState.teamState.batters.find(b => b.id === onStrikeBatterId)?.ballsFaced === currentBattingTeam.batters.find(b=> b.id === onStrikeBatterId)?.ballsFaced);


    if (isLegalDelivery && isScoringActionWithoutUndoYet) { 
        const commentaryId = addCommentary("", true); 
        backupStateForUndo(commentaryId); 
        const dotBallCommentaryText = `Dot ball. ${onStrikeBatter?.name || 'Batter'} facing ${currentBowler?.name || 'Unknown'}. Score: ${currentBattingTeam.runs}/${currentBattingTeam.wickets}`;
        setCommentaryLog(prevLog => prevLog.map(c => c.id === commentaryId ? {...c, text: dotBallCommentaryText} : c));
    } else if (!isLegalDelivery) { 
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
        const updatedBatters = prevTeam.batters.map(b => 
          b.id === onStrikeBatterId ? { ...b, ballsFaced: b.ballsFaced + 1 } : b
        );
        return { ...prevTeam, batters: updatedBatters };
      });

      let overCompletedThisBall = false;
      setCurrentBattingTeam(prevTeam => {
        const newBalls = prevTeam.balls + 1;
        if (newBalls >= 6) {
          overCompletedThisBall = true;
          const newOvers = prevTeam.overs + 1;
          if (newOvers >= MAX_OVERS) {
            addCommentary(`Innings ended for ${prevTeam.name} after ${MAX_OVERS} overs. Final Score: ${prevTeam.runs}/${prevTeam.wickets}`, false);
            toast({ title: "Innings Over!", description: `${prevTeam.name} completed ${MAX_OVERS} overs.`});
            setCanUndo(false); 
          }
          if (onStrikeBatterId && offStrikeBatterId && newOvers < MAX_OVERS && prevTeam.wickets < MAX_WICKETS) { 
             handleSwapStrike();
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
          
          if (newBallsThisSpellForBowler % 6 === 0) { 
            let overSummary = `Over ${Math.floor(bowlerToUpdate.totalBallsBowled / 6)} completed by ${bowlerWhoIsBowling.name}.`;
            if (runsOffBatAgainstCurrentBowlerThisSpell === 0 && newBallsThisSpellForBowler === 6) { 
              bowlerToUpdate.maidens += 1;
              overSummary += ` It's a MAIDEN!`;
            }
            const bowlerOvers = Math.floor(bowlerToUpdate.totalBallsBowled / 6);
            const runsThisOver = runsOffBatAgainstCurrentBowlerThisSpell; 
            overSummary += ` Figures for this over: ${runsThisOver} run(s). Total: ${bowlerOvers}.${bowlerToUpdate.totalBallsBowled % 6} O, ${bowlerToUpdate.maidens} M, ${bowlerToUpdate.runsConceded} R, ${bowlerToUpdate.wickets} W.`;
            addCommentary(overSummary, false);
          }
          updatedBowlers[bowlerIndex] = bowlerToUpdate;
          return { ...prevFieldingTeam, bowlers: updatedBowlers };
        });

        setBallsByCurrentBowlerThisSpell(newBallsThisSpellForBowler);

        if (newBallsThisSpellForBowler % 6 === 0) { 
          toast({ 
            title: "Over Complete!", 
            description: `${bowlerWhoIsBowling.name} has finished their over. Score: ${currentBattingTeam.runs}/${currentBattingTeam.wickets}. Select next bowler.` 
          });
          addCommentary(`End of the over by ${bowlerWhoIsBowling.name}. Score: ${currentBattingTeam.runs}/${currentBattingTeam.wickets}. A new bowler is needed.`, false);
          
          setCurrentBowlerId(null); 
          setBallsByCurrentBowlerThisSpell(0); 
          setRunsOffBatAgainstCurrentBowlerThisSpell(0);
          setCanUndo(false); 
        }
      } else { 
         if (overCompletedThisBall) { 
            addCommentary(`Team Over ${currentBattingTeam.overs} completed. Score: ${currentBattingTeam.runs}/${currentBattingTeam.wickets}. No bowler selected for next over.`, false);
         }
      }
    }
  }, [
    currentBattingTeam, setCurrentBattingTeam, 
    addCommentary, toast, 
    currentBowler, currentBowlerId, setCurrentBowlerId, 
    setFieldingTeam, 
    ballsByCurrentBowlerThisSpell, setBallsByCurrentBowlerThisSpell,
    runsOffBatAgainstCurrentBowlerThisSpell, setRunsOffBatAgainstCurrentBowlerThisSpell,
    lastActionState, backupStateForUndo,
    onStrikeBatterId, offStrikeBatterId, onStrikeBatter, handleSwapStrike
  ]);

  const handleUndoLastAction = () => {
    if (!canUndo || !lastActionState) {
      toast({ title: "Cannot Undo", description: "No action to undo or action is not undoable.", variant: "destructive" });
      return;
    }

    setCurrentBattingTeam(lastActionState.teamState); 
    setFieldingTeam(prev => ({...prev, bowlers: lastActionState.fieldingTeamBowlers}));
    setCurrentBowlerId(lastActionState.currentBowlerId);
    setOnStrikeBatterId(lastActionState.onStrikeBatterId);
    setOffStrikeBatterId(lastActionState.offStrikeBatterId);
    setBallsByCurrentBowlerThisSpell(lastActionState.ballsByCurrentBowlerThisSpell);
    setRunsOffBatAgainstCurrentBowlerThisSpell(lastActionState.runsOffBatAgainstCurrentBowlerThisSpell);
    
    if (lastActionState.lastCommentaryId) {
      setCommentaryLog(prev => prev.filter(c => c.id !== lastActionState.lastCommentaryId));
    }
    const undoneScoreText = `Score: ${lastActionState.teamState.runs}/${lastActionState.teamState.wickets}`;
    const undoneBatterText = lastActionState.onStrikeBatterId ? `Striker: ${lastActionState.teamState.batters.find(b => b.id === lastActionState.onStrikeBatterId)?.name}` : "No striker";
    addCommentary(`(Action Undone) Last recorded action has been reversed. ${undoneScoreText}. ${undoneBatterText}`, false);

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
    setTeam2({...initialTeamStateFactory('Team Bravo'), runs: -1 }); // runs: -1 indicates DNB
    setBattingTeamKey('team1');
    setCommentaryLog([]);
    setCurrentBowlerId(null);
    setOnStrikeBatterId(null);
    setOffStrikeBatterId(null);
    setBallsByCurrentBowlerThisSpell(0);
    setRunsOffBatAgainstCurrentBowlerThisSpell(0);
    setLastActionState(null);
    setCanUndo(false);
    setHasMatchBeenSaved(false);
    toast({ title: "Match Reset", description: "The match has been reset to its initial state."});
  };
  
  const switchInnings = () => {
    if (currentBowler && ballsByCurrentBowlerThisSpell > 0 && ballsByCurrentBowlerThisSpell < 6) {
        addCommentary(`${currentBowler.name} finishes their incomplete over due to innings change. Figures may be partial for this spell.`, false);
    }

    const previousBattingTeamName = currentBattingTeam.name;
    const nextBattingTeamKey = battingTeamKey === 'team1' ? 'team2' : 'team1';
    const nextBattingTeamObject = nextBattingTeamKey === 'team1' ? team1 : team2;


    if (battingTeamKey === 'team1') { 
      if (team2.runs === -1) { 
        setTeam2(prevTeam2 => ({ 
            ...prevTeam2, 
            runs: 0, 
            wickets: 0, 
            overs: 0, 
            balls: 0, 
            extras: 0, // Reset extras for new innings
            batters: prevTeam2.batters.map(b => ({...b, runsScored:0, ballsFaced:0, fours:0, sixes:0, isOut: false, howOut: undefined})),
             // Bowler stats are typically reset or considered fresh for their own team's bowling innings
            bowlers: prevTeam2.bowlers.map(b => ({...b, totalBallsBowled:0, maidens:0, runsConceded:0, wickets:0 })) 
        }));
        setHasMatchBeenSaved(false); 
      }
      setBattingTeamKey('team2'); 
      addCommentary(`--- Innings Break: ${previousBattingTeamName} scored ${currentBattingTeam.runs}/${currentBattingTeam.wickets} (Extras: ${currentBattingTeam.extras}). ${nextBattingTeamObject.name} to bat. Target: ${currentBattingTeam.runs + 1} ---`, false);
      toast({ title: "Innings Changed", description: `${nextBattingTeamObject.name} are now batting. ${team1.name} will field.`});
    } else { 
      const gameFinished = team2.runs !== -1 && (team2.wickets >= MAX_WICKETS || team2.overs >= MAX_OVERS || (isTeam1AllOutOrOversDone && team2.runs > team1.runs));
      if(gameFinished) {
        addCommentary(`--- Match Concluded ---`, false);
        toast({ title: "Match Concluded", description: "Review scores for the result."});
      } else {
        addCommentary(`--- Innings Break: ${previousBattingTeamName} scored ${currentBattingTeam.runs}/${currentBattingTeam.wickets} (Extras: ${currentBattingTeam.extras}). ---`, false);
        toast({ title: "Innings Changed", description: `Something unexpected happened or match concluded.`});
      }
    }
    setCurrentBowlerId(null);
    setOnStrikeBatterId(null);
    setOffStrikeBatterId(null);
    setBallsByCurrentBowlerThisSpell(0);
    setRunsOffBatAgainstCurrentBowlerThisSpell(0);
    setCanUndo(false); 
  };
  
  const inningsEnded = currentBattingTeam.wickets >= MAX_WICKETS || currentBattingTeam.overs >= MAX_OVERS;
  const matchCanStartSecondInnings = inningsEnded && battingTeamKey === 'team1' && team2.runs === -1; 
  
  const isTeam1AllOutOrOversDone = team1.wickets >= MAX_WICKETS || team1.overs >= MAX_OVERS;
  const isTeam2AllOutOrOversDone = team2.runs !== -1 && (team2.wickets >= MAX_WICKETS || team2.overs >= MAX_OVERS);
  
  let matchEnded = false;
  let matchResultText = "";

  if (battingTeamKey === 'team1') { 
      if (isTeam1AllOutOrOversDone && team2.runs > -1) { 
          // This condition is unusual, typically means team1 innings ended and team2 has batted.
          // The check for match end should be after team2's innings.
      }
  } else { // battingTeamKey === 'team2'
    if (isTeam2AllOutOrOversDone) { 
        matchEnded = true;
        if (team2.runs > team1.runs) {
            matchResultText = `${team2.name} won by ${MAX_WICKETS - team2.wickets} wickets (if chasing) or ${team2.runs - team1.runs} runs.`;
             if (team2.runs > team1.runs && team1.runs > -1) { // Chasing successfully
                matchResultText = `${team2.name} won by ${MAX_WICKETS - team2.wickets} wickets.`;
            } else { // team2 batted first or failed to chase
                 matchResultText = `${team1.name} won by ${team1.runs - team2.runs} runs.`;
            }
        } else if (team1.runs > team2.runs) {
            matchResultText = `${team1.name} won by ${team1.runs - team2.runs} runs.`;
        } else { 
            matchResultText = "Match Tied!";
        }
    } else if (team2.runs > team1.runs && isTeam1AllOutOrOversDone) { 
        matchEnded = true;
        matchResultText = `${team2.name} won by ${MAX_WICKETS - team2.wickets} wickets.`;
    }
  }

   // More robust match ended logic
    if (battingTeamKey === 'team2' && team1.runs > -1) { // If team2 is batting (or has finished) and team1 has set a score
        if (team2.runs > team1.runs && team2.wickets < MAX_WICKETS && team2.overs < MAX_OVERS) { // Team 2 won by chasing
            matchEnded = true;
            matchResultText = `${team2.name} won by ${MAX_WICKETS - team2.wickets} wickets.`;
        } else if (isTeam2AllOutOrOversDone) { // Team 2 innings complete
            matchEnded = true;
            if (team2.runs > team1.runs) {
                matchResultText = `${team2.name} won by ${team2.runs - team1.runs} runs.`; // This case is less common if they won by wickets
            } else if (team1.runs > team2.runs) {
                matchResultText = `${team1.name} won by ${team1.runs - team2.runs} runs.`;
            } else {
                matchResultText = "Match Tied!";
            }
        }
    } else if (battingTeamKey === 'team1' && isTeam1AllOutOrOversDone && team2.runs === -1) {
        // Team 1 innings complete, Team 2 DNB. Match not ended yet, but ready for 2nd innings.
    }


  const isScoringDisabled = !currentBowlerId || !onStrikeBatterId || inningsEnded || matchEnded;

  const saveCurrentMatchToHistory = useCallback((currentMatchResult: string) => {
    const newRecord: MatchRecord = {
      id: crypto.randomUUID(),
      team1Name: team1.name,
      team1Score: `${team1.runs}/${team1.wickets}`,
      team1Overs: `${team1.overs}.${team1.balls}`,
      team1Extras: team1.extras,
      team2Name: team2.name,
      team2Score: team2.runs === -1 ? 'DNB' : `${team2.runs}/${team2.wickets}`,
      team2Overs: team2.runs === -1 ? '0.0' : `${team2.overs}.${team2.balls}`,
      team2Extras: team2.runs === -1 ? 0 : team2.extras,
      result: currentMatchResult,
      date: new Date().toISOString(),
    };

    setMatchHistory(prevHistory => {
        const updatedHistory = [...prevHistory, newRecord];
        if (typeof window !== 'undefined') {
            localStorage.setItem('cricketMatchHistory', JSON.stringify(updatedHistory));
        }
        return updatedHistory;
    });
    toast({ title: "Match Saved", description: "The match has been saved to history." });
  }, [team1, team2, toast, setMatchHistory]);

  useEffect(() => {
    if (matchEnded && matchResultText && !hasMatchBeenSaved) {
      saveCurrentMatchToHistory(matchResultText);
      setHasMatchBeenSaved(true);
    }
  }, [matchEnded, matchResultText, hasMatchBeenSaved, saveCurrentMatchToHistory]);

  const clearMatchHistory = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('cricketMatchHistory');
    }
    setMatchHistory([]);
    toast({ title: "History Cleared", description: "Match history has been cleared." });
    setIsHistoryDialogOpen(false); 
  };


  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow container mx-auto p-4 md:p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-semibold text-primary">Current Match</h2>
          <div className="space-x-2 flex items-center">
            { matchCanStartSecondInnings && !matchEnded && (
                <Button onClick={switchInnings} variant="outline" className="border-accent text-accent-foreground hover:bg-accent hover:text-accent-foreground">Start {team2.name}'s Innings</Button>
            )}
             { matchEnded && (
                 <p className="text-lg font-semibold text-primary">{matchResultText || "Match Ended!"}</p>
             )}
            <Button onClick={() => setIsHistoryDialogOpen(true)} variant="outline">
              <History className="mr-2 h-4 w-4" /> View Match History
            </Button>
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
                extras={team1.extras}
                isBatting={battingTeamKey === 'team1'}
                onStrikeBatterName={battingTeamKey === 'team1' ? onStrikeBatter?.name : undefined}
                onStrikeBatterRuns={battingTeamKey === 'team1' ? onStrikeBatter?.runsScored : undefined}
                onStrikeBatterBalls={battingTeamKey === 'team1' ? onStrikeBatter?.ballsFaced : undefined}
                offStrikeBatterName={battingTeamKey === 'team1' ? offStrikeBatter?.name : undefined}
                offStrikeBatterRuns={battingTeamKey === 'team1' ? offStrikeBatter?.runsScored : undefined}
                offStrikeBatterBalls={battingTeamKey === 'team1' ? offStrikeBatter?.ballsFaced : undefined}
              />
              {(team2.runs !== -1 || matchEnded || battingTeamKey === 'team2') && (
                <ScoreDisplay 
                  teamName={team2.name}
                  runs={team2.runs === -1 ? 0 : team2.runs}
                  wickets={team2.wickets}
                  overs={team2.overs}
                  balls={team2.balls}
                  extras={team2.runs === -1 ? 0 : team2.extras}
                  isBatting={battingTeamKey === 'team2'}
                  onStrikeBatterName={battingTeamKey === 'team2' ? onStrikeBatter?.name : undefined}
                  onStrikeBatterRuns={battingTeamKey === 'team2' ? onStrikeBatter?.runsScored : undefined}
                  onStrikeBatterBalls={battingTeamKey === 'team2' ? onStrikeBatter?.ballsFaced : undefined}
                  offStrikeBatterName={battingTeamKey === 'team2' ? offStrikeBatter?.name : undefined}
                  offStrikeBatterRuns={battingTeamKey === 'team2' ? offStrikeBatter?.runsScored : undefined}
                  offStrikeBatterBalls={battingTeamKey === 'team2' ? offStrikeBatter?.ballsFaced : undefined}
                />
              )}
            </div>
            
            <StatisticsTracker 
              runs={currentBattingTeam.runs} 
              overs={currentBattingTeam.overs} 
              balls={currentBattingTeam.balls} 
              wickets={currentBattingTeam.wickets}
              extras={currentBattingTeam.extras}
              target={battingTeamKey === 'team2' && team1.runs > -1 ? team1.runs + 1 : undefined}
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
                  isBowlerEditable={!!currentBowlerId && ballsByCurrentBowlerThisSpell === 0 && !inningsEnded && !matchEnded}
                  isOverInProgress={ballsByCurrentBowlerThisSpell > 0 && ballsByCurrentBowlerThisSpell < 6}
                  maxBowlersToList={MAX_BOWLERS_PER_TEAM_LIST}
                />
                <BatterControls
                  battingTeamName={currentBattingTeam.name}
                  batters={currentBattingTeam.batters}
                  onStrikeBatterId={onStrikeBatterId}
                  offStrikeBatterId={offStrikeBatterId}
                  onAddBatter={handleAddBatter}
                  onSelectBatter={handleSelectBatter}
                  onSwapStrike={handleSwapStrike}
                  disabled={inningsEnded || matchEnded || currentBattingTeam.wickets >= MAX_WICKETS}
                  maxBatters={MAX_BATTERS_PER_TEAM}
                />
                <ScoreControls
                  onAddRuns={handleAddRuns}
                  onAddWicket={handleAddWicket}
                  onNextBall={handleNextBall}
                  teamName={currentBattingTeam.name}
                  isBowlerSelected={!!currentBowlerId}
                  isStrikerSelected={!!onStrikeBatterId}
                  disabled={isScoringDisabled}
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
                {!matchEnded && <p>Score: {currentBattingTeam.runs}/{currentBattingTeam.wickets} (Extras: {currentBattingTeam.extras}) in {currentBattingTeam.overs}.{currentBattingTeam.balls} overs.</p>}
                 {matchEnded && matchResultText && <p>{matchResultText}</p>}
              </div>
            )}
          </div>

          <div className="lg:col-span-1 space-y-6 flex flex-col">
             <BattingStatsDisplay 
                batters={currentBattingTeam.batters}
                teamName={currentBattingTeam.name}
                onStrikeBatterId={onStrikeBatterId}
                offStrikeBatterId={offStrikeBatterId}
             />
             <BowlingStatsDisplay bowlers={fieldingTeam.bowlers} teamName={fieldingTeam.name} currentBowlerId={currentBowlerId} />
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

      <Dialog open={isHistoryDialogOpen} onOpenChange={setIsHistoryDialogOpen}>
        <DialogContent className="sm:max-w-4xl w-[90vw] max-w-full md:w-[80vw] lg:w-[70vw] xl:w-[60vw] h-[85vh] flex flex-col p-0">
          <DialogHeader className="p-6 pb-4 border-b">
            <DialogTitle>Match History</DialogTitle>
            <DialogDescription>Review scores from your past matches.</DialogDescription>
          </DialogHeader>
          <div className="flex-grow overflow-hidden p-6">
            <MatchHistoryDisplay history={matchHistory} onClearHistory={clearMatchHistory} />
          </div>
          <DialogFooter className="p-4 border-t">
            <Button variant="outline" onClick={() => setIsHistoryDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
