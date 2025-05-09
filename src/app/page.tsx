'use client';

import { useState, useCallback, useMemo } from 'react';
import { Header } from '@/components/layout/header';
import { ScoreDisplay } from '@/components/features/score-display';
import { StatisticsTracker } from '@/components/features/statistics-tracker';
import { ScoreControls } from '@/components/features/score-controls';
import { LiveCommentaryFeed } from '@/components/features/live-commentary-feed';
import { HighlightSummarizer } from '@/components/features/highlight-summarizer';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface CommentaryItem {
  id: number;
  text: string;
  timestamp: string;
}

const MAX_OVERS = 20; // Default T20

export default function CricketPage() {
  const { toast } = useToast();

  const initialTeamState = {
    name: 'Team Alpha',
    runs: 0,
    wickets: 0,
    overs: 0,
    balls: 0,
  };

  const [team1, setTeam1] = useState({...initialTeamState, name: 'Team Alpha'});
  const [team2, setTeam2] = useState({...initialTeamState, name: 'Team Bravo', runs: -1 }); // -1 runs indicates not yet batted
  const [battingTeamKey, setBattingTeamKey] = useState<'team1' | 'team2'>('team1');
  
  const [commentaryLog, setCommentaryLog] = useState<CommentaryItem[]>([]);
  const [commentaryIdCounter, setCommentaryIdCounter] = useState(0);

  const currentBattingTeam = battingTeamKey === 'team1' ? team1 : team2;
  const setCurrentBattingTeam = battingTeamKey === 'team1' ? setTeam1 : setTeam2;

  const addCommentary = useCallback((text: string) => {
    setCommentaryLog(prevLog => [
      ...prevLog,
      { id: commentaryIdCounter, text, timestamp: new Date().toISOString() },
    ]);
    setCommentaryIdCounter(prev => prev + 1);
  }, [commentaryIdCounter]);

  const handleAddRuns = useCallback((runsScored: number) => {
    if (currentBattingTeam.wickets >= 10 || currentBattingTeam.overs >= MAX_OVERS) return;

    setCurrentBattingTeam(prev => ({ ...prev, runs: prev.runs + runsScored }));
    addCommentary(`${runsScored} run${runsScored !== 1 ? 's' : ''} scored! Current score: ${currentBattingTeam.runs + runsScored}/${currentBattingTeam.wickets}`);
  }, [currentBattingTeam, setCurrentBattingTeam, addCommentary]);

  const handleAddWicket = useCallback(() => {
    if (currentBattingTeam.wickets >= 10 || currentBattingTeam.overs >= MAX_OVERS) return;

    setCurrentBattingTeam(prev => ({ ...prev, wickets: prev.wickets + 1 }));
    addCommentary(`WICKET! That's wicket number ${currentBattingTeam.wickets + 1}. Score: ${currentBattingTeam.runs}/${currentBattingTeam.wickets + 1}`);
    
    if (currentBattingTeam.wickets + 1 >= 10) {
      addCommentary(`Innings ended for ${currentBattingTeam.name}.`);
      toast({ title: "Innings Over!", description: `${currentBattingTeam.name} are all out.`});
      // TODO: Handle innings change
    }
  }, [currentBattingTeam, setCurrentBattingTeam, addCommentary, toast]);

  const handleNextBall = useCallback((isLegalDelivery: boolean) => {
    if (currentBattingTeam.wickets >= 10 || currentBattingTeam.overs >= MAX_OVERS) return;

    if (isLegalDelivery) {
      setCurrentBattingTeam(prev => {
        const newBalls = prev.balls + 1;
        if (newBalls >= 6) {
          const newOvers = prev.overs + 1;
          addCommentary(`Over ${newOvers} completed. Score: ${prev.runs}/${prev.wickets}`);
          if (newOvers >= MAX_OVERS) {
            addCommentary(`Innings ended for ${prev.name} after ${MAX_OVERS} overs.`);
            toast({ title: "Innings Over!", description: `${prev.name} completed ${MAX_OVERS} overs.`});
            // TODO: Handle innings change
          }
          return { ...prev, overs: newOvers, balls: 0 };
        }
        return { ...prev, balls: newBalls };
      });
    } else {
      // For extras like wide/no-ball, runs are added via handleAddRuns, ball count for over doesn't increase.
      addCommentary(`Extra delivery. Ball does not count towards the over.`);
    }
  }, [currentBattingTeam, setCurrentBattingTeam, addCommentary, toast]);

  const handleAddManualCommentary = useCallback((text: string) => {
    addCommentary(`(Manual) ${text}`);
  }, [addCommentary]);

  const fullCommentaryText = useMemo(() => {
    return commentaryLog.map(c => `${new Date(c.timestamp).toLocaleTimeString()}: ${c.text}`).join('\n');
  }, [commentaryLog]);

  const resetMatch = () => {
    setTeam1({...initialTeamState, name: 'Team Alpha'});
    setTeam2({...initialTeamState, name: 'Team Bravo', runs: -1 });
    setBattingTeamKey('team1');
    setCommentaryLog([]);
    setCommentaryIdCounter(0);
    toast({ title: "Match Reset", description: "The match has been reset to its initial state."});
  };
  
  // Simple innings switch logic (can be expanded)
  const switchInnings = () => {
    if (battingTeamKey === 'team1') {
      if (team2.runs === -1) { // If team2 hasn't batted yet
        setTeam2(prev => ({ ...prev, runs: 0, wickets: 0, overs: 0, balls: 0 }));
      }
      setBattingTeamKey('team2');
      addCommentary(`--- ${team2.name} starts their innings ---`);
      toast({ title: "Innings Changed", description: `${team2.name} are now batting.`});
    } else {
      // Could implement logic for match end or team1 second innings if needed
      addCommentary(`--- ${team1.name} starts their innings (or match ends if one innings game) ---`);
      toast({ title: "Match Status", description: "Consider match end or further innings."});
       setBattingTeamKey('team1'); // Or handle match end
    }
  };
  
  const inningsEnded = currentBattingTeam.wickets >= 10 || currentBattingTeam.overs >= MAX_OVERS;

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow container mx-auto p-4 md:p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-semibold text-primary">Current Match</h2>
          <div className="space-x-2">
            { inningsEnded && battingTeamKey === 'team1' && team2.runs === -1 && (
                <Button onClick={switchInnings} variant="outline" className="border-accent text-accent-foreground hover:bg-accent hover:text-accent-foreground">Start {team2.name}'s Innings</Button>
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
            
            {!inningsEnded ? (
              <ScoreControls
                onAddRuns={handleAddRuns}
                onAddWicket={handleAddWicket}
                onNextBall={handleNextBall}
                teamName={currentBattingTeam.name}
              />
            ) : (
              <div className="p-4 text-center bg-muted rounded-md">
                <p className="font-semibold text-lg">Innings Over for {currentBattingTeam.name}!</p>
                <p>Score: {currentBattingTeam.runs}/{currentBattingTeam.wickets} in {currentBattingTeam.overs}.{currentBattingTeam.balls} overs.</p>
              </div>
            )}
          </div>

          {/* Right Column: Commentary, Summarizer */}
          <div className="lg:col-span-1 space-y-6 flex flex-col">
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
