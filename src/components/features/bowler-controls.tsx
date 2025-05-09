
'use client';

import type { FC } from 'react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { UserPlus, ListChecks, Edit3, Save, XCircle, AlertTriangle, Info, UserCog } from 'lucide-react';
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
  lastBowlerWhoCompletedOverId: string | null;
  onAddOrSelectBowlerByName: (name: string) => void;
  onSetCurrentBowlerById: (id: string) => void;
  onEditBowlerName: (bowlerId: string, newName: string) => void;
  disabled: boolean;
  fieldingTeamName: string;
  isBowlerEditable: boolean;
  isOverInProgress: boolean;
  maxBowlersToList: number;
}

export const BowlerControls: FC<BowlerControlsProps> = ({
  bowlers,
  currentBowlerId,
  lastBowlerWhoCompletedOverId,
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
  
  const overallControlsDisabled = disabled || isOverInProgress; 
  
  const existingBowlerIsLastOverBowler = bowlers.find(b => b.name.toLowerCase() === newBowlerNameInput.trim().toLowerCase())?.id === lastBowlerWhoCompletedOverId;
  const addOrSelectDisabled = overallControlsDisabled || 
    (bowlers.length >= maxBowlersToList && !bowlers.find(b => b.name.toLowerCase() === newBowlerNameInput.trim().toLowerCase())) ||
    (!!lastBowlerWhoCompletedOverId && existingBowlerIsLastOverBowler);


  useEffect(() => {
    if (currentBowler && isEditingName) {
      setEditableName(currentBowler.name);
    } else if (!currentBowler || !isBowlerEditable || isOverInProgress) {
      setIsEditingName(false);
    }
  }, [currentBowler, isEditingName, isBowlerEditable, isOverInProgress]);

  const handleSetNewBowler = () => {
    if (newBowlerNameInput.trim()) {
      const existingBowler = bowlers.find(b => b.name.toLowerCase() === newBowlerNameInput.trim().toLowerCase());
      if (existingBowler && existingBowler.id === lastBowlerWhoCompletedOverId) {
        // This check is redundant due to addOrSelectDisabled but good for clarity / direct call
        // Toast is handled in page.tsx's handler
        onAddOrSelectBowlerByName(newBowlerNameInput.trim()); 
        return;
      }
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
    if (currentBowler) { 
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
    <Card className="shadow-md">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl flex items-center gap-2">
          <UserCog className="text-primary h-6 w-6" /> Bowler Management ({fieldingTeamName})
        </CardTitle>
        <CardDescription>Select, add, or edit the current bowler. Only {maxBowlersToList} bowler at a time. The same bowler cannot bowl consecutive overs.</CardDescription>
         {!currentBowlerId && !disabled && !isOverInProgress && (
             <Alert variant="destructive" className="mt-2">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Action Required</AlertTitle>
                <AlertDescription>
                    Please select a bowler to start scoring.
                </AlertDescription>
            </Alert>
        )}
        {isOverInProgress && currentBowler && !disabled && (
             <Alert variant="default" className="mt-2 bg-secondary/70 border-primary/30">
                <Info className="h-4 w-4 text-primary" />
                <AlertTitle className="text-primary">Over in Progress</AlertTitle>
                <AlertDescription>
                    {currentBowler.name} is currently bowling. Complete the over to change bowler or edit name.
                </AlertDescription>
            </Alert>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        {!isEditingName && (
          <>
            <div className="space-y-3">
              <Label htmlFor="new-bowler-name" className="font-medium">Add New or Select by Name</Label>
              <div className="flex items-center space-x-2 bg-muted/30 p-3 rounded-md border border-input">
                <Input
                  id="new-bowler-name"
                  type="text"
                  placeholder="Enter bowler's name"
                  value={newBowlerNameInput}
                  onChange={(e) => setNewBowlerNameInput(e.target.value)}
                  disabled={addOrSelectDisabled}
                  className="flex-grow shadow-sm"
                  aria-label="New bowler name input"
                />
                <Button
                    onClick={handleSetNewBowler}
                    disabled={addOrSelectDisabled || !newBowlerNameInput.trim()}
                    aria-label="Set or Add Bowler"
                    title={
                        isOverInProgress ? "Cannot change bowler during an over." : 
                        (existingBowlerIsLastOverBowler ? "This bowler cannot bowl consecutive overs." :
                        (bowlers.length >= maxBowlersToList && !bowlers.find(b=>b.name.toLowerCase() === newBowlerNameInput.trim().toLowerCase())) ? `Max ${maxBowlersToList} bowlers allowed.` : 
                        "Set or Add Bowler")
                    }
                    className="shadow-sm"
                >
                  <UserPlus className="mr-2 h-4 w-4" /> Set/Add
                </Button>
              </div>
               {bowlers.length >= maxBowlersToList && !currentBowlerId && !overallControlsDisabled && (
                <p className="text-xs text-muted-foreground px-1">
                    Maximum {maxBowlersToList} bowler(s) allowed for {fieldingTeamName}. Current: {bowlers.map(b => b.name).join(', ')}.
                </p>
               )}
               {bowlers.length >= maxBowlersToList && currentBowlerId && !overallControlsDisabled && (
                <p className="text-xs text-muted-foreground px-1">
                    Current bowler: {currentBowler?.name}. Replace current by typing a new name if needed.
                </p>
               )}
            </div>

            {bowlers.length > 0 && (
              <div className="space-y-2">
                <Label htmlFor="select-bowler" className="font-medium">Select Existing Bowler</Label>
                <Select
                  value={currentBowlerId || ''}
                  onValueChange={(value) => { if (value) onSetCurrentBowlerById(value); }}
                  disabled={overallControlsDisabled}
                >
                  <SelectTrigger
                    id="select-bowler"
                    aria-label="Select existing bowler"
                    title={isOverInProgress ? "Cannot change bowler during an over." : "Select an existing bowler"}
                    className="shadow-sm"
                  >
                    <ListChecks className="mr-2 h-4 w-4 text-muted-foreground" />
                    <SelectValue placeholder="Select from list..." />
                  </SelectTrigger>
                  <SelectContent>
                    {bowlers.map((bowler) => (
                      <SelectItem 
                        key={bowler.id} 
                        value={bowler.id}
                        disabled={bowler.id === lastBowlerWhoCompletedOverId}
                      >
                        {bowler.name} {bowler.id === lastBowlerWhoCompletedOverId ? "(Bowled last over)" : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </>
        )}

        {currentBowler && !isEditingName && (
          <div className="flex items-center justify-between p-3 bg-primary/10 rounded-md border border-primary/30 shadow-sm">
            <p className="text-sm font-medium text-primary">
              Current Bowler: <span className="font-bold">{currentBowler.name}</span>
            </p>
            <Button
              onClick={handleEditClick}
              variant="outline"
              size="sm"
              disabled={editButtonDisabled}
              title={editButtonTitle}
              className="border-primary/50 text-primary hover:bg-primary/20"
            >
              <Edit3 className="mr-1 h-3 w-3" /> Edit Name
            </Button>
          </div>
        )}

        {isEditingName && currentBowler && (
          <div className="space-y-3 p-4 border border-primary/50 rounded-md bg-background shadow-lg">
            <Label htmlFor="edit-bowler-name" className="text-base font-semibold text-primary">Edit Bowler Name</Label>
             <Input
              id="edit-bowler-name"
              type="text"
              value={editableName}
              onChange={(e) => setEditableName(e.target.value)}
              disabled={disabled || !isBowlerEditable || isOverInProgress} 
              className="mb-2 shadow-sm"
              aria-label="Edit bowler name input"
            />
            <div className="flex space-x-2 justify-end pt-1">
              <Button onClick={handleCancelEdit} variant="ghost" size="sm" disabled={!isBowlerEditable || isOverInProgress}>
                <XCircle className="mr-1 h-4 w-4" /> Cancel
              </Button>
              <Button onClick={handleSaveName} size="sm" disabled={disabled || !editableName.trim() || !isBowlerEditable || isOverInProgress} className="shadow-sm">
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
