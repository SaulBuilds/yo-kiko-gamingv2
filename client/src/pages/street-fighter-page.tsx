import { useState } from 'react';
import { useLocation } from 'wouter';
import { Navbar } from "@/components/layout/navbar";
import { StreetFighter } from "@/components/game/street-fighter";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export default function StreetFighterPage() {
  const [_, setLocation] = useLocation();
  const { toast } = useToast();
  const [isPlaying, setIsPlaying] = useState(false);

  const handleGameOver = (score: number) => {
    toast({
      title: "Game Over!",
      description: `Final score: ${score}`,
    });
    setIsPlaying(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="relative">
        {isPlaying ? (
          <StreetFighter 
            isPractice={true}
            onGameOver={handleGameOver}
          />
        ) : (
          <div className="container mx-auto px-4 py-8 text-center">
            <h1 className="text-4xl font-bold pixel-font mb-8">Street Fighter</h1>
            <div className="space-y-4">
              <Button
                onClick={() => setIsPlaying(true)}
                className="pixel-font text-lg"
                size="lg"
              >
                Start Practice Game
              </Button>
              <Button
                variant="outline"
                onClick={() => setLocation("/")}
                className="pixel-font ml-4"
              >
                Back to Menu
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
