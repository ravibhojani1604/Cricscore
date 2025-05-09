
'use client';

import type { FC } from 'react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { UserPlus, Users, Shuffle, AlertTriangle, UserCheck } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

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
  disabled: boolean; 
  maxBatters: number;
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
  maxBatters,
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

  const lineupFull = batters.length >= maxBatters;
  
  // Count active (selected and not out) batters
  const activeBattersOnField = 
    (onStrikeBatterId ? (batters.find(b => b.id === onStrikeBatterId && !b.isOut) ? 1 : 0) : 0) +
    (offStrikeBatterId ? (batters.find(b => b.id === offStrikeBatterId && !b.isOut && b.id !== onStrikeBatterId) ? 1 : 0) : 0);
  
  const canAddBatterToList = !disabled && !lineupFull && activeBattersOnField < 2;

  const addBatterInputDisabled = disabled || lineupFull || activeBattersOnField >= 2;
  const addBatterButtonDisabled = addBatterInputDisabled || !newBatterNameInput.trim();

  return (
    <Card className="shadow-md">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl flex items-center gap-2">
          <UserCheck className="text-primary h-6 w-6" /> Batter Management ({battingTeamName})
        </CardTitle>
        <CardDescription>Select current batters or add new ones to the lineup (max {maxBatters}).</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <Label htmlFor="new-batter-name" className="font-medium">Add New Batter</Label>
          <div className="flex items-center space-x-2 bg-muted/30 p-3 rounded-md border border-input">
            <Input
              id="new-batter-name"
              type="text"
              placeholder="Enter batter's name"
              value={newBatterNameInput}
              onChange={(e) => setNewBatterNameInput(e.target.value)}
              disabled={addBatterInputDisabled}
              className="flex-grow shadow-sm"
              aria-label="New batter name input"
            />
            <Button 
              onClick={handleAddNewBatter} 
              disabled={addBatterButtonDisabled} 
              aria-label="Add New Batter"
              className="shadow-sm"
            >
              <UserPlus className="mr-2 h-4 w-4" /> Add
            </Button>
          </div>
           {lineupFull && (
            <p className="text-xs text-muted-foreground px-1">Maximum {maxBatters} batters reached for {battingTeamName}.</p>
           )}
           {!disabled && !lineupFull && activeBattersOnField >= 2 && (
            <p className="text-xs text-muted-foreground px-1">
              Two batters are currently active. Add new batters after a wicket or if a slot is free.
            </p>
           )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
          <div className="space-y-2">
            <Label htmlFor="on-strike-batter" className="font-medium">On Strike</Label>
            <Select
              value={onStrikeBatterId || ''}
              onValueChange={(value) => { if (value) onSelectBatter('onStrike', value); }}
              disabled={disabled || availableBatters.length === 0}
            >
              <SelectTrigger id="on-strike-batter" aria-label="Select on-strike batter" className="shadow-sm">
                <Users className="mr-2 h-4 w-4 text-muted-foreground" />
                <SelectValue placeholder="Select on-strike batter..." />
              </SelectTrigger>
              <SelectContent>
                {availableBatters.map((batter) => (
                  <SelectItem key={batter.id} value={batter.id} disabled={batter.id === offStrikeBatterId}>
                    {batter.name} (Order: {batter.order})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="off-strike-batter" className="font-medium">Off Strike (Non-Striker)</Label>
            <Select
              value={offStrikeBatterId || ''}
              onValueChange={(value) => { if (value) onSelectBatter('offStrike', value); }}
              disabled={disabled || availableBatters.length === 0}
            >
              <SelectTrigger id="off-strike-batter" aria-label="Select off-strike batter" className="shadow-sm">
                <Users className="mr-2 h-4 w-4 text-muted-foreground" />
                <SelectValue placeholder="Select non-striker..." />
              </SelectTrigger>
              <SelectContent>
                {availableBatters.map((batter) => (
                  <SelectItem key={batter.id} value={batter.id} disabled={batter.id === onStrikeBatterId}>
                    {batter.name} (Order: {batter.order})
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
            className="w-full shadow-sm border-primary/50 text-primary hover:bg-primary/10"
        >
          <Shuffle className="mr-2 h-4 w-4" /> Swap Strike
        </Button>

        {((!onStrikeBatterId && availableBatters.length > 0) || (availableBatters.length > 1 && onStrikeBatterId && !offStrikeBatterId)) && !disabled && (
             <Alert variant="destructive" className="mt-2">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Action Required</AlertTitle>
                <AlertDescription>
                    { !onStrikeBatterId && availableBatters.length > 0 && "Select a batter for the strike position."}
                    { onStrikeBatterId && !offStrikeBatterId && availableBatters.length > 1 && "Select a non-striker."}
                </AlertDescription>
             </Alert>
        )}

        {(onStrikeBatter || offStrikeBatter) && (
            <div className="p-3 bg-primary/10 rounded-md border border-primary/30 shadow-sm space-y-1">
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
            </div>
        )}
      </CardContent>
    </Card>
  );
};
