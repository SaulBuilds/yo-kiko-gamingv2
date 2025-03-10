import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GameState } from '@/types/game';

interface SpectatorProps {
  gameState: GameState;
}

export function Spectator({ gameState }: SpectatorProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-primary">Opponent's Game</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-10 gap-px bg-primary/20 p-2 rounded">
          {gameState.board.map((row, y) => (
            row.map((cell, x) => (
              <div
                key={`${y}-${x}`}
                className="w-6 h-6 border border-primary/10"
                style={{
                  backgroundColor: cell ? '#FF61DC' : 'transparent'
                }}
              />
            ))
          ))}
        </div>
        <div className="mt-4 text-center">
          <p className="text-primary">Score: {gameState.score}</p>
          <p className="text-muted-foreground">Level: {gameState.level}</p>
        </div>
      </CardContent>
    </Card>
  );
}
