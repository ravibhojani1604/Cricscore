
'use client';

import type { FC } from 'react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { UserPlus, ListChecks, Edit3, Save, XCircle, AlertTriangle, Info } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";


interface Bowler {
  id: string;
  name: string;
  totalBallsBowled: number;
  maidens: number;
  runsConceded: number;
  wickets: number;
}

interface BowlerControlsProps {
  bowlers: Bowler[];
  currentBowlerId: string | null;
  onAddOrSelectBowlerByName: (name: string) => void;
  onSetCurrentBowlerById: (id: string) => void;
  onEditBowlerName: (bowlerId: string, newName: string) => void;
  disabled: boolean;
  fieldingTeamName: string;
  isBowlerEditable: boolean;
  isOverInProgress: boolean;
  maxBowlersToList: number; // Added from page.tsx
}

export const BowlerControls: FC<BowlerControlsProps> = ({
  bowlers,
  currentBowlerId,
  onAddOrSelectBowlerByName,
  onSetCurrentBowlerById,
  onEditBowlerName,
  disabled,
  fieldingTeamName,
  isBowlerEditable,
  isOverInProgress,
  maxBowlersToList,
}) => {
  const [newBowlerNameInput, setNewBowlerNameInput] = useState('');
  const [isEditingName, setIsEditingName] = useState(false);
  const [editableName, setEditableName] = useState('');

  const currentBowler = bowlers.find(b => b.id === currentBowlerId);
  // Overall controls should be disabled if the main 'disabled' prop is true OR if an over is in progress (for changing bowler/adding new)
  const overallControlsDisabled = disabled || isOverInProgress; 
  // Specific disable for add/select if max bowlers reached and not selecting existing one
  const addOrSelectDisabled = overallControlsDisabled || (bowlers.length >= maxBowlersToList && !bowlers.find(b => b.name.toLowerCase() === newBowlerNameInput.trim().toLowerCase()));


  useEffect(() => {
    if (currentBowler && isEditingName) {
      setEditableName(currentBowler.name);
    } else if (!currentBowler || !isBowlerEditable || isOverInProgress) {
      // Cancel editing if bowler changes, no longer editable, or over starts
      setIsEditingName(false);
    }
  }, [currentBowler, isEditingName, isBowlerEditable, isOverInProgress]);

  const handleSetNewBowler = () => {
    if (newBowlerNameInput.trim()) {
      onAddOrSelectBowlerByName(newBowlerNameInput.trim());
      setNewBowlerNameInput('');
    }
  };

  const handleEditClick = () => {
    if (currentBowler && isBowlerEditable && !isOverInProgress) {
      setEditableName(currentBowler.name);
      setIsEditingName(true);
    }
  };

  const handleSaveName = () => {
    if (currentBowlerId && editableName.trim() && isBowlerEditable && !isOverInProgress) {
      onEditBowlerName(currentBowlerId, editableName.trim());
      setIsEditingName(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditingName(false);
    if (currentBowler) { // Reset editable name to current bowler's name
      setEditableName(currentBowler.name);
    }
  };

  const editButtonDisabled = disabled || !isBowlerEditable || isOverInProgress || !currentBowlerId;
  const editButtonTitle =
    isOverInProgress ? "Cannot edit bowler name during an over." :
    !isBowlerEditable ? "Bowler name cannot be edited after they've started bowling this spell or if no bowler selected." :
    !currentBowlerId ? "No bowler selected to edit." :
    "Edit bowler name";


  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Bowler Management ({fieldingTeamName})</CardTitle>
        <CardDescription>Select, add, or edit the current bowler. Only {maxBowlersToList} bowler at a time.</CardDescription>
         {!currentBowlerId && !disabled && (
             <p className="text-sm text-destructive flex items-center gap-1 pt-1">
                <AlertTriangle className="h-4 w-4" />
                Select a bowler to start scoring.
             </p>
        )}
        {isOverInProgress && currentBowler && !disabled && (
             <Alert variant="default" className="mt-2 bg-secondary">
                <Info className="h-4 w-4" />
                <AlertTitle>Over in Progress</AlertTitle>
                <AlertDescription>
                    {currentBowler.name} is currently bowling. Complete the over to change bowler or edit name.
                </AlertDescription>
            </Alert>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {!isEditingName && (
          <>
            <div className="space-y-2">
              <Label htmlFor="new-bowler-name">Add New or Select by Name</Label>
              <div className="flex space-x-2">
                <Input
                  id="new-bowler-name"
                  type="text"
                  placeholder="Enter bowler's name"
                  value={newBowlerNameInput}
                  onChange={(e) => setNewBowlerNameInput(e.target.value)}
                  disabled={addOrSelectDisabled}
                  className="flex-grow"
                />
                <Button
                    onClick={handleSetNewBowler}
                    disabled={addOrSelectDisabled || !newBowlerNameInput.trim()}
                    aria-label="Set or Add Bowler"
                    title={
                        isOverInProgress ? "Cannot change bowler during an over." : 
                        (bowlers.length >= maxBowlersToList && !bowlers.find(b=>b.name.toLowerCase() === newBowlerNameInput.trim().toLowerCase())) ? `Max ${maxBowlersToList} bowlers allowed.` : 
                        ""
                    }
                >
                  <UserPlus className="mr-2 h-4 w-4" /> Set/Add
                </Button>
              </div>
               {bowlers.length >= maxBowlersToList && !currentBowlerId && !overallControlsDisabled && (
                <p className="text-xs text-muted-foreground">
                    Maximum {maxBowlersToList} bowler(s) allowed for {fieldingTeamName}. Current: {bowlers.map(b => b.name).join(', ')}.
                </p>
               )}
               {bowlers.length >= maxBowlersToList && currentBowlerId && !overallControlsDisabled && (
                <p className="text-xs text-muted-foreground">
                    Current bowler: {currentBowler?.name}. Clear to add a new one if needed.
                </p>
               )}
            </div>

            {bowlers.length > 0 && (
              <div className="space-y-2">
                <Label htmlFor="select-bowler">Select Existing Bowler</Label>
                <Select
                  value={currentBowlerId || ''}
                  onValueChange={(value) => { if (value) onSetCurrentBowlerById(value); }}
                  disabled={overallControlsDisabled}
                >
                  <SelectTrigger
                    id="select-bowler"
                    aria-label="Select existing bowler"
                    title={isOverInProgress ? "Cannot change bowler during an over." : ""}
                  >
                    <ListChecks className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Select from list..." />
                  </SelectTrigger>
                  <SelectContent>
                    {bowlers.map((bowler) => (
                      <SelectItem key={bowler.id} value={bowler.id}>
                        {bowler.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </>
        )}

        {currentBowler && !isEditingName && (
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-md">
            <p className="text-sm font-medium text-primary">
              Current Bowler: <span className="font-bold">{currentBowler.name}</span>
            </p>
            <Button
              onClick={handleEditClick}
              variant="outline"
              size="sm"
              disabled={editButtonDisabled}
              title={editButtonTitle}
            >
              <Edit3 className="mr-1 h-3 w-3" /> Edit Name
            </Button>
          </div>
        )}

        {isEditingName && currentBowler && (
          <div className="space-y-3 p-4 border rounded-md bg-background shadow-sm">
            <Label htmlFor="edit-bowler-name" className="text-base font-semibold text-primary">Edit Bowler Name</Label>
             <Input
              id="edit-bowler-name"
              type="text"
              value={editableName}
              onChange={(e) => setEditableName(e.target.value)}
              disabled={disabled || !isBowlerEditable || isOverInProgress} 
              className="mb-2"
            />
            <div className="flex space-x-2 justify-end pt-1">
              <Button onClick={handleCancelEdit} variant="ghost" size="sm" disabled={!isBowlerEditable || isOverInProgress}>
                <XCircle className="mr-1 h-4 w-4" /> Cancel
              </Button>
              <Button onClick={handleSaveName} size="sm" disabled={disabled || !editableName.trim() || !isBowlerEditable || isOverInProgress}>
                <Save className="mr-1 h-4 w-4" /> Save Name
              </Button>
            </div>
             {(!isBowlerEditable || isOverInProgress) && !disabled &&
                <p className="text-xs text-muted-foreground pt-1">
                    {isOverInProgress ? "Bowler name cannot be edited during an over." : !isBowlerEditable ? "Bowler name cannot be edited after they have bowled in this spell." : ""}
                </p>
             }
          </div>
        )}

      </CardContent>
    </Card>
  );
};
