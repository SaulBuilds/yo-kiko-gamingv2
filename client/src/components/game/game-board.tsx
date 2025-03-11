import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tetris } from './tetris';
import { GameState } from '@/types/game';

interface GameBoardProps {
  onStateUpdate: (state: GameState) => void;
  onGameOver: () => void;
}

export function GameBoard({ onStateUpdate, onGameOver }: GameBoardProps) {
  const handleStateChange = useCallback((state: GameState) => {
    onStateUpdate(state);
  }, [onStateUpdate]);

  return (
    <div>
      <Tetris 
        onStateChange={handleStateChange}
        onGameOver={onGameOver}
      />
    </div>
  );
}