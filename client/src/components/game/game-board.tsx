import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tetris } from './tetris';
import { GameState } from '@/types/game';

interface GameBoardProps {
  onStateUpdate: (state: GameState) => void;
  onGameOver: () => void;
}

export function GameBoard({ onStateUpdate, onGameOver }: GameBoardProps) {
  const [gameState, setGameState] = useState<GameState>({
    board: [],
    score: 0,
    level: 1
  });

  const handleStateChange = useCallback((state: GameState) => {
    setGameState(state);
    onStateUpdate(state);
  }, [onStateUpdate]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-primary">Your Game</CardTitle>
      </CardHeader>
      <CardContent>
        <Tetris 
          onStateChange={handleStateChange}
          onGameOver={onGameOver}
        />
      </CardContent>
    </Card>
  );
}
