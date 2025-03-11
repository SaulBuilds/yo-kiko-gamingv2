import { Tetris } from './tetris';
import { GameState } from '@/types/game';

interface GameBoardProps {
  initialState: GameState;
  onStateUpdate: (state: GameState) => void;
  onGameOver: () => void;
}

export function GameBoard({ initialState, onStateUpdate, onGameOver }: GameBoardProps) {
  return (
    <div className="flex items-center justify-center w-full min-h-[600px] bg-card rounded-lg p-4">
      <Tetris 
        initialState={initialState}
        onStateChange={onStateUpdate}
        onGameOver={onGameOver}
      />
    </div>
  );
}