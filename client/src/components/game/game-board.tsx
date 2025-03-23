import { Tetris3D } from './tetris-3d';
import { GameState } from '@/types/game';

interface GameBoardProps {
  initialState: GameState;
  onStateUpdate: (state: GameState) => void;
  onGameOver: () => void;
  onSaveScore?: (score: number) => void;
}

export function GameBoard({ initialState, onStateUpdate, onGameOver, onSaveScore }: GameBoardProps) {
  return (
    <div className="flex items-center justify-center w-full min-h-[400px] md:min-h-[600px] bg-card rounded-lg p-2 md:p-4">
      <div className="w-full max-w-md flex items-center justify-center">
        <Tetris3D 
          initialState={initialState}
          onStateChange={onStateUpdate}
          onGameOver={onGameOver}
          onSaveScore={onSaveScore}
        />
      </div>
    </div>
  );
}