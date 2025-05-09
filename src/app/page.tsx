'use client';

import { useState, useCallback, useMemo } from 'react';
import { Header } from '@/components/layout/header';
import { ScoreDisplay } from '@/components/features/score-display';
import { StatisticsTracker } from '@/components/features/statistics-tracker';
import { ScoreControls } from '@/components/features/score-controls';
import { LiveCommentaryFeed } from '@/components/features/live-commentary-feed';
import { HighlightSummarizer } from '@/components/features/highlight-summarizer';
import { BowlerControls } from '@/components/features/bowler-controls';
import { BowlingStatsDisplay } from '@/components/features/bowling-stats-display';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface CommentaryItem {
  id: string; // Changed from number to string
  text: string;
  timestamp: string;
}

interface Bowler {
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
  overs: number; // Team overs
  balls: number;  // Team balls in current over
  bowlers: Bowler[];
}

const MAX_OVERS = 20; // Default T20

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
  const [team2, setTeam2] = useState<TeamState>({...initialTeamStateFactory('Team Bravo'), runs: -1 }); // -1 runs indicates not yet batted
  const [battingTeamKey, setBattingTeamKey] = useState<'team1' | 'team2'>('team1');
  
  const [commentaryLog, setCommentaryLog] = useState<CommentaryItem[]>([]);
  // Removed commentaryIdCounter state

  const [currentBowlerName, setCurrentBowlerName] = useState<string | null>(null);
  // Stats for the current bowler's active 6-ball spell for maiden calculation
  const [ballsByCurrentBowlerThisSpell, setBallsByCurrentBowlerThisSpell] = useState(0);
  const [runsOffBatAgainstCurrentBowlerThisSpell, setRunsOffBatAgainstCurrentBowlerThisSpell] = useState(0);


  const currentBattingTeam = battingTeamKey === 'team1' ? team1 : team2;
  const setCurrentBattingTeam = battingTeamKey === 'team1' ? setTeam1 : setTeam2;
  
  const fieldingTeamKey = battingTeamKey === 'team1' ? 'team2' : 'team1';
  const fieldingTeam = fieldingTeamKey === 'team1' ? team1 : team2;
  const setFieldingTeam = fieldingTeamKey === 'team1' ? setTeam1 : setTeam2;

  const addCommentary = useCallback((text: string) => {
    const newId = crypto.randomUUID(); // Generate unique string ID
    setCommentaryLog(prevLog => [
      ...prevLog,
      { id: newId, text, timestamp: new Date().toISOString() },
    ]);
    // No need to manage commentaryIdCounter anymore
  }, []); // Removed commentaryIdCounter from dependencies, setCommentaryLog is stable

  const handleSetCurrentBowler = useCallback((name: string) => {
    if (!name.trim()) {
      toast({ title: "Invalid Bowler Name", description: "Bowler name cannot be empty.", variant: "destructive"});
      return;
    }
    setCurrentBowlerName(name);
    setBallsByCurrentBowlerThisSpell(0);
    setRunsOffBatAgainstCurrentBowlerThisSpell(0);

    setFieldingTeam(prevTeam => {
      const bowlerExists = prevTeam.bowlers.some(b => b.name === name);
      if (!bowlerExists) {
        const newBowler: Bowler = { name, totalBallsBowled: 0, maidens: 0, runsConceded: 0, wickets: 0 };
        addCommentary(`${name} is the new bowler for ${prevTeam.name}.`);
        return { ...prevTeam, bowlers: [...prevTeam.bowlers, newBowler] };
      }
      addCommentary(`${name} continues bowling for ${prevTeam.name}.`);
      return prevTeam; // Bowler already exists, no change to bowlers list needed
    });
  }, [setFieldingTeam, addCommentary, toast, setCurrentBowlerName, setBallsByCurrentBowlerThisSpell, setRunsOffBatAgainstCurrentBowlerThisSpell]);

  const handleAddRuns = useCallback((runsScored: number, isExtraRun: boolean = false) => {
    if (currentBattingTeam.wickets >= 10 || currentBattingTeam.overs >= MAX_OVERS) return;

    setCurrentBattingTeam(prev => ({ ...prev, runs: prev.runs + runsScored }));
    
    let commentaryText = `${runsScored} run${runsScored !== 1 ? 's' : ''} scored!`;
    if (currentBowlerName) {
      commentaryText += ` Off ${currentBowlerName}.`;
      setFieldingTeam(prevTeam => {
        const bowlerIndex = prevTeam.bowlers.findIndex(b => b.name === currentBowlerName);
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
    addCommentary(`${commentaryText} Current score: ${currentBattingTeam.runs + runsScored}/${currentBattingTeam.wickets}`);
  }, [currentBattingTeam, setCurrentBattingTeam, addCommentary, currentBowlerName, setFieldingTeam, setRunsOffBatAgainstCurrentBowlerThisSpell]);

  const handleAddWicket = useCallback(() => {
    if (currentBattingTeam.wickets >= 10 || currentBattingTeam.overs >= MAX_OVERS) return;

    setCurrentBattingTeam(prev => ({ ...prev, wickets: prev.wickets + 1 }));
    let wicketCommentary = `WICKET! That's wicket number ${currentBattingTeam.wickets + 1}.`;
    
    if (currentBowlerName) {
      wicketCommentary += ` Bowler: ${currentBowlerName}.`;
      setFieldingTeam(prevTeam => {
        const bowlerIndex = prevTeam.bowlers.findIndex(b => b.name === currentBowlerName);
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
    addCommentary(`${wicketCommentary} Score: ${currentBattingTeam.runs}/${currentBattingTeam.wickets + 1}`);
    
    if (currentBattingTeam.wickets + 1 >= 10) {
      addCommentary(`Innings ended for ${currentBattingTeam.name}.`);
      toast({ title: "Innings Over!", description: `${currentBattingTeam.name} are all out.`});
    }
  }, [currentBattingTeam, setCurrentBattingTeam, addCommentary, toast, currentBowlerName, setFieldingTeam]);

  const handleNextBall = useCallback((isLegalDelivery: boolean) => {
    if (currentBattingTeam.wickets >= 10 || currentBattingTeam.overs >= MAX_OVERS) return;
    if (!currentBowlerName && isLegalDelivery) {
      toast({ title: "No Bowler Selected", description: "Please select a bowler before proceeding.", variant: "destructive"});
      return;
    }

    if (isLegalDelivery) {
      setCurrentBattingTeam(prevTeam => {
        const newBalls = prevTeam.balls + 1;
        if (newBalls >= 6) { // Team Over completed
          const newOvers = prevTeam.overs + 1;
          addCommentary(`Team Over ${newOvers} completed. Score: ${prevTeam.runs}/${prevTeam.wickets}`);
          
          if (newOvers >= MAX_OVERS) {
            addCommentary(`Innings ended for ${prevTeam.name} after ${MAX_OVERS} overs.`);
            toast({ title: "Innings Over!", description: `${prevTeam.name} completed ${MAX_OVERS} overs.`});
          }
          return { ...prevTeam, overs: newOvers, balls: 0 };
        }
        return { ...prevTeam, balls: newBalls };
      });

      if (currentBowlerName) {
        const bowlerWhoIsBowling = currentBowlerName; // Capture for use after potential nulling
        const newBallsThisSpellForBowler = ballsByCurrentBowlerThisSpell + 1;

        setFieldingTeam(prevFieldingTeam => {
          const bowlerIndex = prevFieldingTeam.bowlers.findIndex(b => b.name === bowlerWhoIsBowling);
          if (bowlerIndex === -1) return prevFieldingTeam; 

          const updatedBowlers = [...prevFieldingTeam.bowlers];
          const bowler = { ...updatedBowlers[bowlerIndex] };
          bowler.totalBallsBowled += 1;
          
          if (newBallsThisSpellForBowler === 6) {
            let overSummary = `Over completed by ${bowlerWhoIsBowling}.`;
            if (runsOffBatAgainstCurrentBowlerThisSpell === 0) { 
              bowler.maidens += 1;
              overSummary += ` It's a MAIDEN!`;
            }
            const bowlerOvers = Math.floor(bowler.totalBallsBowled / 6);
            const bowlerBalls = bowler.totalBallsBowled % 6;
            overSummary += ` Figures: ${bowlerOvers}.${bowlerBalls} O, ${bowler.maidens} M, ${bowler.runsConceded} R, ${bowler.wickets} W.`;
            addCommentary(overSummary);
          }
          updatedBowlers[bowlerIndex] = bowler;
          return { ...prevFieldingTeam, bowlers: updatedBowlers };
        });

        setBallsByCurrentBowlerThisSpell(newBallsThisSpellForBowler);

        if (newBallsThisSpellForBowler === 6) {
          toast({ 
            title: "Over Complete!", 
            description: `${bowlerWhoIsBowling} has finished their over. Please select the next bowler.` 
          });
          addCommentary(`End of the over by ${bowlerWhoIsBowling}. A new bowler is needed.`);
          
          setCurrentBowlerName(null); 
          setBallsByCurrentBowlerThisSpell(0); 
          setRunsOffBatAgainstCurrentBowlerThisSpell(0);
        }
      }
    } else {
      addCommentary(`Extra delivery. Ball does not count towards the over.`);
    }
  }, [
    currentBattingTeam, setCurrentBattingTeam, 
    addCommentary, toast, 
    currentBowlerName, setCurrentBowlerName, 
    setFieldingTeam, 
    ballsByCurrentBowlerThisSpell, setBallsByCurrentBowlerThisSpell,
    runsOffBatAgainstCurrentBowlerThisSpell, setRunsOffBatAgainstCurrentBowlerThisSpell
  ]);

  const handleAddManualCommentary = useCallback((text: string) => {
    addCommentary(`(Manual) ${text}`);
  }, [addCommentary]);

  const fullCommentaryText = useMemo(() => {
    return commentaryLog.map(c => `${new Date(c.timestamp).toLocaleTimeString()}: ${c.text}`).join('\n');
  }, [commentaryLog]);

  const resetMatch = () => {
    setTeam1({...initialTeamStateFactory('Team Alpha')});
    setTeam2({...initialTeamStateFactory('Team Bravo'), runs: -1 });
    setBattingTeamKey('team1');
    setCommentaryLog([]);
    // Removed setCommentaryIdCounter(0)
    setCurrentBowlerName(null);
    setBallsByCurrentBowlerThisSpell(0);
    setRunsOffBatAgainstCurrentBowlerThisSpell(0);
    toast({ title: "Match Reset", description: "The match has been reset to its initial state."});
  };
  
  const switchInnings = () => {
    if (currentBowlerName && ballsByCurrentBowlerThisSpell > 0 && ballsByCurrentBowlerThisSpell < 6) {
        addCommentary(`${currentBowlerName} finishes their incomplete over due to innings change. Figures may be partial for this spell.`);
         setFieldingTeam(prevFieldingTeam => {
            const bowlerIndex = prevFieldingTeam.bowlers.findIndex(b => b.name === currentBowlerName);
            if (bowlerIndex !== -1) {
                // Logic for incomplete overs can be complex if detailed stats are needed
            }
            return prevFieldingTeam;
        });
    }

    if (battingTeamKey === 'team1') {
      if (team2.runs === -1) { 
        setTeam2(prev => ({ ...prev, runs: 0, wickets: 0, overs: 0, balls: 0, bowlers: [] }));
      }
      setBattingTeamKey('team2');
      addCommentary(`--- ${team2.name} starts their innings ---`);
      toast({ title: "Innings Changed", description: `${team2.name} are now batting.`});
    } else {
      const gameFinished = team2.runs !== -1 && (team2.wickets >=10 || team2.overs >= MAX_OVERS || team1.runs < team2.runs);
      if(gameFinished) {
        addCommentary(`--- Match Concluded ---`);
        toast({ title: "Match Concluded", description: "Review scores for the result."});
      } else {
        addCommentary(`--- Innings switch requested for ${team1.name}. Ensure match context is correct. ---`);
        toast({ title: "Match Status", description: "Consider match end or further innings."});
        setBattingTeamKey('team1'); 
      }
    }
    setCurrentBowlerName(null);
    setBallsByCurrentBowlerThisSpell(0);
    setRunsOffBatAgainstCurrentBowlerThisSpell(0);
  };
  
  const inningsEnded = currentBattingTeam.wickets >= 10 || currentBattingTeam.overs >= MAX_OVERS;
  const matchCanStartSecondInnings = inningsEnded && battingTeamKey === 'team1' && team2.runs === -1;
  
  const isTeam1AllOutOrOversDone = team1.wickets >= 10 || team1.overs >= MAX_OVERS;
  const isTeam2AllOutOrOversDone = team2.runs !== -1 && (team2.wickets >= 10 || team2.overs >= MAX_OVERS);
  
  let matchEnded = false;
  if (battingTeamKey === 'team1' && isTeam1AllOutOrOversDone && team2.runs !== -1 && team1.runs < team2.runs) { // Team 2 already batted and won
      matchEnded = true;
  } else if (battingTeamKey === 'team2' && isTeam2AllOutOrOversDone) { // Team 2 (second batting team) innings ended
      matchEnded = true;
  } else if (battingTeamKey === 'team2' && team2.runs > team1.runs && isTeam1AllOutOrOversDone) { // Team 2 chasing and won
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
          {/* Left Column: Score, Stats, Controls */}
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
              {team2.runs !== -1 && ( // Only display team 2 if they have started batting or match reset
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
                  currentBowlerName={currentBowlerName}
                  onSetCurrentBowler={handleSetCurrentBowler}
                  disabled={inningsEnded || matchEnded}
                  fieldingTeamName={fieldingTeam.name}
                />
                <ScoreControls
                  onAddRuns={handleAddRuns}
                  onAddWicket={handleAddWicket}
                  onNextBall={handleNextBall}
                  teamName={currentBattingTeam.name}
                  isBowlerSelected={!!currentBowlerName}
                />
              </>
            ) : (
              <div className="p-4 text-center bg-muted rounded-md shadow">
                <p className="font-semibold text-lg">
                    {matchEnded ? "Match Concluded" : `Innings Over for ${currentBattingTeam.name}!`}
                </p>
                {!matchEnded && <p>Score: {currentBattingTeam.runs}/{currentBattingTeam.wickets} in {currentBattingTeam.overs}.{currentBattingTeam.balls} overs.</p>}
                 {matchEnded && battingTeamKey === 'team1' && team1.runs > team2.runs && <p>{team1.name} wins!</p>}
                 {matchEnded && battingTeamKey === 'team1' && team1.runs < team2.runs && <p>{team2.name} wins!</p>}
                 {matchEnded && battingTeamKey === 'team2' && team2.runs > team1.runs && <p>{team2.name} wins!</p>}
                 {matchEnded && battingTeamKey === 'team2' && team2.runs < team1.runs && <p>{team1.name} wins!</p>}
                 {matchEnded && team1.runs === team2.runs && (isTeam1AllOutOrOversDone || isTeam2AllOutOrOversDone) && <p>Match Tied!</p>}
              </div>
            )}
          </div>

          {/* Right Column: Commentary, Summarizer, Bowling Stats */}
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
