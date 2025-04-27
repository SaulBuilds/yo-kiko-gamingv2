import { useEffect, useState } from "react";
import { useRoute } from "wouter";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GameBoard } from "@/components/game/game-board";
import { useAuth } from "@/hooks/use-auth";
import { GameState } from "@/types/game";
import { useToast } from "@/hooks/use-toast";
import { Navbar } from "@/components/layout/navbar";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Trophy, Timer, AlertTriangle } from "lucide-react";

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
  const [isWaitingForOpponent, setIsWaitingForOpponent] = useState(false);
  const [showResultDialog, setShowResultDialog] = useState(false);
  const [matchResult, setMatchResult] = useState<{
    isWinner: boolean;
    winAmount?: number;
    playerScore?: number;
    opponentScore?: number;
  } | null>(null);

  // Fetch match details
  const { data: match, isLoading: isMatchLoading } = useQuery({
    queryKey: ["/api/matches", params?.id],
    enabled: !!params?.id,
  });

  const acceptMatchMutation = useMutation({
    mutationFn: async () => {
      if (!match) return;

      // For crypto bets, handle contract interaction here
      if (match.betType === 'crypto') {
        // TODO: Implement crypto bet acceptance through smart contract
      }

      const res = await apiRequest("POST", `/api/matches/${match.id}/join`, {
        playerId: user?.id
      });
      if (!res.ok) throw new Error("Failed to join match");
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Match Joined",
        description: "Get ready to play!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/matches", params?.id] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
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
      // Close websocket connection after successful finish
      if (socket) {
        socket.close();
      }
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

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      if (data.type === "gameState" && data.states) {
        const opponentData = data.states.find(([id]: [number, GameState]) => id !== user.id);
        if (opponentData) {
          setOpponentState(opponentData[1]);
        }
      }
      
      if (data.type === "matchUpdate") {
        const updatedMatch = data.match;
        console.log("Match update received:", updatedMatch);
        
        // Handle match status updates
        if (updatedMatch.status === 'completed') {
          // Both players have finished, show results
          const isWinner = updatedMatch.winnerId === user?.id;
          const isPlayer1 = updatedMatch.player1Id === user?.id;
          
          setMatchResult({
            isWinner,
            playerScore: isPlayer1 ? updatedMatch.player1Score : updatedMatch.player2Score,
            opponentScore: isPlayer1 ? updatedMatch.player2Score : updatedMatch.player1Score,
            winAmount: isWinner && updatedMatch.betType === 'xp' ? parseInt(updatedMatch.betAmount) * 2 : undefined
          });
          
          setShowResultDialog(true);
          setIsWaitingForOpponent(false);
        } 
        else if (
          (updatedMatch.player1Id === user?.id && updatedMatch.status === 'player1_finished') ||
          (updatedMatch.player2Id === user?.id && updatedMatch.status === 'player2_finished')
        ) {
          // Current player has finished, waiting for opponent
          setIsWaitingForOpponent(true);
        }
      }
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
      if (!user?.id || !params?.id) return;

      // Save score first
      const updatedMatch = await finishGameMutation.mutateAsync(gameState.score);

      if (updatedMatch) {
        // Calculate XP gain based on match type
        const xpGain = match?.isPractice 
          ? Math.floor(gameState.score / 20) // Less XP for practice games
          : Math.floor(gameState.score / 10); // More XP for wager games

        // Only attempt XP update if there are points to award
        if (xpGain > 0) {
          try {
            await apiRequest("POST", "/api/user/xp", {
              xp: xpGain,
              isPractice: match?.isPractice ?? false,
              isMatch: true // This is part of a match, so don't increment games played here
            });
            console.log(`Added ${xpGain} XP for match play`);
          } catch (error) {
            console.error("Failed to update XP:", error);
            // Continue with game over even if XP update fails
          }
        }

        // Send final game state via websocket
        if (socket?.readyState === WebSocket.OPEN) {
          socket.send(JSON.stringify({
            type: "gameOver",
            matchId: parseInt(params.id),
            userId: user.id,
            score: gameState.score
          }));
        }

        // For non-practice wager games, show waiting state if opponent hasn't finished
        if (!match?.isPractice && 
            (updatedMatch.status === 'player1_finished' || 
             updatedMatch.status === 'player2_finished')) {
          
          // Set waiting for opponent state - don't navigate away yet
          setIsWaitingForOpponent(true);
          
          // Keep websocket open to receive match updates
          
          // Show toast notification
          toast({
            title: "Game Complete!",
            description: `Your score: ${gameState.score}. Waiting for opponent to finish...`,
          });
          
          return; // Don't redirect yet
        }
        
        // For practice games or completed matches, clean up and redirect
        
        // Clean up socket connection first
        if (socket) {
          socket.close();
        }

        // Invalidate queries to refresh data
        queryClient.invalidateQueries({ queryKey: ["/api/user"] });
        queryClient.invalidateQueries({ queryKey: ["/api/matches"] });
        queryClient.invalidateQueries({ queryKey: ["/api/leaderboard"] });

        // Show success message
        toast({
          title: "Game Over!",
          description: `Score saved: ${gameState.score}`,
        });

        // Navigate back to dashboard
        setLocation("/");
      }
    } catch (error) {
      console.error("Failed to handle game over:", error);
      toast({
        title: "Error",
        description: "Failed to save game progress. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Show match details and join button for wager matches
  if (match && !match.isPractice && match.status === "waiting" && match.player1Id !== user?.id) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <Card className="max-w-lg mx-auto">
            <CardContent className="p-6 space-y-4">
              <h2 className="text-2xl font-bold text-center pixel-font">Wager Match</h2>
              <div className="space-y-2">
                <p>Bet Amount: {match.betAmount} {match.betType === 'xp' ? 'XP' : 'ETH'}</p>
                <p>Created by: Player #{match.player1Id}</p>
              </div>
              <Button 
                className="w-full pixel-font"
                onClick={() => acceptMatchMutation.mutate()}
                disabled={acceptMatchMutation.isPending}
              >
                Accept Challenge
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

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

  // Wait for match to load
  if (isMatchLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center">
            Loading match...
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-4">
        <div className="flex justify-center">
          <Card className="w-full max-w-lg p-4">
            <CardContent className="p-0">
              <GameBoard
                initialState={gameState}
                onStateUpdate={handleGameStateUpdate}
                onGameOver={handleGameOver}
              />
            </CardContent>
          </Card>
        </div>
      </main>
      
      {/* Waiting for opponent dialog */}
      <Dialog open={isWaitingForOpponent} onOpenChange={setIsWaitingForOpponent}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center flex items-center justify-center gap-2 pixel-font">
              <Timer className="animate-pulse h-5 w-5" />
              Waiting for Opponent
            </DialogTitle>
            <DialogDescription className="text-center">
              Your game is complete! We're waiting for your opponent to finish their game.
              Results will be shown once they're done.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center py-4">
            <div className="loader animate-spin w-12 h-12 border-4 border-primary rounded-full border-t-transparent"></div>
          </div>
          <DialogFooter className="sm:justify-center">
            <Button
              variant="outline"
              onClick={() => {
                setIsWaitingForOpponent(false);
                setLocation("/");
              }}
            >
              Return to Dashboard
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Match results dialog */}
      <Dialog open={showResultDialog} onOpenChange={setShowResultDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center flex items-center justify-center gap-2 pixel-font">
              {matchResult?.isWinner ? (
                <>
                  <Trophy className="h-5 w-5 text-yellow-500" />
                  You Won!
                </>
              ) : (
                <>
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                  Game Over
                </>
              )}
            </DialogTitle>
            <DialogDescription className="text-center">
              {matchResult?.isWinner 
                ? `Congratulations! You've won ${matchResult.winAmount} XP.` 
                : "Better luck next time!"}
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Your Score</p>
              <p className="text-2xl font-bold">{matchResult?.playerScore || 0}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Opponent Score</p>
              <p className="text-2xl font-bold">{matchResult?.opponentScore || 0}</p>
            </div>
          </div>
          <DialogFooter className="sm:justify-center">
            <Button
              onClick={() => {
                setShowResultDialog(false);
                setLocation("/");
              }}
            >
              Return to Dashboard
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}