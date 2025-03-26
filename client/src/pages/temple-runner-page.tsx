import { useState } from 'react';
import { useLocation } from 'wouter';
import { Navbar } from "@/components/layout/navbar";
import { TempleRunner } from "@/components/game/temple-runner";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export default function TempleRunnerPage() {
  const [_, setLocation] = useLocation();
  const { toast } = useToast();
  const [isPlaying, setIsPlaying] = useState(false);

  const handleGameOver = (score: number) => {
    toast({
      title: "Game Over!",
      description: `You scored ${Math.floor(score)} points!`,
    });
    setIsPlaying(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="relative">
        {isPlaying ? (
          <TempleRunner 
            isPractice={true}
            onGameOver={handleGameOver}
          />
        ) : (
          <div className="container mx-auto px-4 py-8 text-center">
            <h1 className="text-4xl font-bold pixel-font mb-8">Temple Runner</h1>
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