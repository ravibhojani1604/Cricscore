
'use client';

import type { FC } from 'react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { UserPlus, ListChecks, Edit3, Save, XCircle } from 'lucide-react';

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
}

export const BowlerControls: FC<BowlerControlsProps> = ({
  bowlers,
  currentBowlerId,
  onAddOrSelectBowlerByName,
  onSetCurrentBowlerById,
  onEditBowlerName,
  disabled,
  fieldingTeamName,
}) => {
  const [newBowlerNameInput, setNewBowlerNameInput] = useState('');
  const [isEditingName, setIsEditingName] = useState(false);
  const [editableName, setEditableName] = useState('');

  const currentBowler = bowlers.find(b => b.id === currentBowlerId);

  useEffect(() => {
    if (currentBowler && isEditingName) {
      setEditableName(currentBowler.name);
    } else if (!currentBowler) {
      setIsEditingName(false); // If current bowler becomes null (e.g. over completed), exit edit mode
    }
  }, [currentBowler, isEditingName]);

  const handleSetNewBowler = () => {
    if (newBowlerNameInput.trim()) {
      onAddOrSelectBowlerByName(newBowlerNameInput.trim());
      setNewBowlerNameInput('');
    }
  };

  const handleEditClick = () => {
    if (currentBowler) {
      setEditableName(currentBowler.name);
      setIsEditingName(true);
    }
  };

  const handleSaveName = () => {
    if (currentBowlerId && editableName.trim()) {
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Bowler Management ({fieldingTeamName})</CardTitle>
        <CardDescription>Select, add, or edit the current bowler.</CardDescription>
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
                  placeholder="Enter bowler's name to add or select"
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
                  value={currentBowlerId || ''}
                  onValueChange={(value) => { if (value) onSetCurrentBowlerById(value); }}
                  disabled={disabled}
                >
                  <SelectTrigger id="select-bowler" aria-label="Select existing bowler">
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
          <div className="flex items-center justify-between p-2 bg-secondary/50 rounded-md">
            <p className="text-sm font-medium text-primary">
              Current Bowler: <span className="font-bold">{currentBowler.name}</span>
            </p>
            <Button onClick={handleEditClick} variant="outline" size="sm" disabled={disabled}>
              <Edit3 className="mr-1 h-3 w-3" /> Edit Name
            </Button>
          </div>
        )}

        {isEditingName && currentBowler && (
          <div className="space-y-2 p-3 border rounded-md bg-background shadow-sm">
            <Label htmlFor="edit-bowler-name" className="font-semibold">Edit Bowler Name</Label>
             <Input
              id="edit-bowler-name"
              type="text"
              value={editableName}
              onChange={(e) => setEditableName(e.target.value)}
              disabled={disabled}
              className="mb-2"
            />
            <div className="flex space-x-2 justify-end">
              <Button onClick={handleCancelEdit} variant="ghost" size="sm">
                <XCircle className="mr-1 h-4 w-4" /> Cancel
              </Button>
              <Button onClick={handleSaveName} size="sm" disabled={disabled || !editableName.trim()}>
                <Save className="mr-1 h-4 w-4" /> Save Name
              </Button>
            </div>
          </div>
        )}

         {!currentBowlerId && !disabled && !isEditingName && (
          <p className="text-sm text-muted-foreground">
            No bowler currently selected. Scores will not be attributed to a bowler.
          </p>
        )}
      </CardContent>
    </Card>
  );
};

    