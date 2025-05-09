
'use client';

import type { FC } from 'react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { UserPlus, Users, Shuffle, AlertTriangle } from 'lucide-react';

interface Batter {
  id: string;
  name: string;
  isOut: boolean;
  order: number;
}

interface BatterControlsProps {
  battingTeamName: string;
  batters: Batter[];
  onStrikeBatterId: string | null;
  offStrikeBatterId: string | null;
  onAddBatter: (name: string) => void;
  onSelectBatter: (position: 'onStrike' | 'offStrike', batterId: string) => void;
  onSwapStrike: () => void;
  disabled: boolean; // Overall disabled state from parent (innings over, match over, etc.)
}

export const BatterControls: FC<BatterControlsProps> = ({
  battingTeamName,
  batters,
  onStrikeBatterId,
  offStrikeBatterId,
  onAddBatter,
  onSelectBatter,
  onSwapStrike,
  disabled,
}) => {
  const [newBatterNameInput, setNewBatterNameInput] = useState('');

  const handleAddNewBatter = () => {
    if (newBatterNameInput.trim()) {
      onAddBatter(newBatterNameInput.trim());
      setNewBatterNameInput('');
    }
  };

  const availableBatters = batters.filter(b => !b.isOut).sort((a,b) => a.order - b.order);
  const onStrikeBatter = batters.find(b => b.id === onStrikeBatterId);
  const offStrikeBatter = batters.find(b => b.id === offStrikeBatterId);

  const maxBattersReached = batters.length >= 11;
  const twoBattersActive = onStrikeBatterId !== null && offStrikeBatterId !== null;
  const canAddBatterToList = !disabled && !maxBattersReached && !twoBattersActive;

  const addBatterInputDisabled = disabled || maxBattersReached || twoBattersActive;
  const addBatterButtonDisabled = addBatterInputDisabled || !newBatterNameInput.trim();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Batter Management ({battingTeamName})</CardTitle>
        <CardDescription>Select current batters or add new ones to the lineup.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="new-batter-name">Add New Batter</Label>
          <div className="flex space-x-2">
            <Input
              id="new-batter-name"
              type="text"
              placeholder="Enter batter's name"
              value={newBatterNameInput}
              onChange={(e) => setNewBatterNameInput(e.target.value)}
              disabled={addBatterInputDisabled}
              className="flex-grow"
            />
            <Button 
              onClick={handleAddNewBatter} 
              disabled={addBatterButtonDisabled} 
              aria-label="Add New Batter"
            >
              <UserPlus className="mr-2 h-4 w-4" /> Add Batter
            </Button>
          </div>
           {maxBattersReached && (
            <p className="text-xs text-muted-foreground">Maximum 11 batters reached for {battingTeamName}.</p>
           )}
           {!disabled && !maxBattersReached && twoBattersActive && (
            <p className="text-xs text-muted-foreground">
              Two batters are currently active. Add new batters to the lineup after a wicket or if a slot is free.
            </p>
           )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="on-strike-batter">On Strike</Label>
            <Select
              value={onStrikeBatterId || ''}
              onValueChange={(value) => { if (value) onSelectBatter('onStrike', value); }}
              disabled={disabled || availableBatters.length === 0}
            >
              <SelectTrigger id="on-strike-batter" aria-label="Select on-strike batter">
                <Users className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Select on-strike batter..." />
              </SelectTrigger>
              <SelectContent>
                {availableBatters.map((batter) => (
                  <SelectItem key={batter.id} value={batter.id} disabled={batter.id === offStrikeBatterId}>
                    {batter.name} ({batter.order})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="off-strike-batter">Off Strike (Non-Striker)</Label>
            <Select
              value={offStrikeBatterId || ''}
              onValueChange={(value) => { if (value) onSelectBatter('offStrike', value); }}
              disabled={disabled || availableBatters.length === 0}
            >
              <SelectTrigger id="off-strike-batter" aria-label="Select off-strike batter">
                <Users className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Select non-striker..." />
              </SelectTrigger>
              <SelectContent>
                {availableBatters.map((batter) => (
                  <SelectItem key={batter.id} value={batter.id} disabled={batter.id === onStrikeBatterId}>
                    {batter.name} ({batter.order})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <Button 
            onClick={onSwapStrike} 
            disabled={disabled || !onStrikeBatterId || !offStrikeBatterId} 
            variant="outline" 
            className="w-full"
        >
          <Shuffle className="mr-2 h-4 w-4" /> Swap Strike
        </Button>

        {(!onStrikeBatterId || (availableBatters.length > 1 && !offStrikeBatterId && onStrikeBatterId)) && !disabled && (
             <p className="text-sm text-destructive flex items-center gap-1">
                <AlertTriangle className="h-4 w-4" />
                { !onStrikeBatterId && "Select a batter for the strike position."}
                { onStrikeBatterId && !offStrikeBatterId && availableBatters.length > 1 && "Select a non-striker."}
             </p>
        )}

        {onStrikeBatter && (
            <p className="text-sm text-primary">
                On Strike: <span className="font-semibold">{onStrikeBatter.name}</span>
            </p>
        )}
        {offStrikeBatter && (
            <p className="text-sm text-primary">
                Non-Striker: <span className="font-semibold">{offStrikeBatter.name}</span>
            </p>
        )}

      </CardContent>
    </Card>
  );
};
