import { useState } from 'react';
import { CHARACTER_ROSTER, type CharacterStats } from './character-data';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface CharacterSelectProps {
  onSelect: (character: CharacterStats) => void;
}

export function CharacterSelect({ onSelect }: CharacterSelectProps) {
  const [selectedCharacter, setSelectedCharacter] = useState<CharacterStats | null>(null);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-center mb-6">Select Your Fighter</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Character Grid */}
        <div className="grid grid-cols-2 gap-4">
          {Object.entries(CHARACTER_ROSTER).map(([id, character]) => (
            <Card 
              key={id}
              className={`p-4 cursor-pointer transition-all ${
                selectedCharacter?.name === character.name 
                ? 'ring-2 ring-primary' 
                : 'hover:ring-1 hover:ring-primary/50'
              }`}
              onClick={() => setSelectedCharacter(character)}
            >
              {/* Temporary character representation */}
              <div 
                className="w-full aspect-square mb-2 rounded"
                style={{ backgroundColor: character.color }}
              />
              <h3 className="text-lg font-semibold text-center">{character.name}</h3>
            </Card>
          ))}
        </div>

        {/* Character Details */}
        <div className="space-y-4">
          {selectedCharacter ? (
            <>
              <h3 className="text-xl font-bold">{selectedCharacter.name}</h3>
              <p className="text-muted-foreground">{selectedCharacter.description}</p>
              
              <div className="space-y-2">
                <h4 className="font-semibold">Stats</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>Health: {selectedCharacter.health}</div>
                  <div>Speed: {selectedCharacter.walkSpeed}</div>
                  <div>Jump: {selectedCharacter.jumpForce}</div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold">Special Moves</h4>
                <div className="space-y-2">
                  {selectedCharacter.specialMoves.map((move) => (
                    <div key={move.name} className="text-sm">
                      <div className="font-medium">{move.name}</div>
                      <div className="text-muted-foreground">{move.description}</div>
                      <div className="text-xs">Input: {move.input.join(" → ")}</div>
                    </div>
                  ))}
                </div>
              </div>

              <Button 
                className="w-full mt-4"
                onClick={() => onSelect(selectedCharacter)}
              >
                Select {selectedCharacter.name}
              </Button>
            </>
          ) : (
            <div className="text-center text-muted-foreground">
              Select a character to view their details
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
