'use client';

import type { FC } from 'react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { UserPlus, ListChecks } from 'lucide-react';

interface Bowler {
  name: string;
  totalBallsBowled: number;
  maidens: number;
  runsConceded: number;
  wickets: number;
}

interface BowlerControlsProps {
  bowlers: Bowler[];
  currentBowlerName: string | null;
  onSetCurrentBowler: (name: string) => void;
  disabled: boolean;
  fieldingTeamName: string;
}

export const BowlerControls: FC<BowlerControlsProps> = ({
  bowlers,
  currentBowlerName,
  onSetCurrentBowler,
  disabled,
  fieldingTeamName,
}) => {
  const [newBowlerNameInput, setNewBowlerNameInput] = useState('');

  const handleSetNewBowler = () => {
    if (newBowlerNameInput.trim()) {
      onSetCurrentBowler(newBowlerNameInput.trim());
      setNewBowlerNameInput('');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Bowler Management ({fieldingTeamName})</CardTitle>
        <CardDescription>Select or add the current bowler for the fielding team.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="new-bowler-name">Add New Bowler</Label>
          <div className="flex space-x-2">
            <Input
              id="new-bowler-name"
              type="text"
              placeholder="Enter bowler's name"
              value={newBowlerNameInput}
              onChange={(e) => setNewBowlerNameInput(e.target.value)}
              disabled={disabled}
              className="flex-grow"
            />
            <Button onClick={handleSetNewBowler} disabled={disabled || !newBowlerNameInput.trim()} aria-label="Set or Add Bowler">
              <UserPlus className="mr-2 h-4 w-4" /> Set/Add
            </Button>
          </div>
        </div>

        {bowlers.length > 0 && (
          <div className="space-y-2">
            <Label htmlFor="select-bowler">Select Existing Bowler</Label>
            <Select
              value={currentBowlerName || ''}
              onValueChange={(value) => { if (value) onSetCurrentBowler(value); }}
              disabled={disabled}
            >
              <SelectTrigger id="select-bowler" aria-label="Select existing bowler">
                <ListChecks className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Select bowler..." />
              </SelectTrigger>
              <SelectContent>
                {bowlers.map((bowler) => (
                  <SelectItem key={bowler.name} value={bowler.name}>
                    {bowler.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
        
        {currentBowlerName && (
          <p className="text-sm font-medium text-primary">
            Current Bowler: <span className="font-bold">{currentBowlerName}</span>
          </p>
        )}
         {!currentBowlerName && !disabled && (
          <p className="text-sm text-muted-foreground">
            No bowler currently selected. Scores will not be attributed to a bowler.
          </p>
        )}
      </CardContent>
    </Card>
  );
};
