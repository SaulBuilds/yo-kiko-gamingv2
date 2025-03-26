import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import { GameMatch, User } from "@shared/schema";
import { Gamepad2, Trophy, Users, Coins, Mail, Github, Twitter, Discord } from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { BetModal } from "@/components/game/bet-modal";
import { ConnectWallet } from "@/components/connect-wallet";

export default function HomePage() {
  const [_, setLocation] = useLocation();
  const { user } = useAuth();
  const [email, setEmail] = useState("");
  const [isBetModalOpen, setIsBetModalOpen] = useState(false);
  const [selectedGame, setSelectedGame] = useState<'tetris' | 'temple-runner' | 'street-fighter' | null>(null);

  // Add refetch interval to keep matches list up to date
  const { data: matches, isLoading: isMatchesLoading } = useQuery<GameMatch[]>({
    queryKey: ["/api/matches"],
    refetchInterval: 5000 // Refetch every 5 seconds
  });

  const { data: leaderboard } = useQuery<User[]>({
    queryKey: ["/api/leaderboard"],
  });

  const handleSubmitEmail = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement email signup
    setEmail("");
  };

  const games = [
    {
      id: "tetris",
      name: "Tetris Battle",
      description: "Challenge players in real-time Tetris matches",
      icon: "🎮",
      background: "bg-gradient-to-r from-pink-500 to-purple-500",
      enabled: true
    },
    {
      id: "temple-runner",
      name: "Temple Runner",
      description: "Race through ancient temples collecting coins while avoiding obstacles",
      icon: "🏃",
      background: "bg-gradient-to-r from-yellow-500 to-orange-500",
      enabled: true
    },
    {
      id: "street-fighter",
      name: "Street Fighter",
      description: "Classic arcade fighting game with original moves and characters",
      icon: "👊",
      background: "bg-gradient-to-r from-red-500 to-orange-500",
      enabled: true
    }
  ];

  const handlePractice = (gameId: string) => {
    switch (gameId) {
      case 'tetris':
        setLocation('/game/new');
        break;
      case 'temple-runner':
        setLocation('/temple-runner');
        break;
      case 'street-fighter':
        setLocation('/street-fighter/practice');
        break;
    }
  };

  const handleWager = (gameId: string) => {
    setSelectedGame(gameId as 'tetris' | 'temple-runner' | 'street-fighter');
    setIsBetModalOpen(true);
  };

  // Filter active matches where the current user is not the creator
  const activeMatches = matches?.filter(match =>
    match.status === "waiting" &&
    match.player1Id !== user?.id &&
    !match.isPractice
  ) || [];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 bg-gradient-to-b from-primary/5 to-background">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 pixel-font bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary-foreground">
            Play. Wager. Create.
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-muted-foreground max-w-2xl mx-auto">
            Challenge your friends in classic games of skill, create your own Vibe games, 
            and earn rewards on our decentralized gaming platform.
          </p>
          {!user ? (
            <ConnectWallet />
          ) : (
            <Button 
              size="lg" 
              className="pixel-font text-lg"
              onClick={() => setLocation("/game/new")}
            >
              Start Playing
            </Button>
          )}
        </div>
      </section>

      {/* Platform Info */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-16 pixel-font">Deployed On</h2>
          <div className="flex justify-center items-center gap-12 mb-16">
            <div className="w-48 h-24 bg-white rounded-lg flex items-center justify-center">
              <img 
                src="./assets/abstract-logo.svg" 
                alt="Abstract" 
                className="h-12"
              />
            </div>
            <div className="w-48 h-24 bg-white rounded-lg flex items-center justify-center">
              <img 
                src="./assets/icp-logo.svg" 
                alt="Internet Computer Protocol" 
                className="h-12"
              />
            </div>
          </div>
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-lg mb-6">
              Our betting mechanisms are powered by Abstract blockchain, a ZK rollup available through 
              the Abstract Global Wallet, ensuring secure and transparent transactions.
            </p>
            <p className="text-lg">
              The platform is hosted and deployed on the Internet Computer Protocol, 
              providing a fully decentralized infrastructure for reliable and scalable gaming experiences.
            </p>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="bg-gradient-to-br from-blue-500/10 to-purple-500/10">
              <CardContent className="p-6 text-center">
                <Gamepad2 className="w-12 h-12 mb-4 mx-auto text-primary" />
                <h3 className="text-xl font-bold mb-2">Skill-Based Gaming</h3>
                <p className="text-muted-foreground">
                  Challenge players worldwide in classic arcade games where skill determines the winner.
                </p>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10">
              <CardContent className="p-6 text-center">
                <Coins className="w-12 h-12 mb-4 mx-auto text-primary" />
                <h3 className="text-xl font-bold mb-2">Secure Wagering</h3>
                <p className="text-muted-foreground">
                  Place wagers using cryptocurrency through our secure blockchain infrastructure.
                </p>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10">
              <CardContent className="p-6 text-center">
                <Trophy className="w-12 h-12 mb-4 mx-auto text-primary" />
                <h3 className="text-xl font-bold mb-2">Create & Earn</h3>
                <p className="text-muted-foreground">
                  Deploy your own Vibe games and earn fees from every match played.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Beta Signup */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6 pixel-font">Join Our Beta</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Be among the first to deploy your Vibe game on Yo-kiko and start earning from your creativity.
          </p>
          <form onSubmit={handleSubmitEmail} className="flex gap-4 max-w-md mx-auto">
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1"
            />
            <Button type="submit">Sign Up</Button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-muted py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-bold mb-4">About Yo-kiko</h3>
              <p className="text-sm text-muted-foreground">
                The future of skill-based gaming on the blockchain.
              </p>
            </div>
            <div>
              <h3 className="font-bold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-muted-foreground hover:text-primary">Games</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary">Create</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary">Documentation</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4">Legal</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-muted-foreground hover:text-primary">Terms of Service</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary">Privacy Policy</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4">Connect</h3>
              <div className="flex gap-4">
                <a href="#" className="text-muted-foreground hover:text-primary">
                  <Twitter className="w-5 h-5" />
                </a>
                <a href="#" className="text-muted-foreground hover:text-primary">
                  <Discord className="w-5 h-5" />
                </a>
                <a href="#" className="text-muted-foreground hover:text-primary">
                  <Github className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>
          <div className="border-t border-border pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2024 Yo-kiko. All rights reserved.</p>
          </div>
        </div>
      </footer>

      <BetModal 
        open={isBetModalOpen} 
        onClose={() => {
          setIsBetModalOpen(false);
          setSelectedGame(null);
        }}
        gameType={selectedGame || 'tetris'}
      />
    </div>
  );
}