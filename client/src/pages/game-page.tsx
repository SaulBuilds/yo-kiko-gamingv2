import { useEffect, useState } from "react";
import { useRoute } from "wouter";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GameBoard } from "@/components/game/game-board";
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

  const finishGameMutation = useMutation({
    mutationFn: async (score: number) => {
      const res = await apiRequest("POST", `/api/matches/${params?.id}/finish`, {
        score,
        playerId: user?.id
      });
      if (!res.ok) throw new Error("Failed to save game score");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/matches"] });
      toast({
        title: "Score Saved!",
        description: "Your game score has been recorded.",
      });
      // Close websocket connection
      if (socket) {
        socket.close();
      }
      // Navigate back to dashboard
      setLocation("/");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // WebSocket connection
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

    ws.onclose = () => {
      console.log("WebSocket connection closed");
    };

    setSocket(ws);
    return () => {
      ws.close();
    };
  }, [user, params?.id]);

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
    try {
      // First save the score
      await finishGameMutation.mutateAsync(gameState.score);

      // Then update XP
      await apiRequest("POST", "/api/user/xp", {
        xp: Math.floor(gameState.score / 10),
        isPractice: match?.isPractice || false
      });

      // Send game over message via websocket
      if (socket?.readyState === WebSocket.OPEN && params?.id) {
        socket.send(JSON.stringify({
          type: "gameOver",
          matchId: parseInt(params.id),
          userId: user?.id,
          score: gameState.score
        }));
      }

      queryClient.invalidateQueries({ queryKey: ["/api/user"] });

      // Close websocket connection
      if (socket) {
        socket.close();
      }

      // Navigate back to dashboard
      setLocation("/");
    } catch (error) {
      console.error("Failed to handle game over:", error);
      toast({
        title: "Error",
        description: "Failed to save game score",
        variant: "destructive",
      });
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

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="p-6">
            <CardHeader>
              <CardTitle className="pixel-font">
                {match?.isPractice ? "Practice Mode" : "Competitive Mode"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <GameBoard
                initialState={gameState}
                onStateUpdate={handleGameStateUpdate}
                onGameOver={handleGameOver}
              />
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}