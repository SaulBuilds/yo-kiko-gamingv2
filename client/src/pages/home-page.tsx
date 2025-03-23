import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { GameMatch, User } from "@shared/schema";
import { Gamepad2, Trophy, Users, Coins } from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { BetModal } from "@/components/game/bet-modal";

export default function HomePage() {
  const [_, setLocation] = useLocation();
  const { user } = useAuth();
  const [isBetModalOpen, setIsBetModalOpen] = useState(false);

  const { data: matches } = useQuery<GameMatch[]>({
    queryKey: ["/api/matches"],
  });

  const { data: leaderboard } = useQuery<User[]>({
    queryKey: ["/api/leaderboard"],
  });

  const games = [
    {
      id: "tetris",
      name: "Tetris Battle",
      description: "Challenge players in real-time Tetris matches",
      icon: "🎮",
      background: "bg-gradient-to-r from-pink-500 to-purple-500"
    },
    {
      id: "temple-run",
      name: "Temple Run",
      description: "Race through ancient temples and collect coins",
      icon: "🏃",
      background: "bg-gradient-to-r from-yellow-500 to-orange-500"
    },
    {
      id: "bubble-bop",
      name: "Bubble Bop",
      description: "Pop colorful bubbles in this arcade classic",
      icon: "🫧",
      background: "bg-gradient-to-r from-blue-500 to-cyan-500"
    }
  ];

  const activeMatches = matches?.filter(match => match.status === "waiting" && match.player1Id !== user?.id) || [];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <h1 className="pixel-font text-4xl text-center mb-8 text-primary">
          sumthn.fun
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Game Selection */}
          <div className="md:col-span-2 space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2 pixel-font">
                <Gamepad2 className="h-6 w-6" />
                Choose Your Game
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {games.map((game) => (
                  <Card
                    key={game.id}
                    className={`game-card ${game.background} hover:border-primary transition-all duration-300`}
                  >
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between text-white">
                        <span className="flex items-center gap-2">
                          <span className="text-2xl">{game.icon}</span>
                          <span className="pixel-font text-sm">{game.name}</span>
                        </span>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => setLocation("/game/new")}
                            className="pixel-font text-xs"
                          >
                            Practice
                          </Button>
                          {game.id === "tetris" && (
                            <Button
                              size="sm"
                              variant="default"
                              className="pixel-font text-xs bg-gradient-to-r from-yellow-500 to-amber-500"
                              onClick={() => setIsBetModalOpen(true)}
                            >
                              Wager
                            </Button>
                          )}
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-white/80">{game.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Active Matches */}
            <div>
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2 pixel-font">
                <Users className="h-6 w-6" />
                Available Wager Matches
              </h2>
              <div className="space-y-4">
                {activeMatches.map((match) => (
                  <Card key={match.id} className="hover:border-primary transition-all duration-300">
                    <CardContent className="flex justify-between items-center p-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Coins className="h-4 w-4" />
                          <p className="pixel-font text-sm">
                            {match.betAmount} {match.betType === 'xp' ? 'XP' : 'ETH'}
                          </p>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Created by Player #{match.player1Id}
                        </p>
                      </div>
                      <Button 
                        onClick={() => setLocation(`/game/${match.id}`)}
                        className="pixel-font"
                      >
                        Accept Challenge
                      </Button>
                    </CardContent>
                  </Card>
                ))}
                {activeMatches.length === 0 && (
                  <p className="text-center text-muted-foreground">
                    No active wager matches available
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Player Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="pixel-font">Your Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Games Played</span>
                  <span className="font-semibold">{user?.gamesPlayed || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Games Won</span>
                  <span className="font-semibold">{user?.gamesWon || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Score</span>
                  <span className="font-semibold">{user?.score || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Available XP</span>
                  <span className="font-semibold">{user?.xp || 0}</span>
                </div>
              </CardContent>
            </Card>

            {/* Leaderboard */}
            <Card>
              <CardHeader>
                <CardTitle className="pixel-font flex items-center gap-2">
                  <Trophy className="h-5 w-5" />
                  Leaderboard
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {leaderboard?.map((player, index) => (
                    <div key={player.id} className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className={`font-bold ${index === 0 ? 'text-yellow-500' : index === 1 ? 'text-gray-400' : index === 2 ? 'text-amber-600' : 'text-muted-foreground'}`}>
                          #{index + 1}
                        </span>
                        <span className="pixel-font text-xs">{player.username || player.walletAddress.slice(0, 6)}</span>
                      </div>
                      <span className="font-semibold">{player.score} pts</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <BetModal open={isBetModalOpen} onClose={() => setIsBetModalOpen(false)} />
    </div>
  );
}