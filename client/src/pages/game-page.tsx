import { useEffect, useState } from "react";
import { useRoute, useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GameBoard } from "@/components/game/game-board";
import { Spectator } from "@/components/game/spectator";
import { useAuth } from "@/hooks/use-auth";
import { GameState } from "@/types/game";
import { useToast } from "@/hooks/use-toast";
import { Navbar } from "@/components/layout/navbar";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function GamePage() {
  const [, params] = useRoute("/game/:id");
  const [_, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [gameState, setGameState] = useState<GameState>({
    board: Array(20).fill(Array(10).fill(0)),
    score: 0,
    level: 1
  });
  const [opponentState, setOpponentState] = useState<GameState | null>(null);

  // Fetch match details
  const { data: match, isLoading: isMatchLoading } = useQuery({
    queryKey: ["/api/matches", params?.id],
    enabled: !!params?.id,
  });

  // Start practice game mutation
  const startPracticeMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/matches", {
        betAmount: "0",
        gameType: "tetris",
        isPractice: true
      });
      if (!res.ok) throw new Error("Failed to create practice game");
      return res.json();
    },
    onSuccess: (match) => {
      toast({
        title: "Practice Game Created",
        description: "Starting practice mode...",
      });
      setLocation(`/game/${match.id}`);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (!user || !params?.id) return;

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/game-ws`;
    console.log("Connecting to WebSocket:", wsUrl);

    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log("WebSocket connection established");
      ws.send(JSON.stringify({
        type: "join",
        matchId: parseInt(params.id!),
        userId: user.id
      }));
    };

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        console.log("Received message:", message);

        if (message.type === "gameState") {
          const states = new Map(message.states);
          const opponentStateData = Array.from(states.entries())
            .find(([id]) => id !== user.id)?.[1];

          if (opponentStateData) {
            setOpponentState(opponentStateData);
          }
        }
      } catch (error) {
        console.error("Error processing message:", error);
        toast({
          title: "Error",
          description: "Failed to process game update",
          variant: "destructive",
        });
      }
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
      toast({
        title: "Connection Error",
        description: "Failed to connect to game server",
        variant: "destructive",
      });
    };

    ws.onclose = () => {
      console.log("WebSocket connection closed");
      toast({
        title: "Connection Lost",
        description: "Lost connection to game server",
        variant: "destructive",
      });
    };

    setSocket(ws);
    return () => {
      ws.close();
    };
  }, [user, params?.id, toast]);

  const handleGameStateUpdate = (newState: GameState) => {
    setGameState(newState);
    if (socket?.readyState === WebSocket.OPEN && params?.id) {
      socket.send(JSON.stringify({
        type: "gameState",
        matchId: parseInt(params.id),
        userId: user?.id,
        state: newState
      }));
    }
  };

  const handleGameOver = async () => {
    if (socket?.readyState === WebSocket.OPEN && params?.id) {
      socket.send(JSON.stringify({
        type: "gameOver",
        matchId: parseInt(params.id),
        userId: user?.id,
        finalScore: gameState.score
      }));

      try {
        await apiRequest("POST", "/api/user/xp", {
          xp: Math.floor(gameState.score / 10),
          isPractice: match?.isPractice
        });
        queryClient.invalidateQueries({ queryKey: ["/api/user"] });

        toast({
          title: "Game Over!",
          description: `You earned ${Math.floor(gameState.score / 10)} XP!`,
        });
      } catch (error) {
        console.error("Failed to update XP:", error);
      }
    }
  };

  // Render practice mode page
  if (!params?.id) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold pixel-font text-primary">Practice Mode</h1>
            <p className="text-muted-foreground">Improve your skills without betting</p>
            <Button 
              onClick={() => startPracticeMutation.mutate()}
              disabled={startPracticeMutation.isPending}
              className="pixel-font text-lg"
              size="lg"
            >
              Start Practice Game
            </Button>
          </div>
        </main>
      </div>
    );
  }

  // Loading state
  if (isMatchLoading || !match) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <p className="text-center">Loading game...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-4">
          <h1 className="text-2xl font-bold pixel-font">
            {match.isPractice ? "Practice Mode" : `Game Match #${params?.id} - Prize Pool: ${match.betAmount} ETH`}
          </h1>
          <p className="text-muted-foreground">
            Status: {match.status.charAt(0).toUpperCase() + match.status.slice(1)}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Your Game */}
          <Card className="p-6">
            <h2 className="text-2xl font-bold mb-4 pixel-font">Your Game</h2>
            <GameBoard
              initialState={gameState}
              onStateUpdate={handleGameStateUpdate}
              onGameOver={handleGameOver}
            />
          </Card>

          {/* Opponent's Game (only show in multiplayer mode) */}
          {!match.isPractice && (
            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-4 pixel-font">Opponent's Game</h2>
              {opponentState ? (
                <Spectator gameState={opponentState} />
              ) : (
                <div className="text-center text-muted-foreground">
                  Waiting for opponent...
                </div>
              )}
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}