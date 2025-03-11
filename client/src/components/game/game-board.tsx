import { useState, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Tetris } from './tetris';
import { GameState } from '@/types/game';

interface GameBoardProps {
  onStateUpdate: (state: GameState) => void;
  onGameOver: () => void;
}

export function GameBoard({ onStateUpdate, onGameOver }: GameBoardProps) {
  return (
    <Card className="w-full flex items-center justify-center min-h-[600px] p-4">
      <Tetris 
        onStateChange={onStateUpdate}
        onGameOver={onGameOver}
      />
    </Card>
  );
}